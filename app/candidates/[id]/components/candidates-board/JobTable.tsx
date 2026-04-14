"use client";

import React from "react";
import { CandidateTypePill, JobTypePill, StatusPill } from "./ui";

export function JobTable({
  jobs,
  showCandidateType = false,
  headerBg = "bg-orange-50/60",
}: {
  jobs: Array<{
    name: string;
    candidateType: string;
    dept: string;
    title: string;
    exp: string;
    type: string;
    date: string;
    timing: string;
    duration: string;
    status: string;
  }>;
  showCandidateType?: boolean;
  headerBg?: string;
}) {
  const baseHeaders = ["Candidate Name", "Department", "Job Title", "Experience", "Job Type", "Job Start Date", "Job Timing", "Job Duration", "Job Status"];
  const headers = showCandidateType
    ? ["Candidate Name", "Candidate Type", "Department", "Job Title", "Experience", "Job Type", "Job Start Date", "Job Timing", "Job Duration", "Job Status"]
    : baseHeaders;

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100">
      <table className="w-full text-left">
        <thead>
          <tr className={headerBg}>
            {headers.map((h) => (
              <th key={h} className="py-3 px-4 text-xs font-semibold text-gray-600 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {jobs.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="py-8 text-center text-xs text-gray-400">
                No records found
              </td>
            </tr>
          ) : (
            jobs.map((job, i) => (
              <tr key={i} className="border-b border-gray-100 hover:bg-orange-50/30 transition-colors cursor-pointer">
                <td className="py-3 px-4 text-sm font-medium text-gray-900 whitespace-nowrap">{job.name}</td>
                {showCandidateType && (
                  <td className="py-3 px-4">
                    <CandidateTypePill type={job.candidateType} />
                  </td>
                )}
                <td className="py-3 px-4 text-xs text-gray-600">{job.dept}</td>
                <td className="py-3 px-4 text-xs text-gray-600">{job.title}</td>
                <td className="py-3 px-4 text-xs text-gray-600">{job.exp}</td>
                <td className="py-3 px-4"><JobTypePill type={job.type} /></td>
                <td className="py-3 px-4 text-xs text-gray-600 whitespace-nowrap">{job.date}</td>
                <td className="py-3 px-4 text-xs text-gray-600 whitespace-nowrap">{job.timing}</td>
                <td className="py-3 px-4 text-xs text-gray-500">{job.duration}</td>
                <td className="py-3 px-4"><StatusPill status={job.status} /></td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
