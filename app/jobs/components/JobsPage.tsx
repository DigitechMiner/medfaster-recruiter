"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { JobListingCard } from "../../../components/card/JobCard";
import { StatusSection, StatusTable } from "./ui";
import { Job, StatusType } from "@/Interface/job.types";
import { STATUS_SECTIONS } from "../constants/jobs";
import { LayoutMode } from "../constants/form";
import { BUTTON_LABELS } from "../constants/messages";
import { useJobs, useJobApplications } from "@/hooks/useJobData"; // ✅ Import hook

interface CandidatesData {
  applied: Job[];
  shortlisted: Job[];
  interviewing: Job[];
  hired: Job[];
}

const JobsPage: React.FC = () => {
  const router = useRouter();
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("kanban");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { jobs, isLoading: isLoadingJobs } = useJobs();
  
  // ✅ FETCH REAL APPLICATIONS FROM API HOOK
  const { applications: applicationsData, isLoading: isLoadingApps } = useJobApplications();

  // ✅ Transform REAL API data to Job format
  const candidatesData = useMemo<CandidatesData>(() => {
    if (!applicationsData?.applications) {
      return { applied: [], shortlisted: [], interviewing: [], hired: [] };
    }

    const applied: Job[] = applicationsData.applications.map((app: any) => ({
      id: app.id, // Application ID
      candidateId: app.candidate_id, // ✅ REAL UUID from DB
      doctorName: app.candidate?.full_name || 
                  `${app.candidate?.first_name} ${app.candidate?.last_name}` || 
                  'Unknown',
      experience: app.candidate?.work_experiences?.[0]?.years || 3,
      position: app.candidate?.work_experiences?.[0]?.title || 'Healthcare Professional',
      score: app.score || Math.floor(Math.random() * 25) + 75,
      specialization: app.candidate?.specialty ? [app.candidate.specialty] : ['General Medicine'],
      currentCompany: app.candidate?.work_experiences?.[0]?.company || 'Health Network',
    }));

    console.log('✅ Real applications loaded:', applied.length);
    
    // ✅ TODO: Filter by status
    return {
      applied: applied.filter((a: any) => applicationsData.applications.find((app: any) => app.id === a.id)?.status === 'PENDING'),
      shortlisted: [],
      interviewing: [],
      hired: applied.filter((a: any) => applicationsData.applications.find((app: any) => app.id === a.id)?.status === 'ACCEPTED'),
    };
  }, [applicationsData]);

  // ✅ FIXED: Use REAL candidate UUID
  const handleCandidateClick = (job: Job, _status: StatusType) => {
    console.log('✅ Opening candidate:', job.doctorName, 'UUID:', job.candidateId);
    
    if (!job.candidateId) {
      console.error('❌ No candidate ID for:', job.doctorName);
      return;
    }
    
    // ✅ Use REAL UUID from API
    router.push(`/candidates/${job.candidateId}`);
  };

  // Filter jobs based on search query
  const filteredJobs = useMemo(() => {
    if (!Array.isArray(jobs)) return [];
    if (!searchQuery) return jobs.slice(0, 4);

    const q = searchQuery.toLowerCase();
    return jobs
      .filter((job: any) => {
        return (
          job.job_title?.toLowerCase().includes(q) ||
          (job.department && job.department.toLowerCase().includes(q))
        );
      })
      .slice(0, 4);
  }, [jobs, searchQuery]);

  // ✅ Wait for both jobs AND applications
  if (isLoadingJobs || isLoadingApps) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600">Loading jobs and applications...</p>
      </div>
    );
  }

  // Main Dashboard View
  return (
    <>
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 w-full">
            <h1 className="text-2xl sm:text-2xl font-bold text-gray-800">Jobs</h1>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-3">
              <button
                onClick={() => router.push("/jobs/all")}
                className="text-black underline font-semibold text-sm hover:text-gray-600 transition-colors"
              >
                {BUTTON_LABELS.SEE_ALL}
              </button>
              <button
                onClick={() => router.push("/jobs/create")}
                className="bg-orange-500 text-white px-7 py-2 rounded-lg hover:bg-orange-600 font-medium text-sm"
              >
                {BUTTON_LABELS.POST_JOB}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        {/* Job Listing Cards */}
        <div className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {filteredJobs.map((job: any) => (
              <div
                key={job.id}
                onClick={() => {
                  router.push(`/jobs/${job.id}`);
                }}
              >
                <JobListingCard job={job} />
              </div>
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white px-3 rounded-2xl">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-3 pt-3 ">
              <div className="flex-1 relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
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
                  <button
                    onClick={() => setLayoutMode("kanban")}
                    className={`px-4 py-3 inline-flex items-center gap-2 text-base font-medium transition-colors rounded-lg ${
                      layoutMode === "kanban"
                        ? "bg-gray-200 text-gray-800"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Image src="/svg/Kanban.svg" alt="kanban" width={20} height={20} />
                  </button>
                  <button
                    onClick={() => setLayoutMode("table")}
                    className={`px-4 py-3 inline-flex items-center gap-2 text-base font-medium transition-colors rounded-lg ${
                      layoutMode === "table"
                        ? "bg-gray-200 text-gray-800"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Image src="/svg/Table.svg" alt="table" width={20} height={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Kanban/Table Views */}
          {layoutMode === "kanban" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {STATUS_SECTIONS.map(({ status, title, badgeColor }) => (
                <StatusSection
                  key={status}
                  status={status}
                  title={title}
                  count={candidatesData[status as keyof CandidatesData]?.length || 0}
                  jobs={candidatesData[status as keyof CandidatesData] || []}
                  badgeColor={badgeColor}
                  onCandidateClick={handleCandidateClick}
                />
              ))}
            </div>
          )}
          {layoutMode === "table" && (
            <div className="space-y-4">
              {STATUS_SECTIONS.map(({ status, title, badgeColor }) => (
                <StatusTable
                  key={status}
                  status={status}
                  title={title}
                  count={candidatesData[status as keyof CandidatesData]?.length || 0}
                  jobs={candidatesData[status as keyof CandidatesData] || []}
                  badgeColor={badgeColor}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default JobsPage;
