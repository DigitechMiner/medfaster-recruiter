// hooks/useDashboard.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getDashboardOverview,
  getDashboardRecentActivity,
  getDashboardTodayShifts,
} from "@/features/dashboard/api";
import type {
  ActivityItem,
  DashboardOverview,
  TodayShift,
} from "@/features/dashboard/types";

export type { ActivityItem, DashboardOverview, TodayShift };

// ── Hooks ──────────────────────────────────────────────────────────────────

export function useDashboardOverview() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: getDashboardOverview,
    staleTime: 60_000,
  });

  return {
    overview: data ?? null,
    jobs: data?.jobStatusOverview ?? null,
    shifts: data?.shiftOverview ?? null,
    interviews: data?.interviewOverview ?? null,
    isLoading,
    isError,
  };
}

export function useTodayShifts() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard-today-shifts"],
    queryFn: getDashboardTodayShifts,
    staleTime: 30_000,
  });

  return {
    shifts: data?.shifts ?? [],
    today: data?.today ?? "",
    count: data?.count ?? 0,
    isLoading,
    isError,
  };
}

export function useRecentActivity(activityLength = 10) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard-recent-activity", activityLength],
    queryFn: () => getDashboardRecentActivity(activityLength),
    staleTime: 30_000,
  });

  return {
    activities: data?.activities ?? [],
    total: data?.total ?? 0,
    isLoading,
    isError,
  };
}
