"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/global/app-layout";
import { JobCard } from "@/components/card/JobCard";
import { PaginationFooter } from "@/components/table/PaginationFooter";
import { TableTabs, TabToolbarFilterViewToggle } from "@/components/table/TableTabs";
import { getRecruiterJobsSummary } from "@/features/jobs";
import type { GetJobsParams } from "@/features/jobs";
import { useJobsStore } from "@/stores/jobs-store";
import { useAuthStore } from "@/stores/authStore";
import { useJobs } from "@/hooks/useJobData";
import { JobsFiltersModal } from "./components/filters-modal";
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

function JobTabLabel({
  label,
  count,
  isActive,
  loading,
}: {
  label: string;
  count: number;
  isActive: boolean;
  loading: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      {label}
      {loading ? (
        <span className="h-5 w-5 rounded-full bg-gray-100 animate-pulse" />
      ) : (
        <span
          className={
            isActive
              ? "flex h-5 min-w-5 items-center justify-center rounded-full bg-[#F4781B] px-1.5 text-xs font-semibold text-white"
              : "text-sm font-medium text-gray-400"
          }
        >
          {count}
        </span>
      )}
    </span>
  );
}

export default function JobsPageWrapper() {
  const router           = useRouter();
  const recruiterProfile = useAuthStore((state) => state.recruiterProfile);
  const jobsLoading = useJobsStore((state) => state.isLoading);
  const [counts, setCounts] = useState<StatCounts>({
    activeJobs: 0,
    normalJobs: 0,
    instantJobs: 0,
    activeShifts: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [tabCountsLoading, setTabCountsLoading] = useState(true);
  const [view, setView] = useState<"list" | "grid">("list");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<JobTypeTab>("normal");
  const [jobStatus, setJobStatus] = useState<JobStatusFilter>("all");
  const [appliedJobStatus, setAppliedJobStatus] = useState<JobStatusFilter>("all");

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
  }, [recruiterProfile]);

  // One silent check in background to know if jobs exist for empty state
  useEffect(() => {
    if (!recruiterProfile) return;

    useJobsStore.getState().getJobsSilent({ page: 1, limit: 1, job_urgency: activeTab })
      .then((res) => {
        if (res.success) {
          useJobsStore.getState().setHasJobs(res.data.pagination.total > 0);
        }
      })
      .catch(() => {
        useJobsStore.getState().setHasJobs(false);
      });
  }, [recruiterProfile, activeTab]);

  useEffect(() => {
    if (!recruiterProfile) return;

    let cancelled = false;
    setTabCountsLoading(true);

    Promise.all([
      useJobsStore.getState().getJobsSilent({ page: 1, limit: 1, job_urgency: "normal" }),
      useJobsStore.getState().getJobsSilent({ page: 1, limit: 1, job_urgency: "instant" }),
    ])
      .then(([normalRes, instantRes]) => {
        if (cancelled) return;
        setCounts((prev) => ({
          ...prev,
          normalJobs: normalRes.success ? normalRes.data.pagination.total : 0,
          instantJobs: instantRes.success ? instantRes.data.pagination.total : 0,
        }));
      })
      .catch(() => {
        if (cancelled) return;
        setCounts((prev) => ({ ...prev, normalJobs: 0, instantJobs: 0 }));
      })
      .finally(() => {
        if (!cancelled) setTabCountsLoading(false);
      });

    return () => { cancelled = true; };
  }, [recruiterProfile]);

  useEffect(() => {
    if (!recruiterProfile) return;

    let cancelled = false;

    getRecruiterJobsSummary()
      .then((summary) => {
        if (cancelled) return;
        setCounts((prev) => ({
          ...prev,
          activeJobs: summary.active_job_count,
          activeShifts: summary.active_shift_count,
        }));
      })
      .catch(() => {
        if (cancelled) return;
        setCounts((prev) => ({
          ...prev,
          activeJobs: 0,
          activeShifts: 0,
        }));
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

  const showJobsLoading = jobsLoading || jobsRequestLoading;

  return (
    <AppLayout padding="none">
      <div className="flex flex-col gap-4 p-3 sm:p-4 md:p-5 xl:p-6 mx-auto w-full max-w-7xl">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-bold leading-8 text-gray-900">Jobs</h1>
            {/* <div className="flex flex-wrap items-center gap-3">
              <CustomButton
                type="button"
                onClick={() => router.push("/jobs/create/instant")}
                size="sm"
                className="my-0 inline-flex h-8 items-center justify-center gap-1.5 px-3 rounded-lg border border-[#F4781B] bg-white text-[#F4781B] text-sm font-semibold shadow-none hover:bg-orange-50 transition-colors"
              >
                <span className="text-sm leading-none font-bold">+</span>
                <span>Instant Job</span>
              </CustomButton>
              <CustomButton
                type="button"
                onClick={() => router.push("/jobs/create/normal")}
                size="sm"
                className="my-0 inline-flex h-8 items-center justify-center gap-1.5 px-3 rounded-lg bg-[#F4781B] text-white text-sm font-semibold shadow-none hover:bg-[#e06a10] transition-colors"
              >
                <span className="text-sm leading-none font-bold">+</span>
                <span>Normal Job</span>
              </CustomButton>
            </div> */}
          </div>

          <Summary counts={counts} loading={statsLoading} />

          <div
            className="bg-white rounded-2xl overflow-hidden"
            style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-1">
              <TableTabs
                tabs={[
                  {
                    key: "normal" as const,
                    label: (
                      <JobTabLabel
                        label="Normal Jobs"
                        count={counts.normalJobs}
                        isActive={activeTab === "normal"}
                        loading={tabCountsLoading}
                      />
                    ),
                  },
                  {
                    key: "instant" as const,
                    label: (
                      <JobTabLabel
                        label="Instant / Urgent"
                        count={counts.instantJobs}
                        isActive={activeTab === "instant"}
                        loading={tabCountsLoading}
                      />
                    ),
                  },
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
              {showJobsLoading ? (
                <JobsLoadingSkeleton />
              ) : error ? (
                <JobsErrorView error={error} />
              ) : jobs.length === 0 ? (
                <JobsEmptyView />
              ) : view === "list" ? (
                <TableView jobs={jobs} onJobClick={(jobId) => router.push(`/jobs/${jobId}`)} />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {jobs.map((job) => (
                    <JobCard key={job.id} job={job} />
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
    </AppLayout>
  );
}