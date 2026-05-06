'use client';

import { useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import Image from 'next/image';
import { CustomButton } from '@/components/custom/custom-button';
import CountryCodeSelector from './CountryCodeSelector';
import { detectContactType } from '@/utils/otp';

interface SignInFormProps {
  contactValue: string;
  setContactValue: (value: string) => void;
  countryCode: string;
  setCountryCode: (code: string) => void;
  otpSending: boolean;
  otpError: string | null;
  onSendOTP: (e: React.FormEvent) => void;
  onGoogleSignIn: () => void;
  setOtpError?: (error: string | null) => void;
  sendOtp?: (params: { target: string; targetType?: 'email' | 'phone'; countryCode?: string }) => Promise<{ ok: boolean; message?: string }>;
  onOtpSent?: () => void;
}

export default function SignInForm({
  contactValue,
  setContactValue,
  countryCode,
  setCountryCode,
  otpSending,
  otpError,
  onSendOTP,
  onGoogleSignIn,
  setOtpError,
  sendOtp,
  onOtpSent,
}: SignInFormProps) {
  const [isPhoneNumber, setIsPhoneNumber] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Google Login hook
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      if (setOtpError) {
        setOtpError(null);
      }

      try {
        // Fetch user info from Google API using the access token
        const userInfoResponse = await fetch(
          'https://www.googleapis.com/oauth2/v2/userinfo',
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          }
        );
        
        if (userInfoResponse.ok) {
          const userInfo = await userInfoResponse.json();
          const email = userInfo.email;
          
          // Send OTP with the email from Google
          if (sendOtp && email) {
            try {
              // Update contact value with the email
              setContactValue(email);
              
              // Send OTP to the email
              const result = await sendOtp({
                target: email,
                targetType: 'email'
              });
              
              if (result.ok) {
                // Call the callback to show OTP form
                if (onOtpSent) {
                  onOtpSent();
                }
                // Also call the parent's onGoogleSignIn if needed
                if (onGoogleSignIn) {
                  onGoogleSignIn();
                }
              } else {
                throw new Error(result.message || 'Failed to send OTP');
              }
            } catch (error: unknown) {
              const err = error as Error;
              if (setOtpError) {
                setOtpError((error as Error).message || 'Failed to send OTP');
              }
            }
          } else {
            // Fallback if sendOtp is not provided
            if (onGoogleSignIn) {
              onGoogleSignIn();
            }
          }
        } else {
          const errorData = await userInfoResponse.json();
          throw new Error(errorData.error?.message || 'Failed to fetch user info');
        }
      } catch {
        if (setOtpError) {
          setOtpError('Failed to get user information from Google.');
        }
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => {
      setGoogleLoading(false);
      if (setOtpError) {
        setOtpError('Google Sign In was cancelled or failed.');
      }
    },
    scope: 'openid email profile',
  });

  // Handle Google Sign In button click
  const handleGoogleSignIn = () => {
    setGoogleLoading(true);
    if (setOtpError) {
      setOtpError(null);
    }
    googleLogin();
  };

  // Handle input change and detect phone number automatically
  const handleInputChange = (value: string) => {
    setContactValue(value);
    
    // Clear error when user types
    if (setOtpError && otpError) {
      setOtpError(null);
    }

    // Detect contact type using utility function
    const contactType = detectContactType(value);
    setIsPhoneNumber(contactType === 'phone');
  };
  
  return (
    <>
      {/* Sign In Header */}
      <h2 className="text-2xl font-bold text-[#252B37] mb-2 text-center">
        Get Started
      </h2>
      <p className="text-[#717680] text-sm mb-6 text-center">
        Enter your contact details to continue
      </p>

      {/* Form */}
      <form onSubmit={onSendOTP} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#252B37] mb-2">
            Email / Mobile No <span className="text-red-500">*</span>
          </label>
          <div className={`flex overflow-visible items-center border border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-[#F4781B] focus-within:border-transparent bg-white ${!isPhoneNumber ? 'px-0' : ''}`}>            {isPhoneNumber && (
              <CountryCodeSelector
                value={countryCode}
                onChange={setCountryCode}
                disabled={otpSending}
              />
            )}
            <input
              ref={inputRef}
              type={isPhoneNumber ? 'tel' : 'text'}
              placeholder={isPhoneNumber ? '(555) 000-0000' : 'Enter email or phone number'}
              value={contactValue}
              onChange={(e) => handleInputChange(e.target.value)}
              disabled={otpSending}
              className={`${isPhoneNumber ? 'flex-1 px-2' : 'w-full px-4'} py-3 border-0 focus:outline-none text-sm bg-transparent disabled:opacity-50`}
              autoCapitalize="none"
              required
            />
          </div>
        </div>

          {/* Error Message */}
      {otpError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {otpError}
        </div>
      )}


        <CustomButton 
          type="submit"
          className="w-full justify-center py-3 text-base font-semibold !rounded-md"
          disabled={otpSending}
        >
          {otpSending ? (
            <span className="inline-flex items-center whitespace-nowrap">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Sending...
            </span>
          ) : (
            'Send OTP'
          )}
        </CustomButton>
      </form>

      {/* Google Sign In */}
      <button
        onClick={handleGoogleSignIn}
        disabled={otpSending || googleLoading}
        className="w-full mt-4 flex items-center justify-center gap-3 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors bg-white disabled:opacity-50"
      >
        {googleLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-[#252B37] font-medium text-sm">Connecting...</span>
          </>
        ) : (
          <>
            <Image src="/google.svg" alt="Google" width={20} height={20} />
            <span className="text-[#252B37] font-medium text-sm">Sign in with Google</span>
          </>
        )}
      </button>
    </>
  );
}
