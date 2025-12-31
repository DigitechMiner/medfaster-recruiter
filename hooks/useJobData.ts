import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useJobsStore } from '@/stores/jobs-store';
import type { JobBackendResponse, JobsListResponse, JobsData, Job, StatusType } from '@/Interface/job.types';
import { apiRequest } from '@/stores/api/api-client';
import metadata from '@/utils/constant/metadata';

// Create a type for the list items
type JobListItem = JobsListResponse['data']['jobs'][0];

// ============ NEW REAL API HOOKS ============
// Job list hook with pagination
export function useJobs(params?: {
  status?: 'draft' | 'published' | 'closed' | 'archived';
  page?: number;
  limit?: number;
}) {
  const getJobs = useJobsStore((state) => state.getJobs);
  const [jobs, setJobs] = useState<JobListItem[]>([]); // Changed from JobBackendResponse[]
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
  }, [params, getJobs]);

  return { jobs, pagination, isLoading, error };
}

// Single job hook
export function useJob(jobId: string | null) {
  const getJob = useJobsStore((state) => state.getJob);
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
        const response = await getJob(jobId);
        
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
  }, [jobId, getJob]);

  return { job, isLoading, error };
}

// Delete job hook
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

        // ✅ Real API calls with fallback to metadata defaults
        const [profileRes, workExpRes, appsRes] = await Promise.allSettled([
          apiRequest(`/recruiter/candidates/${candidateId}/profile`).catch(() => ({})),
          apiRequest(`/recruiter/candidates/${candidateId}/work-experience`).catch(() => ({})),
          apiRequest(`/recruiter/candidates/${candidateId}/applications`).catch(() => ({})),
        ]);

        const profile = (profileRes as any).data || {};
        const workExp = (workExpRes as any).data || {};
        const apps = (appsRes as any).data || {};

        // ✅ Transform using your metadata defaults
        setCandidate({
          job: {
            id: parseInt(candidateId.split('-')[0], 16) || 1,
            doctorName: profile.name || profile.full_name || metadata.job_title[0],
            experience: parseInt(workExp.total_years) || parseInt(metadata.experience[3]?.split('-')[1]) || 3, // "3-5 Yrs" → 3
            position: apps.job_title || profile.current_position || metadata.job_title[0],
            score: profile.completion_percentage || profile.score || 75, // Default 75%
            specialization: profile.specializations || profile.qualifications || metadata.specialization.slice(0, 3),
            currentCompany: profile.current_company || apps.recruiter_name || metadata.organization_type[0],
          },
          status: (apps.status as StatusType) || 'applied',
        });
      } catch (err) {
        console.error('Candidate fetch failed:', err);
        setError('Failed to load candidate profile');
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
