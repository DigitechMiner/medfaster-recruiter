"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarIcon, Check, Clock } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type {
  CycleStartDay,
  JobFormData,
  ShiftDurationType,
  ShiftScheduleDetail,
  ShiftType,
  StaffingType,
} from "@/types";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { JobFormField, JobFormSelect } from "../components/form-field";
import { DateRangePicker } from "../components/date-picker";
import { CustomTimePicker } from "../components/time-picker";
import { formatFacilityTimezoneHint } from "@/utils/timezone/format-facility-timezone-hint";
import {
  buildChainedShiftTimes,
  buildChainedShiftTimesFromEnd,
  buildSingleShiftTimes,
  buildSingleShiftTimesFromEnd,
  buildTeamLabels,
  canSelectMultipleShifts,
  clearShiftTimesInState,
  clampBreakDurationMinutes,
  clampShiftCandidateCount,
  clampTeamCount,
  getDefaultShiftCandidateCount,
  buildTemplateDayColumns,
  CYCLE_START_DAY_OPTIONS,
  getCycleStartDayLabel,
  getFirstTemplateColumnWithDate,
  getLastTemplateColumnWithDate,
  getBreakDurationBounds,
  getDefaultBreakDurationMinutes,
  getDefaultTeamCount,
  getAutoSelectedShifts,
  getDefaultShiftDurationForJobDay,
  getMaxSelectableShifts,
  getMinTeams,
  normalizeScheduleTemplate,
  normalizeShiftScheduleBreaks,
  rebuildShiftTimeChain,
  applyFifoShiftAdd,
  resolveSelectedShifts,
  shouldChainShiftTimes,
  getShiftHandoffOverlapMinutes,
  calculateTotalCandidatesRequired,
  formatShiftCandidateBreakdown,
  getCandidatesPerTeam,
  getCandidateWeeklyHoursViolations,
  formatCandidateWeeklyHoursViolations,
  getChainedShiftAnchor,
  isShiftEndTimeEditable,
  isShiftStartTimeEditable,
  buildShiftTimingDisplays,
  formatShiftDayLabel,
  sortShiftsInDayOrder,
  MAX_CANDIDATE_WEEKLY_WORKING_HOURS,
  usesFifoShiftSelection,
  type ShiftTimesState,
} from "./scheduling-utils";
import { DEFAULT_CYCLE_START_DAY, SHIFT_HANDOFF_OVERLAP_MINUTES } from "./constant";
import { inferFormShiftTypeFromStartTime } from "../shift-windows";
import { useSyncBackendPayRate } from "./use-platform-pay-rate";

interface NormalSchedulingStepProps {
  formData: JobFormData;
  updateFormData: (updates: Partial<JobFormData>) => void;
}

const SHIFT_TYPES: { label: string; value: ShiftType }[] = [
  { label: "Morning", value: "morning" },
  { label: "Evening", value: "evening" },
  { label: "Night", value: "night" },
];

const RADIO_ITEM_CLASS =
  "border-[#F4781B] text-white data-[state=checked]:bg-[#F4781B] data-[state=checked]:border-[#F4781B]";

type ShiftKey = "morning" | "evening" | "night";
type TimePart = "start" | "end";
type DateEditMode = "start" | "end";

function ReadOnlyMetric({
  label,
  hint,
  value,
  required,
}: {
  label: string;
  hint: string;
  value: string;
  required?: boolean;
}) {
  return (
    <JobFormField label={label} required={required} className="space-y-2">
      <div className="flex h-11 w-full items-center rounded-md border border-gray-200 bg-gray-50 px-4 text-base font-semibold text-gray-900">
        {value}
      </div>
      <p className="text-xs text-gray-400">{hint}</p>
    </JobFormField>
  );
}

function SchedulingFieldHint({ message }: { message?: string | null }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs text-gray-400">{message}</p>;
}

function ScheduleTemplateDayToggle({
  selected,
  onClick,
  ariaLabel,
}: {
  selected: boolean;
  onClick: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={selected}
      className="mx-auto flex h-9 w-9 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4781B] focus-visible:ring-offset-1"
    >
      <span
        className={cn(
          "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors",
          selected ? "border-[#F4781B]" : "border-gray-300",
        )}
      >
        {selected ? (
          <span className="h-2.5 w-2.5 rounded-full bg-[#F4781B]" />
        ) : null}
      </span>
    </button>
  );
}

