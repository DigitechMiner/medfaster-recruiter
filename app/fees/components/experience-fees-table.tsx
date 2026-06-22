"use client";

import type { ExperienceJobTitleFee, FeeExperienceLevel } from "@/features/jobs";
import {
  formatExperienceRange,
  formatHourlyRate,
  getExperienceJobLabel,
  getRateForLevel,
} from "../helpers";
import { CustomRateBadge, ExperienceRateTier, FeesEmptyState } from "./fees-ui";

type ExperienceFeesCardsProps = {
  jobTitles: ExperienceJobTitleFee[];
  experienceLevels: FeeExperienceLevel[];
  emptyMessage?: string;
};

export function ExperienceFeesCards({
  jobTitles,
  experienceLevels,
  emptyMessage = "No job title fees found",
}: ExperienceFeesCardsProps) {
  if (jobTitles.length === 0) {
    return <FeesEmptyState title="No rates to show" description={emptyMessage} />;
  }

  return (
    <div className="grid gap-4 p-5">
      {jobTitles.map((job) => {
        const tiersWithRates = experienceLevels
          .map((level) => {
            const rate = getRateForLevel(job, level.id);
            if (!rate) return null;
            return { level, rate };
          })
          .filter((item): item is NonNullable<typeof item> => item !== null);

        return (
          <article
            key={job.job_title_id}
            className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 bg-gradient-to-r from-orange-50/40 to-white px-5 py-4">
              <div className="min-w-0 space-y-1">
                <p className="font-semibold text-gray-900">{getExperienceJobLabel(job)}</p>
                <p className="text-xs text-gray-400">
                  {tiersWithRates.length} experience tier{tiersWithRates.length === 1 ? "" : "s"}
                </p>
              </div>
              {job.has_recruiter_specific_rates && <CustomRateBadge />}
            </div>

            <div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-3">
              {tiersWithRates.map(({ level, rate }) => (
                <ExperienceRateTier
                  key={level.id}
                  tierLabel={level.name}
                  tierRange={formatExperienceRange(level)}
                  rate={rate}
                  formatHourlyRate={formatHourlyRate}
                />
              ))}
            </div>
          </article>
        );
      })}
    </div>
  );
}
