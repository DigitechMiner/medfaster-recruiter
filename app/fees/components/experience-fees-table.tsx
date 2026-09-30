"use client";

import type { ExperienceJobTitleFee, FeeExperienceLevel } from "@/features/jobs";
import { formatHourlyRate, getRateForLevel } from "../helpers";
import { FeesEmptyState, JobTitleInfoButton } from "./fees-ui";

type ExperienceFeesTableProps = {
  jobTitles: ExperienceJobTitleFee[];
  experienceLevels: FeeExperienceLevel[];
  emptyMessage?: string;
};

export function ExperienceFeesTable({
  jobTitles,
  experienceLevels,
  emptyMessage = "No job title fees found",
}: ExperienceFeesTableProps) {
  if (jobTitles.length === 0 || experienceLevels.length === 0) {
    return <FeesEmptyState title="No rates to show" description={emptyMessage} />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-max border-collapse text-sm">
        <thead>
          <tr>
            <th className="sticky left-0 z-20 border-b border-r border-gray-100 bg-gray-50 px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 shadow-[4px_0_8px_-6px_rgba(0,0,0,0.2)]">
              Experience
            </th>
            {jobTitles.map((job) => (
              <th
                key={job.id}
                className="border-b border-gray-100 bg-gray-50 px-3 py-3 text-center"
              >
                <div className="inline-flex items-center justify-center gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-900">
                    {job.short_label}
                  </span>
                  {job.has_custom_rates && (
                    <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden />
                  )}
                  <JobTitleInfoButton label={job.label} hasCustomRates={job.has_custom_rates} />
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {experienceLevels.map((level, index) => {
            const rowBg = index % 2 === 0 ? "bg-white" : "bg-gray-50/70";
            return (
              <tr key={level.id}>
                <th
                  className={`sticky left-0 z-10 border-b border-r border-gray-100 px-4 py-3 text-left text-sm font-medium text-gray-900 shadow-[4px_0_8px_-6px_rgba(0,0,0,0.2)] ${rowBg}`}
                >
                  {level.name}
                </th>
                {jobTitles.map((job) => {
                  const rate = getRateForLevel(job, level.id);
                  return (
                    <td
                      key={job.id}
                      className={`border-b border-gray-100 px-3 py-3 text-center ${rowBg}`}
                    >
                      {rate ? (
                        <div className="whitespace-nowrap">
                          <p className="font-semibold text-gray-900">
                            {formatHourlyRate(rate.pay_per_hour)}
                          </p>
                          {rate.discount_per_hour > 0 && (
                            <p className="text-[11px] font-medium text-emerald-700">
                              Save {formatHourlyRate(rate.discount_per_hour)}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
