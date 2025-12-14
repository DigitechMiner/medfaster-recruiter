'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { axiosInstance } from '@/stores/api/api-client';
import { ENDPOINTS } from '@/stores/api/api-endpoints';

interface OtpCredential {
  target: string;
  targetType: 'email' | 'phone';
  countryCode?: string;
}

interface RecruiterProfile {
  id: string;
  user_id: string;
  company_name?: string;
  organization_type?: string;
  contact_person?: string;
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
}

interface AuthState {
  otpCredential: OtpCredential | null;
  otpSending: boolean;
  otpError: string | null;
  // Optional recruiter profile data
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
  verifyOtp: (otp: string, loadProfile?: boolean) => Promise<{ ok: boolean; message?: string }>;
  loadRecruiterProfile: () => Promise<void>;
  logout: () => Promise<void>;
}

export type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  otpCredential: null,
  otpSending: false,
  otpError: null,
  recruiterProfile: null,
  recruiterDocuments: null,
};

export const useAuthStore = create<AuthStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setOtpError: (msg) => set({ otpError: msg ?? null }),

      sendOtp: async (params) => {
        set({ otpSending: true, otpError: null });

        try {
          // Detect target type if not provided
          let targetType: 'email' | 'phone' = params.targetType || 'email';
          if (!params.targetType) {
            targetType = params.target.includes('@') ? 'email' : 'phone';
          }

          // Build payload
          const payload: {
            email?: string;
            phone?: string;
            country_code?: string;
          } = {};

          if (targetType === 'email' || params.target.includes('@')) {
            payload.email = params.target;
          } else {
            payload.phone = params.target;
            if (params.countryCode) {
              payload.country_code = params.countryCode.replace('+', '');
            }
          }

          const res = await axiosInstance.post<{
            success: boolean;
            message: string;
          }>(ENDPOINTS.RECRUITER_SEND_OTP, payload);

          if (!res.data?.success) {
            const msg = res.data?.message || 'Failed to send OTP';
            set({ otpError: msg });
            return { ok: false, message: msg };
          }

          // Store credential for verification
          set({
            otpCredential: {
              target: params.target,
              targetType,
              countryCode: params.countryCode,
            },
          });

          return { ok: true, message: res.data.message || 'OTP sent successfully' };
        } catch (error) {
          const err = error as Error;
          const msg = err.message || 'Failed to send OTP';
          set({ otpError: msg });
          return { ok: false, message: msg };
        } finally {
          set({ otpSending: false });
        }
      },

      verifyOtp: async (otp, loadProfile = false) => {
        const { otpCredential } = get();
        
        if (!otpCredential) {
          return { ok: false, message: 'OTP session expired. Please resend the code.' };
        }

        try {
          // Build payload
          const payload: {
            email?: string;
            phone?: string;
            country_code?: string;
            otp: string;
          } = {
            otp,
          };

          if (otpCredential.targetType === 'email' || otpCredential.target.includes('@')) {
            payload.email = otpCredential.target;
          } else {
            payload.phone = otpCredential.target;
            if (otpCredential.countryCode) {
              payload.country_code = otpCredential.countryCode.replace('+', '');
            }
          }

          const res = await axiosInstance.post<{
            success: boolean;
            message: string;
            data?: {
              token: string;
              user?: {
                id: string;
                email?: string;
                phone?: string;
                [key: string]: unknown;
              };
            };
          }>(ENDPOINTS.RECRUITER_VALIDATE_OTP, payload);

          if (!res.data?.success || !res.data?.data?.token) {
            const msg = res.data?.message || 'Invalid OTP';
            return { ok: false, message: msg };
          }

          // Note: Cookies are automatically set by the backend via Set-Cookie headers
          // The axios instance is configured with withCredentials: true to handle cookies
          // The browser will automatically store and send these cookies with subsequent requests

          // Optionally load recruiter profile
          if (loadProfile) {
            await get().loadRecruiterProfile();
          }

          return { ok: true, message: res.data.message || 'Login successful' };
        } catch (error) {
          const err = error as Error;
          const msg = err.message || 'Invalid OTP';
          return { ok: false, message: msg };
        }
      },

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
            // Clear profile if API call failed (user not authenticated)
            set({
              recruiterProfile: null,
              recruiterDocuments: null,
            });
            return;
          }

          set({
            recruiterProfile: res.data.data.profile,
            recruiterDocuments: res.data.data.documents,
          });
        } catch (error) {
          // Clear profile on error (user not authenticated or session expired)
          set({
            recruiterProfile: null,
            recruiterDocuments: null,
          });
          console.log('Failed to load recruiter profile:', error);
        }
      },

      logout: async () => {
        try {
          // Call logout API to clear cookies on backend
          await axiosInstance.post<{
            success: boolean;
            message: string;
          }>(ENDPOINTS.RECRUITER_LOGOUT);
        } catch (error) {
          // Even if API call fails, clear local state
          console.error('Logout API error:', error);
        } finally {
          // Clear all auth state regardless of API call result
          set({ ...initialState });
        }
      },
    }),
    { name: 'AuthStore' },
  ),
);
