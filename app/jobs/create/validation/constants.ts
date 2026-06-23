// START SECTION: Backend-Matched Validation Constants
export const INSTANT_JOB_MIN_DURATION_HOURS = 4;
export const MIN_START_LEAD_TIME_HOURS = 1;
export const SHIFT_MIN_HOURS = 3;
export const SHIFT_MAX_HOURS = 12;

export const YEARS_OF_EXPERIENCE_MIN = 0;
export const YEARS_OF_EXPERIENCE_MAX = 10;

export const MAX_QUESTIONS = 10;
export const MAX_ARRAY_ITEMS = 20;

export const DESCRIPTION_STEP_FIELDS = new Set([
  "description",
  "responsibilities",
  "required_skills",
  "experience",
  "working_conditions",
  "why_join",
  "questions",
]);
// END SECTION: Backend-Matched Validation Constants

// START SECTION: Validation Regex
export const CANADIAN_POSTAL_REGEX =
  /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;

export const TIME_REGEX = /^\d{2}:\d{2}(:\d{2})?$/;
// END SECTION: Validation Regex
