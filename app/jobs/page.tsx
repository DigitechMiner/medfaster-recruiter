"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/global/app-layout";
import { JobsDashboard } from "./components/JobsDashboard";
import { useJobsStore } from "@/stores/jobs-store";
import { useAuthStore } from "@/stores/authStore";

export default function JobsPageWrapper() {
  const router           = useRouter();
  const recruiterProfile = useAuthStore((state) => state.recruiterProfile);

  // Redirect if unauthenticated
  useEffect(() => {
    if (!recruiterProfile) {
      router.replace("/");
    }
  }, [recruiterProfile]);

  // One silent check in background to know if jobs exist for empty state
  useEffect(() => {
    if (!recruiterProfile) return;

    useJobsStore.getState().getJobsSilent({ page: 1, limit: 1 })
      .then((res) => {
        if (res.success) {
          useJobsStore.getState().setHasJobs(res.data.pagination.total > 0);
        }
      })
      .catch(() => {
        useJobsStore.getState().setHasJobs(false);
      });
  }, [recruiterProfile]);

  if (!recruiterProfile) {
    return null;
  }

  return (
    <AppLayout padding="none">
      <div className="flex flex-col gap-4 p-3 sm:p-4 md:p-5 xl:p-6 mx-auto w-full max-w-7xl">
        <JobsDashboard />
      </div>
    </AppLayout>
  );
}