//useRecruiterData.ts

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getCandidateSummary,
  getJobsSummary,
  getJobsCalendar,
  getCandidatesList,
  getCandidateDetails,
  inviteCandidate,
  getNotifications,
  getRecruiterDashboard,
} from '@/stores/api/recruiter-candidates-api';
import type {
  CandidateSummaryData,
  JobsSummaryData,
  CalendarJob,
  CandidateListItem,
  CandidatesListParams,
  CandidatesListResponse,
  CandidateDetailsResponse,
  InviteCandidatePayload,
  InviteCandidateResponse,
  RecruiterNotification,
  NotificationsParams,
} from '@/Interface/recruiter.types';
import type { RecruiterDashboardData } from '@/stores/api/recruiter-candidates-api';

// ─── Generic async hook factory ───────────────────────────────────────────────
function useAsyncData<T>(
  fetcher: () => Promise<{ success: boolean; data: T; message?: string }>,
  deps: unknown[] = []
) {
  const [data,      setData]      = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  const run = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetcher();
      if (res.success) setData(res.data);
      else             setError(res.message ?? 'Request failed');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { run(); }, [run]);

  return { data, isLoading, error, refetch: run };
}

// ─── 1. Candidate Summary ─────────────────────────────────────────────────────
export function useCandidatesSummary() {
  const { data, isLoading, error, refetch } =
    useAsyncData<CandidateSummaryData>(getCandidateSummary);
  return { summary: data, isLoading, error, refetch };
}
// Alias — some components import without the "s"
export const useCandidateSummary = useCandidatesSummary;

// ─── 2. Jobs Summary ──────────────────────────────────────────────────────────
export function useJobsSummary() {
  const { data, isLoading, error, refetch } =
    useAsyncData<JobsSummaryData>(getJobsSummary);
  return { summary: data, isLoading, error, refetch };
}

// ─── 3. Jobs Calendar ─────────────────────────────────────────────────────────
export function useJobsCalendar() {
  const [calendarJobs, setCalendarJobs] = useState<CalendarJob[]>([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [error,        setError]        = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    getJobsCalendar()
      .then((res) => {
        if (cancelled) return;
        if (res.success)
          setCalendarJobs(Array.isArray(res.data.shifts) ? res.data.shifts : []);
      })
      .catch(() => { if (!cancelled) setCalendarJobs([]); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, []);

  return { calendarJobs, isLoading, error };
}

// ─── 4. Candidates List ───────────────────────────────────────────────────────
// Returns { data } shape — components do: data?.data.candidates ?? []
export function useCandidatesList(params?: CandidatesListParams) {
  const [data,      setData]      = useState<CandidatesListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  const stableKey = JSON.stringify(params ?? {});

  const run = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getCandidatesList(params);
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load candidates');
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stableKey]);

  useEffect(() => { run(); }, [run]);

  return { data, isLoading, error, refetch: run };
}

// ─── 5. Candidate Details ─────────────────────────────────────────────────────
// Returns { candidate } — components do: candidate?.data.candidate
export function useCandidateDetails(candidateId: string | null) {
  const [candidate, setCandidate] = useState<CandidateDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const run = useCallback(async () => {
    if (!candidateId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await getCandidateDetails(candidateId);
      setCandidate(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Candidate not found');
    } finally {
      setIsLoading(false);
    }
  }, [candidateId]);

  useEffect(() => { run(); }, [run]);

  return { candidate, isLoading, error, refetch: run };
}

// ─── 6. Invite Candidate ──────────────────────────────────────────────────────
export function useInviteCandidate() {
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const invite = useCallback(async (
    payload: InviteCandidatePayload
  ): Promise<InviteCandidateResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      return await inviteCandidate(payload);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Invite failed';
      setError(msg);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { invite, isLoading, error };
}

// ─── 7. Notifications ─────────────────────────────────────────────────────────
export function useNotifications(params?: NotificationsParams) {
  const stableKey = JSON.stringify(params ?? {});

  const [notifications, setNotifications] = useState<RecruiterNotification[]>([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [total,         setTotal]         = useState(0);
  const [isLoading,     setIsLoading]     = useState(true);
  const [error,         setError]         = useState<string | null>(null);

  const run = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getNotifications(params);
      if (res.success) {
        const notifs = res.data.notifications;
        setNotifications(notifs);
        setUnreadCount(notifs.filter((n) => !n.is_read).length);
        setTotal(res.data.pagination.total);
      } else {
        setError(res.message ?? 'Failed to fetch notifications');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stableKey]);

  useEffect(() => { run(); }, [run]);

  return { notifications, unreadCount, total, isLoading, error, refetch: run };
}

// ─── 8. Recruiter Dashboard ───────────────────────────────────────────────────
export function useRecruiterDashboard() {
  const { data, isLoading, error, refetch } =
    useAsyncData<RecruiterDashboardData>(getRecruiterDashboard);
  return { dashboard: data, isLoading, error, refetch };
}