"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { JobListingCard } from "../../../components/card/JobCard";
import { StatusSection, StatusTable } from "./ui";
import { Job } from "@/Interface/job.types";
import { STATUS_SECTIONS } from "../constants/jobs";
import { LayoutMode } from "../constants/form";
import { BUTTON_LABELS } from "../constants/messages";
import { useJobs, useJobApplications } from "@/hooks/useJobData";
import type { JobApplicationListResponse } from "@/stores/api/recruiter-job-api";

// ✅ Proper type instead of any
type RawApplication = JobApplicationListResponse["applications"][number];

interface CandidatesData {
  applied: Job[];
  shortlisted: Job[];
  interviewing: Job[];
  hired: Job[];
}

const SHORTLISTED_DUMMY: Job[] = [
  { id: 101, candidateId: "cand-101", doctorName: "Dr. Sarah Mitchell", experience: 5, position: "Senior Cardiologist", score: 92, specialization: ["Cardiology", "Internal Medicine"], currentCompany: "City General Hospital" },
  { id: 102, candidateId: "cand-102", doctorName: "Dr. James Chen", experience: 7, position: "Orthopedic Surgeon", score: 88, specialization: ["Orthopedics", "Sports Medicine"], currentCompany: "Regional Medical Center" },
  { id: 103, candidateId: "cand-103", doctorName: "Dr. Emily Rodriguez", experience: 4, position: "Pediatrician", score: 85, specialization: ["Pediatrics"], currentCompany: "Children's Healthcare" },
];

const INTERVIEWING_DUMMY: Job[] = [
  { id: 201, candidateId: "cand-201", doctorName: "Dr. Michael Thompson", experience: 6, position: "Emergency Medicine Physician", score: 90, specialization: ["Emergency Medicine", "Trauma Care"], currentCompany: "Metro Hospital" },
  { id: 202, candidateId: "cand-202", doctorName: "Dr. Priya Sharma", experience: 8, position: "Neurologist", score: 94, specialization: ["Neurology", "Neurosurgery"], currentCompany: "Brain & Spine Institute" },
  { id: 203, candidateId: "cand-203", doctorName: "Dr. David Kim", experience: 5, position: "Radiologist", score: 87, specialization: ["Radiology", "Imaging"], currentCompany: "Diagnostic Center Plus" },
  { id: 204, candidateId: "cand-204", doctorName: "Dr. Lisa Anderson", experience: 9, position: "Anesthesiologist", score: 91, specialization: ["Anesthesiology", "Pain Management"], currentCompany: "University Medical Center" },
];

const HIRED_DUMMY: Job[] = [
  { id: 301, candidateId: "cand-301", doctorName: "Dr. Robert Williams", experience: 10, position: "Chief of Surgery", score: 96, specialization: ["General Surgery", "Laparoscopic Surgery"], currentCompany: "Premier Healthcare System" },
  { id: 302, candidateId: "cand-302", doctorName: "Dr. Maria Garcia", experience: 6, position: "Dermatologist", score: 89, specialization: ["Dermatology", "Cosmetic Dermatology"], currentCompany: "Skin & Beauty Clinic" },
];

// ✅ Typed job list item
type JobListItem = { id: string; job_title: string; department?: string; status?: string; [key: string]: unknown };

