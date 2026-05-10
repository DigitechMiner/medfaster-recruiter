import type { PaginationData } from "@/types";

/** Dashboard overview payload shape (GET `/recruiter/dashboard`) — alternate envelope / older docs. */
export interface RecruiterDashboardData {
  job_status_overview: {
    TOTAL: number;
    DRAFT: number;
    OPEN: number;
    PAUSED: number;
    UPCOMING: number;
    ACTIVE: number;
    COMPLETED: number;
    CLOSED: number;
  };
  application_status_overview: {
    TOTAL: number;
    NORMAL_JOB: Record<string, number>;
    INSTANT_JOB?: Record<string, number>;
  };
  interview_overview: {
    REQUESTS: Record<string, number>;
    BOOKINGS: Record<string, number>;
    INTERVIEWS: Record<string, number>;
  };
}

export interface DashboardOverview {
  jobStatusOverview: {
    TOTAL: number;
    DRAFT: number;
    OPEN: number;
    PAUSED: number;
    UPCOMING: number;
    ACTIVE: number;
    COMPLETED: number;
    CLOSED: number;
  };
  interviewOverview: {
    REQUESTS: {
      TOTAL: number;
      PENDING: number;
      ACCEPTED: number;
      REJECTED: number;
      EXPIRED: number;
      CANCELLED: number;
      SCHEDULED: number;
    };
    BOOKINGS: { CONFIRMED: number; CANCELLED: number };
    INTERVIEWS: {
      TOTAL: number;
      PENDING: number;
      IN_PROGRESS: number;
      ENDED: number;
      FAILED: number;
    };
  };
  shiftOverview: {
    TOTAL: number;
    UPCOMING: number;
    ACTIVE: number;
    MISSED: number;
    COMPLETED: number;
    CANCELLED: number;
  };
}

export interface TodayShift {
  shift_id: string;
  shift_status: string;
  shift_date: string;
  shift_check_in_time: string;
  shift_check_out_time: string;
  job_title: string;
  candidate_profile: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

export interface ActivityItem {
  type: string;
  title: string;
  occurred_at: string;
  status_color: "green" | "orange" | "red" | string;
  meta: {
    shift_status?: string;
    shift_date?: string;
    shift_check_in_time?: string;
    shift_check_out_time?: string;
    job_title?: string;
    late_minutes?: number;
    assignment_status?: string;
  };
}

export interface DashboardTodayShiftsPayload {
  today: string;
  count: number;
  shifts: TodayShift[];
}

export interface DashboardRecentActivityPayload {
  total: number;
  activityLength: number;
  activities: ActivityItem[];
}

// ── Recruiter notification inbox (GET `/recruiter/notifications`) ───────────

export interface RecruiterNotification {
  id: string;
  user_id?: string;
  app_type?: string;
  created_by_user_id?: string;
  title: string;
  body: string;
  type: string;
  reference_id?: string;
  payload?: Record<string, unknown>;
  channels?: string[];
  priority?: string;
  status?: string;
  scheduled_at?: string;
  is_read: boolean;
  read_at?: string;
  read_via?: string;
  created_at: string;
  updated_at?: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationsParams {
  page?: number;
  limit?: number;
  offset?: number;
  is_read?: boolean;
}

export interface NotificationsResponse {
  success: boolean;
  message: string;
  data: {
    notifications: RecruiterNotification[];
    pagination: PaginationData;
  };
}
