import type { Dispatch, SetStateAction } from "react";
import type { JobFormSnapshot } from "@/stores/jobs-store";
import { parseLocalDate } from "../validation/helpers";

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

export function parseCalendarDate(
  value?: string | Date | null,
): Date | undefined {
  if (value == null || value === "") return undefined;

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return undefined;
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  return parseLocalDate(value) ?? undefined;
}

export function formatDateForBackend(date?: Date): string | undefined {
  const parsed = parseCalendarDate(date);
  if (!parsed) return undefined;

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/** Snapshot, preview, create, and fees all send this calendar-day string. */
export function toCalendarDateString(
  value?: Date | string | null,
): string | undefined {
  if (value == null || value === "") return undefined;
  if (value instanceof Date) return formatDateForBackend(value);

  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  return formatDateForBackend(parseCalendarDate(trimmed));
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
  return parseCalendarDate(snapshot?.[key]);
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
      updates.start_date !== undefined
        ? toCalendarDateString(updates.start_date)
        : currentSnapshot?.start_date,
    end_date:
      updates.end_date !== undefined
        ? toCalendarDateString(updates.end_date)
        : currentSnapshot?.end_date,
  } as JobFormSnapshot;
}
