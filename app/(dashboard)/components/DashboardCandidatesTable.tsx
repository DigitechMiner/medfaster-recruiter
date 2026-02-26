"use client";

import React from "react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { Candidate } from "../types";

interface DashboardCandidatesTableProps {
  candidates: Candidate[];
  showStatus?: boolean;
  showAssignedJob?: boolean;
  showCurrentEmployer?: boolean;
  router: AppRouterInstance;
}

export const DashboardCandidatesTable: React.FC<DashboardCandidatesTableProps> = ({
  candidates,
  showStatus,
  showAssignedJob,
  showCurrentEmployer,
  router,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-y border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left">
              <span className="text-xs font-medium text-gray-600 uppercase">Candidate ID</span>
            </th>
            <th className="px-4 py-3 text-left">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-600 uppercase">Full Name</span>
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 8l5 5 5-5H5z" />
                </svg>
              </div>
            </th>
            <th className="px-4 py-3 text-left">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-600 uppercase">Skills</span>
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 8l5 5 5-5H5z" />
                </svg>
              </div>
            </th>
            {showCurrentEmployer && (
              <th className="px-4 py-3 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-600 uppercase">Current Employer</span>
                  <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 8l5 5 5-5H5z" />
                  </svg>
                </div>
              </th>
            )}
            <th className="px-4 py-3 text-left">
              <span className="text-xs font-medium text-gray-600 uppercase">Contact Info</span>
            </th>
            <th className="px-4 py-3 text-left">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-600 uppercase">Yrs of Experience</span>
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 8l5 5 5-5H5z" />
                </svg>
              </div>
            </th>
            {showStatus && (
              <th className="px-4 py-3 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-600 uppercase">Status</span>
                  <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 8l5 5 5-5H5z" />
                  </svg>
                </div>
              </th>
            )}
            {showAssignedJob && (
              <th className="px-4 py-3 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-600 uppercase">Assigned Job</span>
                  <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 8l5 5 5-5H5z" />
                  </svg>
                </div>
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {candidates.map((candidate) => (
            <tr
              key={candidate.id}
              className="hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => router.push(`/candidates/${candidate.id}`)}
            >
              <td className="px-4 py-4">
                <span className="text-sm font-medium text-gray-900">#{candidate.id}</span>
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold">
                    {candidate.initials || "NA"}
                  </div>
                  <span className="text-sm text-gray-900 font-medium">{candidate.name}</span>
                </div>
              </td>
              <td className="px-4 py-4">
                <span className="text-sm text-gray-700">{candidate.skills}</span>
              </td>
              {showCurrentEmployer && (
                <td className="px-4 py-4">
                  <span className="text-sm text-gray-700">{candidate.currentEmployer || "—"}</span>
                </td>
              )}
              <td className="px-4 py-4">
                <div className="flex items-center gap-2 text-gray-500">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
              </td>
              <td className="px-4 py-4">
                <span className="text-sm text-gray-700">{candidate.experience}</span>
              </td>
              {showStatus && (
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      candidate.status === "Interviewed"
                        ? "bg-green-50 text-green-700"
                        : "bg-orange-50 text-orange-700"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        candidate.status === "Interviewed" ? "bg-green-500" : "bg-orange-500"
                      }`}
                    ></span>
                    {candidate.status}
                  </span>
                </td>
              )}
              {showAssignedJob && (
                <td className="px-4 py-4">
                  <span className="text-sm text-gray-700">{candidate.assignedJob || "—"}</span>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
