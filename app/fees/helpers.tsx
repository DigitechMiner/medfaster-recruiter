import type {
  ExperienceJobTitleFee,
  ExperienceTierRate,
  FeesSummaryData,
} from "@/features/jobs";
import type { LucideIcon } from "lucide-react";
import { Layers, Zap } from "lucide-react";

export type FeesTabKey = "default" | "instant";

export const FEES_TABS: {
  key: FeesTabKey;
  label: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    key: "default",
    label: "Standard Jobs",
    description: "Hourly rate by experience. Use the info icon for the full job title.",
    icon: Layers,
  },
  {
    key: "instant",
    label: "Instant Jobs",
    description: "Flat hourly rate for each instant job",
    icon: Zap,
  },
];

export function formatHourlyRate(amount: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function isStandardFees(
  data: FeesSummaryData | null,
): data is Extract<FeesSummaryData, { scope: "default" }> {
  return data?.scope === "default";
}

export function isInstantFees(
  data: FeesSummaryData | null,
): data is Extract<FeesSummaryData, { scope: "instant" }> {
  return data?.scope === "instant";
}

export function getRateForLevel(
  jobTitle: ExperienceJobTitleFee,
  levelId: number,
): ExperienceTierRate | null {
  return jobTitle.rates.find((item) => item.experience_level_id === levelId) ?? null;
}

export function countDiscountedTiers(jobs: ExperienceJobTitleFee[]): number {
  return jobs.reduce(
    (total, job) => total + job.rates.filter((rate) => rate.discount_per_hour > 0).length,
    0,
  );
}

export function filterFeeJobs<T extends { short_label: string; label: string }>(
  jobs: T[],
  query: string,
): T[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return jobs;
  return jobs.filter((job) => {
    return (
      job.short_label.toLowerCase().includes(normalized) ||
      job.label.toLowerCase().includes(normalized)
    );
  });
}
