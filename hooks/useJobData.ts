"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useJobsStore } from "@/stores/jobs-store";
import type {
  ApplicationStatus,
  JobBackendResponse,
  JobDetailActivityData,
  JobDetailDescriptionData,
  JobDetailPaymentsData,
  JobDetailSummaryData,
  JobScheduleData,
  JobWorkersResponse,
  JobDisputesResponse,
  JobShiftDetailsResponse,
  JobShiftsParams,
  JobShiftPaymentsResponse,
  JobShiftsResponse,
  JobWalletTransactionsResponse,
  JobsListResponse,
} from "@/types";

import type { JobListItem } from "@/types";
import {
  getJobApplications,
  getRecruiterJobDisputes,
  getRecruiterJobActivity,
  getRecruiterJobDescription,
  getRecruiterJobPayments,
  getRecruiterJobSchedule,
  getRecruiterJobShiftDetails,
  getRecruiterJobShiftPayments,
  getRecruiterJobShifts,
  getRecruiterJobSummary,
  getRecruiterJobWorkers,
  getRecruiterJobWalletTransactions,
  JobApplicationListResponse,
} from "@/features/jobs";

// ── Full status union matching the actual API ─────────────────────────────────
type JobStatus =
  | "DRAFT"
  | "OPEN"
  | "PAUSED"
  | "CLOSED"
  | "UPCOMING"
  | "ACTIVE"
  | "COMPLETED";

