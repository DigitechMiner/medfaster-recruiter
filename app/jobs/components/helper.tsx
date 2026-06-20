import type { JobListItem, JobListShiftTemplate } from "@/types";
import { getMetadataLabel, metaData } from "@/utils/constant/metadata";

export interface StatCounts {
  activeJobs: number;
  normalJobs: number;
  instantJobs: number;
  activeShifts: number;
}

export type TabFilter = {
  job_urgency?: "instant" | "normal";
  status?: "OPEN" | "CLOSED" | "UPCOMING" | "COMPLETED";
};

export type JobTypeTab = "normal" | "instant";
export type JobUrgencyFilter = "all" | "instant" | "normal";
export type JobStatusFilter = "all" | "UPCOMING" | "OPEN" | "CLOSED" | "COMPLETED";

export const JOB_TABLE_HEADERS = [
  "Job",
  "Hiring",
  "Schedule",
  "Type",
  "Status",
  "Actions",
];

export const DEFAULT_JOB_BADGE_CLASS = "bg-[#F3F4F6] text-[#6B7280]";

export const jobBadgeVariantMap: Record<string, string> = {
  Regular: "bg-[#D1FAE5] text-[#059669]",
  Urgent: "bg-[#FEE9D6] text-[#F4781B]",
  OPEN: "bg-[#D1FAE5] text-[#059669]",
  Open: "bg-[#D1FAE5] text-[#059669]",
  UPCOMING: "bg-[#DBEAFE] text-[#2563EB]",
  Upcoming: "bg-[#DBEAFE] text-[#2563EB]",
  ACTIVE: "bg-[#FFEDD5] text-[#EA580C]",
  Active: "bg-[#FFEDD5] text-[#EA580C]",
  DRAFT: "bg-[#F3F4F6] text-[#6B7280]",
  Draft: "bg-[#F3F4F6] text-[#6B7280]",
  PAUSED: "bg-[#FEF9C3] text-[#D97706]",
  COMPLETED: "bg-[#FEF9C3] text-[#D97706]",
  Completed: "bg-[#FEF9C3] text-[#D97706]",
  CLOSED: "bg-[#FEE2E2] text-[#DC2626]",
  Closed: "bg-[#FEE2E2] text-[#DC2626]",
};

export const jobTypeBadgeClassMap: Record<string, string> = {
  full_time: "bg-[#DBEAFE] text-[#2563EB]",
  part_time: "bg-[#D1FAE5] text-[#059669]",
  contract: "bg-[#EDE9FE] text-[#7C3AED]",
  temporary: "bg-[#FFEDD5] text-[#EA580C]",
  casual: "bg-[#FEF3C7] text-[#D97706]",
};

const CLOSED_REASON_LABELS: Record<string, string> = {
  EXPIRED: "Expired",
  FILLED: "Filled",
  MANUAL: "Manual",
};

export const jobBadgeDisplayMap: Record<string, string> = {
  OPEN: "Open",
  CLOSED: "Closed",
  DRAFT: "Draft",
  PAUSED: "Paused",
  UPCOMING: "Upcoming",
  ACTIVE: "Active",
  COMPLETED: "Completed",
};

export function abbreviateJobTitle(title: string): string {
  return title
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

const SHIFT_TYPE_LABELS: Record<string, string> = {
  MORNING: "Morning",
  EVENING: "Evening",
  NIGHT: "Night",
  GENERAL: "General",
};

function normalizeJobTypeKey(jobType: string): string {
  return jobType.trim().toLowerCase().replace(/\s+/g, "_");
}

export function formatJobTitleDisplay(title?: string | null): string {
  const trimmed = title?.trim();
  if (!trimmed) return "—";

  // API may already include abbreviation, e.g. "Registered Nurse (RN)"
  if (/\([^)]+\)\s*$/.test(trimmed)) return trimmed;

  const abbr = abbreviateJobTitle(trimmed);
  if (abbr.length >= 2 && abbr.length <= 8) {
    return `${trimmed} (${abbr})`;
  }

  return trimmed;
}

export function formatJobLocationLine(
  job: JobListItem,
  provinceLabel?: string | null,
): string {
  const location = [job.city, provinceLabel || job.province].filter(Boolean).join(", ");
  const parts = [job.department, location].filter(Boolean);
  return parts.length > 0 ? parts.join(" • ") : "—";
}

export function formatScheduleRange(job: JobListItem): string | null {
  const start = job.start_date ? formatDate(job.start_date) : null;
  const end = job.end_date ? formatDate(job.end_date) : null;

  if (start && end) return `${start} - ${end}`;
  return start ?? end;
}

export function getShiftCount(job: JobListItem): number {
  if (job.shift_count != null) return job.shift_count;
  if (job.shift_types?.length) return job.shift_types.length;
  if (job.shift_templates?.length) return job.shift_templates.length;
  if (job.check_in_time && job.check_out_time) return 1;
  return 0;
}

