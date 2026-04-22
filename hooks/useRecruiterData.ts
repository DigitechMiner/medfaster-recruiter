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
  CandidateDetailsResponse,
  InviteCandidatePayload,
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
export function useCandidateSummary() {
  const { data, isLoading, error, refetch } =
    useAsyncData<CandidateSummaryData>(getCandidateSummary);
  return { summary: data, isLoading, error, refetch };
}

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
        if (res.success) {
          // ✅ shifts is nested under res.data.shifts
          setCalendarJobs(Array.isArray(res.data.shifts) ? res.data.shifts : []);
        }
      })
      .catch(() => { if (!cancelled) setCalendarJobs([]); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, []);

  return { calendarJobs, isLoading, error };
}

// ─── 4. Candidates List ───────────────────────────────────────────────────────
export function useCandidatesList(params?: CandidatesListParams) {
  const stableParams = JSON.stringify(params ?? {});

  const [candidates, setCandidates] = useState<CandidateListItem[]>([]);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading,  setIsLoading]  = useState(true);
  const [error,      setError]      = useState<string | null>(null);

  const run = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getCandidatesList(params);
      if (res.success) {
        setCandidates(res.data.candidates);
        setTotal(res.data.pagination.total);
        setTotalPages(res.data.pagination.totalPages);
      } else {
        setError(res.message ?? 'Failed to fetch candidates');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stableParams]);

  useEffect(() => { run(); }, [run]);

  return { candidates, total, totalPages, isLoading, error, refetch: run };
}

// ─── 5. Candidate Details ─────────────────────────────────────────────────────
export function useCandidateDetails(candidateId: string | null) {
  const [details,   setDetails]   = useState<CandidateDetailsResponse['data'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const run = useCallback(async () => {
    if (!candidateId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await getCandidateDetails(candidateId);
      if (res.success) setDetails(res.data);
      else             setError(res.message ?? 'Failed to fetch candidate details');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [candidateId]);

  useEffect(() => { run(); }, [run]);

  return { details, isLoading, error, refetch: run };
}

// ─── 6. Invite Candidate (mutation) ───────────────────────────────────────────
export function useInviteCandidate() {
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const invite = useCallback(async (payload: InviteCandidatePayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await inviteCandidate(payload);
      if (!res.success) setError(res.message ?? 'Invite failed');
      return res;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      setError(msg);
      return { success: false, message: msg, data: { invitation_id: '', status: '' } };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { invite, isLoading, error };
}

// ─── 7. Notifications ─────────────────────────────────────────────────────────
export function useNotifications(params?: NotificationsParams) {
  const stableParams = JSON.stringify(params ?? {});

  const [notifications, setNotifications] = useState<RecruiterNotification[]>([]);
  const [unreadCount,   setUnreadCount]   = useState(0);   // derived client-side
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
        // API has no unread_count field — derive it from is_read
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
  }, [stableParams]);

  useEffect(() => { run(); }, [run]);

  return { notifications, unreadCount, total, isLoading, error, refetch: run };
}

export function useRecruiterDashboard() {
  const { data, isLoading, error, refetch } =
    useAsyncData<RecruiterDashboardData>(getRecruiterDashboard);
  return { dashboard: data, isLoading, error, refetch };
}