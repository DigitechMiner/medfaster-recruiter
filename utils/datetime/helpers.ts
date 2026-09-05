import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { getProvinceLabel } from "@/utils/constant/metadata";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

/**
 * Job date/time helpers.
 * Create still submits YYYY-MM-DD + HH:mm as picked. These helpers interpret
 * wall-clock values in the facility timezone, and format relative times
 * for job details (e.g. "3h ago").
 *
 * Keep the province map in sync with medfaster-backend
 * `utils/timezone/canadianProvince.ts`.
 */

const DEFAULT_JOB_TIMEZONE = "America/Toronto";

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

function formatLocalYmd(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Normalize a Date or string to `YYYY-MM-DD` without UTC day-shift. */
export function toDateOnly(value?: string | Date | null): string | undefined {
  if (value == null || value === "") return undefined;

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return undefined;
    return formatLocalYmd(value);
  }

  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  if (trimmed.includes("T")) {
    const date = new Date(trimmed);
    if (Number.isNaN(date.getTime())) return undefined;
    return formatLocalYmd(date);
  }

  return trimmed;
}

function normalizeTimeToHms(time: string): string {
  const [hh = "00", mm = "00", ss = "00"] = time.trim().split(":");
  return `${hh.padStart(2, "0")}:${mm.padStart(2, "0")}:${ss.padStart(2, "0")}`;
}

/**
 * Build a real UTC instant from facility-local date + clock time.
 * Do not use `new Date(y, m, d)` / `setHours` — those use the browser zone.
 */
export function combineDateAndTimeInTz(
  dateValue: string,
  timeValue: string,
  timeZone: string,
): Date | null {
  const datePart = toDateOnly(dateValue);
  if (!datePart || !/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return null;

  const timePart = normalizeTimeToHms(timeValue);
  if (!/^\d{2}:\d{2}:\d{2}$/.test(timePart)) return null;

  const local = dayjs.tz(
    `${datePart} ${timePart}`,
    "YYYY-MM-DD HH:mm:ss",
    timeZone,
  );
  if (!local.isValid()) return null;
  return local.toDate();
}

/** Today's calendar date in the given IANA timezone (`YYYY-MM-DD`). */
export function todayInTimeZone(timeZone: string): string {
  return dayjs().tz(timeZone).format("YYYY-MM-DD");
}

/** Absolute instant that is `leadHours` from now. */
export function earliestAllowedAt(leadHours: number): number {
  return dayjs().add(leadHours, "hour").valueOf();
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
