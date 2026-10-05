import type {
  ApplicationStatus,
  ApplicationTeamPreference,
  HireShiftBand,
  JobScheduleData,
  JobScheduleRotationalTeam,
  JobStatus,
  JobTeamMember,
  JobTeamRosterTeam,
  JobTeamSlot,
  JobUrgency,
} from "@/types";
import { formatLabel } from "../shared/job-detail-helpers";

const HIRE_SHIFT_BANDS: HireShiftBand[] = ["MORNING", "EVENING", "NIGHT"];

export type ApplicationStatusTransitionOptions = {
  jobStatus?: JobStatus | string | null;
  jobUrgency?: JobUrgency | string | null;
};

const APPLICATION_STATUS_TRANSITIONS: Partial<
  Record<ApplicationStatus, ApplicationStatus[]>
> = {
  APPLIED: ["SHORTLISTED", "REJECTED", "INTERVIEWING", "HIRE"],
  SHORTLISTED: ["INTERVIEWING", "REJECTED", "HIRE"],
  INTERVIEWING: ["INTERVIEWED", "REJECTED", "HIRE"],
  INTERVIEWED: ["REJECTED", "HIRE"],
  HIRE: [],
  CANCELLED: [],
  REJECTED: [],
  ACCEPTED: [],
  WITHDRAWN: [],
};

const INTERVIEW_TRANSITION_STATUSES = new Set<ApplicationStatus>([
  "INTERVIEWING",
  "INTERVIEWED",
]);

const APPLICATION_FILTER_STATUSES: ApplicationStatus[] = [
  "APPLIED",
  "SHORTLISTED",
  "INTERVIEWING",
  "INTERVIEWED",
  "HIRE",
  "REJECTED",
  "ACCEPTED",
  "CANCELLED",
];

const INSTANT_APPLICATION_FILTER_STATUSES: ApplicationStatus[] = [
  "ACCEPTED",
  "APPLIED",
  "REJECTED",
  "WITHDRAWN",
  "CANCELLED",
];

export function isInstantJobUrgency(
  urgency?: JobUrgency | string | null,
): boolean {
  return String(urgency ?? "").toUpperCase() === "INSTANT";
}

export function getApplicationFilterStatuses(
  aiInterviewEnabled: boolean,
  options?: ApplicationStatusTransitionOptions,
): ApplicationStatus[] {
  if (isInstantJobUrgency(options?.jobUrgency)) {
    return INSTANT_APPLICATION_FILTER_STATUSES;
  }

  if (aiInterviewEnabled) return APPLICATION_FILTER_STATUSES;

  return APPLICATION_FILTER_STATUSES.filter(
    (status) => !INTERVIEW_TRANSITION_STATUSES.has(status),
  );
}

export type ApplicationStatusAction = Extract<
  ApplicationStatus,
  "SHORTLISTED" | "INTERVIEWING" | "INTERVIEWED" | "REJECTED" | "HIRE"
>;

export function getHireShiftBandOptions(shiftTypes?: string[]): HireShiftBand[] {
  if (!shiftTypes?.length) return [];

  const allowed = new Set<string>(HIRE_SHIFT_BANDS);
  const seen = new Set<string>();
  const options: HireShiftBand[] = [];

  for (const shift of shiftTypes) {
    const normalized = shift.trim().toUpperCase();
    if (!allowed.has(normalized) || seen.has(normalized)) continue;
    seen.add(normalized);
    options.push(normalized as HireShiftBand);
  }

  return options;
}

function workingShiftTypesForTeam(
  team: JobScheduleRotationalTeam,
  templates: JobScheduleData["shift_templates"],
): string[] {
  const fromCycles = (team.cycles ?? [])
    .filter((cycle) => cycle.is_working !== false)
    .map((cycle) => {
      if (cycle.shift_type?.trim()) return cycle.shift_type;
      if (cycle.shift_template_id) {
        const match = templates.find((template) => template.id === cycle.shift_template_id);
        if (match?.shift_type) return match.shift_type;
      }
      if (typeof cycle.shift_template_index === "number") {
        return templates[cycle.shift_template_index]?.shift_type ?? "";
      }
      return "";
    })
    .filter(Boolean);

  if (fromCycles.length) return fromCycles;
  return templates.map((template) => template.shift_type).filter(Boolean);
}

