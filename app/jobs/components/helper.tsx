import { JobCardSkeleton } from "@/components/card/JobCard";
import type { JobListItem, JobListShiftTemplate } from "@/types";
import { getMetadataLabel, metaData } from "@/utils/constant/metadata";

export interface StatCounts {
  activeJobs: number;
  activeNormalJobs: number;
  activeInstantJobs: number;
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
  "Job Title",
  "Shift",
  "Start Date",
  "End Date",
  "Location",
  "Hires",
  "Applications",
  "Status",
  "Created",
  "Actions",
];

export type ListingJobStatus = "Open" | "Closed" | "Expired";

const LISTING_STATUS_BADGE_CLASS: Record<ListingJobStatus, string> = {
  Open: "bg-[#D1FAE5] text-[#059669]",
  Closed: "bg-[#FEE2E2] text-[#DC2626]",
  Expired: "bg-[#FEF3C7] text-[#D97706]",
};

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
  const location = formatLocationCityProvince(job, provinceLabel);
  const parts = [job.department, location !== "—" ? location : null].filter(Boolean);
  return parts.length > 0 ? parts.join(" • ") : "—";
}

export function formatScheduleRange(job: JobListItem): string | null {
  const start = job.start_date ? formatDate(job.start_date) : null;
  const end = job.end_date ? formatDate(job.end_date) : null;

  if (start && end) return `${start} - ${end}`;
  return start ?? end;
}

function normalizeJobListShifts(shift?: string | string[] | null): string[] {
  if (!shift) return [];
  if (Array.isArray(shift)) return shift.map((s) => s.trim()).filter(Boolean);
  return shift.trim() ? [shift.trim()] : [];
}

export function getShiftCount(job: JobListItem): number {
  const apiShifts = normalizeJobListShifts(job.shift);
  if (apiShifts.length > 0) return apiShifts.length;
  if (job.shift_count != null) return job.shift_count;
  if (job.shift_types?.length) return job.shift_types.length;
  if (job.shift_templates?.length) return job.shift_templates.length;
  if (job.check_in_time && job.check_out_time) return 1;
  return 0;
}

export function formatShiftListLabel(shift: string): string {
  if (!shift.trim()) return "";

  const trimmed = shift.trim().replace(/\s+shift$/i, "").trim();
  const key = trimmed.toUpperCase();
  if (SHIFT_TYPE_LABELS[key]) return SHIFT_TYPE_LABELS[key];

  return formatShiftTypeLabel(trimmed);
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

export const SHIFT_TYPE_BADGE_CLASS: Record<string, string> = {
  Morning: "bg-amber-50 text-amber-700 border-amber-100",
  Evening: "bg-orange-50 text-orange-700 border-orange-100",
  Night: "bg-indigo-50 text-indigo-700 border-indigo-100",
  General: "bg-gray-100 text-gray-600 border-gray-200",
};

export function getShiftTypeBadgeClass(label: string): string {
  return SHIFT_TYPE_BADGE_CLASS[label] ?? "bg-gray-100 text-gray-600 border-gray-200";
}

export function getJobShiftTypeLabels(job: JobListItem): string[] {
  const apiShifts = normalizeJobListShifts(job.shift);
  if (apiShifts.length > 0) {
    return [...new Set(apiShifts.map(formatShiftListLabel))];
  }

  if (job.shift_types?.length) {
    return [...new Set(job.shift_types.map(formatShiftTypeLabel))];
  }

  if (job.shift_templates?.length) {
    return [...new Set(job.shift_templates.map((shift) => formatShiftTypeLabel(shift.shift_type)))];
  }

  if (job.check_in_time && job.check_out_time) {
    return ["General"];
  }

  return [];
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
  if (job.workforce_count != null) return job.workforce_count;
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

export function formatListingStatus(job: JobListItem): ListingJobStatus {
  if (job.status === "CLOSED" && job.closed_reason === "EXPIRED") return "Expired";
  if (job.status === "CLOSED" || job.status === "COMPLETED") return "Closed";
  return "Open";
}

export function getListingStatusBadgeClass(status: ListingJobStatus): string {
  return LISTING_STATUS_BADGE_CLASS[status];
}

export function formatUrgencyLabel(job: JobListItem): string {
  if (!job.job_urgency) return "—";
  return job.job_urgency === "INSTANT" ? "Instant" : "Normal";
}

export function formatCityProvince(
  city?: string | null,
  province?: string | null,
  provinceLabel?: string | null,
): string {
  const location = [city?.trim(), (provinceLabel || province)?.trim()].filter(Boolean).join(", ");
  return location || "—";
}

export function formatLocationCityProvince(
  job: JobListItem,
  provinceLabel?: string | null,
): string {
  return formatCityProvince(job.city, job.province, provinceLabel);
}

export function formatDateRangeShort(job: JobListItem): string | null {
  const start = job.start_date ? formatDate(job.start_date) : null;
  const end = job.end_date ? formatDate(job.end_date) : null;
  if (start && end) return `${start} → ${end}`;
  return start ?? end;
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

export function JobsTableBodySkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <>
      {[...Array(rows)].map((_, index) => (
        <tr key={index} className="border-b border-gray-50">
          {JOB_TABLE_HEADERS.map((header) => (
            <td key={`${index}-${header}`} className="px-4 py-3 align-middle">
              <div className="h-4 max-w-[120px] bg-gray-100 rounded animate-pulse" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function JobsLoadingSkeleton({ cards = 6 }: { cards?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: cards }, (_, index) => (
        <JobCardSkeleton key={index} />
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
