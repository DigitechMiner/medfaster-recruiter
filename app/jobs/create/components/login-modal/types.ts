import type React from "react";

export type AuthTab = "Sign Up" | "Login";

export interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface LoginViewProps {
  onClose: () => void;
  activeTab: AuthTab;
  setActiveTab: (tab: AuthTab) => void;
  mobileNumber: string;
  setMobileNumber: (value: string) => void;
  countryCode: string;
  setCountryCode: (value: string) => void;
  showOTP: boolean;
  otp: string[];
  otpSending: boolean;
  otpError: string | null;
  handleSendOTP: (e: React.FormEvent) => Promise<void>;
  handleOtpChange: (index: number, value: string) => void;
  handleOtpKeyDown: (index: number, e: React.KeyboardEvent) => void;
  handleVerifyOTP: (e: React.FormEvent) => Promise<void>;
  handleResendOTP: () => Promise<void>;
  handleBackToSignIn: () => void;
  handleGoogleSignIn: () => void;
}
