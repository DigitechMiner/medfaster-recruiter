import { apiRequest, axiosInstance } from "@/stores/api/api-client";
import { ENDPOINTS } from "@/stores/api/api-endpoints";

import type {
  DashboardOverview,
  DashboardTodayShiftsParams,
  DashboardTodayShiftsPayload,
  MarkNotificationReadResponse,
  NotificationsParams,
  NotificationsResponse,
  RecruiterDashboardApiResponse,
  RecruiterUnderfilledJobsApiResponse,
  UnderfilledJobsPayload,
} from "./types";

// ============================================================================
// API FUNCTIONS
// ============================================================================

const getJson = <T>(url: string, params?: unknown): Promise<T> =>
  axiosInstance.get<T>(url, params ? { params } : undefined).then((r) => r.data);

export async function getDashboardOverview(): Promise<DashboardOverview> {
  const res = await apiRequest<RecruiterDashboardApiResponse>(
    ENDPOINTS.DASHBOARD_OVERVIEW,
    { method: "GET" },
  );
  return res.data;
}

export async function getDashboardUnderfilledJobs(params?: {
  page?: number;
  limit?: number;
}): Promise<UnderfilledJobsPayload> {
  const res = await apiRequest<RecruiterUnderfilledJobsApiResponse>(
    ENDPOINTS.DASHBOARD_UNDERFILLED_JOBS,
    { method: "GET", params },
  );
  return res.data;
}

export async function getDashboardTodayShifts(
  params?: DashboardTodayShiftsParams,
): Promise<DashboardTodayShiftsPayload> {
  const res = await apiRequest<{
    success: boolean;
    data: DashboardTodayShiftsPayload;
  }>(ENDPOINTS.DASHBOARD_TODAY_SHIFTS, { method: "GET", params });
  return res.data;
}

export const getNotifications = (
  params?: NotificationsParams,
): Promise<NotificationsResponse> =>
  getJson<NotificationsResponse>(ENDPOINTS.NOTIFICATIONS, params);

export async function markNotificationAsRead(
  id: string,
): Promise<MarkNotificationReadResponse> {
  const res = await apiRequest<MarkNotificationReadResponse>(
    ENDPOINTS.NOTIFICATION_MARK_READ(id),
    { method: "PATCH" },
  );
  return res;
}
