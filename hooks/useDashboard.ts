// hooks/useDashboard.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getDashboardOverview,
  getDashboardTodayShifts,
  getDashboardUnderfilledJobs,
} from "@/features/dashboard/api";
import type {
  DashboardOverview,
  DashboardShiftRange,
  TodayShift,
} from "@/features/dashboard/types";

export type { DashboardOverview, DashboardShiftRange, TodayShift };

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
    isLoading,
    isError,
  };
}

export function useDashboardUnderfilledJobs(page: number, limit: number) {
  return useQuery({
    queryKey: ["dashboard-underfilled-jobs", page, limit],
    queryFn: () => getDashboardUnderfilledJobs({ page, limit }),
    staleTime: 30_000,
  });
}

export function useTodayShifts(
  range: DashboardShiftRange = "today",
  page = 1,
  limit = 5,
) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["dashboard-today-shifts", range, page, limit],
    queryFn: () => getDashboardTodayShifts({ range, page, limit }),
    staleTime: 30_000,
  });

  return {
    shifts: data?.shifts ?? [],
    range: data?.range ?? range,
    dateFrom: data?.date_from ?? "",
    dateTo: data?.date_to ?? "",
    today: data?.today ?? "",
    pagination: data?.pagination ?? null,
    total: data?.pagination?.total ?? 0,
    isLoading,
    isError,
    error,
    refetch,
  };
}
