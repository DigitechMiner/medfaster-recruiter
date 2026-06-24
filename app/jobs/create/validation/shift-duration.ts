import type { JobCreatePayload, ShiftType } from "@/types";
import {
  getShiftEndFromState,
  getShiftHandoffOverlapMinutes,
  getShiftStartFromState,
  sortShiftsInDayOrder,
} from "../normal/scheduling-utils";
import { SHIFT_MAX_HOURS, SHIFT_MIN_HOURS } from "./constants";
import { getShiftWorkDurationHours } from "./helpers";

type ShiftTimePair = {
  checkIn: string;
  checkOut: string;
};

export function getPayloadShiftHandoffMinutes(
  payload: JobCreatePayload,
): number {
  return getShiftHandoffOverlapMinutes(
    payload.job_duration_per_day,
    (payload.selected_shift_types ?? []) as ShiftType[],
  );
}

export function collectPayloadShiftTimePairs(
  payload: JobCreatePayload,
): ShiftTimePair[] {
  const isInstant =
    (payload.job_urgency ?? "").toString().toUpperCase() === "INSTANT";
  const selectedShifts = sortShiftsInDayOrder(
    (payload.selected_shift_types ?? []) as ShiftType[],
  );

  if (!isInstant && selectedShifts.length > 0) {
    const pairs: ShiftTimePair[] = [];

    for (const shift of selectedShifts) {
      const checkIn = getShiftStartFromState(shift, payload)?.trim();
      const checkOut = getShiftEndFromState(shift, payload)?.trim();
      if (checkIn && checkOut) {
        pairs.push({ checkIn, checkOut });
      }
    }

    if (pairs.length > 0) return pairs;
  }

  const checkIn = (
    payload.check_in_time ??
    payload.morning_shift_start ??
    ""
  ).trim();
  const checkOut = (
    payload.check_out_time ??
    payload.morning_shift_end ??
    ""
  ).trim();

  if (checkIn && checkOut) {
    return [{ checkIn, checkOut }];
  }

  return [];
}

export function validatePayloadShiftDurations(
  payload: JobCreatePayload,
  options?: { minHours?: number; maxHours?: number },
): string | null {
  const minHours = options?.minHours ?? SHIFT_MIN_HOURS;
  const maxHours = options?.maxHours ?? SHIFT_MAX_HOURS;
  const handoff = getPayloadShiftHandoffMinutes(payload);
  const pairs = collectPayloadShiftTimePairs(payload);

  for (const pair of pairs) {
    const hours = getShiftWorkDurationHours(
      pair.checkIn,
      pair.checkOut,
      handoff,
    );
    if (hours === null) continue;

    if (hours < minHours) {
      return `Shift duration must be at least ${minHours} hours. Please go back and adjust the shift times.`;
    }

    if (hours > maxHours) {
      return `Shift duration cannot exceed ${maxHours} hours. Please go back and adjust the shift times.`;
    }
  }

  return null;
}
