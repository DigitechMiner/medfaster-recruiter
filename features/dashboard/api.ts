import { apiRequest, axiosInstance } from "@/stores/api/api-client";
import { ENDPOINTS } from "@/stores/api/api-endpoints";

import type {
  DashboardOverview,
  DashboardRecentActivityPayload,
  DashboardTodayShiftsPayload,
  NotificationsParams,
  NotificationsResponse,
} from "./types";

// ============================================================================
// API FUNCTIONS
// ============================================================================

const getJson = <T>(url: string, params?: unknown): Promise<T> =>
  axiosInstance.get<T>(url, params ? { params } : undefined).then((r) => r.data);

export async function getDashboardOverview(): Promise<DashboardOverview> {
  const res = await apiRequest<{ success: boolean; data: DashboardOverview }>(
    ENDPOINTS.DASHBOARD_OVERVIEW,
    { method: "GET" },
  );
  return res.data;
}

export async function getDashboardTodayShifts(): Promise<DashboardTodayShiftsPayload> {
  const res = await apiRequest<{
    success: boolean;
    data: DashboardTodayShiftsPayload;
  }>(ENDPOINTS.DASHBOARD_TODAY_SHIFTS, { method: "GET" });
  return res.data;
}

export async function getDashboardRecentActivity(
  activityLength = 10,
): Promise<DashboardRecentActivityPayload> {
  const res = await apiRequest<{
    success: boolean;
    data: DashboardRecentActivityPayload;
  }>(ENDPOINTS.DASHBOARD_RECENT_ACTIVITY(activityLength), { method: "GET" });
  return res.data;
}

export const getNotifications = (
  params?: NotificationsParams,
): Promise<NotificationsResponse> =>
  getJson<NotificationsResponse>(ENDPOINTS.NOTIFICATIONS, params);
