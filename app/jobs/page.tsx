"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/global/app-layout";
import { JobCard } from "@/components/card/JobCard";
import { PaginationFooter } from "@/components/table/PaginationFooter";
import { TableTabs, TabToolbarFilterViewToggle } from "@/components/table/TableTabs";
import { getRecruiterJobsSummary } from "@/features/jobs";
import type { GetJobsParams } from "@/features/jobs";
import type { JobListItem } from "@/types";
import { useAuthStore } from "@/stores/authStore";
import { useJobs } from "@/hooks/useJobData";
import { JobsFiltersModal } from "./components/filters-modal";
import { JobDetailDrawer } from "./components/job-detail-drawer";
import { Summary } from "./components/summary";
import { TableView } from "./components/tableview";
import {
  JobsEmptyView,
  JobsErrorView,
  JobsLoadingSkeleton,
  type JobStatusFilter,
  type JobTypeTab,
  type StatCounts,
} from "./components/helper";

export default function JobsPageWrapper() {
  const router           = useRouter();
  const recruiterProfile = useAuthStore((state) => state.recruiterProfile);
  const [counts, setCounts] = useState<StatCounts>({
    activeJobs: 0,
    activeNormalJobs: 0,
    activeInstantJobs: 0,
    activeShifts: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [view, setView] = useState<"list" | "grid">("list");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<JobTypeTab>("normal");
  const [jobStatus, setJobStatus] = useState<JobStatusFilter>("all");
  const [appliedJobStatus, setAppliedJobStatus] = useState<JobStatusFilter>("all");
  const [previewJob, setPreviewJob] = useState<JobListItem | null>(null);

  const jobQueryParams: GetJobsParams = {
    page,
    limit,
    job_urgency: activeTab,
    ...(appliedJobStatus !== "all" ? { status: appliedJobStatus } : {}),
  };

  const { jobs, pagination, isLoading: jobsRequestLoading, error: jobsError } = useJobs(jobQueryParams);
  const total = pagination?.total ?? 0;
  const error = jobsError;

  useEffect(() => {
    if (!recruiterProfile) {
      router.replace("/");
    }
  }, [recruiterProfile, router]);

  useEffect(() => {
    if (!recruiterProfile) return;

    let cancelled = false;
    setStatsLoading(true);

    getRecruiterJobsSummary()
      .then((summary) => {
        if (cancelled) return;
        setCounts({
          activeJobs: summary.active_job_count,
          activeNormalJobs: summary.active_normal_job_count,
          activeInstantJobs: summary.active_instant_job_count,
          activeShifts: summary.active_shift_count,
        });
      })
      .catch(() => {
        if (cancelled) return;
        setCounts({
          activeJobs: 0,
          activeNormalJobs: 0,
          activeInstantJobs: 0,
          activeShifts: 0,
        });
      })
      .finally(() => {
        if (!cancelled) setStatsLoading(false);
      });

    return () => { cancelled = true; };
  }, [recruiterProfile]);

  if (!recruiterProfile) {
    return null;
  }

  const handleApplyFilters = () => {
    setAppliedJobStatus(jobStatus);
    setPage(1);
    setFiltersOpen(false);
  };

  const handleClearFilters = () => {
    setJobStatus("all");
    setAppliedJobStatus("all");
    setPage(1);
  };

  const showJobsLoading = jobsRequestLoading;

  return (
    <AppLayout padding="none">
      <div className="flex flex-col gap-4 p-3 sm:p-4 md:p-5 xl:p-6 mx-auto w-full max-w-7xl">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-bold leading-8 text-gray-900">Jobs</h1>
          </div>

          <Summary counts={counts} loading={statsLoading} />

          <div
            className="bg-white rounded-2xl overflow-hidden"
            style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-1">
              <TableTabs
                tabs={[
                  { key: "normal" as const, label: "Normal Jobs" },
                  { key: "instant" as const, label: "Instant / Urgent" },
                ]}
                activeTab={activeTab}
                onTabChange={(tab) => {
                  setActiveTab(tab);
                  setPage(1);
                }}
                tabClassName="relative px-4 py-3.5 text-sm font-medium whitespace-nowrap transition-colors"
                endSlot={
                  <TabToolbarFilterViewToggle
                    view={view}
                    onViewChange={setView}
                    onFilterClick={() => setFiltersOpen(true)}
                  />
                }
                toolbarClassName="w-full"
                endSlotClassName="py-2"
              />
            </div>

            <JobsFiltersModal
              open={filtersOpen}
              jobStatus={jobStatus}
              onJobStatusChange={setJobStatus}
              onClose={() => setFiltersOpen(false)}
              onClear={handleClearFilters}
              onApply={handleApplyFilters}
            />

            <div className="px-6 py-4 min-h-[300px]">
              {view === "list" ? (
                <TableView
                  jobs={jobs}
                  loading={showJobsLoading}
                  error={error}
                  onJobPreview={setPreviewJob}
                />
              ) : showJobsLoading ? (
                <JobsLoadingSkeleton />
              ) : error ? (
                <JobsErrorView error={error} />
              ) : jobs.length === 0 ? (
                <JobsEmptyView />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {jobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onPreview={setPreviewJob}
                      onViewDetails={(job) => router.push(`/jobs/${job.id}`)}
                    />
                  ))}
                </div>
              )}
            </div>

            {!showJobsLoading && jobs.length > 0 && (
              <PaginationFooter
                page={page}
                totalItems={total}
                perPage={limit}
                onPageChange={setPage}
                itemLabel="Jobs"
                perPageOptions={[9, 10, 20, 50]}
                onPerPageChange={(nextLimit) => {
                  setLimit(nextLimit);
                  setPage(1);
                }}
                className="flex items-center justify-between px-6 py-3 bg-[#FEF3E9]"
              />
            )}
          </div>
        </div>
      </div>

      <JobDetailDrawer job={previewJob} onClose={() => setPreviewJob(null)} />
    </AppLayout>
  );
}
