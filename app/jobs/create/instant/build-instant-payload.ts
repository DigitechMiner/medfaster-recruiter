import type {
  InstantJobCreatePayload,
  InstantJobFeePreviewPayload,
  JobCreatePayload,
  JobPreviewShiftTemplate,
  JobUrgency,
  PreviewShiftTemplateType,
} from "@/types";
import {
  getShiftDurationHours,
  parseClockTimeToMinutes,
} from "../validation/helpers";

const SHIFT_DISPLAY_NAME: Record<PreviewShiftTemplateType, string> = {
  MORNING: "Morning Shift",
  DAY: "Day Shift",
  EVENING: "Evening Shift",
  NIGHT: "Night Shift",
};

export type InstantBreakDurationBounds = {
  min: number;
  max: number;
  default: number;
};

function normalizeClockTime(time?: string | null): string | undefined {
  const trimmed = time?.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, 5);
}

function inferShiftTypeFromStartTime(
  startTime: string,
): PreviewShiftTemplateType {
  const minutes = parseClockTimeToMinutes(startTime);
  if (minutes === null) return "DAY";

  const hour = Math.floor(minutes / 60);
  if (hour >= 5 && hour < 12) return "MORNING";
  if (hour >= 12 && hour < 17) return "DAY";
  if (hour >= 17 && hour < 22) return "EVENING";
  return "NIGHT";
}

/** Break bounds for instant jobs based on computed shift length. */
export function getInstantBreakDurationBounds(
  checkIn?: string | null,
  checkOut?: string | null,
): InstantBreakDurationBounds {
  const duration = getShiftDurationHours(
    normalizeClockTime(checkIn),
    normalizeClockTime(checkOut),
  );

  if (duration === null) {
    return { min: 30, max: 60, default: 45 };
  }

  if (duration >= 11) {
    return { min: 60, max: 120, default: 90 };
  }

  if (duration >= 6) {
    return { min: 30, max: 60, default: 45 };
  }

  return { min: 0, max: 30, default: 0 };
}

export function clampInstantBreakDurationMinutes(
  value: number | undefined,
  checkIn?: string | null,
  checkOut?: string | null,
): number | undefined {
  if (value === undefined || !Number.isFinite(value)) return undefined;
  const { min, max } = getInstantBreakDurationBounds(checkIn, checkOut);
  return Math.min(max, Math.max(min, Math.floor(value)));
}

export function buildInstantShiftTemplate(
  checkIn?: string | null,
  checkOut?: string | null,
  breakMinutes?: number | null,
): JobPreviewShiftTemplate | null {
  const start_time = normalizeClockTime(checkIn);
  const end_time = normalizeClockTime(checkOut);
  if (!start_time || !end_time) return null;

  const duration_hours = getShiftDurationHours(start_time, end_time);
  if (duration_hours === null || duration_hours <= 0) return null;

  const bounds = getInstantBreakDurationBounds(start_time, end_time);
  const shift_type = inferShiftTypeFromStartTime(start_time);
  const break_minutes =
    clampInstantBreakDurationMinutes(
      breakMinutes ?? bounds.default,
      start_time,
      end_time,
    ) ?? bounds.default;

  return {
    shift_name: SHIFT_DISPLAY_NAME[shift_type],
    shift_type,
    start_time,
    end_time,
    duration_hours,
    break_minutes,
  };
}

function resolveNoOfHires(source: JobCreatePayload): number {
  const raw = source.no_of_hires_required;
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return Math.max(1, raw);
  }
  return 1;
}

function toCreateJobUrgency(urgency?: JobUrgency): JobUrgency {
  const raw = (urgency ?? "INSTANT").toString().toUpperCase();
  return raw === "INSTANT" ? "INSTANT" : "NORMAL";
}

export function buildInstantJobFeePreviewPayload(
  source: JobCreatePayload,
): InstantJobFeePreviewPayload | null {
  const jobTitle = source.job_title?.trim();
  const startDate = source.start_date?.trim();
  const endDate = source.end_date?.trim();
  const shiftTemplate = buildInstantShiftTemplate(
    source.check_in_time,
    source.check_out_time,
    source.break_duration_minutes,
  );

  if (!jobTitle || !startDate || !endDate || !shiftTemplate) {
    return null;
  }

  return {
    job_title: jobTitle,
    no_of_hires_required: resolveNoOfHires(source),
    start_date: startDate,
    end_date: endDate,
    shift_templates: [shiftTemplate],
  };
}

export function buildInstantJobCreatePayload(
  source: JobCreatePayload,
): InstantJobCreatePayload | null {
  const shiftTemplate = buildInstantShiftTemplate(
    source.check_in_time,
    source.check_out_time,
    source.break_duration_minutes,
  );
  if (!shiftTemplate) return null;

  const {
    check_in_time: _checkIn,
    check_out_time: _checkOut,
    break_duration_minutes: _breakMinutes,
    ...rest
  } = source;

  return {
    ...rest,
    job_urgency: toCreateJobUrgency(rest.job_urgency),
    shift_templates: [shiftTemplate],
  };
}
