"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/global/app-layout";
import { useJob, useJobId } from "@/hooks/useJobData";
import { UrgentJobDetail } from "./components/UrgentJobDetail";
import { NormalJobDetail } from "./components/NormalJobDetail";

export default function JobDetailPageRoute() {
  const router = useRouter();
  const jobId = useJobId();
  const { job, isLoading, error } = useJob(jobId);

  useEffect(() => {
    if (!isLoading && !job && jobId) router.replace("/jobs");
  }, [isLoading, job, jobId, router]);

  if (isLoading) {
    return (
      <AppLayout padding="none">
        <div className="p-3 sm:p-4 md:p-5 xl:p-6 mx-auto w-full">
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !job) {
    return (
      <AppLayout padding="none">
        <div className="p-3 sm:p-4 md:p-5 xl:p-6 mx-auto w-full">
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-red-600">{error || "Job not found"}</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout padding="none">
      <div className="p-3 sm:p-4 md:p-5 xl:p-6 mx-auto w-full">
        {/* Differentiate here — urgent vs normal */}
        {job.job_urgency === "instant" ? (
          <UrgentJobDetail
            job={job}
            jobId={jobId!}
            onCloseJob={() => {}}
          />
        ) : (
          <NormalJobDetail
            job={job}
            jobId={jobId!}
            onCloseJob={() => {}}
          />
        )}
      </div>
    </AppLayout>
  );
}
