'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { axiosInstance } from '@/stores/api/api-client';
import { ENDPOINTS } from '@/stores/api/api-endpoints';
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
  
  /**
   * Get all jobs with pagination and filtering
   * @param params - Query parameters for filtering and pagination
   */
  getJobs: (params?: {
    status?: 'DRAFT' | 'OPEN' | 'PAUSED' | 'CLOSED';
    page?: number;
    limit?: number;
    offset?: number;
  }) => Promise<JobsListResponse>;
  
  /**
   * Get a single job by ID
   * @param jobId - UUID of the job
   */
  getJob: (jobId: string) => Promise<JobDetailResponse>;
  
  /**
   * Create a new job
   * @param jobData - Job creation payload
   */
  createJob: (jobData: JobCreatePayload) => Promise<JobCreateResponse>;
  
  /**
   * Update an existing job
   * @param jobId - UUID of the job
   * @param jobData - Job update payload
   */
  updateJob: (jobId: string, jobData: JobUpdatePayload) => Promise<JobUpdateResponse>;
  
  /**
   * Delete a job
   * @param jobId - UUID of the job
   */
  deleteJob: (jobId: string) => Promise<JobDeleteResponse>;
}

export type JobsStore = JobsState & JobsActions;

export const useJobsStore = create<JobsStore>()(
  devtools(
    (set) => ({
      hasJobs: false,
      isLoading: false,
      error: null,

      setHasJobs: (hasJobs) => set({ hasJobs }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      getJobs: async (params) => {
        set({ isLoading: true, error: null });
        try {
          const queryParams = new URLSearchParams();
          if (params?.status) queryParams.append('status', params.status);
          if (params?.page) queryParams.append('page', params.page.toString());
          if (params?.limit) queryParams.append('limit', params.limit.toString());
          if (params?.offset) queryParams.append('offset', params.offset.toString());

          const endpoint = queryParams.toString()
            ? `${ENDPOINTS.JOBS_LIST}?${queryParams.toString()}`
            : ENDPOINTS.JOBS_LIST;

          const response = await axiosInstance.get<JobsListResponse>(endpoint);

          if (response.data.success && response.data.data?.jobs) {
            set({ hasJobs: response.data.data.jobs.length > 0 });
          }

          return response.data;
        } catch (error) {
          const err = error as Error;
          set({ error: err.message });
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      getJob: async (jobId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axiosInstance.get<JobDetailResponse>(ENDPOINTS.JOBS_DETAIL(jobId));
          return response.data;
        } catch (error) {
          const err = error as Error;
          set({ error: err.message });
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      createJob: async (jobData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axiosInstance.post<JobCreateResponse>(ENDPOINTS.JOBS_CREATE, jobData);
          
          if (response.data.success) {
            set({ hasJobs: true });
          }
          
          return response.data;
        } catch (error) {
          const err = error as Error;
          set({ error: err.message });
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      updateJob: async (jobId, jobData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axiosInstance.patch<JobUpdateResponse>(ENDPOINTS.JOBS_UPDATE(jobId), jobData);
          return response.data;
        } catch (error) {
          const err = error as Error;
          set({ error: err.message });
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      deleteJob: async (jobId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axiosInstance.delete<JobDeleteResponse>(ENDPOINTS.JOBS_DELETE(jobId));
          
          // Note: We don't automatically update hasJobs here as we'd need to check all jobs
          // The component should handle this by refetching the jobs list
          
          return response.data;
        } catch (error) {
          const err = error as Error;
          set({ error: err.message });
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    { name: 'JobsStore' },
  ),
);
