import {
  INSTANT_JOB_MIN_LEAD_TIME_HOURS,
  NORMAL_JOB_MIN_LEAD_TIME_HOURS,
} from "@/app/jobs/create/validation/constants";
import {
  combineDateAndTimeInTz,
  earliestAllowedAt,
  timezoneFromCanadianProvince,
  toDateOnly,
  todayInTimeZone,
} from "./helpers";

export {
  combineDateAndTimeInTz,
  earliestAllowedAt,
  formatAbsoluteDateTime,
  formatCalendarDate,
  formatFacilityTimezoneHint,
  formatRelativeTimestamp,
  formatTimeAgo,
  timezoneFromCanadianProvince,
  toDateOnly,
  todayInTimeZone,
} from "./helpers";

export type JobStartDateTimeIssue = {
  field: "start_date" | "check_in_time";
  message: string;
};

export type ValidateJobStartDateTimeParams = {
  province?: string | null;
  startDate?: string | Date | null;
  startTime?: string | null;
  urgency?: string | null;
};

/**
 * Validate picked start date + check-in time in the facility (province) timezone.
 *
 * Matches backend lead-time rules:
 * - Instant: ≥ 1 hour from now
 * - Normal: ≥ 24 hours from now
 *
 * Returns null when values are fine or not ready to check.
 * Does not rewrite dates/times for API payloads.
 */
export function validateJobStartDateTime(
  params: ValidateJobStartDateTimeParams,
): JobStartDateTimeIssue | null {
  const province = params.province?.trim();
  const startDate = toDateOnly(params.startDate);
  const startTime = params.startTime?.trim();
  const timeZone = timezoneFromCanadianProvince(province);

  if (!province || !startDate) return null;

  if (startDate < todayInTimeZone(timeZone)) {
    return {
      field: "start_date",
      message: "Start date cannot be in the past.",
    };
  }

  if (!startTime) return null;

  const checkInAt = combineDateAndTimeInTz(startDate, startTime, timeZone);
  if (!checkInAt) return null;

  const isInstant =
    (params.urgency ?? "NORMAL").toString().toUpperCase() === "INSTANT";
  const leadHours = isInstant
    ? INSTANT_JOB_MIN_LEAD_TIME_HOURS
    : NORMAL_JOB_MIN_LEAD_TIME_HOURS;

  if (checkInAt.getTime() < earliestAllowedAt(leadHours)) {
    return {
      field: isInstant ? "check_in_time" : "start_date",
      message: isInstant
        ? `Instant jobs must start at least ${leadHours} hour${leadHours === 1 ? "" : "s"} from now.`
        : `Normal jobs must be scheduled to start at least ${leadHours} hour${leadHours === 1 ? "" : "s"} from now (start date at check-in time).`,
    };
  }

  return null;
}
