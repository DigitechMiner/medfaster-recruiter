"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { UsersRound } from "lucide-react";
import { DataTable } from "@/components/table/DataTable";
import { PaginationFooter } from "@/components/table/PaginationFooter";
import { useJobTeam } from "@/hooks/useJobData";
import { useNow } from "@/hooks/useNow";
import { cn } from "@/lib/utils";
import type {
  JobTeamMember,
  JobTeamMemberStatus,
  JobTeamRosterTeam,
} from "@/types";
import { EmptyState, LoadingRows } from "../shared/JobDetailDataView";
import {
  formatDate,
  formatLabel,
  formatTime,
} from "../shared/job-detail-helpers";
import {
  getShiftBadgeClass,
  getShiftMeta,
} from "../candidates/applications-table-helpers";
import { ShiftCountdown } from "@/components/ShiftCountdown";

const MEMBER_LIMIT = 12;

const TEAM_TABLE_HEADERS = [
  "Member",
  "Team",
  "Shifts",
  "Status",
  "Shifts worked",
  "Next shift",
];

const TABLE_COLUMN_CLASS_NAMES = [
  "min-w-[220px] w-[26%] !text-left",
  "min-w-[140px] w-[16%] !text-left",
  "min-w-[140px] w-[16%] !text-left",
  "min-w-[110px] w-[12%] !text-center",
  "min-w-[120px] w-[12%] !text-center",
  "min-w-[180px] w-[18%] !text-left",
];

const STATUS_OPTIONS: { label: string; value: "" | JobTeamMemberStatus }[] = [
  { label: "All statuses", value: "" },
  { label: "Future", value: "FUTURE" },
  { label: "Active", value: "ACTIVE" },
  { label: "Leave", value: "LEAVE" },
  { label: "Termination pending", value: "TERMINATION_PENDING" },
  { label: "Terminated", value: "TERMINATED" },
];

const TEAM_ACCENTS = [
  {
    chip: "border-orange-200 bg-orange-50 text-orange-800",
    active: "border-[#F4781B] bg-orange-50 text-orange-800",
    dot: "bg-[#F4781B]",
  },
  {
    chip: "border-teal-200 bg-teal-50 text-teal-800",
    active: "border-teal-500 bg-teal-50 text-teal-800",
    dot: "bg-teal-500",
  },
  {
    chip: "border-violet-200 bg-violet-50 text-violet-800",
    active: "border-violet-500 bg-violet-50 text-violet-800",
    dot: "bg-violet-500",
  },
  {
    chip: "border-sky-200 bg-sky-50 text-sky-800",
    active: "border-sky-500 bg-sky-50 text-sky-800",
    dot: "bg-sky-500",
  },
];

type TeamTabProps = {
  jobId: string;
  enabled?: boolean;
};

