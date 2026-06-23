"use client";

import { useEffect, useState } from "react";
import { getProvinceTaxes } from "@/features/jobs";
import type { ProvinceTaxesData } from "@/types";

const provinceTaxCache = new Map<string, ProvinceTaxesData>();

export function useProvinceTaxes(province?: string, enabled = true) {
  const [data, setData] = useState<ProvinceTaxesData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    const trimmed = province?.trim();
    if (!trimmed) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    const cached = provinceTaxCache.get(trimmed);
    if (cached) {
      setData(cached);
      setError(null);
      setLoading(false);
      return;
    }

    let didCancel = false;
    setLoading(true);
    setError(null);

    getProvinceTaxes(trimmed)
      .then((result) => {
        if (!didCancel) {
          provinceTaxCache.set(trimmed, result);
          setData(result);
        }
      })
      .catch(() => {
        if (!didCancel) {
          setError("Could not load tax information");
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
  }, [enabled, province]);

  return { data, loading, error };
}
