"use client";

import { useEffect } from "react";
import { EmptyJobState } from "./components/empty";
import { AppLayout } from "@/components/global/app-layout";
import JobsPage from "./components/JobsPage";
import { useJobsStore } from "@/lib/store/jobs-store";
import { useJobs } from "./hooks/useJobData";

export default function JobsPageWrapper() {
  const hasJobs = useJobsStore((state) => state.hasJobs);
  const { jobs, isLoading } = useJobs();

  // Update store when jobs are loaded
  useEffect(() => {
    if (jobs.length > 0) {
      useJobsStore.getState().setHasJobs(true);
    }
  }, [jobs]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-gray-600">Loading jobs...</p>
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
