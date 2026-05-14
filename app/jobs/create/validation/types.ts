import type { JobCreatePayload, JobFormData } from "@/types";

// START SECTION: Validator Types
export type JobValidationField = keyof JobCreatePayload | "form";

export type CreateFormStep = "basic" | "description";

export interface JobValidationError {
  field: JobValidationField;
  message: string;
}

export type PushError = (
  field: JobValidationField,
  message: string,
) => void;

export type JobFormFieldErrors<TFormData extends JobFormData = JobFormData> =
  Partial<Record<keyof TFormData, string>>;

export type FormErrors = JobFormFieldErrors;
// END SECTION: Validator Types