/** Job teams + working shift bands used when the application has no saved preferences. */
export function getHirePlacementTeamsFromSchedule(
  schedule: JobScheduleData | null | undefined,
): ApplicationTeamPreference[] {
  if (!schedule) return [];

  const templates = schedule.shift_templates ?? [];
  const teams = [...(schedule.rotational_teams ?? [])]
    .filter((team) => team.is_active !== false && Boolean(team.id))
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

  return teams
    .map((team) => ({
      team_id: team.id,
      team_name: team.team_name,
      shift_types: getHireShiftBandOptions(workingShiftTypesForTeam(team, templates)),
    }))
    .filter((team) => team.shift_types.length > 0);
}

export function canHireOnJob(options?: ApplicationStatusTransitionOptions): boolean {
  const status = String(options?.jobStatus ?? "").toUpperCase();
  const urgency = String(options?.jobUrgency ?? "NORMAL").toUpperCase();
  return status !== "CLOSED" && urgency !== "INSTANT";
}

export function getApplicationStatusTransitions(
  currentStatus: ApplicationStatus,
  aiInterviewEnabled: boolean,
  options?: ApplicationStatusTransitionOptions,
): ApplicationStatusAction[] {
  if (isInstantJobUrgency(options?.jobUrgency)) return [];

  const transitions = APPLICATION_STATUS_TRANSITIONS[currentStatus] ?? [];

  const withoutInterviews = aiInterviewEnabled
    ? transitions
    : transitions.filter((status) => !INTERVIEW_TRANSITION_STATUSES.has(status));

  const filtered = canHireOnJob(options)
    ? withoutInterviews
    : withoutInterviews.filter((status) => status !== "HIRE");

  return filtered as ApplicationStatusAction[];
}

/** User-facing name for an application status, including after it is updated. */
export function getApplicationStatusDisplayLabel(status: string): string {
  switch (status.trim().toUpperCase()) {
    case "INTERVIEWING":
      return "Take Interview";
    default:
      return formatLabel(status);
  }
}

/** Short line shown under the status when the application has been updated. */
export function getApplicationStatusTagline(status: string): string | null {
  switch (status.trim().toUpperCase()) {
    case "INTERVIEWING":
      return "To be conducted";
    default:
      return null;
  }
}

export function getApplicationStatusActionLabel(status: ApplicationStatusAction): string {
  switch (status) {
    case "SHORTLISTED":
      return "Shortlist";
    case "INTERVIEWING":
      return getApplicationStatusDisplayLabel(status);
    case "INTERVIEWED":
      return "Interviewed";
    case "REJECTED":
      return "Reject";
    case "HIRE":
      return "Hire";
    default:
      return formatLabel(status);
  }
}

export function getApplicationStatusActionDescription(
  status: ApplicationStatusAction,
  candidateName: string,
): string {
  switch (status) {
    case "SHORTLISTED":
      return `Move ${candidateName} to the shortlisted stage for this job.`;
    case "INTERVIEWING":
      return `Move ${candidateName} to Take Interview. To be conducted.`;
    case "INTERVIEWED":
      return `Mark ${candidateName} as interviewed for this job.`;
    case "REJECTED":
      return `This will mark ${candidateName}'s application as rejected for this job.`;
    case "HIRE":
      return "Select the team and shift band to place this candidate.";
    default:
      return "";
  }
}

export function getApplicationStatusActionHint(status: ApplicationStatusAction): string {
  switch (status) {
    case "SHORTLISTED":
      return "Add to shortlist";
    case "INTERVIEWING":
      return getApplicationStatusTagline(status) ?? "";
    case "INTERVIEWED":
      return "Interview complete";
    case "REJECTED":
      return "Decline application";
    case "HIRE":
      return "Place on a shift";
    default:
      return "";
  }
}

const ACTION_DISPLAY_ORDER: ApplicationStatusAction[] = [
  "SHORTLISTED",
  "INTERVIEWING",
  "INTERVIEWED",
  "HIRE",
  "REJECTED",
];

