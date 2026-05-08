'use client';

import { useState, useRef, useEffect } from 'react';
import { Loader2, ChevronDown } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import Image from 'next/image';
import { CustomButton } from '@/components/custom/custom-button';
import { detectContactType } from '@/utils/auth';
import { metaData } from '@/utils/constant/metadata';

interface Country {
  name: string;
  code: string;
  dial_code: string;
  flag: string;
}

const countries: Country[] = metaData.data.countryList.map((country) => ({
  name: country.label,
  code: country.value,
  dial_code: country.dial_code as string,
  flag: country.flag as string,
}));
const DEFAULT_COUNTRY_CODE = 'CA';

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
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  const selectedCountry =
    countries.find((c) => c.dial_code === countryCode) ||
    countries.find((c) => c.code === DEFAULT_COUNTRY_CODE) ||
    countries[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCountryDropdownOpen(false);
      }
    };

    if (isCountryDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCountryDropdownOpen]);

  const clearOtpError = () => {
    if (setOtpError) {
      setOtpError(null);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      clearOtpError();

      try {
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

          if (!sendOtp || !email) {
            if (onGoogleSignIn) {
              onGoogleSignIn();
            }
            return;
          }

          try {
            setContactValue(email);
            const result = await sendOtp({
              target: email,
              targetType: 'email',
            });

            if (!result.ok) {
              throw new Error(result.message || 'Failed to send OTP');
            }

            if (onOtpSent) {
              onOtpSent();
            }
            if (onGoogleSignIn) {
              onGoogleSignIn();
            }
          } catch (error: unknown) {
            if (setOtpError) {
              setOtpError((error as Error).message || 'Failed to send OTP');
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

  const handleGoogleSignIn = () => {
    setGoogleLoading(true);
    clearOtpError();
    googleLogin();
  };

  const handleInputChange = (value: string) => {
    setContactValue(value);

    if (otpError) {
      clearOtpError();
    }

    const contactType = detectContactType(value);
    setIsPhoneNumber(contactType === 'phone');
  };

  const handleToggleCountryDropdown = () => {
    if (!otpSending) {
      setIsCountryDropdownOpen((prev) => !prev);
    }
  };

  const handleSelectCountry = (dialCode: string) => {
    setCountryCode(dialCode);
    setIsCountryDropdownOpen(false);
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-[#252B37] mb-2 text-center">
        Get Started
      </h2>
      <p className="text-[#717680] text-sm mb-6 text-center">
        Enter your contact details to continue
      </p>

      <form onSubmit={onSendOTP} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#252B37] mb-2">
            Email / Mobile No <span className="text-red-500">*</span>
          </label>
          <div className={`flex overflow-visible items-center border border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-[#F4781B] focus-within:border-transparent bg-white ${!isPhoneNumber ? 'px-0' : ''}`}>
            {isPhoneNumber && (
              <div className="relative" ref={countryDropdownRef}>
                <button
                  type="button"
                  onClick={handleToggleCountryDropdown}
                  disabled={otpSending}
                  className="flex items-center gap-1.5 px-3 py-3 border-r border-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-base">{selectedCountry.flag}</span>
                  <span className="text-sm font-medium text-[#252B37]">
                    {selectedCountry.code}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-[#717680] transition-transform ${
                      isCountryDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isCountryDropdownOpen && (
                  <div className="absolute left-0 top-full mt-1 bg-white rounded-lg w-80 shadow-xl border border-gray-200 z-[10001] max-h-72 overflow-y-auto">
                    <div className="divide-y divide-gray-100">
                      {countries.map((country) => (
                        <button
                          key={country.code}
                          type="button"
                          onClick={() => handleSelectCountry(country.dial_code)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left ${
                            selectedCountry.code === country.code ? 'bg-gray-50' : ''
                          }`}
                        >
                          <span className="text-lg">{country.flag}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-[#252B37] truncate">
                              {country.name}
                            </div>
                          </div>
                          <div className="text-sm text-[#717680] font-medium shrink-0">
                            {country.dial_code}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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

        {otpError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {otpError}
          </div>
        )}

        <CustomButton
          type="submit"
          className="w-full justify-center py-3 text-base font-semibold"
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
