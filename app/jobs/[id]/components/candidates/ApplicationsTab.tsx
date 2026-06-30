"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { LayoutGrid, List, MoreVertical } from "lucide-react";
import { DataTable } from "@/components/table/DataTable";
import { PaginationFooter } from "@/components/table/PaginationFooter";
import { useJobApplications } from "@/hooks/useJobData";
import type { ApplicationStatus, ApplicationTeamPreference } from "@/types";
import { EmptyState, LoadingRows } from "../shared/JobDetailDataView";
import { formatLabel } from "../shared/job-detail-helpers";
import { ApplicationStatusActionModal } from "./ApplicationStatusActionModal";
import {
  EMPTY_DISPLAY,
  formatAppliedDate,
  formatCandidateLocation,
  formatEligibilityLabel,
  formatExperienceCompact,
  formatScoreDisplay,
  getApplicationStatusBadgeClass,
  getShiftBadgeClass,
  getShiftMeta,
} from "./applications-table-helpers";
import {
  getApplicationFilterStatuses,
  getApplicationStatusTransitions,
} from "./application-status-transitions";

const APPLICATION_LIMIT = 10;
const APPLICATION_TABLE_HEADERS = [
  "Candidate",
  "Experience",
  "Score",
  "Preferences",
  "Status",
  "Applied",
  "⋮",
];

const TABLE_COLUMN_CLASS_NAMES = [
  "min-w-[280px] w-[38%] !text-left !text-xs !font-medium !text-gray-500",
  "w-[10%] !text-center !text-xs !font-medium !text-gray-500",
  "w-[8%] !text-center !text-xs !font-medium !text-gray-500",
  "min-w-[160px] w-[24%] !text-left !text-xs !font-medium !text-gray-500",
  "w-[10%] !text-center !text-xs !font-medium !text-gray-500",
  "w-[8%] !text-center !text-xs !font-medium !text-gray-500",
  "w-[2%] !text-right !text-xs !font-medium !text-gray-500",
];

type ApplicationsTabProps = {
  jobId: string;
  aiInterviewEnabled?: boolean;
};

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

  return (
    <div className="flex items-center gap-3 min-w-0">
      <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-orange-50 ring-2 ring-orange-100">
        {profileImageUrl ? (
          <Image
            src={profileImageUrl}
            alt={candidateName}
            width={32}
            height={32}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[11px] font-semibold text-[#F4781B]">
            {initials}
          </div>
        )}
      </div>
      <div className="min-w-0 space-y-0.5">
        <p className="truncate text-sm font-medium text-gray-900">
          {candidateName}
        </p>
        <p className="truncate text-xs text-gray-500" title={citizenship}>
          {citizenship}
        </p>
        <p className="truncate text-xs text-gray-400" title={location}>
          {location}
        </p>
      </div>
    </div>
  );
}

