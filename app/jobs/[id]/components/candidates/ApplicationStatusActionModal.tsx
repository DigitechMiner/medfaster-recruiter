"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Briefcase,
  Loader2,
  MapPin,
  Mic,
  Star,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getRecruiterJobTeam, updateApplicationStatus } from "@/features/jobs";
import { useJobSchedule, useJobTeam } from "@/hooks/useJobData";
import type {
  ApplicationStatus,
  ApplicationTeamPreference,
  HireShiftBand,
  JobStatus,
  JobTeamRosterTeam,
  JobUrgency,
} from "@/types";
import { formatShiftTypeLabel } from "@/app/jobs/components/helper";
import {
  EMPTY_DISPLAY,
  formatAppliedDate,
  formatCandidateLocation,
  formatEligibilityLabel,
  formatExperienceCompact,
  formatScoreDisplay,
  getApplicationStatusBadgeClass,
} from "./applications-table-helpers";
import {
  type ApplicationStatusAction,
  getApplicationStatusActionClassName,
  getApplicationStatusActionDescription,
  getApplicationStatusActionHint,
  getApplicationStatusActionLabel,
  getApplicationStatusActionGridClass,
  getApplicationStatusChooserDescription,
  getApplicationStatusDisplayLabel,
  getApplicationStatusTagline,
  getApplicationStatusTransitions,
  findAssignedHireSeat,
  getHirePlacementTeamsFromSchedule,
  getHireShiftBandOptions,
  getOpenTeamSlots,
  sortApplicationStatusActions,
  type AssignedHireSeat,
} from "./application-status-transitions";

async function loadAssignedHireSeat(
  jobId: string,
  placement: {
    applicationId: string;
    candidateId?: string;
    teamId: string;
    shiftType: string;
  },
): Promise<AssignedHireSeat | null> {
  const scoped = await getRecruiterJobTeam(jobId, {
    team_id: placement.teamId,
    include_shifts: false,
    limit: 100,
    page: 1,
  }).catch(() => null);
  const scopedSeat = findAssignedHireSeat(scoped?.members, placement);
  if (scopedSeat) return scopedSeat;

  const roster = await getRecruiterJobTeam(jobId, {
    include_shifts: false,
    limit: 100,
    page: 1,
  }).catch(() => null);
  return findAssignedHireSeat(roster?.members, placement);
}

const CANDIDATE_SCHEDULE_OVERLAP_MESSAGE =
  "This candidate has been selected for other assignments and is no longer available for this position. Kindly consider another suitable candidate";

function isCandidateScheduleOverlapMessage(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("overlapping") ||
    normalized.includes("conflict with your schedule") ||
    normalized.includes("schedule overlap")
  );
}

function resolveApplicationActionError(error: unknown): string {
  const err = error as { response?: { data?: { message?: string } }; message?: string };
  const apiMessage = err?.response?.data?.message ?? err?.message;
  if (apiMessage && isCandidateScheduleOverlapMessage(apiMessage)) {
    return CANDIDATE_SCHEDULE_OVERLAP_MESSAGE;
  }
  return apiMessage ?? "Action failed. Please try again.";
}

export type ApplicationActionCandidatePreview = {
  id?: string;
  name: string;
  profileImageUrl?: string | null;
  city?: string | null;
  state?: string | null;
  experience?: string | null;
  experienceMonths?: number | null;
  workEligibility?: string | null;
  jobTitle?: string | null;
  department?: string | null;
  score?: number | null;
};

type ApplicationStatusActionModalProps = {
  jobId: string;
  applicationId: string;
  candidate: ApplicationActionCandidatePreview;
  jobTitle?: string | null;
  appliedAt?: string | null;
  currentStatus: ApplicationStatus;
  aiInterviewEnabled: boolean;
  jobStatus?: JobStatus | string | null;
  jobUrgency?: JobUrgency | string | null;
  open: boolean;
  teamPreferences?: ApplicationTeamPreference[];
  onClose: () => void;
  onSuccess: () => void;
};

