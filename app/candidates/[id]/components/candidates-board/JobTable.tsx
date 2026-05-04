"use client";

import React from "react";
import { CandidateTypePill, StatusPill } from "./ui";
import type { CandidateCardVM } from "@/Interface/view-models";

export function JobTable({
  jobs,
  showCandidateType = false,
  headerBg = "bg-orange-50/60",
}: {
  jobs:               CandidateCardVM[];   // ✅ fixed
  showCandidateType?: boolean;
  headerBg?:          string;
}) {
  const baseHeaders = [
    "Candidate Name", "Department", "Designation",
    "Experience", "Status",
  ];
  const headers = showCandidateType
    ? ["Candidate Name", "Candidate Type", ...baseHeaders.slice(1)]
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
            jobs.map((c) => (
              <tr
                key={c.id}
                className="border-b border-gray-100 hover:bg-orange-50/30 transition-colors cursor-pointer"
              >
                <td className="py-3 px-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                  {c.full_name}
                </td>

                {showCandidateType && (
                  <td className="py-3 px-4">
                    <CandidateTypePill type={c.work_eligibility ?? "—"} />
                  </td>
                )}

                <td className="py-3 px-4 text-xs text-gray-600">{c.department || "—"}</td>
                <td className="py-3 px-4 text-xs text-gray-600">{c.designation || "—"}</td>
                <td className="py-3 px-4 text-xs text-gray-600">{c.experience || "—"}</td>
                <td className="py-3 px-4">
                  <StatusPill status={c.application_status} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}