export function sortApplicationStatusActions(
  actions: ApplicationStatusAction[],
): ApplicationStatusAction[] {
  return [...actions].sort(
    (a, b) => ACTION_DISPLAY_ORDER.indexOf(a) - ACTION_DISPLAY_ORDER.indexOf(b),
  );
}

export function getApplicationStatusChooserDescription(
  actions: ApplicationStatusAction[],
): string {
  const labels = sortApplicationStatusActions(actions).map((action) =>
    getApplicationStatusActionLabel(action).toLowerCase(),
  );

  if (labels.length === 0) {
    return "No actions are available for this application.";
  }
  if (labels.length === 1) {
    return `Review this candidate, then choose ${labels[0]}.`;
  }
  if (labels.length === 2) {
    return `Review this candidate, then choose ${labels[0]} or ${labels[1]}.`;
  }

  const last = labels[labels.length - 1];
  return `Review this candidate, then choose ${labels.slice(0, -1).join(", ")}, or ${last}.`;
}

export type AssignedHireSeat = {
  slotCode: string;
  teamName: string;
  shiftType: string | null;
};

function memberMatchesHire(
  member: JobTeamMember,
  applicationId: string,
  candidateId?: string | null,
) {
  if (member.application_id && member.application_id === applicationId) return true;
  if (!candidateId) return false;
  return (
    member.candidate_id === candidateId ||
    member.candidate?.id === candidateId ||
    member.candidate?.user_id === candidateId
  );
}

/** Seat comes from the team roster. The hire response does not include it. */
export function findAssignedHireSeat(
  members: JobTeamMember[] | null | undefined,
  input: {
    applicationId: string;
    candidateId?: string | null;
    teamId?: string | null;
    shiftType?: string | null;
  },
): AssignedHireSeat | null {
  const member = (members ?? []).find((item) =>
    memberMatchesHire(item, input.applicationId, input.candidateId),
  );
  const seated = (member?.teams ?? []).filter((team) => Boolean(team.slot_code));
  if (seated.length === 0) return null;

  const teamId = input.teamId ?? "";
  const shiftType = (input.shiftType ?? "").toUpperCase();
  const match = [...seated].sort((left, right) => {
    const score = (team: (typeof seated)[number]) => {
      let value = 0;
      if (teamId && team.team_id === teamId) value += 2;
      if (shiftType && (team.slot_shift_type ?? "").toUpperCase() === shiftType) value += 1;
      return value;
    };
    return score(right) - score(left);
  })[0];

  if (!match?.slot_code) return null;
  return {
    slotCode: match.slot_code,
    teamName: match.team_name,
    shiftType: match.slot_shift_type ?? null,
  };
}

export function getOpenTeamSlots(
  teams: JobTeamRosterTeam[] | null | undefined,
  teamId: string,
  shiftType: string,
): JobTeamSlot[] {
  if (!teamId || !shiftType) return [];
  const team = teams?.find((item) => item.id === teamId);
  if (!Array.isArray(team?.slots)) return [];

  const band = shiftType.toUpperCase();
  return team.slots
    .filter(
      (slot) =>
        (slot.shift_type ?? "").toUpperCase() === band &&
        (slot.status ?? "").toUpperCase() === "OPEN",
    )
    .sort((left, right) => (left.slot_index ?? 0) - (right.slot_index ?? 0));
}

export function getApplicationStatusActionGridClass(
  count: number,
): string {
  if (count <= 1) return "grid grid-cols-1 gap-2";
  if (count === 3) return "grid grid-cols-3 gap-2";
  return "grid grid-cols-2 gap-2";
}

export function getApplicationStatusActionClassName(
  action: ApplicationStatusAction,
): string {
  const base =
    "flex h-full w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors disabled:opacity-50";

  switch (action) {
    case "HIRE":
      return `${base} bg-[#F4781B] text-white hover:bg-[#e06a10]`;
    case "REJECTED":
      return `${base} border border-red-200 bg-red-50 text-red-700 hover:bg-red-100`;
    case "SHORTLISTED":
      return `${base} border border-[#F4781B] bg-orange-50 text-[#F4781B] hover:bg-orange-100`;
    default:
      return `${base} border border-gray-200 bg-white text-gray-800 hover:bg-gray-50`;
  }
}
