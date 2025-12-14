"use client";

import { useRef, useEffect, useState } from "react";
import { Mail, Loader2 } from "lucide-react";
import { CustomButton } from "@/components/custom/custom-button";
import { OTP_RESEND_TIMER_SECONDS } from "@/utils/otp";

interface OtpVerificationFormProps {
  contactValue: string;
  otp: string[];
  otpSending: boolean;
  otpError: string | null;
  onOtpChange: (index: number, value: string) => void;
  onOtpKeyDown: (index: number, e: React.KeyboardEvent) => void;
  onVerifyOTP: (e: React.FormEvent) => void;
  onResendOTP: () => void;
}

export default function OtpVerificationForm({
  contactValue,
  otp,
  otpSending,
  otpError,
  onOtpChange,
  onOtpKeyDown,
  onVerifyOTP,
  onResendOTP,
}: OtpVerificationFormProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [resendTimer, setResendTimer] = useState(0); // Timer in seconds

  // Auto-focus first input when component mounts
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
    // Start the timer when component mounts
    setResendTimer(OTP_RESEND_TIMER_SECONDS);
  }, []);

  // Timer countdown effect
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Auto-focus first empty input when OTP is reset
  useEffect(() => {
    const firstEmptyIndex = otp.findIndex((digit) => !digit);
    if (firstEmptyIndex !== -1 && inputRefs.current[firstEmptyIndex]) {
      inputRefs.current[firstEmptyIndex].focus();
    }
  }, [otp]);

  const handleInputChange = (index: number, value: string) => {
    // Handle paste event - extract digits from pasted content
    if (value.length > 1) {
      const digits = value.replace(/\D/g, "").slice(0, 4);
      digits.split("").forEach((digit, i) => {
        if (index + i < 4) {
          onOtpChange(index + i, digit);
        }
      });
      // Focus the next empty input or the last input
      const nextIndex = Math.min(index + digits.length, 3);
      setTimeout(() => {
        inputRefs.current[nextIndex]?.focus();
      }, 0);
      return;
    }

    // Single digit input
    if (!/^\d*$/.test(value)) return;

    onOtpChange(index, value);

    // Auto-focus next input if a digit was entered
    if (value && index < 3) {
      setTimeout(() => {
        inputRefs.current[index + 1]?.focus();
      }, 0);
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    // Handle backspace
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        // If current input is empty, focus previous and clear it
        onOtpChange(index - 1, "");
        setTimeout(() => {
          inputRefs.current[index - 1]?.focus();
        }, 0);
      } else if (otp[index]) {
        // If current input has value, clear it
        onOtpChange(index, "");
      }
      e.preventDefault();
      return;
    }

    // Handle arrow keys
    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
      return;
    }

    if (e.key === "ArrowRight" && index < 3) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
      return;
    }

    // Handle delete key
    if (e.key === "Delete" && otp[index]) {
      onOtpChange(index, "");
      return;
    }

    // Call parent handler for other keys
    onOtpKeyDown(index, e);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const digits = pastedData.replace(/\D/g, "").slice(0, 4);

    if (digits.length > 0) {
      const firstEmptyIndex = otp.findIndex((digit) => !digit);
      const startIndex = firstEmptyIndex !== -1 ? firstEmptyIndex : 0;

      digits.split("").forEach((digit, i) => {
        if (startIndex + i < 4) {
          onOtpChange(startIndex + i, digit);
        }
      });

      // Focus the next empty input or the last input
      const nextIndex = Math.min(startIndex + digits.length, 3);
      setTimeout(() => {
        inputRefs.current[nextIndex]?.focus();
      }, 0);
    }
  };

  const handleResendClick = () => {
    if (resendTimer === 0) {
      setResendTimer(OTP_RESEND_TIMER_SECONDS);
      onResendOTP();
    }
  };

  const formatTimer = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <>
      {/* OTP Verification Screen */}
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-[#FFF4ED] rounded-full flex items-center justify-center">
          <Mail className="w-8 h-8 text-[#F4781B]" />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-[#252B37] mb-2 text-center">
        Check your {contactValue.includes("@") ? "email" : "phone"}
      </h2>
      <p className="text-[#717680] text-sm mb-6 text-center">
        We sent a verification OTP to
        <br />
        <span className="font-medium text-[#252B37]">{contactValue}</span>
      </p>

      {/* OTP Input */}
      <form onSubmit={onVerifyOTP} className="space-y-6">
        <div className="flex gap-3 justify-center">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              id={`otp-${index}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              disabled={otpSending}
              className="w-16 h-16 text-center text-2xl font-bold border-2 border-[#F4781B] rounded-lg focus:outline-none focus:border-[3px] focus:border-[#F4781B] text-[#F4781B] disabled:opacity-50"
            />
          ))}
        </div>

        {/* Error Message */}
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
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Verifying...
            </>
          ) : (
            "Sign In"
          )}
        </CustomButton>
      </form>

      {/* Resend OTP */}
      <p className="mt-4 text-center text-sm text-[#717680]">
        Didn&apos;t receive the code?{" "}
        <button
          type="button"
          onClick={handleResendClick}
          disabled={otpSending || resendTimer > 0}
          className="text-[#F4781B] font-semibold hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {resendTimer > 0 ? `Resend in ${formatTimer(resendTimer)}` : "Click to resend"}
        </button>
      </p>

    </>
  );
}
