"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { EmptyJobState } from "./components/empty";
import { AppLayout } from "@/components/global/app-layout";
import { JobsDashboard } from "./components/JobsDashboard";
import { useJobsStore } from "@/stores/jobs-store";
import { useAuthStore } from "@/stores/authStore";
import { useJobs } from "@/hooks/useJobData";

export default function JobsPageWrapper() {
  const router = useRouter();
  const hasJobs = useJobsStore((state: { hasJobs: boolean }) => state.hasJobs);
  const { jobs, isLoading } = useJobs();
  const recruiterProfile = useAuthStore((state) => state.recruiterProfile);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = setTimeout(() => {
      setIsCheckingAuth(false);
      const currentProfile = useAuthStore.getState().recruiterProfile;
      if (!currentProfile) router.replace("/");
    }, 300);
    return () => clearTimeout(checkAuth);
  }, [router]);

  useEffect(() => {
    if (recruiterProfile) setIsCheckingAuth(false);
  }, [recruiterProfile]);

  useEffect(() => {
    if (jobs.length > 0) useJobsStore.getState().setHasJobs(true);
  }, [jobs]);

  if (isCheckingAuth || isLoading) {
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
      {hasJobs ? <JobsDashboard jobs={jobs} /> : <EmptyJobState />}
    </AppLayout>
  );
}
