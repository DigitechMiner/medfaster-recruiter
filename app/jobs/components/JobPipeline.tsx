"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { StatusSection, StatusTable } from "./ui";
import { STATUS_SECTIONS } from "../constants/jobs";
import { Job } from "@/Interface/job.types";
import type { JobsListResponse } from "@/Interface/job.types";
import type { JobApplicationListResponse } from "@/stores/api/recruiter-job-api";
import {
  INTERVIEWING_DUMMY,
  HIRED_DUMMY,
} from "../constants/jobs";

type JobListItem = JobsListResponse["data"]["jobs"][0];
type RawApplication = JobApplicationListResponse["applications"][number];

interface JobPipelinePanelProps {
  job: JobListItem;
  applicationsData: JobApplicationListResponse | null;
}

export const JobPipelinePanel: React.FC<JobPipelinePanelProps> = ({ job, applicationsData }) => {
  const router = useRouter();
  const [layoutMode, setLayoutMode] = useState<"kanban" | "table">("kanban");
  const [searchQuery, setSearchQuery] = useState("");

  const candidatesData = useMemo(() => {
    const rawApps = applicationsData?.applications;

    if (!Array.isArray(rawApps) || rawApps.length === 0) {
      return { applied: [], interviewing: INTERVIEWING_DUMMY, hired: HIRED_DUMMY };
    }

    // Filter to only applications for this job
    const jobApps = rawApps.filter((app) => {
      const a = app as Record<string, unknown>;
      return a.job_id === job.id || a.jobId === job.id;
    });

    const applied: Job[] = jobApps.map((app: RawApplication) => {
      const a = app as Record<string, unknown>;
      const candidate = (a.candidate ?? a.candidateProfile ?? {}) as Record<string, unknown>;
      const workExps = (candidate.work_experiences ?? candidate.workExperiences ?? []) as Record<string, unknown>[];
      const latestWork = Array.isArray(workExps) ? workExps[0] : null;

      const firstName = String(candidate.first_name ?? candidate.firstName ?? "");
      const lastName  = String(candidate.last_name ?? candidate.lastName ?? "");
      const fullName  =
        String(candidate.full_name ?? candidate.fullName ?? "").trim() ||
        `${firstName} ${lastName}`.trim() ||
        "Unknown Candidate";

      const specialty = candidate.specialty ?? [];
      const specializations: string[] = Array.isArray(specialty) ? (specialty as string[]) : typeof specialty === "string" ? [specialty] : ["General Medicine"];

      return {
        id: a.id as string,
        candidateId: String(a.candidate_id ?? a.candidateId ?? (candidate.id as string) ?? ""),
        jobApplicationId: a.id as string,
        doctorName: fullName,
        experience: (latestWork?.years ?? latestWork?.duration ?? 3) as number,
        position: String(latestWork?.title ?? latestWork?.job_title ?? "Healthcare Professional"),
        score: (a.score ?? Math.floor(Math.random() * 25) + 75) as number,
        specialization: specializations,
        currentCompany: String(latestWork?.company ?? latestWork?.organization ?? "Health Network"),
      };
    });

    return { applied, interviewing: INTERVIEWING_DUMMY, hired: HIRED_DUMMY };
  }, [applicationsData, job.id]);

  const handleCandidateClick = (candidate: Job) => {
    if (!candidate.candidateId || !candidate.id) return;
    router.push(`/candidates/${candidate.candidateId}?job_application_id=${candidate.id}`);
  };

  return (
    <div className="flex flex-col h-full">

      {/* ── Panel Header ── */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-gray-900 text-base">{job.job_title}</h3>
          <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
            {job.application_count || 0} Applied
          </span>
        </div>
        <p className="text-xs text-gray-500">{job.department || "Healthcare"}</p>
      </div>

      {/* ── Search + Toggle ── */}
      <div className="px-5 py-3 border-b border-gray-100 flex gap-3">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search candidates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-orange-400"
          />
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setLayoutMode("kanban")}
            className={`p-2 rounded-lg transition-colors ${layoutMode === "kanban" ? "bg-gray-200" : "hover:bg-gray-100"}`}
          >
            <Image src="/svg/Kanban.svg" alt="kanban" width={18} height={18} />
          </button>
          <button
            onClick={() => setLayoutMode("table")}
            className={`p-2 rounded-lg transition-colors ${layoutMode === "table" ? "bg-gray-200" : "hover:bg-gray-100"}`}
          >
            <Image src="/svg/Table.svg" alt="table" width={18} height={18} />
          </button>
        </div>
      </div>

      {/* ── Pipeline Content ── */}
      <div className="flex-1 overflow-y-auto p-5">
        {layoutMode === "kanban" ? (
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {STATUS_SECTIONS.map(({ status, title, badgeColor }) => (
              <StatusSection
                key={status}
                status={status}
                title={title}
                count={candidatesData[status as keyof typeof candidatesData]?.length || 0}
                jobs={candidatesData[status as keyof typeof candidatesData] || []}
                badgeColor={badgeColor}
                onCandidateClick={handleCandidateClick}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {STATUS_SECTIONS.map(({ status, title, badgeColor }) => (
              <StatusTable
                key={status}
                status={status}
                title={title}
                count={candidatesData[status as keyof typeof candidatesData]?.length || 0}
                jobs={candidatesData[status as keyof typeof candidatesData] || []}
                badgeColor={badgeColor}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
