"use client";

import { useState, type ComponentProps } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  MapPin,
  UserRound,
} from "lucide-react";
import { axiosInstance, apiRequest } from "@/stores/api/api-client";
import { ENDPOINTS } from "@/stores/api/api-endpoints";
import { useAuthStore } from "@/stores/authStore";
import type { ActionType } from "@/types";
import type { CandidateDetailVM } from "@/types/view-models";
import type { JobApiItem, JobOption, JobsResponse } from "@/types/candidate-job-picker";
import { inviteCandidate } from "@/features/candidates";

const MODAL_CONFIG: Record<
  ActionType,
  {
    title: (name: string) => string;
    subtitle: string;
    jobPool: "regular" | "urgent" | "both";
    ctaLabel: string;
    successTitle: () => string;
    successBody: (name: string, jobTitle: string, jobId: string) => string;
    apiAction: "invite" | "shortlist" | "hire" | "schedule";
  }
> = {
  invite: {
    title: (name) => `Invite ${name} to a Job`,
    subtitle: "Select From Regular Job Openings",
    jobPool: "both",
    ctaLabel: "Send Jobs Invitation",
    successTitle: () => "Job Invitation Sent Successfully",
    successBody: (name, jobTitle, jobId) =>
      `${jobTitle} – Job ID: ${jobId} Invitation sent and waiting for ${name} response.`,
    apiAction: "invite",
  },
  schedule: {
    title: (name) => `Schedule a Interview for ${name}`,
    subtitle: "Select From Regular Jobs Openings",
    jobPool: "regular",
    ctaLabel: "Request Interview",
    successTitle: () => "Requested Interview For Selected Jobs",
    successBody: (name, jobTitle, jobId) =>
      `${jobTitle} – Job ID: ${jobId} Invitation sent and waiting for ${name}.`,
    apiAction: "schedule",
  },
  shortlist: {
    title: (name) => `Shortlist ${name} For a Job`,
    subtitle: "Select From Regular Job Openings",
    jobPool: "regular",
    ctaLabel: "Shortlist Candidate",
    successTitle: () => "Shortlisted Successfully",
    successBody: (name, jobTitle, jobId) =>
      `${name} have been shortlisted For ${jobTitle} Job ID:${jobId}`,
    apiAction: "shortlist",
  },
  hire: {
    title: (name) => `Hire ${name} Instantly For Urgent Shifts`,
    subtitle: "Select From Urgent Shift Openings",
    jobPool: "urgent",
    ctaLabel: "Send Shift Request",
    successTitle: () => "Shift Request Sent Successfully",
    successBody: (name, jobTitle, jobId) =>
      `${jobTitle} – Shift ID: ${jobId} Invitation sent and waiting for ${name}.`,
    apiAction: "hire",
  },
};

function useJobOptions(
  pool: "regular" | "urgent" | "both",
  organizationPhotoUrl: string | null | undefined,
  candidateId: string,
) {
  const types =
    pool === "both" ? ["REGULAR", "URGENT"] : pool === "urgent" ? ["URGENT"] : ["REGULAR"];
  const canFetch = Boolean(candidateId?.trim());
  const { data, isPending, isFetching } = useQuery({
    queryKey: ["job-options-modal", pool, candidateId],
    queryFn: () =>
      apiRequest<JobsResponse>(ENDPOINTS.JOBS_LIST, {
        method: "GET",
        params: {
          status: "OPEN",
          job_types: types.join(","),
          limit: 6,
          candidate_id: candidateId,
        },
      }),
    enabled: canFetch,
    /** Global default staleTime is 60s — without this, reopening the modal often skips the network entirely. */
    staleTime: 0,
    refetchOnMount: "always",
  });
  const isLoading = canFetch && (isPending || isFetching);
  const jobsUnavailableReason = !canFetch ? ("missing_candidate_id" as const) : null;
  const jobs: JobOption[] = (data?.data?.jobs ?? []).map((j: JobApiItem) => {
    const city = formatLabel(j.city);
    const province = formatLabel(j.province);

    return {
      id: j.id,
      title: j.job_title,
      status: j.status ?? "OPEN",
      type: j.job_urgency?.toLowerCase() === "urgent" ? "Urgent" : "Regular",
      interviewRequired: true,
      org_photo: organizationPhotoUrl ?? null,
      experience_range: j.years_of_experience ? `${j.years_of_experience}+ yrs` : null,
      department: j.department ?? null,
      job_type: j.job_type ?? null,
      location:
        city && province && city !== "—" && province !== "—"
          ? `${city}, ${province}`
          : city !== "—"
            ? city
            : province !== "—"
              ? province
              : null,
    };
  });
  return { jobs, isLoading, jobsUnavailableReason };
}

