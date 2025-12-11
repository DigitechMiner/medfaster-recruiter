// lib/store/recruiter-auth-store.ts
'use client';

import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { recruiterService } from '@/lib/api/recruiterService';

interface ApiEnvelope<T = unknown> {
  success?: boolean;
  message?: string;
  data?: T;
  [key: string]: any;
}

interface OtpCredential {
  phone: string;
  countryCode: string;
}

interface RecruiterAuthState {
  token: string | null;
  tokenSetAt: number | null;
  profile: Record<string, any> | null;
  documents: Record<string, any>[] | null;

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
            const json = res as ApiEnvelope;
            if (!json?.success) {
              const msg = json?.message || 'Failed to send OTP';
              set({ otpError: msg });
              return { ok: false, message: msg };
            }

            set({
              otpCredential: { phone, countryCode },
            });

            return { ok: true, message: json.message || 'OTP sent successfully' };
          } catch (error: any) {
            const msg = error?.message || 'Failed to send OTP';
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
            const json = res as ApiEnvelope<{ token: string; user?: any }>;

            if (!json?.success || !json?.data?.token) {
              const msg = json?.message || 'Invalid OTP';
              return { ok: false, message: msg };
            }

            set({
              token: json.data.token,
              tokenSetAt: Date.now(),
            });

            if (typeof window !== 'undefined') {
              localStorage.setItem('recruiter_isLoggedIn', 'true');
            }

            // Optionally load profile immediately
            await get().loadProfile();

            return { ok: true, message: json.message || 'Login successful' };
          } catch (error: any) {
            const msg = error?.message || 'Invalid OTP';
            return { ok: false, message: msg };
          }
        },

        loadProfile: async () => {
          try {
            const res = await recruiterService.getProfile();
            const json = res as ApiEnvelope<{
              profile: Record<string, any>;
              documents: Record<string, any>[];
            }>;

            if (!json?.success || !json?.data) return;

            set({
              profile: json.data.profile,
              documents: json.data.documents,
            });

            if (typeof window !== 'undefined') {
              localStorage.setItem('recruiter_profile', JSON.stringify(json.data.profile));
              localStorage.setItem('recruiter_documents', JSON.stringify(json.data.documents));
            }
          } catch {
            // Silent fail for profile load
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
