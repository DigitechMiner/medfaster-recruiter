"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getProvinceTaxes } from "@/features/jobs";
import type { ProvinceTaxesData } from "@/types";

const provinceTaxCache = new Map<string, ProvinceTaxesData>();

export function clearProvinceTaxCache(province?: string): void {
  const trimmed = province?.trim();
  if (trimmed) {
    provinceTaxCache.delete(trimmed);
    return;
  }

  provinceTaxCache.clear();
}

export function useProvinceTaxes(province?: string, enabled = true) {
  const [data, setData] = useState<ProvinceTaxesData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const forceRefreshRef = useRef(false);

  const refresh = useCallback(() => {
    const trimmed = province?.trim();
    if (!enabled || !trimmed) return;

    clearProvinceTaxCache(trimmed);
    forceRefreshRef.current = true;
    setRefreshNonce((nonce) => nonce + 1);
  }, [enabled, province]);

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

    const forceRefresh = forceRefreshRef.current;
    forceRefreshRef.current = false;

    if (!forceRefresh) {
      const cached = provinceTaxCache.get(trimmed);
      if (cached) {
        setData(cached);
        setError(null);
        setLoading(false);
        return;
      }
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
  }, [enabled, province, refreshNonce]);

  return { data, loading, error, refresh };
}
