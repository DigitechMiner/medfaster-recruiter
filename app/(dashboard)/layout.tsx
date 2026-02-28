"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { OtpGate } from "./components/OtpGate";


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const recruiterProfile = useAuthStore((state) => state.recruiterProfile);
  const router = useRouter();
  const pathname = usePathname();

  const isProfileComplete = !!(
  (recruiterProfile as any)?.organization_name &&
  (recruiterProfile as any)?.contact_person_name
);

  useEffect(() => {
    if (!recruiterProfile) return;

    if (!isProfileComplete && pathname !== "/registration") {
      router.replace("/registration");
    }
  }, [recruiterProfile, isProfileComplete, pathname, router]);

  return <OtpGate>{children}</OtpGate>;
}