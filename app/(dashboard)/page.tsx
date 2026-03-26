"use client";
import React, { useState, useMemo } from "react";
import {
  BriefcaseBusiness, Users, Sparkles, Layers,
  Gift, UserCheck, LogOut
} from "lucide-react";
import { useJobs, useJobApplications } from "@/hooks/useJobData";
import { AppLayout } from "@/components/global/app-layout";
import { MetricCard } from "./components/MetricCard";
import { CandidateFunnelChart } from "./components/CandidateFunnelChart";
import { MiniCalendar } from "./components/MiniCalendar";
import { HiringFunnel } from "./components/HiringFunnel";
import { LocationInsights } from "./components/LocationInsights";
import { BottomWidgets } from "./components/BottomWidgets";
import { AiMatchedCandidates } from "./components/AiMatchedCandidates";
import { BottomCandidateCards } from "./components/BottomCandidateCards";
import { MetricType, DashboardMetrics } from "./types";
import { useAuthStore } from "@/stores/authStore";

const MetricSkeleton = ({ count }: { count: number }) => (
  <>
    {[...Array(count)].map((_, i) => (
      <div
        key={i}
        className="bg-white rounded-xl p-4 border-2 border-gray-100 h-28 animate-pulse"
      />
    ))}
  </>
);

const DashboardPage: React.FC = () => {
  const { recruiterProfile } = useAuthStore();
  const [selectedPeriod, setSelectedPeriod] = useState("This Month");
  const [selectedDashboardMetric, setSelectedDashboardMetric] = useState<MetricType>("openJobs");

  const { jobs, isLoading: jobsLoading } = useJobs();
  const { applications: applicationsData, isLoading: appsLoading } = useJobApplications();

  const isLoading = jobsLoading || appsLoading;

  const dashboardMetrics = useMemo<DashboardMetrics>(() => ({
    // Use pagination.total for accurate full count, not just current page length
    totalOpenJobs:    jobs?.filter((j) => j.status !== "CLOSED")?.length ?? 0,
    totalApplicants:  (applicationsData as any)?.pagination?.total
                      ?? applicationsData?.applications?.length
                      ?? 0,
    inInterviewStage: applicationsData?.applications?.filter((a) => a.status === "INTERVIEWING")?.length ?? 0,
    hiredThisMonth:   applicationsData?.applications?.filter((a) => a.status === "ACCEPTED")?.length ?? 0,
    pendingApprovals: applicationsData?.applications?.filter((a) => a.status === "PENDING")?.length ?? 0,
  }), [jobs, applicationsData]);

  return (
    <AppLayout>
      <div className="space-y-5 p-4 md:p-6">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">
            Hello, {recruiterProfile?.company_name ?? "Your Hospital"} 👋
          </h1>

          {/* Period selector — disabled until backend supports filtering */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            disabled
            title="Period filter coming soon"
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-400 bg-white shadow-sm focus:outline-none opacity-60 cursor-not-allowed"
          >
            <option>This Month</option>
            <option>Last Month</option>
            <option>Last 3 Months</option>
            <option>This Year</option>
          </select>
        </div>

        {/* ── Metric Cards Row 1 ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading ? (
            <MetricSkeleton count={4} />
          ) : (
            <>
              <MetricCard
                icon={<BriefcaseBusiness className="w-4 h-4 text-orange-500" />}
                title="Active Jobs Openings"
                value={dashboardMetrics.totalOpenJobs}
                percentChange={0.10}
                isPositive={false}
                isActive={selectedDashboardMetric === "openJobs"}
                onClick={() => setSelectedDashboardMetric("openJobs")}
              />
              <MetricCard
                icon={<Users className="w-4 h-4 text-orange-500" />}
                title="Total Candidates in Pipeline"
                value={dashboardMetrics.totalApplicants}
                percentChange={1.10}
                isPositive={true}
                isActive={selectedDashboardMetric === "applied"}
                onClick={() => setSelectedDashboardMetric("applied")}
              />
              <MetricCard
                icon={<Sparkles className="w-4 h-4 text-orange-500" />}
                title="Positions Filled"
                value={30}
                percentChange={1.10}
                isPositive={true}
                isActive={false}
                onClick={() => {}}
              />
              <MetricCard
                icon={<Layers className="w-4 h-4 text-orange-500" />}
                title="Urgent Staffings"
                value={dashboardMetrics.inInterviewStage}
                percentChange={2.10}
                isPositive={false}
                isActive={selectedDashboardMetric === "interviewing"}
                onClick={() => setSelectedDashboardMetric("interviewing")}
              />
            </>
          )}
        </div>

        {/* ── Metric Cards Row 2 ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {isLoading ? (
            <MetricSkeleton count={3} />
          ) : (
            <>
              <MetricCard
                icon={<Gift className="w-4 h-4 text-orange-500" />}
                title="Total Job Invites Made to Candidates"
                value={32}
                percentChange={1.10}
                isPositive={true}
                isActive={false}
                onClick={() => {}}
              />
              <MetricCard
                icon={<UserCheck className="w-4 h-4 text-orange-500" />}
                title="Total Hired"
                value={dashboardMetrics.hiredThisMonth}
                percentChange={1.10}
                isPositive={true}
                isActive={selectedDashboardMetric === "hired"}
                onClick={() => setSelectedDashboardMetric("hired")}
              />
              <MetricCard
                icon={<LogOut className="w-4 h-4 text-orange-500" />}
                title="Rejected"
                value={16}
                percentChange={2.10}
                isPositive={false}
                isActive={false}
                onClick={() => {}}
              />
            </>
          )}
        </div>

        {/* ── Chart + Calendar ── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-stretch">
          {/* Left — chart + AI table */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <CandidateFunnelChart />
            <AiMatchedCandidates />
          </div>

          {/* Right — calendar */}
          <div className="lg:col-span-1 flex flex-col">
            <MiniCalendar />
          </div>
        </div>

        {/* ── Bottom Candidate Cards ── */}
        <BottomCandidateCards />

        {/* ── Recruiting Funnel + Location Insights ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <HiringFunnel />
          <LocationInsights />
        </div>

        {/* ── Bottom Widgets ── */}
        <BottomWidgets />

      </div>
    </AppLayout>
  );
};

export default DashboardPage;
