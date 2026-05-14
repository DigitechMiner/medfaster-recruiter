import type { Dispatch, SetStateAction } from "react";
import type { JobFormData } from "@/types";
import type { JobFormSnapshot } from "@/stores/jobs-store";
import type { JobValidationError } from "./validatePayload";
import { DESCRIPTION_STEP_FIELDS } from "../form/constants";
import type { CreateFormStep } from "./types";

type SnapshotDateUpdate = {
  fromDate?: Date | string;
  tillDate?: Date | string;
};

export function formatDateForBackend(date?: Date): string | undefined {
  if (!date) return undefined;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function fromSnapshot<K extends keyof JobFormSnapshot, TValue>(
  snapshot: JobFormSnapshot | null,
  key: K,
  fallback: TValue,
): TValue {
  if (!snapshot) return fallback;

  const value = snapshot[key];
  return value !== undefined ? (value as TValue) : fallback;
}

export function dateFromSnapshot(
  snapshot: JobFormSnapshot | null,
  key: "fromDate" | "tillDate",
): Date | undefined {
  const value = snapshot?.[key];
  return value ? new Date(value) : undefined;
}

export function payRangeFromSnapshot(
  snapshot: JobFormSnapshot | null,
  fallback: number,
): number {
  const value = snapshot?.payRange;

  if (typeof value === "number" && value > 0) return value;
  if (Array.isArray(value) && value[1] > 0) return value[1];

  return fallback;
}

export function clearErrorsForUpdatedFields<TFormData extends object>(
  updates: Partial<TFormData>,
  setFieldErrors: Dispatch<
    SetStateAction<Partial<Record<keyof TFormData, string>>>
  >,
) {
  const updatedKeys = Object.keys(updates) as Array<keyof TFormData>;
  if (updatedKeys.length === 0) return;

  setFieldErrors((prev) => {
    if (!updatedKeys.some((key) => key in prev)) return prev;

    const next = { ...prev };
    updatedKeys.forEach((key) => delete next[key]);
    return next;
  });
}

export function buildNextFormSnapshot<TUpdates extends object>(
  currentSnapshot: JobFormSnapshot | null,
  updates: Partial<TUpdates> & SnapshotDateUpdate,
): JobFormSnapshot {
  return {
    ...(currentSnapshot ?? {}),
    ...(updates as Partial<JobFormSnapshot>),
    fromDate:
      updates.fromDate instanceof Date
        ? updates.fromDate.toISOString()
        : updates.fromDate !== undefined
          ? (updates.fromDate as string)
          : currentSnapshot?.fromDate,
    tillDate:
      updates.tillDate instanceof Date
        ? updates.tillDate.toISOString()
        : updates.tillDate !== undefined
          ? (updates.tillDate as string)
          : currentSnapshot?.tillDate,
  } as JobFormSnapshot;
}

export function filterValidationErrorsForStep(
  errors: JobValidationError[],
  formStep: CreateFormStep,
  options: { ignoreQuestions?: boolean } = {},
): JobValidationError[] {
  const stepErrors =
    formStep === "basic"
      ? errors.filter((error) => !DESCRIPTION_STEP_FIELDS.has(error.field))
      : errors;

  if (!options.ignoreQuestions) return stepErrors;

  return stepErrors.filter((error) => error.field !== "questions");
}

export type JobFormFieldErrors<TFormData extends JobFormData = JobFormData> =
  Partial<Record<keyof TFormData, string>>;
