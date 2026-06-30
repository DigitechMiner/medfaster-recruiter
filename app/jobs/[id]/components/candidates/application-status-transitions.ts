import type { ApplicationStatus, HireShiftBand } from "@/types";
import { formatLabel } from "../shared/job-detail-helpers";

const HIRE_SHIFT_BANDS: HireShiftBand[] = ["MORNING", "EVENING", "NIGHT"];

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

export function getApplicationFilterStatuses(
  aiInterviewEnabled: boolean,
): ApplicationStatus[] {
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

export function getApplicationStatusTransitions(
  currentStatus: ApplicationStatus,
  aiInterviewEnabled: boolean,
): ApplicationStatusAction[] {
  const transitions = APPLICATION_STATUS_TRANSITIONS[currentStatus] ?? [];

  const filtered = aiInterviewEnabled
    ? transitions
    : transitions.filter((status) => !INTERVIEW_TRANSITION_STATUSES.has(status));

  return filtered as ApplicationStatusAction[];
}

export function getApplicationStatusActionLabel(status: ApplicationStatusAction): string {
  switch (status) {
    case "SHORTLISTED":
      return "Shortlist";
    case "INTERVIEWING":
      return "Interviewing";
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
      return `Mark ${candidateName} as currently interviewing for this job.`;
    case "INTERVIEWED":
      return `Mark ${candidateName} as interviewed for this job.`;
    case "REJECTED":
      return `This will mark ${candidateName}'s application as rejected for this job.`;
    case "HIRE":
      return "Select the team and shift band from the candidate's preferences.";
    default:
      return "";
  }
}

export function getApplicationStatusActionClassName(
  action: ApplicationStatusAction,
): string {
  const base =
    "w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition-colors disabled:opacity-50";

  switch (action) {
    case "HIRE":
      return `${base} bg-[#F4781B] text-white hover:bg-[#e06a10]`;
    case "REJECTED":
      return `${base} text-red-600 hover:bg-red-50`;
    case "SHORTLISTED":
      return `${base} border border-[#F4781B] text-[#F4781B] hover:bg-orange-50`;
    default:
      return `${base} border border-gray-200 text-gray-700 hover:bg-gray-50`;
  }
}
