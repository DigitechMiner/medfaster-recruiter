"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CustomButton } from "@/components/custom/custom-button";
import { AppLayout } from "@/components/global/app-layout";
import { JobCard } from "@/components/card/JobCard";
import { PaginationFooter } from "@/components/table/PaginationFooter";
import { TabToolbarFilterViewToggle } from "@/components/table/TableTabs";
import { getRecruiterJobsSummary } from "@/features/jobs";
import { useJobsStore } from "@/stores/jobs-store";
import { useAuthStore } from "@/stores/authStore";
import type { JobListItem } from "@/types";
import { JobsFiltersModal } from "./components/filters-modal";
import { Summary } from "./components/summary";
import { TableView } from "./components/tableview";
import {
  JobsEmptyView,
  JobsErrorView,
  JobsLoadingSkeleton,
  type JobStatusFilter,
  type JobUrgencyFilter,
  type StatCounts,
  type TabFilter,
} from "./components/helper";

export default function JobsPageWrapper() {
  const router           = useRouter();
  const recruiterProfile = useAuthStore((state) => state.recruiterProfile);
  const getJobs = useJobsStore((state) => state.getJobs);
  const jobsLoading = useJobsStore((state) => state.isLoading);
  const [counts, setCounts] = useState<StatCounts>({
    activeJobs: 0,
    normalJobs: 0,
    instantJobs: 0,
    activeShifts: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [jobsRequestLoading, setJobsRequestLoading] = useState(true);
  const [view, setView] = useState<"list" | "grid">("list");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [jobUrgency, setJobUrgency] = useState<JobUrgencyFilter>("all");
  const [jobStatus, setJobStatus] = useState<JobStatusFilter>("all");
  const [appliedJobUrgency, setAppliedJobUrgency] = useState<JobUrgencyFilter>("all");
  const [appliedJobStatus, setAppliedJobStatus] = useState<JobStatusFilter>("all");

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

  useEffect(() => {
    if (!recruiterProfile) return;

    let cancelled = false;

    getRecruiterJobsSummary()
      .then((summary) => {
        if (cancelled) return;
        setCounts({
          activeJobs: summary.active_job_count,
          normalJobs: summary.active_normal_job_count,
          instantJobs: summary.active_instant_job_count,
          activeShifts: summary.active_shift_count,
        });
      })
      .catch(() => {
        if (cancelled) return;
        setCounts({
          activeJobs: 0,
          normalJobs: 0,
          instantJobs: 0,
          activeShifts: 0,
        });
      })
      .finally(() => {
        if (!cancelled) setStatsLoading(false);
      });

    return () => { cancelled = true; };
  }, [recruiterProfile]);

  useEffect(() => {
    if (!recruiterProfile) return;

    let cancelled = false;
    setError(null);
    setJobsRequestLoading(true);
    const filters: TabFilter = {};

    if (appliedJobUrgency !== "all") {
      filters.job_urgency = appliedJobUrgency;
    }
    if (appliedJobStatus !== "all") {
      filters.status = appliedJobStatus;
    }

    getJobs({ page, limit, ...filters })
      .then((res) => {
        if (cancelled) return;
        if (res.success) {
          setJobs(res.data.jobs);
          setTotal(res.data.pagination.total);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message ?? "Failed to load jobs");
      })
      .finally(() => {
        if (!cancelled) setJobsRequestLoading(false);
      });

    return () => { cancelled = true; };
  }, [getJobs, recruiterProfile, appliedJobUrgency, appliedJobStatus, page, limit]);

  if (!recruiterProfile) {
    return null;
  }

  const handleApplyFilters = () => {
    setAppliedJobUrgency(jobUrgency);
    setAppliedJobStatus(jobStatus);
    setPage(1);
    setFiltersOpen(false);
  };

  const handleClearFilters = () => {
    setJobUrgency("all");
    setJobStatus("all");
    setAppliedJobUrgency("all");
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
            <div className="flex flex-wrap items-center gap-3">
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
            </div>
          </div>

          <Summary counts={counts} loading={statsLoading} />

          <div
            className="bg-white rounded-2xl overflow-hidden"
            style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-3">
              <h2 className="text-base font-semibold text-gray-900">Jobs list</h2>
              <TabToolbarFilterViewToggle
                view={view}
                onViewChange={setView}
                onFilterClick={() => setFiltersOpen(true)}
              />
            </div>

            <JobsFiltersModal
              open={filtersOpen}
              jobUrgency={jobUrgency}
              jobStatus={jobStatus}
              onJobUrgencyChange={setJobUrgency}
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