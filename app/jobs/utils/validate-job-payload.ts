/**
 * Frontend job-payload validator.
 *
 * Mirrors the backend express-validator chain (`validateCreateJob`) so that
 * recruiters see issues *before* clicking Next / Create Job — without having
 * to round-trip to the API to discover what's wrong.
 *
 * Source of truth is still the backend: this is best-effort client-side
 * pre-flight validation.
 */

import type { JobCreatePayload, JobFormData } from "@/Interface/recruiter.types";

// ── Constants (must match backend) ───────────────────────────────────────────
// NOTE: job_type / job_urgency / province / status are constrained by the UI
// (dropdowns or programmatic values), so we don't whitelist their values here —
// only check presence where required.
const INSTANT_JOB_MIN_DURATION_HOURS = 4;
const SHIFT_MIN_HOURS = 3;
const SHIFT_MAX_HOURS = 12;
const MAX_QUESTIONS  = 10;
const MAX_ARRAY_ITEMS = 20;

// Canadian postal: A1A 1A1 — letter-digit-letter (space?) digit-letter-digit
const CANADIAN_POSTAL_REGEX = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
const TIME_REGEX            = /^\d{2}:\d{2}(:\d{2})?$/;

// ── Public types ─────────────────────────────────────────────────────────────
export type JobValidationField = keyof JobCreatePayload | "form";
export interface JobValidationError {
  field:   JobValidationField;
  message: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const isEmpty = (v: unknown): boolean =>
  v === undefined || v === null || (typeof v === "string" && v.trim() === "");

const parseClockTimeToMinutes = (time: string): number | null => {
  const [h, m] = time.split(":");
  const hours   = Number(h);
  const minutes = Number(m);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
};

const shiftSpansMidnight = (checkIn?: string, checkOut?: string): boolean => {
  if (!checkIn || !checkOut) return false;
  const inM  = parseClockTimeToMinutes(checkIn);
  const outM = parseClockTimeToMinutes(checkOut);
  if (inM === null || outM === null) return false;
  return outM <= inM;
};

const getShiftDurationHours = (checkIn?: string, checkOut?: string): number | null => {
  if (!checkIn || !checkOut) return null;
  const inM  = parseClockTimeToMinutes(checkIn);
  const outM = parseClockTimeToMinutes(checkOut);
  if (inM === null || outM === null) return null;
  let diff = outM - inM;
  if (diff <= 0) diff += 24 * 60;
  return diff / 60;
};

const isPastDate = (iso?: string): boolean => {
  if (!iso) return false;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return d < today;
};

const isStringArrayBetween = (
  value: unknown,
  min: number,
  max: number,
): { ok: true } | { ok: false; reason: "not_array" | "too_short" | "too_long" | "bad_items" } => {
  if (!Array.isArray(value)) return { ok: false, reason: "not_array" };
  if (value.length < min)    return { ok: false, reason: "too_short" };
  if (value.length > max)    return { ok: false, reason: "too_long" };
  const allValid = value.every((it) => typeof it === "string" && it.trim().length > 0);
  if (!allValid) return { ok: false, reason: "bad_items" };
  return { ok: true };
};

// ── Main validator ───────────────────────────────────────────────────────────
export function validateJobPayload(payload: JobCreatePayload): JobValidationError[] {
  const errors: JobValidationError[] = [];
  const push = (field: JobValidationField, message: string) =>
    errors.push({ field, message });

  // job_title
  if (isEmpty(payload.job_title)) push("job_title", "Job title is required.");

  // department
  if (isEmpty(payload.department)) push("department", "Department is required.");

  // job_type — required only (UI controls valid values via radio/dropdown)
  if (isEmpty(payload.job_type)) push("job_type", "Job type is required.");

  // Location
  if (isEmpty(payload.street))   push("street", "Street is required.");
  if (isEmpty(payload.city))     push("city",   "City is required.");

  if (isEmpty(payload.postal_code)) {
    push("postal_code", "Postal code is required.");
  } else if (!CANADIAN_POSTAL_REGEX.test((payload.postal_code ?? "").trim())) {
    push("postal_code", "Postal code must be a valid Canadian format (e.g., T3E 3E4).");
  }

  // Province — required only (dropdown enforces valid values)
  if (isEmpty(payload.province)) push("province", "Province is required.");

  // start_date
  const isFullTime = payload.job_type === "full_time";
  if (isEmpty(payload.start_date)) {
    push("start_date", "Start date is required.");
  } else if (isNaN(new Date(payload.start_date as string).getTime())) {
    push("start_date", "Start date must be a valid date.");
  } else if (isPastDate(payload.start_date)) {
    push("start_date", "Start date cannot be in the past.");
  }

  // end_date — required unless full_time
  const endEmpty = isEmpty(payload.end_date);
  if (!isFullTime && endEmpty) {
    push("end_date", "End date is required unless the job is full-time.");
  } else if (!endEmpty) {
    if (isNaN(new Date(payload.end_date as string).getTime())) {
      push("end_date", "End date must be a valid date.");
    } else if (isPastDate(payload.end_date)) {
      push("end_date", "End date cannot be in the past.");
    } else if (!isEmpty(payload.start_date)) {
      const start = new Date(payload.start_date as string);
      const end   = new Date(payload.end_date   as string);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      if (end < start) {
        push("end_date", "End date must be on or after the start date.");
      } else if (
        shiftSpansMidnight(payload.check_in_time, payload.check_out_time) &&
        end.getTime() === start.getTime()
      ) {
        push(
          "end_date",
          "For overnight shifts, end date must be at least the day after the start date.",
        );
      }
    }
  }

  // check_in_time / check_out_time
  if (isEmpty(payload.check_in_time)) {
    push("check_in_time", "Check-in time is required.");
  } else if (!TIME_REGEX.test(payload.check_in_time as string)) {
    push("check_in_time", "Check-in time must be in HH:mm or HH:mm:ss format.");
  }

  if (isEmpty(payload.check_out_time)) {
    push("check_out_time", "Check-out time is required.");
  } else if (!TIME_REGEX.test(payload.check_out_time as string)) {
    push("check_out_time", "Check-out time must be in HH:mm or HH:mm:ss format.");
  }

  // Shift duration — only when both times are valid
  const duration = getShiftDurationHours(payload.check_in_time, payload.check_out_time);
  if (duration !== null) {
    if (payload.job_urgency === "instant" && duration < INSTANT_JOB_MIN_DURATION_HOURS) {
      push(
        "check_out_time",
        `Instant shifts must be at least ${INSTANT_JOB_MIN_DURATION_HOURS} hours long.`,
      );
    }
    if (duration < SHIFT_MIN_HOURS || duration > SHIFT_MAX_HOURS) {
      push(
        "check_out_time",
        `Shift duration must be between ${SHIFT_MIN_HOURS} and ${SHIFT_MAX_HOURS} hours.`,
      );
    }
  }

  // ── Instant-only fields ────────────────────────────────────────────────────
  if (payload.job_urgency === "instant") {
    if (isEmpty(payload.neighborhood_name)) {
      push("neighborhood_name", "Neighborhood name is required for instant jobs.");
    }
    if (isEmpty(payload.neighborhood_type)) {
      push("neighborhood_type", "Neighborhood type is required for instant jobs.");
    }
    if (isEmpty(payload.direct_number)) {
      push("direct_number", "Direct number is required for instant jobs.");
    }
  }

  // ── Normal-only fields ─────────────────────────────────────────────────────
  if (payload.job_urgency === "normal") {
    if (isEmpty(payload.years_of_experience)) {
      push("years_of_experience", "Years of experience is required for normal jobs.");
    } else if (!/^\d+$/.test(payload.years_of_experience as string)) {
      push("years_of_experience", "Years of experience must be a whole number.");
    }

    const qualResult = isStringArrayBetween(payload.qualifications, 1, MAX_ARRAY_ITEMS);
    if (!qualResult.ok) {
      push(
        "qualifications",
        qualResult.reason === "not_array" || qualResult.reason === "too_short"
          ? "Please add at least one qualification."
          : "Qualifications must be non-empty text values.",
      );
    }

    const specResult = isStringArrayBetween(payload.specializations, 1, MAX_ARRAY_ITEMS);
    if (!specResult.ok) {
      push(
        "specializations",
        specResult.reason === "not_array" || specResult.reason === "too_short"
          ? "Please add at least one specialization."
          : "Specializations must be non-empty text values.",
      );
    }

    if (payload.ai_interview === undefined || payload.ai_interview === null) {
      push("ai_interview", "Please choose whether to enable an AI interview.");
    } else if (typeof payload.ai_interview !== "boolean") {
      push("ai_interview", "AI interview must be true or false.");
    }
  }

  // ── description ────────────────────────────────────────────────────────────
  if (isEmpty(payload.description)) push("description", "Description is required.");

  // ── responsibilities (required, 1..20) ─────────────────────────────────────
  const respResult = isStringArrayBetween(payload.responsibilities, 1, MAX_ARRAY_ITEMS);
  if (!respResult.ok) {
    push(
      "responsibilities",
      respResult.reason === "too_long"
        ? `Responsibilities can contain at most ${MAX_ARRAY_ITEMS} items.`
        : respResult.reason === "bad_items"
        ? "Responsibilities must be non-empty text values."
        : "Please add at least one responsibility.",
    );
  }

  // ── required_skills (required, 1..20) ──────────────────────────────────────
  const skillsResult = isStringArrayBetween(payload.required_skills, 1, MAX_ARRAY_ITEMS);
  if (!skillsResult.ok) {
    push(
      "required_skills",
      skillsResult.reason === "too_long"
        ? `Required skills can contain at most ${MAX_ARRAY_ITEMS} items.`
        : skillsResult.reason === "bad_items"
        ? "Required skills must be non-empty text values."
        : "Please add at least one required skill.",
    );
  }

  // ── Optional descriptive arrays (max 20, non-empty strings if present) ─────
  const optionalArrays: Array<{ key: keyof JobCreatePayload; label: string }> = [
    { key: "experience",         label: "Experience" },
    { key: "working_conditions", label: "Working conditions" },
    { key: "why_join",           label: "Why join" },
  ];
  for (const { key, label } of optionalArrays) {
    const value = payload[key];
    if (value === undefined || value === null) continue;
    const result = isStringArrayBetween(value, 0, MAX_ARRAY_ITEMS);
    if (!result.ok) {
      push(
        key,
        result.reason === "too_long"
          ? `${label} can contain at most ${MAX_ARRAY_ITEMS} items.`
          : `${label} must be non-empty text values.`,
      );
    }
  }

  // ── questions (gated by job_urgency + ai_interview) ────────────────────────
  const q = payload.questions;
  const hasQuestions = !(q === undefined || q === null || (typeof q === "string" && q === ""));
  if (payload.job_urgency !== "normal") {
    if (hasQuestions && Array.isArray(q) && q.length > 0) {
      push("questions", "Interview questions are only supported for normal jobs.");
    }
  } else {
    const aiOn = payload.ai_interview === true;
    if (!aiOn) {
      if (hasQuestions && Array.isArray(q) && q.length > 0) {
        push("questions", "Questions must be empty when AI interview is disabled.");
      }
    } else {
      if (!Array.isArray(q) || q.length === 0) {
        push("questions", "Please add at least one question for the AI interview.");
      } else if (q.length > MAX_QUESTIONS) {
        push("questions", `You can add at most ${MAX_QUESTIONS} questions.`);
      } else if (q.some((qq) => typeof qq !== "string" || qq.trim().length === 0)) {
        push("questions", "Questions must be non-empty text values.");
      }
    }
  }

  // ── no_of_hires_required (optional, but if provided must be >= 1) ──────────
  if (payload.no_of_hires_required !== undefined && payload.no_of_hires_required !== null) {
    if (
      !Number.isFinite(payload.no_of_hires_required) ||
      !Number.isInteger(payload.no_of_hires_required) ||
      payload.no_of_hires_required < 1
    ) {
      push("no_of_hires_required", "Number of hires must be a positive whole number.");
    }
  }

  // status is set programmatically by the form code, so no whitelist check.

  return errors;
}

/**
 * Single source of truth mapping backend payload keys (snake_case) → frontend
 * form field keys (camelCase). Used by both InstantReplacementForm and
 * CreateJobForm to render inline errors next to the right inputs.
 *
 * `InstantJobFormData extends JobFormData`, so this same map covers both forms
 * — instant-only entries (neighborhood_*, direct_number) and normal-only
 * entries (qualifications, specializations, etc.) live alongside each other.
 */
const PAYLOAD_TO_FORM_FIELD: Partial<Record<keyof JobCreatePayload, keyof JobFormData>> = {
  job_title:           "jobTitle",
  department:          "department",
  job_type:            "jobType",
  street:              "streetAddress",
  postal_code:         "postalCode",
  province:            "province",
  city:                "city",
  start_date:          "fromDate",
  end_date:            "tillDate",
  check_in_time:       "fromTime",
  check_out_time:      "toTime",
  description:         "description",
  responsibilities:    "responsibilities",
  required_skills:     "required_skills",
  // Instant-only
  neighborhood_name:   "neighborhoodName",
  neighborhood_type:   "neighborhoodType",
  direct_number:       "directNumber",
  // Normal-only
  qualifications:      "qualification",
  specializations:     "specialization",
  years_of_experience: "experience",
  ai_interview:        "aiInterview",
  questions:           "questions",
};

/**
 * Convert validator errors into a `{ formFieldKey: message }` map, ready to
 * pass into a form's `fieldErrors` state. First error per form field wins.
 */
export function toFormFieldErrors(
  errors: JobValidationError[],
): Partial<Record<keyof JobFormData, string>> {
  const result: Partial<Record<keyof JobFormData, string>> = {};
  for (const err of errors) {
    const formField = PAYLOAD_TO_FORM_FIELD[err.field as keyof JobCreatePayload];
    if (formField && result[formField] === undefined) {
      result[formField] = err.message;
    }
  }
  return result;
}
