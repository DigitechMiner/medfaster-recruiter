import { axiosInstance } from "@/stores/api/api-client";
import { ENDPOINTS } from "./api-endpoints";
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
} from "@/Interface/recruiter.types";

export const getCandidateSummary =
  (): Promise<CandidateSummaryResponse> =>
    axiosInstance.get<CandidateSummaryResponse>(ENDPOINTS.CANDIDATES_SUMMARY).then((r) => r.data);

export const getJobsSummary =
  (): Promise<JobsSummaryResponse> =>
    axiosInstance.get<JobsSummaryResponse>(ENDPOINTS.JOBS_SUMMARY).then((r) => r.data);

export const getJobsCalendar = (): Promise<JobsCalendarResponse> =>
  axiosInstance.get<JobsCalendarResponse>(ENDPOINTS.JOBS_CALENDAR)
    .then((r) => r.data);

export const getCandidatesList = (
  params?: CandidatesListParams
): Promise<CandidatesListResponse> =>
  axiosInstance.get<CandidatesListResponse>(ENDPOINTS.CANDIDATES_LIST_V1, { params }).then((r) => r.data);

export const getCandidateDetails = (
  candidateId: string
): Promise<CandidateDetailsResponse> =>
  axiosInstance.get<CandidateDetailsResponse>(ENDPOINTS.CANDIDATE_DETAIL_V1(candidateId)).then((r) => r.data);

export const inviteCandidate = (
  payload: InviteCandidatePayload
): Promise<InviteCandidateResponse> =>
  axiosInstance.post<InviteCandidateResponse>(ENDPOINTS.CANDIDATE_INVITE, payload).then((r) => r.data);

export const getNotifications = (
  params?: NotificationsParams
): Promise<NotificationsResponse> =>
  axiosInstance.get<NotificationsResponse>(ENDPOINTS.NOTIFICATIONS, { params }).then((r) => r.data);
  // @/Interface/recruiter.types.ts
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
  axiosInstance
    .get<{ success: boolean; message: string; data: RecruiterDashboardData }>(ENDPOINTS.RECRUITER_DASHBOARD)
    .then((r) => r.data);