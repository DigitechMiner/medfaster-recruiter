"use client";

import { Layers, Moon, Sun, Sunset, Users } from "lucide-react";
import type {
  JobListShiftTemplate,
  JobScheduleData,
  JobScheduleRotationalTeam,
  JobScheduleTeamCycle,
  JobTeamCandidateRotation,
} from "@/types";
import { cn } from "@/lib/utils";
import { EmptyState, LoadingRows } from "../shared/JobDetailDataView";
import {
  formatDateShort,
  formatLabel,
  formatTime,
} from "../shared/job-detail-helpers";
import { formatShiftTypeLabel } from "@/app/jobs/components/helper";
import { WorkScheduleVisual } from "./WorkScheduleVisual";

type SchedulePlanPanelProps = {
  schedule: JobScheduleData | null;
  isLoading: boolean;
  error: string | null;
  /** Candidate rotations are shown on the Schedule tab only. */
  showCandidateRotations?: boolean;
};

type ResolvedCycleShift = {
  id: string;
  shiftName: string;
  shiftType: string;
  time: string | null;
  compactTime: string | null;
  workers: number;
};

const SHIFT_TYPE_STYLES: Record<string, string> = {
  MORNING: "border-red-100 bg-red-50/80",
  EVENING: "border-green-100 bg-green-50/80",
  NIGHT: "border-blue-100 bg-blue-50/80",
};

const SHIFT_TYPE_ICONS: Record<
  string,
  { icon: typeof Sun; wrap: string; iconClass: string }
> = {
  MORNING: {
    icon: Sun,
    wrap: "bg-red-50 text-red-600",
    iconClass: "text-red-600",
  },
  EVENING: {
    icon: Sunset,
    wrap: "bg-green-50 text-green-600",
    iconClass: "text-green-600",
  },
  NIGHT: {
    icon: Moon,
    wrap: "bg-blue-50 text-blue-600",
    iconClass: "text-blue-600",
  },
};

const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const CYCLE_START_WEEKDAY_INDEX: Record<string, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

function formatCompactTime(value?: string | null) {
  if (!value) return null;
  const [hours, minutes] = value.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  const hour12 = hours % 12 || 12;
  const suffix = hours >= 12 ? "p" : "a";
  return minutes === 0
    ? `${hour12}${suffix}`
    : `${hour12}:${String(minutes).padStart(2, "0")}${suffix}`;
}

function formatCompactTimeRange(
  startTime?: string | null,
  endTime?: string | null,
) {
  const start = formatCompactTime(startTime);
  const end = formatCompactTime(endTime);
  if (!start || !end) return null;
  return `${start}–${end}`;
}

function resolveCycleShift(
  cycle: JobScheduleTeamCycle,
  templates: JobListShiftTemplate[],
): ResolvedCycleShift {
  const template =
    templates.find((item) => item.id === cycle.shift_template_id) ??
    (cycle.shift_template_index != null
      ? templates[cycle.shift_template_index]
      : undefined);

  const shiftType = (cycle.shift_type ?? template?.shift_type ?? "").toUpperCase();
  const shiftName = shiftType ? formatShiftTypeLabel(shiftType) : "Shift";
  const startTime = cycle.start_time ?? template?.start_time;
  const endTime = cycle.end_time ?? template?.end_time;

  return {
    id:
      cycle.id ??
      `${cycle.cycle_day}-${cycle.shift_template_id ?? cycle.shift_template_index ?? shiftName}`,
    shiftName,
    shiftType,
    time:
      startTime && endTime
        ? `${formatTime(startTime)} – ${formatTime(endTime)}`
        : null,
    compactTime: formatCompactTimeRange(startTime, endTime),
    workers: cycle.required_workers ?? 1,
  };
}

