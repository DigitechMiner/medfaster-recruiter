'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { useAuthStore } from '@/stores/authStore';
import SignInForm from './components/SignInForm';
import OtpVerificationForm from './components/OtpVerificationForm';
import { Logo, CloseButton } from './components';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  forceOpen?: boolean;
}

export default function LoginModal({ isOpen, onClose, onSuccess, forceOpen = false }: LoginModalProps) {
  const [contactValue, setContactValue] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '']);

  const {
    sendOtp,
    verifyOtp,
    otpSending,
    otpError,
    setOtpError,
  } = useAuthStore();

  useEffect(() => {
    if (!isOpen) {
      setContactValue('');
      setCountryCode('+1');
      setShowOTP(false);
      setOtp(['', '', '', '']);
      setOtpError(null);
    }
  }, [isOpen, setOtpError]);

  if (!isOpen) return null;

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
    if (otpCode.length !== 4) {
      setOtpError('Please enter a 4-digit OTP');
      return;
    }

    // ✅ Pass loadProfile=true — verifyOtp sets the token then loads profile internally.
    //    Do NOT call loadRecruiterProfile() again here — that was causing the 401
    //    race condition (profile fetch fired before token was committed).
    const result = await verifyOtp(otpCode, true);

    if (result.ok) {
      toast.success('Login successful!');
      onSuccess?.();
      onClose();
    } else {
      setOtpError(result.message ?? 'Failed to verify OTP');
      setOtp(['', '', '', '']);
    }
  };

  const handleResendOTP = async () => {
    setOtpError(null);
    setOtp(['', '', '', '']);
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
      otpError={otpError}
      onOtpChange={handleOtpChange}
      onOtpKeyDown={handleOtpKeyDown}
      onVerifyOTP={handleVerifyOTP}
      onResendOTP={handleResendOTP}
    />
  );

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-100/80 md:bg-black/50 p-4 md:p-0"
      onClick={forceOpen ? undefined : onClose}
    >
      {/* Mobile View */}
      <div
        className="md:hidden relative w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {!forceOpen && (
          <CloseButton
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            onClose={onClose}
          />
        )}
        <Logo />
        {formContent}
      </div>

      {/* Desktop View */}
      <div
        className="hidden md:flex fixed inset-0 w-full h-full"
        onClick={(e) => e.stopPropagation()}
      >
        {!forceOpen && (
          <CloseButton
            className="absolute top-6 right-6 z-10 text-gray-400 hover:text-gray-600 transition-colors bg-white rounded-full p-2 shadow-md"
            onClose={onClose}
          />
        )}

        {/* Left image */}
        <div className="w-[45%] h-full bg-white p-8">
          <div className="relative w-full h-full rounded-2xl overflow-hidden">
            <Image
              src="/img/people/modalDoctor.png"
              alt="Healthcare professional with patient"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Right form */}
        <div className="w-[55%] h-full flex items-center justify-center bg-white p-8 overflow-y-auto">
          <div className="w-full max-w-md bg-white rounded-2xl border-[1.5px] border-gray-200 p-8 overflow-visible">
            <Logo />
            {formContent}
          </div>
        </div>
      </div>
    </div>
  );
}