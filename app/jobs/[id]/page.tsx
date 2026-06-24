"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/global/app-layout";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { useJobSummary, useJobId } from "@/hooks/useJobData";
import { JobDetailTabs } from "./components/Tabs";
import { JobDetailSummary } from "./components/BasicInfo";
import { ScheduleSection } from "./components/ScheduleSection";

export default function JobDetailPageRoute() {
  const router = useRouter();
  const jobId = useJobId();
  const { summary, isLoading, error } = useJobSummary(jobId);

  useEffect(() => {
    if (!isLoading && !summary && jobId) router.replace("/jobs");
  }, [isLoading, summary, jobId, router]);

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
            <div className="border-b border-gray-100 bg-gray-50/50 p-6">
              <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-16 animate-pulse rounded-xl bg-gray-100"
                  />
                ))}
              </div>
            </div>
            <div className="p-6">
              <div className="h-24 animate-pulse rounded-xl bg-gray-100" />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-xl bg-white border border-gray-200"
              />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !summary) {
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
            { label: summary.title, path: `/jobs/${jobId}` },
          ]}
        />

        <JobDetailSummary summary={summary} />

        <Suspense fallback={null}>
          <ScheduleSection summary={summary} jobId={jobId!} />
        </Suspense>

        <Suspense fallback={null}>
          <JobDetailTabs summary={summary} jobId={jobId!} />
        </Suspense>
      </div>
    </AppLayout>
  );
}
