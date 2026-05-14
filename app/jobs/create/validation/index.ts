import type { JobCreatePayload } from "@/types";
import { PAYLOAD_TO_FORM_FIELD } from "./field-map";
export { filterValidationErrorsForStep } from "./helpers";
import { validateInstantJob } from "./instant.validator";
import { validateNormalJob } from "./normal.validator";
import { validateSharedFields } from "./shared.validator";
import type { FormErrors, JobValidationError, PushError } from "./types";

export type {
  CreateFormStep,
  FormErrors,
  JobFormFieldErrors,
  JobValidationError,
  JobValidationField,
  PushError,
} from "./types";

// START SECTION: Main Payload Validator
export function validateJobPayload(
  payload: JobCreatePayload,
): JobValidationError[] {
  const errors: JobValidationError[] = [];

  const push: PushError = (field, message) => {
    errors.push({ field, message });
  };

  validateSharedFields(payload, push);

  if (payload.job_urgency === "instant") {
    validateInstantJob(payload, push);
  }

  if (payload.job_urgency === "normal") {
    validateNormalJob(payload, push);
  }

  return errors;
}
// END SECTION: Main Payload Validator

// START SECTION: Form Error Mapper
export function toFormFieldErrors(errors: JobValidationError[]): FormErrors {
  const result: FormErrors = {};

  for (const err of errors) {
    const formField =
      PAYLOAD_TO_FORM_FIELD[err.field as keyof typeof PAYLOAD_TO_FORM_FIELD];

    if (formField && result[formField] === undefined) {
      result[formField] = err.message;
    }
  }

  return result;
}
// END SECTION: Form Error Mapper
