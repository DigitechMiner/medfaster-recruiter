// lib/recruiter-job-api.ts
'use client';

import { axiosInstance } from "./api-client";
import { ENDPOINTS } from "./api-endpoints";

// ===== EXISTING TYPES (Keep these) =====
export interface JobApplicationListResponse {
  applications: Array<{
    id: string;
    job_id: string;
    candidate_id: string;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
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

// ===== NEW TYPES FOR JOBS =====
export interface JobCreatePayload {
  job_title: string;
  department?: string | null;
  job_type?: string | null;
  location?: string | null;
  pay_range_min?: number | null;
  pay_range_max?: number | null;
  years_of_experience?: string | null;
  qualifications?: string[] | null;
  specializations?: string[] | null;
  urgency?: 'high' | 'medium' | 'low' | null;
  in_person_interview?: boolean | null;
  physical_interview?: boolean | null;
  description?: string | null;
  questions?: Record<string, any> | null;
  status?: 'draft' | 'published' | 'closed' | 'archived';
}

export interface JobUpdatePayload extends Partial<JobCreatePayload> {}

export interface JobListItem {
  id: string;
  job_title: string;
  years_of_experience: string | null;
  department: string | null;
  job_type: string | null;
  specializations: string[] | null;
  qualifications: string[] | null;
  created_at: string;
  updated_at: string;
  application_count: number;
}

export interface JobsListResponse {
  jobs: JobListItem[];
  pagination: {
    total: number;
    count: number;
    page: number;
    limit: number;
    offset: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface JobDetailResponse {
  job: {
    id: string;
    recruiter_profile_id: string;
    job_title: string;
    department: string | null;
    job_type: string | null;
    location: string | null;
    pay_range_min: number | null;
    pay_range_max: number | null;
    years_of_experience: string | null;
    qualifications: string[] | null;
    specializations: string[] | null;
    urgency: string | null;
    in_person_interview: boolean | null;
    physical_interview: boolean | null;
    description: string | null;
    questions: Record<string, any> | null;
    status: 'draft' | 'published' | 'closed' | 'archived';
    created_at: string;
    updated_at: string;
  };
}

// ===== EXISTING FUNCTIONS (Keep these) =====
export async function getJobApplications(params: {
  job_id?: string;
  status?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  page?: number;
  limit?: number;
}): Promise<JobApplicationListResponse> {
  const queryParams = new URLSearchParams();
  if (params.job_id) queryParams.set('job_id', params.job_id);
  if (params.status) queryParams.set('status', params.status);
  if (params.page) queryParams.set('page', params.page.toString());
  if (params.limit) queryParams.set('limit', params.limit.toString());

  const res = await axiosInstance.get(
    ENDPOINTS.JOB_APPLICATIONS + (queryParams.toString() ? `?${queryParams}` : '')
  );
  return res.data.data;
}

export async function getCandidateDetails(candidateId: string): Promise<CandidateDetailsResponse> {
  const res = await axiosInstance.get(ENDPOINTS.CANDIDATE_DETAILS(candidateId));
  return res.data.data;
}

// ===== NEW JOB FUNCTIONS (Add these) =====

/**
 * Get all jobs with pagination and filters
 * GET /api/v1/recruiter/jobs?page=1&limit=10&status=published
 */
export async function getRecruiterJobs(params?: {
  page?: number;
  limit?: number;
  offset?: number;
  status?: 'draft' | 'published' | 'closed' | 'archived';
}): Promise<JobsListResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set('page', params.page.toString());
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.offset) queryParams.set('offset', params.offset.toString());
  if (params?.status) queryParams.set('status', params.status);

  const res = await axiosInstance.get(
    ENDPOINTS.JOBS_LIST + (queryParams.toString() ? `?${queryParams}` : '')
  );
  return res.data.data;
}

/**
 * Get single job by ID
 * GET /api/v1/recruiter/jobs/:id
 */
export async function getRecruiterJob(id: string): Promise<JobDetailResponse> {
  const res = await axiosInstance.get(ENDPOINTS.JOBS_DETAIL(id));
  return res.data.data;
}

/**
 * Create new job
 * POST /api/v1/recruiter/jobs
 */
export async function createRecruiterJob(payload: JobCreatePayload): Promise<JobDetailResponse> {
  const res = await axiosInstance.post(ENDPOINTS.JOBS_CREATE, payload);
  return res.data.data;
}

/**
 * Update job
 * PATCH /api/v1/recruiter/jobs/:id
 */
export async function updateRecruiterJob(
  id: string,
  payload: JobUpdatePayload
): Promise<JobDetailResponse> {
  const res = await axiosInstance.patch(ENDPOINTS.JOBS_UPDATE(id), payload);
  return res.data.data;
}

/**
 * Delete job
 * DELETE /api/v1/recruiter/jobs/:id
 */
export async function deleteRecruiterJob(id: string): Promise<void> {
  await axiosInstance.delete(ENDPOINTS.JOBS_DELETE(id));
}

/**
 * Generate job description with AI
 * POST /api/v1/recruiter/jobs/generate-description
 */
export async function generateJobDescription(payload: Partial<JobCreatePayload>): Promise<{ description: string }> {
  const res = await axiosInstance.post(ENDPOINTS.GENERATE_JOB_DESCRIPTION, payload);
  return res.data.data;
}
