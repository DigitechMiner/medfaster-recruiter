'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { CustomButton } from '@/components/custom/custom-button';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'Sign Up' | 'Login'>('Sign Up');
  const [mobileNumber, setMobileNumber] = useState('');
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

  if (!isOpen) return null;

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);

    if (!mobileNumber || mobileNumber.length < 8) {
      setOtpError('Please enter a valid mobile number');
      return;
    }

    const result = await sendOtp({
      target: mobileNumber,
      targetType: 'phone',
      countryCode,
    });
    if (result.ok) {
      setShowOTP(true);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);

    const otpString = otp.join('');
    if (otpString.length !== 4) {
      setOtpError('Please enter complete 4-digit OTP');
      return;
    }

    const result = await verifyOtp(otpString, true); // Load recruiter profile after login
    if (result.ok) {
      onClose();
      router.push('/jobs');
    } else {
      setOtpError(result.message || 'Invalid OTP');
      setOtp(['', '', '', '']);
      document.getElementById('otp-0')?.focus();
    }
  };

  const handleResendOTP = async () => {
    setOtpError(null);
    setOtp(['', '', '', '']);
    await sendOtp({
      target: mobileNumber,
      targetType: 'phone',
      countryCode,
    });
    document.getElementById('otp-0')?.focus();
  };

  const handleBackToSignIn = () => {
    setShowOTP(false);
    setOtp(['', '', '', '']);
    setOtpError(null);
  };

  const handleGoogleSignIn = () => {
    console.log('Google Sign In');
    // TODO: Implement Google OAuth
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-100/80 md:bg-black/50 p-4 md:p-0"
      onClick={onClose}
    >
      {/* MOBILE VIEW */}
      <div 
        className="md:hidden relative w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <div className="mb-6 flex justify-center">
          <Image
            src="/img/brand/medfaster-logo.png"
            alt="MedFaster"
            width={150}
            height={40}
          />
        </div>

        {!showOTP ? (
          <>
            <h2 className="text-2xl font-bold text-[#252B37] mb-2 text-center">
              Sign in
            </h2>
            <p className="text-[#717680] text-sm mb-6 text-center">
              Welcome back! Please enter your details.
            </p>

            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setActiveTab('Sign Up')}
                className={`flex-1 py-2 text-sm font-medium transition-all rounded-lg ${
                  activeTab === 'Sign Up'
                    ? 'bg-gray-100 text-[#252B37]'
                    : 'bg-white text-[#717680]'
                }`}
              >
                Sign Up
              </button>
              <button
                onClick={() => setActiveTab('Login')}
                className={`flex-1 py-2 text-sm font-medium transition-all rounded-lg ${
                  activeTab === 'Login'
                    ? 'bg-gray-100 text-[#252B37]'
                    : 'bg-white text-[#717680]'
                }`}
              >
                Login
              </button>
            </div>

            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#252B37] mb-2">
                  Country Code <span className="text-red-500">*</span>
                </label>
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F4781B] text-sm bg-white"
                  disabled={otpSending}
                >
                  <option value="+1">+1 (USA/Canada)</option>
                  <option value="+91">+91 (India)</option>
                  <option value="+44">+44 (UK)</option>
                  <option value="+61">+61 (Australia)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#252B37] mb-2">
                  Mobile No <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="Enter your mobile no"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F4781B] text-sm bg-white"
                  required
                  minLength={8}
                  maxLength={15}
                  disabled={otpSending}
                />
              </div>

              {otpError && (
                <p className="text-red-500 text-sm text-center">{otpError}</p>
              )}

              <CustomButton 
                type="submit"
                className="w-full justify-center py-3 text-base font-semibold"
                disabled={otpSending}
              >
                {otpSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send OTP'
                )}
              </CustomButton>
            </form>

            <div className="my-4">
              <div className="w-full border-t border-gray-200"></div>
            </div>

            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors bg-white"
              disabled={otpSending}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span className="text-[#252B37] font-medium text-sm">Sign In with Google</span>
            </button>
          </>
        ) : (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-[#FFF4ED] rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-[#F4781B]" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-[#252B37] mb-2 text-center">
              Check your mobile
            </h2>
            <p className="text-[#717680] text-sm mb-6 text-center">
              We sent a verification OTP to<br />
              <span className="font-medium text-[#252B37]">
                {countryCode} {mobileNumber}
              </span>
            </p>

            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="flex gap-3 justify-center">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    autoFocus={index === 0}
                    disabled={otpSending}
                    className="w-16 h-16 text-center text-2xl font-bold border-2 border-[#F4781B] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F4781B] text-[#F4781B] disabled:opacity-50"
                  />
                ))}
              </div>

              {otpError && (
                <p className="text-red-500 text-sm text-center">{otpError}</p>
              )}

              <CustomButton 
                type="submit"
                className="w-full justify-center py-3 text-base font-semibold"
                disabled={otpSending}
              >
                {otpSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Sign In'
                )}
              </CustomButton>
            </form>

            <p className="mt-4 text-center text-sm text-[#717680]">
              Didn&apos;t receive the OTP?{' '}
              <button 
                type="button"
                onClick={handleResendOTP}
                disabled={otpSending}
                className="text-[#F4781B] font-semibold hover:opacity-80 disabled:opacity-50"
              >
                Click to resend
              </button>
            </p>

            <button
              onClick={handleBackToSignIn}
              disabled={otpSending}
              className="mt-4 w-full flex items-center justify-center gap-2 text-sm text-[#717680] hover:text-[#252B37] transition-colors disabled:opacity-50"
            >
              <ArrowLeft size={16} />
              Back to Sign Up
            </button>
          </>
        )}
      </div>

      {/* DESKTOP VIEW */}
      <div 
        className="hidden md:flex fixed inset-0 w-full h-full"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 text-gray-400 hover:text-gray-600 transition-colors bg-white rounded-full p-2 shadow-md"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {/* Image Section */}
        <div className="w-[45%] h-full bg-white p-8">
          <div className="relative w-full h-full rounded-2xl overflow-hidden">
            <Image
              src="/img/people/modalDoctor.png"
              alt="Healthcare professional with Sign Up"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Right Side - Form Container */}
        <div className="w-[55%] h-full flex items-center justify-center bg-white p-8 overflow-y-auto">
          <div className="w-full max-w-md bg.white rounded-2xl border-2 border-gray-200 p-8">
            <div className="mb-6 flex justify-center">
              <Image
                src="/img/brand/medfaster-logo.png"
                alt="MedFaster"
                width={150}
                height={40}
              />
            </div>

            {!showOTP ? (
              <>
                <h2 className="text-2xl font-bold text-[#252B37] mb-2 text-center">
                  Sign in
                </h2>
                <p className="text-[#717680] text-sm mb-6 text-center">
                  Welcome back! Please enter your details.
                </p>

                <div className="flex gap-2 mb-6 border-2 rounded-lg">
                  <button
                    onClick={() => setActiveTab('Sign Up')}
                    className={`flex-1 py-2 text-sm font-medium transition-all rounded-lg ${
                      activeTab === 'Sign Up'
                        ? 'bg-white text-[#252B37] border-1'
                        : 'bg-white text-[#717680]'
                    }`}
                  >
                    Sign Up
                  </button>
                  <button
                    onClick={() => setActiveTab('Login')}
                    className={`flex-1 py-2 text-sm font-medium transition-all rounded-lg ${
                      activeTab === 'Login'
                        ? 'bg-white text-[#252B37] border-1'
                        : 'bg-white text-[#717680]'
                    }`}
                  >
                    Login
                  </button>
                </div>

                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#252B37] mb-2">
                      Country Code <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F4781B] text-sm bg-white"
                      disabled={otpSending}
                    >
                      <option value="+1">+1 (USA/Canada)</option>
                      <option value="+91">+91 (India)</option>
                      <option value="+44">+44 (UK)</option>
                      <option value="+61">+61 (Australia)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#252B37] mb-2">
                      Mobile No <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="Enter your mobile no"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F4781B] text-sm bg-white"
                      required
                      minLength={8}
                      maxLength={15}
                      disabled={otpSending}
                    />
                  </div>

                  {otpError && (
                    <p className="text-red-500 text-sm text-center">{otpError}</p>
                  )}

                  <CustomButton 
                    type="submit"
                    className="w-full justify-center py-3 text-base font-semibold"
                    disabled={otpSending}
                  >
                    {otpSending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send OTP'
                    )}
                  </CustomButton>
                </form>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-white text-[#717680] font-medium">OR</span>
                  </div>
                </div>

                <button
                  onClick={handleGoogleSignIn}
                  className="w-full flex items-center justify-center gap-3 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors bg-white"
                  disabled={otpSending}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span className="text-[#252B37] font-medium text-sm">Sign in with Google</span>
                </button>

                <p className="mt-6 text-center text-sm text-[#717680]">
                  Don&apos;t have an account?{' '}
                  <button 
                    type="button" 
                    className="text-[#F4781B] font-semibold hover:opacity-80"
                  >
                    Sign Up
                  </button>
                </p>
              </>
            ) : (
              <>
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-[#FFF4ED] rounded-full flex items-center justify-center">
                    <Mail className="w-8 h-8 text-[#F4781B]" />
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-[#252B37] mb-2 text-center">
                  Check your mobile
                </h2>
                <p className="text-[#717680] text-sm mb-6 text-center">
                  We sent a verification OTP to<br />
                  <span className="font-medium text-[#252B37]">
                    {countryCode} {mobileNumber}
                  </span>
                </p>

                <form onSubmit={handleVerifyOTP} className="space-y-6">
                  <div className="flex gap-3 justify-center">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        autoFocus={index === 0}
                        disabled={otpSending}
                        className="w-16 h-16 text-center text-2xl font-bold border-2 border-[#F4781B] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F4781B] text-[#F4781B] disabled:opacity-50"
                      />
                    ))}
                  </div>

                  {otpError && (
                    <p className="text-red-500 text-sm text-center">{otpError}</p>
                  )}

                  <CustomButton 
                    type="submit"
                    className="w-full justify-center py-3 text-base font-semibold"
                    disabled={otpSending}
                  >
                    {otpSending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </CustomButton>
                </form>

                <p className="mt-4 text-center text-sm text-[#717680]">
                  Didn&apos;t receive the OTP?{' '}
                  <button 
                    type="button"
                    onClick={handleResendOTP}
                    disabled={otpSending}
                    className="text-[#F4781B] font-semibold hover:opacity-80 disabled:opacity-50"
                  >
                    Click to resend
                  </button>
                </p>

                <button
                  onClick={handleBackToSignIn}
                  disabled={otpSending}
                  className="mt-4 w-full flex items-center justify-center gap-2 text-sm text-[#717680] hover:text-[#252B37] transition-colors disabled:opacity-50"
                >
                  <ArrowLeft size={16} />
                  Back to Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
