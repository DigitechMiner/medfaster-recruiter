"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { OtpGate } from "./components/OtpGate";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const recruiterProfile = useAuthStore((state) => state.recruiterProfile);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!recruiterProfile) return;

    const isFirstTime = recruiterProfile.status === "pending_verification";

    if (isFirstTime && pathname !== "/registration") {
      router.replace("/registration");
    }
  }, [recruiterProfile, pathname, router]);

  return <OtpGate>{children}</OtpGate>;
}
