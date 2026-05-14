import type { Dispatch, SetStateAction } from "react";
import type { JobFormSnapshot } from "@/stores/jobs-store";

type SnapshotDateUpdate = {
  start_date?: Date | string;
  end_date?: Date | string;
};

export const MIN_NUMBER_OF_HIRES = 1;

const BLOCKED_NUMBER_OF_HIRES_KEYS = new Set(["-", "+", "e", "E", "."]);

export function isBlockedNumberOfHiresKey(key: string): boolean {
  return BLOCKED_NUMBER_OF_HIRES_KEYS.has(key);
}

export function normalizeNumberOfHiresInput(value: string): string {
  const trimmed = value.trim();

  if (trimmed === "") return "";

  const parsed = Number.parseInt(trimmed, 10);

  if (!Number.isFinite(parsed)) return "";

  return String(Math.max(MIN_NUMBER_OF_HIRES, parsed));
}

export function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value.filter((item): item is string => typeof item === "string");
}

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
  key: "start_date" | "end_date",
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
    start_date:
      updates.start_date instanceof Date
        ? updates.start_date.toISOString()
        : updates.start_date !== undefined
          ? (updates.start_date as string)
          : currentSnapshot?.start_date,
    end_date:
      updates.end_date instanceof Date
        ? updates.end_date.toISOString()
        : updates.end_date !== undefined
          ? (updates.end_date as string)
          : currentSnapshot?.end_date,
  } as JobFormSnapshot;
}
