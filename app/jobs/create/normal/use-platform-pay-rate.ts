"use client";

import { useEffect } from "react";
import { axiosInstance } from "@/stores/api/api-client";
import { ENDPOINTS } from "@/stores/api/api-endpoints";
import { useJobsStore, type JobFormSnapshot } from "@/stores/jobs-store";
import type { JobFormData } from "@/types";

export function getCachedPayRateCents(jobTitle: string): number | null {
  const snapshot = useJobsStore.getState().formSnapshot;
  const cachedPayRate = snapshot?.cachedPayRate;

  if (
    cachedPayRate?.jobTitle === jobTitle &&
    typeof cachedPayRate.cents === "number"
  ) {
    return cachedPayRate.cents;
  }

  return null;
}

/** Loads platform pay rate into form state when missing (e.g. on scheduling step). */
export function useSyncBackendPayRate(
  formData: Pick<JobFormData, "job_type" | "job_title" | "backend_pay_rate">,
  updateFormData: (updates: Partial<JobFormData>) => void,
) {
  const isPartTime = formData.job_type === "part_time";
  const jobTitle = formData.job_title;
  const backendPayRate = formData.backend_pay_rate;

  useEffect(() => {
    if (!isPartTime || !jobTitle || backendPayRate != null) return;

    const cachedRateCents = getCachedPayRateCents(jobTitle);
    if (cachedRateCents !== null) {
      const dollars = cachedRateCents / 100;
      if (backendPayRate !== dollars) {
        updateFormData({ backend_pay_rate: dollars });
      }
      return;
    }

    let didCancel = false;

    axiosInstance
      .get(ENDPOINTS.JOBS_FEES(jobTitle))
      .then((res) => {
        if (didCancel) return;
        const dollars = Number(
          res.data?.data?.recruiter_pay_per_hour ??
            res.data?.recruiter_pay_per_hour ??
            0,
        );
        const cents = Math.round(dollars * 100);
        updateFormData({ backend_pay_rate: cents / 100 });

        const currentSnapshot = useJobsStore.getState().formSnapshot;
        useJobsStore.getState().setFormSnapshot({
          ...(currentSnapshot ?? {}),
          cachedPayRate: { jobTitle, cents },
        } as JobFormSnapshot);
      })
      .catch(() => {
        /* basic step shows fetch errors; scheduling keeps placeholder */
      });

    return () => {
      didCancel = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- updateFormData is unstable; guarded above
  }, [isPartTime, jobTitle, backendPayRate]);
}
