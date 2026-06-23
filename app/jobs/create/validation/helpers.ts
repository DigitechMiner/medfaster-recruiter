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
// END SECTION: Time Helpers

// START SECTION: Date Helpers
export const parseLocalDate = (iso?: string): Date | null => {
  if (!iso) return null;

  const [datePart] = iso.split("T");
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);

  if (!match) {
    const d = new Date(iso);
    return isNaN(d.getTime()) ? null : d;
  }

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const d = new Date(year, month, day);

  if (
    d.getFullYear() !== year ||
    d.getMonth() !== month ||
    d.getDate() !== day
  ) {
    return null;
  }

  return d;
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

  if (!d) {
    return false;
  }

  const today = new Date();

  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);

  return d < today;
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
