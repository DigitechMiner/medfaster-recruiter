import {
  DESCRIPTION_STEP_FIELDS,
  YEARS_OF_EXPERIENCE_MAX,
  YEARS_OF_EXPERIENCE_MIN,
} from "./constants";
import type { CreateFormStep, JobValidationError } from "./types";

// START SECTION: Empty Value Helpers
export const isEmpty = (v: unknown): boolean =>
  v === undefined || v === null || (typeof v === "string" && v.trim() === "");
// END SECTION: Empty Value Helpers

// START SECTION: Time Helpers
export const parseClockTimeToMinutes = (time: string): number | null => {
  const [h, m] = time.split(":");

  const hours = Number(h);
  const minutes = Number(m);

  if (!Number.isFinite(hours)) return null;
  if (!Number.isFinite(minutes)) return null;

  if (hours < 0 || hours > 23) return null;
  if (minutes < 0 || minutes > 59) return null;

  return hours * 60 + minutes;
};

export const shiftSpansMidnight = (
  checkIn?: string,
  checkOut?: string,
): boolean => {
  if (!checkIn || !checkOut) return false;

  const inM = parseClockTimeToMinutes(checkIn);
  const outM = parseClockTimeToMinutes(checkOut);

  if (inM === null || outM === null) return false;

  return outM <= inM;
};

export const getShiftDurationHours = (
  checkIn?: string,
  checkOut?: string,
): number | null => {
  if (!checkIn || !checkOut) return null;

  const inM = parseClockTimeToMinutes(checkIn);
  const outM = parseClockTimeToMinutes(checkOut);

  if (inM === null || outM === null) return null;

  let diff = outM - inM;

  if (diff <= 0) {
    diff += 24 * 60;
  }

  return diff / 60;
};

/** Wall-clock span minus handoff overlap (work duration when end time includes handover). */
export const getShiftWorkDurationHours = (
  checkIn?: string,
  checkOut?: string,
  handoffOverlapMinutes = 0,
): number | null => {
  const wallClockHours = getShiftDurationHours(checkIn, checkOut);
  if (wallClockHours === null) return null;
  if (handoffOverlapMinutes <= 0) return wallClockHours;

  const workHours = wallClockHours - handoffOverlapMinutes / 60;
  return workHours > 0 ? workHours : wallClockHours;
};
// END SECTION: Time Helpers

// START SECTION: Date Helpers
/** UTC midnight ISO: `2026-05-01T00:00:00.000Z`. Time is not a real clock value. */
const UTC_MIDNIGHT_ISO =
  /^(\d{4}-\d{2}-\d{2})T00:00:00(?:\.\d+)?(?:Z|[+-]00:00)$/;

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function ymd(year: number, monthIndex: number, day: number): string {
  return `${year}-${pad2(monthIndex + 1)}-${pad2(day)}`;
}

function dateFromYmd(year: number, monthIndex: number, day: number): Date | null {
  const d = new Date(year, monthIndex, day);
  if (
    d.getFullYear() !== year ||
    d.getMonth() !== monthIndex ||
    d.getDate() !== day
  ) {
    return null;
  }
  return d;
}

function isUtcMidnight(date: Date): boolean {
  return (
    date.getUTCHours() === 0 &&
    date.getUTCMinutes() === 0 &&
    date.getUTCSeconds() === 0 &&
    date.getUTCMilliseconds() === 0
  );
}

function localCalendarDayFromDate(date: Date): Date | null {
  if (Number.isNaN(date.getTime())) return null;
  // UTC midnight means the calendar day in the ISO string, not the browser zone.
  // `T00:00:00.000Z` in Canada (UTC-3 to UTC-8) is the previous local evening.
  if (isUtcMidnight(date)) {
    return dateFromYmd(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
    );
  }
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function localTodayYmd(): string {
  const today = new Date();
  return ymd(today.getFullYear(), today.getMonth(), today.getDate());
}

export function calendarDayYmd(date: Date): string | undefined {
  const day = localCalendarDayFromDate(date);
  if (!day) return undefined;
  return ymd(day.getFullYear(), day.getMonth(), day.getDate());
}

export const parseLocalDate = (iso?: string): Date | null => {
  if (!iso) return null;

  const trimmed = iso.trim();
  if (!trimmed) return null;

  const utcMidnight = UTC_MIDNIGHT_ISO.exec(trimmed);
  if (utcMidnight) {
    return parseLocalDate(utcMidnight[1]);
  }

  // Real timestamps: recover the local day. Do not slice YYYY-MM-DD from the
  // UTC string — IST midnight Sept 5 is 2026-09-04T18:30Z.
  if (trimmed.includes("T")) {
    return localCalendarDayFromDate(new Date(trimmed));
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);

  if (!match) {
    return localCalendarDayFromDate(new Date(trimmed));
  }

  return dateFromYmd(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
};

export const combineDateAndClockTime = (
  iso?: string,
  time?: string,
): Date | null => {
  if (!iso || !time) return null;

  const d = parseLocalDate(iso);
  const minutes = parseClockTimeToMinutes(time);

  if (!d || minutes === null) return null;

  d.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);

  return d;
};

export const isPastDate = (iso?: string): boolean => {
  if (!iso) return false;

  const d = parseLocalDate(iso);
  if (!d) return false;

  const day = ymd(d.getFullYear(), d.getMonth(), d.getDate());
  return day < localTodayYmd();
};
// END SECTION: Date Helpers

// START SECTION: Array Helpers
export type StringArrayValidationResult =
  | { ok: true }
  | {
      ok: false;
      reason: "not_array" | "too_short" | "too_long" | "bad_items";
    };

export const isStringArrayBetween = (
  value: unknown,
  min: number,
  max: number,
): StringArrayValidationResult => {
  if (!Array.isArray(value)) return { ok: false, reason: "not_array" };
  if (value.length < min) return { ok: false, reason: "too_short" };
  if (value.length > max) return { ok: false, reason: "too_long" };

  const allValid = value.every(
    (it) => typeof it === "string" && it.trim().length > 0,
  );

  if (!allValid) return { ok: false, reason: "bad_items" };

  return { ok: true };
};
// END SECTION: Array Helpers

// START SECTION: Experience Helpers
/** Parses and clamps years of experience for form UI and submit payloads. */
export function getExperienceYearsValue(experience?: string): number {
  const rawValue = experience?.split("-")[0] ?? "";
  const parsed = Number.parseInt(rawValue, 10);

  if (!Number.isFinite(parsed)) return YEARS_OF_EXPERIENCE_MIN;

  return Math.min(
    YEARS_OF_EXPERIENCE_MAX,
    Math.max(YEARS_OF_EXPERIENCE_MIN, parsed),
  );
}
// END SECTION: Experience Helpers

// START SECTION: Step Error Helpers
export function filterValidationErrorsForStep(
  errors: JobValidationError[],
  formStep: CreateFormStep,
  options: { ignoreQuestions?: boolean } = {},
): JobValidationError[] {
  const stepErrors =
    formStep === "basic"
      ? errors.filter((error) => !DESCRIPTION_STEP_FIELDS.has(error.field))
      : formStep === "description"
        ? errors.filter((error) => DESCRIPTION_STEP_FIELDS.has(error.field))
        : errors;

  if (!options.ignoreQuestions) return stepErrors;

  return stepErrors.filter((error) => error.field !== "questions");
}
// END SECTION: Step Error Helpers
