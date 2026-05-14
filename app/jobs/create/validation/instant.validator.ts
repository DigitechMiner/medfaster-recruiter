import type { JobCreatePayload } from "@/types";
import { INSTANT_JOB_MIN_DURATION_HOURS } from "./constants";
import { getShiftDurationHours, isEmpty } from "./helpers";
import type { PushError } from "./types";

// START SECTION: Instant Job Validator
export function validateInstantJob(
  payload: JobCreatePayload,
  push: PushError,
) {
  validateInstantDuration(payload, push);
  validateNeighborhood(payload, push);
  validateDirectNumber(payload, push);
  validateInstantQuestions(payload, push);
}
// END SECTION: Instant Job Validator

// START SECTION: Instant Duration Validation
function validateInstantDuration(payload: JobCreatePayload, push: PushError) {
  const duration = getShiftDurationHours(
    payload.check_in_time,
    payload.check_out_time,
  );

  if (duration !== null && duration < INSTANT_JOB_MIN_DURATION_HOURS) {
    push(
      "check_out_time",
      `Instant shifts must be at least ${INSTANT_JOB_MIN_DURATION_HOURS} hours long.`,
    );
  }
}
// END SECTION: Instant Duration Validation

// START SECTION: Instant Neighborhood Validation
function validateNeighborhood(payload: JobCreatePayload, push: PushError) {
  if (isEmpty(payload.neighborhood_name)) {
    push(
      "neighborhood_name",
      "Neighborhood name is required for instant jobs.",
    );
  }

  if (isEmpty(payload.neighborhood_type)) {
    push(
      "neighborhood_type",
      "Neighborhood type is required for instant jobs.",
    );
  }
}
// END SECTION: Instant Neighborhood Validation

// START SECTION: Instant Contact Validation
function validateDirectNumber(payload: JobCreatePayload, push: PushError) {
  if (isEmpty(payload.direct_number)) {
    push("direct_number", "Direct number is required for instant jobs.");
  }
}
// END SECTION: Instant Contact Validation

// START SECTION: Instant Question Validation
function validateInstantQuestions(payload: JobCreatePayload, push: PushError) {
  const q = payload.questions;
  const hasQuestions = !(
    q === undefined ||
    q === null ||
    (typeof q === "string" && q === "")
  );

  if (hasQuestions && Array.isArray(q) && q.length > 0) {
    push(
      "questions",
      "Interview questions are only supported for normal jobs.",
    );
  }
}
// END SECTION: Instant Question Validation