export function NormalSchedulingStep({
  formData,
  updateFormData,
}: NormalSchedulingStepProps) {
  useSyncBackendPayRate(formData, updateFormData);

  const staffingType: StaffingType =
    (formData.staffing_type as StaffingType) ?? "standard";
  const shiftDuration: ShiftDurationType =
    (formData.shift_duration_type as ShiftDurationType) ?? "8_hrs";

  const selectedShiftTypes = useMemo(
    () => (formData.selected_shift_types as ShiftType[]) ?? [],
    [formData.selected_shift_types],
  );
  const includeShiftHandoff = formData.include_shift_handoff !== false;
  const handoffOverlapMinutes = getShiftHandoffOverlapMinutes(
    formData.job_duration_per_day,
    selectedShiftTypes,
    includeShiftHandoff,
  );

  const [showCalendar, setShowCalendar] = useState(false);
  const [dateEditMode, setDateEditMode] = useState<DateEditMode>("start");
  const [activeShiftForTime, setActiveShiftForTime] = useState<ShiftKey | null>(
    null,
  );
  const [activeTimePart, setActiveTimePart] = useState<TimePart>("start");
  const [breakDurationDrafts, setBreakDurationDrafts] = useState<
    Partial<Record<ShiftType, string>>
  >({});

  const today = new Date();

  const isRotational = staffingType === "rotational";
  const isStandard = staffingType === "standard";
  const jobDurationPerDay = formData.job_duration_per_day ?? "24";
  const multipleShiftsAllowed = canSelectMultipleShifts(jobDurationPerDay);
  const autoSelectedShifts = getAutoSelectedShifts(
    jobDurationPerDay,
    shiftDuration,
  );
  const isAutoShiftSelection = autoSelectedShifts !== null;
  const usesFifoShifts = usesFifoShiftSelection(
    jobDurationPerDay,
    shiftDuration,
  );
  const lockedShiftDuration = getDefaultShiftDurationForJobDay(
    jobDurationPerDay,
  );
  const maxSelectableShifts = getMaxSelectableShifts(
    jobDurationPerDay,
    shiftDuration,
  );

  const teamCount = clampTeamCount(
    Number(formData.number_of_teams) || getDefaultTeamCount(staffingType),
    staffingType,
  );
  const teamLabels = useMemo(() => buildTeamLabels(teamCount), [teamCount]);
  const scheduleTemplate = useMemo(
    () =>
      normalizeScheduleTemplate(formData.schedule_template, teamLabels),
    [formData.schedule_template, teamLabels],
  );

  const weeklyHoursViolations = useMemo(
    () =>
      getCandidateWeeklyHoursViolations({
        scheduleTemplate,
        teamLabels,
        selectedShifts: selectedShiftTypes,
        shiftScheduleDetails: formData.shift_schedule_details,
        shiftDuration,
      }),
    [
      scheduleTemplate,
      teamLabels,
      selectedShiftTypes,
      formData.shift_schedule_details,
      shiftDuration,
    ],
  );

  const weeklyHoursError = formatCandidateWeeklyHoursViolations(
    weeklyHoursViolations,
  );

  const shiftDetails = useMemo(
    () => formData.shift_schedule_details ?? {},
    [formData.shift_schedule_details],
  );
  const candidatesPerTeam = getCandidatesPerTeam(
    selectedShiftTypes,
    shiftDetails,
  );
  const candidateShiftBreakdown = formatShiftCandidateBreakdown(
    selectedShiftTypes,
    shiftDetails,
  );
  const candidatesRequired = calculateTotalCandidatesRequired(
    selectedShiftTypes,
    shiftDetails,
    teamCount,
  );

  const cycleStartDay: CycleStartDay =
    formData.cycle_start_day ?? DEFAULT_CYCLE_START_DAY;
  const templateDayColumns = useMemo(
    () => buildTemplateDayColumns(cycleStartDay, formData.start_date),
    [cycleStartDay, formData.start_date],
  );
  const firstDatedTemplateColumn =
    getFirstTemplateColumnWithDate(templateDayColumns);
  const lastDatedTemplateColumn =
    getLastTemplateColumnWithDate(templateDayColumns);
  const templateFirstDate = firstDatedTemplateColumn?.dateLabel;
  const templateLastDate = lastDatedTemplateColumn?.dateLabel;

  const getExistingShiftTimes = useCallback(
    (): ShiftTimesState => ({
      morning_shift_start: formData.morning_shift_start,
      morning_shift_end: formData.morning_shift_end,
      evening_shift_start: formData.evening_shift_start,
      evening_shift_end: formData.evening_shift_end,
      night_shift_start: formData.night_shift_start,
      night_shift_end: formData.night_shift_end,
    }),
    [
      formData.morning_shift_start,
      formData.morning_shift_end,
      formData.evening_shift_start,
      formData.evening_shift_end,
      formData.night_shift_start,
      formData.night_shift_end,
    ],
  );

  const buildShiftTimesRecalcPatch = (
    duration: ShiftDurationType,
    selected: ShiftType[] = selectedShiftTypes,
    durationPerDay: "24" | "12" | "8" = jobDurationPerDay,
    includeHandoff: boolean = includeShiftHandoff,
  ): Partial<JobFormData> =>
    rebuildShiftTimeChain({
      selectedShifts: selected,
      shiftDuration: duration,
      jobDurationPerDay: durationPerDay,
      existing: getExistingShiftTimes(),
      includeHandoff,
    });

  useEffect(() => {
    const nextHires = String(candidatesRequired || 0);
    if (formData.no_of_hires_required !== nextHires) {
      updateFormData({ no_of_hires_required: nextHires });
    }
  }, [
    candidatesRequired,
    formData.no_of_hires_required,
    updateFormData,
    teamCount,
    candidatesPerTeam,
  ]);

  useEffect(() => {
    const minTeams = getMinTeams(staffingType);
    const nextCount = String(
      clampTeamCount(Number(formData.number_of_teams) || minTeams, staffingType),
    );
    if (formData.number_of_teams !== nextCount) {
      updateFormData({ number_of_teams: nextCount });
    }
  }, [staffingType, formData.number_of_teams, updateFormData]);

  useEffect(() => {
    const normalized = normalizeScheduleTemplate(
      formData.schedule_template,
      teamLabels,
    );
    const current = formData.schedule_template ?? [];
    const changed =
      normalized.length !== current.length ||
      normalized.some((v, i) => v !== (current[i] ?? ""));
    if (changed) {
      updateFormData({ schedule_template: normalized });
    }
  }, [teamLabels, formData.schedule_template, updateFormData]);

  useEffect(() => {
    const defaultShiftDuration =
      getDefaultShiftDurationForJobDay(jobDurationPerDay);
    const effectiveShiftDuration = defaultShiftDuration ?? shiftDuration;
    const trimmed = resolveSelectedShifts(
      selectedShiftTypes,
      jobDurationPerDay,
      effectiveShiftDuration,
    );

    const shiftsChanged =
      trimmed.length !== selectedShiftTypes.length ||
      trimmed.some((s, i) => s !== selectedShiftTypes[i]);
    const shiftDurationChanged =
      defaultShiftDuration !== null && shiftDuration !== defaultShiftDuration;

    if (!shiftsChanged && !shiftDurationChanged) return;

    updateFormData({
      ...(shiftDurationChanged
        ? { shift_duration_type: defaultShiftDuration }
        : {}),
      ...(shiftsChanged ? { selected_shift_types: trimmed } : {}),
      shift_schedule_details: normalizeShiftScheduleBreaks(
        trimmed,
        shiftDetails,
        effectiveShiftDuration,
      ),
      ...rebuildShiftTimeChain({
        selectedShifts: trimmed,
        shiftDuration: effectiveShiftDuration,
        jobDurationPerDay,
        existing: getExistingShiftTimes(),
        includeHandoff: includeShiftHandoff,
      }),
    });
  }, [
    jobDurationPerDay,
    shiftDuration,
    selectedShiftTypes,
    shiftDetails,
    updateFormData,
    getExistingShiftTimes,
    includeShiftHandoff,
  ]);

  useEffect(() => {
    setBreakDurationDrafts({});
  }, [shiftDuration, selectedShiftTypes]);

  useEffect(() => {
    if (!selectedShiftTypes.length) return;
    const normalized = normalizeShiftScheduleBreaks(
      selectedShiftTypes,
      shiftDetails,
      shiftDuration,
    );
    const changed = selectedShiftTypes.some((shift) => {
      const prev = shiftDetails[shift];
      const next = normalized[shift];
      return (
        prev?.break_duration_minutes !== next?.break_duration_minutes ||
        prev?.no_of_candidates !== next?.no_of_candidates
      );
    });
    if (changed) {
      updateFormData({ shift_schedule_details: normalized });
    }
  }, [
    selectedShiftTypes,
    shiftDuration,
    shiftDetails,
    updateFormData,
  ]);

  const syncScheduling = (updates: Partial<JobFormData>) => {
    updateFormData(updates);
  };

  const handleJobDurationChange = (value: "24" | "12" | "8") => {
    const nextShiftDuration =
      getDefaultShiftDurationForJobDay(value) ?? shiftDuration;
    const trimmed = resolveSelectedShifts(
      selectedShiftTypes,
      value,
      nextShiftDuration,
    );
    syncScheduling({
      job_duration_per_day: value,
      shift_duration_type: nextShiftDuration,
      selected_shift_types: trimmed,
      shift_schedule_details: normalizeShiftScheduleBreaks(
        trimmed,
        shiftDetails,
        nextShiftDuration,
      ),
      ...buildShiftTimesRecalcPatch(nextShiftDuration, trimmed, value),
    });
  };

  const handleShiftHandoffChange = (enabled: boolean) => {
    syncScheduling({
      include_shift_handoff: enabled,
      ...buildShiftTimesRecalcPatch(
        shiftDuration,
        selectedShiftTypes,
        jobDurationPerDay,
        enabled,
      ),
    });
  };

  const handleShiftDurationChange = (value: ShiftDurationType) => {
    const trimmed = resolveSelectedShifts(
      selectedShiftTypes,
      jobDurationPerDay,
      value,
    );
    syncScheduling({
      shift_duration_type: value,
      selected_shift_types: trimmed,
      shift_schedule_details: normalizeShiftScheduleBreaks(
        trimmed,
        shiftDetails,
        value,
      ),
      ...buildShiftTimesRecalcPatch(value, trimmed),
    });
  };

  const toggleShiftType = (value: ShiftType) => {
    if (isAutoShiftSelection) return;

    const current = selectedShiftTypes ?? [];

    if (!multipleShiftsAllowed) {
      const next = [value];
      syncScheduling({
        selected_shift_types: next,
        shift_schedule_details: normalizeShiftScheduleBreaks(
          next,
          shiftDetails,
          shiftDuration,
        ),
        ...buildShiftTimesRecalcPatch(shiftDuration, next),
      });
      return;
    }

    if (current.includes(value)) {
      const next = current.filter((t) => t !== value);
      const cleared: ShiftTimesState = {};
      clearShiftTimesInState(value, cleared);
      syncScheduling({
        selected_shift_types: next.length ? next : [value],
        ...cleared,
        ...(next.length > 1
          ? buildShiftTimesRecalcPatch(shiftDuration, next)
          : {}),
      });
      return;
    }

    if (!usesFifoShifts && current.length >= maxSelectableShifts) return;

    const fifoResult = usesFifoShifts
      ? applyFifoShiftAdd(current, value, maxSelectableShifts)
      : { next: [...current, value] as ShiftType[] };
    const next = fifoResult.next;
    const cleared: ShiftTimesState = {};
    if (fifoResult.removed) {
      clearShiftTimesInState(fifoResult.removed, cleared);
    }

    syncScheduling({
      selected_shift_types: next,
      ...cleared,
      shift_schedule_details: normalizeShiftScheduleBreaks(
        next,
        {
          ...shiftDetails,
          [value]: {
            ...shiftDetails[value],
            break_duration_minutes:
              shiftDetails[value]?.break_duration_minutes ??
              getDefaultBreakDurationMinutes(shiftDuration),
            no_of_candidates:
              shiftDetails[value]?.no_of_candidates ??
              getDefaultShiftCandidateCount(),
          },
        },
        shiftDuration,
      ),
      ...buildShiftTimesRecalcPatch(shiftDuration, next),
    });
  };

  const updateShiftDetail = (
    shift: ShiftType,
    patch: Partial<ShiftScheduleDetail>,
  ) => {
    syncScheduling({
      shift_schedule_details: {
        ...shiftDetails,
        [shift]: { ...shiftDetails[shift], ...patch },
      },
    });
  };

  const setTemplateDayTeam = (dayIndex: number, team: string) => {
    const next = [...scheduleTemplate];
    next[dayIndex] = team;
    syncScheduling({ schedule_template: next });
  };

  const toggleTemplateDayTeam = (dayIndex: number, team: string) => {
    setTemplateDayTeam(
      dayIndex,
      scheduleTemplate[dayIndex] === team ? "" : team,
    );
  };

  const cycleStartLabel = getCycleStartDayLabel(cycleStartDay);
  const templateDateRangeNote =
    templateFirstDate &&
    templateLastDate &&
    firstDatedTemplateColumn &&
    lastDatedTemplateColumn
      ? `Dates: Day ${firstDatedTemplateColumn.dayNumber} (${templateFirstDate}) – Day ${lastDatedTemplateColumn.dayNumber} (${templateLastDate}). `
      : "";
  const weeklyHoursLimitNote = `Max ${MAX_CANDIDATE_WEEKLY_WORKING_HOURS} net hrs/week per candidate (shift length − break).`;
  const scheduleTemplateNote = isRotational
    ? `${templateDateRangeNote}${candidatesPerTeam} candidate${candidatesPerTeam === 1 ? "" : "s"}/team on assigned days. ${weeklyHoursLimitNote}`
    : `${templateDateRangeNote}One team per day; click again to clear. ${weeklyHoursLimitNote}`;

  const formatDate = (value?: Date | string) => {
    if (!value) return "";
    const dateObj = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(dateObj.getTime())) return "";
    return dateObj.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  const openDatePicker = (mode: DateEditMode) => {
    setDateEditMode(mode);
    setShowCalendar(true);
  };

  const handleCalendarChange = (from?: Date, till?: Date) => {
    updateFormData({
      start_date: from,
      end_date: till,
      ...(till ? { job_period_option: "custom_end_date" as const } : {}),
    });
  };

  const handleCalendarApply = () => {
    setShowCalendar(false);
  };

  const calendarMinDate = (() => {
    if (dateEditMode === "end" && formData.start_date) {
      const start = new Date(formData.start_date);
      if (!Number.isNaN(start.getTime())) {
        return start > today ? start : today;
      }
    }
    return today;
  })();

  const getShiftStart = (key: ShiftKey): string => {
    if (key === "morning") return formData.morning_shift_start || "";
    if (key === "evening") return formData.evening_shift_start || "";
    return formData.night_shift_start || "";
  };

  const getShiftEnd = (key: ShiftKey): string => {
    if (key === "morning") return formData.morning_shift_end || "";
    if (key === "evening") return formData.evening_shift_end || "";
    return formData.night_shift_end || "";
  };

  const applyShiftTime = (key: ShiftKey, part: TimePart, time: string) => {
    const shiftType = key as ShiftType;

    if (
      part === "start" &&
      !isShiftStartTimeEditable({
        jobDurationPerDay,
        selectedShifts: selectedShiftTypes,
        shift: shiftType,
      })
    ) {
      return;
    }

    if (part === "end" && !isShiftEndTimeEditable()) {
      return;
    }

    if (part === "end") {
      const timesPatch = shouldChainShiftTimes(
        jobDurationPerDay,
        selectedShiftTypes,
      )
        ? buildChainedShiftTimesFromEnd({
            selectedShifts: selectedShiftTypes,
            shiftDuration,
            anchorShift: shiftType,
            anchorEndTime: time,
            overlapMinutes: handoffOverlapMinutes,
          })
        : buildSingleShiftTimesFromEnd(
            shiftType,
            time,
            shiftDuration,
            handoffOverlapMinutes,
          );

      updateFormData(timesPatch);
      return;
    }

    const timesPatch = shouldChainShiftTimes(
      jobDurationPerDay,
      selectedShiftTypes,
    )
      ? buildChainedShiftTimes({
          selectedShifts: selectedShiftTypes,
          shiftDuration,
          anchorShift:
            getChainedShiftAnchor(selectedShiftTypes) ?? shiftType,
          anchorStartTime: time,
          overlapMinutes: handoffOverlapMinutes,
        })
      : buildSingleShiftTimes(
          shiftType,
          time,
          shiftDuration,
          handoffOverlapMinutes,
        );

    updateFormData(timesPatch);
  };

  const to12 = (time: string) => {
    const [h, m] = time.split(":").map((v) => parseInt(v, 10));
    if (!Number.isFinite(h) || !Number.isFinite(m)) return time;
    let hours = h;
    const minutes = m;
    const period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0",
    )} ${period}`;
  };

  const formatTimeDisplay = (time: string) =>
    time ? to12(time) : "Select time";

  const openTimePickerForShift = (key: ShiftKey, part: TimePart) => {
    const shiftType = key as ShiftType;
    if (
      part === "start" &&
      !isShiftStartTimeEditable({
        jobDurationPerDay,
        selectedShifts: selectedShiftTypes,
        shift: shiftType,
      })
    ) {
      return;
    }
    if (part === "end" && !isShiftEndTimeEditable()) {
      return;
    }
    setActiveShiftForTime(key);
    setActiveTimePart(part);
  };

  const shiftRowGridClass =
    "grid min-w-[720px] grid-cols-[minmax(88px,0.9fr)_minmax(130px,1.1fr)_minmax(130px,1.1fr)_minmax(120px,1fr)_minmax(100px,0.9fr)] items-start gap-3";

  const shiftAtMax =
    multipleShiftsAllowed &&
    selectedShiftTypes.length >= maxSelectableShifts;

  const breakBounds = getBreakDurationBounds(shiftDuration);

  const isChainedMultiShift = shouldChainShiftTimes(
    jobDurationPerDay,
    selectedShiftTypes,
  );

  const shiftTimingDisplays = useMemo(
    () =>
      buildShiftTimingDisplays({
        selectedShifts: selectedShiftTypes,
        times: {
          morning_shift_start: formData.morning_shift_start,
          morning_shift_end: formData.morning_shift_end,
          evening_shift_start: formData.evening_shift_start,
          evening_shift_end: formData.evening_shift_end,
          night_shift_start: formData.night_shift_start,
          night_shift_end: formData.night_shift_end,
        },
        chainShifts: isChainedMultiShift,
      }),
    [
      selectedShiftTypes,
      isChainedMultiShift,
      formData.morning_shift_start,
      formData.morning_shift_end,
      formData.evening_shift_start,
      formData.evening_shift_end,
      formData.night_shift_start,
      formData.night_shift_end,
    ],
  );

  const shiftTableRows = useMemo(() => {
    const ordered = sortShiftsInDayOrder(selectedShiftTypes);
    const timingByShift = new Map(
      shiftTimingDisplays.map((timing) => [timing.shift, timing]),
    );

    return ordered.map((shift) => {
      const timing = timingByShift.get(shift);
      const key = shift as ShiftKey;
      const startTime =
        key === "morning"
          ? formData.morning_shift_start || ""
          : key === "evening"
            ? formData.evening_shift_start || ""
            : formData.night_shift_start || "";

      const inferred = startTime
        ? inferFormShiftTypeFromStartTime(startTime)
        : null;
      const inferredLabel = inferred
        ? (SHIFT_TYPES.find((opt) => opt.value === inferred)?.label ?? inferred)
        : null;

      return {
        shift,
        shiftLabel:
          timing?.label ??
          inferredLabel ??
          SHIFT_TYPES.find((opt) => opt.value === shift)?.label ??
          shift,
        startDayOffset: timing?.startDayOffset ?? 0,
        endDayOffset: timing?.endDayOffset ?? 0,
      };
    });
  }, [
    selectedShiftTypes,
    shiftTimingDisplays,
    formData.morning_shift_start,
    formData.evening_shift_start,
    formData.night_shift_start,
  ]);

  const jobDurationHint =
    jobDurationPerDay === "24"
      ? "Use multiple shifts for full-day coverage."
      : null;

  const shiftDurationHint =
    lockedShiftDuration !== null
      ? null
      : "8 hr → 3 shifts, or 12 hr → 2 shifts.";

  const shiftTypeHint = isAutoShiftSelection
    ? "Selected automatically for 24 hr coverage."
    : usesFifoShifts
      ? "Pick 2 shifts; a third replaces the earliest."
      : multipleShiftsAllowed
        ? `Select up to ${maxSelectableShifts}.`
        : null;

  const facilityTimezoneHint = formatFacilityTimezoneHint(formData.province);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <JobFormField label="Job Start Date" required>
          <button
            type="button"
            onClick={() => openDatePicker("start")}
            className="flex h-11 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-600"
          >
            <span>{formatDate(formData.start_date) || "MM/DD/YYYY"}</span>
            <CalendarIcon className="h-4 w-4 text-gray-400" />
          </button>
        </JobFormField>

        <JobFormField label="Job End Date" required>
          <button
            type="button"
            onClick={() => {
              if (!formData.start_date) {
                openDatePicker("start");
                return;
              }
              openDatePicker("end");
            }}
            className="flex h-11 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-600"
          >
            <span>{formatDate(formData.end_date) || "MM/DD/YYYY"}</span>
            <CalendarIcon className="h-4 w-4 text-gray-400" />
          </button>
          {!formData.start_date && (
            <p className="mt-1.5 text-xs text-gray-400">
              Select a start date first.
            </p>
          )}
        </JobFormField>

        {facilityTimezoneHint && (
          <p className="lg:col-span-2 -mt-2 text-xs text-gray-400">
            {facilityTimezoneHint}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <JobFormSelect
            id="cycle-start-day"
            label="Cycle Start Day"
            value={cycleStartDay}
            onValueChange={(value) =>
              syncScheduling({ cycle_start_day: value as CycleStartDay })
            }
            options={CYCLE_START_DAY_OPTIONS.map((opt) => ({
              value: opt.value,
              label: opt.label,
            }))}
            required
          />
          <p className="mt-1.5 text-xs text-gray-400">
            {templateFirstDate && firstDatedTemplateColumn ? (
              <>
                Day 1 = {cycleStartLabel}. Job starts on Day{" "}
                {firstDatedTemplateColumn.dayNumber} ({templateFirstDate}).
              </>
            ) : (
              <>Day 1 = {cycleStartLabel}. Dates appear after you pick a start date.</>
            )}
          </p>
        </div>

        <JobFormField label="How Many Teams" required>
          <Input
            id="number-of-teams"
            type="number"
            min={getMinTeams(staffingType)}
            max={26}
            disabled={isStandard}
            value={formData.number_of_teams ?? String(teamCount)}
            onChange={(e) =>
              syncScheduling({
                number_of_teams: e.target.value,
              })
            }
            className="h-11"
          />
          <p className="mt-1.5 text-xs text-gray-400">
            {isStandard
              ? "Standard staffing uses 1 team."
              : "Minimum 2 teams for rotational staffing."}
          </p>
        </JobFormField>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <JobFormField label="Job Duration per Day" required>
          <RadioGroup
            value={jobDurationPerDay}
            onValueChange={(value) =>
              handleJobDurationChange(value as "24" | "12" | "8")
            }
            className="flex flex-wrap gap-4 pt-1"
          >
            {[
              { label: "24 hrs", value: "24" as const },
              { label: "12 hrs", value: "12" as const },
              { label: "8 hrs", value: "8" as const },
            ].map((opt) => (
              <div key={opt.value} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={opt.value}
                  id={`job-duration-${opt.value}`}
                  className={RADIO_ITEM_CLASS}
                />
                <Label
                  htmlFor={`job-duration-${opt.value}`}
                  className="cursor-pointer text-sm font-normal text-gray-700"
                >
                  {opt.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
          <SchedulingFieldHint message={jobDurationHint} />
        </JobFormField>

        <JobFormField label="Each Shift Duration" required>
          <RadioGroup
            value={shiftDuration}
            onValueChange={(value) =>
              handleShiftDurationChange(value as ShiftDurationType)
            }
            className="flex flex-wrap gap-4 pt-1"
          >
            {[
              { label: "8 hrs Shift", value: "8_hrs" as ShiftDurationType },
              { label: "12 hrs Shift", value: "12_hrs" as ShiftDurationType },
            ].map((opt) => (
              <div key={opt.value} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={opt.value}
                  id={`shift-duration-${opt.value}`}
                  disabled={
                    lockedShiftDuration !== null &&
                    opt.value !== lockedShiftDuration
                  }
                  className={RADIO_ITEM_CLASS}
                />
                <Label
                  htmlFor={`shift-duration-${opt.value}`}
                  className="cursor-pointer text-sm font-normal text-gray-700"
                >
                  {opt.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
          <SchedulingFieldHint message={shiftDurationHint} />
        </JobFormField>

        <JobFormField label="Select Shift Type" required>
          <div className="flex flex-wrap items-center gap-5 pt-1">
            {SHIFT_TYPES.map((opt) => {
              const selected = selectedShiftTypes.includes(opt.value);
              const disabled =
                isAutoShiftSelection ||
                (multipleShiftsAllowed &&
                  !usesFifoShifts &&
                  !selected &&
                  shiftAtMax);
              return (
                <button
                  key={opt.value}
                  type="button"
                  disabled={disabled}
                  onClick={() => toggleShiftType(opt.value)}
                  className={cn(
                    "flex items-center gap-2 text-sm font-normal text-gray-700",
                    disabled && "cursor-not-allowed opacity-50",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                      selected
                        ? "border-[#F4781B] bg-[#F4781B]"
                        : "border-gray-300 bg-white",
                    )}
                  >
                    {selected && <Check className="h-3 w-3 text-white" />}
                  </span>
                  {opt.label}
                </button>
              );
            })}
          </div>
          <SchedulingFieldHint message={shiftTypeHint} />
        </JobFormField>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Label className="text-sm font-medium text-gray-700">
              Shift Timings per Team
              <span className="text-red-500"> *</span>
            </Label>
            {isChainedMultiShift && (
              <p className="mt-1 text-xs text-gray-400">
                Set the first start time; later shifts fill in automatically.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => handleShiftHandoffChange(!includeShiftHandoff)}
            className={cn(
              "inline-flex items-center gap-2 self-start rounded-md border px-3 py-2 text-sm transition-colors",
              includeShiftHandoff
                ? "border-[#F4781B]/40 bg-orange-50 text-gray-800"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300",
            )}
          >
            <span
              className={cn(
                "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                includeShiftHandoff
                  ? "border-[#F4781B] bg-[#F4781B]"
                  : "border-gray-300 bg-white",
              )}
            >
              {includeShiftHandoff && <Check className="h-3 w-3 text-white" />}
            </span>
            <span>
              {SHIFT_HANDOFF_OVERLAP_MINUTES}-min handoff
              <span className="ml-1 text-xs text-gray-500">
                (+{SHIFT_HANDOFF_OVERLAP_MINUTES} on checkout)
              </span>
            </span>
          </button>
        </div>

        {isChainedMultiShift && shiftTimingDisplays.length >= 2 && (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 rounded-md border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs text-gray-600">
            {shiftTimingDisplays.map((timing, index) => (
              <span key={timing.shift} className="inline-flex items-center gap-2">
                {index > 0 && (
                  <span className="text-gray-300" aria-hidden="true">
                    →
                  </span>
                )}
                <span>
                  <span className="font-medium text-gray-800">
                    {timing.label}
                  </span>{" "}
                  {formatTimeDisplay(timing.startTime)}–
                  {formatTimeDisplay(timing.endTime)}
                </span>
              </span>
            ))}
          </div>
        )}

        <div className="overflow-x-auto">
          {selectedShiftTypes.length > 0 && (
            <div className="space-y-3">
              <div
                className={cn(
                  shiftRowGridClass,
                  "border-b border-gray-100 pb-2 text-xs font-medium text-gray-500",
                )}
              >
                <span>Shift</span>
                <span>Start</span>
                <span>End</span>
                <span>Break ({breakBounds.min}–{breakBounds.max} min)</span>
                <span>Candidates</span>
              </div>

              {shiftTableRows.map((row) => {
                  const key = row.shift as ShiftKey;
                  const shiftType = row.shift;
                  const shiftLabel = row.shiftLabel;
                  const detail = shiftDetails[shiftType] ?? {};
                  const breakValue =
                    breakDurationDrafts[shiftType] ??
                    (detail.break_duration_minutes !== undefined
                      ? String(detail.break_duration_minutes)
                      : "");
                  const canEditStart = isShiftStartTimeEditable({
                    jobDurationPerDay,
                    selectedShifts: selectedShiftTypes,
                    shift: shiftType,
                  });
                  const canEditEnd = isShiftEndTimeEditable();
                  const startTime = getShiftStart(key);
                  const endTime = getShiftEnd(key);

                  return (
                    <div key={key} className={shiftRowGridClass}>
                      <span className="pt-2.5 text-sm font-medium text-gray-700">
                        {shiftLabel}
                      </span>

                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          disabled={!canEditStart}
                          onClick={() => openTimePickerForShift(key, "start")}
                          className={cn(
                            "flex h-11 items-center justify-between rounded-md border px-3 text-sm",
                            canEditStart
                              ? "border-gray-300 bg-white text-gray-700"
                              : "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-500",
                          )}
                        >
                          <span className="truncate">
                            {formatTimeDisplay(startTime)}
                          </span>
                          <Clock
                            className={cn(
                              "ml-2 h-4 w-4 shrink-0",
                              canEditStart ? "text-gray-400" : "text-gray-300",
                            )}
                          />
                        </button>
                        {startTime ? (
                          <span className="px-1 text-[10px] leading-tight text-gray-400">
                            {formatShiftDayLabel(
                              formData.start_date,
                              row.startDayOffset,
                            )}
                          </span>
                        ) : null}
                      </div>

                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          disabled={!canEditEnd}
                          onClick={() => openTimePickerForShift(key, "end")}
                          className={cn(
                            "flex h-11 items-center justify-between rounded-md border px-3 text-sm",
                            canEditEnd
                              ? "border-gray-300 bg-white text-gray-700"
                              : "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-500",
                          )}
                        >
                          <span className="truncate">
                            {formatTimeDisplay(endTime)}
                          </span>
                          <Clock
                            className={cn(
                              "ml-2 h-4 w-4 shrink-0",
                              canEditEnd ? "text-gray-400" : "text-gray-300",
                            )}
                          />
                        </button>
                        {endTime ? (
                          <span className="px-1 text-[10px] leading-tight text-gray-400">
                            {formatShiftDayLabel(
                              formData.start_date,
                              row.endDayOffset,
                            )}
                            {row.endDayOffset !== row.startDayOffset
                              ? " (next day)"
                              : ""}
                          </span>
                        ) : null}
                      </div>

                      <Input
                        className="h-11"
                        type="number"
                        min={breakBounds.min}
                        max={breakBounds.max}
                        step={1}
                        value={breakValue}
                        onChange={(e) => {
                          setBreakDurationDrafts((prev) => ({
                            ...prev,
                            [shiftType]: e.target.value,
                          }));
                        }}
                        onBlur={() => {
                          const raw = breakDurationDrafts[shiftType];
                          setBreakDurationDrafts((prev) => {
                            const next = { ...prev };
                            delete next[shiftType];
                            return next;
                          });

                          if (raw === undefined) {
                            const current =
                              shiftDetails[shiftType]?.break_duration_minutes;
                            if (current === undefined) {
                              updateShiftDetail(shiftType, {
                                break_duration_minutes:
                                  getDefaultBreakDurationMinutes(shiftDuration),
                              });
                              return;
                            }
                            const clamped = clampBreakDurationMinutes(
                              current,
                              shiftDuration,
                            );
                            if (clamped !== current) {
                              updateShiftDetail(shiftType, {
                                break_duration_minutes: clamped,
                              });
                            }
                            return;
                          }

                          if (!raw.trim()) {
                            updateShiftDetail(shiftType, {
                              break_duration_minutes:
                                getDefaultBreakDurationMinutes(shiftDuration),
                            });
                            return;
                          }

                          const num = Number(raw);
                          updateShiftDetail(shiftType, {
                            break_duration_minutes: Number.isFinite(num)
                              ? clampBreakDurationMinutes(num, shiftDuration)
                              : getDefaultBreakDurationMinutes(shiftDuration),
                          });
                        }}
                        placeholder={String(breakBounds.default)}
                      />

                      <Input
                        className="h-11"
                        type="number"
                        min={1}
                        value={
                          detail.no_of_candidates !== undefined
                            ? detail.no_of_candidates
                            : getDefaultShiftCandidateCount()
                        }
                        onChange={(e) => {
                          const raw = e.target.value;
                          if (!raw) {
                            updateShiftDetail(shiftType, {
                              no_of_candidates: undefined,
                            });
                            return;
                          }
                          const num = Number(raw);
                          if (!Number.isFinite(num)) return;
                          updateShiftDetail(shiftType, {
                            no_of_candidates: clampShiftCandidateCount(num),
                          });
                        }}
                        onBlur={() => {
                          const current =
                            shiftDetails[shiftType]?.no_of_candidates;
                          if (
                            current === undefined ||
                            current < getDefaultShiftCandidateCount()
                          ) {
                            updateShiftDetail(shiftType, {
                              no_of_candidates:
                                getDefaultShiftCandidateCount(),
                            });
                          }
                        }}
                        placeholder="1"
                      />
                    </div>
                  );
                })}
            </div>
          )}

          {selectedShiftTypes.length === 0 && (
            <p className="text-xs text-gray-400">
              Select a shift type to set timings.
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ReadOnlyMetric
          label="Candidates Required"
          hint={`${candidateShiftBreakdown}/shift · ${candidatesPerTeam}/team · ${teamCount} team${teamCount === 1 ? "" : "s"}`}
          value={candidatesRequired.toString().padStart(2, "0")}
          required
        />

        <ReadOnlyMetric
          label="Fixed Hourly Pay per Hire"
          hint={
            formData.backend_pay_rate != null
              ? "Platform suggested rate"
              : "Set by platform"
          }
          value={
            formData.backend_pay_rate != null
              ? `$${formData.backend_pay_rate}/hr`
              : "—"
          }
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full min-w-[720px] border-collapse text-xs">
          <thead>
            <tr className="border-b border-gray-200 text-gray-700">
              <th className="border-r border-gray-200 px-4 py-3 text-left text-sm font-semibold">
                {isRotational ? "Rotational Template" : "Standard Template"}
              </th>
              {templateDayColumns.map((column) => (
                <th
                  key={column.dayIndex}
                  className="border-r border-gray-200 px-1 py-2 text-center font-medium last:border-r-0"
                >
                  <span className="block text-xs leading-tight">
                    {column.label}
                  </span>
                  <span className="mt-0.5 block text-[10px] font-normal text-gray-500">
                    {column.weekdayShort}
                  </span>
                  {column.dateLabel ? (
                    <span className="mt-0.5 block text-[10px] font-semibold text-gray-700">
                      {column.dateLabel}
                    </span>
                  ) : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {teamLabels.map((team, teamIndex) => (
              <tr
                key={team}
                className={cn(
                  "border-b border-gray-200",
                  teamIndex === teamLabels.length - 1 && "border-b-0",
                )}
              >
                <td className="border-r border-gray-200 px-4 py-3 text-sm font-semibold text-gray-900">
                  {team}
                </td>
                {scheduleTemplate.map((assigned, dayIndex) => (
                  <td
                    key={`${team}-day-${dayIndex}`}
                    className="border-r border-gray-200 px-1 py-2 text-center last:border-r-0"
                  >
                    <ScheduleTemplateDayToggle
                      selected={assigned === team}
                      onClick={() => toggleTemplateDayTeam(dayIndex, team)}
                      ariaLabel={`Assign ${team} to ${templateDayColumns[dayIndex]?.label}${templateDayColumns[dayIndex]?.dateLabel ? `, ${templateDayColumns[dayIndex]?.dateLabel}` : ""} (${templateDayColumns[dayIndex]?.weekdayShort})`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="border-t border-gray-200 px-4 py-3 text-xs italic text-gray-400">
          {scheduleTemplateNote}
        </p>
        {weeklyHoursError ? (
          <p
            className="border-t border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700"
            role="alert"
          >
            {weeklyHoursError}
          </p>
        ) : null}
      </div>

      {showCalendar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <DateRangePicker
            fromDate={
              formData.start_date
                ? new Date(formData.start_date)
                : undefined
            }
            tillDate={
              formData.end_date ? new Date(formData.end_date) : undefined
            }
            minDate={calendarMinDate}
            editMode={dateEditMode}
            onChange={handleCalendarChange}
            onCancel={() => setShowCalendar(false)}
            onApply={handleCalendarApply}
          />
        </div>
      )}

      {activeShiftForTime && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <CustomTimePicker
            label={
              activeTimePart === "start"
                ? "Select Start Time"
                : "Select End Time"
            }
            selectedTime={
              activeTimePart === "start"
                ? getShiftStart(activeShiftForTime)
                : getShiftEnd(activeShiftForTime)
            }
            onSelect={(time) => {
              if (activeShiftForTime) {
                applyShiftTime(activeShiftForTime, activeTimePart, time);
              }
            }}
            onCancel={() => setActiveShiftForTime(null)}
            onSelectTime={() => setActiveShiftForTime(null)}
          />
        </div>
      )}
    </div>
  );
}
