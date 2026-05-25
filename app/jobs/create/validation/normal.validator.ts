import type { JobFormSnapshot } from "@/stores/jobs-store";
import type {
  JobCreatePayload,
  ShiftDurationType,
  ShiftType,
  StaffingType,
} from "@/types";
import { MAX_ARRAY_ITEMS, MAX_QUESTIONS } from "./constants";
import { isEmpty, isStringArrayBetween, parseClockTimeToMinutes } from "./helpers";
import type { PushError } from "./types";
import {
  buildTeamLabels,
  clampTeamCount,
  formatCandidateWeeklyHoursViolations,
  formatScheduleTemplateAssignmentErrors,
  getCandidateWeeklyHoursViolations,
  getDefaultTeamCount,
  getShiftEndFromState,
  getShiftStartFromState,
  sortShiftsInDayOrder,
  type ShiftTimesState,
} from "../normal/scheduling-utils";

const MAX_YEARS_OF_EXPERIENCE = 20;

// START SECTION: Normal Job Validator
export function validateNormalJob(payload: JobCreatePayload, push: PushError) {
  validateExperience(payload, push);
  validateQualifications(payload, push);
  validateSpecializations(payload, push);
  validateAIInterview(payload, push);
  validateNormalQuestions(payload, push);
  validateScheduleWeeklyHours(payload, push);
}
// END SECTION: Normal Job Validator

// START SECTION: Experience Validation
function validateExperience(payload: JobCreatePayload, push: PushError) {
  if (isEmpty(payload.years_of_experience)) {
    push(
      "years_of_experience",
      "Years of experience is required for normal jobs.",
    );
  } else if (!/^\d+$/.test(payload.years_of_experience as string)) {
    push(
      "years_of_experience",
      "Years of experience must be a whole number.",
    );
  } else if (Number(payload.years_of_experience) > MAX_YEARS_OF_EXPERIENCE) {
    push(
      "years_of_experience",
      `Years of experience cannot exceed ${MAX_YEARS_OF_EXPERIENCE}.`,
    );
  }
}
// END SECTION: Experience Validation

// START SECTION: Qualification Validation
function validateQualifications(payload: JobCreatePayload, push: PushError) {
  const result = isStringArrayBetween(
    payload.qualifications,
    1,
    MAX_ARRAY_ITEMS,
  );

  if (result.ok) return;

  push(
    "qualifications",
    result.reason === "not_array" || result.reason === "too_short"
      ? "Please add at least one qualification."
      : "Qualifications must be non-empty text values.",
  );
}
// END SECTION: Qualification Validation

// START SECTION: Specialization Validation
function validateSpecializations(payload: JobCreatePayload, push: PushError) {
  const result = isStringArrayBetween(
    payload.specializations,
    1,
    MAX_ARRAY_ITEMS,
  );

  if (result.ok) return;

  push(
    "specializations",
    result.reason === "not_array" || result.reason === "too_short"
      ? "Please add at least one specialization."
      : "Specializations must be non-empty text values.",
  );
}
// END SECTION: Specialization Validation

// START SECTION: AI Interview Validation
function validateAIInterview(payload: JobCreatePayload, push: PushError) {
  if (payload.ai_interview === undefined || payload.ai_interview === null) {
    push("ai_interview", "Please choose whether to enable an AI interview.");
  } else if (typeof payload.ai_interview !== "boolean") {
    push("ai_interview", "AI interview must be true or false.");
  }
}
// END SECTION: AI Interview Validation

// START SECTION: Normal Question Validation
function validateNormalQuestions(payload: JobCreatePayload, push: PushError) {
  const q = payload.questions;
  const hasQuestions = !(
    q === undefined ||
    q === null ||
    (typeof q === "string" && q === "")
  );
  const aiOn = payload.ai_interview === true;

  if (!aiOn) {
    if (hasQuestions && Array.isArray(q) && q.length > 0) {
      push("questions", "Questions must be empty when AI interview is disabled.");
    }

    return;
  }

  if (!Array.isArray(q) || q.length === 0) {
    push("questions", "Please add at least one question for the AI interview.");
  } else if (q.length > MAX_QUESTIONS) {
    push("questions", `You can add at most ${MAX_QUESTIONS} questions.`);
  } else if (q.some((qq) => typeof qq !== "string" || qq.trim().length === 0)) {
    push("questions", "Questions must be non-empty text values.");
  }
}
// END SECTION: Normal Question Validation

