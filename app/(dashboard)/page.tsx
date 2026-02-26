"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Briefcase, Users, Sparkles, CalendarCheck, Gift, UserCheck, Clock, XCircle } from "lucide-react";
import { useJobs, useJobApplications } from "@/hooks/useJobData";
import { AppLayout } from "@/components/global/app-layout";
import { MetricCard } from "./components/MetricCard";
import { DashboardJobsTable } from "./components/DashboardJobsTable";
import { DashboardCandidatesTable } from "./components/DashboardCandidatesTable";
import { CandidateFunnelChart } from "./components/CandidateFunnelChart";
import { MiniCalendar } from "./components/MiniCalendar";
import { HiringFunnel } from "./components/HiringFunnel";
import { LocationInsights } from "./components/LocationInsights";
import { BottomWidgets } from "./components/BottomWidgets";
import { AiMatchedCandidates } from "./components/AiMatchedCandidates";
import { MetricType, DashboardJob, Candidate, Application, DashboardMetrics } from "./types";
import { useAuthStore } from "@/stores/authStore";


const DashboardPage: React.FC = () => {
  const router = useRouter();
  const { recruiterProfile} = useAuthStore();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDashboardMetric, setSelectedDashboardMetric] = useState<MetricType>("openJobs");

  const { jobs, isLoading: isLoadingJobs } = useJobs();
  const { applications: applicationsData, isLoading: isLoadingApps } = useJobApplications();

  // ✅ Reset page when switching metrics
  const handleMetricChange = (metric: MetricType) => {
    setSelectedDashboardMetric(metric);
    setCurrentPage(1);
  };

  const dashboardMetrics = useMemo<DashboardMetrics>(() => {
  const totalOpenJobs = jobs?.filter((j) => j.status !== "CLOSED")?.length || 250;      // ← demo fallback
  const totalApplicants = applicationsData?.applications?.length || 124;
  const inInterviewStage = applicationsData?.applications?.filter((app) => app.status === "INTERVIEWING")?.length || 16;
  const hiredThisMonth = applicationsData?.applications?.filter((app) => app.status === "ACCEPTED")?.length || 40;
  const pendingApprovals = applicationsData?.applications?.filter((app) => app.status === "PENDING")?.length || 0;
  return { totalOpenJobs, totalApplicants, inInterviewStage, hiredThisMonth, pendingApprovals };
}, [jobs, applicationsData]);


  // ✅ searchQuery wired up + page reset dependency
  const dashboardTableData = useMemo<DashboardJob[] | Candidate[]>(() => {
    if (selectedDashboardMetric === "openJobs") {
      return (
        jobs?.filter(
          (j) =>
            j.status !== "CLOSED" &&
            j.job_title.toLowerCase().includes(searchQuery.toLowerCase())
        ) || []
      );
    }

    const dashboardCandidates: Candidate[] =
      applicationsData?.applications?.map((app: Application) => ({
        id: app.id,
        name:
          app.candidate?.full_name ||
          `${app.candidate?.first_name} ${app.candidate?.last_name}`,
        initials:
          (app.candidate?.first_name?.[0] || "") +
            (app.candidate?.last_name?.[0] || "") || "NA",
        skills: "Patient care, Wound care, IV administration",
        currentEmployer: app.candidate?.current_employer || "N/A",
        experience: `${app.candidate?.years_of_experience || 0} yrs`,
        status: app.status,
        assignedJob: app.job?.job_title || "N/A",
      })) || [];

    const filtered = dashboardCandidates.filter((c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    switch (selectedDashboardMetric) {
      case "applied":
        return filtered;
      case "interviewing":
        return filtered.filter((c) => c.status === "INTERVIEWING");
      case "hired":
        return filtered.filter((c) => c.status === "ACCEPTED");
      case "pending":
        return filtered.filter((c) => c.status === "PENDING");
      default:
        return [];
    }
  }, [selectedDashboardMetric, jobs, applicationsData, searchQuery]); // ✅ searchQuery in deps

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
        {/* ── Header Row ── */}
<div className="flex items-center justify-between">
  <h1 className="text-xl font-semibold text-gray-900">
    Hello, {recruiterProfile?.company_name || recruiterProfile?.organization_type || "Toronto Hospital"} 👋
  </h1>
  <div className="flex items-center gap-3">
    {/* This Month dropdown */}
    <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 bg-white shadow-sm focus:outline-none focus:border-orange-400">
      <option>This Month</option>
      <option>Last Month</option>
      <option>Last 3 Months</option>
      <option>This Year</option>
    </select>
    {/* Post Job button */}
    <button
      onClick={() => router.push("/jobs/create")}
      className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
    >
      <span className="text-base leading-none">+</span>
      Post Job
    </button>
  </div>
</div>

        {/* ── Metric Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            icon={<Briefcase className="w-5 h-5 text-gray-600" />}
            title="Total Active Jobs"
            value={dashboardMetrics.totalOpenJobs}
            percentChange={0.10}
            isPositive={false}
            isActive={selectedDashboardMetric === "openJobs"}
            onClick={() => handleMetricChange("openJobs")}
          />
          <MetricCard
            icon={<Users className="w-5 h-5 text-gray-600" />}
            title="Total Candidates"
            value={dashboardMetrics.totalApplicants}
            percentChange={1.10}
            isPositive={true}
            isActive={selectedDashboardMetric === "applied"}
            onClick={() => handleMetricChange("applied")}
          />
          <MetricCard
            icon={<Sparkles className="w-5 h-5 text-gray-600" />}
            title="New AI-Matched"
            value={30}
            percentChange={1.10}
            isPositive={true}
            isActive={false}
            onClick={() => {}}
          />
          <MetricCard
            icon={<CalendarCheck className="w-5 h-5 text-gray-600" />}
            title="Interviews Scheduled"
            value={16}
            percentChange={2.10}
            isPositive={false}
            isActive={selectedDashboardMetric === "interviewing"}
            onClick={() => handleMetricChange("interviewing")}
          />
          <MetricCard
            icon={<Gift className="w-5 h-5 text-gray-600" />}
            title="Total Offers Made"
            value={32}
            percentChange={1.10}
            isPositive={true}
            isActive={false}
            onClick={() => {}}
          />
          <MetricCard
            icon={<UserCheck className="w-5 h-5 text-gray-600" />}
            title="Total Hired"
            value={dashboardMetrics.hiredThisMonth}
            percentChange={1.10}
            isPositive={true}
            isActive={selectedDashboardMetric === "hired"}
            onClick={() => handleMetricChange("hired")}
          />
          <MetricCard
            icon={<Clock className="w-5 h-5 text-gray-600" />}
            title="Time to Hire"
            value={"2 Days" as any}
            percentChange={0.10}
            isPositive={false}
            isActive={false}
            onClick={() => {}}
          />
          <MetricCard
            icon={<XCircle className="w-5 h-5 text-gray-600" />}
            title="Rejected"
            value={16}
            percentChange={2.10}
            isPositive={false}
            isActive={false}
            onClick={() => {}}
          />
        </div>

       {/* ── Funnel Chart + Calendar + AI Matched ── */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

  {/* Left 2/3: Chart stacked above AI Matched table */}
  <div className="lg:col-span-2 flex flex-col gap-4">
    <CandidateFunnelChart />
    <AiMatchedCandidates />
  </div>

  {/* Right 1/3: Calendar (full height) */}
  <div className="lg:col-span-1">
    <MiniCalendar />
  </div>

</div>

        {/* ── Hiring Funnel ── */}
        <HiringFunnel />

        {/* ── Location Insights ── */}
        <LocationInsights />

        {/* ── Jobs / Candidates Table ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            {/* Search */}
            <div className="relative sm:w-80">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // reset page on search
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Filter button */}
            <button className="px-4 py-2 hover:bg-gray-50 rounded-lg text-sm font-medium border border-gray-300 inline-flex items-center gap-2 sm:ml-auto">
              <Image src="/svg/Filter.svg" alt="filter" width={16} height={16} />
              Filters
            </button>
          </div>

          {/* Table */}
          {selectedDashboardMetric === "openJobs" ? (
            <DashboardJobsTable
              jobs={paginatedDashboardData as DashboardJob[]}
              router={router}
            />
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
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
              >
                Next →
              </button>
            </div>
          </div>
        </div>

        {/* ── Bottom Widgets ── */}
        <BottomWidgets />

      </div>
    </AppLayout>
  );
};

export default DashboardPage;
