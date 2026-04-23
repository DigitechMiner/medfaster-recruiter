"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { DesktopLoginContent } from "./login-modal/desktop-content";
import { MobileLoginContent } from "./login-modal/mobile-content";
import type { LoginModalProps } from "./login-modal/types";

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"Sign Up" | "Login">("Sign Up");
  const [mobileNumber, setMobileNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState(["", "", "", ""]);

  const {
    sendOtp,
    verifyOtp,
    otpSending,
    otpError,
    setOtpError,
  } = useAuthStore();

  if (!isOpen) return null;

  const handleSendOTP = async (e: FormEvent) => {
    e.preventDefault();
    setOtpError(null);

    if (!mobileNumber || mobileNumber.length < 8) {
      setOtpError("Please enter a valid mobile number");
      return;
    }

    const result = await sendOtp({
      target: mobileNumber,
      targetType: "phone",
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

  const handleOtpKeyDown = (index: number, e: KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyOTP = async (e: FormEvent) => {
    e.preventDefault();
    setOtpError(null);

    const otpString = otp.join("");
    if (otpString.length !== 4) {
      setOtpError("Please enter complete 4-digit OTP");
      return;
    }

    const result = await verifyOtp(otpString, true);
    if (result.ok) {
      onClose();
      router.push("/jobs");
    } else {
      setOtpError(result.message || "Invalid OTP");
      setOtp(["", "", "", ""]);
      document.getElementById("otp-0")?.focus();
    }
  };

  const handleResendOTP = async () => {
    setOtpError(null);
    setOtp(["", "", "", ""]);
    await sendOtp({
      target: mobileNumber,
      targetType: "phone",
      countryCode,
    });
    document.getElementById("otp-0")?.focus();
  };

  const handleBackToSignIn = () => {
    setShowOTP(false);
    setOtp(["", "", "", ""]);
    setOtpError(null);
  };

  const handleGoogleSignIn = () => {
    console.log("Google Sign In");
    // TODO: Implement Google OAuth
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-100/80 md:bg-black/50 p-4 md:p-0"
      onClick={onClose}
    >
      <MobileLoginContent
        onClose={onClose}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileNumber={mobileNumber}
        setMobileNumber={setMobileNumber}
        countryCode={countryCode}
        setCountryCode={setCountryCode}
        showOTP={showOTP}
        otp={otp}
        otpSending={otpSending}
        otpError={otpError}
        handleSendOTP={handleSendOTP}
        handleOtpChange={handleOtpChange}
        handleOtpKeyDown={handleOtpKeyDown}
        handleVerifyOTP={handleVerifyOTP}
        handleResendOTP={handleResendOTP}
        handleBackToSignIn={handleBackToSignIn}
        handleGoogleSignIn={handleGoogleSignIn}
      />

      <DesktopLoginContent
        onClose={onClose}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileNumber={mobileNumber}
        setMobileNumber={setMobileNumber}
        countryCode={countryCode}
        setCountryCode={setCountryCode}
        showOTP={showOTP}
        otp={otp}
        otpSending={otpSending}
        otpError={otpError}
        handleSendOTP={handleSendOTP}
        handleOtpChange={handleOtpChange}
        handleOtpKeyDown={handleOtpKeyDown}
        handleVerifyOTP={handleVerifyOTP}
        handleResendOTP={handleResendOTP}
        handleBackToSignIn={handleBackToSignIn}
        handleGoogleSignIn={handleGoogleSignIn}
      />
    </div>
  );
}