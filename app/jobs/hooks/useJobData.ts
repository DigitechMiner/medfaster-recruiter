import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { recruiterService } from '@/lib/api/recruiterService';
import type { JobBackendResponse, JobsListResponse, JobsData, Job, StatusType } from '@/Interface/job.types';

// Create a type for the list items
type JobListItem = JobsListResponse['data']['jobs'][0];

// ============ NEW REAL API HOOKS ============
// Job list hook with pagination
export function useJobs(params?: {
  status?: 'draft' | 'published' | 'closed' | 'archived';
  page?: number;
  limit?: number;
}) {
  const [jobs, setJobs] = useState<JobListItem[]>([]); // Changed from JobBackendResponse[]
  const [pagination, setPagination] = useState<JobsListResponse['data']['pagination'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await recruiterService.getJobs(params);
        
        if (response.success) {
          setJobs(response.data.jobs); // Now types match!
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
  }, [params]);

  return { jobs, pagination, isLoading, error };
}

// Single job hook
export function useJob(jobId: string | null) {
  const [job, setJob] = useState<JobBackendResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) {
      setIsLoading(false);
      return;
    }

    const fetchJob = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await recruiterService.getJob(jobId);
        
        if (response.success) {
          setJob(response.data.job);
        } else {
          setError(response.message);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch job');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  return { job, isLoading, error };
}

// Delete job hook
export function useDeleteJob() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteJob = async (jobId: string): Promise<boolean> => {
    try {
      setIsDeleting(true);
      setError(null);
      const response = await recruiterService.deleteJob(jobId);
      
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

// ============ OLD/LEGACY HOOKS (Keep for now) ============
// These are still using mock data - will be replaced later

export function useCandidates(status?: StatusType) {
  const [candidates, setCandidates] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // TODO: Replace with real API when candidates feature is ready
        setCandidates([]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch candidates');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCandidates();
  }, [status]);

  return { candidates, isLoading, error };
}

export function useAllCandidates() {
  const [candidatesData, setCandidatesData] = useState<JobsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllCandidates = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // TODO: Replace with real API when candidates feature is ready
        setCandidatesData({
          applied: [],
          shortlisted: [],
          interviewing: [],
          hired: [],
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch candidates');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllCandidates();
  }, []);

  return { candidatesData, isLoading, error };
}

export function useCandidate(candidateId: string | null) {
  const [candidate, setCandidate] = useState<{ job: Job; status: StatusType } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!candidateId) {
      setIsLoading(false);
      return;
    }

    const fetchCandidate = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // TODO: Replace with real API when candidates feature is ready
        setCandidate(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch candidate');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCandidate();
  }, [candidateId]);

  return { candidate, isLoading, error };
}

export function useJobId(): string | null {
  const params = useParams();
  const jobId = params?.id;

  if (!jobId) return null;

  return typeof jobId === "string" ? jobId : String(jobId);
}
