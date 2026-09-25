"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ClipboardList, LayoutGrid, List, MoreVertical, RefreshCw } from "lucide-react";
import ScoreCard from "@/components/card/scorecard";
import { DataTable } from "@/components/table/DataTable";
import { PaginationFooter } from "@/components/table/PaginationFooter";
import { useJobApplications } from "@/hooks/useJobData";
import type { AiInterviewResultPayload } from "@/features/candidates/types";
import type {
  ApplicationStatus,
  ApplicationTeamPreference,
  JobStatus,
  JobUrgency,
} from "@/types";
import { EmptyState, LoadingRows } from "../shared/JobDetailDataView";
import { formatLabel } from "../shared/job-detail-helpers";
import {
  ApplicationStatusActionModal,
  type ApplicationActionCandidatePreview,
} from "./ApplicationStatusActionModal";
import { InterviewResultDetailsModal } from "./InterviewResultDetailsModal";
import {
  EMPTY_DISPLAY,
  SHIFT_LEGEND_ITEMS,
  formatAppliedDate,
  formatCandidateLocation,
  formatEligibilityLabel,
  formatExperienceCompact,
  formatScoreDisplay,
  getApplicationStatusBadgeClass,
  getInstantApplicationBadgeStatus,
  getInstantApplicationStatusLabel,
  getInstantResponseSourceLabel,
  getShiftDotClass,
  getShiftMeta,
} from "./applications-table-helpers";
import {
  type ApplicationStatusTransitionOptions,
  getApplicationFilterStatuses,
  getApplicationStatusTransitions,
  isInstantJobUrgency,
} from "./application-status-transitions";

const APPLICATION_LIMIT = 10;
const REFRESH_COOLDOWN_MS = 1000;

const TABLE_COLUMN_CLASS_NAMES = [
  "min-w-[200px] w-[25%] !text-left !text-xs !font-medium !text-gray-500",
  "w-[8%] !text-center !text-xs !font-medium !text-gray-500",
  "w-[12%] !text-center !text-xs !font-medium !text-gray-500",
  "min-w-[220px] w-[28%] !text-left !text-xs !font-medium !text-gray-500 !whitespace-normal",
  "w-[11%] !text-center !text-xs !font-medium !text-gray-500",
  "w-[9%] !text-center !text-xs !font-medium !text-gray-500",
  "w-[7%] !text-right !text-xs !font-medium !text-gray-500",
];

const INSTANT_TABLE_COLUMN_CLASS_NAMES = [
  "min-w-[220px] w-[32%] !text-left !text-xs !font-medium !text-gray-500",
  "w-[12%] !text-center !text-xs !font-medium !text-gray-500",
  "w-[16%] !text-center !text-xs !font-medium !text-gray-500",
  "w-[20%] !text-center !text-xs !font-medium !text-gray-500",
  "w-[20%] !text-center !text-xs !font-medium !text-gray-500",
];

type ApplicationsTabProps = {
  jobId: string;
  aiInterviewEnabled?: boolean;
  jobStatus?: JobStatus | string | null;
  jobUrgency?: JobUrgency | string | null;
  onApplicationUpdated?: () => void;
};

