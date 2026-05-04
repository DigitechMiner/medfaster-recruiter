'use client';

import { useState }    from "react";
import Image           from "next/image";
import { ArrowLeft, ArrowRight, CheckCircle2, BriefcaseBusiness, Clock, MapPin, User } from "lucide-react";
import type { CandidateDetailVM }  from "@/Interface/view-models";
       // ← single import
import { useQuery }                from "@tanstack/react-query";
import { apiRequest }              from "@/stores/api/api-client";
import { ENDPOINTS }               from "@/stores/api/api-endpoints";
import { ActionType } from "@/Interface/recruiter.types";

// ── Job shape from API ────────────────────────────────────────────────────────
interface JobOption {
  id:                string;
  title:             string;
  type:              "Regular" | "Urgent";
  status:            string;
  interviewRequired: boolean;
  org_photo:         string | null;
  experience_range?: string | null;
  department?:       string | null;
  job_type?:         string | null;
  location?:         string | null;
}

interface JobsResponse {
  data: {
    jobs:       JobOption[];
    pagination: { total: number };
  };
}

// ── Hook ──────────────────────────────────────────────────────────────────────
function useJobOptions(pool: "regular" | "urgent" | "both") {
  const types = pool === "both" ? ["REGULAR", "URGENT"] : pool === "urgent" ? ["URGENT"] : ["REGULAR"];

  const { data, isLoading } = useQuery({
    queryKey: ["job-options-modal", pool],
    queryFn:  () => apiRequest<JobsResponse>(ENDPOINTS.JOBS_LIST, {
      method: "GET",
      params: { status: "OPEN", job_types: types.join(","), limit: 20 },
    }),
  });

  const jobs: JobOption[] = (data?.data?.jobs ?? []).map((j) => ({
    ...j,
    type: j.type === "Urgent" ? "Urgent" : "Regular",
  }));

  return { jobs, isLoading };
}

// ── Config ────────────────────────────────────────────────────────────────────
const MODAL_CONFIG: Record<ActionType, {
  title:        (name: string) => string;
  subtitle:     string;
  jobPool:      "regular" | "urgent" | "both";
  ctaLabel:     string;
  createLinks:  { label: string; href: string }[];
  successTitle: () => string;
  successBody:  (name: string, jobTitle: string, jobId: string) => string;
}> = {
  invite: {
    title:        (name) => `Invite ${name} to a Job`,
    subtitle:     "Select From Regular Job Openings",
    jobPool:      "both",
    ctaLabel:     "Send Jobs Invitation",
    createLinks:  [
      { label: "Regular Job Post", href: "/jobs/create?type=regular" },
      { label: "Urgent Shift Post", href: "/jobs/create?type=urgent" },
    ],
    successTitle: () => "Job Invitation Sent Successfully",
    successBody:  (name, jobTitle, jobId) =>
      `${jobTitle} – Job ID: ${jobId} Invitation sent and waiting for ${name} response.`,
  },
  schedule: {
    title:        (name) => `Schedule a Interview for ${name}`,
    subtitle:     "Select From Regular Jobs Openings",
    jobPool:      "regular",
    ctaLabel:     "Request Interview",
    createLinks:  [{ label: "Regular Job Post", href: "/jobs/create?type=regular" }],
    successTitle: () => "Requested Interview For Selected Jobs",
    successBody:  (name, jobTitle, jobId) =>
      `${jobTitle} – Job ID: ${jobId} Invitation sent and waiting for ${name} interview response.`,
  },
  shortlist: {
    title:        (name) => `Shortlist ${name} For a Job`,
    subtitle:     "Select From Regular Job Openings",
    jobPool:      "regular",
    ctaLabel:     "Shortlist Candidate",
    createLinks:  [{ label: "Regular Job Post", href: "/jobs/create?type=regular" }],
    successTitle: () => "Shortlisted Successfully",
    successBody:  (name, jobTitle, jobId) =>
      `${name} have been shortlisted For ${jobTitle} Job ID:${jobId}`,
  },
  hire: {
    title:        (name) => `Hire ${name} Instantly For Urgent Shifts`,
    subtitle:     "Select From Urgent Shift Openings",
    jobPool:      "urgent",
    ctaLabel:     "Send Shift Request",
    createLinks:  [{ label: "Urgent Shift Post", href: "/jobs/create?type=urgent" }],
    successTitle: () => "Shift Request Sent Successfully",
    successBody:  (name, jobTitle, jobId) =>
      `${jobTitle} – Shift ID: ${jobId} Invitation sent and waiting for ${name} shift acceptance.`,
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatJobType = (raw?: string | null) => {
  if (!raw) return null;
  return raw.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

function getInterviewBadge(job: { interviewRequired: boolean; type: "Regular" | "Urgent" }) {
  if (job.type === "Urgent")   return { label: "No Interview Needed",   cls: "bg-[#FEE4E2] text-[#912018]" };
  if (job.interviewRequired)   return { label: "Interview Required",    cls: "bg-[#D1FAE5] text-[#059669]" };
  return                              { label: "No Interview Required", cls: "bg-[#FEF9C3] text-[#854D0E]" };
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function JobSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="border border-gray-100 rounded-2xl p-4 animate-pulse flex flex-col gap-3">
          <div className="h-3 bg-gray-100 rounded w-1/3" />
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-100 rounded w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          </div>
          <div className="h-3 bg-gray-100 rounded w-2/3" />
        </div>
      ))}
    </div>
  );
}