const choiceClassName =
  "flex cursor-pointer items-center gap-2.5 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 has-[:checked]:border-[#F4781B] has-[:checked]:bg-orange-50 has-[:checked]:text-gray-900";

function getActionIcon(action: ApplicationStatusAction) {
  switch (action) {
    case "HIRE":
      return UserCheck;
    case "REJECTED":
      return UserMinus;
    case "SHORTLISTED":
      return UserPlus;
    case "INTERVIEWING":
    case "INTERVIEWED":
      return Mic;
    default:
      return Users;
  }
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function HirePlacementForm({
  teamPreferences,
  rosterTeams,
  rosterLoading,
  selectedTeamId,
  selectedShiftBand,
  onTeamChange,
  onShiftChange,
}: {
  teamPreferences: ApplicationTeamPreference[];
  rosterTeams: JobTeamRosterTeam[];
  rosterLoading: boolean;
  selectedTeamId: string;
  selectedShiftBand: string;
  onTeamChange: (teamId: string) => void;
  onShiftChange: (shiftBand: HireShiftBand) => void;
}) {
  const selectedTeam = teamPreferences.find((team) => team.team_id === selectedTeamId);
  const shiftBandOptions = getHireShiftBandOptions(selectedTeam?.shift_types);
  const openSeats = getOpenTeamSlots(rosterTeams, selectedTeamId, selectedShiftBand);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-500">Team</p>
        <div className="space-y-1.5">
          {teamPreferences.map((preference) => (
            <label
              key={preference.team_id}
              className={choiceClassName}
            >
              <input
                type="radio"
                name="hire-team"
                value={preference.team_id}
                checked={selectedTeamId === preference.team_id}
                onChange={() => onTeamChange(preference.team_id)}
                className="h-4 w-4 accent-[#F4781B]"
              />
              <span className="font-medium">{preference.team_name}</span>
            </label>
          ))}
        </div>
      </div>

      {selectedTeam ? (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500">Shift band</p>
          {shiftBandOptions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {shiftBandOptions.map((shiftBand) => (
                <label
                  key={shiftBand}
                  className={`${choiceClassName} py-1.5`}
                >
                  <input
                    type="radio"
                    name="hire-shift"
                    value={shiftBand}
                    checked={selectedShiftBand === shiftBand}
                    onChange={() => onShiftChange(shiftBand)}
                    className="h-4 w-4 accent-[#F4781B]"
                  />
                  <span>{formatShiftTypeLabel(shiftBand)}</span>
                </label>
              ))}
            </div>
          ) : (
            <p className="text-xs text-amber-700">No shift bands available for this team.</p>
          )}
          {rosterLoading && rosterTeams.length === 0 ? (
            <p className="text-xs text-gray-500">Checking open seats…</p>
          ) : openSeats.length > 0 ? (
            <p className="text-xs text-gray-500">
              Open seats:{" "}
              <span className="font-mono font-semibold text-gray-800">
                {openSeats.map((slot) => slot.slot_code).join(", ")}
              </span>
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function CandidatePreviewCard({
  candidate,
  jobTitle,
  appliedAt,
  currentStatus,
}: {
  candidate: ApplicationActionCandidatePreview;
  jobTitle?: string | null;
  appliedAt?: string | null;
  currentStatus: ApplicationStatus;
}) {
  const initials = getInitials(candidate.name || "C");
  const location = formatCandidateLocation(candidate.city, candidate.state);
  const experience = formatExperienceCompact(
    candidate.experience,
    candidate.experienceMonths,
  );
  const eligibility = formatEligibilityLabel(candidate.workEligibility);
  const applied = formatAppliedDate(appliedAt);
  const role = candidate.jobTitle || jobTitle;
  const score = formatScoreDisplay(candidate.score, currentStatus);
  const statusTagline = getApplicationStatusTagline(currentStatus);

  return (
    <div className="rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50/90 to-white p-4">
      <div className="flex items-start gap-3">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-white ring-2 ring-orange-100">
          {candidate.profileImageUrl ? (
            <Image
              src={candidate.profileImageUrl}
              alt={candidate.name}
              width={56}
              height={56}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-bold text-[#F4781B]">
              {initials}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-base font-bold text-gray-900">
              {candidate.name}
            </p>
            <span className="inline-flex shrink-0 flex-col items-end gap-0.5">
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${getApplicationStatusBadgeClass(currentStatus)}`}
              >
                {getApplicationStatusDisplayLabel(currentStatus)}
              </span>
              {statusTagline ? (
                <span className="text-[10px] font-medium text-violet-700">
                  {statusTagline}
                </span>
              ) : null}
            </span>
          </div>
          {role ? (
            <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-gray-500">
              <Briefcase size={11} className="shrink-0 text-[#F4781B]" />
              <span className="truncate">
                {role}
                {candidate.department ? ` · ${candidate.department}` : ""}
              </span>
            </p>
          ) : null}

          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-gray-500">
            {location !== EMPTY_DISPLAY ? (
              <span className="inline-flex items-center gap-1">
                <MapPin size={11} className="text-green-500" />
                {location}
              </span>
            ) : null}
            {applied.short !== EMPTY_DISPLAY ? (
              <span title={applied.full || undefined}>Applied {applied.short}</span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-gray-700 ring-1 ring-gray-200">
          Exp {experience}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-orange-800 ring-1 ring-orange-100">
          <Star size={10} className="fill-[#F4781B] text-[#F4781B]" />
          Score {score}
        </span>
        {eligibility !== EMPTY_DISPLAY ? (
          <span className="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-gray-700 ring-1 ring-gray-200">
            {eligibility}
          </span>
        ) : null}
      </div>

      {candidate.id ? (
        <Link
          href={`/candidates/${candidate.id}`}
          className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#F4781B] hover:underline"
        >
          View profile
          <ArrowUpRight size={12} />
        </Link>
      ) : null}
    </div>
  );
}

export function ApplicationStatusActionModal({
  jobId,
  applicationId,
  candidate,
  jobTitle,
  appliedAt,
  currentStatus,
  aiInterviewEnabled,
  jobStatus,
  jobUrgency,
  open,
  teamPreferences = [],
  onClose,
  onSuccess,
}: ApplicationStatusActionModalProps) {
  const [selectedAction, setSelectedAction] = useState<ApplicationStatusAction | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [selectedShiftBand, setSelectedShiftBand] = useState("");
  const [hiredSeat, setHiredSeat] = useState<AssignedHireSeat | null>(null);
  const [hireConfirmed, setHireConfirmed] = useState(false);
  const hireRefreshStarted = useRef(false);

  const candidateName = candidate.name || "this candidate";
  const transitionOptions = useMemo(
    () => ({ jobStatus, jobUrgency }),
    [jobStatus, jobUrgency],
  );
  const availableActions = sortApplicationStatusActions(
    getApplicationStatusTransitions(
      currentStatus,
      aiInterviewEnabled,
      transitionOptions,
    ),
  );
  const hasTeamPreferences = teamPreferences.length > 0;
  const needsJobTeams = open && selectedAction === "HIRE" && !hasTeamPreferences;
  const needsRoster = open && selectedAction === "HIRE" && !hireConfirmed;
  const {
    schedule,
    isLoading: isScheduleLoading,
    error: scheduleError,
  } = useJobSchedule(jobId, needsJobTeams);
  const { team: roster, isLoading: isRosterLoading } = useJobTeam(
    jobId,
    { include_shifts: false, limit: 100, page: 1 },
    needsRoster,
  );

  const placementTeams = useMemo(() => {
    if (hasTeamPreferences) return teamPreferences;
    return getHirePlacementTeamsFromSchedule(schedule);
  }, [hasTeamPreferences, teamPreferences, schedule]);

  useEffect(() => {
    if (!open) {
      setSelectedAction(null);
      setSubmitError(null);
      setSelectedTeamId("");
      setSelectedShiftBand("");
      setHiredSeat(null);
      setHireConfirmed(false);
      hireRefreshStarted.current = false;
      return;
    }

    setSelectedAction(null);
    setSubmitError(null);
    setSelectedTeamId("");
    setSelectedShiftBand("");
    setHiredSeat(null);
    setHireConfirmed(false);
    hireRefreshStarted.current = false;
  }, [open, applicationId]);

  useEffect(() => {
    if (!open || selectedAction !== "HIRE") return;

    const firstTeam = placementTeams[0];
    setSelectedTeamId(firstTeam?.team_id ?? "");
    setSelectedShiftBand(getHireShiftBandOptions(firstTeam?.shift_types)[0] ?? "");
  }, [open, selectedAction, placementTeams]);

  const handleTeamChange = (teamId: string) => {
    setSelectedTeamId(teamId);
    const team = placementTeams.find((preference) => preference.team_id === teamId);
    setSelectedShiftBand(getHireShiftBandOptions(team?.shift_types)[0] ?? "");
  };

  const handleConfirm = async () => {
    if (!selectedAction) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (selectedAction === "HIRE") {
        const shiftType = getHireShiftBandOptions([selectedShiftBand])[0];
        if (!selectedTeamId || !shiftType) {
          throw new Error("Select a team and shift band to hire onto.");
        }

        await updateApplicationStatus(jobId, applicationId, {
          status: "HIRE",
          hire_placement: {
            team_id: selectedTeamId,
            shift_type: shiftType,
          },
        });
        setHiredSeat(
          await loadAssignedHireSeat(jobId, {
            applicationId,
            candidateId: candidate.id,
            teamId: selectedTeamId,
            shiftType,
          }),
        );
        setHireConfirmed(true);
        return;
      } else {
        await updateApplicationStatus(jobId, applicationId, { status: selectedAction });
      }

      onSuccess();
      onClose();
    } catch (error) {
      setSubmitError(resolveApplicationActionError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  const actionLabel = selectedAction
    ? getApplicationStatusActionLabel(selectedAction)
    : null;
  const hireReady =
    selectedTeamId.length > 0 &&
    selectedShiftBand.length > 0 &&
    placementTeams.length > 0 &&
    !(needsJobTeams && (isScheduleLoading || Boolean(scheduleError)));
  const canSubmitHire = selectedAction !== "HIRE" || hireReady;

  const finishConfirmedHire = () => {
    if (hireRefreshStarted.current) return;
    hireRefreshStarted.current = true;
    onSuccess();
    onClose();
  };

  const hireDescription = hasTeamPreferences
    ? `Select a team and shift from ${candidateName}'s preferences.`
    : `Select a job team and shift band to place ${candidateName}.`;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen || isSubmitting) return;
        if (hireConfirmed) {
          finishConfirmedHire();
          return;
        }
        onClose();
      }}
    >
      <DialogContent className="gap-4 overflow-y-auto sm:max-w-lg">
        <DialogHeader className="space-y-1 pr-8 text-left">
          <DialogTitle>
            {hireConfirmed
              ? `Hired ${candidateName}`
              : selectedAction
                ? selectedAction === "HIRE"
                  ? `Hire ${candidateName}`
                  : `${actionLabel} ${candidateName}`
                : "Application actions"}
          </DialogTitle>
          <DialogDescription>
            {hireConfirmed
              ? hiredSeat
                ? `Assigned seat ${hiredSeat.slotCode}.`
                : "Their seat is on the team roster."
              : selectedAction
                ? selectedAction === "HIRE"
                  ? hireDescription
                  : getApplicationStatusActionDescription(selectedAction, candidateName)
                : getApplicationStatusChooserDescription(availableActions)}
          </DialogDescription>
        </DialogHeader>

        <CandidatePreviewCard
          candidate={candidate}
          jobTitle={jobTitle}
          appliedAt={appliedAt}
          currentStatus={currentStatus}
        />

        {hireConfirmed ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-900">
            <p className="font-semibold">{candidateName} is hired.</p>
            {hiredSeat ? (
              <p className="mt-1">
                Seat{" "}
                <span className="font-mono font-semibold">{hiredSeat.slotCode}</span>
                {hiredSeat.teamName ? ` · ${hiredSeat.teamName}` : ""}
                {hiredSeat.shiftType
                  ? ` · ${formatShiftTypeLabel(hiredSeat.shiftType)}`
                  : ""}
              </p>
            ) : (
              <p className="mt-1">Open the team tab to see the assigned seat.</p>
            )}
          </div>
        ) : !selectedAction ? (
          <div className={getApplicationStatusActionGridClass(availableActions.length)}>
            {availableActions.map((action) => {
              const Icon = getActionIcon(action);
              return (
                <button
                  key={action}
                  type="button"
                  onClick={() => {
                    setSubmitError(null);
                    setSelectedAction(action);
                  }}
                  className={getApplicationStatusActionClassName(action)}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      action === "HIRE"
                        ? "bg-white/20"
                        : action === "REJECTED"
                          ? "bg-red-100"
                          : action === "SHORTLISTED"
                            ? "bg-orange-100"
                            : "bg-gray-100"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                  </span>
                  <span className="min-w-0 flex-1 text-left">
                    <span className="block text-sm font-semibold leading-tight">
                      {getApplicationStatusActionLabel(action)}
                    </span>
                    <span
                      className={`mt-0.5 block text-[11px] font-normal leading-tight ${
                        action === "HIRE" ? "text-white/80" : "text-current opacity-70"
                      }`}
                    >
                      {getApplicationStatusActionHint(action)}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        ) : selectedAction === "HIRE" ? (
          needsJobTeams && isScheduleLoading ? (
            <div className="flex items-center gap-2 py-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading job teams…
            </div>
          ) : needsJobTeams && scheduleError ? (
            <p className="text-sm text-red-600">{scheduleError}</p>
          ) : placementTeams.length > 0 ? (
            <HirePlacementForm
              teamPreferences={placementTeams}
              rosterTeams={roster?.teams ?? []}
              rosterLoading={isRosterLoading}
              selectedTeamId={selectedTeamId}
              selectedShiftBand={selectedShiftBand}
              onTeamChange={handleTeamChange}
              onShiftChange={setSelectedShiftBand}
            />
          ) : (
            <p className="text-sm text-amber-700">
              This job has no teams with a working Morning, Evening, or Night shift.
              Hire cannot be completed until a valid placement is available.
            </p>
          )
        ) : null}

        {submitError ? (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium leading-snug text-red-700"
          >
            {submitError}
          </p>
        ) : null}

        {hireConfirmed ? (
          <DialogFooter className="gap-2 sm:justify-end">
            <button
              type="button"
              onClick={finishConfirmedHire}
              className="inline-flex items-center justify-center rounded-lg bg-[#F4781B] px-3 py-2 text-sm font-semibold text-white hover:bg-[#e06a10]"
            >
              Done
            </button>
          </DialogFooter>
        ) : selectedAction ? (
          <DialogFooter className="gap-2 sm:justify-end">
            <button
              type="button"
              onClick={() => {
                setSubmitError(null);
                setSelectedAction(null);
              }}
              disabled={isSubmitting}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isSubmitting || !canSubmitHire}
              className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-white disabled:opacity-50 ${
                selectedAction === "REJECTED"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-[#F4781B] hover:bg-[#e06a10]"
              }`}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {selectedAction === "HIRE" ? "Hire" : actionLabel}
            </button>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
