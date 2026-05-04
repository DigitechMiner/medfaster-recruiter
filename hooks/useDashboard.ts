// hooks/useDashboard.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/stores/api/api-client';
import { ENDPOINTS }  from '@/stores/api/api-endpoints';

// ── Types ──────────────────────────────────────────────────────────────────

export interface DashboardOverview {
  jobStatusOverview: {
    TOTAL:     number;
    DRAFT:     number;
    OPEN:      number;
    PAUSED:    number;
    UPCOMING:  number;
    ACTIVE:    number;
    COMPLETED: number;
    CLOSED:    number;
  };
  interviewOverview: {
    REQUESTS: {
      TOTAL: number; PENDING: number; ACCEPTED: number;
      REJECTED: number; EXPIRED: number; CANCELLED: number; SCHEDULED: number;
    };
    BOOKINGS:   { CONFIRMED: number; CANCELLED: number };
    INTERVIEWS: { TOTAL: number; PENDING: number; IN_PROGRESS: number; ENDED: number; FAILED: number };
  };
  shiftOverview: {
    TOTAL: number; UPCOMING: number; ACTIVE: number;
    MISSED: number; COMPLETED: number; CANCELLED: number;
  };
}

export interface TodayShift {
  shift_id:              string;
  shift_status:          string;
  shift_date:            string;
  shift_check_in_time:   string;
  shift_check_out_time:  string;
  job_title:             string;
  candidate_profile: {
    id:         string;
    first_name: string;
    last_name:  string;
  };
}

export interface ActivityItem {
  type:         string;
  title:        string;
  occurred_at:  string;
  status_color: 'green' | 'orange' | 'red' | string;
  meta: {
    shift_status?:      string;
    shift_date?:        string;
    shift_check_in_time?:  string;
    shift_check_out_time?: string;
    job_title?:         string;
    late_minutes?:      number;
    assignment_status?: string;
  };
}

// ── Hooks ──────────────────────────────────────────────────────────────────

export function useDashboardOverview() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn:  () => apiRequest<{ success: boolean; data: DashboardOverview }>(
      ENDPOINTS.DASHBOARD_OVERVIEW,
      { method: 'GET' }
    ),
    staleTime: 60_000,
  });

  return {
    overview:  data?.data ?? null,
    jobs:      data?.data?.jobStatusOverview   ?? null,
    shifts:    data?.data?.shiftOverview       ?? null,
    interviews: data?.data?.interviewOverview  ?? null,
    isLoading,
    isError,
  };
}

export function useTodayShifts() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard-today-shifts'],
    queryFn:  () => apiRequest<{ success: boolean; data: { today: string; count: number; shifts: TodayShift[] } }>(
      ENDPOINTS.DASHBOARD_TODAY_SHIFTS,
      { method: 'GET' }
    ),
    staleTime: 30_000,
  });

  return {
    shifts:    data?.data?.shifts ?? [],
    today:     data?.data?.today  ?? '',
    count:     data?.data?.count  ?? 0,
    isLoading,
    isError,
  };
}

export function useRecentActivity(activityLength = 10) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard-recent-activity', activityLength],
    queryFn:  () => apiRequest<{ success: boolean; data: { total: number; activityLength: number; activities: ActivityItem[] } }>(
      ENDPOINTS.DASHBOARD_RECENT_ACTIVITY(activityLength),
      { method: 'GET' }
    ),
    staleTime: 30_000,
  });

  return {
    activities: data?.data?.activities ?? [],
    total:      data?.data?.total      ?? 0,
    isLoading,
    isError,
  };
}