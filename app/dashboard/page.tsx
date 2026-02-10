"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useJobs, useJobApplications } from "@/hooks/useJobData";
import { AppLayout } from "@/components/global/app-layout";
import { MetricCard } from "./components/MetricCard";
import { DashboardJobsTable } from "./components/DashboardJobsTable";
import { DashboardCandidatesTable } from "./components/DashboardCandidatesTable";
import { MetricType, DashboardJob, Candidate, Application, DashboardMetrics } from "./types";

const DashboardPage: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDashboardMetric, setSelectedDashboardMetric] = useState<MetricType>("openJobs");
  
  const { jobs, isLoading: isLoadingJobs } = useJobs();
  const { applications: applicationsData, isLoading: isLoadingApps } = useJobApplications();

  // Calculate dashboard metrics
  const dashboardMetrics = useMemo<DashboardMetrics>(() => {
    const totalOpenJobs = jobs?.filter((j) => j.status !== "CLOSED")?.length || 0;
    const totalApplicants = applicationsData?.applications?.length || 0;
    const inInterviewStage = applicationsData?.applications?.filter(
      (app) => app.status === "INTERVIEWING"
    )?.length || 0;
    const hiredThisMonth = applicationsData?.applications?.filter(
      (app) => app.status === "ACCEPTED"
    )?.length || 0;
    const pendingApprovals = applicationsData?.applications?.filter(
      (app) => app.status === "PENDING"
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
  const dashboardTableData = useMemo<DashboardJob[] | Candidate[]>(() => {
    if (selectedDashboardMetric === "openJobs") {
      return jobs?.filter((j) => j.status !== "CLOSED") || [];
    }
    
    // For candidate views, transform application data
    const dashboardCandidates: Candidate[] = applicationsData?.applications?.map((app: Application) => ({
      id: app.id,
      name: app.candidate?.full_name || `${app.candidate?.first_name} ${app.candidate?.last_name}`,
      initials: (app.candidate?.first_name?.[0] || "") + (app.candidate?.last_name?.[0] || "") || "NA",
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
        return dashboardCandidates.filter((c) => c.status === "INTERVIEWING");
      case "hired":
        return dashboardCandidates.filter((c) => c.status === "ACCEPTED");
      case "pending":
        return dashboardCandidates.filter((c) => c.status === "PENDING");
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
            <DashboardJobsTable jobs={paginatedDashboardData as DashboardJob[]} router={router} />
          ) : (
            <DashboardCandidatesTable
              candidates={paginatedDashboardData as Candidate[]}
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
