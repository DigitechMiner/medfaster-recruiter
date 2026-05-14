import type { JobCreatePayload } from "@/types";
import { MAX_ARRAY_ITEMS, MAX_QUESTIONS } from "./constants";
import { isEmpty, isStringArrayBetween } from "./helpers";
import type { PushError } from "./types";

const MAX_YEARS_OF_EXPERIENCE = 20;

// START SECTION: Normal Job Validator
export function validateNormalJob(payload: JobCreatePayload, push: PushError) {
  validateExperience(payload, push);
  validateQualifications(payload, push);
  validateSpecializations(payload, push);
  validateAIInterview(payload, push);
  validateNormalQuestions(payload, push);
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
