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
  JobFormData,
} from '@/Interface/recruiter.types';

// ✅ Covers both JobFormData and InstantJobFormData fields
// Dates serialized as ISO strings for safe plain-object storage in Zustand
export type JobFormSnapshot = Omit<JobFormData, 'fromDate' | 'tillDate'> & {
  fromDate?: string;
  tillDate?: string;
  // Instant-only fields
  amountPerHire?:     string;
  neighborhoodName?:  string;
  neighborhoodType?:  string;
  directNumber?:      string;
  physicalInterview?: string | boolean;
  // Cached backend-fetched pay rate — survives Back navigation
  cachedPayRateCents?: number;
};

interface JobsState {
  hasJobs:      boolean;
  isLoading:    boolean;
  error:        string | null;
  draftPayload: Partial<JobCreatePayload> | null;
  formSnapshot: JobFormSnapshot | null;
}

interface JobsActions {
  setHasJobs:      (hasJobs: boolean) => void;
  setLoading:      (loading: boolean) => void;
  setError:        (error: string | null) => void;
  setDraftPayload: (payload: Partial<JobCreatePayload> | null) => void;
  setFormSnapshot: (snapshot: JobFormSnapshot | null) => void;
  clearDraft:      () => void;

  getJobs:       (params?: GetJobsParams) => Promise<JobsListResponse>;
  getJobsSilent: (params?: GetJobsParams) => Promise<JobsListResponse>;
  getJob:        (jobId: string) => Promise<JobDetailResponse>;
  createJob:     (jobData: JobCreatePayload) => Promise<JobCreateResponse>;
  updateJob:     (jobId: string, jobData: JobUpdatePayload) => Promise<JobUpdateResponse>;
  deleteJob:     (jobId: string) => Promise<JobDeleteResponse>;
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
        hasJobs:      false,
        isLoading:    false,
        error:        null,
        draftPayload: null,
        formSnapshot: null,

        setHasJobs:  (hasJobs)  => set({ hasJobs }),
        setLoading:  (isLoading) => set({ isLoading }),
        setError:    (error)    => set({ error }),

        setDraftPayload: (payload) =>
          set((state) => ({
            draftPayload:
              payload === null
                ? null
                : { ...state.draftPayload, ...payload },
          })),

        setFormSnapshot: (snapshot) => set({ formSnapshot: snapshot }),

        // ✅ Wipe both draft and snapshot only after successful job post + payment
        clearDraft: () => set({ draftPayload: null, formSnapshot: null }),

        getJobs: async (params) =>
          runWithLoading(async () => {
            const response = await getRecruiterJobs(params);
            console.log("📋 raw jobs response:", JSON.stringify(response?.data?.jobs?.[0], null, 2));
            if (response.success && response.data?.jobs) {
              set({ hasJobs: response.data.jobs.length > 0 });
            }
            return response;
          }),

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