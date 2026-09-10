import { getProvinceLabel } from "@/utils/constant/metadata";

/**
 * Display helpers for job details (e.g. "3h ago") and create-form copy.
 * Create-job payloads send calendar YYYY-MM-DD; the backend combines those
 * dates with shift template times in the facility timezone.
 *
 * Keep the province map in sync with medfaster-backend
 * `utils/timezone/canadianProvince.ts`.
 */

const DEFAULT_JOB_TIMEZONE = "America/Toronto";

const CALENDAR_YMD = /^(\d{4})-(\d{2})-(\d{2})$/;
const UTC_MIDNIGHT_ISO =
  /^(\d{4}-\d{2}-\d{2})T00:00:00(?:\.\d+)?(?:Z|[+-]00:00)$/;

const DEFAULT_CALENDAR_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
};

const CANADIAN_PROVINCE_TIMEZONES: Record<string, string> = {
  alberta: "America/Edmonton",
  british_columbia: "America/Vancouver",
  manitoba: "America/Winnipeg",
  new_brunswick: "America/Moncton",
  newfoundland_and_labrador: "America/St_Johns",
  nova_scotia: "America/Halifax",
  ontario: "America/Toronto",
  prince_edward_island: "America/Halifax",
  quebec: "America/Toronto",
  saskatchewan: "America/Regina",
  northwest_territories: "America/Yellowknife",
  nunavut: "America/Iqaluit",
  yukon: "America/Whitehorse",
};

function calendarDateFromYmd(year: number, monthIndex: number, day: number): Date | null {
  const date = new Date(year, monthIndex, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== monthIndex ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

/**
 * Format a calendar date (`YYYY-MM-DD`) as the same day in every timezone.
 * `2026-09-11` always displays as 11 Sept 2026 — no UTC/local shift.
 * Returns null when the value is not a date-only (or UTC-midnight) string.
 */
export function formatCalendarDate(
  value?: string | null,
  options: Intl.DateTimeFormatOptions = DEFAULT_CALENDAR_DATE_FORMAT,
): string | null {
  if (value == null || value === "") return null;

  const trimmed = value.trim();
  const utcMidnight = UTC_MIDNIGHT_ISO.exec(trimmed);
  const ymd = utcMidnight?.[1] ?? (CALENDAR_YMD.test(trimmed) ? trimmed : null);
  if (!ymd) return null;

  const match = CALENDAR_YMD.exec(ymd);
  if (!match) return null;

  const date = calendarDateFromYmd(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
  );
  if (!date) return null;

  return date.toLocaleDateString("en-GB", options);
}

/** Province slug → IANA timezone. Unknown values fall back to Toronto. */
export function timezoneFromCanadianProvince(
  province: string | null | undefined,
): string {
  if (!province || typeof province !== "string") return DEFAULT_JOB_TIMEZONE;
  return (
    CANADIAN_PROVINCE_TIMEZONES[province.trim().toLowerCase()] ??
    DEFAULT_JOB_TIMEZONE
  );
}

/** UI copy, e.g. "Times are in Alberta (America/Edmonton)". */
export function formatFacilityTimezoneHint(
  province?: string | null,
): string | null {
  const trimmed = province?.trim();
  if (!trimmed) return null;

  const label = getProvinceLabel(trimmed) || trimmed;
  const tz = timezoneFromCanadianProvince(trimmed);
  return `Times are in ${label} (${tz})`;
}

/**
 * Compact relative time for job details: "Just now", "5m ago", "3h ago", "2d ago".
 */
export function formatTimeAgo(value?: string | Date | null): string | null {
  if (value == null || value === "") return null;

  const created =
    value instanceof Date ? value.getTime() : new Date(value).getTime();
  if (Number.isNaN(created)) return null;

  const diffMs = Date.now() - created;
  if (diffMs < 0) return "Just now";

  const minutes = Math.floor(diffMs / 60_000);
  const hours = Math.floor(diffMs / 3_600_000);
  const days = Math.floor(diffMs / 86_400_000);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return `${years}y ago`;
  if (months > 0) return `${months}mo ago`;
  if (weeks > 0) return `${weeks}w ago`;
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "Just now";
}

/** Full datetime for hover/title, e.g. "5 September 2026, 2:34 pm". */
export function formatAbsoluteDateTime(
  value?: string | Date | null,
): string | null {
  if (value == null || value === "") return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Relative label plus absolute timestamp for hover. */
export function formatRelativeTimestamp(value?: string | Date | null): {
  relative: string | null;
  absolute: string | null;
} {
  return {
    relative: formatTimeAgo(value),
    absolute: formatAbsoluteDateTime(value),
  };
}
