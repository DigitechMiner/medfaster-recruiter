"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { EmptyJobState } from "./components/empty";
import { AppLayout } from "@/components/global/app-layout";
import { JobsDashboard } from "./components/JobsDashboard";
import { useJobsStore } from "@/stores/jobs-store";
import { useAuthStore } from "@/stores/authStore";

export default function JobsPageWrapper() {
  const router           = useRouter();
  const recruiterProfile = useAuthStore((state) => state.recruiterProfile);
  const hasJobs          = useJobsStore((state) => state.hasJobs);

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [initialChecked, setInitialChecked] = useState(false);

  // Auth check
  useEffect(() => {
    const t = setTimeout(() => {
      setIsCheckingAuth(false);
      if (!useAuthStore.getState().recruiterProfile) router.replace("/");
    }, 300);
    return () => clearTimeout(t);
  }, [router]);

  useEffect(() => {
    if (recruiterProfile) setIsCheckingAuth(false);
  }, [recruiterProfile]);

  // One silent initial check — just to know if jobs exist for empty state
  useEffect(() => {
    if (!recruiterProfile || initialChecked) return;

    useJobsStore.getState().getJobsSilent({ page: 1, limit: 1 })
      .then((res) => {
        if (res.success) {
          useJobsStore.getState().setHasJobs(res.data.pagination.total > 0);
        }
      })
      .catch(() => {
        useJobsStore.getState().setHasJobs(false);
      })
      .finally(() => {
        setInitialChecked(true);
      });
  }, [recruiterProfile, initialChecked]);

  if (isCheckingAuth || !initialChecked) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-gray-600">Loading...</p>
        </div>
      </AppLayout>
    );
  }

  if (!recruiterProfile) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {hasJobs ? <JobsDashboard /> : <EmptyJobState />}
    </AppLayout>
  );
}