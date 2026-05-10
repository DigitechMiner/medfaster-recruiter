//useRecruiterData.ts

'use client';

import { useState, useEffect, useCallback } from 'react';
import { getCandidatesList, inviteCandidate } from '@/features/candidates';
import type {
  CandidatesListParams,
  CandidatesListResponse,
  InviteCandidatePayload,
  InviteCandidateResponse,
} from '@/types';

// ─── Candidates List ───────────────────────────────────────────────────────────
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
// ─── Invite Candidate ─────────────────────────────────────────────────────────
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