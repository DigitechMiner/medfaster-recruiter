"use client";

import React from "react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { DashboardJob } from "../types";

interface DashboardJobsTableProps {
  jobs: DashboardJob[];
  router: AppRouterInstance;
}

export const DashboardJobsTable: React.FC<DashboardJobsTableProps> = ({ jobs, router }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-y border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left">
              <div className="flex items-center gap-3">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                <span className="text-xs font-medium text-gray-600 uppercase">Job ID</span>
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 8l5 5 5-5H5z" />
                </svg>
              </div>
            </th>
            <th className="px-4 py-3 text-left">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-600 uppercase">Job Title</span>
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 8l5 5 5-5H5z" />
                </svg>
              </div>
            </th>
            <th className="px-4 py-3 text-left">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-600 uppercase">Department</span>
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 8l5 5 5-5H5z" />
                </svg>
              </div>
            </th>
            <th className="px-4 py-3 text-left">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-600 uppercase">Status</span>
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 8l5 5 5-5H5z" />
                </svg>
              </div>
            </th>
            <th className="px-4 py-3 text-left">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-600 uppercase">Total Applicants</span>
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 8l5 5 5-5H5z" />
                </svg>
              </div>
            </th>
            <th className="px-4 py-3 text-left">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-600 uppercase">Posted Date</span>
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 8l5 5 5-5H5z" />
                </svg>
              </div>
            </th>
            <th className="px-4 py-3 text-left">
              <span className="text-xs font-medium text-gray-600 uppercase">Assigned Recruiter</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {jobs.map((job, index) => (
            <tr
              key={job.id}
              className="hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => router.push(`/jobs/${job.id}`)}
            >
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="text-sm font-medium text-gray-900">
                    #{job.id.substring(0, 4).toUpperCase()}
                  </span>
                </div>
              </td>
              <td className="px-4 py-4">
                <span className="text-sm text-gray-900 font-medium">{job.job_title}</span>
              </td>
              <td className="px-4 py-4">
                <span className="text-sm text-gray-700">{job.department || "Not specified"}</span>
              </td>
              <td className="px-4 py-4">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    job.status === "CLOSED" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      job.status === "CLOSED" ? "bg-red-500" : "bg-green-500"
                    }`}
                  ></span>
                  {job.status === "CLOSED" ? "Closed" : "Open"}
                </span>
              </td>
              <td className="px-4 py-4">
                <span className="text-sm text-gray-700">{job.application_count || 0}</span>
              </td>
              <td className="px-4 py-4">
                <span className="text-sm text-gray-700">
                  {new Date(job.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex-shrink-0 flex items-center justify-center text-white text-xs font-semibold">
                    {["AS", "MK", "MT", "RK", "JL"][index % 5]}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">
                      Dr. {["Arun Shah", "Maya Kapoor", "Malik Thompson", "Ravi Kumar", "Jenna Lee"][index % 5]}
                    </span>
                    <span className="text-xs text-gray-500">
                      {["Orthopaedic", "MD", "Pediatrician", "BDS", "Cardiologist"][index % 5]}
                    </span>
                  </div>
                  <div className="ml-auto flex gap-2">
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/jobs/${job.id}/edit`);
                      }}
                      className="text-green-500 hover:text-green-700 p-1"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
