"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useJobs, useJobApplications } from "@/hooks/useJobData";
import { TrendingUp, TrendingDown } from "lucide-react";
import { AppLayout } from "@/components/global/app-layout";

// Types
type MetricType = "openJobs" | "applied" | "interviewing" | "hired" | "pending";

interface MetricCardProps {
  title: string;
  value: number;
  percentChange: number;
  isPositive: boolean;
  isActive: boolean;
  onClick: () => void;
}

// Metric Card Component
const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  percentChange,
  isPositive,
  isActive,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl p-4 sm:p-5 border-2 transition-all hover:shadow-md cursor-pointer ${
        isActive ? "border-orange-400" : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
        </div>
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded ${
            isPositive ? "bg-green-50" : "bg-red-50"
          }`}
        >
          {isPositive ? (
            <TrendingUp className="w-3 h-3 text-green-600" />
          ) : (
            <TrendingDown className="w-3 h-3 text-red-600" />
          )}
          <span
            className={`text-xs font-medium ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {percentChange}%
          </span>
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
};

// Dashboard Jobs Table Component
const DashboardJobsTable: React.FC<{ jobs: any[]; router: any }> = ({ jobs, router }) => {
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
          {jobs.map((job: any, index: number) => (
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
                    job.status === "closed" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      job.status === "closed" ? "bg-red-500" : "bg-green-500"
                    }`}
                  ></span>
                  {job.status === "closed" ? "Closed" : "Open"}
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
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
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

// Dashboard Candidates Table Component
const DashboardCandidatesTable: React.FC<{ 
  candidates: any[]; 
  showStatus?: boolean;
  showAssignedJob?: boolean;
  showCurrentEmployer?: boolean;
  router: any;
}> = ({ candidates, showStatus, showAssignedJob, showCurrentEmployer, router }) => {
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
          {candidates.map((candidate: any) => (
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

// Main Dashboard Page Component
const DashboardPage: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDashboardMetric, setSelectedDashboardMetric] = useState<MetricType>("openJobs");
  
  const { jobs, isLoading: isLoadingJobs } = useJobs();
  const { applications: applicationsData, isLoading: isLoadingApps } = useJobApplications();

  // Calculate dashboard metrics
  const dashboardMetrics = useMemo(() => {
    const totalOpenJobs = jobs?.filter((j: any) => j.status !== "closed")?.length || 0;
    const totalApplicants = applicationsData?.applications?.length || 0;
    const inInterviewStage = applicationsData?.applications?.filter(
      (app: any) => app.status === "INTERVIEWING"
    )?.length || 0;
    const hiredThisMonth = applicationsData?.applications?.filter(
      (app: any) => app.status === "ACCEPTED"
    )?.length || 0;
    const pendingApprovals = applicationsData?.applications?.filter(
      (app: any) => app.status === "PENDING"
    )?.length || 0;

    return {
      totalOpenJobs,
      totalApplicants,
      inInterviewStage,
      hiredThisMonth,
      pendingApprovals,
    };
  }, [jobs, applicationsData]);

  // Get dashboard table data based on selected metric
  const dashboardTableData = useMemo(() => {
    if (selectedDashboardMetric === "openJobs") {
      return jobs?.filter((j: any) => j.status !== "closed") || [];
    }
    
    // For candidate views, transform application data
    const dashboardCandidates = applicationsData?.applications?.map((app: any) => ({
      id: app.id,
      name: app.candidate?.full_name || `${app.candidate?.first_name} ${app.candidate?.last_name}`,
      initials: app.candidate?.first_name?.[0] + app.candidate?.last_name?.[0] || "NA",
      skills: "Patient care, Wound care, IV administration",
      currentEmployer: app.candidate?.current_employer || "N/A",
      experience: `${app.candidate?.years_of_experience || 0} yrs`,
      status: app.status,
      assignedJob: app.job?.job_title || "N/A",
    })) || [];

    switch (selectedDashboardMetric) {
      case "applied":
        return dashboardCandidates;
      case "interviewing":
        return dashboardCandidates.filter((c: any) => c.status === "INTERVIEWING");
      case "hired":
        return dashboardCandidates.filter((c: any) => c.status === "ACCEPTED");
      case "pending":
        return dashboardCandidates.filter((c: any) => c.status === "PENDING");
      default:
        return [];
    }
  }, [selectedDashboardMetric, jobs, applicationsData]);

  // Pagination
  const itemsPerPage = 5;
  const totalPages = Math.ceil(dashboardTableData.length / itemsPerPage);
  const paginatedDashboardData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return dashboardTableData.slice(startIndex, startIndex + itemsPerPage);
  }, [dashboardTableData, currentPage]);

  if (isLoadingJobs || isLoadingApps) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
              </svg>
              <span>Recruitment</span>
            </div>
            <span>&gt;</span>
            <span className="text-gray-900">Dashboard</span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Recruitment Dashboard
            </h1>
            <div className="flex gap-3">
              <button
                onClick={() => router.push("/jobs/create")}
                className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors flex items-center gap-2"
              >
                <span className="text-lg">+</span>
                Post Job
              </button>
              <button
                onClick={() => router.push("/candidates/add")}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium text-sm transition-colors flex items-center gap-2"
              >
                <span className="text-lg">+</span>
                Add Candidate
              </button>
            </div>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard
            title="Total Open Jobs"
            value={dashboardMetrics.totalOpenJobs}
            percentChange={15}
            isPositive={true}
            isActive={selectedDashboardMetric === "openJobs"}
            onClick={() => setSelectedDashboardMetric("openJobs")}
          />
          <MetricCard
            title="Candidates Applied"
            value={dashboardMetrics.totalApplicants}
            percentChange={2.5}
            isPositive={true}
            isActive={selectedDashboardMetric === "applied"}
            onClick={() => setSelectedDashboardMetric("applied")}
          />
          <MetricCard
            title="Candidates in Interview Stage"
            value={dashboardMetrics.inInterviewStage}
            percentChange={3.2}
            isPositive={true}
            isActive={selectedDashboardMetric === "interviewing"}
            onClick={() => setSelectedDashboardMetric("interviewing")}
          />
          <MetricCard
            title="Hired This Month"
            value={dashboardMetrics.hiredThisMonth}
            percentChange={1}
            isPositive={true}
            isActive={selectedDashboardMetric === "hired"}
            onClick={() => setSelectedDashboardMetric("hired")}
          />
          <MetricCard
            title="Pending Approvals"
            value={dashboardMetrics.pendingApprovals}
            percentChange={10}
            isPositive={true}
            isActive={selectedDashboardMetric === "pending"}
            onClick={() => setSelectedDashboardMetric("pending")}
          />
        </div>

        {/* Search and Table */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative sm:w-80">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
            <button className="px-4 py-2 hover:bg-gray-50 rounded-lg text-sm font-medium border border-gray-300 inline-flex items-center gap-2 sm:ml-auto">
              <Image src="/svg/Filter.svg" alt="filter" width={16} height={16} />
              Filters
            </button>
          </div>

          {/* Conditional Table Rendering */}
          {selectedDashboardMetric === "openJobs" ? (
            <DashboardJobsTable jobs={paginatedDashboardData} router={router} />
          ) : (
            <DashboardCandidatesTable
              candidates={paginatedDashboardData}
              showStatus={selectedDashboardMetric === "interviewing"}
              showAssignedJob={selectedDashboardMetric === "hired"}
              showCurrentEmployer={selectedDashboardMetric === "pending"}
              router={router}
            />
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Page {currentPage} of {totalPages || 1}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default DashboardPage;
