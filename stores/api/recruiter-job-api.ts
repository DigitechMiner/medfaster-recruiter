// lib/recruiter-job-api.ts
'use client';

import { axiosInstance } from "./api-client";
import { ENDPOINTS } from "./api-endpoints";

// Job Application List Response (from Kevin's getJobApplications)
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

// Candidate Details Response (from Kevin's getCandidateDetails)
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
  city: string | null;                           // ✅ Exists
  state: string | null;                          // ✅ Exists
  postal_code: string | null;
  medical_industry: string | null;
  specialty: string | null;
  work_eligibility: string | null;               // ✅ Exists
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
  
  // ✅ Arrays from includes:
  work_experiences: Array<{ id: string; title: string; company: string; /* ... */ }>;
  educations: Array<{ id: string; school: string; degree: string; /* ... */ }>;
  awards: Array<{ id: string; award_name: string; award_date: string }>;
  social_links: Array<{ id: string; social_media: string; link: string }>;
  documents: Array<{ id: string; document_type: string; title: string; file_url: string | null }>;
  created_at: string;
  updated_at: string;
}


// Get job applications for recruiter (list of applicants)
export async function getJobApplications(params: {
  job_id?: string;
  status?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  page?: number;
  limit?: number;
}): Promise<JobApplicationListResponse> {
  const queryParams = new URLSearchParams({
    ...(params.job_id && { job_id: params.job_id }),
    ...(params.status && { status: params.status }),
    ...(params.page && { page: params.page.toString() }),
    ...(params.limit && { limit: params.limit.toString() }),
  });

  const res = await axiosInstance.get(ENDPOINTS.JOB_APPLICATIONS + (queryParams.toString() ? `?${queryParams}` : ''));
  return res.data.data;
}

// Get full candidate details
export async function getCandidateDetails(candidateId: string): Promise<CandidateDetailsResponse> {
  const res = await axiosInstance.get(ENDPOINTS.CANDIDATE_DETAILS(candidateId));
  return res.data.data;
}
