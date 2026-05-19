"use client";

import { useState } from "react";
import { CalendarIcon, Clock } from "lucide-react";
import type {
  EmploymentType,
  JobFormData,
  JobPeriodOption,
  ShiftDurationType,
  ShiftType,
  StaffingType,
} from "@/types";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { JobFormField } from "../components/form-field";
import { DateRangePicker } from "../components/date-picker";
import { CustomTimePicker } from "../components/time-picker";

interface NormalSchedulingStepProps {
  formData: JobFormData;
  updateFormData: (updates: Partial<JobFormData>) => void;
}

const TEMPORARY_PERIODS: { label: string; value: JobPeriodOption }[] = [
  { label: "3 months", value: "3_months" },
  { label: "6 months", value: "6_months" },
  { label: "9 months", value: "9_months" },
  { label: "Custom End Date", value: "custom_end_date" },
];

const PERMANENT_PERIODS: { label: string; value: JobPeriodOption }[] = [
  { label: "1 year", value: "1_year" },
  { label: "2 years", value: "2_years" },
  { label: "3 years", value: "3_years" },
  { label: "Custom End Date", value: "custom_end_date" },
];

const SHIFT_TYPES: { label: string; value: ShiftType }[] = [
  { label: "Morning", value: "morning" },
  { label: "Evening", value: "evening" },
  { label: "Night", value: "night" },
];

type ShiftKey = "morning" | "evening" | "night";
type TimePart = "start" | "end";

