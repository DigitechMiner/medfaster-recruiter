"use client";

import type { InstantJobTitleFee } from "@/features/jobs";
import { formatHourlyRate, getInstantJobLabel } from "../helpers";
import { CandidateShareBar, ConfiguredBadge, FeesEmptyState } from "./fees-ui";

type InstantFeesTableProps = {
  jobTitles: InstantJobTitleFee[];
  emptyMessage?: string;
};

export function InstantFeesTable({
  jobTitles,
  emptyMessage = "No instant job fees found",
}: InstantFeesTableProps) {
  if (jobTitles.length === 0) {
    return <FeesEmptyState title="No rates to show" description={emptyMessage} />;
  }

  return (
    <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
      {jobTitles.map((job) => (
        <article
          key={job.job_title_id}
          className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <p className="truncate font-semibold text-gray-900">{getInstantJobLabel(job)}</p>
              <p className="text-xs text-gray-400">Flat instant rate</p>
            </div>
            <ConfiguredBadge configured={job.configured} />
          </div>

          <div className="rounded-xl bg-gradient-to-br from-orange-50 to-white p-4 ring-1 ring-orange-100">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              Recruiter pay
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {formatHourlyRate(job.recruiter_pay_per_hour)}
              <span className="ml-1 text-sm font-medium text-gray-400">/hr</span>
            </p>
          </div>

          <CandidateShareBar percentage={job.candidate_percentage} />
        </article>
      ))}
    </div>
  );
}
