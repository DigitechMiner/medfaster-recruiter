"use client";

import { CalendarDays, UserCheck, Users } from "lucide-react";
import { useJobWorkers } from "@/hooks/useJobData";
import { EmptyState, LoadingRows } from "./JobDetailDataView";
import { formatDate, formatLabel } from "./job-detail-helpers";

type WorkforceTabProps = {
  jobId: string;
  enabled?: boolean;
};

function getWorkerName(worker: {
  candidate?: {
    full_name?: string;
    first_name?: string;
    last_name?: string;
  } | null;
}) {
  const candidate = worker.candidate;
  if (!candidate) return "Worker";
  if (candidate.full_name?.trim()) return candidate.full_name.trim();
  const name = [candidate.first_name, candidate.last_name]
    .filter(Boolean)
    .join(" ");
  return name || "Worker";
}

export function WorkforceTab({ jobId, enabled = true }: WorkforceTabProps) {
  const { workers, isLoading, error } = useJobWorkers(jobId, enabled);
  const workerList = workers?.workers ?? [];

  if (isLoading) {
    return <LoadingRows count={4} />;
  }

  if (error) {
    return (
      <EmptyState title="Unable to load workforce" description={error} />
    );
  }

  if (workerList.length === 0) {
    return (
      <EmptyState
        title="No hired workers yet"
        description="Workers will appear here once candidates are hired and assigned to this job."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">Hired Workers</h3>
        <p className="text-xs text-gray-500">
          Active workforce assigned to this job
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {workerList.map((worker) => {
          const leaveCount = worker.leaves?.length ?? 0;
          const status = worker.status?.toUpperCase();
          const isActive = status === "ACTIVE";

          return (
            <article
              key={worker.id}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[#F4781B]">
                    <UserCheck size={18} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {getWorkerName(worker)}
                    </p>
                    <p className="truncate text-xs text-gray-400">
                      {worker.candidate_id.length > 14
                        ? `${worker.candidate_id.slice(0, 6)}…${worker.candidate_id.slice(-4)}`
                        : worker.candidate_id}
                    </p>
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                    isActive
                      ? "bg-green-50 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {formatLabel(worker.status)}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-500">
                {worker.start_date && (
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays size={12} />
                    Since {formatDate(worker.start_date)}
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <Users size={12} />
                  {leaveCount} leave{leaveCount === 1 ? "" : "s"}
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
