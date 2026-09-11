"use client";

import { useEffect } from "react";
import { getJobFees } from "@/features/jobs";
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
    Boolean(jobTitle?.trim()) &&
    parseJobFeesYears(yearsOfExperience) !== null
  );
}

export const canFetchJobFees = canFetchNormalJobFees;

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
    if (backendPayRate != null) {
      return;
    }

    let didCancel = false;

    getJobFees(jobTitle, { feeType: "normal", yearsOfExperience: experienceYears })
      .then((data) => {
        if (didCancel) return;
        const dollars = Number(data.recruiter_pay_per_hour ?? 0);
        const cents = Math.round(dollars * 100);
        updateFormData({ backend_pay_rate: cents / 100 });
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
