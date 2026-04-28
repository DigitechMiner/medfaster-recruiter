'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useJobsStore } from '@/stores/jobs-store';
import type { JobBackendResponse, JobsListResponse } from '@/Interface/recruiter.types';

import type { JobListItem } from '@/Interface/recruiter.types';
import { CandidateDetailsResponse } from '@/Interface/recruiter.types';
import { getCandidateDetails } from '@/stores/api/recruiter-candidates-api';
import { getJobApplications, JobApplicationListResponse } from '@/stores/api/recruiter-job-api';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/stores/api/api-client';
import { ENDPOINTS } from '@/stores/api/api-endpoints';
import { JobDetailHeaderVM } from '@/Interface/view-models';
import { fromJobBackendResponse } from '@/lib/transforms/job-detail.transform';


// ── Full status union matching the actual API ─────────────────────────────────
type JobStatus =
  | 'DRAFT' | 'OPEN' | 'PAUSED' | 'CLOSED'
  | 'UPCOMING' | 'ACTIVE' | 'COMPLETED';

// ─── useJobs ──────────────────────────────────────────────────────────────────
export function useJobs(params?: {
  status?:      JobStatus;
  job_urgency?: 'instant' | 'normal';
  page?:        number;
  limit?:       number;
}) {
  const getJobs = useJobsStore((state) => state.getJobs);
  const [jobs,       setJobs]       = useState<JobListItem[]>([]);
  const [pagination, setPagination] = useState<JobsListResponse['data']['pagination'] | null>(null);
  const [isLoading,  setIsLoading]  = useState(true);
  const [error,      setError]      = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getJobs(params)
      .then((res) => {
        if (cancelled) return;
        if (res.success) {
          setJobs(res.data.jobs);
          setPagination(res.data.pagination);
        } else {
          setError(res.message);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to fetch jobs');
      })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.status, params?.job_urgency, params?.page, params?.limit]);

  return { jobs, pagination, isLoading, error };
}

// ─── useJob (single job by ID) ────────────────────────────────────────────────
export function useJob(jobId: string | null) {
  const getJob = useJobsStore(useCallback((state) => state.getJob, []));
  const [job,       setJob]       = useState<JobBackendResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) { setIsLoading(false); return; }
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    getJob(jobId)
      .then((res) => {
        if (cancelled) return;
        if (res.success) setJob(res.data.job);
        else             setError(res.message);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to fetch job');
      })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [jobId, getJob]);

  return { job, isLoading, error };
}

// ─── useDeleteJob ─────────────────────────────────────────────────────────────
export function useDeleteJob() {
  const deleteJobFromStore = useJobsStore((state) => state.deleteJob);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const deleteJob = async (jobId: string): Promise<boolean> => {
    try {
      setIsDeleting(true);
      setError(null);
      const res = await deleteJobFromStore(jobId);
      if (res.success) return true;
      setError(res.message);
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete job');
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteJob, isDeleting, error };
}

// ─── useCandidate (single candidate detail) ───────────────────────────────────
export function useCandidate(candidateId: string | null) {
  const [candidate, setCandidate] = useState<CandidateDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!candidateId) { setIsLoading(false); return; }
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    getCandidateDetails(candidateId)
      .then((data) => { if (!cancelled) setCandidate(data); })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.message ?? 'Candidate not found');
          setCandidate(null);
        }
      })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [candidateId]);

  return { candidate, isLoading, error };
}

// ─── useJobApplications ───────────────────────────────────────────────────────
export function useJobApplications(params?: {
  job_id?:  string;
  status?:  'APPLIED' | 'SHORTLISTED' | 'INTERVIEWING' | 'INTERVIEWED' | 'HIRE' | 'REJECTED' | 'ACCEPTED' | 'CANCELLED';
  page?:    number;
  limit?:   number;
}) {
  const [applications, setApplications] = useState<JobApplicationListResponse | null>(null);
  const [isLoading,    setIsLoading]    = useState(true);
  const [error,        setError]        = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getJobApplications(params ?? {})
      .then((data) => { if (!cancelled) setApplications(data); })
      .catch((err) => {
        if (!cancelled)
          setError(err?.response?.data?.message ?? err?.message ?? 'Failed to load applications');
      })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [params?.job_id, params?.status, params?.page, params?.limit]);

  return { applications, isLoading, error };
}

// ─── useJobId (Next.js route param helper) ────────────────────────────────────
export function useJobId(): string | null {
  const params = useParams();
  const jobId  = params?.id;
  if (!jobId) return null;
  return typeof jobId === 'string' ? jobId : String(jobId);
}

// ─── useJobDetail (transformed — use this in JobDetailHeader) ─────────────────
export function useJobDetail(jobId: string | null) {
  // Fetch job
  const { data: jobData, isLoading: jobLoading } = useQuery({
    queryKey: ["job-detail", jobId],
    queryFn:  () => apiRequest<{ data: { job: JobBackendResponse } }>(
      ENDPOINTS.JOBS_DETAIL(jobId!), { method: "GET" }
    ),
    enabled: !!jobId,
  });

  // Fetch specialization map — cached forever in session (metadata never changes)
  const { data: specData } = useQuery({
    queryKey: ["common-specializations"],
    queryFn:  () => apiRequest<{ data: { id: string; name: string }[] }>(
      ENDPOINTS.COMMON_SPECIALIZATIONS, { method: "GET" }
    ),
    staleTime: Infinity,
  });

  const specializationMap: Record<string, string> = Object.fromEntries(
    (specData?.data ?? []).map((s) => [s.id, s.name])
  );

  const header: JobDetailHeaderVM | null = jobData?.data?.job
    ? fromJobBackendResponse(jobData.data.job, specializationMap)
    : null;

  return { header, isLoading: jobLoading };
}