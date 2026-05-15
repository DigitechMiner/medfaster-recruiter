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

/** `data.jobStatusOverview` — GET `/recruiter/dashboard` */
export interface JobStatusOverview {
  OPEN: number;
  UPCOMING: number;
  ACTIVE: number;
}

/** `data.shiftOverview` — GET `/recruiter/dashboard` */
export interface ShiftOverview {
  UPCOMING: number;
  ACTIVE: number;
  LATE_CHECK_IN: number;
  MISSED: number;
  CANCELLED: number;
}

/** `data` — GET `/recruiter/dashboard` */
export interface DashboardOverview {
  jobStatusOverview: JobStatusOverview;
  shiftOverview: ShiftOverview;
}

/** Full JSON body — GET `/recruiter/dashboard` */
export interface RecruiterDashboardApiResponse {
  success: boolean;
  message: string;
  data: DashboardOverview;
}

/** GET `/recruiter/dashboard/underfilled-jobs` — single job row */
export interface UnderfilledJob {
  job_id: string;
  job_title: string;
  street: string;
  city: string;
  province: string;
  no_of_hires_required: number;
  no_of_hires_hired: number;
  status: string;
  start_date: string | null;
}

/** `data.pagination` — optional `count` = items returned on current page */
export type UnderfilledJobsPagination = PaginationData & {
  count?: number;
};

export interface UnderfilledJobsPayload {
  jobs: UnderfilledJob[];
  pagination: UnderfilledJobsPagination;
}

export interface RecruiterUnderfilledJobsApiResponse {
  success: boolean;
  message: string;
  data: UnderfilledJobsPayload;
}

export interface TodayShiftCandidateProfile {
  id: string;
  first_name: string;
  last_name: string;
  profile_image_url?: string | null;
}

export interface TodayShift {
  shift_id: string;
  shift_status: string;
  shift_date: string;
  shift_check_in_time: string;
  shift_check_out_time: string;
  total_expected_work_minutes?: number | null;
  check_in?: string | null;
  check_out?: string | null;
  check_out_source?: string | null;
  total_work_minutes?: number | null;
  late_minutes?: number | null;
  early_leave_minutes?: number | null;
  job_title: string;
  street?: string | null;
  city?: string | null;
  province?: string | null;
  candidate_profile: TodayShiftCandidateProfile;
}

export type DashboardShiftRange = "today" | "week" | "month";

export interface DashboardTodayShiftsParams {
  range?: DashboardShiftRange;
  period?: DashboardShiftRange;
  page?: number;
  limit?: number;
  offset?: number;
}

export type TodayShiftsPagination = PaginationData & {
  count?: number;
};

export interface DashboardTodayShiftsPayload {
  range: DashboardShiftRange;
  date_from: string;
  date_to: string;
  today: string;
  shifts: TodayShift[];
  pagination: TodayShiftsPagination;
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

export interface MarkNotificationReadResponse {
  success: boolean;
  message: string;
  data: {
    notification: RecruiterNotification;
  };
}