// ─── useJobs ──────────────────────────────────────────────────────────────────
export function useJobs(params?: {
  status?: JobStatus;
  job_urgency?: "instant" | "normal";
  page?: number;
  limit?: number;
}) {
  const getJobs = useJobsStore((state) => state.getJobs);
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [pagination, setPagination] = useState<
    JobsListResponse["data"]["pagination"] | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getJobs(params)
      .then((res) => {
        if (cancelled) return;
        if (res.success) {
          setJobs(res.data.jobs);
          setPagination(res.data.pagination);
        } else {
          setError(res.message);
        }
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Failed to fetch jobs");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.status, params?.job_urgency, params?.page, params?.limit]);

  return { jobs, pagination, isLoading, error };
}

// ─── useJobSummary (initial job detail screen) ───────────────────────────────
export function useJobSummary(jobId: string | null) {
  const [summary, setSummary] = useState<JobDetailSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) {
      setIsLoading(false);
      return;
    }
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    getRecruiterJobSummary(jobId)
      .then((data) => {
        if (!cancelled) setSummary(data);
      })
      .catch((err) => {
        if (!cancelled)
          setError(
            err?.response?.data?.message ??
              err?.message ??
              "Failed to fetch job",
          );
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [jobId]);

  return { summary, isLoading, error };
}

/** @deprecated Use useJobSummary — kept for compatibility. */
export function useJob(jobId: string | null) {
  const { summary, isLoading, error } = useJobSummary(jobId);
  return {
    job: null as JobBackendResponse | null,
    summary,
    isLoading,
    error,
  };
}

// ─── useJobDescription (lazy-loaded overview tab) ────────────────────────────
export function useJobDescription(jobId?: string | null, enabled = true) {
  const [description, setDescription] =
    useState<JobDetailDescriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId || !enabled) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getRecruiterJobDescription(jobId)
      .then((data) => {
        if (!cancelled) setDescription(data);
      })
      .catch((err) => {
        if (!cancelled)
          setError(
            err?.response?.data?.message ??
              err?.message ??
              "Failed to load description",
          );
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [jobId, enabled]);

  return { description, isLoading, error };
}

// ─── useJobActivity (activity timeline tab) ──────────────────────────────────
export function useJobActivity(jobId?: string | null, enabled = true) {
  const [activity, setActivity] = useState<JobDetailActivityData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId || !enabled) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getRecruiterJobActivity(jobId)
      .then((data) => {
        if (!cancelled) setActivity(data);
      })
      .catch((err) => {
        if (!cancelled)
          setError(
            err?.response?.data?.message ??
              err?.message ??
              "Failed to load activity",
          );
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [jobId, enabled]);

  return { activity, isLoading, error };
}

// ─── useJobPayments (funding tab) ────────────────────────────────────────────
export function useJobPayments(jobId?: string | null, enabled = true) {
  const [payments, setPayments] = useState<JobDetailPaymentsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId || !enabled) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getRecruiterJobPayments(jobId)
      .then((data) => {
        if (!cancelled) setPayments(data);
      })
      .catch((err) => {
        if (!cancelled)
          setError(
            err?.response?.data?.message ??
              err?.message ??
              "Failed to load payments",
          );
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [jobId, enabled]);

  return { payments, isLoading, error };
}

// ─── useJobSchedule (rotation plan + templates) ──────────────────────────────
export function useJobSchedule(jobId?: string | null, enabled = true) {
  const [schedule, setSchedule] = useState<JobScheduleData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId || !enabled) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getRecruiterJobSchedule(jobId)
      .then((data) => {
        if (!cancelled) setSchedule(data);
      })
      .catch((err) => {
        if (!cancelled)
          setError(
            err?.response?.data?.message ??
              err?.message ??
              "Failed to load schedule plan",
          );
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [jobId, enabled]);

  return { schedule, isLoading, error };
}

// ─── useJobWorkers (hired workforce) ─────────────────────────────────────────
export function useJobWorkers(jobId?: string | null, enabled = true) {
  const [workers, setWorkers] = useState<JobWorkersResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId || !enabled) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getRecruiterJobWorkers(jobId)
      .then((data) => {
        if (!cancelled) setWorkers(data);
      })
      .catch((err) => {
        if (!cancelled)
          setError(
            err?.response?.data?.message ??
              err?.message ??
              "Failed to load workers",
          );
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [jobId, enabled]);

  return { workers, isLoading, error };
}

// ─── useJob (legacy full job — unused on detail page) ────────────────────────
// Removed monolithic fetch; detail page uses useJobSummary + tab endpoints.

// ─── useJobApplications ───────────────────────────────────────────────────────
export function useJobApplications(params?: {
  job_id?: string;
  status?: ApplicationStatus;
  page?: number;
  limit?: number;
}) {
  const [applications, setApplications] =
    useState<JobApplicationListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const jobId = params?.job_id;
  const status = params?.status;
  const page = params?.page;
  const limit = params?.limit;

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getJobApplications({ job_id: jobId, status, page, limit })
      .then((data) => {
        if (!cancelled) setApplications(data);
      })
      .catch((err) => {
        if (!cancelled)
          setError(
            err?.response?.data?.message ??
              err?.message ??
              "Failed to load applications",
          );
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [jobId, status, page, limit, refreshKey]);

  const refetch = () => setRefreshKey((key) => key + 1);

  return { applications, isLoading, error, refetch };
}

// ─── useJobShifts ─────────────────────────────────────────────────────────────
export function useJobShifts(jobId?: string | null, params?: JobShiftsParams) {
  const [shifts, setShifts] = useState<JobShiftsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const status = params?.status;
  const startDate = params?.start_date;
  const endDate = params?.end_date;

  useEffect(() => {
    if (!jobId) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getRecruiterJobShifts(jobId, {
      status,
      start_date: startDate,
      end_date: endDate,
    })
      .then((data) => {
        if (!cancelled) setShifts(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message ?? "Failed to load job shifts");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [jobId, status, startDate, endDate]);

  return { shifts, isLoading, error };
}

// ─── useJobWalletTransactions ─────────────────────────────────────────────────
export function useJobWalletTransactions(jobId?: string | null) {
  const [transactions, setTransactions] =
    useState<JobWalletTransactionsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getRecruiterJobWalletTransactions(jobId)
      .then((data) => {
        if (!cancelled) setTransactions(data);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err?.message ?? "Failed to load wallet transactions");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [jobId]);

  return { transactions, isLoading, error };
}

// ─── useJobDisputes ───────────────────────────────────────────────────────────
export function useJobDisputes(jobId?: string | null) {
  const [disputes, setDisputes] = useState<JobDisputesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getRecruiterJobDisputes(jobId)
      .then((data) => {
        if (!cancelled) setDisputes(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message ?? "Failed to load disputes");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [jobId]);

  return { disputes, isLoading, error };
}

// ─── useJobShiftPayments ──────────────────────────────────────────────────────
export function useJobShiftPayments(
  jobId?: string | null,
  shiftId?: string | null,
) {
  const [payments, setPayments] = useState<JobShiftPaymentsResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId || !shiftId) {
      setIsLoading(false);
      setPayments(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getRecruiterJobShiftPayments(jobId, shiftId)
      .then((data) => {
        if (!cancelled) setPayments(data);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err?.message ?? "Failed to load shift payments");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [jobId, shiftId]);

  return { payments, isLoading, error };
}

// ─── useJobShiftDetails ───────────────────────────────────────────────────────
export function useJobShiftDetails(
  jobId?: string | null,
  shiftId?: string | null,
) {
  const [details, setDetails] = useState<JobShiftDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId || !shiftId) {
      setIsLoading(false);
      setDetails(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getRecruiterJobShiftDetails(jobId, shiftId)
      .then((data) => {
        if (!cancelled) setDetails(data);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err?.message ?? "Failed to load shift details");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [jobId, shiftId]);

  return { details, isLoading, error };
}

// ─── useJobId (Next.js route param helper) ────────────────────────────────────
export function useJobId(): string | null {
  const params = useParams();
  const jobId = params?.id;
  if (!jobId) return null;
  return typeof jobId === "string" ? jobId : String(jobId);
}
