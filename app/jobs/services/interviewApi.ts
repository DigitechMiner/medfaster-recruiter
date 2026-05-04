// lib/interviewApi.ts

import { apiRequest } from "@/stores/api/api-client";
import { ENDPOINTS }  from "@/stores/api/api-endpoints";

// ── Interview Request Status ───────────────────────────────────────────────────
export type InterviewRequestStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'SCHEDULED'
  | 'CANCELLED'
  | 'EXPIRED';

// ── Interview Request ─────────────────────────────────────────────────────────
export interface InterviewRequest {
  id:                  string;
  candidate_id:        string;
  recruiter_id:        string;
  job_application_id:  string | null;
  message:             string | null;
  valid_until:         string;
  status:              InterviewRequestStatus;
  created_at:          string;
  updated_at:          string;
}

// ── Pagination (shared shape) ─────────────────────────────────────────────────
export interface InterviewPagination {
  currentPage:     number;
  totalPages:      number;
  totalCount:      number;
  limit:           number;
  hasNextPage:     boolean;
  hasPreviousPage: boolean;
  // aliases for consistency with rest of codebase
  page:            number;
  total:           number;
}

// ── Interview Viewing Types ───────────────────────────────────────────────────
export type InterviewStatus  = 'PENDING' | 'IN_PROGRESS' | 'ENDED' | 'FAILED';
export type InterviewType    = 'JOB' | 'PRACTICE' | 'MOCK';
export type TranscriptRole   = 'assistant' | 'user' | 'system';

export interface InterviewContext {
  interview_type:    InterviewType;
  position:          string;
  level:             string;
  skills:            string[];
  duration_min:      number;
  language:          string;
  question_strategy?: string;
  created_at:        string;
}

export interface InterviewTranscript {
  role:       TranscriptRole;
  text:       string;
  sequence:   number;
  created_at: string;
}

export interface InterviewEvaluation {
  id:               string;
  interview_id:     string;
  communication:    number;
  confidence:       number;
  behavioral:       number;
  accuracy:         number;
  strengths:        string[];
  areas_to_improve: string[];
  evaluator_type:   string;
  model_name:       string | null;
  created_at:       string;
}

export interface InterviewDetailsResponse {
  interview: {
    id:         string;
    booking_id: string;
    started_at: string | null;
    ended_at:   string | null;
    status:     InterviewStatus;
  };
  transcripts: InterviewTranscript[];
  evaluation:  InterviewEvaluation | null;
}

export interface InterviewListItem {
  id:               string;
  booking_id:       string;
  status:           InterviewStatus;
  started_at:       string | null;
  ended_at:         string | null;
  duration_sec:     number | null;
  interview_context: InterviewContext | null;
}

// ── GET /recruiter/interview-requests ────────────────────────────────────────
export async function fetchRecruiterInterviewRequests(
  status?: InterviewRequestStatus,
  page    = 1,
  limit   = 10
): Promise<{
  interviewRequests: InterviewRequest[];
  pagination:        InterviewPagination;
}> {
  const params: { page: number; limit: number; status?: InterviewRequestStatus } = { page, limit };
  if (status) params.status = status;

  const res = await apiRequest<{
    data: {
      interviewRequests: InterviewRequest[];
      pagination: Omit<InterviewPagination, 'page' | 'total'>;
    };
  }>(ENDPOINTS.INTERVIEW_REQUESTS, { method: 'GET', params });

  const raw = res.data;
  return {
    interviewRequests: raw.interviewRequests,
    pagination: {
      ...raw.pagination,
      page:  raw.pagination.currentPage,   // ✅ alias
      total: raw.pagination.totalCount,    // ✅ alias
    },
  };
}

// ── POST /recruiter/interview-requests ───────────────────────────────────────
export async function createRecruiterInterviewRequest(input: {
  candidate_id:       string;
  job_application_id: string;   // ✅ matches InterviewRequest shape
  message?:           string;
  valid_until:        string;   // ISO date string — how long request stays open
}) {
  const res = await apiRequest<{
    data: { interviewRequest: InterviewRequest };
  }>(ENDPOINTS.INTERVIEW_REQUESTS, {
    method: 'POST',
    data:   input,
  });

  return res.data.interviewRequest;
}

// ── PATCH /recruiter/interview-requests/:id/cancel ───────────────────────────
export async function cancelRecruiterInterviewRequest(id: string) {
  const res = await apiRequest<{
    data: { interviewRequest: InterviewRequest };
  }>(ENDPOINTS.INTERVIEW_REQUEST_CANCEL(id), {
    method: 'PATCH',
  });

  return res.data.interviewRequest;
}

// ── GET /recruiter/interviews/:interviewId ───────────────────────────────────
export async function getInterviewById(interviewId: string): Promise<InterviewDetailsResponse> {
  const res = await apiRequest<{ data: InterviewDetailsResponse }>(
    ENDPOINTS.RECRUITER_INTERVIEW_DETAILS(interviewId),
    { method: 'GET' }
  );
  return res.data;
}

// ── GET /recruiter/candidates/:candidateId/interviews ────────────────────────
export async function getCandidateInterviews(candidateId: string): Promise<InterviewListItem[]> {
  const res = await apiRequest<{ data: { interviews: InterviewListItem[] } }>(
    ENDPOINTS.RECRUITER_CANDIDATE_INTERVIEWS(candidateId),
    { method: 'GET' }
  );
  return res.data.interviews;
}

// ── GET /recruiter/bookings/:bookingId/interviews ────────────────────────────
export async function getBookingInterviews(bookingId: string): Promise<InterviewListItem[]> {
  const res = await apiRequest<{ data: { interviews: InterviewListItem[] } }>(
    ENDPOINTS.RECRUITER_BOOKING_INTERVIEWS(bookingId),
    { method: 'GET' }
  );
  return res.data.interviews;
}