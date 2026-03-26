import { axiosInstance } from './api-client';
import { ENDPOINTS } from './api-endpoints';

export interface DashboardData {
  jobStatusOverview: {
    TOTAL: number; DRAFT: number; OPEN: number; PAUSED: number; CLOSED: number;
  };
  applicationStatusOverview: {
    TOTAL: number;
    NORMAL_JOB: {
      APPLIED: number; SHORTLISTED: number; INTERVIEW: number; HIRE: number; REJECTED: number;
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

export async function getDashboard(): Promise<DashboardData> {
  const res = await axiosInstance.get(ENDPOINTS.RECRUITER_DASHBOARD);
  return res.data.data;
}
