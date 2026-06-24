import type {
  CycleStartDay,
  ShiftDurationType,
  ShiftScheduleDetail,
  ShiftType,
  StaffingType,
} from "@/types";
import { SHIFT_HANDOFF_OVERLAP_MINUTES } from "./constant";

export const TEMPLATE_DAY_COUNT = 14;
export const SCHEDULE_EMPTY_VALUE = "__none__";

export const CYCLE_START_DAY_OPTIONS: {
  label: string;
  value: CycleStartDay;
}[] = [
  { label: "Saturday", value: "SATURDAY" },
  { label: "Sunday", value: "SUNDAY" },
  { label: "Monday", value: "MONDAY" },
];

const CYCLE_START_WEEKDAY_INDEX: Record<CycleStartDay, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  SATURDAY: 6,
};

const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export type TemplateDayColumn = {
  dayIndex: number;
  dayNumber: number;
  label: string;
  weekdayShort: string;
  /** MM/DD when job start date is set */
  dateLabel?: string;
};

function parseScheduleAnchorDate(value?: Date | string): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? new Date(value) : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
}

function addCalendarDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function formatTemplateColumnDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
  });
}

export function getCycleStartDayLabel(cycleStartDay: CycleStartDay): string {
  return (
    CYCLE_START_DAY_OPTIONS.find((opt) => opt.value === cycleStartDay)?.label ??
    cycleStartDay
  );
}

export function getWeekdayShortForTemplateDay(
  cycleStartDay: CycleStartDay,
  dayIndex: number,
): string {
  const startIndex = CYCLE_START_WEEKDAY_INDEX[cycleStartDay];
  return WEEKDAY_SHORT[(startIndex + dayIndex) % 7];
}

/** Template day index (0-based) where job start weekday falls in the cycle. */
export function getTemplateDayIndexForJobStart(
  cycleStartDay: CycleStartDay,
  jobStart: Date,
): number {
  const cycleStartIndex = CYCLE_START_WEEKDAY_INDEX[cycleStartDay];
  const jobWeekday = jobStart.getDay();
  return (jobWeekday - cycleStartIndex + 7) % 7;
}

export function getFirstTemplateColumnWithDate(
  columns: TemplateDayColumn[],
): TemplateDayColumn | undefined {
  return columns.find((col) => col.dateLabel);
}

export function getLastTemplateColumnWithDate(
  columns: TemplateDayColumn[],
): TemplateDayColumn | undefined {
  for (let i = columns.length - 1; i >= 0; i--) {
    if (columns[i]?.dateLabel) return columns[i];
  }
  return undefined;
}

/**
 * Day 1 follows cycle start weekday. Calendar dates appear only from the
 * template day that matches the job start date (e.g. Monday cycle + Friday
 * start → Days 1–4 have no date; Day 5 = job start).
 */
export function buildTemplateDayColumns(
  cycleStartDay: CycleStartDay,
  startDate?: Date | string,
): TemplateDayColumn[] {
  const jobStart = parseScheduleAnchorDate(startDate);
  const jobStartDayIndex =
    jobStart != null
      ? getTemplateDayIndexForJobStart(cycleStartDay, jobStart)
      : null;

  return Array.from({ length: TEMPLATE_DAY_COUNT }, (_, dayIndex) => {
    const weekdayShort = getWeekdayShortForTemplateDay(cycleStartDay, dayIndex);
    let dateLabel: string | undefined;

    if (jobStart && jobStartDayIndex != null && dayIndex >= jobStartDayIndex) {
      const date = addCalendarDays(jobStart, dayIndex - jobStartDayIndex);
      dateLabel = formatTemplateColumnDate(date);
    }

    return {
      dayIndex,
      dayNumber: dayIndex + 1,
      label: `Day ${dayIndex + 1}`,
      weekdayShort,
      dateLabel,
    };
  });
}

/** 24 hr day: up to 2 shifts when each shift is 12 h, up to 3 when each is 8 h. */
export function getMaxSelectableShifts(
  jobDurationPerDay: "24" | "12" | "8",
  shiftDuration: ShiftDurationType,
): number {
  if (jobDurationPerDay !== "24") return 1;
  return shiftDuration === "12_hrs" ? 2 : 3;
}

export function canSelectMultipleShifts(
  jobDurationPerDay: "24" | "12" | "8",
): boolean {
  return jobDurationPerDay === "24";
}

