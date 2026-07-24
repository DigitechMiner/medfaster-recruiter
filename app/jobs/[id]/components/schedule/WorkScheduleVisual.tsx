"use client";

import { Moon, Sun, Sunset } from "lucide-react";
import type {
  JobListShiftTemplate,
  JobScheduleData,
  JobScheduleRotationalTeam,
} from "@/types";
import { cn } from "@/lib/utils";
import { formatLabel, formatTime } from "../shared/job-detail-helpers";
import { formatShiftTypeLabel } from "@/app/jobs/components/helper";

type WorkScheduleVisualProps = {
  schedule: JobScheduleData;
  teams: JobScheduleRotationalTeam[];
  compact?: boolean;
  /** When false, omit outer card chrome (parent provides the card). */
  framed?: boolean;
};

type TeamPalette = {
  dot: string;
  text: string;
  cellBg: string;
  cellBorder: string;
  cellText: string;
};

type DayAssignment = {
  day: number;
  weekdayShort: string;
  team: JobScheduleRotationalTeam | null;
  teamIndex: number;
};

const TEAM_PALETTES: TeamPalette[] = [
  {
    dot: "bg-[#F4781B]",
    text: "text-gray-700",
    cellBg: "bg-orange-50",
    cellBorder: "border-orange-100",
    cellText: "text-[#E56A0F]",
  },
  {
    dot: "bg-teal-500",
    text: "text-gray-700",
    cellBg: "bg-teal-50",
    cellBorder: "border-teal-100",
    cellText: "text-teal-700",
  },
  {
    dot: "bg-violet-500",
    text: "text-gray-700",
    cellBg: "bg-violet-50",
    cellBorder: "border-violet-100",
    cellText: "text-violet-700",
  },
  {
    dot: "bg-sky-500",
    text: "text-gray-700",
    cellBg: "bg-sky-50",
    cellBorder: "border-sky-100",
    cellText: "text-sky-700",
  },
];

const SHIFT_TIMELINE_STYLES: Record<
  string,
  {
    icon: typeof Sun;
    iconClass: string;
    iconWrap: string;
    barClass: string;
  }
> = {
  MORNING: {
    icon: Sun,
    iconClass: "text-red-600",
    iconWrap: "bg-red-50",
    barClass: "bg-red-500",
  },
  EVENING: {
    icon: Sunset,
    iconClass: "text-green-600",
    iconWrap: "bg-green-50",
    barClass: "bg-green-500",
  },
  NIGHT: {
    icon: Moon,
    iconClass: "text-blue-600",
    iconWrap: "bg-blue-50",
    barClass: "bg-blue-500",
  },
  DAY: {
    icon: Sun,
    iconClass: "text-sky-600",
    iconWrap: "bg-sky-50",
    barClass: "bg-sky-500",
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

function getWeekdayShortForDay(
  cycleStartDay: string | null | undefined,
  dayNumber: number,
) {
  const startKey = (cycleStartDay ?? "SATURDAY").toUpperCase();
  const startIndex = CYCLE_START_WEEKDAY_INDEX[startKey] ?? 6;
  return WEEKDAY_SHORT[(startIndex + dayNumber - 1) % 7];
}

function teamWorksOnDay(
  team: JobScheduleRotationalTeam,
  day: number,
): boolean {
  return (team.cycles ?? []).some(
    (cycle) => cycle.cycle_day === day && cycle.is_working !== false,
  );
}

function resolveDayAssignments(
  schedule: JobScheduleData,
  teams: JobScheduleRotationalTeam[],
  cycleLength: number,
): DayAssignment[] {
  return Array.from({ length: cycleLength }, (_, index) => {
    const day = index + 1;
    const teamIndex = teams.findIndex((team) => teamWorksOnDay(team, day));
    const team = teamIndex >= 0 ? teams[teamIndex] : null;

    return {
      day,
      weekdayShort: getWeekdayShortForDay(schedule.cycle_start_day, day),
      team,
      teamIndex,
    };
  });
}

function formatDurationLabel(
  template: JobListShiftTemplate,
): string | null {
  if (template.payable_hours != null && Number.isFinite(template.payable_hours)) {
    const hours = Math.floor(template.payable_hours);
    const minutes = Math.round((template.payable_hours - hours) * 60);
    if (minutes > 0) return `${hours}h ${minutes}m`;
    return `${hours}h`;
  }

  if (!template.start_time || !template.end_time) return null;

  const [startH, startM] = template.start_time.split(":").map(Number);
  const [endH, endM] = template.end_time.split(":").map(Number);
  let total =
    endH * 60 +
    endM -
    (startH * 60 + startM) -
    (template.break_minutes ?? 0);
  if (total < 0) total += 24 * 60;

  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  if (minutes > 0) return `${hours}h ${minutes}m`;
  return `${hours}h`;
}

function formatBreakLabel(minutes?: number | null) {
  if (minutes == null || minutes <= 0) return null;
  return `${minutes}m break`;
}

function sortTemplates(templates: JobListShiftTemplate[]) {
  const order = ["MORNING", "DAY", "EVENING", "NIGHT"];
  return [...templates].sort((a, b) => {
    const aIndex = order.indexOf(a.shift_type.toUpperCase());
    const bIndex = order.indexOf(b.shift_type.toUpperCase());
    return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
  });
}

function ShiftTimelineRow({ template }: { template: JobListShiftTemplate }) {
  const shiftType = template.shift_type.toUpperCase();
  const style = SHIFT_TIMELINE_STYLES[shiftType] ?? SHIFT_TIMELINE_STYLES.DAY;
  const Icon = style.icon;
  const duration = formatDurationLabel(template);
  const breakLabel = formatBreakLabel(template.break_minutes);

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex min-w-0 shrink-0 items-center gap-2 sm:w-44">
        <span
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
            style.iconWrap,
          )}
        >
          <Icon className={cn("h-3.5 w-3.5", style.iconClass)} aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900">
            {formatShiftTypeLabel(template.shift_type)}
          </p>
          {duration && (
            <p className="text-[11px] font-medium text-gray-400">{duration}</p>
          )}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <span className="w-[3.25rem] shrink-0 text-right text-[11px] font-semibold tabular-nums text-gray-500">
          {formatTime(template.start_time)}
        </span>

        <div className="relative flex h-3.5 min-w-0 flex-1 items-center">
          {breakLabel ? (
            <>
              <div
                className={cn("h-2.5 flex-[1] rounded-l-full", style.barClass)}
              />
              <div className="relative z-10 flex h-3.5 min-w-[4.5rem] items-center justify-center bg-white px-1">
                <span className="whitespace-nowrap rounded-md border border-gray-100 bg-gray-50 px-1.5 py-0.5 text-[9px] font-semibold leading-none text-gray-500">
                  {breakLabel}
                </span>
              </div>
              <div
                className={cn("h-2.5 flex-[1] rounded-r-full", style.barClass)}
              />
            </>
          ) : (
            <div className={cn("h-2.5 w-full rounded-full", style.barClass)} />
          )}
        </div>

        <span className="w-[3.25rem] shrink-0 text-[11px] font-semibold tabular-nums text-gray-500">
          {formatTime(template.end_time)}
        </span>
      </div>
    </div>
  );
}

