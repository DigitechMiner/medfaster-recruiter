"use client";

import { useEffect } from "react";
import { getJobFees } from "@/features/jobs";
import { useJobsStore, type JobFormSnapshot } from "@/stores/jobs-store";
import type { JobFormData } from "@/types";

export function parseJobFeesYears(yearsOfExperience?: string): number | null {
  const value = yearsOfExperience?.trim();
  if (!value || !/^\d+$/.test(value)) return null;

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function canFetchInstantJobFees(jobTitle?: string): boolean {
  return Boolean(jobTitle?.trim());
}

export function canFetchNormalJobFees(
  jobTitle?: string,
  yearsOfExperience?: string,
): boolean {
  return (
    Boolean(jobTitle?.trim()) && parseJobFeesYears(yearsOfExperience) !== null
  );
}

export const canFetchJobFees = canFetchNormalJobFees;

export function getCachedPayRateCents(
  jobTitle: string,
  feeType: "instant" | "normal",
  yearsOfExperience?: number,
): number | null {
  const cachedPayRate = useJobsStore.getState().formSnapshot?.cachedPayRate;

  if (
    cachedPayRate?.jobTitle === jobTitle &&
    cachedPayRate?.feeType === feeType &&
    typeof cachedPayRate.cents === "number" &&
    (feeType === "instant" ||
      cachedPayRate.yearsOfExperience === yearsOfExperience)
  ) {
    return cachedPayRate.cents;
  }

  return null;
}

export function cacheJobPayRate(
  jobTitle: string,
  feeType: "instant" | "normal",
  cents: number,
  yearsOfExperience?: number,
): void {
  const currentSnapshot = useJobsStore.getState().formSnapshot;
  useJobsStore.getState().setFormSnapshot({
    ...(currentSnapshot ?? {}),
    cachedPayRate: {
      jobTitle,
      feeType,
      ...(feeType === "normal" ? { yearsOfExperience } : {}),
      cents,
    },
  } as JobFormSnapshot);
}

export function shouldSyncPlatformPayRate(jobType?: string): boolean {
  return jobType === "part_time" || jobType === "full_time";
}

/** Loads platform pay rate into form state when missing (e.g. on scheduling step). */
export function useSyncBackendPayRate(
  formData: Pick<
    JobFormData,
    "job_type" | "job_title" | "backend_pay_rate" | "years_of_experience"
  >,
  updateFormData: (updates: Partial<JobFormData>) => void,
) {
  const shouldSync = shouldSyncPlatformPayRate(formData.job_type);
  const jobTitle = formData.job_title?.trim() ?? "";
  const yearsOfExperience = parseJobFeesYears(formData.years_of_experience);
  const backendPayRate = formData.backend_pay_rate;

  useEffect(() => {
    if (
      !shouldSync ||
      !canFetchNormalJobFees(jobTitle, formData.years_of_experience)
    ) {
      return;
    }

    const experienceYears = yearsOfExperience as number;
    const cachedRateCents = getCachedPayRateCents(
      jobTitle,
      "normal",
      experienceYears,
    );
    if (cachedRateCents !== null) {
      const dollars = cachedRateCents / 100;
      if (backendPayRate !== dollars) {
        updateFormData({ backend_pay_rate: dollars });
      }
      return;
    }

    let didCancel = false;

    getJobFees(jobTitle, { feeType: "normal", yearsOfExperience: experienceYears })
      .then((data) => {
        if (didCancel) return;
        const dollars = Number(data.recruiter_pay_per_hour ?? 0);
        const cents = Math.round(dollars * 100);
        updateFormData({ backend_pay_rate: cents / 100 });
        cacheJobPayRate(jobTitle, "normal", cents, experienceYears);
      })
      .catch(() => {
        /* basic step shows fetch errors; scheduling keeps placeholder */
      });

    return () => {
      didCancel = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- updateFormData is unstable; guarded above
  }, [shouldSync, jobTitle, yearsOfExperience, backendPayRate, formData.years_of_experience]);
}
