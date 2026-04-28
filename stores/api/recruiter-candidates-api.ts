import { axiosInstance } from '@/stores/api/api-client';
import { ENDPOINTS } from './api-endpoints';
import type {
  CandidateSummaryResponse,
  JobsSummaryResponse,
  JobsCalendarResponse,
  CandidatesListParams,
  CandidatesListResponse,
  CandidateDetailsResponse,
  InviteCandidatePayload,
  InviteCandidateResponse,
  NotificationsParams,
  NotificationsResponse,
} from '@/Interface/recruiter.types';

const getJson = <T>(url: string, params?: unknown): Promise<T> =>
  axiosInstance.get<T>(url, params ? { params } : undefined).then((r) => r.data);

const postJson = <T>(url: string, payload: unknown): Promise<T> =>
  axiosInstance.post<T>(url, payload).then((r) => r.data);

export const getCandidateSummary =
  (): Promise<CandidateSummaryResponse> =>
    getJson<CandidateSummaryResponse>(ENDPOINTS.CANDIDATES_SUMMARY);

export const getJobsSummary =
  (): Promise<JobsSummaryResponse> =>
    getJson<JobsSummaryResponse>(ENDPOINTS.JOBS_SUMMARY);

export const getJobsCalendar = (): Promise<JobsCalendarResponse> =>
  getJson<JobsCalendarResponse>(ENDPOINTS.JOBS_CALENDAR);

export const getCandidatesList = (
  params?: CandidatesListParams
): Promise<CandidatesListResponse> =>
  getJson<CandidatesListResponse>(ENDPOINTS.CANDIDATES_LIST, params);

export const getCandidateDetails = (
  candidateId: string
): Promise<CandidateDetailsResponse> =>
  getJson<CandidateDetailsResponse>(ENDPOINTS.CANDIDATE_DETAIL(candidateId));

export const inviteCandidate = (
  payload: InviteCandidatePayload
): Promise<InviteCandidateResponse> =>
  postJson<InviteCandidateResponse>(ENDPOINTS.CANDIDATE_INVITE, payload);

export const getNotifications = (
  params?: NotificationsParams
): Promise<NotificationsResponse> =>
  getJson<NotificationsResponse>(ENDPOINTS.NOTIFICATIONS, params);

export interface RecruiterDashboardData {
  jobStatusOverview: {
    TOTAL: number; DRAFT: number; OPEN: number; PAUSED: number;
    UPCOMING: number; ACTIVE: number; COMPLETED: number; CLOSED: number;
  };
  applicationStatusOverview: {
    TOTAL: number;
    NORMAL_JOB: {
      APPLIED: number; SHORTLISTED: number; INTERVIEWING: number;
      INTERVIEWED: number; HIRE: number; REJECTED: number;
    };
    INSTANT_JOB: { ACCEPTED: number; CANCELLED: number };
  };
  interviewOverview: {
    REQUESTS: {
      TOTAL: number; PENDING: number; ACCEPTED: number;
      REJECTED: number; EXPIRED: number; CANCELLED: number; SCHEDULED: number;
    };
    BOOKINGS: { CONFIRMED: number; CANCELLED: number };
    INTERVIEWS: {
      TOTAL: number; PENDING: number; IN_PROGRESS: number; ENDED: number; FAILED: number;
    };
  };
}

export const getRecruiterDashboard = (): Promise<{ success: boolean; message: string; data: RecruiterDashboardData }> =>
  getJson<{ success: boolean; message: string; data: RecruiterDashboardData }>(ENDPOINTS.RECRUITER_DASHBOARD);