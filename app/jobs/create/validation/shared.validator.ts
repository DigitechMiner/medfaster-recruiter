import type { JobCreatePayload } from "@/types";
import {
  CANADIAN_POSTAL_REGEX,
  INSTANT_JOB_MIN_LEAD_TIME_HOURS,
  MAX_ARRAY_ITEMS,
  NORMAL_JOB_MIN_LEAD_TIME_HOURS,
  SHIFT_MAX_HOURS,
  SHIFT_MIN_HOURS,
  TIME_REGEX,
} from "./constants";
import {
  getShiftWorkDurationHours,
  isEmpty,
  isStringArrayBetween,
  parseLocalDate,
  shiftSpansMidnight,
} from "./helpers";
import type { PushError } from "./types";
import {
  collectPayloadShiftTimePairs,
  getPayloadShiftHandoffMinutes,
} from "./shift-duration";
import {
  combineFacilityCheckInAt,
  earliestAllowedCheckInAt,
  isCalendarDateBeforeTodayInTz,
} from "@/utils/timezone/combine-date-and-time";

// START SECTION: Shared Validator
export function validateSharedFields(
  payload: JobCreatePayload,
  push: PushError,
) {
  validateBasicInfo(payload, push);
  validateLocation(payload, push);
  validateDates(payload, push);
  validateShift(payload, push);
  validateDescription(payload, push);
  validateArrays(payload, push);
  validateHireCount(payload, push);
}
// END SECTION: Shared Validator

// START SECTION: Basic Info Validation
function validateBasicInfo(payload: JobCreatePayload, push: PushError) {
  if (isEmpty(payload.job_title)) {
    push("job_title", "Job title is required.");
  }

  if (isEmpty(payload.department)) {
    push("department", "Department is required.");
  }

  if (isEmpty(payload.job_type)) {
    push("job_type", "Job type is required.");
  }
}
// END SECTION: Basic Info Validation

// START SECTION: Location Validation
function validateLocation(payload: JobCreatePayload, push: PushError) {
  if (isEmpty(payload.street)) {
    push("street", "Street is required.");
  }

  if (isEmpty(payload.city)) {
    push("city", "City is required.");
  }

  if (isEmpty(payload.postal_code)) {
    push("postal_code", "Postal code is required.");
  } else if (!CANADIAN_POSTAL_REGEX.test((payload.postal_code ?? "").trim())) {
    push(
      "postal_code",
      "Postal code must be a valid Canadian format (e.g., T3E 3E4).",
    );
  }

  if (isEmpty(payload.province)) {
    push("province", "Province is required.");
  }
}
// END SECTION: Location Validation