function groupCyclesByDay(cycles: JobScheduleTeamCycle[]) {
  const byDay = new Map<number, JobScheduleTeamCycle[]>();

  for (const cycle of cycles) {
    const existing = byDay.get(cycle.cycle_day) ?? [];
    existing.push(cycle);
    byDay.set(cycle.cycle_day, existing);
  }

  for (const [day, dayCycles] of byDay) {
    byDay.set(
      day,
      [...dayCycles].sort(
        (a, b) =>
          (a.shift_template_index ?? 0) - (b.shift_template_index ?? 0),
      ),
    );
  }

  return byDay;
}

function resolveDayShifts(
  dayCycles: JobScheduleTeamCycle[] | undefined,
  templates: JobListShiftTemplate[],
): ResolvedCycleShift[] {
  if (!dayCycles?.length) return [];

  return dayCycles
    .filter((cycle) => cycle.is_working !== false)
    .map((cycle) => resolveCycleShift(cycle, templates));
}

function getCycleLength(
  schedule: JobScheduleData,
  teams: JobScheduleRotationalTeam[],
) {
  if (schedule.rotation_cycle_days && schedule.rotation_cycle_days > 0) {
    return schedule.rotation_cycle_days;
  }

  const maxDay = teams.reduce((max, team) => {
    const teamMax = team.cycles.reduce(
      (innerMax, cycle) => Math.max(innerMax, cycle.cycle_day),
      0,
    );
    return Math.max(max, teamMax);
  }, 0);

  return maxDay || 14;
}

function getWeekdayHeaders(cycleStartDay?: string | null) {
  const startKey = (cycleStartDay ?? "SATURDAY").toUpperCase();
  const startIndex = CYCLE_START_WEEKDAY_INDEX[startKey] ?? 6;
  return Array.from({ length: 7 }, (_, index) => {
    return WEEKDAY_SHORT[(startIndex + index) % 7];
  });
}