export function WorkScheduleVisual({
  schedule,
  teams,
  compact = false,
  framed = true,
}: WorkScheduleVisualProps) {
  const cycleLength = getCycleLength(schedule, teams);
  const weekdayHeaders = getWeekdayHeaders(schedule.cycle_start_day);
  const dayAssignments = resolveDayAssignments(schedule, teams, cycleLength);
  const templates = sortTemplates(schedule.shift_templates ?? []);

  const cycleMeta = [
    `${cycleLength}-day cycle`,
    schedule.cycle_start_day
      ? `Starts ${formatLabel(schedule.cycle_start_day)}`
      : null,
    `${teams.length} team${teams.length === 1 ? "" : "s"}`,
  ]
    .filter(Boolean)
    .join(" · ");

  const weekRows: DayAssignment[][] = [];
  for (let i = 0; i < dayAssignments.length; i += 7) {
    weekRows.push(dayAssignments.slice(i, i + 7));
  }

  return (
    <div
      className={cn(
        framed && "overflow-hidden rounded-2xl border border-gray-200 bg-white",
        compact ? "p-4" : framed ? "p-5" : "p-0",
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3
            className={cn(
              "font-bold text-[#F4781B]",
              compact ? "text-sm" : "text-base",
            )}
          >
            Work Schedule
          </h3>
          <p className="mt-0.5 text-xs text-gray-500">{cycleMeta}</p>
        </div>

        {teams.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            {teams.map((team, index) => {
              const palette = TEAM_PALETTES[index % TEAM_PALETTES.length];
              return (
                <div
                  key={team.id}
                  className="flex items-center gap-1.5 text-xs font-medium text-gray-600"
                >
                  <span
                    className={cn("h-2 w-2 shrink-0 rounded-full", palette.dot)}
                  />
                  <span className={palette.text}>{team.team_name}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className={cn("mt-4", compact ? "space-y-1" : "space-y-1.5")}>
        <div className="grid grid-cols-7 gap-1">
          {weekdayHeaders.map((weekday) => (
            <div
              key={weekday}
              className="text-center text-[10px] font-semibold uppercase tracking-wide text-gray-400"
            >
              {weekday}
            </div>
          ))}
        </div>

        {weekRows.map((row, rowIndex) => (
          <div key={`week-${rowIndex}`} className="grid grid-cols-7 gap-1">
            {row.map((assignment) => {
              const palette =
                assignment.teamIndex >= 0
                  ? TEAM_PALETTES[assignment.teamIndex % TEAM_PALETTES.length]
                  : null;

              return (
                <div
                  key={assignment.day}
                  title={
                    assignment.team
                      ? `Day ${assignment.day} · ${assignment.team.team_name}`
                      : `Day ${assignment.day} · Off`
                  }
                  className={cn(
                    "flex items-center justify-center rounded-md border text-xs font-semibold tabular-nums",
                    compact ? "h-7" : "h-8 sm:h-9",
                    palette
                      ? cn(palette.cellBg, palette.cellBorder, palette.cellText)
                      : "border-transparent bg-gray-50 text-gray-300",
                  )}
                >
                  {assignment.day}
                </div>
              );
            })}

            {row.length < 7 &&
              Array.from({ length: 7 - row.length }).map((_, index) => (
                <div
                  key={`pad-${index}`}
                  className={compact ? "h-7" : "h-8 sm:h-9"}
                />
              ))}
          </div>
        ))}
      </div>

      {templates.length > 0 && (
        <div
          className={cn(
            "mt-4 space-y-3 border-t border-gray-100 pt-4",
            compact && "mt-3 space-y-2.5 pt-3",
          )}
        >
          {templates.map((template, index) => (
            <ShiftTimelineRow
              key={template.id ?? `${template.shift_type}-${index}`}
              template={template}
            />
          ))}
        </div>
      )}
    </div>
  );
}
