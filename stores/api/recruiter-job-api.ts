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
} from '@/Interface/job.types';

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

export interface CandidateDetailsResponse {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string | null;
  gender: string | null;
  dob: string | null;
  profile_image_url: string | null;
  street: string | null;
  street_2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  medical_industry: string | null;
  specialty: string | null;
  work_eligibility: string | null;
  expected_salary: string | null;
  expected_hour_rate: string | null;
  skill: string | string[] | null;
  job_type: string | null;
  preferred_location: string | null;
  preferred_shift: string | null;
  status: string | null;
  completion_percentage: number | null;
  email: string | null;
  phone_number: string | null;
  work_experiences: Array<{ id: string; title: string; company: string }>;
  educations: Array<{ id: string; school: string; degree: string }>;
  awards: Array<{ id: string; award_name: string; award_date: string }>;
  social_links: Array<{ id: string; social_media: string; link: string }>;
  documents: Array<{ id: string; document_type: string; title: string; file_url: string | null }>;
  created_at: string;
  updated_at: string;
}

export interface CandidateListItem {
  id: string;
  first_name: string;
  last_name: string | null;
  full_name: string;
  profile_image_url: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  medical_industry: string | null;
  specialty: string[];
  role: string[];
  availability: string[];
  work_permit: string | null;
  job_titles: string[];
  preferred_shift: string[];
  work_eligibility: string | null;
  status: string;
  completion_percentage: string;
  email: string | null;
  phone_number: string;
  highest_interview_score: number | null;
  highest_job_interview_score: number | null;
}

export interface CandidatesListResponse {
  candidates: CandidateListItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    offset: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface GetJobsParams {
  page?:        number;
  limit?:       number;
  offset?:      number;
  status?:      'DRAFT' | 'OPEN' | 'PAUSED' | 'CLOSED';
  joburgency?:  'instant' | 'normal';
  search?:      string;
}

export type ApplicationStatus = 'APPLIED' | 'SHORTLISTED' | 'INTERVIEW' | 'HIRE' | 'REJECTED';

export async function getJobApplications(params: {
  job_id?: string;
  status?: 'APPLIED' | 'SHORTLISTED' | 'INTERVIEW' | 'REJECTED' | 'HIRE' | 'ACCEPTED' | 'CANCELLED';
  page?: number;
  limit?: number;
  offset?: number;
}): Promise<JobApplicationListResponse> {
  const res = await axiosInstance.get(ENDPOINTS.JOB_APPLICATIONS, { params });
  return res.data.data;
}

export async function getCandidateDetails(candidateId: string): Promise<CandidateDetailsResponse> {
  const res = await axiosInstance.get(ENDPOINTS.CANDIDATE_DETAILS(candidateId));
  return res.data.data;
}

export async function getCandidatesList(params?: {
  role?: string[];
  specialty?: string[];
  availability?: string[];
  work_permit?: string[];
  job_id?: string;
  interview?: 'SELF' | 'JOB';
  page?: number;
  limit?: number;
}): Promise<CandidatesListResponse> {
  const res = await axiosInstance.get(ENDPOINTS.CANDIDATES_LIST, { params });
  return res.data.data;
}

export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus
): Promise<{ id: string; job_id: string; candidate_id: string; status: ApplicationStatus; updated_at: string }> {
  const res = await axiosInstance.patch(
    ENDPOINTS.JOB_APPLICATION_STATUS(applicationId),
    { status }
  );
  return res.data.data;
}

export async function getRecruiterJobs(params?: GetJobsParams): Promise<JobsListResponse> {
  const res = await axiosInstance.get(ENDPOINTS.JOBS_LIST, { params });
  return res.data;
}

export async function getRecruiterJob(id: string): Promise<JobDetailResponse> {
  const res = await axiosInstance.get(ENDPOINTS.JOBS_DETAIL(id));
  return res.data;
}

export async function createRecruiterJob(payload: JobCreatePayload): Promise<JobCreateResponse> {
  const res = await axiosInstance.post(ENDPOINTS.JOBS_CREATE, payload);
  return res.data;
}

export async function updateRecruiterJob(
  id: string,
  payload: JobUpdatePayload
): Promise<JobUpdateResponse> {
  const res = await axiosInstance.patch(ENDPOINTS.JOBS_UPDATE(id), payload);
  return res.data;
}

export async function deleteRecruiterJob(id: string): Promise<JobDeleteResponse> {
  const res = await axiosInstance.delete(ENDPOINTS.JOBS_DELETE(id));
  return res.data;
}

export async function generateJobDescription(
  payload: GenerateDescriptionPayload
): Promise<GenerateDescriptionResponse> {
  const res = await axiosInstance.post(ENDPOINTS.GENERATE_JOB_DESCRIPTION, payload);
  return res.data;
}

export async function generateJobQuestions(
  payload: GenerateQuestionsPayload
): Promise<GenerateQuestionsResponse> {
  const res = await axiosInstance.post(ENDPOINTS.GENERATE_JOB_QUESTIONS, payload);
  return res.data;
}