/** 12 h day → 12 h shift; 8 h day → 8 h shift; 24 h day → no forced default. */
export function getDefaultShiftDurationForJobDay(
  jobDurationPerDay: "24" | "12" | "8",
): ShiftDurationType | null {
  if (jobDurationPerDay === "12") return "12_hrs";
  if (jobDurationPerDay === "8") return "8_hrs";
  return null;
}

export function buildTeamLabels(teamCount: number): string[] {
  const count = Math.max(0, Math.min(teamCount, 26));
  return Array.from({ length: count }, (_, i) =>
    `Team ${String.fromCharCode(65 + i)}`,
  );
}

export function getMinTeams(staffingType: StaffingType | undefined): number {
  return staffingType === "rotational" ? 2 : 1;
}

export function getDefaultTeamCount(
  staffingType: StaffingType | undefined,
): number {
  return getMinTeams(staffingType);
}

export function clampTeamCount(
  value: number,
  staffingType: StaffingType | undefined,
): number {
  const min = getMinTeams(staffingType);
  if (!Number.isFinite(value) || value < min) return min;
  return Math.min(26, Math.floor(value));
}

export function createEmptyScheduleTemplate(): string[] {
  return Array(TEMPLATE_DAY_COUNT).fill("");
}

export function normalizeScheduleTemplate(
  template: (string | null | undefined)[] | undefined,
  teamLabels: string[],
): string[] {
  const allowed = new Set(teamLabels);
  const base = createEmptyScheduleTemplate();
  (template ?? []).forEach((val, i) => {
    if (i >= TEMPLATE_DAY_COUNT) return;
    if (val && allowed.has(val)) base[i] = val;
  });
  return base;
}

/** User-facing error when no day in the 14-day template has a team assigned. */
export function formatScheduleTemplateAssignmentErrors(
  scheduleTemplate: string[] | undefined,
  teamLabels: string[],
): string | null {
  const template = normalizeScheduleTemplate(scheduleTemplate, teamLabels);
  const hasAssignment = template.some((assigned) => Boolean(assigned?.trim()));

  if (!hasAssignment) {
    return "Assign at least one team to a day in the 14-day schedule template.";
  }

  return null;
}

const SHIFTS_FOR_24H_8H: ShiftType[] = ["morning", "evening", "night"];

/** 24 h + 8 h → all 3 shifts auto-selected. 24 h + 12 h → user picks 2 (FIFO). */
export function getAutoSelectedShifts(
  jobDurationPerDay: "24" | "12" | "8",
  shiftDuration: ShiftDurationType,
): ShiftType[] | null {
  if (jobDurationPerDay === "24" && shiftDuration === "8_hrs") {
    return [...SHIFTS_FOR_24H_8H];
  }
  return null;
}

/** 24 h day with 12 h shifts: pick 2; adding a 3rd drops the earliest pick. */
export function usesFifoShiftSelection(
  jobDurationPerDay: "24" | "12" | "8",
  shiftDuration: ShiftDurationType,
): boolean {
  return jobDurationPerDay === "24" && shiftDuration === "12_hrs";
}

export function trimSelectedShifts(
  selected: ShiftType[],
  jobDurationPerDay: "24" | "12" | "8",
  shiftDuration: ShiftDurationType,
): ShiftType[] {
  const max = getMaxSelectableShifts(jobDurationPerDay, shiftDuration);
  if (selected.length <= max) return selected.length ? selected : ["morning"];
  if (usesFifoShiftSelection(jobDurationPerDay, shiftDuration)) {
    return selected.slice(-max);
  }
  return selected.slice(0, max);
}

export function applyFifoShiftAdd(
  current: ShiftType[],
  value: ShiftType,
  max: number,
): { next: ShiftType[]; removed?: ShiftType } {
  if (current.includes(value)) return { next: current };
  if (current.length < max) return { next: [...current, value] };
  return { next: [...current.slice(1), value], removed: current[0] };
}

/** Applies auto-selection for 24 h days, otherwise trims to allowed count. */
export function resolveSelectedShifts(
  selected: ShiftType[],
  jobDurationPerDay: "24" | "12" | "8",
  shiftDuration: ShiftDurationType,
): ShiftType[] {
  const auto = getAutoSelectedShifts(jobDurationPerDay, shiftDuration);
  if (auto) return auto;
  return trimSelectedShifts(selected, jobDurationPerDay, shiftDuration);
}

export interface BreakDurationBounds {
  min: number;
  max: number;
  default: number;
}

