// lib/recruiter-interview-api.ts (or wherever this file is)

import { apiRequest } from "@/stores/api/api-client";
import { ENDPOINTS } from "@/stores/api/api-endpoints"; 

export type InterviewRequestStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'SCHEDULED'
  | 'CANCELLED'
  | 'EXPIRED';

export interface InterviewRequest {
  id: string;
  candidate_id: string;
  recruiter_id: string;
  job_application_id: string | null;
  message: string | null;
  valid_until: string;
  status: InterviewRequestStatus;
  created_at: string;
  updated_at: string;
}

interface InterviewRequestsResponse {
  data: {
    interviewRequests: InterviewRequest[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      limit: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
}

// GET /recruiter/interview-requests
export async function fetchRecruiterInterviewRequests(
  status?: InterviewRequestStatus,
  page = 1,
  limit = 10
) {
  const params: any = { page, limit };
  if (status) params.status = status;

  const res = await apiRequest<InterviewRequestsResponse>(
    ENDPOINTS.INTERVIEW_REQUESTS, // ✅ CHANGED: Remove RECRUITER_ prefix
    { method: 'GET', params }
  );

  return res.data;
}

// POST /recruiter/interview-requests
export async function createRecruiterInterviewRequest(input: {
  candidate_id: string;
  job_application_id: string;
  message?: string;
  valid_until: string;
}) {
  const res = await apiRequest<{
    data: { interviewRequest: InterviewRequest };
  }>(ENDPOINTS.INTERVIEW_REQUESTS, { // ✅ CHANGED: Remove RECRUITER_ prefix
    method: 'POST',
    data: input,
  });

  return res.data.interviewRequest;
}

// PATCH /recruiter/interview-requests/:id/cancel
export async function cancelRecruiterInterviewRequest(id: string) {
  const res = await apiRequest<{
    data: { interviewRequest: InterviewRequest };
  }>(ENDPOINTS.INTERVIEW_REQUEST_CANCEL(id), { // ✅ CHANGED: Remove RECRUITER_ prefix
    method: 'PATCH',
  });

  return res.data.interviewRequest;
}