// ── Main Modal ────────────────────────────────────────────────────────────────
interface Props {
  actionType: ActionType;
  candidate:  CandidateDetailVM;
  onClose:    () => void;
}

export function CandidateActionModal({ actionType, candidate, onClose }: Props) {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [showSuccess,   setShowSuccess]   = useState(false);

  const config            = MODAL_CONFIG[actionType];
  const name              = candidate.full_name;
  const { jobs, isLoading } = useJobOptions(config.jobPool);
  const selectedJob         = jobs.find((j) => j.id === selectedJobId);

  if (showSuccess && selectedJob) {
    return (
      <SuccessModal
        title={config.successTitle()}
        body={config.successBody(name, selectedJob.title, selectedJob.id)}
        onDone={onClose}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl mx-4 p-6 max-h-[90vh] overflow-y-auto">

        <div className="flex items-center gap-2 mb-5">
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <h2 className="text-base font-bold text-gray-900">{config.title(name)}</h2>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
          <h3 className="text-sm font-bold text-gray-900 mb-4">{config.subtitle}</h3>

          {isLoading ? <JobSkeleton /> : jobs.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No open jobs available.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {jobs.map((job) => {
                const isSelected = selectedJobId === job.id;
                const isUrgent   = job.type === "Urgent";
                const interview  = getInterviewBadge(job);
                const jobType    = formatJobType(job.job_type);

                return (
                  <div
                    key={job.id + job.type}
                    onClick={() => setSelectedJobId(isSelected ? null : job.id)}
                    className={`bg-white rounded-2xl p-4 flex flex-col gap-3 cursor-pointer transition-all border ${
                      isSelected
                        ? "border-[#F4781B] shadow-sm bg-orange-50/20"
                        : "border-gray-200 hover:border-orange-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400 font-medium tracking-wide">
                        Job ID: {job.id}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          isUrgent
                            ? "bg-orange-50 text-orange-500 border-orange-200"
                            : "bg-green-50 text-green-600 border-green-200"
                        }`}>
                          {job.type}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-500 border border-blue-200">
                          {job.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
                        {job.org_photo ? (
                          <Image src={job.org_photo} alt="Organization" width={40} height={40} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-orange-50">
                            <span className="text-[10px] font-extrabold text-orange-500 uppercase">ORG</span>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-gray-900 text-[15px] leading-snug truncate">{job.title}</h3>
                        <div className="flex items-center gap-1.5 mt-1 text-xs flex-wrap">
                          {job.experience_range && (
                            <>
                              <span className="flex items-center gap-1 text-gray-500">
                                <BriefcaseBusiness size={12} color="orange" /> {job.experience_range}
                              </span>
                              <span className="text-gray-300">|</span>
                            </>
                          )}
                          {job.department && (
                            <>
                              <span className="flex items-center gap-1 text-gray-500">
                                <BriefcaseBusiness size={12} color="orange" /> {job.department}
                              </span>
                              <span className="text-gray-300">|</span>
                            </>
                          )}
                          <span className="flex items-center gap-1 text-gray-500">
                            <Clock size={12} color="orange" /> {jobType || "Part Time"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin size={13} className="text-[#F4781B] flex-shrink-0" />
                        {job.location || "—"}
                      </span>
                      <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${interview.cls}`}>
                        <User size={11} /> {interview.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <p className="text-center text-sm text-gray-400 py-1">or</p>
        <p className="text-center text-sm text-gray-500 mb-5">
          Create a New{" "}
          {config.createLinks.map((link, i) => (
            <span key={link.href}>
              {i > 0 && " or "}
              <a href={link.href} className="text-[#F4781B] font-semibold italic hover:underline">
                {link.label}
              </a>
            </span>
          ))}
        </p>

        <div className="flex justify-end">
          <button
            onClick={() => selectedJobId && setShowSuccess(true)}
            disabled={!selectedJobId}
            className={`flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all ${
              selectedJobId
                ? "bg-[#F4781B] hover:bg-[#e06a10] text-white"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {config.ctaLabel} <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function SuccessModal({ title, body, onDone }: { title: string; body: string; onDone: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-8 flex flex-col items-center gap-4 text-center">
        <div className="relative w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-green-100/60" />
          <div className="absolute inset-3 rounded-full bg-green-100" />
          <div className="w-14 h-14 rounded-full bg-white border-2 border-green-300 flex items-center justify-center z-10">
            <CheckCircle2 size={28} className="text-green-500" />
          </div>
        </div>
        <div>
          <p className="text-lg font-bold text-gray-900">{title}</p>
          <p className="text-sm text-gray-400 mt-2 max-w-xs">{body}</p>
        </div>
        <button
          onClick={onDone}
          className="w-full bg-[#F4781B] hover:bg-[#e06a10] text-white text-sm font-semibold py-3 rounded-xl transition-colors mt-1"
        >
          Done
        </button>
      </div>
    </div>
  );
}