import type {
  JobCreatePayload,
  JobFormData,
  JobType,
  JobUrgency,
  NormalJobFeePreviewPayload,
  NormalJobSchedulingPayload,
  PreviewShiftMode,
  PreviewShiftTemplateType,
  ShiftDurationType,
  ShiftType,
} from "@/types";
import {
  buildTeamLabels,
  clampShiftCandidateCount,
  clampTeamCount,
  getDefaultBreakDurationMinutes,
  getDefaultTeamCount,
  getShiftEndFromState,
  getShiftStartFromState,
  getShiftLengthHours,
  MIN_CANDIDATES_PER_SHIFT,
  resolveShiftTimesForJob,
  TEMPLATE_DAY_COUNT,
  type ShiftTimesState,
} from "./scheduling-utils";
import { DEFAULT_CYCLE_START_DAY } from "./constant";
import { getShiftDurationHours } from "../validation/helpers";

export type { NormalJobFeePreviewPayload };

const SHIFT_TEMPLATE_ORDER: ShiftType[] = [
  "morning",
  "day",
  "evening",
  "night",
];

const SHIFT_TYPE_TO_PREVIEW: Record<ShiftType, PreviewShiftTemplateType> = {
  morning: "MORNING",
  day: "DAY",
  evening: "EVENING",
  night: "NIGHT",
};

const SHIFT_DISPLAY_NAME: Record<ShiftType, string> = {
  morning: "Morning Shift",
  day: "Day Shift",
  evening: "Evening Shift",
  night: "Night Shift",
};

function toPreviewIsoDate(value?: string | Date | null): string | undefined {
  if (value == null || value === "") return undefined;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

function toPreviewJobUrgency(urgency?: JobUrgency): JobUrgency {
  const raw = (urgency ?? "NORMAL").toString().toUpperCase();
  return raw === "INSTANT" ? "INSTANT" : "NORMAL";
}

function resolveDurationHours(
  startTime: string,
  endTime: string,
  shiftDuration: ShiftDurationType,
): number {
  const fromTimes = getShiftDurationHours(startTime, endTime);
  if (fromTimes != null && fromTimes > 0) return fromTimes;
  return getShiftLengthHours(shiftDuration);
}

function orderShiftsForPreview(selected: ShiftType[]): ShiftType[] {
  return SHIFT_TEMPLATE_ORDER.filter((shift) => selected.includes(shift));
}

export type NormalJobSchedulingSource = JobCreatePayload | JobFormData;

/**
 * Builds shift templates and team cycles for normal job preview/create requests.
 */
export function buildNormalJobSchedulingPayload(
  source: NormalJobSchedulingSource,
): NormalJobSchedulingPayload | null {
  const jobTitle = source.job_title?.trim();
  const province = source.province?.trim();
  const startDate = toPreviewIsoDate(source.start_date);
  const endDate = toPreviewIsoDate(source.end_date);

  const selectedShifts = orderShiftsForPreview(
    (source.selected_shift_types as ShiftType[] | undefined) ?? [],
  );

  if (!jobTitle || !province || !startDate || !endDate || selectedShifts.length === 0) {
    return null;
  }

  const shiftDuration =
    (source.shift_duration_type as ShiftDurationType | undefined) ?? "8_hrs";
  const staffingType = source.staffing_type ?? "standard";
  const shiftMode: PreviewShiftMode =
    staffingType === "rotational" ? "ROTATIONAL" : "STANDARD";
  const cycleStartDay = source.cycle_start_day ?? DEFAULT_CYCLE_START_DAY;
  const shiftDetails = source.shift_schedule_details ?? {};
  const scheduleTemplate = source.schedule_template ?? [];

  const teamCount = clampTeamCount(
    Number(source.number_of_teams) || getDefaultTeamCount(staffingType),
    staffingType,
  );
  const teamLabels = buildTeamLabels(teamCount);

  const existingTimes: ShiftTimesState = {
    morning_shift_start: source.morning_shift_start,
    morning_shift_end: source.morning_shift_end,
    evening_shift_start: source.evening_shift_start,
    evening_shift_end: source.evening_shift_end,
    night_shift_start: source.night_shift_start,
    night_shift_end: source.night_shift_end,
  };

  const resolvedTimes = resolveShiftTimesForJob({
    selectedShifts,
    shiftDuration,
    jobDurationPerDay: source.job_duration_per_day,
    existing: existingTimes,
  });

  const shift_templates = selectedShifts.flatMap((shift) => {
    const startTime = getShiftStartFromState(shift, resolvedTimes)?.trim();
    const endTime = getShiftEndFromState(shift, resolvedTimes)?.trim();
    if (!startTime || !endTime) return [];

    const breakMinutes =
      shiftDetails[shift]?.break_duration_minutes ??
      getDefaultBreakDurationMinutes(shiftDuration);

    return [
      {
        shift_name: SHIFT_DISPLAY_NAME[shift],
        shift_type: SHIFT_TYPE_TO_PREVIEW[shift],
        start_time: startTime,
        end_time: endTime,
        duration_hours: resolveDurationHours(
          startTime,
          endTime,
          shiftDuration,
        ),
        break_minutes: breakMinutes,
      },
    ];
  });

  if (shift_templates.length !== selectedShifts.length) {
    return null;
  }

  const teams = teamLabels.map((teamName) => {
    const cycle: NormalJobSchedulingPayload["teams"][number]["cycle"] = [];

    for (let dayIndex = 0; dayIndex < TEMPLATE_DAY_COUNT; dayIndex++) {
      if (scheduleTemplate[dayIndex] !== teamName) continue;

      selectedShifts.forEach((shift, shiftTemplateIndex) => {
        cycle.push({
          cycle_day: dayIndex + 1,
          shift_template_index: shiftTemplateIndex,
          required_workers:
            clampShiftCandidateCount(shiftDetails[shift]?.no_of_candidates) ??
            MIN_CANDIDATES_PER_SHIFT,
        });
      });
    }

    cycle.sort(
      (a, b) =>
        a.cycle_day - b.cycle_day ||
        a.shift_template_index - b.shift_template_index,
    );

    return { team_name: teamName, cycle };
  });

  return {
    job_title: jobTitle,
    province,
    job_urgency: toPreviewJobUrgency(source.job_urgency),
    job_type: (source.job_type as JobType | undefined) ?? "part_time",
    shift_mode: shiftMode,
    rotation_cycle_days: TEMPLATE_DAY_COUNT,
    cycle_start_day: cycleStartDay,
    start_date: startDate,
    end_date: endDate,
    shift_templates,
    teams,
  };
}

/**
 * Builds the backend preview/fee request body from normal job scheduling state.
 */
export function buildNormalJobFeePreviewPayload(
  source: NormalJobSchedulingSource,
): NormalJobFeePreviewPayload | null {
  return buildNormalJobSchedulingPayload(source);
}
