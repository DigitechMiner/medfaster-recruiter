'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  getRecruiterJobs,
  getRecruiterJob,
  createRecruiterJob,
} from '@/features/jobs';
import type { GetJobsParams } from '@/features/jobs';
import type {
  JobsListResponse,
  JobDetailResponse,
  JobCreateResponse,
  JobCreatePayload,
  JobFormData,
} from '@/types';

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
};

const asApiError = (error: unknown): ApiError => error as ApiError;

const getErrorMessage = (error: unknown, fallback: string) => {
  const parsed = asApiError(error);
  return parsed.response?.data?.message || parsed.message || fallback;
};

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
}

export type JobsStore = JobsState & JobsActions;

const initialState: JobsState = {
  hasJobs: false,
  isLoading: false,
  error: null,
  draftPayload: null,
  formSnapshot: null,
};

export const useJobsStore = create<JobsStore>()(
  devtools(
    (set) => {
      const runWithLoading = async <T>(operation: () => Promise<T>): Promise<T> => {
        set({ isLoading: true, error: null });
        try {
          return await operation();
        } catch (error: unknown) {
          const message = getErrorMessage(error, 'Request failed');
          set({ error: message });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      };

      const runWithErrorOnly = async <T>(operation: () => Promise<T>): Promise<T> => {
        try {
          return await operation();
        } catch (error: unknown) {
          const message = getErrorMessage(error, 'Request failed');
          set({ error: message });
          throw error;
        }
      };

      return {
        ...initialState,

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
      };
    },
    { name: 'JobsStore' }
  )
);