function CycleDayCell({
  day,
  shifts,
}: {
  day: number;
  shifts: ResolvedCycleShift[];
}) {
  if (shifts.length === 0) {
    return (
      <div className="flex min-h-[54px] min-w-0 flex-col items-center rounded-lg border border-gray-100 bg-gray-50/80 px-0.5 py-1 sm:min-h-[62px] sm:px-1">
        <span className="text-[9px] font-semibold tabular-nums text-gray-400 sm:text-[10px]">
          {day}
        </span>
        <span className="mt-auto pb-0.5 text-[9px] font-medium text-gray-400 sm:text-[10px]">
          Off
        </span>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-1">
      {shifts.map((shift) => (
        <div
          key={shift.id}
          title={[shift.shiftName, shift.time, `${shift.workers} worker${shift.workers === 1 ? "" : "s"}`]
            .filter(Boolean)
            .join(" · ")}
          className={cn(
            "flex min-h-[54px] min-w-0 flex-col rounded-lg border px-1 py-1 sm:min-h-[62px] sm:px-1.5",
            SHIFT_TYPE_STYLES[shift.shiftType] ??
              "border-orange-100 bg-orange-50/60",
          )}
        >
          <span className="text-[9px] font-semibold tabular-nums text-gray-500 sm:text-[10px]">
            {day}
          </span>
          <p className="mt-0.5 truncate text-[10px] font-semibold leading-tight text-gray-900 sm:text-[11px]">
            {shift.shiftName}
            <span className="ml-0.5 font-medium text-[#F4781B]">
              ×{shift.workers}
            </span>
          </p>
          {shift.compactTime && (
            <p className="mt-auto truncate text-[9px] leading-tight text-gray-500 sm:text-[10px]">
              {shift.compactTime}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function ShiftTemplateCard({ template }: { template: JobListShiftTemplate }) {
  const shiftType = template.shift_type.toUpperCase();
  const style = SHIFT_TYPE_ICONS[shiftType] ?? SHIFT_TYPE_ICONS.MORNING;
  const Icon = style.icon;
  const breakLabel =
    template.break_minutes != null && template.break_minutes > 0
      ? `${template.break_minutes}m break`
      : null;
  const payableLabel =
    template.payable_hours != null ? `${template.payable_hours}h` : null;
  const timeLabel =
    template.start_time && template.end_time
      ? `${formatTime(template.start_time)} – ${formatTime(template.end_time)}`
      : null;

  return (
    <div className="flex min-w-0 items-center gap-2.5 rounded-xl border border-gray-100 bg-gray-50/40 px-3 py-2">
      <span
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
          style.wrap,
        )}
      >
        <Icon size={14} className={style.iconClass} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-gray-900">
          {formatShiftTypeLabel(template.shift_type)}
        </p>
        <p className="mt-0.5 truncate text-[11px] text-gray-500">
          {[timeLabel, payableLabel, breakLabel].filter(Boolean).join(" · ")}
        </p>
      </div>
    </div>
  );
}

function TeamCycleCalendar({
  schedule,
  teams,
}: {
  schedule: JobScheduleData;
  teams: JobScheduleRotationalTeam[];
}) {
  const cycleLength = getCycleLength(schedule, teams);
  const weekdayHeaders = getWeekdayHeaders(schedule.cycle_start_day);
  const weekCount = Math.max(1, Math.ceil(cycleLength / 7));
  const templates = schedule.shift_templates ?? [];

  return (
    <div className="min-w-0 space-y-3">
      {teams.map((team) => {
        const cyclesByDay = groupCyclesByDay(team.cycles ?? []);

        return (
          <div key={team.id} className="min-w-0">
            <div className="mb-1.5 flex items-center gap-2">
              <p className="text-xs font-semibold text-gray-900 sm:text-sm">
                {team.team_name}
              </p>
              {team.is_active === false && (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
                  Inactive
                </span>
              )}
            </div>

            <div className="min-w-0 space-y-1">
              <div className="grid grid-cols-7 gap-1">
                {weekdayHeaders.map((weekday) => (
                  <div
                    key={weekday}
                    className="px-0.5 text-center text-[9px] font-semibold uppercase tracking-wide text-gray-400 sm:text-[10px]"
                  >
                    <span className="sm:hidden">{weekday.slice(0, 2)}</span>
                    <span className="hidden sm:inline">{weekday}</span>
                  </div>
                ))}
              </div>

              {Array.from({ length: weekCount }, (_, weekIndex) => (
                <div
                  key={`${team.id}-week-${weekIndex}`}
                  className="grid grid-cols-7 gap-1"
                >
                  {Array.from({ length: 7 }, (_, dayIndex) => {
                    const day = weekIndex * 7 + dayIndex + 1;
                    if (day > cycleLength) {
                      return <div key={`${team.id}-pad-${day}`} />;
                    }

                    return (
                      <CycleDayCell
                        key={`${team.id}-${day}`}
                        day={day}
                        shifts={resolveDayShifts(
                          cyclesByDay.get(day),
                          templates,
                        )}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CandidateRotationsSection({
  rotations,
  teams,
}: {
  rotations: JobTeamCandidateRotation[];
  teams: JobScheduleRotationalTeam[];
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 sm:px-5">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
          <Users size={14} className="text-[#F4781B]" />
          Assigned to rotation
        </h3>
        <span className="rounded-full bg-gray-50 px-2.5 py-0.5 text-[11px] font-semibold text-gray-500 ring-1 ring-gray-200">
          {rotations.length}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80">
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400 sm:px-5">
                Order
              </th>
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                Team
              </th>
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                Shifts
              </th>
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                Joined
              </th>
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400 sm:pr-5">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {rotations.map((rotation) => {
              const teamName =
                rotation.team_name ??
                teams.find((team) => team.id === rotation.team_id)?.team_name ??
                formatLabel(rotation.team_id);
              const shiftTypes = rotation.shift_types ?? [];

              return (
                <tr
                  key={
                    rotation.id ??
                    `${rotation.team_id}-${rotation.candidate_user_id}-${rotation.rotation_order}`
                  }
                  className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/60"
                >
                  <td className="px-4 py-3 font-semibold tabular-nums text-gray-900 sm:px-5">
                    #{rotation.rotation_order}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{teamName}</td>
                  <td className="px-4 py-3">
                    {shiftTypes.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {shiftTypes.map((shiftType) => (
                          <span
                            key={shiftType}
                            className="rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-semibold text-[#F4781B]"
                          >
                            {formatShiftTypeLabel(shiftType)}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {rotation.joined_at
                      ? formatDateShort(rotation.joined_at)
                      : "—"}
                  </td>
                  <td className="px-4 py-3 sm:pr-5">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        rotation.is_active
                          ? "bg-green-50 text-green-700 ring-1 ring-green-100"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {rotation.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function SchedulePlanPanel({
  schedule,
  isLoading,
  error,
  showCandidateRotations = true,
}: SchedulePlanPanelProps) {
  if (isLoading) {
    return <LoadingRows count={4} />;
  }

  if (error) {
    return (
      <EmptyState
        title="Unable to load schedule plan"
        description={error}
      />
    );
  }

  if (!schedule) return null;

  const templates = schedule.shift_templates ?? [];
  const teams = [...(schedule.rotational_teams ?? [])].sort(
    (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0),
  );
  const rotations = [...(schedule.team_candidate_rotations ?? [])].sort(
    (a, b) => a.rotation_order - b.rotation_order,
  );
  const isRotational = schedule.shift_mode?.toUpperCase() === "ROTATIONAL";
  const isInstant = schedule.job_urgency === "INSTANT";
  const isStandard = schedule.shift_mode?.toUpperCase() === "STANDARD";

  return (
    <div className="flex min-w-0 flex-col gap-4">
      {!isRotational &&
        (isInstant ||
          schedule.shift_mode ||
          schedule.rotation_cycle_days != null ||
          schedule.cycle_start_day) && (
          <div className="flex flex-wrap gap-2">
            {isInstant && (
              <span className="rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                Instant
              </span>
            )}
            {schedule.shift_mode && (
              <span className="rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                {isStandard
                  ? "Standard Shifts"
                  : formatLabel(schedule.shift_mode)}
              </span>
            )}
            {schedule.rotation_cycle_days != null && (
              <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600">
                {schedule.rotation_cycle_days}-day cycle
              </span>
            )}
            {schedule.cycle_start_day && (
              <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600">
                Cycle starts {formatLabel(schedule.cycle_start_day)}
              </span>
            )}
            {teams.length > 0 && (
              <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600">
                {teams.length} team{teams.length === 1 ? "" : "s"}
              </span>
            )}
          </div>
        )}

      {isRotational && teams.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="p-5">
            <WorkScheduleVisual
              schedule={schedule}
              teams={teams}
              framed={false}
            />
          </div>
        </div>
      ) : (
        <div className="min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white p-3 sm:p-4">
          {templates.length > 0 && (
            <section>
              <h3 className="mb-2 text-sm font-semibold text-gray-900">
                Shift Templates
              </h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {templates.map((template, index) => (
                  <ShiftTemplateCard
                    key={template.id ?? `${template.shift_type}-${index}`}
                    template={template}
                  />
                ))}
              </div>
            </section>
          )}

          {isStandard && teams.length > 0 && (
            <section className={templates.length > 0 ? "mt-4" : undefined}>
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  Team Schedule
                </h3>
                <p className="text-[11px] text-gray-400">
                  {getCycleLength(schedule, teams)}-day cycle
                  {schedule.cycle_start_day
                    ? ` · starts ${formatLabel(schedule.cycle_start_day)}`
                    : ""}
                </p>
              </div>
              <TeamCycleCalendar schedule={schedule} teams={teams} />
            </section>
          )}

          {templates.length === 0 && !(isStandard && teams.length > 0) && (
            <EmptyState
              title="No schedule plan configured"
              description="Shift templates will appear here once the job schedule is set up."
            />
          )}
        </div>
      )}

      {showCandidateRotations && rotations.length > 0 && (
        <CandidateRotationsSection rotations={rotations} teams={teams} />
      )}

      {isRotational && teams.length === 0 && (
        <div className="flex items-center gap-2 rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-3 text-xs text-gray-500">
          <Layers size={14} />
          Rotational mode is enabled but no teams are configured yet.
        </div>
      )}
    </div>
  );
}