// START SECTION: Date Validation
function validateDates(payload: JobCreatePayload, push: PushError) {
  const isFullTime = payload.job_type === "full_time";
  const province = payload.province;

  if (isEmpty(payload.start_date)) {
    push("start_date", "Start date is required.");
  } else if (!parseLocalDate(payload.start_date)) {
    push("start_date", "Start date must be a valid date.");
  } else if (isCalendarDateBeforeTodayInTz(payload.start_date, province)) {
    push("start_date", "Start date cannot be in the past.");
  } else {
    validateStartLeadTime(payload, push);
  }

  const endEmpty = isEmpty(payload.end_date);

  if (!isFullTime && endEmpty) {
    push("end_date", "End date is required unless the job is full-time.");
    return;
  }

  if (endEmpty) return;

  if (!parseLocalDate(payload.end_date)) {
    push("end_date", "End date must be a valid date.");
    return;
  }

  if (isCalendarDateBeforeTodayInTz(payload.end_date, province)) {
    push("end_date", "End date cannot be in the past.");
    return;
  }

  if (isEmpty(payload.start_date)) return;

  const start = parseLocalDate(payload.start_date);
  const end = parseLocalDate(payload.end_date);

  if (!start || !end) return;

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
// END SECTION: Date Validation

// START SECTION: Start Lead Time Validation
function resolveLeadTimeHours(payload: JobCreatePayload): number {
  const urgency = (payload.job_urgency ?? "").toString().toUpperCase();
  return urgency === "INSTANT"
    ? INSTANT_JOB_MIN_LEAD_TIME_HOURS
    : NORMAL_JOB_MIN_LEAD_TIME_HOURS;
}

function resolveEarliestCheckInTime(payload: JobCreatePayload): string | null {
  const pairs = collectPayloadShiftTimePairs(payload);
  if (pairs.length === 0) {
    const fallback = payload.check_in_time?.trim();
    return fallback || null;
  }

  let earliest: string | null = null;
  for (const pair of pairs) {
    if (!earliest || pair.checkIn < earliest) earliest = pair.checkIn;
  }
  return earliest;
}

/**
 * Interpret start_date + check-in as facility (province) local time, convert to a
 * UTC instant, then compare to now + lead hours — same rules as the backend.
 */
function validateStartLeadTime(payload: JobCreatePayload, push: PushError) {
  if (isEmpty(payload.province)) {
    // Province is required before lead-time can be evaluated in facility TZ.
    return;
  }

  const checkInTime = resolveEarliestCheckInTime(payload);
  if (!checkInTime) return;

  const checkInAt = combineFacilityCheckInAt({
    startDate: payload.start_date,
    checkInTime,
    province: payload.province,
  });
  if (!checkInAt) return;

  const leadHours = resolveLeadTimeHours(payload);
  const earliestAllowed = earliestAllowedCheckInAt(leadHours);

  if (checkInAt.getTime() < earliestAllowed.getTime()) {
    const urgency = (payload.job_urgency ?? "").toString().toUpperCase();
    push(
      urgency === "INSTANT" ? "check_in_time" : "start_date",
      `Start date and check-in time must be at least ${leadHours} hour${leadHours === 1 ? "" : "s"} from now.`,
    );
  }
}
// END SECTION: Start Lead Time Validation

// START SECTION: Shift Validation
function validateShift(payload: JobCreatePayload, push: PushError) {
  const isInstant =
    (payload.job_urgency ?? "").toString().toUpperCase() === "INSTANT";

  if (isInstant) {
    if (isEmpty(payload.check_in_time)) {
      push("check_in_time", "Check-in time is required.");
    } else if (!TIME_REGEX.test(payload.check_in_time as string)) {
      push(
        "check_in_time",
        "Check-in time must be in HH:mm or HH:mm:ss format.",
      );
    }

    if (isEmpty(payload.check_out_time)) {
      push("check_out_time", "Check-out time is required.");
    } else if (!TIME_REGEX.test(payload.check_out_time as string)) {
      push(
        "check_out_time",
        "Check-out time must be in HH:mm or HH:mm:ss format.",
      );
    }
  }

  const handoff = getPayloadShiftHandoffMinutes(payload);
  for (const pair of collectPayloadShiftTimePairs(payload)) {
    const shiftDuration = getShiftWorkDurationHours(
      pair.checkIn,
      pair.checkOut,
      handoff,
    );

    if (
      shiftDuration !== null &&
      (shiftDuration < SHIFT_MIN_HOURS || shiftDuration > SHIFT_MAX_HOURS)
    ) {
      push(
        "check_out_time",
        `Shift duration must be between ${SHIFT_MIN_HOURS} and ${SHIFT_MAX_HOURS} hours.`,
      );
      break;
    }
  }
}
// END SECTION: Shift Validation

// START SECTION: Description Validation
function validateDescription(payload: JobCreatePayload, push: PushError) {
  if (isEmpty(payload.description)) {
    push("description", "Description is required.");
  }
}
// END SECTION: Description Validation

// START SECTION: Array Validation
function validateArrays(payload: JobCreatePayload, push: PushError) {
  validateResponsibilities(payload, push);
  validateRequiredSkills(payload, push);
  validateOptionalDescriptiveArrays(payload, push);
}

function validateResponsibilities(payload: JobCreatePayload, push: PushError) {
  const result = isStringArrayBetween(
    payload.responsibilities,
    1,
    MAX_ARRAY_ITEMS,
  );

  if (result.ok) return;

  push(
    "responsibilities",
    result.reason === "too_long"
      ? `Responsibilities can contain at most ${MAX_ARRAY_ITEMS} items.`
      : result.reason === "bad_items"
        ? "Responsibilities must be non-empty text values."
        : "Please add at least one responsibility.",
  );
}

function validateRequiredSkills(payload: JobCreatePayload, push: PushError) {
  const result = isStringArrayBetween(
    payload.required_skills,
    1,
    MAX_ARRAY_ITEMS,
  );

  if (result.ok) return;

  push(
    "required_skills",
    result.reason === "too_long"
      ? `Required skills can contain at most ${MAX_ARRAY_ITEMS} items.`
      : result.reason === "bad_items"
        ? "Required skills must be non-empty text values."
        : "Please add at least one required skill.",
  );
}

function validateOptionalDescriptiveArrays(
  payload: JobCreatePayload,
  push: PushError,
) {
  const optionalArrays: Array<{ key: keyof JobCreatePayload; label: string }> =
    [
      { key: "experience", label: "Experience" },
      { key: "working_conditions", label: "Working conditions" },
      { key: "why_join", label: "Why join" },
    ];

  for (const { key, label } of optionalArrays) {
    const value = payload[key];

    if (value === undefined || value === null) continue;

    const result = isStringArrayBetween(value, 0, MAX_ARRAY_ITEMS);

    if (result.ok) continue;

    push(
      key,
      result.reason === "too_long"
        ? `${label} can contain at most ${MAX_ARRAY_ITEMS} items.`
        : `${label} must be non-empty text values.`,
    );
  }
}
// END SECTION: Array Validation

// START SECTION: Hire Count Validation
function validateHireCount(payload: JobCreatePayload, push: PushError) {
  if (
    payload.no_of_hires_required === undefined ||
    payload.no_of_hires_required === null
  ) {
    push("no_of_hires_required", "Number of hires is required.");
    return;
  }

  if (
    !Number.isFinite(payload.no_of_hires_required) ||
    !Number.isInteger(payload.no_of_hires_required) ||
    payload.no_of_hires_required < 1
  ) {
    push(
      "no_of_hires_required",
      "Number of hires must be a positive whole number.",
    );
  }
}
// END SECTION: Hire Count Validation