// START SECTION: Schedule Weekly Hours Validation
function validateScheduleWeeklyHours(
  payload: JobCreatePayload,
  push: PushError,
) {
  const selectedShifts = (payload.selected_shift_types ?? []) as ShiftType[];
  if (!selectedShifts.length) return;

  const shiftDuration =
    (payload.shift_duration_type as ShiftDurationType) ?? "8_hrs";
  const teamCount = clampTeamCount(
    Number(payload.number_of_teams) || getDefaultTeamCount(payload.staffing_type),
    payload.staffing_type,
  );
  const teamLabels = buildTeamLabels(teamCount);
  const violations = getCandidateWeeklyHoursViolations({
    scheduleTemplate: payload.schedule_template,
    teamLabels,
    selectedShifts,
    shiftScheduleDetails: payload.shift_schedule_details,
    shiftDuration,
  });
  const message = formatCandidateWeeklyHoursViolations(violations);
  if (message) {
    push("schedule_template", message);
  }
}
// END SECTION: Schedule Weekly Hours Validation

// START SECTION: Scheduling Step Date Validation
function isSnapshotDateMissing(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (value instanceof Date) return Number.isNaN(value.getTime());
  if (typeof value === "string") {
    if (value.trim() === "") return true;
    return Number.isNaN(new Date(value).getTime());
  }
  return true;
}

/** Returns a user-facing message when scheduling step dates are missing. */
export function formatSchedulingStepDateErrors(
  snapshot: Pick<JobFormSnapshot, "start_date" | "end_date">,
): string | null {
  const messages: string[] = [];

  if (isSnapshotDateMissing(snapshot.start_date)) {
    messages.push("Job start date is required.");
  }

  if (isSnapshotDateMissing(snapshot.end_date)) {
    messages.push("Job end date is required.");
  }

  return messages.length > 0 ? messages.join(" ") : null;
}
// END SECTION: Scheduling Step Date Validation

// START SECTION: Scheduling Step Shift Timing Validation
const SHIFT_TYPE_LABEL: Record<ShiftType, string> = {
  morning: "Morning",
  day: "Day",
  evening: "Evening",
  night: "Night",
};

function isShiftClockTimeMissing(time?: string): boolean {
  if (isEmpty(time)) return true;
  return parseClockTimeToMinutes(time as string) === null;
}

/** Returns a user-facing message when selected shifts lack start/end times. */
export function formatSchedulingStepShiftTimingErrors(
  snapshot: Pick<JobFormSnapshot, "selected_shift_types"> & ShiftTimesState,
): string | null {
  const selectedShifts = sortShiftsInDayOrder(
    (snapshot.selected_shift_types as ShiftType[] | undefined) ?? [],
  );

  if (!selectedShifts.length) {
    return "Select at least one shift type.";
  }

  const messages: string[] = [];

  for (const shift of selectedShifts) {
    const label = SHIFT_TYPE_LABEL[shift];
    const start = getShiftStartFromState(shift, snapshot);
    const end = getShiftEndFromState(shift, snapshot);
    const startMissing = isShiftClockTimeMissing(start);
    const endMissing = isShiftClockTimeMissing(end);

    if (startMissing && endMissing) {
      messages.push(`${label} shift start and end times are required.`);
    } else if (startMissing) {
      messages.push(`${label} shift start time is required.`);
    } else if (endMissing) {
      messages.push(`${label} shift end time is required.`);
    }
  }

  return messages.length > 0 ? messages.join(" ") : null;
}

/** 14-day template: at least one day must have a team assigned. */
export function formatSchedulingStepTemplateErrors(
  snapshot: Pick<
    JobFormSnapshot,
    "schedule_template" | "staffing_type" | "number_of_teams"
  >,
): string | null {
  const staffingType =
    (snapshot.staffing_type as StaffingType | undefined) ?? "standard";
  const teamCount = clampTeamCount(
    Number(snapshot.number_of_teams) || getDefaultTeamCount(staffingType),
    staffingType,
  );
  const teamLabels = buildTeamLabels(teamCount);

  return formatScheduleTemplateAssignmentErrors(
    snapshot.schedule_template,
    teamLabels,
  );
}

/** Date, shift-timing, and template checks before leaving the scheduling step. */
export function formatSchedulingStepErrors(
  snapshot: JobFormSnapshot,
): string | null {
  const messages = [
    formatSchedulingStepDateErrors(snapshot),
    formatSchedulingStepShiftTimingErrors(snapshot),
    formatSchedulingStepTemplateErrors(snapshot),
  ].filter((message): message is string => message !== null);

  return messages.length > 0 ? messages.join(" ") : null;
}
// END SECTION: Scheduling Step Shift Timing Validation
