"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { LayoutGrid, List, MoreVertical, RefreshCw } from "lucide-react";
import { DataTable } from "@/components/table/DataTable";
import { PaginationFooter } from "@/components/table/PaginationFooter";
import { useJobApplications } from "@/hooks/useJobData";
import type { ApplicationStatus, ApplicationTeamPreference } from "@/types";
import { EmptyState, LoadingRows } from "../shared/JobDetailDataView";
import { formatLabel } from "../shared/job-detail-helpers";
import { ApplicationStatusActionModal } from "./ApplicationStatusActionModal";
import {
  EMPTY_DISPLAY,
  SHIFT_LEGEND_ITEMS,
  formatAppliedDate,
  formatCandidateLocation,
  formatEligibilityLabel,
  formatExperienceCompact,
  formatScoreDisplay,
  getApplicationStatusBadgeClass,
  getShiftDotClass,
  getShiftMeta,
} from "./applications-table-helpers";
import {
  getApplicationFilterStatuses,
  getApplicationStatusTransitions,
} from "./application-status-transitions";

const APPLICATION_LIMIT = 10;
const REFRESH_COOLDOWN_MS = 1000;

const TABLE_COLUMN_CLASS_NAMES = [
  "min-w-[200px] w-[26%] !text-left !text-xs !font-medium !text-gray-500",
  "w-[9%] !text-center !text-xs !font-medium !text-gray-500",
  "w-[8%] !text-center !text-xs !font-medium !text-gray-500",
  "min-w-[260px] w-[34%] !text-left !text-xs !font-medium !text-gray-500 !whitespace-normal",
  "w-[11%] !text-center !text-xs !font-medium !text-gray-500",
  "w-[9%] !text-center !text-xs !font-medium !text-gray-500",
  "w-[3%] !text-right !text-xs !font-medium !text-gray-500",
];

