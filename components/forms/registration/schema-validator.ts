import type { UseFormReturn } from "react-hook-form";
import type { ZodIssue, ZodType } from "zod";

import type { RegistrationFormValues } from "./form.types";

export function validateStepSchema(
  methods: UseFormReturn<RegistrationFormValues>,
  schema: ZodType,
  values: RegistrationFormValues
): boolean {
  const result = schema.safeParse(values);
  if (result.success) {
    methods.clearErrors();
    return true;
  }

  result.error.issues.forEach((err: ZodIssue) => {
    const field =
      typeof err.path[0] === "string"
        ? (err.path[0] as keyof RegistrationFormValues)
        : undefined;
    if (!field) {
      return;
    }
    methods.setError(field, {
      type: "manual",
      message: err.message,
    });
  });

  return false;
}
