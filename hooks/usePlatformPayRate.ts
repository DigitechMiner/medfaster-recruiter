"use client";

import { useCallback, useEffect, useState } from "react";
import { getJobFees } from "@/features/jobs";
import {
  canFetchInstantJobFees,
  canFetchNormalJobFees,
  parseJobFeesYears,
} from "@/app/jobs/create/normal/use-platform-pay-rate";

interface UsePlatformPayRateOptions {
  feeType: "instant" | "normal";
  jobTitle?: string;
  yearsOfExperience?: string;
  enabled?: boolean;
}

export function usePlatformPayRate({
  feeType,
  jobTitle,
  yearsOfExperience,
  enabled = true,
}: UsePlatformPayRateOptions) {
  const trimmedTitle = jobTitle?.trim() ?? "";
  const experienceYears = parseJobFeesYears(yearsOfExperience);

  const canFetch =
    feeType === "instant"
      ? canFetchInstantJobFees(trimmedTitle)
      : canFetchNormalJobFees(trimmedTitle, yearsOfExperience);

  const [payRateCents, setPayRateCents] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshNonce, setRefreshNonce] = useState(0);

  const refresh = useCallback(() => {
    if (!canFetch) return;
    setRefreshNonce((nonce) => nonce + 1);
  }, [canFetch]);

  useEffect(() => {
    if (!enabled || !canFetch) {
      setPayRateCents(null);
      setError(null);
      setLoading(false);
      return;
    }

    let didCancel = false;
    setLoading(true);
    setError(null);

    const feesPromise =
      feeType === "instant"
        ? getJobFees(trimmedTitle, { feeType: "instant" })
        : getJobFees(trimmedTitle, {
            feeType: "normal",
            yearsOfExperience: experienceYears as number,
          });

    feesPromise
      .then((data) => {
        if (didCancel) return;

        const dollars = Number(data.recruiter_pay_per_hour ?? 0);
        const cents = Math.round(dollars * 100);
        setPayRateCents(cents);
      })
      .catch(() => {
        if (!didCancel) {
          setError("Could not load pay rate for this role");
        }
      })
      .finally(() => {
        if (!didCancel) {
          setLoading(false);
        }
      });

    return () => {
      didCancel = true;
    };
  }, [
    canFetch,
    enabled,
    experienceYears,
    feeType,
    refreshNonce,
    trimmedTitle,
    yearsOfExperience,
  ]);

  return {
    payRateCents,
    payRateLoading: loading,
    payRateError: error,
    refreshPayRate: refresh,
    canRefreshPayRate: canFetch,
  };
}
