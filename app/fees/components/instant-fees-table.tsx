"use client";

import type { InstantJobTitleFee } from "@/features/jobs";
import { formatHourlyRate } from "../helpers";
import { ConfiguredBadge, FeesEmptyState, JobTitleInfoButton } from "./fees-ui";

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
    <div className="overflow-x-auto">
      <table className="w-full min-w-[32rem] text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
            <th className="px-4 py-3 font-medium sm:px-5">Job title</th>
            <th className="px-4 py-3 text-right font-medium sm:px-5">Your rate</th>
            <th className="hidden px-4 py-3 text-right font-medium sm:table-cell sm:px-5">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {jobTitles.map((job) => (
            <tr key={job.id} className="border-b border-gray-50 last:border-0">
              <td className="px-4 py-3 sm:px-5">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold uppercase tracking-wide text-gray-900">
                    {job.short_label}
                  </span>
                  <JobTitleInfoButton label={job.label} />
                </div>
                <div className="mt-1 sm:hidden">
                  <ConfiguredBadge configured={job.configured} />
                </div>
              </td>
              <td className="px-4 py-3 text-right font-semibold text-gray-900 sm:px-5">
                {formatHourlyRate(job.pay_per_hour)}
                <span className="ml-1 text-xs font-medium text-gray-400">/hr</span>
              </td>
              <td className="hidden px-4 py-3 text-right sm:table-cell sm:px-5">
                <ConfiguredBadge configured={job.configured} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