/** 8 h shift: 30–60 min (default 45). 12 h shift: 60–120 min (default 90). */
export function getShiftLengthHours(shiftDuration: ShiftDurationType): number {
  return shiftDuration === "12_hrs" ? 12 : 8;
}

const SHIFT_DAY_ORDER: ShiftType[] = ["morning", "evening", "night"];

export type ShiftTimesState = {
  morning_shift_start?: string;
  morning_shift_end?: string;
  evening_shift_start?: string;
  evening_shift_end?: string;
  night_shift_start?: string;
  night_shift_end?: string;
};

/** Morning → evening → night for 24 h chained coverage. */
export function sortShiftsInDayOrder(selected: ShiftType[]): ShiftType[] {
  return SHIFT_DAY_ORDER.filter((shift) => selected.includes(shift));
}

function parseTimeToMinutes(time: string): number | null {
  const [h, m] = time.split(":").map((v) => parseInt(v, 10));
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

function formatMinutesAsTime(totalMinutes: number): string {
  const normalized = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function addMinutesToTime(
  time: string,
  deltaMinutes: number,
): string | null {
  const minutes = parseTimeToMinutes(time);
  if (minutes === null) return null;
  return formatMinutesAsTime(minutes + deltaMinutes);
}

/** Adds shift length (+ optional handoff overlap) to start time (24h `HH:MM`). */
export function calculateShiftEndTime(
  startTime: string,
  shiftDuration: ShiftDurationType,
  overlapMinutes = 0,
): string | null {
  const startMinutes = parseTimeToMinutes(startTime);
  if (startMinutes === null) return null;
  const durationMinutes = getShiftLengthHours(shiftDuration) * 60;
  return formatMinutesAsTime(startMinutes + durationMinutes + overlapMinutes);
}

/** Subtracts shift length (+ optional handoff overlap) from end time (24h `HH:MM`). */
export function calculateShiftStartTime(
  endTime: string,
  shiftDuration: ShiftDurationType,
  overlapMinutes = 0,
): string | null {
  const endMinutes = parseTimeToMinutes(endTime);
  if (endMinutes === null) return null;
  const durationMinutes = getShiftLengthHours(shiftDuration) * 60;
  return formatMinutesAsTime(
    endMinutes - durationMinutes - overlapMinutes,
  );
}

function getChainedNextShiftStart(previousShiftEnd: string): string | null {
  return addMinutesToTime(
    previousShiftEnd,
    -SHIFT_HANDOFF_OVERLAP_MINUTES,
  );
}

export function getShiftStartFromState(
  shift: ShiftType,
  state: ShiftTimesState,
): string | undefined {
  if (shift === "morning") return state.morning_shift_start;
  if (shift === "evening") return state.evening_shift_start;
  if (shift === "night") return state.night_shift_start;
  return undefined;
}

export function getShiftEndFromState(
  shift: ShiftType,
  state: ShiftTimesState,
): string | undefined {
  if (shift === "morning") return state.morning_shift_end;
  if (shift === "evening") return state.evening_shift_end;
  if (shift === "night") return state.night_shift_end;
  return undefined;
}

function setShiftTimesInState(
  shift: ShiftType,
  start: string,
  end: string,
  state: ShiftTimesState,
): void {
  if (shift === "morning") {
    state.morning_shift_start = start;
    state.morning_shift_end = end;
  } else if (shift === "evening") {
    state.evening_shift_start = start;
    state.evening_shift_end = end;
  } else {
    state.night_shift_start = start;
    state.night_shift_end = end;
  }
}

export function clearShiftTimesInState(
  shift: ShiftType,
  state: ShiftTimesState,
): void {
  setShiftTimesInState(shift, "", "", state);
}

/** One shift: end = start + shift length. */
export function buildSingleShiftTimes(
  shift: ShiftType,
  startTime: string,
  shiftDuration: ShiftDurationType,
): ShiftTimesState {
  const end = calculateShiftEndTime(startTime, shiftDuration);
  if (!end) return {};
  const patch: ShiftTimesState = {};
  setShiftTimesInState(shift, startTime, end, patch);
  return patch;
}

/** One shift: start = end − shift length. */
export function buildSingleShiftTimesFromEnd(
  shift: ShiftType,
  endTime: string,
  shiftDuration: ShiftDurationType,
): ShiftTimesState {
  const start = calculateShiftStartTime(endTime, shiftDuration);
  if (!start) return {};
  const patch: ShiftTimesState = {};
  setShiftTimesInState(shift, start, endTime, patch);
  return patch;
}

/**
 * 24 h day with multiple shifts: each shift starts when the previous ends.
 * Editing a start time recalculates that shift and all following shifts in order.
 */
export function buildChainedShiftTimes(params: {
  selectedShifts: ShiftType[];
  shiftDuration: ShiftDurationType;
  anchorShift: ShiftType;
  anchorStartTime: string;
}): ShiftTimesState {
  const ordered = sortShiftsInDayOrder(params.selectedShifts);
  const anchorIndex = ordered.indexOf(params.anchorShift);
  if (anchorIndex < 0) return {};

  const patch: ShiftTimesState = {};
  let currentStart = params.anchorStartTime;
  const overlap = SHIFT_HANDOFF_OVERLAP_MINUTES;

  for (let i = anchorIndex; i < ordered.length; i++) {
    const shift = ordered[i];
    const end = calculateShiftEndTime(
      currentStart,
      params.shiftDuration,
      overlap,
    );
    if (!end) break;
    setShiftTimesInState(shift, currentStart, end, patch);
    currentStart = getChainedNextShiftStart(end) ?? end;
  }

  return patch;
}

/**
 * 24 h day with multiple shifts: editing an end time sets that shift's start from
 * duration, then recalculates all following shifts in order.
 */
export function buildChainedShiftTimesFromEnd(params: {
  selectedShifts: ShiftType[];
  shiftDuration: ShiftDurationType;
  anchorShift: ShiftType;
  anchorEndTime: string;
}): ShiftTimesState {
  const ordered = sortShiftsInDayOrder(params.selectedShifts);
  const anchorIndex = ordered.indexOf(params.anchorShift);
  if (anchorIndex < 0) return {};

  const overlap = SHIFT_HANDOFF_OVERLAP_MINUTES;
  const anchorStart = calculateShiftStartTime(
    params.anchorEndTime,
    params.shiftDuration,
    overlap,
  );
  if (!anchorStart) return {};

  const patch: ShiftTimesState = {};
  setShiftTimesInState(
    params.anchorShift,
    anchorStart,
    params.anchorEndTime,
    patch,
  );

  let currentStart = getChainedNextShiftStart(params.anchorEndTime);
  if (!currentStart) return patch;

  for (let i = anchorIndex + 1; i < ordered.length; i++) {
    const shift = ordered[i];
    const end = calculateShiftEndTime(
      currentStart,
      params.shiftDuration,
      overlap,
    );
    if (!end) break;
    setShiftTimesInState(shift, currentStart, end, patch);
    currentStart = getChainedNextShiftStart(end) ?? end;
  }

  return patch;
}

export function shouldChainShiftTimes(
  jobDurationPerDay: "24" | "12" | "8",
  selectedShifts: ShiftType[],
): boolean {
  return canSelectMultipleShifts(jobDurationPerDay) && selectedShifts.length > 1;
}

/** Handoff overlap included in chained shift end times (not actual work time). */
export function getShiftHandoffOverlapMinutes(
  jobDurationPerDay?: string,
  selectedShifts?: ShiftType[],
): number {
  if (!selectedShifts?.length) return 0;

  const duration = (jobDurationPerDay ?? "8") as "24" | "12" | "8";
  return shouldChainShiftTimes(duration, selectedShifts)
    ? SHIFT_HANDOFF_OVERLAP_MINUTES
    : 0;
}

/** First shift in day order — anchor for chained 24 h coverage. */
export function getChainedShiftAnchor(
  selectedShifts: ShiftType[],
): ShiftType | undefined {
  return sortShiftsInDayOrder(selectedShifts)[0];
}

/** Only the first selected shift's start time is user-editable when shifts chain. */
export function isShiftStartTimeEditable(params: {
  jobDurationPerDay: "24" | "12" | "8";
  selectedShifts: ShiftType[];
  shift: ShiftType;
}): boolean {
  const anchor = getChainedShiftAnchor(params.selectedShifts);
  return anchor != null && params.shift === anchor;
}

/** End times are always derived from start time (or the chain), never edited directly. */
export function isShiftEndTimeEditable(): boolean {
  return false;
}

/** Rebuild chain from the first selected shift that already has a start time. */
/**
 * Fills missing shift start/end from chained 24h coverage or shift duration rules.
 * Used for preview payload and anywhere all selected shifts need concrete times.
 */
export function resolveShiftTimesForJob(params: {
  selectedShifts: ShiftType[];
  shiftDuration: ShiftDurationType;
  jobDurationPerDay?: "24" | "12" | "8";
  existing: ShiftTimesState;
}): ShiftTimesState {
  const ordered = sortShiftsInDayOrder(params.selectedShifts);
  if (!ordered.length) return { ...params.existing };

  const jobDurationPerDay = params.jobDurationPerDay ?? "24";

  if (shouldChainShiftTimes(jobDurationPerDay, ordered)) {
    return {
      ...params.existing,
      ...rebuildShiftTimeChain({
        selectedShifts: params.selectedShifts,
        shiftDuration: params.shiftDuration,
        jobDurationPerDay,
        existing: params.existing,
      }),
    };
  }

  const resolved: ShiftTimesState = { ...params.existing };
  const first = ordered[0];

  for (const shift of ordered) {
    let start = getShiftStartFromState(shift, resolved)?.trim();
    let end = getShiftEndFromState(shift, resolved)?.trim();

    if (!start && shift === first) {
      start = "09:00";
    }

    if (start && !end) {
      const calculatedEnd = calculateShiftEndTime(start, params.shiftDuration);
      if (calculatedEnd) {
        setShiftTimesInState(shift, start, calculatedEnd, resolved);
        end = calculatedEnd;
      }
    }

    if (start && end) {
      setShiftTimesInState(shift, start, end, resolved);
    }
  }

  return resolved;
}

export function rebuildShiftTimeChain(params: {
  selectedShifts: ShiftType[];
  shiftDuration: ShiftDurationType;
  jobDurationPerDay: "24" | "12" | "8";
  existing: ShiftTimesState;
}): ShiftTimesState {
  const ordered = sortShiftsInDayOrder(params.selectedShifts);
  if (!ordered.length) return {};

  if (!shouldChainShiftTimes(params.jobDurationPerDay, ordered)) {
    const first = ordered[0];
    const start = getShiftStartFromState(first, params.existing);
    if (!start) return {};
    return buildSingleShiftTimes(first, start, params.shiftDuration);
  }

  const anchorShift = ordered[0];
  const anchorStart = getShiftStartFromState(anchorShift, params.existing);

  if (!anchorStart) return {};

  return buildChainedShiftTimes({
    selectedShifts: params.selectedShifts,
    shiftDuration: params.shiftDuration,
    anchorShift,
    anchorStartTime: anchorStart,
  });
}

export function getBreakDurationBounds(
  shiftDuration: ShiftDurationType,
): BreakDurationBounds {
  if (shiftDuration === "12_hrs") {
    return { min: 60, max: 120, default: 90 };
  }
  return { min: 30, max: 60, default: 45 };
}

export function getDefaultBreakDurationMinutes(
  shiftDuration: ShiftDurationType,
): number {
  return getBreakDurationBounds(shiftDuration).default;
}

export function clampBreakDurationMinutes(
  value: number | undefined,
  shiftDuration: ShiftDurationType,
): number | undefined {
  if (value === undefined || !Number.isFinite(value)) return undefined;
  const { min, max } = getBreakDurationBounds(shiftDuration);
  return Math.min(max, Math.max(min, Math.floor(value)));
}

export const MIN_CANDIDATES_PER_SHIFT = 1;

export function getDefaultShiftCandidateCount(): number {
  return MIN_CANDIDATES_PER_SHIFT;
}

export function clampShiftCandidateCount(
  value: number | undefined,
): number | undefined {
  if (value === undefined || !Number.isFinite(value)) return undefined;
  return Math.max(MIN_CANDIDATES_PER_SHIFT, Math.floor(value));
}

export function normalizeShiftScheduleBreaks(
  selectedShifts: ShiftType[],
  details: Partial<Record<ShiftType, ShiftScheduleDetail>> | undefined,
  shiftDuration: ShiftDurationType,
): Partial<Record<ShiftType, ShiftScheduleDetail>> {
  const next = { ...(details ?? {}) };
  const bounds = getBreakDurationBounds(shiftDuration);

  for (const shift of selectedShifts) {
    const currentBreak = next[shift]?.break_duration_minutes;
    const break_duration_minutes =
      currentBreak === undefined
        ? bounds.default
        : (clampBreakDurationMinutes(currentBreak, shiftDuration) ??
          bounds.default);

    const currentCandidates = next[shift]?.no_of_candidates;
    const no_of_candidates =
      currentCandidates === undefined ||
      currentCandidates < MIN_CANDIDATES_PER_SHIFT
        ? MIN_CANDIDATES_PER_SHIFT
        : Math.floor(currentCandidates);

    next[shift] = {
      ...next[shift],
      break_duration_minutes,
      no_of_candidates,
    };
  }

  return next;
}

/** Sum of candidates across selected shifts (min 1 per shift). */
export function sumCandidatesPerShift(
  selectedShifts: ShiftType[],
  details?: Partial<Record<ShiftType, ShiftScheduleDetail>>,
): number {
  const ordered = sortShiftsInDayOrder(selectedShifts);
  if (!ordered.length) return MIN_CANDIDATES_PER_SHIFT;
  return ordered.reduce(
    (sum, shift) =>
      sum +
      (clampShiftCandidateCount(details?.[shift]?.no_of_candidates) ??
        MIN_CANDIDATES_PER_SHIFT),
    0,
  );
}

/** Candidates required per team = sum of per-shift candidate counts. */
export function getCandidatesPerTeam(
  selectedShifts: ShiftType[],
  details?: Partial<Record<ShiftType, ShiftScheduleDetail>>,
): number {
  return sumCandidatesPerShift(selectedShifts, details);
}

export function formatShiftCandidateBreakdown(
  selectedShifts: ShiftType[],
  details?: Partial<Record<ShiftType, ShiftScheduleDetail>>,
): string {
  const ordered = sortShiftsInDayOrder(selectedShifts);
  if (!ordered.length) return String(MIN_CANDIDATES_PER_SHIFT);
  return ordered
    .map(
      (shift) =>
        clampShiftCandidateCount(details?.[shift]?.no_of_candidates) ??
        MIN_CANDIDATES_PER_SHIFT,
    )
    .join(" + ");
}

export function calculateTotalCandidatesRequired(
  selectedShifts: ShiftType[],
  details: Partial<Record<ShiftType, ShiftScheduleDetail>> | undefined,
  teamCount: number,
): number {
  const perTeam = getCandidatesPerTeam(selectedShifts, details);
  const teams = Math.max(1, Math.floor(teamCount));
  return perTeam * teams;
}

/** @deprecated Use calculateTotalCandidatesRequired */
export function sumShiftCandidates(
  selectedShifts: ShiftType[],
  details?: Partial<Record<ShiftType, ShiftScheduleDetail>>,
  teamCount = 1,
): number {
  return calculateTotalCandidatesRequired(selectedShifts, details, teamCount);
}

export function getTeamForTemplateDay(
  scheduleTemplate: string[] | undefined,
  dayIndex: number,
): string {
  const val = scheduleTemplate?.[dayIndex]?.trim();
  return val ? val : "-";
}

export const MAX_CANDIDATE_WEEKLY_WORKING_HOURS = 40;
export const TEMPLATE_DAYS_PER_WEEK = 7;

/** Net paid hours for one shift: shift length minus break (e.g. 8 h shift, 60 min break → 7 h). */
export function getNetWorkingHoursPerShift(
  shiftDuration: ShiftDurationType,
  breakDurationMinutes: number | undefined,
): number {
  const shiftHours = getShiftLengthHours(shiftDuration);
  const breakHours = (breakDurationMinutes ?? 0) / 60;
  return Math.max(0, shiftHours - breakHours);
}

function countTeamAssignedDaysInTemplateWeek(
  scheduleTemplate: string[] | undefined,
  team: string,
  weekIndex: number,
): number {
  if (!team) return 0;

  const weekStart = weekIndex * TEMPLATE_DAYS_PER_WEEK;
  const weekEnd = weekStart + TEMPLATE_DAYS_PER_WEEK;
  const template = scheduleTemplate ?? [];
  let count = 0;

  for (let dayIndex = weekStart; dayIndex < weekEnd; dayIndex++) {
    if (template[dayIndex] === team) count++;
  }
  return count;
}

const SHIFT_TYPE_LABEL: Record<ShiftType, string> = {
  morning: "Morning",
  day: "Day",
  evening: "Evening",
  night: "Night",
};

export type CandidateWeeklyHoursViolation = {
  team: string;
  weekNumber: number;
  hours: number;
  maxHours: number;
  shift: ShiftType;
};

/**
 * Weekly hours per candidate on one shift type: assigned template days in that
 * week × net hours for that shift (shift length minus break). Candidates are
 * hired per shift, not across all shifts on the same day.
 */
export function getTeamShiftWeeklyWorkingHours(
  scheduleTemplate: string[] | undefined,
  team: string,
  weekIndex: number,
  shift: ShiftType,
  details: Partial<Record<ShiftType, ShiftScheduleDetail>> | undefined,
  shiftDuration: ShiftDurationType,
): number {
  const netPerShift = getNetWorkingHoursPerShift(
    shiftDuration,
    details?.[shift]?.break_duration_minutes ??
      getDefaultBreakDurationMinutes(shiftDuration),
  );
  if (netPerShift <= 0) return 0;

  const assignedDays = countTeamAssignedDaysInTemplateWeek(
    scheduleTemplate,
    team,
    weekIndex,
  );
  return assignedDays * netPerShift;
}

export function getCandidateWeeklyHoursViolations(params: {
  scheduleTemplate: string[] | undefined;
  teamLabels: string[];
  selectedShifts: ShiftType[];
  shiftScheduleDetails?: Partial<Record<ShiftType, ShiftScheduleDetail>>;
  shiftDuration: ShiftDurationType;
  maxHoursPerWeek?: number;
}): CandidateWeeklyHoursViolation[] {
  const maxHours = params.maxHoursPerWeek ?? MAX_CANDIDATE_WEEKLY_WORKING_HOURS;
  const ordered = sortShiftsInDayOrder(params.selectedShifts);
  if (!ordered.length) return [];

  const weekCount = Math.ceil(TEMPLATE_DAY_COUNT / TEMPLATE_DAYS_PER_WEEK);
  const violations: CandidateWeeklyHoursViolation[] = [];

  for (const team of params.teamLabels) {
    for (let weekIndex = 0; weekIndex < weekCount; weekIndex++) {
      for (const shift of ordered) {
        const hours = getTeamShiftWeeklyWorkingHours(
          params.scheduleTemplate,
          team,
          weekIndex,
          shift,
          params.shiftScheduleDetails,
          params.shiftDuration,
        );
        if (hours > maxHours) {
          violations.push({
            team,
            weekNumber: weekIndex + 1,
            hours,
            maxHours,
            shift,
          });
        }
      }
    }
  }

  return violations;
}

export function formatCandidateWeeklyHoursViolation(
  violation: CandidateWeeklyHoursViolation,
): string {
  const hoursLabel = Number.isInteger(violation.hours)
    ? String(violation.hours)
    : violation.hours.toFixed(1);
  const shiftLabel = SHIFT_TYPE_LABEL[violation.shift];
  return `${violation.team} (${shiftLabel}) exceeds ${violation.maxHours} hrs in template week ${violation.weekNumber} (${hoursLabel} hrs per candidate)`;
}

export function formatCandidateWeeklyHoursViolations(
  violations: CandidateWeeklyHoursViolation[],
): string | null {
  if (!violations.length) return null;
  return violations.map(formatCandidateWeeklyHoursViolation).join(" ");
}

export function wouldAssignDayExceedWeeklyHoursLimit(params: {
  scheduleTemplate: string[];
  team: string;
  dayIndex: number;
  selectedShifts: ShiftType[];
  shiftScheduleDetails?: Partial<Record<ShiftType, ShiftScheduleDetail>>;
  shiftDuration: ShiftDurationType;
  maxHoursPerWeek?: number;
}): boolean {
  if (params.scheduleTemplate[params.dayIndex] === params.team) {
    return false;
  }

  const maxHours = params.maxHoursPerWeek ?? MAX_CANDIDATE_WEEKLY_WORKING_HOURS;
  const weekIndex = Math.floor(params.dayIndex / TEMPLATE_DAYS_PER_WEEK);
  const ordered = sortShiftsInDayOrder(params.selectedShifts);

  return ordered.some((shift) => {
    const netPerShift = getNetWorkingHoursPerShift(
      params.shiftDuration,
      params.shiftScheduleDetails?.[shift]?.break_duration_minutes ??
        getDefaultBreakDurationMinutes(params.shiftDuration),
    );
    if (netPerShift <= 0) return false;

    const assignedDays = countTeamAssignedDaysInTemplateWeek(
      params.scheduleTemplate,
      params.team,
      weekIndex,
    );
    return (assignedDays + 1) * netPerShift > maxHours;
  });
}
