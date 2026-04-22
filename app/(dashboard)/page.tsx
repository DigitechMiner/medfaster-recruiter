"use client";

import React, { useState, useMemo } from "react";
import {
  BriefcaseBusiness, Users, Sparkles, Layers,
  Gift, UserCheck, LogOut,
} from "lucide-react";

import { AppLayout }             from "@/components/global/app-layout";
import { MetricCard }            from "./components/MetricCard";
import { CandidateFunnelChart }  from "./components/CandidateFunnelChart";
import { MiniCalendar }          from "./components/MiniCalendar";
import { HiringFunnel }          from "./components/HiringFunnel";
import { LocationInsights }      from "./components/LocationInsights";
import { BottomWidgets }         from "./components/BottomWidgets";
import { AiMatchedCandidates }   from "./components/AiMatchedCandidates";
import { BottomCandidateCards }  from "./components/BottomCandidateCards";
import type { MetricType }       from "./types";
import { useAuthStore }          from "@/stores/authStore";
import { useRecruiterDashboard } from "@/hooks/useRecruiterData";

// ── Skeletons ────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
const DashboardPage: React.FC = () => {
  const { recruiterProfile } = useAuthStore();
  const [selectedPeriod,          setSelectedPeriod]          = useState("This Month");
  const [selectedDashboardMetric, setSelectedDashboardMetric] = useState<MetricType>("openJobs");

  // ── Single API call ───────────────────────────────────────────────────────
  const { dashboard, isLoading } = useRecruiterDashboard();

  // ── Derive every metric from the one endpoint ─────────────────────────────
  const jobs    = dashboard?.jobStatusOverview;
  const apps    = dashboard?.applicationStatusOverview;
  const normal  = apps?.NORMAL_JOB;
  const instant = apps?.INSTANT_JOB;

  const metrics = useMemo(() => ({
    // Row 1
    activeJobOpenings: (jobs?.OPEN ?? 0) + (jobs?.ACTIVE ?? 0),
    totalInPipeline:   apps?.TOTAL ?? 0,
    positionsFilled:   normal?.HIRE ?? 0,
    urgentStaffings:   (instant?.ACCEPTED ?? 0) + (instant?.CANCELLED ?? 0),

    // Row 2
    totalInvitesMade:  normal?.SHORTLISTED  ?? 0,   // shortlisted = invited to proceed
    totalHired:        normal?.HIRE         ?? 0,
    totalRejected:     normal?.REJECTED     ?? 0,
  }), [dashboard]);

  return (
    <AppLayout padding="none">
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
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
          {isLoading ? <MetricSkeleton count={4} /> : (
            <>
              <MetricCard
                icon={<BriefcaseBusiness className="w-4 h-4 text-[#F4781B]" />}
                title="Active Job Openings"
                value={metrics.activeJobOpenings}
                percentChange={0.10}
                isPositive={false}
                isActive={selectedDashboardMetric === "openJobs"}
                onClick={() => setSelectedDashboardMetric("openJobs")}
              />
              <MetricCard
                icon={<Users className="w-4 h-4 text-[#F4781B]" />}
                title="Total Candidates in Pipeline"
                value={metrics.totalInPipeline}
                percentChange={1.10}
                isPositive={true}
                isActive={selectedDashboardMetric === "applied"}
                onClick={() => setSelectedDashboardMetric("applied")}
              />
              <MetricCard
                icon={<Sparkles className="w-4 h-4 text-[#F4781B]" />}
                title="Positions Filled"
                value={metrics.positionsFilled}
                percentChange={1.10}
                isPositive={true}
                isActive={false}
                onClick={() => {}}
              />
              <MetricCard
                icon={<Layers className="w-4 h-4 text-[#F4781B]" />}
                title="Urgent Staffings"
                value={metrics.urgentStaffings}
                percentChange={2.10}
                isPositive={false}
                isActive={selectedDashboardMetric === "interviewing"}
                onClick={() => setSelectedDashboardMetric("interviewing")}
              />
            </>
          )}
        </div>

        {/* ── Metric Cards Row 2 ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          {isLoading ? <MetricSkeleton count={3} /> : (
            <>
              <MetricCard
                icon={<Gift className="w-4 h-4 text-[#F4781B]" />}
                title="Total Job Invites Made to Candidates"
                value={metrics.totalInvitesMade}
                percentChange={1.10}
                isPositive={true}
                isActive={false}
                onClick={() => {}}
              />
              <MetricCard
                icon={<UserCheck className="w-4 h-4 text-[#F4781B]" />}
                title="Total Hired"
                value={metrics.totalHired}
                percentChange={1.10}
                isPositive={true}
                isActive={selectedDashboardMetric === "hired"}
                onClick={() => setSelectedDashboardMetric("hired")}
              />
              <MetricCard
                icon={<LogOut className="w-4 h-4 text-[#F4781B]" />}
                title="Rejected"
                value={metrics.totalRejected}
                percentChange={2.10}
                isPositive={false}
                isActive={false}
                onClick={() => {}}
              />
            </>
          )}
        </div>

        {/* ── Chart + Calendar ── */}
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
          <div className="w-full md:w-72 xl:w-80 flex-shrink-0 flex flex-col">
            {isLoading
              ? <SectionSkeleton className="h-full min-h-[480px]" />
              : <MiniCalendar />
            }
          </div>
        </div>

        <BottomCandidateCards />

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

        <BottomWidgets />
      </div>
    </AppLayout>
  );
};

export default DashboardPage;