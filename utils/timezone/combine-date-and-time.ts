import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import {
  DEFAULT_JOB_TIMEZONE,
  timezoneFromCanadianProvince,
} from "./canadian-province";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

function toDateOnlyString(dateValue: string): string {
  return dateValue.trim().slice(0, 10);
}

function normalizeTimeToHms(time: string): string {
  const [hh = "00", mm = "00", ss = "00"] = time.trim().split(":");
  return `${hh.padStart(2, "0")}:${mm.padStart(2, "0")}:${ss.padStart(2, "0")}`;
}

/**
 * Combine a facility-local calendar date + wall-clock time into a UTC `Date`.
 * Do not use `new Date(y, m, d)` / `setHours` — those use the browser zone.
 */
export function combineDateAndTimeInTz(
  dateValue: string,
  timeValue: string,
  timeZone: string = DEFAULT_JOB_TIMEZONE,
): Date | null {
  const datePart = toDateOnlyString(dateValue);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return null;

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

/** True when the calendar date is before today in the facility timezone. */
export function isCalendarDateBeforeTodayInTz(
  dateValue: string | null | undefined,
  province?: string | null,
): boolean {
  if (!dateValue) return false;
  const datePart = toDateOnlyString(dateValue);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return false;

  const tz = timezoneFromCanadianProvince(province);
  const todayInTz = dayjs().tz(tz).format("YYYY-MM-DD");
  return datePart < todayInTz;
}

/** Now + N hours, for lead-time comparisons against facility-local check-in instants. */
export function earliestAllowedCheckInAt(leadTimeHours: number): Date {
  return dayjs().add(leadTimeHours, "hour").toDate();
}

export function combineFacilityCheckInAt(params: {
  startDate?: string | null;
  checkInTime?: string | null;
  province?: string | null;
}): Date | null {
  const startDate = params.startDate?.trim();
  const checkInTime = params.checkInTime?.trim();
  if (!startDate || !checkInTime) return null;

  return combineDateAndTimeInTz(
    startDate,
    checkInTime,
    timezoneFromCanadianProvince(params.province),
  );
}
