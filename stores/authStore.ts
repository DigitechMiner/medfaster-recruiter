'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { axiosInstance } from '@/stores/api/api-client';
import { ENDPOINTS } from '@/stores/api/api-endpoints';
import { formatPhoneToE164 } from '@/utils/phone';
import {
  updateRecruiterProfile as apiUpdateProfile,
  registerRecruiterStep,
  type RecruiterProfile,
  type RecruiterDocument,
} from '@/stores/api/recruiter-api';

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
  otpError: string | null;
  recruiterProfile: RecruiterProfile | null;
  recruiterDocuments: RecruiterDocument[] | null;
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
}

export type AuthStore = AuthState & AuthActions;

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: AuthState = {
  otpCredential: null,
  otpSending: false,
  otpError: null,
  recruiterProfile: null,
  recruiterDocuments: null,
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

          const res = await axiosInstance.post<{ success: boolean; message: string }>(
            ENDPOINTS.RECRUITER_SEND_OTP,
            payload
          );

          if (!res.data?.success) {
            const msg = res.data?.message || 'Failed to send OTP';
            set({ otpError: msg });
            return { ok: false, message: msg };
          }

          set({ otpCredential: { target: params.target, targetType, countryCode } });
          return { ok: true, message: res.data.message || 'OTP sent successfully' };
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

          const res = await axiosInstance.post<{
            success: boolean;
            message: string;
            data?: { token: string; user?: unknown };
          }>(ENDPOINTS.RECRUITER_VALIDATE_OTP, payload);

          if (!res.data?.success || !res.data?.data?.token) {
            return { ok: false, message: res.data?.message || 'Invalid OTP' };
          }

          // ✅ Token received — set it on axiosInstance immediately so the
          //    profile request below goes out with the correct Authorization header.
          //    (Only needed if your backend uses Bearer tokens instead of cookies.
          //    If using HttpOnly cookies, the cookie is already set by the response
          //    and withCredentials:true handles it — but this covers both cases.)
          const token = res.data.data.token;
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          // ✅ loadProfile guard — only load if explicitly requested
          if (loadProfile) {
            await get().loadRecruiterProfile();
          }

          return { ok: true, message: res.data.message || 'Login successful' };
        } catch (error: unknown) {
          return { ok: false, message: getErrorMessage(error, 'Invalid OTP') };
        }
      },

      // ── Load Profile ──────────────────────────────────────────────────────
      loadRecruiterProfile: async () => {
        try {
          const res = await axiosInstance.get<{
            success: boolean;
            message: string;
            data: { profile: RecruiterProfile; documents: RecruiterDocument[] };
          }>(ENDPOINTS.RECRUITER_PROFILE);

          if (!res.data?.success || !res.data?.data) {
            set({ recruiterProfile: null, recruiterDocuments: null });
            return;
          }

          set({
            recruiterProfile: res.data.data.profile,
            recruiterDocuments: res.data.data.documents,
          });
        } catch (error: unknown) {
          const parsedError = asApiError(error);
          set({ recruiterProfile: null, recruiterDocuments: null });
          console.error('loadRecruiterProfile error:', parsedError.response?.data || error);
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

      // ── Logout ────────────────────────────────────────────────────────────
      logout: async () => {
        try {
          await axiosInstance.post(ENDPOINTS.RECRUITER_LOGOUT);
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          // ✅ Clear the Authorization header on logout
          delete axiosInstance.defaults.headers.common['Authorization'];
          set({ ...initialState });
        }
      },
    }),
    { name: 'AuthStore' }
  )
);