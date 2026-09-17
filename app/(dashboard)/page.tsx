"use client";
import React, { useState } from "react";
import { AppLayout } from "@/components/global/app-layout";
import { useAuthStore } from "@/stores/authStore";
import { useDashboardOverview } from "@/hooks/useDashboard";
import { DashboardMetricCard } from "./components/DashboardMetricCard";
import { TodaysTopIssues } from "./components/TodaysTopIssues";
import { TodaysOperationsPanel } from "./components/TodaysOperationsPanel";
import { JobsShiftsOverview } from "./components/JobsShiftsOverview";
import { QuickActions } from "./components/QuickActions";
import { IncompleteProfileBanner } from "@/components/profile/incomplete-profile-banner";
import { getJobCreateBlock } from "@/features/profile/completion";
import type { DashboardShiftRange } from "@/features/dashboard";

const DashboardPage: React.FC = () => {
  const recruiterProfile = useAuthStore((s) => s.recruiterProfile);
  const recruiterDocuments = useAuthStore((s) => s.recruiterDocuments);
  const { jobs, shifts, isLoading } = useDashboardOverview();
  const [range, setRange] = useState<DashboardShiftRange>("today");
  const jobCreateBlock = getJobCreateBlock(
    recruiterProfile,
    recruiterDocuments,
  );

  const firstName =
    recruiterProfile?.contact_person_name?.split(" ")[0] ??
    recruiterProfile?.organization_name ??
    "there";

  const noShows        = shifts?.MISSED ?? 0;
  const activeJobs     = jobs?.ACTIVE ?? 0;
  const upcomingJobs   = jobs?.UPCOMING ?? 0;
  const openJobs       = jobs?.OPEN ?? 0;
  const activeShifts   = shifts?.ACTIVE ?? 0;
  const upcomingShifts = shifts?.UPCOMING ?? 0;
  const openShifts     = (shifts?.UPCOMING ?? 0) + (shifts?.ACTIVE ?? 0);

  return (
    <AppLayout padding="none">
      <div className="flex flex-col gap-4 p-3 sm:p-4 md:p-5 xl:p-6 mx-auto w-full">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Hello, {firstName} 👋
            </h1>
            <p className="text-sm text-gray-500">
              Here&apos;s what&apos;s happening in your operations today
            </p>
          </div>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value as DashboardShiftRange)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-1 focus:ring-[#F4781B] cursor-pointer"
          >
            <option value="today">Today&apos;s</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>

        {jobCreateBlock && (
          <IncompleteProfileBanner block={jobCreateBlock} />
        )}

        {/* Top Metric Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <DashboardMetricCard
            loading={isLoading}
            icon="clock"
            title="Active Jobs"
            value={activeJobs}
            subLabel={`${activeShifts} Active Shifts`}
            trend={-0.10}
            trendUp={false}
          />
          <DashboardMetricCard
            loading={isLoading}
            icon="users"
            title="Upcoming Jobs"
            value={upcomingJobs}
            subLabel={`${upcomingShifts} Upcoming Shifts`}
            trend={+1.10}
            trendUp
          />
          <DashboardMetricCard
            loading={isLoading}
            icon="briefcase"
            title="Open Jobs"
            value={openJobs}
            subLabel={`${openShifts} Open Shifts`}
            trend={+1.10}
            trendUp
          />
          <DashboardMetricCard
            loading={isLoading}
            icon="alert"
            title="No-Shows"
            value={noShows}
            valueClassName="text-[#F4781B]"
            subLabel={`${activeJobs} Active Jobs`}
            trend={+2.10}
            trendUp={false}
            trendNegative
          />
        </div>

        {/* Main layout
            - lg: Issues | Overview side-by-side (dense), Operations full-width below
            - xl+: 3-col with fluid middle so the table isn't crushed beside the sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-flow-dense xl:grid-cols-[minmax(240px,300px)_minmax(0,1fr)_minmax(220px,280px)] xl:grid-flow-row gap-3 items-start">

          {/* Col 1: Today's Top Issues */}
          <div className="min-w-0 self-stretch flex flex-col">
            <TodaysTopIssues
              noShows={noShows}
              lateArrivals={shifts?.LATE_CHECK_IN ?? 0}
              positionsUnfilled={jobs?.OPEN ?? 0}
              pendingCheckIns={shifts?.UPCOMING ?? 0}
              isLoading={isLoading}
            />
          </div>

          {/* Col 2: Today's Operations — spans full row on lg, middle track on xl */}
          <div className="min-w-0 w-full lg:col-span-2 xl:col-span-1">
            <TodaysOperationsPanel range={range} />
          </div>

          {/* Col 3: Overview + Quick Actions — backfills beside Issues on lg via dense */}
          <div className="min-w-0 flex flex-col gap-3">
            <JobsShiftsOverview
              active={shifts?.ACTIVE ?? 0}
              upcoming={shifts?.UPCOMING ?? 0}
              open={jobs?.OPEN ?? 0}
              completed={shifts?.COMPLETED ?? 0}
              isLoading={isLoading}
            />
            <QuickActions />
          </div>

        </div>

      </div>
    </AppLayout>
  );
};

export default DashboardPage; 