"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/global/app-layout";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { useJob, useJobId } from "@/hooks/useJobData";
import { JobDetailTabs } from "./components/Tabs";
import { JobDetailSummary } from "./components/BasicInfo";
import { mapJobDetail, type JobDetailPayload } from "./components/job-detail-helpers";

export default function JobDetailPageRoute() {
  const router = useRouter();
  const jobId = useJobId();
  const { job, isLoading, error } = useJob(jobId);
  const mappedJob = useMemo(
    () => (job ? mapJobDetail(job as unknown as JobDetailPayload) : null),
    [job],
  );

  useEffect(() => {
    if (!isLoading && !job && jobId) router.replace("/jobs");
  }, [isLoading, job, jobId, router]);

  if (isLoading) {
    return (
      <AppLayout padding="none">
        <div className="mx-auto w-full p-3 sm:p-4 md:p-5 xl:p-6">
          <div className="mb-4 h-4 w-40 animate-pulse rounded bg-gray-200" />
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-5 space-y-3">
              <div className="h-7 w-64 animate-pulse rounded bg-gray-200" />
              <div className="flex gap-2">
                <div className="h-7 w-32 animate-pulse rounded-full bg-gray-100" />
                <div className="h-7 w-24 animate-pulse rounded-full bg-gray-100" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 p-6 lg:grid-cols-[1fr_300px]">
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-16 animate-pulse rounded-xl bg-gray-100"
                  />
                ))}
              </div>
              <div className="h-48 animate-pulse rounded-xl bg-orange-50" />
            </div>
            <div className="border-t border-gray-100 bg-gray-50/50 p-6">
              <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-20 animate-pulse rounded-xl bg-white"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !mappedJob) {
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
      <div className="p-3 sm:p-4 md:p-5 xl:p-6 mx-auto w-full flex flex-col gap-4">
        <BreadcrumbNav
          breadcrumbs={[
            { label: "Jobs", path: "/jobs" },
            { label: jobId ?? "", path: `/job/${jobId}` },
          ]}
        />

        <JobDetailSummary job={mappedJob} />
        <Suspense fallback={null}>
          <JobDetailTabs job={mappedJob} jobId={jobId!} />
        </Suspense>
      </div>
    </AppLayout>
  );
}