function TeamShiftPreferencesCell({
  preferences,
}: {
  preferences?: ApplicationTeamPreference[];
}) {
  if (!preferences?.length) {
    return <span className="text-xs text-gray-400">{EMPTY_DISPLAY}</span>;
  }

  return (
    <div className="flex flex-col gap-2">
      {preferences.map((preference) => (
        <div
          key={preference.team_id}
          className="flex min-w-0 flex-wrap items-center gap-2"
        >
          <span className="inline-flex shrink-0 items-center rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-700">
            {preference.team_name || EMPTY_DISPLAY}
          </span>
          {preference.shift_types?.length ? (
            <div className="flex min-w-0 flex-wrap gap-1">
              {preference.shift_types.map((shift) => {
                const meta = getShiftMeta(shift);
                return (
                  <span
                    key={`${preference.team_id}-${shift}`}
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap ${getShiftBadgeClass(shift)}`}
                  >
                    {meta.label}
                  </span>
                );
              })}
            </div>
          ) : (
            <span className="text-xs text-gray-400">{EMPTY_DISPLAY}</span>
          )}
        </div>
      ))}
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
    if (variant === "card") {
      return (
        <div className="flex w-full items-center justify-center rounded-xl border border-dashed border-gray-200 py-2.5 text-sm text-gray-300">
          {EMPTY_DISPLAY}
        </div>
      );
    }
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
        className="w-full rounded-xl bg-[#F4781B] py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#e56f18] disabled:opacity-50"
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
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-[#F4781B] opacity-0 transition-all group-hover:opacity-100 hover:bg-[#F4781B] hover:text-white disabled:opacity-50"
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

  return (
    <div className="flex min-w-[300px] flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:border-gray-200 hover:shadow-md">
      <div className="flex items-center justify-between gap-2 px-4 pt-4">
        <ApplicationStatusBadge status={application.status} />
        <span
          className="text-xs text-gray-400"
          title={appliedDate.full || undefined}
        >
          Applied {appliedDate.short}
        </span>
      </div>

      <div className="flex gap-3 px-4 pt-4">
        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-orange-50 ring-2 ring-orange-100">
          {candidate?.profile_image_url ? (
            <Image
              src={candidate.profile_image_url}
              alt={candidateName}
              width={44}
              height={44}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-[#F4781B]">
              {initials}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-0.5">
          <p className="truncate text-sm font-medium text-gray-900">{candidateName}</p>
          <p className="truncate text-xs text-gray-500">{citizenship}</p>
          <p className="truncate text-xs text-gray-400">{location}</p>
        </div>
      </div>

      <div className="mx-4 mt-4 grid grid-cols-2 gap-3 border-y border-gray-100 py-3">
        <div className="rounded-lg bg-slate-50 px-3 py-2">
          <p className="text-xs text-slate-500">Experience</p>
          <p className="mt-0.5 text-sm font-semibold text-slate-800">{experience}</p>
        </div>
        <div className="rounded-lg bg-orange-50 px-3 py-2">
          <p className="text-xs text-orange-600/80">Score</p>
          <p className="mt-0.5 text-sm font-semibold text-orange-800">
            {formatScoreDisplay(score, application.status)}
          </p>
        </div>
      </div>

      <div className="px-4 py-3">
        <p className="mb-2 text-xs text-gray-400">Preferences</p>
        <TeamShiftPreferencesCell preferences={application.team_preferences} />
      </div>

      <div className="px-4 pb-4">
        <ApplicationActionsCell
          variant="card"
          status={application.status}
          aiInterviewEnabled={aiInterviewEnabled}
          isUpdating={isUpdating}
          onOpen={onOpenActions}
        />
      </div>
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

      {isLoading ? (
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
          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
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
                  <td className="px-4 py-4 align-middle min-w-[280px] w-[38%]">
                    <CandidatePrimaryCell
                      candidateName={candidateName}
                      initials={initials}
                      profileImageUrl={candidate?.profile_image_url}
                      city={candidate?.city}
                      state={candidate?.state}
                      eligibility={candidate?.work_eligibility}
                    />
                  </td>
                  <td className="px-4 py-4 align-middle text-center text-sm text-gray-600 whitespace-nowrap">
                    {formatExperienceCompact(
                      candidate?.experience,
                      candidate?.experience_months,
                    )}
                  </td>
                  <td className="px-4 py-4 align-middle text-center text-sm text-gray-600 tabular-nums whitespace-nowrap">
                    {formatScoreDisplay(score, application.status)}
                  </td>
                  <td className="px-4 py-4 align-middle min-w-[160px] w-[24%]">
                    <TeamShiftPreferencesCell preferences={application.team_preferences} />
                  </td>
                  <td className="px-4 py-4 align-middle text-center">
                    <ApplicationStatusBadge status={application.status} />
                  </td>
                  <td
                    className="px-4 py-4 align-middle text-center text-sm text-gray-500 whitespace-nowrap tabular-nums"
                    title={appliedDate.full || undefined}
                  >
                    {appliedDate.short}
                  </td>
                  <td className="px-3 py-4 align-middle text-right">
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
