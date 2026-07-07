import type { JobDetailNextShift, JobDetailSummaryData, JobStatus, JobUrgency } from "./types";

const CLOSEABLE_STATUSES: JobStatus[] = ["OPEN", "UPCOMING"];

function normalizeDatePart(value: string): string {
  return value.split("T")[0] ?? value;
}

function normalizeTimePart(value: string): string {
  const trimmed = value.trim();
  if (/^\d{2}:\d{2}:\d{2}$/.test(trimmed)) return trimmed;
  if (/^\d{2}:\d{2}$/.test(trimmed)) return `${trimmed}:00`;
  return trimmed;
}

/** Parse a UTC date/time pair — mirrors backend job-start computation. */
export function parseUtcDateTime(
  dateStr?: string | null,
  timeStr?: string | null,
): Date | null {
  if (!dateStr) return null;

  const datePart = normalizeDatePart(dateStr);
  const iso = timeStr
    ? `${datePart}T${normalizeTimePart(timeStr)}Z`
    : `${datePart}T00:00:00.000Z`;

  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** Earliest shift (shift_date + start_time) or start_date at UTC midnight. */
export function getJobStartAt(
  summary: Pick<JobDetailSummaryData, "start_date" | "next_shift">,
): Date | null {
  const nextShift = summary.next_shift;
  if (nextShift?.shift_date) {
    const fromShift = parseUtcDateTime(nextShift.shift_date, nextShift.start_time);
    if (fromShift) return fromShift;
  }

  return parseUtcDateTime(summary.start_date);
}

export function getCloseLeadHours(jobUrgency: JobUrgency | string | null | undefined): number {
  return String(jobUrgency ?? "NORMAL").toUpperCase() === "INSTANT" ? 1 : 24;
}

export function isCloseableStatus(status: JobStatus | string | null | undefined): boolean {
  return CLOSEABLE_STATUSES.includes(String(status ?? "").toUpperCase() as JobStatus);
}

export function isInsideCloseCutoff(
  jobStartAt: Date | null,
  jobUrgency: JobUrgency | string | null | undefined,
  now = Date.now(),
): boolean {
  if (!jobStartAt) return false;

  const leadMs = getCloseLeadHours(jobUrgency) * 60 * 60 * 1000;
  return now >= jobStartAt.getTime() - leadMs;
}

export function getCloseCutoffBlockedMessage(
  jobUrgency: JobUrgency | string | null | undefined,
): string {
  const hours = getCloseLeadHours(jobUrgency);
  return `Can only close at least ${hours}h before the job starts.`;
}

export type JobCloseEligibility = {
  showButton: boolean;
  canClose: boolean;
  blockedReason: string | null;
  jobStartAt: Date | null;
};

export function getJobCloseEligibility(
  summary: Pick<
    JobDetailSummaryData,
    "status" | "job_urgency" | "start_date" | "next_shift"
  >,
  now = Date.now(),
): JobCloseEligibility {
  if (!isCloseableStatus(summary.status)) {
    return {
      showButton: false,
      canClose: false,
      blockedReason: null,
      jobStartAt: null,
    };
  }

  const jobStartAt = getJobStartAt(summary);
  const pastCutoff = isInsideCloseCutoff(jobStartAt, summary.job_urgency, now);

  return {
    showButton: true,
    canClose: !pastCutoff,
    blockedReason: pastCutoff
      ? getCloseCutoffBlockedMessage(summary.job_urgency)
      : null,
    jobStartAt,
  };
}

/** @deprecated Prefer getJobCloseEligibility — kept for simple checks. */
export function canShowCloseJobButton(
  summary: Pick<
    JobDetailSummaryData,
    "status" | "job_urgency" | "start_date" | "next_shift"
  >,
  now = Date.now(),
): boolean {
  const eligibility = getJobCloseEligibility(summary, now);
  return eligibility.showButton && eligibility.canClose;
}

export type { JobDetailNextShift };
