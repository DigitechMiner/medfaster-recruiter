'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useAuthStore } from '@/stores/authStore';
import { DEFAULT_PHONE_DIAL_CODE, emptyOtpDigits, OTP_LENGTH } from '@/utils/auth';
import { Logo, OtpVerificationForm, SignInForm } from './components';

export default function AuthPage() {
  const [contactValue, setContactValue] = useState('');
  const [countryCode, setCountryCode] = useState<string>(DEFAULT_PHONE_DIAL_CODE);
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState(emptyOtpDigits);
  const router = useRouter();

  const {
    sendOtp,
    verifyOtp,
    otpSending,
    otpVerifying,
    otpError,
    setOtpError,
    recruiterProfile,
  } = useAuthStore();

  useEffect(() => {
    if (recruiterProfile) {
      router.replace('/');
    }
  }, [recruiterProfile, router]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);

    if (!contactValue.trim()) {
      setOtpError('Please enter email or phone number');
      return;
    }

    const countryCodeNumber = countryCode.replace('+', '');
    const result = await sendOtp({ target: contactValue, countryCode: countryCodeNumber });

    if (result.ok) {
      setShowOTP(true);
      toast.success('OTP sent successfully!');
    } else {
      toast.error(result.message ?? 'Failed to send OTP');
    }
  };

  const handleGoogleSignIn = () => {};

  const handleOtpChange = (index: number, value: string) => {
    setOtpError(null);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
  };

  const handleOtpKeyDown = () => {};

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);

    const otpCode = otp.join('');
    if (otpCode.length !== OTP_LENGTH) {
      setOtpError(`Please enter a ${OTP_LENGTH}-digit OTP`);
      return;
    }

    const result = await verifyOtp(otpCode, true);

    if (result.ok) {
      toast.success('Login successful!');
      router.replace('/');
    } else {
      setOtpError(result.message ?? 'Failed to verify OTP');
      setOtp(emptyOtpDigits());
    }
  };

  const handleResendOTP = async () => {
    setOtpError(null);
    setOtp(emptyOtpDigits());
    const result = await sendOtp({ target: contactValue });
    if (result.ok) toast.success('OTP resent successfully!');
  };

  const formContent = !showOTP ? (
    <SignInForm
      contactValue={contactValue}
      setContactValue={setContactValue}
      countryCode={countryCode}
      setCountryCode={setCountryCode}
      otpSending={otpSending}
      otpError={otpError}
      onSendOTP={handleSendOTP}
      onGoogleSignIn={handleGoogleSignIn}
      setOtpError={setOtpError}
      sendOtp={sendOtp}
      onOtpSent={() => setShowOTP(true)}
    />
  ) : (
    <OtpVerificationForm
      contactValue={contactValue}
      countryCode={countryCode}
      otp={otp}
      otpSending={otpSending}
      otpVerifying={otpVerifying}
      otpError={otpError}
      onOtpChange={handleOtpChange}
      onOtpKeyDown={handleOtpKeyDown}
      onVerifyOTP={handleVerifyOTP}
      onResendOTP={handleResendOTP}
    />
  );

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 md:p-0 overflow-hidden">
      <Image
        src="/img/people/modalDoctor.png"
        alt="Healthcare professional with patient"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 w-full">
        <div className="md:hidden w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <Logo />
          {formContent}
        </div>

        <div className="hidden md:flex fixed inset-0 w-full h-full">
          <div className="w-[45%] h-full p-8" />

          <div className="w-[55%] h-full flex items-center justify-center p-8 overflow-y-auto">
            <div className="w-full max-w-md bg-white rounded-2xl border-[1.5px] border-gray-200 p-8 overflow-visible">
              <Logo />
              {formContent}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