function getMemberName(member: JobTeamMember) {
  const candidate = member.candidate;
  const name = [candidate?.first_name, candidate?.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  return name || "Team member";
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getStatusBadgeClass(status?: string | null) {
  switch ((status ?? "").toUpperCase()) {
    case "ACTIVE":
      return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    case "FUTURE":
      return "bg-sky-50 text-sky-700 border border-sky-200";
    case "LEAVE":
      return "bg-amber-50 text-amber-700 border border-amber-200";
    case "TERMINATION_PENDING":
      return "bg-orange-50 text-orange-700 border border-orange-200";
    case "TERMINATED":
      return "bg-gray-100 text-gray-600 border border-gray-200";
    default:
      return "bg-gray-100 text-gray-600 border border-gray-200";
  }
}

function TeamFilterBar({
  teams,
  selectedTeamId,
  onSelect,
}: {
  teams: JobTeamRosterTeam[];
  selectedTeamId: string;
  onSelect: (teamId: string) => void;
}) {
  if (teams.length === 0) return null;

  const sorted = [...teams].sort(
    (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0),
  );
  const totalMembers = sorted.reduce(
    (sum, team) => sum + (team.member_count ?? 0),
    0,
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => onSelect("")}
        className={cn(
          "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
          selectedTeamId === ""
            ? "border-[#F4781B] bg-orange-50 text-orange-800"
            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300",
        )}
      >
        All teams
        <span className="rounded-md bg-white/80 px-1.5 py-0.5 text-[10px] font-bold text-gray-500">
          {totalMembers}
        </span>
      </button>

      {sorted.map((team, index) => {
        const accent = TEAM_ACCENTS[index % TEAM_ACCENTS.length];
        const selected = selectedTeamId === team.id;

        return (
          <button
            type="button"
            key={team.id}
            onClick={() => onSelect(team.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
              selected ? accent.active : "border-gray-200 bg-white text-gray-600 hover:border-gray-300",
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", accent.dot)} />
            {team.team_name}
            <span className="rounded-md bg-white/80 px-1.5 py-0.5 text-[10px] font-bold text-gray-500">
              {team.member_count}
            </span>
            {team.open_vacancy_count > 0 && (
              <span className="text-[10px] font-medium text-gray-400">
                · {team.open_vacancy_count} open
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function MemberTeamsCell({
  member,
  teamIndexById,
}: {
  member: JobTeamMember;
  teamIndexById: Map<string, number>;
}) {
  if (member.teams.length === 0) {
    return <span className="text-xs text-gray-400">—</span>;
  }

  return (
    <div className="flex flex-col gap-1">
      {member.teams.map((team) => {
        const accentIndex = teamIndexById.get(team.team_id) ?? 0;
        const accent = TEAM_ACCENTS[accentIndex % TEAM_ACCENTS.length];

        return (
          <span
            key={`${team.team_id}-${team.rotation_id ?? team.rotation_order ?? "team"}`}
            className={cn(
              "inline-flex w-fit items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold",
              accent.chip,
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", accent.dot)} />
            {team.team_name}
          </span>
        );
      })}
    </div>
  );
}

function MemberShiftsCell({ member }: { member: JobTeamMember }) {
  const shiftTypes = Array.from(
    new Set(member.teams.flatMap((team) => team.shift_types ?? [])),
  );

  if (shiftTypes.length === 0) {
    return <span className="text-xs text-gray-400">—</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {shiftTypes.map((shift) => {
        const meta = getShiftMeta(shift);
        return (
          <span
            key={shift}
            className={cn(
              "rounded-full border px-2 py-0.5 text-[10px] font-medium",
              getShiftBadgeClass(shift),
            )}
          >
            {meta.label}
          </span>
        );
      })}
    </div>
  );
}

function NextShiftCell({
  member,
  nowMs,
}: {
  member: JobTeamMember;
  nowMs: number;
}) {
  const nextShift = member.next_shift;
  if (!nextShift) {
    return <span className="text-xs text-gray-400">—</span>;
  }

  return (
    <div className="min-w-0">
      <p className="truncate text-xs font-medium text-gray-800">
        {getShiftMeta(nextShift.shift_type).label}
      </p>
      <p className="truncate text-[11px] text-gray-400">
        {formatDate(nextShift.shift_date)}
        {nextShift.planned_check_in && nextShift.planned_check_out
          ? ` · ${formatTime(nextShift.planned_check_in)}–${formatTime(nextShift.planned_check_out)}`
          : ""}
      </p>
      <p className="mt-0.5 truncate text-[11px]">
        <ShiftCountdown
          plannedCheckInAt={nextShift.planned_check_in_at}
          plannedCheckOutAt={nextShift.planned_check_out_at}
          nowMs={nowMs}
        />
      </p>
    </div>
  );
}

export function TeamTab({ jobId, enabled = true }: TeamTabProps) {
  const [page, setPage] = useState(1);
  const [teamId, setTeamId] = useState("");
  const [status, setStatus] = useState<"" | JobTeamMemberStatus>("");

  const { team, isLoading, error } = useJobTeam(
    jobId,
    {
      page,
      limit: MEMBER_LIMIT,
      team_id: teamId || undefined,
      status: status || undefined,
      include_shifts: false,
      shift_limit: 1,
    },
    enabled,
  );

  useEffect(() => {
    setPage(1);
  }, [teamId, status]);

  const teams = team?.teams ?? [];
  const members = team?.members ?? [];
  const pagination = team?.pagination;
  const jobMeta = team?.job;
  const hasLiveCountdown = useMemo(
    () =>
      members.some(
        (member) =>
          member.next_shift?.planned_check_in_at ||
          member.next_shift?.planned_check_out_at,
      ),
    [members],
  );
  const nowMs = useNow(enabled && hasLiveCountdown);

  const teamIndexById = useMemo(
    () =>
      new Map(
        [...teams]
          .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
          .map((item, index) => [item.id, index] as const),
      ),
    [teams],
  );

  if (isLoading && !team) {
    return <LoadingRows count={4} />;
  }

  if (error && !team) {
    return <EmptyState title="Unable to load team" description={error} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Team roster</h3>
          <p className="mt-0.5 text-xs text-gray-500">
            Hired members and coverage workers by rotational team
            {jobMeta?.hired_count != null
              ? ` · ${jobMeta.hired_count}/${jobMeta.no_of_hires_required ?? "—"} hired`
              : ""}
          </p>
        </div>

        <label className="flex items-center gap-2 text-xs text-gray-500">
          Status
          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as "" | JobTeamMemberStatus)
            }
            className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#F4781B]/20"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <TeamFilterBar
        teams={teams}
        selectedTeamId={teamId}
        onSelect={setTeamId}
      />

      {isLoading ? (
        <LoadingRows count={3} />
      ) : members.length === 0 ? (
        <EmptyState
          title={teamId ? "No members on this team" : "No team members yet"}
          description={
            teamId
              ? "Try another team or clear the team filter."
              : "Members appear here after candidates are hired into this job."
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <DataTable
            headers={TEAM_TABLE_HEADERS}
            minWidthClassName="min-w-[960px]"
            headerRowClassName="border-b border-gray-100 bg-gray-50/60"
            tableClassName="text-sm"
            columnClassNames={TABLE_COLUMN_CLASS_NAMES}
          >
            {members.map((member) => {
              const name = getMemberName(member);
              const initials = getInitials(name);
              const isCoverage = member.source === "SHIFT_COVERAGE";
              const summary = member.shift_summary;

              return (
                <tr
                  key={
                    member.worker_id ??
                    `${member.source}-${member.candidate_id}-${member.application_id ?? ""}`
                  }
                  className="border-b border-gray-50 last:border-b-0 transition-colors hover:bg-gray-50/60"
                >
                  <td className="px-4 py-3 align-middle">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-orange-50 ring-2 ring-orange-100">
                        {member.candidate?.profile_image_url ? (
                          <Image
                            src={member.candidate.profile_image_url}
                            alt={name}
                            width={36}
                            height={36}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[11px] font-semibold text-[#F4781B]">
                            {initials}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {name}
                        </p>
                        <p className="truncate text-[11px] text-gray-400">
                          {isCoverage ? "Coverage" : "Hired"}
                          {member.start_date
                            ? ` · Since ${formatDate(member.start_date)}`
                            : ""}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 align-middle">
                    <MemberTeamsCell
                      member={member}
                      teamIndexById={teamIndexById}
                    />
                  </td>

                  <td className="px-4 py-3 align-middle">
                    <MemberShiftsCell member={member} />
                  </td>

                  <td className="px-4 py-3 text-center align-middle">
                    {member.status ? (
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
                          getStatusBadgeClass(member.status),
                        )}
                      >
                        {formatLabel(member.status)}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-center align-middle">
                    {summary ? (
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {summary.worked}
                          <span className="font-normal text-gray-400">
                            /{summary.total}
                          </span>
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {summary.upcoming} upcoming
                        </p>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>

                  <td className="px-4 py-3 align-middle">
                    <NextShiftCell member={member} nowMs={nowMs} />
                  </td>
                </tr>
              );
            })}
          </DataTable>

          {(pagination?.total ?? 0) > MEMBER_LIMIT && (
            <PaginationFooter
              page={page}
              totalItems={pagination?.total ?? members.length}
              perPage={MEMBER_LIMIT}
              onPageChange={setPage}
              itemLabel="members"
              className="flex flex-col gap-3 border-t border-orange-100 bg-[#FEF3E9] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            />
          )}
        </div>
      )}

      {teams.length === 0 && members.length > 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-dashed border-gray-200 bg-gray-50/50 px-4 py-3 text-xs text-gray-500">
          <UsersRound size={14} />
          This job has hired members but no rotational teams configured.
        </div>
      )}
    </div>
  );
}
