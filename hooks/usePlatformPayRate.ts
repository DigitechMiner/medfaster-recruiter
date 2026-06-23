"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getJobFees } from "@/features/jobs";
import {
  cacheJobPayRate,
  canFetchInstantJobFees,
  canFetchNormalJobFees,
  clearCachedPayRate,
  getCachedPayRateCents,
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

  const [payRateCents, setPayRateCents] = useState<number | null>(() => {
    if (!canFetch) return null;

    if (feeType === "instant") {
      return getCachedPayRateCents(trimmedTitle, "instant");
    }

    return getCachedPayRateCents(
      trimmedTitle,
      "normal",
      experienceYears ?? undefined,
    );
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const forceRefreshRef = useRef(false);

  const refresh = useCallback(() => {
    if (!canFetch) return;

    clearCachedPayRate();
    forceRefreshRef.current = true;
    setRefreshNonce((nonce) => nonce + 1);
  }, [canFetch]);

  useEffect(() => {
    if (!enabled || !canFetch) {
      setPayRateCents(null);
      setError(null);
      setLoading(false);
      return;
    }

    const forceRefresh = forceRefreshRef.current;
    forceRefreshRef.current = false;

    if (!forceRefresh) {
      if (feeType === "instant") {
        const cachedRateCents = getCachedPayRateCents(trimmedTitle, "instant");
        if (cachedRateCents !== null) {
          setPayRateCents(cachedRateCents);
          setError(null);
          setLoading(false);
          return;
        }
      } else {
        const cachedRateCents = getCachedPayRateCents(
          trimmedTitle,
          "normal",
          experienceYears as number,
        );
        if (cachedRateCents !== null) {
          setPayRateCents(cachedRateCents);
          setError(null);
          setLoading(false);
          return;
        }
      }
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

        if (feeType === "instant") {
          cacheJobPayRate(trimmedTitle, "instant", cents);
        } else {
          cacheJobPayRate(
            trimmedTitle,
            "normal",
            cents,
            experienceYears as number,
          );
        }
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
