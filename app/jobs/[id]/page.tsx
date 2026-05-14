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
        <div className="p-3 sm:p-4 md:p-5 xl:p-6 mx-auto w-full">
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-gray-600">Loading...</p>
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
