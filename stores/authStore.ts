'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { axiosInstance } from '@/stores/api/api-client';
import { ENDPOINTS } from '@/stores/api/api-endpoints';
import { formatPhoneToE164 } from '@/utils/phone';  // ✅ ADDED E.164 import
import { updateRecruiterProfile as apiUpdateProfile } from '@/stores/api/recruiter-api';

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
  updateProfile: (formData: FormData) => Promise<{ ok: boolean; message?: string; data?: any; errors?: Array<{ field: string; message: string }>; }>;
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
          // ✅ Auto-detect type if not provided
          let targetType: 'email' | 'phone' = params.targetType || 'email';
          if (!params.targetType) {
            targetType = params.target.includes('@') ? 'email' : 'phone';
          }

          // ✅ CRITICAL: Format phone to E.164 (Canada/India)
          let target = params.target;
          let countryCode = params.countryCode || '1';
          
          if (targetType === 'phone') {
            const e164Phone = formatPhoneToE164(target, countryCode);
            console.log('📱 formatPhoneToE164:', { target, countryCode, e164Phone });
            if (e164Phone.startsWith('+')) {
              target = e164Phone; // +919686009317 ✅
            }
          }

          // ✅ Backend-compatible payload
          const payload: {
            email?: string;
            phone?: string;
            country_code?: string;
          } = {};

          if (targetType === 'email') {
            payload.email = params.target;
          } else {
            payload.phone = target;                    // E.164 format ✅
            payload.country_code = countryCode.replace(/[^\d]/g, ''); // "91" ✅
          }

          console.log('📤 sendOtp payload:', payload);

          const res = await axiosInstance.post<{
            success: boolean;
            message: string;
          }>(ENDPOINTS.RECRUITER_SEND_OTP, payload);

          if (!res.data?.success) {
            const msg = res.data?.message || 'Failed to send OTP';
            set({ otpError: msg });
            return { ok: false, message: msg };
          }

          // ✅ Store RAW input for display + countryCode for formatting
          set({
            otpCredential: {
              target: params.target,        // 9686009317 (display)
              targetType,
              countryCode,                  // +91 (formatting)
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

      verifyOtp: async (otp, loadProfile = false) => {
        const { otpCredential } = get();
        
        if (!otpCredential) {
          return { ok: false, message: 'OTP session expired. Please resend the code.' };
        }

        try {
          // ✅ Re-format E.164 for verification (same logic)
          let target = otpCredential.target;
          let countryCode = otpCredential.countryCode || '1';
          
          if (otpCredential.targetType === 'phone') {
            const e164Phone = formatPhoneToE164(target, countryCode);
            if (e164Phone.startsWith('+')) {
              target = e164Phone; // +919686009317 ✅
            }
          }

          // ✅ Backend-compatible payload
          const payload: {
            email?: string;
            phone?: string;
            country_code?: string;
            otp: string;
          } = { otp };

          if (otpCredential.targetType === 'email' || otpCredential.target.includes('@')) {
            payload.email = otpCredential.target;
          } else {
            payload.phone = target;                      // E.164 ✅
            payload.country_code = countryCode.replace(/[^\d]/g, ''); // "91"
          }

          console.log('🔐 verifyOtp payload:', payload);

          const res = await axiosInstance.post<{
            success: boolean;
            message: string;
            data?: {
              token: string;
              user?: any;
            };
          }>(ENDPOINTS.RECRUITER_VALIDATE_OTP, payload);

          if (!res.data?.success || !res.data?.data?.token) {
            const msg = res.data?.message || 'Invalid OTP';
            return { ok: false, message: msg };
          }

          // Cookies set automatically by backend
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
        } catch (error: any) {
          set({
            recruiterProfile: null,
            recruiterDocuments: null,
          });
          console.log('Failed to load recruiter profile:', error.response?.data || error);
        }
      },

      updateProfile: async (formData) => {
  try {
    const result = await apiUpdateProfile(formData);
    
    if (result.success) {
      // Update Zustand state with new profile data
      set({
        recruiterProfile: result.data.profile,
        recruiterDocuments: result.data.documents,
      });
      
      return { 
        ok: true, 
        message: result.message || 'Profile updated successfully',
        data: result.data 
      };
    }
    
    return { 
      ok: false, 
      message: result.message || 'Failed to update profile' 
    };
  } catch (error: any) {
    console.error('updateProfile error:', error.response?.data);
    
    // Extract validation errors if available
    const errors = error.response?.data?.errors || [];
    const message = error.response?.data?.message || error.message || 'Failed to update profile';
    
    return { 
      ok: false, 
      message,
      errors 
    };
  }
},


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
    { name: 'AuthStore' },
  ),
);
