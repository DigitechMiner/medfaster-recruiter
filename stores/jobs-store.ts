'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  getRecruiterJobs,
  getRecruiterJob,
  createRecruiterJob,
  updateRecruiterJob,
  deleteRecruiterJob,
} from '@/stores/api/recruiter-job-api';
import type { GetJobsParams } from '@/stores/api/recruiter-job-api';
import type {
  JobsListResponse,
  JobDetailResponse,
  JobCreateResponse,
  JobUpdateResponse,
  JobDeleteResponse,
  JobCreatePayload,
  JobUpdatePayload,
} from '@/Interface/job.types';

interface JobsState {
  hasJobs: boolean;
  isLoading: boolean;
  error: string | null;
}

interface JobsActions {
  setHasJobs: (hasJobs: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Main fetch - sets isLoading (use for primary page loads)
  getJobs: (params?: GetJobsParams) => Promise<JobsListResponse>;

  // Silent fetch - no isLoading toggle (use for background/parallel fetches)
  getJobsSilent: (params?: GetJobsParams) => Promise<JobsListResponse>;

  getJob: (jobId: string) => Promise<JobDetailResponse>;
  createJob: (jobData: JobCreatePayload) => Promise<JobCreateResponse>;
  updateJob: (jobId: string, jobData: JobUpdatePayload) => Promise<JobUpdateResponse>;
  deleteJob: (jobId: string) => Promise<JobDeleteResponse>;
}

export type JobsStore = JobsState & JobsActions;

export const useJobsStore = create<JobsStore>()(
  devtools(
    (set) => {
      const runWithLoading = async <T>(operation: () => Promise<T>): Promise<T> => {
        set({ isLoading: true, error: null });
        try {
          return await operation();
        } catch (error) {
          const err = error as Error;
          set({ error: err.message });
          throw err;
        } finally {
          set({ isLoading: false });
        }
      };

      const runWithErrorOnly = async <T>(operation: () => Promise<T>): Promise<T> => {
        try {
          return await operation();
        } catch (error) {
          const err = error as Error;
          set({ error: err.message });
          throw err;
        }
      };

      return {
        hasJobs: false,
        isLoading: false,
        error: null,

        setHasJobs: (hasJobs) => set({ hasJobs }),
        setLoading: (isLoading) => set({ isLoading }),
        setError: (error) => set({ error }),

        getJobs: async (params) =>
          runWithLoading(async () => {
            const response = await getRecruiterJobs(params);
            if (response.success && response.data?.jobs) {
              set({ hasJobs: response.data.jobs.length > 0 });
            }
            return response;
          }),

        // No isLoading - safe for parallel calls, won't trigger re-renders
        getJobsSilent: async (params) =>
          runWithErrorOnly(async () => getRecruiterJobs(params)),

        getJob: async (jobId) =>
          runWithLoading(async () => getRecruiterJob(jobId)),

        createJob: async (jobData) =>
          runWithLoading(async () => {
            const response = await createRecruiterJob(jobData);
            if (response.success) set({ hasJobs: true });
            return response;
          }),

        updateJob: async (jobId, jobData) =>
          runWithLoading(async () => updateRecruiterJob(jobId, jobData)),

        deleteJob: async (jobId) =>
          runWithLoading(async () => deleteRecruiterJob(jobId)),
      };
    },
    { name: 'JobsStore' }
  )
);