"use client";

import { Layers, Users } from "lucide-react";
import type {
  JobListShiftTemplate,
  JobScheduleData,
  JobScheduleRotationalTeam,
  JobScheduleTeamCycle,
} from "@/types";
import { cn } from "@/lib/utils";
import { EmptyState, LoadingRows } from "../shared/JobDetailDataView";
import {
  formatLabel,
  formatShiftTemplateLine,
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
  workers: number;
};

const SHIFT_TYPE_STYLES: Record<string, string> = {
  MORNING: "border-red-100 bg-red-50/80",
  EVENING: "border-green-100 bg-green-50/80",
  NIGHT: "border-blue-100 bg-blue-50/80",
};

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

function CycleDayCell({
  shifts,
}: {
  shifts: ResolvedCycleShift[];
}) {
  if (shifts.length === 0) {
    return (
      <span className="inline-block w-full rounded-lg bg-gray-100 px-2 py-3 text-xs font-medium text-gray-400">
        Off
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      {shifts.map((shift) => (
        <div
          key={shift.id}
          className={cn(
            "rounded-lg border px-2 py-1.5 text-left",
            SHIFT_TYPE_STYLES[shift.shiftType] ??
              "border-orange-100 bg-orange-50/60",
          )}
        >
          <p className="text-[11px] font-semibold leading-tight text-gray-900">
            {shift.shiftName}
          </p>
          {shift.time && (
            <p className="mt-0.5 text-[10px] leading-tight text-gray-500">
              {shift.time}
            </p>
          )}
          <p className="mt-0.5 text-[10px] font-medium text-[#F4781B]">
            {shift.workers} worker{shift.workers === 1 ? "" : "s"}
          </p>
        </div>
      ))}
    </div>
  );
}

function RotationalGrid({
  schedule,
  teams,
}: {
  schedule: JobScheduleData;
  teams: JobScheduleRotationalTeam[];
}) {
  const cycleLength = getCycleLength(schedule, teams);
  const cycleDays = Array.from({ length: cycleLength }, (_, index) => index + 1);
  const templates = schedule.shift_templates ?? [];

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full min-w-[900px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="sticky left-0 z-10 bg-gray-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              Team
            </th>
            {cycleDays.map((day) => (
              <th
                key={day}
                className="px-2 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500 min-w-[120px]"
              >
                Day {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {teams.map((team) => {
            const cyclesByDay = groupCyclesByDay(team.cycles ?? []);

            return (
              <tr
                key={team.id}
                className="border-b border-gray-100 last:border-b-0 align-top"
              >
                <td className="sticky left-0 z-10 bg-white px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">
                  <div>{team.team_name}</div>
                  {team.is_active === false && (
                    <span className="text-[10px] font-normal text-gray-400">
                      Inactive
                    </span>
                  )}
                </td>
                {cycleDays.map((day) => {
                  const shifts = resolveDayShifts(
                    cyclesByDay.get(day),
                    templates,
                  );

                  return (
                    <td key={day} className="px-2 py-2 align-top">
                      <CycleDayCell shifts={shifts} />
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
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
    <div className="flex flex-col gap-6">
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

          {showCandidateRotations && rotations.length > 0 && (
            <div className="border-t border-gray-100">
              <div className="flex items-center justify-between gap-3 px-5 py-3">
                <h3 className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                  <Users size={14} className="text-[#F4781B]" />
                  Candidate Rotations
                </h3>
                <span className="rounded-full bg-gray-50 px-2.5 py-0.5 text-[11px] font-semibold text-gray-500 ring-1 ring-gray-200">
                  {rotations.length}
                </span>
              </div>
              <div className="overflow-x-auto border-t border-gray-50">
                <table className="w-full min-w-[480px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/80">
                      <th className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                        Order
                      </th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                        Team
                      </th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                        Candidate
                      </th>
                      <th className="px-4 py-2.5 pr-5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rotations.map((rotation) => (
                      <tr
                        key={`${rotation.team_id}-${rotation.candidate_user_id}-${rotation.rotation_order}`}
                        className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/60"
                      >
                        <td className="px-5 py-3 font-semibold tabular-nums text-gray-900">
                          #{rotation.rotation_order}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {rotation.team_name ??
                            teams.find((team) => team.id === rotation.team_id)
                              ?.team_name ??
                            formatLabel(rotation.team_id)}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">
                          {rotation.candidate_user_id.length > 14
                            ? `${rotation.candidate_user_id.slice(0, 6)}…${rotation.candidate_user_id.slice(-4)}`
                            : rotation.candidate_user_id}
                        </td>
                        <td className="px-4 py-3 pr-5">
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
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-5">
          {templates.length > 0 && (
            <section>
              <h3 className="mb-3 text-sm font-semibold text-gray-900">
                Shift Templates
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {templates.map((template, index) => (
                  <div
                    key={template.id ?? `${template.shift_type}-${index}`}
                    className="rounded-xl border border-gray-100 bg-gray-50/40 p-4"
                  >
                    <p className="text-sm font-semibold text-gray-900">
                      {formatShiftTypeLabel(template.shift_type)}
                    </p>
                    <p className="mt-1 text-xs font-medium text-gray-500">
                      {formatLabel(template.shift_type)}
                    </p>
                    <p className="mt-2 text-sm text-gray-700">
                      {formatShiftTemplateLine(template)}
                    </p>
                    {template.payable_hours != null && (
                      <p className="mt-1.5 text-xs text-gray-400">
                        {template.payable_hours}h per shift
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {isStandard && teams.length > 0 && (
            <section className={templates.length > 0 ? "mt-5" : undefined}>
              <h3 className="mb-3 text-sm font-semibold text-gray-900">
                Team Schedule
              </h3>
              <RotationalGrid schedule={schedule} teams={teams} />
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

      {!isRotational &&
        showCandidateRotations &&
        rotations.length > 0 && (
          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 sm:px-5">
              <h3 className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                <Users size={14} className="text-[#F4781B]" />
                Candidate Rotations
              </h3>
              <span className="rounded-full bg-gray-50 px-2.5 py-0.5 text-[11px] font-semibold text-gray-500 ring-1 ring-gray-200">
                {rotations.length}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/80">
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400 sm:px-5">
                      Order
                    </th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      Team
                    </th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      Candidate
                    </th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400 sm:pr-5">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rotations.map((rotation) => (
                    <tr
                      key={`${rotation.team_id}-${rotation.candidate_user_id}-${rotation.rotation_order}`}
                      className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/60"
                    >
                      <td className="px-4 py-3 font-semibold tabular-nums text-gray-900 sm:px-5">
                        #{rotation.rotation_order}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {rotation.team_name ??
                          teams.find((team) => team.id === rotation.team_id)
                            ?.team_name ??
                          formatLabel(rotation.team_id)}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">
                        {rotation.candidate_user_id.length > 14
                          ? `${rotation.candidate_user_id.slice(0, 6)}…${rotation.candidate_user_id.slice(-4)}`
                          : rotation.candidate_user_id}
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
                  ))}
                </tbody>
              </table>
            </div>
          </section>
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