function formatLabel(value?: string | null, fallback = "—") {
  if (!value) return fallback;
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export type CandidateActionModalCandidate = Pick<CandidateDetailVM, "id" | "full_name">;

/** Invite-to-job flow only; same modal as list/grid pool and candidate detail. */
export function InviteCandidateToJobModal(
  props: Omit<ComponentProps<typeof CandidateActionModal>, "actionType">,
) {
  return <CandidateActionModal actionType="invite" {...props} />;
}

export function CandidateActionModal({
  actionType,
  candidate,
  applicationId,
  onClose,
  onActionSuccess,
}: {
  actionType: ActionType;
  candidate: CandidateActionModalCandidate;
  applicationId?: string;
  onClose: () => void;
  /** Called after the API succeeds (before the success screen). */
  onActionSuccess?: () => void;
}) {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const organizationPhotoUrl = useAuthStore((s) => s.recruiterProfile?.organization_photo_url);
  const config = MODAL_CONFIG[actionType];
  const { jobs, isLoading, jobsUnavailableReason } = useJobOptions(
    config.jobPool,
    organizationPhotoUrl,
    candidate.id,
  );
  const selectedJob = jobs.find((j) => j.id === selectedJobId);

  const handleCTA = async () => {
    if (!selectedJobId || !selectedJob) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      if (config.apiAction === "invite" || config.apiAction === "schedule") {
        await inviteCandidate({
          job_id: selectedJobId,
          candidate_id: candidate.id,
        });
      } else if (config.apiAction === "shortlist" || config.apiAction === "hire") {
        if (!applicationId) throw new Error("Application ID is required");
        await axiosInstance.patch(ENDPOINTS.JOB_APPLICATION_STATUS(applicationId), {
          status: config.apiAction === "shortlist" ? "SHORTLISTED" : "HIRE",
        });
      }
      onActionSuccess?.();
      setShowSuccess(true);
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        (err instanceof Error ? err.message : "Action failed. Please try again.");
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess && selectedJob) {
    return (
      <ActionSuccessModal
        title={config.successTitle()}
        body={config.successBody(candidate.full_name, selectedJob.title, selectedJob.id)}
        onDone={onClose}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-2 mb-5">
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <ArrowLeft size={18} />
          </button>
          <h2 className="text-base font-bold text-gray-900">
            {config.title(candidate.full_name)}
          </h2>
        </div>
        {jobsUnavailableReason === "missing_candidate_id" ? (
          <p className="text-sm text-red-600">Cannot load jobs: missing candidate id.</p>
        ) : isLoading ? (
          <p className="text-sm text-gray-400">Loading jobs...</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {jobs.map((job) => (
              <div
                key={job.id + job.type}
                onClick={() => setSelectedJobId(selectedJobId === job.id ? null : job.id)}
                className={`rounded-3xl p-5 flex flex-col gap-4 cursor-pointer border transition-colors ${
                  selectedJobId === job.id
                    ? "border-[#F4781B] shadow-sm bg-orange-50/20"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs text-gray-400 font-medium tracking-wide italic">Job ID: {job.id}</p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        job.type === "Urgent"
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {job.type}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      {formatLabel(job.status, "Open")}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  {job.org_photo ? (
                    <img
                      src={job.org_photo}
                      alt={`${job.title} organization`}
                      className="w-16 h-16 rounded-2xl border border-gray-100 object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl border border-gray-100 bg-gray-50 flex items-center justify-center flex-shrink-0">
                      <BriefcaseBusiness size={22} className="text-gray-400" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-gray-900 text-2xl leading-tight truncate">{job.title}</h3>

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                      <span className="inline-flex items-center gap-1.5">
                        <BriefcaseBusiness size={16} className="text-[#F4781B]" />
                        {job.experience_range || "—"}
                      </span>
                      <span>|</span>
                      <span className="inline-flex items-center gap-1.5">
                        <FileText size={16} className="text-[#F4781B]" />
                        {job.department || "—"}
                      </span>
                      <span>|</span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock size={16} className="text-[#F4781B]" />
                        {formatLabel(job.job_type, "Part-Time")}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-1.5 text-base text-gray-700">
                        <MapPin size={17} className="text-[#F4781B]" />
                        {job.location || "—"}
                      </span>

                      {job.interviewRequired ? (
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                          <UserRound size={16} />
                          Interview Required
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {submitError && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {submitError}
          </div>
        )}
        <div className="flex justify-end mt-5">
          <button
            type="button"
            onClick={handleCTA}
            disabled={!selectedJobId || isSubmitting}
            className={`flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl ${
              selectedJobId && !isSubmitting
                ? "bg-[#F4781B] hover:bg-[#e06a10] text-white"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Processing...
              </>
            ) : (
              <>
                {config.ctaLabel} <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function ActionSuccessModal({
  title,
  body,
  onDone,
}: {
  title: string;
  body: string;
  onDone: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-8 flex flex-col items-center gap-4 text-center">
        <CheckCircle2 size={28} className="text-green-500" />
        <div>
          <p className="text-lg font-bold text-gray-900">{title}</p>
          <p className="text-sm text-gray-400 mt-2 max-w-xs">{body}</p>
        </div>
        <button
          type="button"
          onClick={onDone}
          className="w-full bg-[#F4781B] hover:bg-[#e06a10] text-white text-sm font-semibold py-3 rounded-xl"
        >
          Done
        </button>
      </div>
    </div>
  );
}
