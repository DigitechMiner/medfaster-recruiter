import type {
  ExperienceJobTitleFee,
  ExperienceTierRate,
  FeeExperienceLevel,
  FeesDefaultSection,
  FeesInstantSection,
  FeesSummaryData,
  InstantJobTitleFee,
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
    description:
      "Experience-tiered rates showing platform pricing and your effective rate, including any recruiter discounts",
    icon: Layers,
  },
  {
    key: "instant",
    label: "Instant Jobs",
    description: "Flat platform rates for instant jobs (no experience tiers)",
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

export function formatExperienceRange(level: FeeExperienceLevel): string {
  if (level.max_years == null) {
    return `${level.min_years}+ yrs`;
  }
  if (level.min_years === level.max_years) {
    return `${level.min_years} yrs`;
  }
  return `${level.min_years}–${level.max_years} yrs`;
}

export function getDefaultSection(data: FeesSummaryData | null): FeesDefaultSection | null {
  return data?.default ?? null;
}

export function getInstantSection(data: FeesSummaryData | null): FeesInstantSection | null {
  return data?.instant ?? null;
}

export function sortExperienceLevels(
  levels: FeeExperienceLevel[] | undefined,
): FeeExperienceLevel[] {
  if (!levels?.length) return [];
  return [...levels].sort((a, b) => a.min_years - b.min_years || a.id - b.id);
}

export function getRateForLevel(
  jobTitle: ExperienceJobTitleFee,
  levelId: number,
): ExperienceTierRate | null {
  return jobTitle.rates.find((item) => item.experience_level_id === levelId) ?? null;
}

export function getInstantJobLabel(job: InstantJobTitleFee): string {
  return job.job_title_label ?? job.job_title_value.replace(/_/g, " ");
}

export function getExperienceJobLabel(job: ExperienceJobTitleFee): string {
  return job.job_title_label ?? job.job_title_value.replace(/_/g, " ");
}

export function countDiscountedTiers(jobs: ExperienceJobTitleFee[]): number {
  return jobs.reduce(
    (total, job) => total + job.rates.filter((rate) => rate.has_recruiter_discount).length,
    0,
  );
}
