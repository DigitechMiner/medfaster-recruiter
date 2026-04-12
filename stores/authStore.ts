'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { axiosInstance } from '@/stores/api/api-client';
import { ENDPOINTS } from '@/stores/api/api-endpoints';
import { formatPhoneToE164 } from '@/utils/phone';
import {
  updateRecruiterProfile as apiUpdateProfile,
  registerRecruiterStep,
} from '@/stores/api/recruiter-api';

// ============================================================================
// TYPES
// ============================================================================

interface OtpCredential {
  target: string;
  targetType: 'email' | 'phone';
  countryCode?: string;
}

interface RecruiterProfile {
  id: string;
  user_id: string;
  organization_name?: string;
  registered_business_name?: string;
  organization_type?: string;
  official_email_address?: string;
  contact_number?: string;
  organization_website?: string;
  canadian_business_number?: string;
  gst_no?: string;
  organization_photo_url?: string;
  street_address?: string;
  postal_code?: string;
  province?: string;
  city?: string;
  country?: string;
  contact_person_name?: string;
  contact_person_designation?: string;
  contact_person_email?: string;
  contact_person_phone?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface RecruiterDocument {
  id: string;
  recruiter_profile_id: string;
  document_type: string;
  document_url: string;
  verification_status: string;
  created_at?: string;
  updated_at?: string;
}

// ============================================================================
// STATE & ACTIONS
// ============================================================================

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

  /**
   * For onboarding — POST /v1/recruiter/register?step=1|2|3
   * Step 1: org & address fields + optional organization_photo
   * Step 2: contact person fields (NO files)
   * Step 3: documents ONLY — business_registration_certificate (required),
   *         operating_license, certificate (optional). NO text fields.
   */
  registerStep: (
    formData: FormData,
    step: 1 | 2 | 3
  ) => Promise<{ ok: boolean; message?: string; data?: any }>;

  /**
   * For editing after onboarding — PATCH /v1/recruiter/profile
   * All fields optional. Accepts both text + files in one request.
   */
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

      // ── OTP Error ──────────────────────────────────────────────────────────
      setOtpError: (msg) => set({ otpError: msg ?? null }),

      // ── Send OTP ───────────────────────────────────────────────────────────
      sendOtp: async (params) => {
        set({ otpSending: true, otpError: null });

        try {
          // Auto-detect type if not provided
          let targetType: 'email' | 'phone' =
            params.targetType ?? (params.target.includes('@') ? 'email' : 'phone');

          let target = params.target;
          let countryCode = params.countryCode ?? '1';

          // Format phone to E.164 before sending
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

          console.log('📤 sendOtp payload:', payload);

          const res = await axiosInstance.post<{ success: boolean; message: string }>(
            ENDPOINTS.RECRUITER_SEND_OTP,
            payload
          );

          if (!res.data?.success) {
            const msg = res.data?.message || 'Failed to send OTP';
            set({ otpError: msg });
            return { ok: false, message: msg };
          }

          // Store raw input for display, formatted for re-use in verifyOtp
          set({
            otpCredential: {
              target: params.target, // raw display value e.g. "9686009317"
              targetType,
              countryCode,
            },
          });

          return { ok: true, message: res.data.message || 'OTP sent successfully' };
        } catch (error: any) {
          console.error('sendOtp error:', error.response?.data);
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

          const payload: {
            otp: string;
            email?: string;
            phone?: string;
            country_code?: string;
          } = { otp };

          if (otpCredential.targetType === 'email' || otpCredential.target.includes('@')) {
            payload.email = otpCredential.target;
          } else {
            payload.phone = target;
            payload.country_code = countryCode.replace(/[^\d]/g, '');
          }

          console.log('🔐 verifyOtp payload:', payload);

          const res = await axiosInstance.post<{
            success: boolean;
            message: string;
            data?: { token: string; user?: any };
          }>(ENDPOINTS.RECRUITER_VALIDATE_OTP, payload);

          if (!res.data?.success || !res.data?.data?.token) {
            const msg = res.data?.message || 'Invalid OTP';
            return { ok: false, message: msg };
          }

          if (loadProfile) {
            await get().loadRecruiterProfile();
          }

          return { ok: true, message: res.data.message || 'Login successful' };
        } catch (error: any) {
          console.error('verifyOtp error:', error.response?.data);
          const msg = error.response?.data?.message || 'Invalid OTP';
          return { ok: false, message: msg };
        }
      },

      // ── Load Profile ───────────────────────────────────────────────────────
      loadRecruiterProfile: async () => {
        try {
          const res = await axiosInstance.get<{
            success: boolean;
            message: string;
            data: {
              profile: RecruiterProfile;
              documents: RecruiterDocument[];
            };
          }>(ENDPOINTS.RECRUITER_PROFILE);

          if (!res.data?.success || !res.data?.data) {
            set({ recruiterProfile: null, recruiterDocuments: null });
            return;
          }

          set({
            recruiterProfile: res.data.data.profile,
            recruiterDocuments: res.data.data.documents,
          });
        } catch (error: any) {
          set({ recruiterProfile: null, recruiterDocuments: null });
          console.error('loadRecruiterProfile error:', error.response?.data || error);
        }
      },

      // ── Register Step (Onboarding) ─────────────────────────────────────────
      // POST /v1/recruiter/register?step=1|2|3
      //
      // Step 1: text fields (org + address) + optional organization_photo
      // Step 2: text fields (contact person) — NO files allowed at all
      // Step 3: files ONLY — business_registration_certificate (required),
      //         operating_license, certificate — NO text fields allowed
      registerStep: async (formData, step) => {
        try {
          const result = await registerRecruiterStep(formData, step);

          if (result.success) {
            set({
              recruiterProfile: result.data.profile,
              recruiterDocuments: result.data.documents,
            });
            return {
              ok: true,
              message: result.message || `Step ${step} saved successfully`,
              data: result.data,
            };
          }

          return {
            ok: false,
            message: result.message || `Step ${step} failed`,
          };
        } catch (error: any) {
          console.error(`registerStep ${step} error:`, error.response?.data);
          const message =
            error.response?.data?.message ||
            error.message ||
            `Registration step ${step} failed`;
          return { ok: false, message };
        }
      },

      // ── Update Profile (Post-Onboarding Edit) ─────────────────────────────
      // PATCH /v1/recruiter/profile
      // All fields optional. Can send any mix of text + files in one request.
      updateProfile: async (formData) => {
        try {
          const result = await apiUpdateProfile(formData);

          if (result.success) {
            set({
              recruiterProfile: result.data.profile,
              recruiterDocuments: result.data.documents,
            });
            return {
              ok: true,
              message: result.message || 'Profile updated successfully',
              data: result.data,
            };
          }

          return {
            ok: false,
            message: result.message || 'Failed to update profile',
          };
        } catch (error: any) {
          console.error('updateProfile error:', error.response?.data);
          const errors = error.response?.data?.errors || [];
          const message =
            error.response?.data?.message ||
            error.message ||
            'Failed to update profile';
          return { ok: false, message, errors };
        }
      },

      // ── Logout ─────────────────────────────────────────────────────────────
      logout: async () => {
        try {
          await axiosInstance.post(ENDPOINTS.RECRUITER_LOGOUT);
        } catch (error) {
          console.error('Logout API error:', error);
        } finally {
          set({ ...initialState });
        }
      },
    }),
    { name: 'AuthStore' }
  )
);