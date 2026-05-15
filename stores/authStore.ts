'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { axiosInstance } from '@/stores/api/api-client';
import { formatPhoneToE164 } from '@/utils/auth';

import {
  updateRecruiterProfile as apiUpdateProfile,
  registerRecruiterStep,
  sendRecruiterOtp,
  validateRecruiterOtp,
  logoutRecruiter,
  getRecruiterProfileWithDocuments,
} from '@/features/profile/api';
import type { RecruiterDocument, RecruiterProfile } from '@/features/profile/types';
import {
  getNotifications,
  markNotificationAsRead,
} from '@/features/dashboard/api';
import type { RecruiterNotification } from '@/features/dashboard/types';

let ensureNotificationsPromise: Promise<void> | null = null;
let loadMoreNotificationsPromise: Promise<void> | null = null;

// ============================================================================
// TYPES
// ============================================================================

interface OtpCredential {
  target: string;
  targetType: 'email' | 'phone';
  countryCode?: string;
}

interface AuthState {
  otpCredential: OtpCredential | null;
  otpSending: boolean;
  otpVerifying: boolean;
  otpError: string | null;
  recruiterProfile: RecruiterProfile | null;
  recruiterDocuments: RecruiterDocument[] | null;
  notifications: RecruiterNotification[];
  notificationsPage: number;
  notificationsHasNextPage: boolean;
  unreadCount: number;
  notificationsLoading: boolean;
  notificationsLoadingMore: boolean;
  notificationsError: string | null;
  notificationsInitialized: boolean;
}

interface AuthActions {
  setOtpError: (msg: string | null) => void;

  sendOtp: (params: {
    target: string;
    targetType?: 'email' | 'phone';
    countryCode?: string;
  }) => Promise<{ ok: boolean; message?: string }>;

  verifyOtp: (
    otp: string,
    loadProfile?: boolean
  ) => Promise<{ ok: boolean; message?: string }>;

  loadRecruiterProfile: () => Promise<void>;

  logout: () => Promise<void>;

  registerStep: (
    formData: FormData,
    step: 1 | 2 | 3
  ) => Promise<{ ok: boolean; message?: string; data?: unknown }>;

  updateProfile: (
    formData: FormData
  ) => Promise<{
    ok: boolean;
    message?: string;
    data?: unknown;
    errors?: Array<{ field: string; message: string }>;
  }>;

  ensureNotificationsLoaded: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  loadMoreNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<boolean>;
  clearNotifications: () => void;
}

export type AuthStore = AuthState & AuthActions;

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: AuthState = {
  otpCredential: null,
  otpSending: false,
  otpVerifying: false,
  otpError: null,
  recruiterProfile: null,
  recruiterDocuments: null,
  notifications: [],
  notificationsPage: 0,
  notificationsHasNextPage: false,
  unreadCount: 0,
  notificationsLoading: false,
  notificationsLoadingMore: false,
  notificationsError: null,
  notificationsInitialized: false,
};

const normalizeCountryCode = (countryCode: string) =>
  countryCode.replace(/[^\d]/g, '');

const normalizePhoneTarget = (target: string, countryCode: string) => {
  const e164 = formatPhoneToE164(target, countryCode);
  return e164.startsWith('+') ? e164 : target;
};

type ApiError = {
  response?: {
    data?: {
      message?: string;
      errors?: Array<{ field: string; message: string }>;
    };
  };
  message?: string;
};

const asApiError = (error: unknown): ApiError => error as ApiError;

const getErrorMessage = (error: unknown, fallback: string) => {
  const parsed = asApiError(error);
  return parsed.response?.data?.message || parsed.message || fallback;
};

const countUnread = (notifications: RecruiterNotification[]) =>
  notifications.filter((n) => !n.is_read).length;

// ============================================================================
// STORE
// ============================================================================

