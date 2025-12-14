'use client';

import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { recruiterService } from '@/services/recruiterService';

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

interface ApiEnvelope<T = unknown> {
  success?: boolean;
  message?: string;
  data?: T;
}

interface OtpCredential {
  phone: string;
  countryCode: string;
}

interface RecruiterAuthState {
  token: string | null;
  tokenSetAt: number | null;
  profile: RecruiterProfile | null;
  documents: RecruiterDocument[] | null;

  otpCredential: OtpCredential | null;
  otpSending: boolean;
  otpError: string | null;
}

interface RecruiterAuthActions {
  setOtpError: (msg: string | null) => void;
  sendOtp: (phone: string, countryCode: string) => Promise<{ ok: boolean; message?: string }>;
  verifyOtp: (otp: string) => Promise<{ ok: boolean; message?: string }>;
  loadProfile: () => Promise<void>;
  logout: () => void;
}

export type RecruiterAuthStore = RecruiterAuthState & RecruiterAuthActions;

const TOKEN_EXPIRATION_MS = 24 * 60 * 60 * 1000;

const initialState: RecruiterAuthState = {
  token: null,
  tokenSetAt: null,
  profile: null,
  documents: null,
  otpCredential: null,
  otpSending: false,
  otpError: null,
};

const isTokenExpired = (tokenSetAt: number | null): boolean => {
  if (!tokenSetAt) return true;
  return Date.now() - tokenSetAt >= TOKEN_EXPIRATION_MS;
};

export const useRecruiterAuthStore = create<RecruiterAuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        setOtpError: (msg) => set({ otpError: msg ?? null }),

        sendOtp: async (phone, countryCode) => {
          set({ otpSending: true, otpError: null });

          try {
            const res = await recruiterService.sendOtp(phone, countryCode);
            if (!res?.success) {
              const msg = res?.message || 'Failed to send OTP';
              set({ otpError: msg });
              return { ok: false, message: msg };
            }

            set({
              otpCredential: { phone, countryCode },
            });

            return { ok: true, message: res.message || 'OTP sent successfully' };
          } catch (error) {
            const err = error as Error;
            const msg = err.message || 'Failed to send OTP';
            set({ otpError: msg });
            return { ok: false, message: msg };
          } finally {
            set({ otpSending: false });
          }
        },

        verifyOtp: async (otp) => {
          const { otpCredential } = get();
          if (!otpCredential) {
            return { ok: false, message: 'OTP session expired. Please resend the code.' };
          }

          try {
            const res = await recruiterService.validateOtp(
              otpCredential.phone,
              otp,
              otpCredential.countryCode,
            );

            if (!res?.success || !res?.data?.token) {
              const msg = res?.message || 'Invalid OTP';
              return { ok: false, message: msg };
            }

            set({
              token: res.data.token,
              tokenSetAt: Date.now(),
            });

            if (typeof window !== 'undefined') {
              localStorage.setItem('recruiter_isLoggedIn', 'true');
            }

            // Optionally load profile immediately
            await get().loadProfile();

            return { ok: true, message: res.message || 'Login successful' };
          } catch (error) {
            const err = error as Error;
            const msg = err.message || 'Invalid OTP';
            return { ok: false, message: msg };
          }
        },

        loadProfile: async () => {
          try {
            const res = await recruiterService.getProfile();

            if (!res?.success || !res?.data) return;

            set({
              profile: res.data.profile,
              documents: res.data.documents,
            });

            if (typeof window !== 'undefined') {
              localStorage.setItem('recruiter_profile', JSON.stringify(res.data.profile));
              localStorage.setItem('recruiter_documents', JSON.stringify(res.data.documents));
            }
          } catch (error) {
            // Silent fail for profile load
            console.error('Failed to load profile:', error);
          }
        },

        logout: () => {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('recruiter_isLoggedIn');
            localStorage.removeItem('recruiter_profile');
            localStorage.removeItem('recruiter_documents');
          }
          set({ ...initialState });
        },
      }),
      {
        name: 'recruiter-auth-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          token: state.token,
          tokenSetAt: state.tokenSetAt,
          profile: state.profile,
          documents: state.documents,
        }),
        onRehydrateStorage: () => (state) => {
          if (state?.token && state?.tokenSetAt && isTokenExpired(state.tokenSetAt)) {
            state.logout();
          }
        },
      },
    ),
    { name: 'RecruiterAuthStore' },
  ),
);
