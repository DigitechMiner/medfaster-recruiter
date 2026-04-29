'use client';

import { axiosInstance } from "./api-client";
import { ENDPOINTS } from "./api-endpoints";
import type {
  JobCreatePayload,
  JobUpdatePayload,
  JobsListResponse,
  JobDetailResponse,
  JobCreateResponse,
  GenerateDescriptionPayload,
  GenerateDescriptionResponse,
  GenerateQuestionsPayload,
  GenerateQuestionsResponse,
  JobUpdateResponse,
  JobDeleteResponse,
  JobFeePreviewPayload,
  JobFeePreviewResponse,
} from '@/Interface/recruiter.types';

export interface JobApplicationListResponse {
  applications: Array<{
    id: string;
    job_id: string;
    candidate_id: string;
    status: 'APPLIED' | 'SHORTLISTED' | 'INTERVIEW' | 'HIRE' | 'REJECTED' | 'ACCEPTED' | 'CANCELLED';
    created_at: string;
    updated_at: string;
    job: {
      id: string;
      job_title: string;
      department: string | null;
      job_type: string | null;
      status: string;
    } | null;
    candidate: {
      id: string;
      first_name: string;
      last_name: string;
      full_name: string | null;
      email: string | null;
      phone_number: string | null;
      profile_image_url: string | null;
      expected_salary: string | null;
      skill: string | null;
      city: string | null;
      state: string | null;
      completion_percentage: number | null;
    } | null;
  }>;
  pagination: {
    total: number;
    count: number;
    page: number;
    limit: number;
  };
}


export interface GetJobsParams {
  job_urgency?: 'instant' | 'normal';
  status?: 'DRAFT' | 'OPEN' | 'PAUSED' | 'CLOSED' | 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
  page?: number;
  limit?: number;
  offset?: number;
}
const extractData = <T>(payload: unknown): T => (payload as { data: T }).data;
const extractRoot = <T>(payload: unknown): T => payload as T;

export async function getJobApplications(params: {
  job_id?:  string;
  status?:  'APPLIED' | 'SHORTLISTED' | 'INTERVIEWING' | 'INTERVIEWED' | 'HIRE' | 'REJECTED' | 'ACCEPTED' | 'CANCELLED';
  page?:    number;
  limit?:   number;
  offset?:  number;
}): Promise<JobApplicationListResponse> {
  const res = await axiosInstance.get(ENDPOINTS.JOB_APPLICATIONS, { params });
  return extractData<JobApplicationListResponse>(res.data);
}

export async function getRecruiterJobs(params?: GetJobsParams): Promise<JobsListResponse> {
  const res = await axiosInstance.get(ENDPOINTS.JOBS_LIST, { params });
  return extractRoot<JobsListResponse>(res.data);
}

export async function getRecruiterJob(id: string): Promise<JobDetailResponse> {
  const res = await axiosInstance.get(ENDPOINTS.JOBS_DETAIL(id));
  return extractRoot<JobDetailResponse>(res.data);
}

export async function createRecruiterJob(payload: JobCreatePayload & { status?: string }) {
  console.log("🔥 API createRecruiterJob — status:", payload.status);
  const res = await axiosInstance.post(ENDPOINTS.JOBS_CREATE, payload);
  return extractRoot<JobCreateResponse>(res.data);  // ← change extractData to extractRoot
}

export async function updateRecruiterJob(
  id: string,
  payload: JobUpdatePayload
): Promise<JobUpdateResponse> {
  const res = await axiosInstance.patch(ENDPOINTS.JOBS_UPDATE(id), payload);
  return extractRoot<JobUpdateResponse>(res.data);
}

export async function deleteRecruiterJob(id: string): Promise<JobDeleteResponse> {
  const res = await axiosInstance.delete(ENDPOINTS.JOBS_DELETE(id));
  return extractRoot<JobDeleteResponse>(res.data);
}

export async function generateJobDescription(
  payload: GenerateDescriptionPayload
): Promise<GenerateDescriptionResponse> {
  const res = await axiosInstance.post(ENDPOINTS.GENERATE_JOB_DESCRIPTION, payload);
  return extractRoot<GenerateDescriptionResponse>(res.data);
}

export async function generateJobQuestions(
  payload: GenerateQuestionsPayload
): Promise<GenerateQuestionsResponse> {
  const res = await axiosInstance.post(ENDPOINTS.GENERATE_JOB_QUESTIONS, payload);
  return extractRoot<GenerateQuestionsResponse>(res.data);
}

export async function getJobFeePreview(
  params: JobFeePreviewPayload
): Promise<JobFeePreviewResponse['data']> {
  const body: JobFeePreviewPayload = {
    job_title:            params.job_title,
    no_of_hires_required: params.no_of_hires_required,
    start_date:           new Date(params.start_date).toISOString(),
    end_date:             new Date(params.end_date).toISOString(),
    check_in_time:        params.check_in_time,
    check_out_time:       params.check_out_time,
  };

  const res = await axiosInstance.post(ENDPOINTS.JOBS_FEE_PREVIEW, body);
  return extractData<JobFeePreviewResponse['data']>(res.data);
}
export type {
  CandidateListItem,
  CandidateDetailsResponse,
  CandidatesListResponse,
  CandidatesListParams,
  CandidateSummaryResponse,
  CandidateSummaryData,
  InviteCandidatePayload,
  InviteCandidateResponse,
} from '@/Interface/recruiter.types';