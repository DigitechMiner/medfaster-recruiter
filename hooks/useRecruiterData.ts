//useRecruiterData.ts

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getCandidateSummary,
  getCandidatesList,
  inviteCandidate,
} from '@/stores/api/recruiter-candidates-api';
import type {
  CandidateSummaryData,
  CandidatesListParams,
  CandidatesListResponse,
  InviteCandidatePayload,
  InviteCandidateResponse,
} from '@/Interface/recruiter.types';

// ─── Generic async hook factory ───────────────────────────────────────────────
function useAsyncData<T>(
  fetcher: () => Promise<{ success: boolean; data: T; message?: string }>,
  deps: unknown[] = []
) {
  const [data,      setData]      = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  const run = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetcher();
      if (res.success) setData(res.data);
      else             setError(res.message ?? 'Request failed');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { run(); }, [run]);

  return { data, isLoading, error, refetch: run };
}

// ─── 1. Candidate Summary ─────────────────────────────────────────────────────
export function useCandidatesSummary() {
  const { data, isLoading, error, refetch } =
    useAsyncData<CandidateSummaryData>(getCandidateSummary);
  return { summary: data, isLoading, error, refetch };
}
// Alias — some components import without the "s"
export const useCandidateSummary = useCandidatesSummary;
// ─── 2. Candidates List ───────────────────────────────────────────────────────
// Returns { data } shape — components do: data?.data.candidates ?? []
export function useCandidatesList(params?: CandidatesListParams) {
  const [data,      setData]      = useState<CandidatesListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  const stableKey = JSON.stringify(params ?? {});

  const run = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getCandidatesList(params);
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load candidates');
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stableKey]);

  useEffect(() => { run(); }, [run]);

  return { data, isLoading, error, refetch: run };
}
// ─── 3. Invite Candidate ──────────────────────────────────────────────────────
export function useInviteCandidate() {
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const invite = useCallback(async (
    payload: InviteCandidatePayload
  ): Promise<InviteCandidateResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      return await inviteCandidate(payload);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Invite failed';
      setError(msg);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { invite, isLoading, error };
}