export function NormalSchedulingStep({
  formData,
  updateFormData,
}: NormalSchedulingStepProps) {
  const employmentType: EmploymentType =
    (formData.employment_type as EmploymentType) ?? "temporary";
  const staffingType: StaffingType =
    (formData.staffing_type as StaffingType) ?? "standard";
  const shiftDuration: ShiftDurationType =
    (formData.shift_duration_type as ShiftDurationType) ?? "8_hrs";

  const selectedShiftTypes: ShiftType[] =
    (formData.selected_shift_types as ShiftType[]) ?? [];

  const [showCalendar, setShowCalendar] = useState(false);
  const [activeShiftForTime, setActiveShiftForTime] = useState<ShiftKey | null>(
    null,
  );
  const [activeTimePart, setActiveTimePart] = useState<TimePart>("start");
  const today = new Date();

  const periodOptions =
    employmentType === "permanent" ? PERMANENT_PERIODS : TEMPORARY_PERIODS;

  const jobPeriodOption: JobPeriodOption =
    (formData.job_period_option as JobPeriodOption) ??
    periodOptions[0]?.value;

  const isRotational = staffingType === "rotational";
  const isStandard = staffingType === "standard";

  const jobDurationPerDay = formData.job_duration_per_day ?? "8";

  const numberOfTeams = (() => {
    if (!isRotational) return 1;
    if (shiftDuration === "8_hrs") return 2;
    return 3;
  })();

  const days = Array.from({ length: 14 }, (_, i) => `Day ${i + 1}`);
  const teamLabels = (() => {
    if (!isRotational) return ["Team A"];
    if (shiftDuration === "8_hrs") return ["Team A", "Team B"];
    return ["Team A", "Team B", "Team C"];
  })();

  const candidatesRequired =
    Number(formData.no_of_hires_required || "1") || 1;

  const handleJobDurationChange = (value: "24" | "12" | "8") => {
    updateFormData({ job_duration_per_day: value });
  };

  const toggleShiftType = (value: ShiftType) => {
    if (isStandard) {
      // radio behaviour: exactly one
      updateFormData({ selected_shift_types: [value] });
      return;
    }

    // rotational: checkbox behaviour
    const current = selectedShiftTypes ?? [];
    if (current.includes(value)) {
      const next = current.filter((t) => t !== value);
      updateFormData({ selected_shift_types: next.length ? next : [value] });
    } else {
      updateFormData({ selected_shift_types: [...current, value] });
    }
  };

  const handleJobPeriodChange = (value: JobPeriodOption) => {
    updateFormData({ job_period_option: value });
  };

  const formatStartDate = () => {
    const value = formData.start_date;
    if (!value) return "MM/DD/YYYY";

    let dateObj: Date;
    if (value instanceof Date) {
      dateObj = value;
    } else {
      dateObj = new Date(value as any);
    }

    if (Number.isNaN(dateObj.getTime())) return "MM/DD/YYYY";

    return dateObj.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  // Time helpers

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

  const setShiftStart = (key: ShiftKey, time: string) => {
    if (key === "morning") {
      updateFormData({ morning_shift_start: time });
    } else if (key === "evening") {
      updateFormData({ evening_shift_start: time });
    } else {
      updateFormData({ night_shift_start: time });
    }
  };

  const setShiftEnd = (key: ShiftKey, time: string) => {
    if (key === "morning") {
      updateFormData({ morning_shift_end: time });
    } else if (key === "evening") {
      updateFormData({ evening_shift_end: time });
    } else {
      updateFormData({ night_shift_end: time });
    }
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

  const getShiftDisplay = (key: ShiftKey): string => {
    const start = getShiftStart(key);
    const end = getShiftEnd(key);
    if (!start || !end) return "Select time";
    return `${to12(start)} - ${to12(end)}`;
  };

  const openTimePickerForShift = (key: ShiftKey) => {
    setActiveShiftForTime(key);
    const hasStart = !!getShiftStart(key);
    const hasEnd = !!getShiftEnd(key);
    if (!hasStart) setActiveTimePart("start");
    else if (!hasEnd) setActiveTimePart("end");
    else setActiveTimePart("start");
  };

  // Simple grid behaviour: Team B fills Team A gaps
  const isTeamADayActive = (dayIndex: number) => dayIndex % 2 === 0;
  const isTeamBDayActive = (dayIndex: number) => !isTeamADayActive(dayIndex);

  return (
    <div className="space-y-6">
      {/* Job Start Date + Job Period */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <JobFormField label="Job Start Date" required>
          <button
            type="button"
            onClick={() => setShowCalendar(true)}
            className="flex h-11 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700"
          >
            <span>{formatStartDate()}</span>
            <CalendarIcon className="h-4 w-4 text-gray-400" />
          </button>
        </JobFormField>

        <JobFormField label="Job Period" required>
          <div className="flex flex-wrap gap-3 pt-1">
            {periodOptions.map((opt) => {
              const isSelected = jobPeriodOption === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleJobPeriodChange(opt.value)}
                  className={cn(
                    "flex items-center justify-center rounded-full border px-4 py-2 text-xs font-medium",
                    isSelected
                      ? "border-[#F4781B] bg-orange-50 text-[#F4781B]"
                      : "border-gray-200 bg-white text-gray-600 hover:border-[#F4781B]/60",
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </JobFormField>
      </div>

      {/* Job Duration per Day + Each Shift Duration */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <JobFormField label="Job Duration per Day" required>
          <div className="flex flex-wrap gap-3 pt-1 text-sm">
            {[
              { label: "24 hrs", value: "24" as const },
              { label: "12 hrs", value: "12" as const },
              { label: "8 hrs", value: "8" as const },
            ].map((opt) => {
              const isSelected = jobDurationPerDay === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleJobDurationChange(opt.value)}
                  className={cn(
                    "flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium",
                    isSelected
                      ? "border-[#F4781B] bg-orange-50 text-[#F4781B]"
                      : "border-gray-200 bg-white text-gray-600 hover:border-[#F4781B]/60",
                  )}
                >
                  <Clock className="h-4 w-4 text-gray-400" />
                  {opt.label}
                </button>
              );
            })}
          </div>
        </JobFormField>

        <JobFormField label="Each Shift Duration" required>
          <div className="flex flex-wrap gap-3 pt-1 text-sm">
            {[
              { label: "8 hrs Shift", value: "8_hrs" as ShiftDurationType },
              { label: "12 hrs Shift", value: "12_hrs" as ShiftDurationType },
            ].map((opt) => {
              const isSelected = shiftDuration === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    updateFormData({ shift_duration_type: opt.value })
                  }
                  className={cn(
                    "flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium",
                    isSelected
                      ? "border-[#F4781B] bg-orange-50 text-[#F4781B]"
                      : "border-gray-200 bg-white text-gray-600 hover:border-[#F4781B]/60",
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </JobFormField>
      </div>

      {/* Select Shift Type */}
      <JobFormField
        label={isStandard ? "Select Any One Shift Type" : "Select Shift Type"}
        required
      >
        <div className="flex flex-wrap gap-6 pt-1 text-sm">
          {SHIFT_TYPES.map((opt) => {
            const selected = selectedShiftTypes?.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleShiftType(opt.value)}
                className="flex items-center gap-2 text-xs font-medium"
              >
                <span
                  className={cn(
                    "flex h-4 w-4 items-center justify-center rounded-full border",
                    selected
                      ? "border-[#F4781B] bg-[#F4781B]"
                      : "border-gray-300 bg.white",
                  )}
                >
                  {selected && (
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  )}
                </span>
                <span
                  className={cn(
                    selected ? "text-[#F4781B]" : "text-gray-700",
                  )}
                >
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
      </JobFormField>

      {/* Shift Timings per Team */}
      <JobFormField label="Shift Timings per Team" required>
        <div className="space-y-3 text-sm">
          {(["morning", "evening", "night"] as ShiftKey[])
            .filter((key) =>
              selectedShiftTypes.includes(key as ShiftType),
            )
            .map((key) => {
              const label =
                key === "morning"
                  ? "Morning Shift"
                  : key === "evening"
                  ? "Evening Shift"
                  : "Night Shift";
              const display = getShiftDisplay(key);
              return (
                <div
                  key={key}
                  className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]"
                >
                  <div className="flex items-center gap-3">
                    <span className="min-w-[110px] text-gray-600">
                      {label}:
                    </span>
                    <button
                      type="button"
                      onClick={() => openTimePickerForShift(key)}
                      className="flex h-11 flex-1 items-center justify-between rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700"
                    >
                      <span>{display}</span>
                      <Clock className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="min-w-[110px] text-gray-600">
                      Break/Rest Time:
                    </span>
                    <Input
                      className="h-11 w-40"
                      placeholder="30 minutes"
                      readOnly
                    />
                  </div>
                </div>
              );
            })}

          {selectedShiftTypes.length === 0 && (
            <p className="text-xs text-gray-400">
              Select at least one shift type to configure timings.
            </p>
          )}
        </div>
      </JobFormField>

      {/* Counters row */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <JobFormField
          label={
            isRotational
              ? "Number of Rotational Teams"
              : "Number of Standard Teams"
          }
          required
        >
          <div className="flex h-12 w-20 items-center justify-center rounded-md bg-gray-100 text-lg font-semibold text-gray-900">
            {numberOfTeams.toString().padStart(2, "0")}
          </div>
          <p className="mt-1 text-xs text-gray-400">
            Auto-calculated based on shift duration.
          </p>
        </JobFormField>

        <JobFormField label="Number of Candidates Required" required>
          <div className="flex items-center gap-3">
            <Input
              id="candidates-required"
              type="number"
              value={formData.no_of_hires_required || ""}
              onChange={(e) =>
                updateFormData({ no_of_hires_required: e.target.value })
              }
              min={1}
              step={1}
              className="h-12 w-20 text-center"
            />
          </div>
          <p className="mt-1 text-xs text-gray-400">
            Each team must have at least 1 candidate.
          </p>
        </JobFormField>

        <JobFormField label="Fixed Hourly Pay per Hire">
          <div className="inline-flex h-11 items-center rounded-md bg-gray-100 px-4 text-sm font-semibold text-gray-800">
            $50/hr
          </div>
          <p className="mt-1 text-xs text-gray-400">
            Rates managed by platform.
          </p>
        </JobFormField>
      </div>

      {/* Team / Day grid */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 text-gray-600">
              <th className="px-4 py-3 text-left">
                {isRotational ? "Rotational Template" : "Standard Template"}
              </th>
              {days.map((day) => (
                <th key={day} className="px-2 py-3 text-center">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {teamLabels.map((team, teamIndex) => (
              <tr key={team} className="border-t border-gray-100">
                <td className="px-4 py-3 text-sm font-medium text-gray-700">
                  {team}
                </td>
                {days.map((_, dayIndex) => {
                  let active: boolean;
                  if (!isRotational) {
                    // simple pattern for standard
                    active = dayIndex % 2 === 0;
                  } else {
                    if (teamIndex === 0) {
                      active = isTeamADayActive(dayIndex);
                    } else if (teamIndex === 1) {
                      active = isTeamBDayActive(dayIndex);
                    } else {
                      active = isTeamADayActive(dayIndex);
                    }
                  }

                  return (
                    <td
                      key={`${team}-${dayIndex}`}
                      className="px-2 py-3 text-center"
                    >
                      {active ? (
                        <span className="inline-block h-3 w-3 rounded-full border border-[#F4781B] bg-[#F4781B]" />
                      ) : (
                        <span className="inline-block h-3 w-3 rounded-full border border-gray-300 bg-white" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="px-4 py-2 text-xs text-gray-400">
          Note: Team patterns are illustrative. You can refine distribution
          logic based on actual scheduling needs.
        </p>
      </div>

      {/* Date picker overlay */}
      {showCalendar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <DateRangePicker
            fromDate={formData.start_date}
            tillDate={formData.end_date}
            minDate={today}
            onChange={(from, till) =>
              updateFormData({ start_date: from, end_date: till })
            }
            onCancel={() => setShowCalendar(false)}
            onSchedule={() => setShowCalendar(false)}
          />
        </div>
      )}

      {/* Time picker overlay */}
      {activeShiftForTime && (
        <div className="fixed inset-0 z-50 flex items-center justify.center bg-black/50">
          <CustomTimePicker
            selectedTime={
              activeTimePart === "start"
                ? getShiftStart(activeShiftForTime)
                : getShiftEnd(activeShiftForTime)
            }
            onSelect={(time) => {
              if (activeTimePart === "start") {
                setShiftStart(activeShiftForTime, time);
              } else {
                setShiftEnd(activeShiftForTime, time);
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