function PreferencesHeader() {
  return (
    <div className="flex flex-col gap-1.5">
      <span>Preferences</span>
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
        {SHIFT_LEGEND_ITEMS.map((item) => (
          <span
            key={item.key}
            className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-400"
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${getShiftDotClass(item.key)}`}
              aria-hidden
            />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}

const APPLICATION_TABLE_HEADERS = [
  "Candidate",
  "Experience",
  "Score",
  <PreferencesHeader key="preferences" />,
  "Status",
  "Applied",
  "⋮",
];

const INSTANT_TABLE_HEADERS = [
  "Candidate",
  "Experience",
  "Source",
  "Status",
  "Responded",
];

function ApplicationStatusBadge({
  status,
  isInstant = false,
}: {
  status: string;
  isInstant?: boolean;
}) {
  const badgeStatus = isInstant
    ? getInstantApplicationBadgeStatus(status)
    : status;
  const isAccepted =
    isInstant && ["ACCEPTED", "HIRE"].includes(status.toUpperCase());

  return (
    <span className="inline-flex flex-col items-center gap-0.5">
      <span
        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${getApplicationStatusBadgeClass(badgeStatus)}`}
      >
        {isInstant ? getInstantApplicationStatusLabel(status) : formatLabel(status)}
      </span>
      {isAccepted ? (
        <span className="text-[10px] font-medium text-emerald-700">
          Assigned to all shifts
        </span>
      ) : null}
    </span>
  );
}

function CandidatePrimaryCell({
  candidateName,
  initials,
  profileImageUrl,
  city,
  state,
  eligibility,
}: {
  candidateName: string;
  initials: string;
  profileImageUrl?: string | null;
  city?: string | null;
  state?: string | null;
  eligibility?: string | null;
}) {
  const citizenship = formatEligibilityLabel(eligibility);
  const location = formatCandidateLocation(city, state);
  const metaParts = [citizenship, location].filter(
    (part) => part && part !== EMPTY_DISPLAY,
  );
  const meta = metaParts.join(" · ");

  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-orange-50 ring-1 ring-orange-100">
        {profileImageUrl ? (
          <Image
            src={profileImageUrl}
            alt={candidateName}
            width={32}
            height={32}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-[#F4781B]">
            {initials}
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-gray-900">
          {candidateName}
        </p>
        {meta ? (
          <p className="truncate text-[11px] text-gray-400" title={meta}>
            {meta}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function TeamShiftPreferencesCell({
  preferences,
  compact = false,
}: {
  preferences?: ApplicationTeamPreference[];
  compact?: boolean;
}) {
  if (!preferences?.length) {
    return <span className="text-xs text-gray-400">{EMPTY_DISPLAY}</span>;
  }

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {preferences.map((preference) => {
          const shifts = preference.shift_types ?? [];
          const shiftLabels = shifts
            .map((shift) => getShiftMeta(shift).label)
            .join(", ");
          const title = [
            preference.team_name || "Team",
            shiftLabels || null,
          ]
            .filter(Boolean)
            .join(" · ");

          return (
            <div
              key={preference.team_id}
              title={title}
              className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-gray-200 bg-white py-1 pl-2 pr-1.5"
            >
              <span className="truncate text-[11px] font-semibold text-slate-700">
                {preference.team_name || EMPTY_DISPLAY}
              </span>
              {shifts.length > 0 ? (
                <span className="flex shrink-0 items-center gap-1">
                  {shifts.map((shift) => (
                    <span
                      key={`${preference.team_id}-${shift}`}
                      title={getShiftMeta(shift).label}
                      className={`h-2 w-2 rounded-full ${getShiftDotClass(shift)}`}
                      aria-label={getShiftMeta(shift).label}
                    />
                  ))}
                </span>
              ) : (
                <span className="pr-0.5 text-[10px] text-gray-400">
                  {EMPTY_DISPLAY}
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      {preferences.map((preference) => {
        const shifts = preference.shift_types ?? [];
        const title = [
          preference.team_name || "Team",
          shifts.map((shift) => getShiftMeta(shift).label).join(", ") || null,
        ]
          .filter(Boolean)
          .join(" · ");

        return (
          <div
            key={preference.team_id}
            title={title}
            className="inline-flex w-fit max-w-full items-center gap-1.5 rounded-lg border border-gray-200 bg-white py-1 pl-2 pr-1.5"
          >
            <span className="truncate text-xs font-medium text-slate-700">
              {preference.team_name || EMPTY_DISPLAY}
            </span>
            {shifts.length > 0 ? (
              <span className="flex shrink-0 items-center gap-1">
                {shifts.map((shift) => (
                  <span
                    key={`${preference.team_id}-${shift}`}
                    title={getShiftMeta(shift).label}
                    className={`h-2 w-2 rounded-full ${getShiftDotClass(shift)}`}
                    aria-label={getShiftMeta(shift).label}
                  />
                ))}
              </span>
            ) : (
              <span className="text-xs text-gray-400">{EMPTY_DISPLAY}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function getApplicationInterviewScore(
  status: ApplicationStatus,
  candidate?: {
    job_interview_score?: number | null;
    best_ai_interview_score?: number | null;
  } | null,
  interviewResult?: AiInterviewResultPayload | null,
): number | null | undefined {
  if (status === "INTERVIEWED") {
    return (
      candidate?.job_interview_score ??
      interviewResult?.overall_score ??
      candidate?.best_ai_interview_score
    );
  }
  return candidate?.job_interview_score ?? candidate?.best_ai_interview_score;
}

function ApplicationScoreCell({
  score,
  status,
  compact = false,
}: {
  score: number | null | undefined;
  status: ApplicationStatus;
  compact?: boolean;
}) {
  if (score == null) {
    return (
      <span className="text-sm text-gray-500">
        {formatScoreDisplay(score, status)}
      </span>
    );
  }

  return (
    <div className={`inline-flex ${compact ? "" : "justify-center"}`}>
      <ScoreCard
        score={score}
        maxScore={100}
        category="Score"
        className={compact ? "scale-95" : "mx-auto scale-90 sm:scale-100"}
      />
    </div>
  );
}

function ViewInterviewResultButton({
  onOpen,
  variant = "table",
}: {
  onOpen: () => void;
  variant?: "table" | "card";
}) {
  if (variant === "card") {
    return (
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onOpen();
        }}
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 py-2 text-sm font-semibold text-sky-800 transition-colors hover:border-sky-300 hover:bg-sky-100"
      >
        <ClipboardList size={15} />
        View interview result
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onOpen();
      }}
      aria-label="View interview result"
      title="View interview result"
      className="inline-flex h-8 items-center gap-1 rounded-lg border border-sky-200 bg-sky-50 px-2 text-xs font-semibold text-sky-800 shadow-sm transition-colors hover:border-sky-300 hover:bg-sky-100"
    >
      <ClipboardList size={14} />
      Result
    </button>
  );
}

function ApplicationActionsCell({
  status,
  aiInterviewEnabled,
  transitionOptions,
  isUpdating,
  interviewId,
  onOpen,
  onViewInterviewResult,
  variant = "table",
}: {
  status: ApplicationStatus;
  aiInterviewEnabled: boolean;
  transitionOptions?: ApplicationStatusTransitionOptions;
  isUpdating?: boolean;
  interviewId?: string | null;
  onOpen: () => void;
  onViewInterviewResult?: () => void;
  variant?: "table" | "card";
}) {
  const hasActions =
    getApplicationStatusTransitions(status, aiInterviewEnabled, transitionOptions)
      .length > 0;
  const canViewInterviewResult =
    status === "INTERVIEWED" &&
    Boolean(interviewId) &&
    Boolean(onViewInterviewResult);

  if (variant === "card") {
    if (!hasActions && !canViewInterviewResult) return null;
    return (
      <div className="flex flex-col gap-2">
        {canViewInterviewResult ? (
          <ViewInterviewResultButton
            variant="card"
            onOpen={onViewInterviewResult!}
          />
        ) : null}
        {hasActions ? (
          <button
            type="button"
            disabled={isUpdating}
            onClick={(event) => {
              event.stopPropagation();
              onOpen();
            }}
            className="w-full rounded-lg bg-[#F4781B] py-2 text-sm font-semibold text-white transition-colors hover:bg-[#e56f18] disabled:opacity-50"
          >
            Actions
          </button>
        ) : null}
      </div>
    );
  }

  if (!hasActions && !canViewInterviewResult) {
    return <span className="text-sm text-gray-300">{EMPTY_DISPLAY}</span>;
  }

  return (
    <div className="inline-flex items-center justify-end gap-1.5">
      {canViewInterviewResult ? (
        <ViewInterviewResultButton onOpen={onViewInterviewResult!} />
      ) : null}
      {hasActions ? (
        <button
          type="button"
          disabled={isUpdating}
          onClick={(event) => {
            event.stopPropagation();
            onOpen();
          }}
          aria-label="Application actions"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 shadow-sm transition-colors hover:border-[#F4781B] hover:bg-[#F4781B] hover:text-white disabled:opacity-50"
        >
          <MoreVertical size={16} />
        </button>
      ) : null}
    </div>
  );
}

function getCandidateName(
  candidate?: {
    full_name?: string | null;
    first_name?: string;
    last_name?: string | null;
  } | null,
) {
  if (!candidate) return EMPTY_DISPLAY;
  return (
    candidate.full_name ||
    [candidate.first_name, candidate.last_name].filter(Boolean).join(" ") ||
    EMPTY_DISPLAY
  );
}

function getCandidateInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

type ApplicationGridCardData = {
  status: ApplicationStatus;
  created_at: string;
  accepted_at?: string | null;
  response_source?: string | null;
  source?: string | null;
  broadcast_status?: string | null;
  team_preferences?: ApplicationTeamPreference[];
  interview_id?: string | null;
  interview_result?: AiInterviewResultPayload | null;
  candidate: {
    profile_image_url?: string | null;
    city?: string | null;
    state?: string | null;
    work_eligibility?: string | null;
    experience?: string | null;
    experience_months?: number | null;
    job_interview_score?: number | null;
    best_ai_interview_score?: number | null;
    full_name?: string | null;
    first_name?: string;
    last_name?: string | null;
  } | null;
};

function ApplicationGridCard({
  application,
  aiInterviewEnabled,
  transitionOptions,
  isInstant,
  isUpdating,
  onOpenActions,
  onViewInterviewResult,
  onNavigate,
}: {
  application: ApplicationGridCardData;
  aiInterviewEnabled: boolean;
  transitionOptions?: ApplicationStatusTransitionOptions;
  isInstant: boolean;
  isUpdating: boolean;
  onOpenActions: () => void;
  onViewInterviewResult?: () => void;
  onNavigate?: () => void;
}) {
  const candidate = application.candidate;
  const candidateName = getCandidateName(candidate);
  const initials = getCandidateInitials(candidateName);
  const citizenship = formatEligibilityLabel(candidate?.work_eligibility);
  const location = formatCandidateLocation(candidate?.city, candidate?.state);
  const experience = formatExperienceCompact(
    candidate?.experience,
    candidate?.experience_months,
  );
  const score = getApplicationInterviewScore(
    application.status,
    candidate,
    application.interview_result,
  );
  const appliedDate = formatAppliedDate(
    isInstant
      ? application.accepted_at ?? application.created_at
      : application.created_at,
  );
  const sourceLabel = getInstantResponseSourceLabel(application);
  const metaParts = [citizenship, location].filter(
    (part) => part && part !== EMPTY_DISPLAY,
  );
  const meta = metaParts.join(" · ");
  const hasActions =
    getApplicationStatusTransitions(
      application.status,
      aiInterviewEnabled,
      transitionOptions,
    ).length > 0;
  const canViewInterviewResult =
    application.status === "INTERVIEWED" && Boolean(application.interview_id);
  const hasPreferences = Boolean(application.team_preferences?.length);

  return (
    <div
      role={onNavigate ? "link" : undefined}
      tabIndex={onNavigate ? 0 : undefined}
      onClick={onNavigate}
      onKeyDown={
        onNavigate
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onNavigate();
              }
            }
          : undefined
      }
      className={`flex min-w-[300px] flex-col gap-3 rounded-xl border border-gray-100 bg-white p-3.5 shadow-sm transition-all hover:border-gray-200 hover:shadow-md${
        onNavigate ? " cursor-pointer" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-orange-50 ring-1 ring-orange-100">
            {candidate?.profile_image_url ? (
              <Image
                src={candidate.profile_image_url}
                alt={candidateName}
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
            <p className="truncate text-sm font-semibold text-gray-900">
              {candidateName}
            </p>
            {meta ? (
              <p className="truncate text-[11px] text-gray-400" title={meta}>
                {meta}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <ApplicationStatusBadge status={application.status} isInstant={isInstant} />
          <span
            className="text-[10px] text-gray-400"
            title={appliedDate.full || undefined}
          >
            {appliedDate.short}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 rounded-md bg-slate-50 px-2 py-1">
          <span className="text-slate-400">Exp</span>
          <span className="font-semibold text-slate-800">{experience}</span>
        </div>
        {isInstant ? (
          <div className="flex items-center gap-1.5 rounded-md bg-orange-50 px-2 py-1">
            <span className="text-orange-500/80">Source</span>
            <span className="font-semibold text-orange-800">{sourceLabel}</span>
          </div>
        ) : score != null ? (
          <ApplicationScoreCell
            score={score}
            status={application.status}
            compact
          />
        ) : (
          <div className="flex items-center gap-1.5 rounded-md bg-orange-50 px-2 py-1">
            <span className="text-orange-500/80">Score</span>
            <span className="font-semibold text-orange-800">
              {formatScoreDisplay(score, application.status)}
            </span>
          </div>
        )}
      </div>

      {!isInstant && hasPreferences ? (
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <span className="text-[11px] font-medium text-gray-400">
              Preferences
            </span>
            {SHIFT_LEGEND_ITEMS.map((item) => (
              <span
                key={item.key}
                className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-400"
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${getShiftDotClass(item.key)}`}
                  aria-hidden
                />
                {item.label}
              </span>
            ))}
          </div>
          <TeamShiftPreferencesCell
            preferences={application.team_preferences}
            compact
          />
        </div>
      ) : null}

      {!isInstant && (hasActions || canViewInterviewResult) ? (
        <ApplicationActionsCell
          variant="card"
          status={application.status}
          aiInterviewEnabled={aiInterviewEnabled}
          transitionOptions={transitionOptions}
          isUpdating={isUpdating}
          interviewId={application.interview_id}
          onOpen={onOpenActions}
          onViewInterviewResult={onViewInterviewResult}
        />
      ) : null}
    </div>
  );
}

export function ApplicationsTab({
  jobId,
  aiInterviewEnabled = false,
  jobStatus,
  jobUrgency,
  onApplicationUpdated,
}: ApplicationsTabProps) {
  const router = useRouter();
  const [applicationPage, setApplicationPage] = useState(1);
  const [status, setStatus] = useState<ApplicationStatus | "ALL">("ALL");
  const [view, setView] = useState<"grid" | "list">("list");
  const [pendingApplication, setPendingApplication] = useState<{
    applicationId: string;
    candidate: ApplicationActionCandidatePreview;
    jobTitle?: string | null;
    appliedAt?: string | null;
    currentStatus: ApplicationStatus;
    teamPreferences?: ApplicationTeamPreference[];
  } | null>(null);
  const [interviewDetailsTarget, setInterviewDetailsTarget] = useState<{
    interviewId: string;
    candidateName: string;
    candidateProfileImageUrl?: string | null;
    jobTitle?: string | null;
    overallScore?: number | null;
    interviewResult?: AiInterviewResultPayload | null;
  } | null>(null);
  const [updatingApplicationId, setUpdatingApplicationId] = useState<string | null>(
    null,
  );
  const [isRefreshLocked, setIsRefreshLocked] = useState(false);
  const isRefreshLockedRef = useRef(false);
  const refreshCooldownTimeoutRef = useRef<number | null>(null);

  const navigateToCandidate = useCallback(
    (candidateId?: string | null) => {
      if (!candidateId) return;
      router.push(`/candidates/${candidateId}`);
    },
    [router],
  );
  const {
    applications,
    isLoading,
    error,
    refetch,
  } = useJobApplications({
    job_id: jobId,
    status: status === "ALL" ? undefined : status,
    page: applicationPage,
    limit: APPLICATION_LIMIT,
  });
  const applicationItems = applications?.applications ?? [];
  const pagination = applications?.pagination;
  const total = pagination?.total ?? 0;
  const perPage = pagination?.limit ?? APPLICATION_LIMIT;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const isInstant = isInstantJobUrgency(jobUrgency);
  const transitionOptions = useMemo(
    () => ({ jobStatus, jobUrgency }),
    [jobStatus, jobUrgency],
  );
  const filterStatuses = useMemo(
    () => getApplicationFilterStatuses(aiInterviewEnabled, { jobUrgency }),
    [aiInterviewEnabled, jobUrgency],
  );

  useEffect(() => {
    if (status === "ALL") return;
    if (!filterStatuses.includes(status)) {
      setStatus("ALL");
      setApplicationPage(1);
    }
  }, [filterStatuses, status]);

  const openActionsModal = (application: (typeof applicationItems)[number]) => {
    const candidate = application.candidate;
    const candidateName = getCandidateName(candidate);
    const score = getApplicationInterviewScore(
      application.status,
      candidate,
      application.interview_result,
    );

    setPendingApplication({
      applicationId: application.id,
      candidate: {
        id: candidate?.id,
        name: candidateName,
        profileImageUrl: candidate?.profile_image_url,
        city: candidate?.city,
        state: candidate?.state,
        experience: candidate?.experience,
        experienceMonths: candidate?.experience_months,
        workEligibility: candidate?.work_eligibility,
        jobTitle: candidate?.job_title,
        department: candidate?.department,
        score,
      },
      jobTitle: application.job?.job_title,
      appliedAt: application.created_at,
      currentStatus: application.status,
      teamPreferences: application.team_preferences,
    });
    setUpdatingApplicationId(application.id);
  };

  const openInterviewResultModal = (
    application: (typeof applicationItems)[number],
  ) => {
    if (!application.interview_id) return;
    const candidate = application.candidate;
    setInterviewDetailsTarget({
      interviewId: application.interview_id,
      candidateName: getCandidateName(candidate),
      candidateProfileImageUrl: candidate?.profile_image_url,
      jobTitle: application.job?.job_title,
      overallScore: getApplicationInterviewScore(
        application.status,
        candidate,
        application.interview_result,
      ),
      interviewResult: application.interview_result ?? null,
    });
  };

  useEffect(() => {
    return () => {
      if (refreshCooldownTimeoutRef.current != null) {
        window.clearTimeout(refreshCooldownTimeoutRef.current);
      }
    };
  }, []);

  const handleRefresh = useCallback(() => {
    if (isRefreshLockedRef.current || isLoading) return;
    isRefreshLockedRef.current = true;
    setIsRefreshLocked(true);
    refetch();
    refreshCooldownTimeoutRef.current = window.setTimeout(() => {
      isRefreshLockedRef.current = false;
      setIsRefreshLocked(false);
      refreshCooldownTimeoutRef.current = null;
    }, REFRESH_COOLDOWN_MS);
  }, [isLoading, refetch]);

  const handleActionSuccess = () => {
    setUpdatingApplicationId(null);
    refetch();
    onApplicationUpdated?.();
  };

  const renderPagination = () =>
    totalPages > 1 ? (
      <PaginationFooter
        page={applicationPage}
        totalItems={total}
        perPage={perPage}
        onPageChange={setApplicationPage}
        itemLabel={isInstant ? "responses" : "applications"}
        className="flex items-center justify-between bg-[#FEF3E9] px-4 py-3 text-sm text-gray-600"
      />
    ) : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">
            {isInstant ? "Responses" : "Applications"}
          </p>
          <p className="text-xs text-gray-400">
            {isInstant
              ? "Accept assigns every shift immediately. Notification is only an invite — no recruiter approval."
              : "Filter candidates by application status."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshLocked || isLoading}
            aria-label={isInstant ? "Refresh responses" : "Refresh applications"}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-[#F4781B] hover:text-[#F4781B] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={isLoading ? "animate-spin" : undefined}
            />
            Refresh
          </button>
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as ApplicationStatus | "ALL");
              setApplicationPage(1);
            }}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 outline-none focus:border-[#F4781B]"
          >
            <option value="ALL">All Status</option>
            {filterStatuses.map((applicationStatus) => (
              <option key={applicationStatus} value={applicationStatus}>
              {isInstant
                ? getInstantApplicationStatusLabel(applicationStatus)
                : formatLabel(applicationStatus)}
              </option>
            ))}
          </select>
          <div className="flex overflow-hidden rounded-lg border border-gray-200 bg-white">
            <button
              type="button"
              onClick={() => setView("grid")}
              className={`p-2.5 transition-colors ${
                view === "grid" ? "bg-orange-50 text-[#F4781B]" : "text-gray-400 hover:bg-gray-50"
              }`}
              aria-pressed={view === "grid"}
              aria-label="Grid view"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              className={`p-2.5 transition-colors ${
                view === "list" ? "bg-orange-50 text-[#F4781B]" : "text-gray-400 hover:bg-gray-50"
              }`}
              aria-pressed={view === "list"}
              aria-label="List view"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {isLoading && applicationItems.length === 0 && !error ? (
        <LoadingRows />
      ) : error ? (
        <EmptyState
          title={isInstant ? "Unable to load responses" : "Unable to load applications"}
          description={error}
        />
      ) : applicationItems.length === 0 ? (
        <EmptyState
          title={isInstant ? "No responses yet" : "No applications yet"}
          description={
            isInstant
              ? "People who accept from a broadcast or the public feed appear here, already assigned to the shifts."
              : "Candidates who apply for this job will appear here."
          }
        />
      ) : view === "grid" ? (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3">
            {applicationItems.map((application) => (
              <ApplicationGridCard
                key={application.id}
                application={application}
                aiInterviewEnabled={aiInterviewEnabled}
                transitionOptions={transitionOptions}
                isInstant={isInstant}
                isUpdating={updatingApplicationId === application.id}
                onOpenActions={() => openActionsModal(application)}
                onViewInterviewResult={() =>
                  openInterviewResultModal(application)
                }
                onNavigate={() =>
                  navigateToCandidate(
                    application.candidate?.id ?? application.candidate_id,
                  )
                }
              />
            ))}
          </div>
          {renderPagination()}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <DataTable
            headers={isInstant ? INSTANT_TABLE_HEADERS : APPLICATION_TABLE_HEADERS}
            minWidthClassName={isInstant ? "min-w-[760px]" : "min-w-[960px]"}
            headerRowClassName="border-b border-gray-100 bg-gray-50/60"
            tableClassName="text-sm"
            columnClassNames={
              isInstant ? INSTANT_TABLE_COLUMN_CLASS_NAMES : TABLE_COLUMN_CLASS_NAMES
            }
          >
            {applicationItems.map((application) => {
              const candidate = application.candidate;
              const candidateId = candidate?.id ?? application.candidate_id;
              const candidateName = getCandidateName(candidate);
              const initials = getCandidateInitials(candidateName);
              const score = getApplicationInterviewScore(
                application.status,
                candidate,
                application.interview_result,
              );
              const appliedDate = formatAppliedDate(
                isInstant
                  ? application.accepted_at ?? application.created_at
                  : application.created_at,
              );

              return (
                <tr
                  key={application.id}
                  role={candidateId ? "link" : undefined}
                  tabIndex={candidateId ? 0 : undefined}
                  onClick={() => navigateToCandidate(candidateId)}
                  onKeyDown={(event) => {
                    if (!candidateId) return;
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      navigateToCandidate(candidateId);
                    }
                  }}
                  className={`group border-b border-gray-50 last:border-b-0 transition-colors hover:bg-gray-50/60${
                    candidateId ? " cursor-pointer" : ""
                  }`}
                >
                  <td className="px-4 py-3 align-middle min-w-[200px] w-[26%]">
                    <CandidatePrimaryCell
                      candidateName={candidateName}
                      initials={initials}
                      profileImageUrl={candidate?.profile_image_url}
                      city={candidate?.city}
                      state={candidate?.state}
                      eligibility={candidate?.work_eligibility}
                    />
                  </td>
                  <td className="px-4 py-3 align-middle text-center text-sm font-medium text-gray-700 whitespace-nowrap">
                    {formatExperienceCompact(
                      candidate?.experience,
                      candidate?.experience_months,
                    )}
                  </td>
                  {isInstant ? (
                    <td className="px-4 py-3 align-middle text-center text-sm text-gray-600 whitespace-nowrap">
                      {getInstantResponseSourceLabel(application)}
                    </td>
                  ) : (
                    <>
                      <td className="px-4 py-3 align-middle text-center whitespace-nowrap">
                        <ApplicationScoreCell
                          score={score}
                          status={application.status}
                        />
                      </td>
                      <td className="px-4 py-3 align-middle min-w-[260px] w-[34%]">
                        <TeamShiftPreferencesCell
                          preferences={application.team_preferences}
                          compact
                        />
                      </td>
                    </>
                  )}
                  <td className="px-4 py-3 align-middle text-center">
                    <ApplicationStatusBadge
                      status={application.status}
                      isInstant={isInstant}
                    />
                  </td>
                  <td
                    className="px-4 py-3 align-middle text-center text-sm text-gray-500 whitespace-nowrap tabular-nums"
                    title={appliedDate.full || undefined}
                  >
                    {appliedDate.short}
                  </td>
                  {isInstant ? null : (
                    <td className="px-3 py-3 align-middle text-right">
                      <ApplicationActionsCell
                        status={application.status}
                        aiInterviewEnabled={aiInterviewEnabled}
                        transitionOptions={transitionOptions}
                        isUpdating={updatingApplicationId === application.id}
                        interviewId={application.interview_id}
                        onOpen={() => openActionsModal(application)}
                        onViewInterviewResult={() =>
                          openInterviewResultModal(application)
                        }
                      />
                    </td>
                  )}
                </tr>
              );
            })}
          </DataTable>
          {renderPagination()}
        </div>
      )}

      {isInstant ? null : (
        <>
          <ApplicationStatusActionModal
            jobId={jobId}
            applicationId={pendingApplication?.applicationId ?? ""}
            candidate={
              pendingApplication?.candidate ?? {
                name: "",
              }
            }
            jobTitle={pendingApplication?.jobTitle}
            appliedAt={pendingApplication?.appliedAt}
            currentStatus={pendingApplication?.currentStatus ?? "APPLIED"}
            aiInterviewEnabled={aiInterviewEnabled}
            jobStatus={jobStatus}
            jobUrgency={jobUrgency}
            open={pendingApplication != null}
            teamPreferences={pendingApplication?.teamPreferences}
            onClose={() => {
              setPendingApplication(null);
              setUpdatingApplicationId(null);
            }}
            onSuccess={handleActionSuccess}
          />
          <InterviewResultDetailsModal
            open={interviewDetailsTarget != null}
            interviewId={interviewDetailsTarget?.interviewId ?? null}
            initialResult={interviewDetailsTarget?.interviewResult}
            candidateName={interviewDetailsTarget?.candidateName}
            candidateProfileImageUrl={
              interviewDetailsTarget?.candidateProfileImageUrl
            }
            jobTitle={interviewDetailsTarget?.jobTitle}
            overallScore={interviewDetailsTarget?.overallScore}
            onClose={() => setInterviewDetailsTarget(null)}
          />
        </>
      )}
    </div>
  );
}
