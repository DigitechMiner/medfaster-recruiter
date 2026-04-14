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
      <div key={i} className="bg-white rounded-xl p-4 border-2 border-gray-100 h-28 animate-pulse" />
    ))}
  </>
);

const SectionSkeleton = ({ className = "" }: { className?: string }) => (
  <div className={`bg-white rounded-xl border-2 border-gray-100 animate-pulse ${className}`} />
);

const DashboardPage: React.FC = () => {
  const { recruiterProfile } = useAuthStore();
  const [selectedPeriod, setSelectedPeriod] = useState("This Month");
  const [selectedDashboardMetric, setSelectedDashboardMetric] = useState<MetricType>("openJobs");

  const { jobs, isLoading: jobsLoading } = useJobs();
  const { applications: applicationsData, isLoading: appsLoading } = useJobApplications();

  const isLoading = jobsLoading || appsLoading;

  const dashboardMetrics = useMemo<DashboardMetrics>(() => ({
    totalOpenJobs:    jobs?.filter((j) => j.status !== "CLOSED")?.length ?? 0,
    totalApplicants:
      (applicationsData as { pagination?: { total?: number } })?.pagination?.total ??
      applicationsData?.applications?.length ?? 0,
    inInterviewStage: applicationsData?.applications?.filter((a) => a.status === 'INTERVIEW')?.length  ?? 0,
hiredThisMonth:   applicationsData?.applications?.filter((a) => a.status === 'HIRE')?.length       ?? 0,
pendingApprovals: applicationsData?.applications?.filter((a) => a.status === 'APPLIED')?.length    ?? 0,
  }), [jobs, applicationsData]);

  return (
    <AppLayout padding="none">
      {/* ✅ max-w-[1440px] keeps layout tight at 1280-1440px */}
      <div className="space-y-4 md:space-y-5 p-3 sm:p-4 md:p-5 xl:p-6 max-w-[1440px] mx-auto w-full">

        {/* ── Header ── */}
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-base sm:text-lg xl:text-xl font-semibold text-gray-900 truncate">
            Hello, {recruiterProfile?.organization_name ?? "Your Hospital"} 👋
          </h1>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            disabled
            title="Period filter coming soon"
            className="shrink-0 text-xs sm:text-sm border border-gray-200 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-gray-400 bg-white shadow-sm focus:outline-none opacity-60 cursor-not-allowed"
          >
            <option>This Month</option>
            <option>Last Month</option>
            <option>Last 3 Months</option>
            <option>This Year</option>
          </select>
        </div>

        {/* ── Metric Cards Row 1 ── */}
        {/* Mobile: 2-col | Desktop: 4-col */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
          {isLoading ? (
            <MetricSkeleton count={4} />
          ) : (
            <>
              <MetricCard
                icon={<BriefcaseBusiness className="w-4 h-4 text-[#F4781B]" />}
                title="Active Jobs Openings"
                value={dashboardMetrics.totalOpenJobs}
                percentChange={0.10}
                isPositive={false}
                isActive={selectedDashboardMetric === "openJobs"}
                onClick={() => setSelectedDashboardMetric("openJobs")}
              />
              <MetricCard
                icon={<Users className="w-4 h-4 text-[#F4781B]" />}
                title="Total Candidates in Pipeline"
                value={dashboardMetrics.totalApplicants}
                percentChange={1.10}
                isPositive={true}
                isActive={selectedDashboardMetric === "applied"}
                onClick={() => setSelectedDashboardMetric("applied")}
              />
              <MetricCard
                icon={<Sparkles className="w-4 h-4 text-[#F4781B]" />}
                title="Positions Filled"
                value={30}
                percentChange={1.10}
                isPositive={true}
                isActive={false}
                onClick={() => {}}
              />
              <MetricCard
                icon={<Layers className="w-4 h-4 text-[#F4781B]" />}
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
        {/* Mobile: 1-col | sm+: 3-col */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          {isLoading ? (
            <MetricSkeleton count={3} />
          ) : (
            <>
              <MetricCard
                icon={<Gift className="w-4 h-4 text-[#F4781B]" />}
                title="Total Job Invites Made to Candidates"
                value={32}
                percentChange={1.10}
                isPositive={true}
                isActive={false}
                onClick={() => {}}
              />
              <MetricCard
                icon={<UserCheck className="w-4 h-4 text-[#F4781B]" />}
                title="Total Hired"
                value={dashboardMetrics.hiredThisMonth}
                percentChange={1.10}
                isPositive={true}
                isActive={selectedDashboardMetric === "hired"}
                onClick={() => setSelectedDashboardMetric("hired")}
              />
              <MetricCard
                icon={<LogOut className="w-4 h-4 text-[#F4781B]" />}
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
        {/* ✅ stacked on mobile, side-by-side from md+ */}
        <div className="flex flex-col md:flex-row gap-3 md:gap-4">
          <div className="flex-1 flex flex-col gap-3 md:gap-4 min-w-0">
            {isLoading ? (
              <>
                <SectionSkeleton className="h-64 md:h-72" />
                <SectionSkeleton className="h-48 md:h-56" />
              </>
            ) : (
              <>
                <CandidateFunnelChart />
                <AiMatchedCandidates />
              </>
            )}
          </div>
          {/* ✅ fixed width calendar — consistent across all screen sizes */}
          <div className="w-full md:w-72 xl:w-80 flex-shrink-0 flex flex-col">
            {isLoading ? (
              <SectionSkeleton className="h-full min-h-[480px]" />
            ) : (
              <MiniCalendar />
            )}
          </div>
        </div>

        {/* ── Bottom Candidate Cards ── */}
        <BottomCandidateCards />

        {/* ── Recruiting Funnel + Location Insights ── */}
        {/* ✅ stacked on mobile, side-by-side from md+ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {isLoading ? (
            <>
              <SectionSkeleton className="h-64" />
              <SectionSkeleton className="h-64" />
            </>
          ) : (
            <>
              <HiringFunnel />
              <LocationInsights />
            </>
          )}
        </div>

        {/* ── Bottom Widgets ── */}
        <BottomWidgets />

      </div>
    </AppLayout>
  );
};

export default DashboardPage;