export function formatShiftTypeLabel(shiftType: string): string {
  const key = shiftType.trim().toUpperCase();
  if (SHIFT_TYPE_LABELS[key]) return SHIFT_TYPE_LABELS[key];
  return shiftType
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getJobShiftPopoverLines(job: JobListItem): string[] {
  if (job.shift_types?.length) {
    return job.shift_types.map(formatShiftTypeLabel);
  }

  if (job.shift_templates?.length) {
    return job.shift_templates.map(formatShiftPopoverLine);
  }

  const checkIn = formatTime(job.check_in_time);
  const checkOut = formatTime(job.check_out_time);
  if (checkIn && checkOut) return [`${checkIn} – ${checkOut}`];

  return [];
}

export function formatShiftPopoverLine(shift: JobListShiftTemplate): string {
  const start = formatTime(shift.start_time);
  const end = formatTime(shift.end_time);
  const shortName = shift.shift_name?.split(/\s+/)[0] ?? shift.shift_name;

  if (start && end) return `${shortName} (${start} - ${end})`;
  return shift.shift_name;
}

export function formatJobTypeLabel(
  jobType: string | null | undefined,
  jobTypeOptions: readonly { label: string; value: string }[] = metaData.data.job_types,
): string {
  if (!jobType) return "—";
  const normalized = normalizeJobTypeKey(jobType);
  return (
    getMetadataLabel(jobTypeOptions, normalized) ||
    getMetadataLabel(jobTypeOptions, jobType) ||
    formatShiftTypeLabel(normalized)
  );
}

export function getJobTypeBadgeClass(jobType: string | null | undefined): string {
  if (!jobType) return DEFAULT_JOB_BADGE_CLASS;
  const key = normalizeJobTypeKey(jobType);
  return jobTypeBadgeClassMap[key] ?? DEFAULT_JOB_BADGE_CLASS;
}

export function getFilledPositions(job: JobListItem): number {
  return job.filled_positions ?? job.no_of_hires_hired ?? 0;
}

export function getRequiredPositions(job: JobListItem): number {
  return job.required_positions ?? job.no_of_hires_required ?? 0;
}

export function hasAiInterview(job: JobListItem): boolean {
  if (job.has_ai_interview != null) return job.has_ai_interview;
  return job.ai_interview === true;
}

export function getStatusSubLabel(job: JobListItem): string | null {
  if (job.status !== "CLOSED" || !job.closed_reason) return null;
  return CLOSED_REASON_LABELS[job.closed_reason] ?? job.closed_reason;
}

export function formatApplicantLabel(count: number): string {
  return count === 1 ? "1 Applicant" : `${count} Applicants`;
}

export const formatDate = (date?: string | null) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const formatTime = (time?: string | null) => (time ? time.slice(0, 5) : null);

/** One line per shift template, or check-in/out fallback for instant jobs. */
export function getJobShiftDisplayLines(job: JobListItem): string[] {
  if (job.shift_templates?.length) {
    return job.shift_templates.map((shift) => {
      const start = formatTime(shift.start_time);
      const end = formatTime(shift.end_time);
      const times = start && end ? ` (${start} – ${end})` : "";
      return `${shift.shift_name}${times}`;
    });
  }

  const checkIn = formatTime(job.check_in_time);
  const checkOut = formatTime(job.check_out_time);
  if (checkIn && checkOut) return [`${checkIn} – ${checkOut}`];

  return [];
}

export const formatBudget = (cents?: number | null) => {
  if (cents == null) return "—";
  return `$${(cents / 100).toFixed(2)}/hr`;
};

export function formatTotalRecruiterPay(cents?: number | null): string {
  if (cents == null) return "—";
  return `$${(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export function getRecruiterPayDisplay(job: JobListItem): string {
  if (job.total_recruiter_pay_cents != null) {
    return formatTotalRecruiterPay(job.total_recruiter_pay_cents);
  }

  const hourlyCents = job.pay_per_hour_cents
    ? parseInt(job.pay_per_hour_cents, 10)
    : null;

  return formatBudget(hourlyCents);
}

export function getInterviewLabel(job: JobListItem): { label: string; cls: string } {
  if (job.job_urgency === "INSTANT") {
    return { label: "No Interview Needed", cls: "bg-[#FEE4E2] text-[#912018]" };
  }

  if (hasAiInterview(job)) {
    return { label: "AI Interview", cls: "bg-[#D1FAE5] text-[#059669]" };
  }

  return { label: "No Interview Required", cls: "bg-[#FEF9C3] text-[#854D0E]" };
}

export function JobsLoadingSkeleton() {
  return (
    <div className="flex flex-col gap-3 py-4">
      {[...Array(4)].map((_, index) => (
        <div key={index} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
      ))}
    </div>
  );
}

export function JobsErrorView({ error }: { error: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-2">
      <span className="text-4xl">!</span>
      <p className="text-sm font-medium text-gray-500">Failed to load jobs</p>
      <p className="text-xs text-gray-400">{error}</p>
    </div>
  );
}

export function JobsEmptyView() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-2">
      <span className="text-4xl">No jobs</span>
      <p className="text-sm font-medium text-gray-500">No data available</p>
      <p className="text-xs text-gray-400">There are no jobs matching this filter.</p>
    </div>
  );
}
