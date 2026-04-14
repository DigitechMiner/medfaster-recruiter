'use client';

import { useState, useEffect } from 'react';
import {
  getCandidatesList,
  getCandidateDetails,
  updateApplicationStatus,
  CandidatesListResponse,
  CandidateDetailsResponse,
  ApplicationStatus,
} from '@/stores/api/recruiter-job-api';
import {
  STATIC_CANDIDATES_MAP,  // ✅ import the map, not just STATIC_CANDIDATE
  STATIC_CANDIDATES,
} from '@/app/candidates/[id]/constants/staticData';


export function useCandidatesList(params?: Parameters<typeof getCandidatesList>[0]) {
  const [data, setData] = useState<CandidatesListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    getCandidatesList(params)
      .then((res) => {
        // ✅ If API returns empty, inject static candidates
        if (!res?.candidates?.length) {
          setData({
            candidates: STATIC_CANDIDATES,
            pagination: {
              total: STATIC_CANDIDATES.length,
              page: 1,
              limit: 20,
              offset: 0,
              totalPages: 1,
              hasNextPage: false,
              hasPreviousPage: false,
            },
          });
        } else {
          setData(res);
        }
      })
      .catch(() => {
        // ✅ On API error, also fall back to static
        setData({
          candidates: STATIC_CANDIDATES,
          pagination: {
            total: STATIC_CANDIDATES.length,
            page: 1,
            limit: 20,
            offset: 0,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        });
      })
      .finally(() => setIsLoading(false));
  }, [params?.job_id, params?.page, params?.interview]);

  return { data, isLoading, error };
}


export function useCandidateDetails(candidateId: string | null) {
  const [candidate, setCandidate] = useState<CandidateDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!candidateId) { setIsLoading(false); return; }

    // ✅ Bypass API entirely for static IDs — no network call made
    const staticMatch = STATIC_CANDIDATES_MAP[candidateId];
    if (staticMatch) {
      setCandidate(staticMatch);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    getCandidateDetails(candidateId)
      .then(setCandidate)
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [candidateId]);

  return { candidate, isLoading, error };
}


export function useUpdateApplicationStatus() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (applicationId: string, status: ApplicationStatus) => {
    try {
      setIsUpdating(true);
      setError(null);
      return await updateApplicationStatus(applicationId, status);
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setIsUpdating(false);
    }
  };

  return { update, isUpdating, error };
}