import type { PreviewShiftTemplateType, ShiftType } from "@/types";
import { parseClockTimeToMinutes } from "./validation/helpers";

export const SHIFT_WINDOWS = {
  MORNING: {
    earliestStart: "04:00",
    latestStart: "11:59",
  },
  EVENING: {
    earliestStart: "12:00",
    latestStart: "19:59",
  },
  NIGHT: {
    ranges: [
      { start: "20:00", end: "23:59" },
      { start: "00:00", end: "05:59" },
    ],
  },
} as const;

export type ShiftWindowType = keyof typeof SHIFT_WINDOWS;

const PREVIEW_TO_FORM_SHIFT: Record<
  Exclude<PreviewShiftTemplateType, "DAY">,
  ShiftType
> = {
  MORNING: "morning",
  EVENING: "evening",
  NIGHT: "night",
};

function normalizeClockTime(time: string): string {
  return time.trim().slice(0, 5);
}

function isTimeInClosedRange(
  minutes: number,
  start: string,
  end: string,
): boolean {
  const startMinutes = parseClockTimeToMinutes(start);
  const endMinutes = parseClockTimeToMinutes(end);
  if (startMinutes === null || endMinutes === null) return false;

  if (endMinutes >= startMinutes) {
    return minutes >= startMinutes && minutes <= endMinutes;
  }

  return minutes >= startMinutes || minutes <= endMinutes;
}

/** Classify a shift start time into MORNING, EVENING, or NIGHT using SHIFT_WINDOWS. */
export function inferShiftTypeFromStartTime(
  startTime: string,
): PreviewShiftTemplateType {
  const minutes = parseClockTimeToMinutes(normalizeClockTime(startTime));
  if (minutes === null) return "DAY";

  const { MORNING, EVENING, NIGHT } = SHIFT_WINDOWS;

  if (
    isTimeInClosedRange(
      minutes,
      MORNING.earliestStart,
      MORNING.latestStart,
    )
  ) {
    return "MORNING";
  }

  if (
    isTimeInClosedRange(
      minutes,
      EVENING.earliestStart,
      EVENING.latestStart,
    )
  ) {
    return "EVENING";
  }

  for (const range of NIGHT.ranges) {
    if (isTimeInClosedRange(minutes, range.start, range.end)) {
      return "NIGHT";
    }
  }

  return "DAY";
}

/** Form shift key (`morning` / `evening` / `night`) from a start time. */
export function inferFormShiftTypeFromStartTime(
  startTime: string,
): ShiftType | null {
  const previewType = inferShiftTypeFromStartTime(startTime);
  if (previewType === "DAY") return null;
  return PREVIEW_TO_FORM_SHIFT[previewType];
}

export function isStartTimeInShiftWindow(
  startTime: string,
  shiftType: ShiftWindowType,
): boolean {
  const minutes = parseClockTimeToMinutes(normalizeClockTime(startTime));
  if (minutes === null) return false;

  const window = SHIFT_WINDOWS[shiftType];

  if ("ranges" in window) {
    return window.ranges.some((range) =>
      isTimeInClosedRange(minutes, range.start, range.end),
    );
  }

  return isTimeInClosedRange(
    minutes,
    window.earliestStart,
    window.latestStart,
  );
}
