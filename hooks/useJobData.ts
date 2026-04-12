import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useJobsStore } from '@/stores/jobs-store';
import type { JobBackendResponse, JobsListResponse } from '@/Interface/job.types';
import { getCandidateDetails, CandidateDetailsResponse } from '@/stores/api/recruiter-job-api'
import { getJobApplications, JobApplicationListResponse } from "@/stores/api/recruiter-job-api";
// Create a type for the list items
type JobListItem = JobsListResponse['data']['jobs'][0];

// ============ EXISTING JOB HOOKS (Keep these - they work) ============
export function useJobs(params?: {
status?: 'DRAFT' | 'OPEN' | 'PAUSED' | 'CLOSED';
  page?: number;
  limit?: number;
}) {
  const getJobs = useJobsStore((state) => state.getJobs);
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [pagination, setPagination] = useState<JobsListResponse['data']['pagination'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getJobs(params);
        
        if (response.success) {
          setJobs(response.data.jobs);
          setPagination(response.data.pagination);
        } else {
          setError(response.message);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch jobs');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [params, getJobs]);

  return { jobs, pagination, isLoading, error };
}

export function useJob(jobId: string | null) {
  const getJob = useJobsStore(useCallback((state) => state.getJob, []));
  // ✅ useCallback prevents new reference on every render
  
  const [job, setJob] = useState<JobBackendResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) {
      setIsLoading(false);
      return;
    }

    let mounted = true;

    const fetchJob = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getJob(jobId);
        
        if (mounted) {
          if (response.success) {
            setJob(response.data.job);
          } else {
            setError(response.message);
          }
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch job');
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchJob();
    return () => { mounted = false; };
  }, [jobId, getJob]);

  return { job, isLoading, error };
}


export function useDeleteJob() {
  const deleteJobFromStore = useJobsStore((state) => state.deleteJob);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteJob = async (jobId: string): Promise<boolean> => {
    try {
      setIsDeleting(true);
      setError(null);
      const response = await deleteJobFromStore(jobId);
      
      if (response.success) {
        return true;
      } else {
        setError(response.message);
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete job');
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteJob, isDeleting, error };
}

// ============ NEW: CANDIDATE HOOKS (Real APIs) ============
// ✅ REAL API - Get full candidate details
export function useCandidate(candidateId: string | null) {
  const [candidate, setCandidate] = useState<CandidateDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCandidate() {
      if (!candidateId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const data = await getCandidateDetails(candidateId);
        setCandidate(data);
      } catch (err: any) {
        console.error('Failed to fetch candidate:', err);
        setError(err.message || 'Candidate not found');
        setCandidate(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCandidate();
  }, [candidateId]);

  return { candidate, isLoading, error };
}

// ✅ NEW: Get job applications (list of applicants)
export function useJobApplications(params?: {
  job_id?: string;
  status?: 'APPLIED' | 'SHORTLISTED' | 'INTERVIEW' | 'HIRE' | 'REJECTED' | 'ACCEPTED' | 'CANCELLED'
  page?: number;
  limit?: number;
}) {
  const [applications, setApplications] = useState<JobApplicationListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchApplications() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getJobApplications(params || {});
        if (isMounted) setApplications(data);
      } catch (err: unknown) {
        if (isMounted) {
          const e = err as { response?: { data?: { message?: string } }; message?: string };
          setError(e.response?.data?.message || 'Failed to load applications');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchApplications();
    return () => { isMounted = false; };
  }, [params?.job_id, params?.status, params?.page, params?.limit]); // ✅ already correct

  return { applications, isLoading, error };
}


export function useJobId(): string | null {
  const params = useParams();
  const jobId = params?.id;

  if (!jobId) return null;

  return typeof jobId === "string" ? jobId : String(jobId);
}
