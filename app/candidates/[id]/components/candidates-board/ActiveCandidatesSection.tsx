"use client";

import { MOCK_JOBS } from "./constants";
import { JobTable } from "./JobTable";
import { PaginationBar } from "./ui";

export function ActiveCandidatesSection() {
  const activeJobs = MOCK_JOBS.filter((j) => j.status === "Active");

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
        <h3 className="text-sm font-bold text-gray-900">Active Candidates</h3>
        <span className="text-xs text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-full">{activeJobs.length}</span>
      </div>
      <JobTable jobs={activeJobs} showCandidateType headerBg="bg-blue-50/40" />
      <PaginationBar total={activeJobs.length} />
    </div>
  );
}