type ApplicationsTabProps = {
  jobId: string;
  aiInterviewEnabled?: boolean;
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

function ApplicationStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${getApplicationStatusBadgeClass(status)}`}
    >
      {formatLabel(status)}
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

function ApplicationActionsCell({
  status,
  aiInterviewEnabled,
  isUpdating,
  onOpen,
  variant = "table",
}: {
  status: ApplicationStatus;
  aiInterviewEnabled: boolean;
  isUpdating?: boolean;
  onOpen: () => void;
  variant?: "table" | "card";
}) {
  const hasActions =
    getApplicationStatusTransitions(status, aiInterviewEnabled).length > 0;
  if (!hasActions) {
    if (variant === "card") return null;
    return <span className="text-sm text-gray-300">{EMPTY_DISPLAY}</span>;
  }

  if (variant === "card") {
    return (
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
    );
  }

  return (
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
  team_preferences?: ApplicationTeamPreference[];
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
  isUpdating,
  onOpenActions,
}: {
  application: ApplicationGridCardData;
  aiInterviewEnabled: boolean;
  isUpdating: boolean;
  onOpenActions: () => void;
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
  const score =
    candidate?.job_interview_score ?? candidate?.best_ai_interview_score;
  const appliedDate = formatAppliedDate(application.created_at);
  const metaParts = [citizenship, location].filter(
    (part) => part && part !== EMPTY_DISPLAY,
  );
  const meta = metaParts.join(" · ");
  const hasActions =
    getApplicationStatusTransitions(application.status, aiInterviewEnabled)
      .length > 0;
  const hasPreferences = Boolean(application.team_preferences?.length);

  return (
    <div className="flex min-w-[300px] flex-col gap-3 rounded-xl border border-gray-100 bg-white p-3.5 shadow-sm transition-all hover:border-gray-200 hover:shadow-md">
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
          <ApplicationStatusBadge status={application.status} />
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
        <div className="flex items-center gap-1.5 rounded-md bg-orange-50 px-2 py-1">
          <span className="text-orange-500/80">Score</span>
          <span className="font-semibold text-orange-800">
            {formatScoreDisplay(score, application.status)}
          </span>
        </div>
      </div>

      {hasPreferences ? (
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

      {hasActions ? (
        <ApplicationActionsCell
          variant="card"
          status={application.status}
          aiInterviewEnabled={aiInterviewEnabled}
          isUpdating={isUpdating}
          onOpen={onOpenActions}
        />
      ) : null}
    </div>
  );
}

export function ApplicationsTab({
  jobId,
  aiInterviewEnabled = false,
}: ApplicationsTabProps) {
  const [applicationPage, setApplicationPage] = useState(1);
  const [status, setStatus] = useState<ApplicationStatus | "ALL">("ALL");
  const [view, setView] = useState<"grid" | "list">("list");
  const [pendingApplication, setPendingApplication] = useState<{
    applicationId: string;
    candidateName: string;
    jobTitle?: string | null;
    currentStatus: ApplicationStatus;
    teamPreferences?: ApplicationTeamPreference[];
  } | null>(null);
  const [updatingApplicationId, setUpdatingApplicationId] = useState<string | null>(
    null,
  );
  const [isRefreshLocked, setIsRefreshLocked] = useState(false);
  const isRefreshLockedRef = useRef(false);
  const refreshCooldownTimeoutRef = useRef<number | null>(null);
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
  const filterStatuses = useMemo(
    () => getApplicationFilterStatuses(aiInterviewEnabled),
    [aiInterviewEnabled],
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

    setPendingApplication({
      applicationId: application.id,
      candidateName,
      jobTitle: application.job?.job_title,
      currentStatus: application.status,
      teamPreferences: application.team_preferences,
    });
    setUpdatingApplicationId(application.id);
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
  };

  const renderPagination = () =>
    totalPages > 1 ? (
      <PaginationFooter
        page={applicationPage}
        totalItems={total}
        perPage={perPage}
        onPageChange={setApplicationPage}
        itemLabel="applications"
        className="flex items-center justify-between bg-[#FEF3E9] px-4 py-3 text-sm text-gray-600"
      />
    ) : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">Applications</p>
          <p className="text-xs text-gray-400">Filter candidates by application status.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshLocked || isLoading}
            aria-label="Refresh applications"
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
                {formatLabel(applicationStatus)}
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
        <EmptyState title="Unable to load applications" description={error} />
      ) : applicationItems.length === 0 ? (
        <EmptyState
          title="No applications yet"
          description="Candidates who apply for this job will appear here."
        />
      ) : view === "grid" ? (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3">
            {applicationItems.map((application) => (
              <ApplicationGridCard
                key={application.id}
                application={application}
                aiInterviewEnabled={aiInterviewEnabled}
                isUpdating={updatingApplicationId === application.id}
                onOpenActions={() => openActionsModal(application)}
              />
            ))}
          </div>
          {renderPagination()}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <DataTable
            headers={APPLICATION_TABLE_HEADERS}
            minWidthClassName="min-w-[960px]"
            headerRowClassName="border-b border-gray-100 bg-gray-50/60"
            tableClassName="text-sm"
            columnClassNames={TABLE_COLUMN_CLASS_NAMES}
          >
            {applicationItems.map((application) => {
              const candidate = application.candidate;
              const candidateName = getCandidateName(candidate);
              const initials = getCandidateInitials(candidateName);
              const score =
                candidate?.job_interview_score ?? candidate?.best_ai_interview_score;
              const appliedDate = formatAppliedDate(application.created_at);

              return (
                <tr
                  key={application.id}
                  className="group border-b border-gray-50 last:border-b-0 transition-colors hover:bg-gray-50/60"
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
                  <td className="px-4 py-3 align-middle text-center text-sm text-gray-600 tabular-nums whitespace-nowrap">
                    {formatScoreDisplay(score, application.status)}
                  </td>
                  <td className="px-4 py-3 align-middle min-w-[260px] w-[34%]">
                    <TeamShiftPreferencesCell
                      preferences={application.team_preferences}
                      compact
                    />
                  </td>
                  <td className="px-4 py-3 align-middle text-center">
                    <ApplicationStatusBadge status={application.status} />
                  </td>
                  <td
                    className="px-4 py-3 align-middle text-center text-sm text-gray-500 whitespace-nowrap tabular-nums"
                    title={appliedDate.full || undefined}
                  >
                    {appliedDate.short}
                  </td>
                  <td className="px-3 py-3 align-middle text-right">
                    <ApplicationActionsCell
                      status={application.status}
                      aiInterviewEnabled={aiInterviewEnabled}
                      isUpdating={updatingApplicationId === application.id}
                      onOpen={() => openActionsModal(application)}
                    />
                  </td>
                </tr>
              );
            })}
          </DataTable>
          {renderPagination()}
        </div>
      )}

      <ApplicationStatusActionModal
        jobId={jobId}
        applicationId={pendingApplication?.applicationId ?? ""}
        candidateName={pendingApplication?.candidateName ?? ""}
        jobTitle={pendingApplication?.jobTitle}
        currentStatus={pendingApplication?.currentStatus ?? "APPLIED"}
        aiInterviewEnabled={aiInterviewEnabled}
        open={pendingApplication != null}
        teamPreferences={pendingApplication?.teamPreferences}
        onClose={() => {
          setPendingApplication(null);
          setUpdatingApplicationId(null);
        }}
        onSuccess={handleActionSuccess}
      />
    </div>
  );
}
