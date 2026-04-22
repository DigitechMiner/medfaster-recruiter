'use client';

import { useState, useEffect } from 'react';
import {
  getCandidatesList,
  getCandidateDetails,
  updateApplicationStatus,
  type CandidatesListResponse,
  type CandidateDetailsResponse,
  type ApplicationStatus,
} from '@/stores/api/recruiter-job-api';

export function useCandidatesList(params?: Parameters<typeof getCandidatesList>[0]) {
  const [data,      setData]      = useState<CandidatesListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getCandidatesList(params)
      .then((res) => {
        if (cancelled) return;
        setData(res);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e?.message ?? 'Failed to load candidates');
      })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [
    params?.page,
    params?.limit,
    params?.job_id,
    params?.interview,
  ]);

  return { data, isLoading, error };
}

export function useCandidateDetails(candidateId: string | null) {
  const [candidate, setCandidate] = useState<CandidateDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!candidateId) { setIsLoading(false); return; }
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    getCandidateDetails(candidateId)
      .then((res) => { if (!cancelled) setCandidate(res); })
      .catch((e)  => { if (!cancelled) setError(e?.message ?? 'Candidate not found'); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [candidateId]);

  return { candidate, isLoading, error };
}

export function useUpdateApplicationStatus() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const update = async (applicationId: string, status: ApplicationStatus) => {
    try {
      setIsUpdating(true);
      setError(null);
      return await updateApplicationStatus(applicationId, status);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Update failed';
      setError(msg);
      throw e;
    } finally {
      setIsUpdating(false);
    }
  };

  return { update, isUpdating, error };
}