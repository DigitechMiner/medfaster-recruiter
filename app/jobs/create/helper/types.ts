import type { JobFormData } from "@/types";

export type CreateFormStep = "basic" | "description";

export type JobFormSection =
  | "basic"
  | "custom"
  | "requirements"
  | "location"
  | "description";

export interface AIQuestion {
  id: string;
  text: string;
}

export type JobFormFieldErrors = Partial<Record<keyof JobFormData, string>>;
