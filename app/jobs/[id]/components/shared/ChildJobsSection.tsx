"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useJobChildren } from "@/hooks/useJobData";
import type { JobDetailSummaryData } from "@/types";
import {
  EmptyState,
  LoadingRows,
  StatusBadge,
} from "./JobDetailDataView";
import {
  formatDateShort,
  formatLabel,
  formatTime,
} from "./job-detail-helpers";

type ChildJobsSectionProps = {
  jobId: string;
  enabled?: boolean;
  jobUrgency?: JobDetailSummaryData["job_urgency"];
  title?: string;
  emptyTitle?: string;
  emptyDescription?: string;
};

export function ChildJobsSection({
  jobId,
  enabled = true,
  jobUrgency,
  title,
  emptyTitle = "No instant shifts yet",
  emptyDescription = "Urgent or short-notice shifts linked to this job will appear here.",
}: ChildJobsSectionProps) {
  const [page, setPage] = useState(1);
  const limit = 10;
  const { children, isLoading, error } = useJobChildren(
    jobId,
    { page, limit },
    enabled,
  );
  const childJobs = children?.children ?? [];
  const pagination = children?.pagination;
  const total = pagination?.total ?? childJobs.length;
  const totalPages = pagination?.totalPages ?? 1;
  const currentPage = pagination?.page ?? page;
  const hasPreviousPage = pagination?.hasPreviousPage ?? currentPage > 1;
  const hasNextPage = pagination?.hasNextPage ?? currentPage < totalPages;
  const showPagination = totalPages > 1;
  const sectionTitle = title ?? "Instant shifts";

  if (isLoading) {
    return (
      <section className="rounded-xl border border-gray-200 p-4">
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-gray-900">{sectionTitle}</h3>
          <p className="mt-1 text-xs text-gray-500">
            Loading urgent and short-notice shifts for this job.
          </p>
        </div>
        <LoadingRows count={3} />
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-xl border border-gray-200 p-4">
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-gray-900">{sectionTitle}</h3>
        </div>
        <EmptyState
          title="Unable to load instant shifts"
          description={error}
        />
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-gray-200 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{sectionTitle}</h3>
          <p className="mt-1 text-xs text-gray-500">
            Urgent / short-notice shifts linked to this job. Open one to view
            full details.
          </p>
        </div>
        <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-[#F4781B]">
          {total}
        </span>
      </div>

      {childJobs.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <div className="flex flex-col gap-3">
          {childJobs.map((job) => {
            const requiredWorkers =
              job.required_workers ?? job.no_of_hires_required ?? null;
            const hiredWorkers =
              job.no_of_hires_hired ?? job.workforce_count ?? null;
            const hasSchedule = job.start_date || job.end_date;
            const hasTime = job.check_in_time && job.check_out_time;
            const location = [job.city, job.province]
              .filter(Boolean)
              .map((value) => formatLabel(value))
              .join(", ");

            return (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="group rounded-xl border border-gray-200 bg-white px-4 py-3 transition-colors hover:border-orange-200 hover:bg-orange-50/40"
              >
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {job.job_title}
                      </p>
                      <StatusBadge value={job.status} />
                      {job.job_urgency && (
                        <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600">
                          {formatLabel(job.job_urgency)}
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                      {job.department && <span>{job.department}</span>}
                      {location && <span>{location}</span>}
                      {hasSchedule && (
                        <span>
                          {formatDateShort(job.start_date)}
                          {job.end_date ? ` - ${formatDateShort(job.end_date)}` : ""}
                        </span>
                      )}
                      {hasTime && (
                        <span>
                          {formatTime(job.check_in_time)} - {formatTime(job.check_out_time)}
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-600">
                      {requiredWorkers !== null && (
                        <span>
                          Required: <span className="font-semibold">{requiredWorkers}</span>
                        </span>
                      )}
                      {hiredWorkers !== null && (
                        <span>
                          Hired: <span className="font-semibold">{hiredWorkers}</span>
                        </span>
                      )}
                      {job.application_count !== null &&
                        job.application_count !== undefined && (
                          <span>
                            Applications:{" "}
                            <span className="font-semibold">{job.application_count}</span>
                          </span>
                        )}
                    </div>
                  </div>

                  <span className="mt-0.5 text-gray-300 transition-colors group-hover:text-[#F4781B]">
                    <ArrowRight size={16} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {showPagination && (
        <div className="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-gray-500">
            Showing page{" "}
            <span className="font-semibold text-gray-700">{currentPage}</span>{" "}
            of <span className="font-semibold text-gray-700">{totalPages}</span>
            {total ? (
              <>
                {" "}
                · <span className="font-semibold text-gray-700">{total}</span>{" "}
                total
              </>
            ) : null}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={!hasPreviousPage || isLoading}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition-colors hover:border-orange-200 hover:text-[#F4781B] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft size={14} />
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((value) => value + 1)}
              disabled={!hasNextPage || isLoading}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition-colors hover:border-orange-200 hover:text-[#F4781B] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
