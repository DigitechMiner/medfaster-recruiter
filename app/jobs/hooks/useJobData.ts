import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { TopJob, JobsData, Job, StatusType } from '@/Interface/job.types';
import JobService from '../services/jobService';
import { JobDetailsData } from '../data/job-details';

export function useJobs() {
  const [jobs, setJobs] = useState<TopJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await JobService.getAllJobs();
        setJobs(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch jobs');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  return { jobs, isLoading, error };
}

export function useJob(jobId: number | null) {
  const [job, setJob] = useState<TopJob | null>(null);
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
        const data = await JobService.getJobById(jobId);
        setJob(data);
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

export function useJobDetails(jobId: number | null) {
  const [jobDetails, setJobDetails] = useState<JobDetailsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) {
      setIsLoading(false);
      return;
    }

    const fetchJobDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await JobService.getJobDetails(jobId);
        setJobDetails(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch job details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId]);

  return { jobDetails, isLoading, error };
}

export function useCandidates(status?: StatusType) {
  const [candidates, setCandidates] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = status
          ? await JobService.getCandidatesByStatus(status)
          : await JobService.getAllCandidates();
        setCandidates(Array.isArray(data) ? data : []);
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
        const data = await JobService.getAllCandidates();
        setCandidatesData(data);
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
        const data = await JobService.getCandidateById(candidateId);
        setCandidate(data);
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

export function useJobId(): number | null {
  const params = useParams();
  const jobId = params?.id;

  if (!jobId) return null;

  return typeof jobId === "string" ? parseInt(jobId, 10) : Number(jobId);
}

