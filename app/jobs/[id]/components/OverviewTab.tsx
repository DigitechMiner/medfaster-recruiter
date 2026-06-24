"use client";

import Link from "next/link";
import { Clock, UserCheck } from "lucide-react";
import { useJobWorkers } from "@/hooks/useJobData";
import type { JobDetailSummaryData } from "@/types";
import { ActivityTab } from "./ActivityTab";
import { EmptyState, LoadingRows } from "./JobDetailDataView";
import {
  formatDate,
  formatDateRange,
  formatLabel,
  formatTime,
} from "./job-detail-helpers";

type OverviewTabProps = {
  jobId: string;
  summary: JobDetailSummaryData;
  enabled?: boolean;
};

function WorkerProgressPreview({
  jobId,
  enabled,
  accepted,
  required,
}: {
  jobId: string;
  enabled: boolean;
  accepted: number;
  required: number;
}) {
  const { workers, isLoading, error } = useJobWorkers(jobId, enabled);
  const workerList = workers?.workers ?? [];

  if (isLoading) {
    return <LoadingRows count={2} />;
  }

  if (error) {
    return (
      <EmptyState title="Unable to load workers" description={error} />
    );
  }

  const fillPercent =
    required > 0 ? Math.round((accepted / required) * 100) : 0;

  return (
    <section className="rounded-xl border border-gray-200 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-gray-900">Worker progress</h3>
        <span className="text-xs font-semibold text-[#F4781B]">
          {accepted}/{required} filled ({fillPercent}%)
        </span>
      </div>

      <div className="mb-3 h-2 overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-[#F4781B] transition-all"
          style={{ width: `${Math.min(fillPercent, 100)}%` }}
        />
      </div>

      {workerList.length === 0 ? (
        <p className="text-sm text-gray-400">
          No workers hired yet. Progress updates as candidates are accepted.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {workerList.slice(0, 5).map((worker) => {
            const name =
              worker.candidate?.full_name?.trim() ||
              [worker.candidate?.first_name, worker.candidate?.last_name]
                .filter(Boolean)
                .join(" ") ||
              "Worker";

            return (
              <li
                key={worker.id}
                className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50/50 px-3 py-2 text-sm"
              >
                <UserCheck size={14} className="text-[#F4781B]" />
                <span className="font-medium text-gray-900">{name}</span>
                <span className="ml-auto text-xs text-gray-400">
                  {formatLabel(worker.status)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export function OverviewTab({
  jobId,
  summary,
  enabled = true,
}: OverviewTabProps) {
  const nextShift = summary.next_shift;

  return (
    <div className="flex flex-col gap-5">
      {nextShift && (
        <section className="rounded-xl border border-orange-100 bg-gradient-to-br from-orange-50/80 to-white p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white text-[#F4781B] shadow-sm">
              <Clock size={16} />
            </span>
            <div>
              <p className="text-xs font-medium text-gray-500">Next shift</p>
              <p className="mt-0.5 text-sm font-semibold text-gray-900">
                {nextShift.shift_name}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {formatDate(nextShift.shift_date)} ·{" "}
                {formatTime(nextShift.start_time)} –{" "}
                {formatTime(nextShift.end_time)}
              </p>
            </div>
          </div>
        </section>
      )}

      {!nextShift && (summary.start_date || summary.end_date) && (
        <section className="rounded-xl border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-500">Schedule</p>
          <p className="mt-0.5 text-sm font-semibold text-gray-900">
            {formatDateRange(summary.start_date, summary.end_date)}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {summary.total_shifts} total · {summary.completed_shifts} completed
          </p>
        </section>
      )}

      <WorkerProgressPreview
        jobId={jobId}
        enabled={enabled}
        accepted={summary.accepted}
        required={summary.required_workers}
      />

      <section className="rounded-xl border border-gray-200 p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-gray-900">
            Recent activity
          </h3>
          <Link
            href="?tab=activity"
            className="text-xs font-medium text-[#F4781B] hover:text-orange-600"
          >
            View all
          </Link>
        </div>
        <ActivityTab jobId={jobId} enabled={enabled} limit={5} />
      </section>
    </div>
  );
}