const JobsPage: React.FC = () => {
  const router = useRouter();
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("kanban");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { jobs, isLoading: isLoadingJobs } = useJobs();
  const { applications: applicationsData, isLoading: isLoadingApps } = useJobApplications();

  const candidatesData = useMemo<CandidatesData>(() => {
    const rawApplications = applicationsData?.applications;

    if (!Array.isArray(rawApplications) || rawApplications.length === 0) {
      return { applied: [], shortlisted: SHORTLISTED_DUMMY, interviewing: INTERVIEWING_DUMMY, hired: HIRED_DUMMY };
    }

    const applied: Job[] = rawApplications.map((app: RawApplication) => {
      // ✅ Use unknown + type assertion instead of any
      const appRecord = app as Record<string, unknown>;
      const candidate = (appRecord.candidate ?? appRecord.candidateProfile ?? {}) as Record<string, unknown>;
      const workExps = (candidate.work_experiences ?? candidate.workExperiences ?? []) as Record<string, unknown>[];
      const latestWork = Array.isArray(workExps) ? workExps[0] : null;

      const firstName = String(candidate.first_name ?? candidate.firstName ?? "");
      const lastName = String(candidate.last_name ?? candidate.lastName ?? "");
      const fullName =
        String(candidate.full_name ?? candidate.fullName ?? "").trim() ||
        `${firstName} ${lastName}`.trim() ||
        "Unknown Candidate";

      const specialty = candidate.specialty ?? [];
      const specializations: string[] = Array.isArray(specialty)
        ? (specialty as string[])
        : typeof specialty === "string"
        ? [specialty]
        : ["General Medicine"];

      return {
        id: appRecord.id as string,
        candidateId: String(appRecord.candidate_id ?? appRecord.candidateId ?? (candidate.id as string) ?? ""),
        jobApplicationId: appRecord.id as string,
        doctorName: fullName,
        experience: (latestWork?.years ?? latestWork?.duration ?? 3) as number,
        position: String(latestWork?.title ?? latestWork?.job_title ?? "Healthcare Professional"),
        score: (appRecord.score ?? Math.floor(Math.random() * 25) + 75) as number,
        specialization: specializations,
        currentCompany: String(latestWork?.company ?? latestWork?.organization ?? "Health Network"),
      };
    });

    return { applied, shortlisted: SHORTLISTED_DUMMY, interviewing: INTERVIEWING_DUMMY, hired: HIRED_DUMMY };
  }, [applicationsData]);

  const handleCandidateClick = (job: Job) => {
    if (!job.candidateId || !job.id) return;
    router.push(`/candidates/${job.candidateId}?job_application_id=${job.id}`);
  };

  const filteredJobs = useMemo(() => {
    if (!Array.isArray(jobs)) return [];
    const source = searchQuery
      ? (jobs as JobListItem[]).filter((job) => {
          const q = searchQuery.toLowerCase();
          return (
            job.job_title?.toLowerCase().includes(q) ||
            job.department?.toLowerCase().includes(q)
          );
        })
      : (jobs as JobListItem[]);
    return source.slice(0, 4);
  }, [jobs, searchQuery]);

  if (isLoadingJobs || isLoadingApps) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600">Loading jobs and applications...</p>
      </div>
    );
  }

  return (
    <>
      <div>
        <div className="flex items-center justify-between">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 w-full">
            <h1 className="text-2xl font-bold text-gray-800">Jobs</h1>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-3">
              <button onClick={() => router.push("/jobs/all")} className="text-black underline font-semibold text-sm hover:text-gray-600 transition-colors">
                {BUTTON_LABELS.SEE_ALL}
              </button>
              <button onClick={() => router.push("/jobs/create")} className="bg-orange-500 text-white px-7 py-2 rounded-lg hover:bg-orange-600 font-medium text-sm">
                {BUTTON_LABELS.POST_JOB}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {filteredJobs.map((job) => (
              <div key={job.id as string} onClick={() => router.push(`/jobs/${job.id}`)} className="cursor-pointer">
                <JobListingCard job={job as Parameters<typeof JobListingCard>[0]["job"]} />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white px-3 rounded-2xl">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-3 pt-3">
              <div className="flex-1 relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
                <input
                  type="text"
                  placeholder="Search candidates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-orange-500"
                />
              </div>
              <div className="flex gap-2 items-center">
                <button className="px-3 py-2 hover:bg-gray-100 rounded text-sm font-medium whitespace-nowrap border border-gray-300 inline-flex items-center gap-2">
                  <Image src="/svg/Filter.svg" alt="filter" width={16} height={16} />
                  Filter
                </button>
                <div className="flex gap-2">
                  <button onClick={() => setLayoutMode("kanban")} className={`px-4 py-3 inline-flex items-center gap-2 text-base font-medium transition-colors rounded-lg ${layoutMode === "kanban" ? "bg-gray-200 text-gray-800" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
                    <Image src="/svg/Kanban.svg" alt="kanban" width={20} height={20} />
                  </button>
                  <button onClick={() => setLayoutMode("table")} className={`px-4 py-3 inline-flex items-center gap-2 text-base font-medium transition-colors rounded-lg ${layoutMode === "table" ? "bg-gray-200 text-gray-800" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
                    <Image src="/svg/Table.svg" alt="table" width={20} height={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {layoutMode === "kanban" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {STATUS_SECTIONS.map(({ status, title, badgeColor }) => (
                <StatusSection key={status} status={status} title={title} count={candidatesData[status as keyof CandidatesData]?.length || 0} jobs={candidatesData[status as keyof CandidatesData] || []} badgeColor={badgeColor} onCandidateClick={handleCandidateClick} />
              ))}
            </div>
          )}
          {layoutMode === "table" && (
            <div className="space-y-4">
              {STATUS_SECTIONS.map(({ status, title, badgeColor }) => (
                <StatusTable key={status} status={status} title={title} count={candidatesData[status as keyof CandidatesData]?.length || 0} jobs={candidatesData[status as keyof CandidatesData] || []} badgeColor={badgeColor} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default JobsPage;
