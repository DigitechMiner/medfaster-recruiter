"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import LoginModal from "@/components/global/otpModal";

interface OtpGateProps {
  children: React.ReactNode;
}

export const OtpGate = ({ children }: OtpGateProps) => {
  const { recruiterProfile } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (recruiterProfile) setIsAuthenticated(true);
      setIsChecking(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [recruiterProfile]);

  useEffect(() => {
    if (recruiterProfile) setIsAuthenticated(true);
  }, [recruiterProfile]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LoginModal
          isOpen={true}
          onClose={() => {}}
          onSuccess={() => setIsAuthenticated(true)}
          forceOpen={true}
        />
      </div>
    );
  }

  return <>{children}</>;
};
