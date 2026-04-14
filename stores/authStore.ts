'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { axiosInstance } from '@/stores/api/api-client';
import { ENDPOINTS } from '@/stores/api/api-endpoints';
import { formatPhoneToE164 } from '@/utils/phone';
import {
  updateRecruiterProfile as apiUpdateProfile,
  registerRecruiterStep,
  type RecruiterProfile,   // ✅ imported — not redefined
  type RecruiterDocument,  // ✅ imported — not redefined
} from '@/stores/api/recruiter-api';

// ============================================================================
// TYPES
// ============================================================================

interface OtpCredential {
  target: string;
  targetType: 'email' | 'phone';
  countryCode?: string;
}

// ✅ RecruiterProfile and RecruiterDocument are imported from recruiter-api.ts
// NO local redefinitions — single source of truth

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
  ) => Promise<{ ok: boolean; message?: string; data?: any }>;

  updateProfile: (
    formData: FormData
  ) => Promise<{
    ok: boolean;
    message?: string;
    data?: any;
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

// ============================================================================
// STORE
// ============================================================================

export const useAuthStore = create<AuthStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setOtpError: (msg) => set({ otpError: msg ?? null }),

      // ── Send OTP ───────────────────────────────────────────────────────────
      sendOtp: async (params) => {
        set({ otpSending: true, otpError: null });
        try {
          let targetType: 'email' | 'phone' =
            params.targetType ?? (params.target.includes('@') ? 'email' : 'phone');
          let target = params.target;
          let countryCode = params.countryCode ?? '1';

          if (targetType === 'phone') {
            const e164 = formatPhoneToE164(target, countryCode);
            if (e164.startsWith('+')) target = e164;
          }

          const payload: { email?: string; phone?: string; country_code?: string } = {};
          if (targetType === 'email') {
            payload.email = params.target;
          } else {
            payload.phone = target;
            payload.country_code = countryCode.replace(/[^\d]/g, '');
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
        } catch (error: any) {
          const msg = error.response?.data?.message || 'Failed to send OTP';
          set({ otpError: msg });
          return { ok: false, message: msg };
        } finally {
          set({ otpSending: false });
        }
      },

      // ── Verify OTP ─────────────────────────────────────────────────────────
      verifyOtp: async (otp, loadProfile = false) => {
        const { otpCredential } = get();
        if (!otpCredential) {
          return { ok: false, message: 'OTP session expired. Please resend the code.' };
        }
        try {
          let target = otpCredential.target;
          const countryCode = otpCredential.countryCode ?? '1';

          if (otpCredential.targetType === 'phone') {
            const e164 = formatPhoneToE164(target, countryCode);
            if (e164.startsWith('+')) target = e164;
          }

          const payload: { otp: string; email?: string; phone?: string; country_code?: string } = { otp };
          if (otpCredential.targetType === 'email' || otpCredential.target.includes('@')) {
            payload.email = otpCredential.target;
          } else {
            payload.phone = target;
            payload.country_code = countryCode.replace(/[^\d]/g, '');
          }

          const res = await axiosInstance.post<{
            success: boolean;
            message: string;
            data?: { token: string; user?: any };
          }>(ENDPOINTS.RECRUITER_VALIDATE_OTP, payload);

          if (!res.data?.success || !res.data?.data?.token) {
            return { ok: false, message: res.data?.message || 'Invalid OTP' };
          }

          if (loadProfile) await get().loadRecruiterProfile();
          return { ok: true, message: res.data.message || 'Login successful' };
        } catch (error: any) {
          return { ok: false, message: error.response?.data?.message || 'Invalid OTP' };
        }
      },

      // ── Load Profile ───────────────────────────────────────────────────────
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
            recruiterProfile:  res.data.data.profile,
            recruiterDocuments: res.data.data.documents,
          });
        } catch (error: any) {
          set({ recruiterProfile: null, recruiterDocuments: null });
          console.error('loadRecruiterProfile error:', error.response?.data || error);
        }
      },

      // ── Register Step ──────────────────────────────────────────────────────
      registerStep: async (formData, step) => {
        try {
          const result = await registerRecruiterStep(formData, step);
          if (result.success) {
            set({
              recruiterProfile:  result.data.profile,
              recruiterDocuments: result.data.documents,
            });
            return { ok: true, message: result.message || `Step ${step} saved`, data: result.data };
          }
          return { ok: false, message: result.message || `Step ${step} failed` };
        } catch (error: any) {
          const message = error.response?.data?.message || error.message || `Step ${step} failed`;
          return { ok: false, message };
        }
      },

      // ── Update Profile ─────────────────────────────────────────────────────
      updateProfile: async (formData) => {
        try {
          const result = await apiUpdateProfile(formData);
          if (result.success) {
            set({
              recruiterProfile:  result.data.profile,
              recruiterDocuments: result.data.documents,
            });
            return { ok: true, message: result.message || 'Profile updated', data: result.data };
          }
          return { ok: false, message: result.message || 'Failed to update profile' };
        } catch (error: any) {
          return {
            ok: false,
            message: error.response?.data?.message || error.message || 'Failed to update profile',
            errors: error.response?.data?.errors || [],
          };
        }
      },

      // ── Logout ─────────────────────────────────────────────────────────────
      logout: async () => {
        try {
          await axiosInstance.post(ENDPOINTS.RECRUITER_LOGOUT);
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({ ...initialState });
        }
      },
    }),
    { name: 'AuthStore' }
  )
);