export const useAuthStore = create<AuthStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setOtpError: (msg) => set({ otpError: msg ?? null }),

      // ── Send OTP ──────────────────────────────────────────────────────────
      sendOtp: async (params) => {
        set({ otpSending: true, otpError: null });
        try {
          const targetType: 'email' | 'phone' =
            params.targetType ?? (params.target.includes('@') ? 'email' : 'phone');
          let target = params.target;
          const countryCode = params.countryCode ?? '1';

          if (targetType === 'phone') {
            target = normalizePhoneTarget(target, countryCode);
          }

          const payload: { email?: string; phone?: string; country_code?: string } = {};
          if (targetType === 'email') {
            payload.email = params.target;
          } else {
            payload.phone = target;
            payload.country_code = normalizeCountryCode(countryCode);
          }

          const data = await sendRecruiterOtp(payload);

          if (!data?.success) {
            const msg = data?.message || 'Failed to send OTP';
            set({ otpError: msg });
            return { ok: false, message: msg };
          }

          set({ otpCredential: { target: params.target, targetType, countryCode } });
          return { ok: true, message: data.message || 'OTP sent successfully' };
        } catch (error: unknown) {
          const msg = getErrorMessage(error, 'Failed to send OTP');
          set({ otpError: msg });
          return { ok: false, message: msg };
        } finally {
          set({ otpSending: false });
        }
      },

      // ── Verify OTP ────────────────────────────────────────────────────────
      verifyOtp: async (otp, loadProfile = false) => {
        const { otpCredential } = get();
        if (!otpCredential) {
          return { ok: false, message: 'OTP session expired. Please resend the code.' };
        }
        set({ otpVerifying: true });
        try {
          let target = otpCredential.target;
          const countryCode = otpCredential.countryCode ?? '1';

          if (otpCredential.targetType === 'phone') {
            target = normalizePhoneTarget(target, countryCode);
          }

          const payload: { otp: string; email?: string; phone?: string; country_code?: string } = { otp };
          if (otpCredential.targetType === 'email' || otpCredential.target.includes('@')) {
            payload.email = otpCredential.target;
          } else {
            payload.phone = target;
            payload.country_code = normalizeCountryCode(countryCode);
          }

          const data = await validateRecruiterOtp(payload);

          if (!data?.success || !data?.data?.token) {
            return { ok: false, message: data?.message || 'Invalid OTP' };
          }

          // ✅ Token received — set it on axiosInstance immediately so the
          //    profile request below goes out with the correct Authorization header.
          //    (Only needed if your backend uses Bearer tokens instead of cookies.
          //    If using HttpOnly cookies, the cookie is already set by the response
          //    and withCredentials:true handles it — but this covers both cases.)
          const token = data.data.token;
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          // ✅ loadProfile guard — only load if explicitly requested
          if (loadProfile) {
            await get().loadRecruiterProfile();
          }

          return { ok: true, message: data.message || 'Login successful' };
        } catch (error: unknown) {
          return { ok: false, message: getErrorMessage(error, 'Invalid OTP') };
        } finally {
          set({ otpVerifying: false });
        }
      },

      // ── Load Profile ──────────────────────────────────────────────────────
      loadRecruiterProfile: async () => {
        try {
          const data = await getRecruiterProfileWithDocuments();

          if (!data?.success || !data?.data) {
            set({ recruiterProfile: null, recruiterDocuments: null });
            return;
          }

          set({
            recruiterProfile: data.data.profile,
            recruiterDocuments: data.data.documents,
          });
        } catch (error: unknown) {
          set({ recruiterProfile: null, recruiterDocuments: null });
          console.log(error);
        }
      },

      // ── Register Step ─────────────────────────────────────────────────────
      registerStep: async (formData, step) => {
        try {
          const result = await registerRecruiterStep(formData, step);
          if (result.success) {
            set({
              recruiterProfile: result.data.profile,
              recruiterDocuments: result.data.documents,
            });
            return { ok: true, message: result.message || `Step ${step} saved`, data: result.data };
          }
          return { ok: false, message: result.message || `Step ${step} failed` };
        } catch (error: unknown) {
          const message = getErrorMessage(error, `Step ${step} failed`);
          return { ok: false, message };
        }
      },

      // ── Update Profile ────────────────────────────────────────────────────
      updateProfile: async (formData) => {
        try {
          const result = await apiUpdateProfile(formData);
          if (result.success) {
            set({
              recruiterProfile: result.data.profile,
              recruiterDocuments: result.data.documents,
            });
            return { ok: true, message: result.message || 'Profile updated', data: result.data };
          }
          return { ok: false, message: result.message || 'Failed to update profile' };
        } catch (error: unknown) {
          const parsedError = asApiError(error);
          return {
            ok: false,
            message: getErrorMessage(error, 'Failed to update profile'),
            errors: parsedError.response?.data?.errors || [],
          };
        }
      },

      // ── Notifications ─────────────────────────────────────────────────────
      ensureNotificationsLoaded: async () => {
        if (get().notificationsInitialized) return;
        if (ensureNotificationsPromise) return ensureNotificationsPromise;

        ensureNotificationsPromise = (async () => {
          set({ notificationsLoading: true, notificationsError: null });
          try {
            const listRes = await getNotifications({ page: 1, limit: 15 });

            if (listRes.success) {
              const notifications = listRes.data.notifications;
              set({
                notifications,
                notificationsPage: 1,
                notificationsHasNextPage: listRes.data.pagination.hasNextPage,
                notificationsInitialized: true,
                unreadCount: countUnread(notifications),
              });
            } else {
              set({
                notificationsError: listRes.message ?? 'Failed to load notifications',
              });
            }
          } catch {
            set({ notificationsError: 'Failed to load notifications' });
          } finally {
            set({ notificationsLoading: false });
            ensureNotificationsPromise = null;
          }
        })();

        return ensureNotificationsPromise;
      },

      refreshNotifications: async () => {
        ensureNotificationsPromise = null;
        set({
          notificationsInitialized: false,
          notifications: [],
          notificationsPage: 0,
          notificationsHasNextPage: false,
          notificationsError: null,
        });
        await get().ensureNotificationsLoaded();
      },

      loadMoreNotifications: async () => {
        const { notificationsLoadingMore, notificationsHasNextPage, notificationsPage } =
          get();
        if (notificationsLoadingMore || !notificationsHasNextPage) return;
        if (loadMoreNotificationsPromise) return loadMoreNotificationsPromise;

        loadMoreNotificationsPromise = (async () => {
          set({ notificationsLoadingMore: true });
          try {
            const nextPage = notificationsPage + 1;
            const res = await getNotifications({ page: nextPage, limit: 15 });
            if (res.success) {
              set((state) => {
                const notifications = [
                  ...state.notifications,
                  ...res.data.notifications,
                ];
                return {
                  notifications,
                  notificationsPage: nextPage,
                  notificationsHasNextPage: res.data.pagination.hasNextPage,
                  unreadCount: countUnread(notifications),
                };
              });
            }
          } finally {
            set({ notificationsLoadingMore: false });
            loadMoreNotificationsPromise = null;
          }
        })();

        return loadMoreNotificationsPromise;
      },

      markNotificationRead: async (id) => {
        const notification = get().notifications.find((n) => n.id === id);
        if (!notification || notification.is_read) return false;

        try {
          const res = await markNotificationAsRead(id);
          if (res.success) {
            set((state) => {
              const notifications = state.notifications.map((item) =>
                item.id === id
                  ? { ...item, is_read: true, read_at: res.data.notification.read_at }
                  : item,
              );
              return {
                notifications,
                unreadCount: countUnread(notifications),
              };
            });
            return true;
          }
        } catch {
          // silent fail
        }
        return false;
      },

      clearNotifications: () => {
        ensureNotificationsPromise = null;
        loadMoreNotificationsPromise = null;
        set({
          notifications: [],
          notificationsPage: 0,
          notificationsHasNextPage: false,
          unreadCount: 0,
          notificationsLoading: false,
          notificationsLoadingMore: false,
          notificationsError: null,
          notificationsInitialized: false,
        });
      },

      // ── Logout ────────────────────────────────────────────────────────────
      logout: async () => {
        try {
          await logoutRecruiter();
        } catch {
        } finally {
          // ✅ Clear the Authorization header on logout
          delete axiosInstance.defaults.headers.common['Authorization'];
          get().clearNotifications();
          set({ ...initialState });
        }
      },
    }),
    { name: 'AuthStore' }
  )
);
