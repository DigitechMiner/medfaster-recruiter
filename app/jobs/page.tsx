"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { EmptyJobState } from "./components/empty";
import { AppLayout } from "@/components/global/app-layout";
import JobsPage from "./components/JobsPage";
import { useJobsStore } from "@/stores/jobs-store";

import { useAuthStore } from "@/stores/authStore";
import { useJobs } from "@/hooks/useJobData";

export default function JobsPageWrapper() {
  const router = useRouter();
  const hasJobs = useJobsStore((state: { hasJobs: boolean }) => state.hasJobs);
  const { jobs, isLoading } = useJobs();
  const recruiterProfile = useAuthStore((state) => state.recruiterProfile);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check authentication status - ClientLayout loads profile on mount
  useEffect(() => {
    // Give ClientLayout a moment to load the profile
    const checkAuth = setTimeout(() => {
      setIsCheckingAuth(false);
      const currentProfile = useAuthStore.getState().recruiterProfile;
      if (!currentProfile) {
        // Redirect to home if not authenticated
        router.replace("/");
      }
    }, 300); // Brief delay to allow profile to load

    return () => clearTimeout(checkAuth);
  }, [router]);

  // Also check immediately if profile becomes available
  useEffect(() => {
    if (recruiterProfile) {
      setIsCheckingAuth(false);
    }
  }, [recruiterProfile]);

  // Update store when jobs are loaded
  useEffect(() => {
    if (jobs.length > 0) {
      useJobsStore.getState().setHasJobs(jobs.length>0);
    }
  }, [jobs]);

  // Show loading state while checking auth or loading jobs
  if (isCheckingAuth || isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-gray-600">Loading...</p>
        </div>
      </AppLayout>
    );
  }

  // Protect route - don't render content if not authenticated
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
      {hasJobs ? <JobsPage /> : <EmptyJobState />}
    </AppLayout>
  );
}
