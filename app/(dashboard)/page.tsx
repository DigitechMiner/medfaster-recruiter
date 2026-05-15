"use client";
import React from "react";
import {
  Activity,
  AlertOctagon,
  Ban,
  BriefcaseBusiness,
  CalendarClock,
  CalendarRange,
  ClipboardClock,
  Layers,
} from "lucide-react";
import { AppLayout } from "@/components/global/app-layout";
import { MetricCard } from "@/components/ui/metric-card";
import { DashboardOperationsTabs } from "./components/DashboardOperationsTabs";
import { QuickActions } from "./components/QuickActions";
import { DashboardWalletCard } from "./components/DashboardWalletCard";
import { useAuthStore } from "@/stores/authStore";
import { useDashboardOverview } from "@/hooks/useDashboard";

const iconClass = "w-4 h-4 text-[#F4781B]";

const DashboardPage: React.FC = () => {
  const { recruiterProfile } = useAuthStore();
  const { jobs, shifts, isLoading } = useDashboardOverview();

  const firstName =
    recruiterProfile?.contact_person_name?.split(" ")[0] ??
    recruiterProfile?.organization_name ??
    "there";

  return (
    <AppLayout padding="none">
      <div className="flex flex-col gap-4 p-3 sm:p-4 md:p-5 xl:p-6 mx-auto w-full">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Hello, {firstName} 👋
          </h1>
          <p className="text-sm text-gray-500">
            Here&apos;s what&apos;s happening in your operations today
          </p>
        </div>

        {/* Job + shift overview (API jobStatusOverview & shiftOverview) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard
            loading={isLoading}
            icon={<Layers className={iconClass} />}
            title="Jobs · Open"
            value={jobs?.OPEN ?? 0}
          />
          <MetricCard
            loading={isLoading}
            icon={<CalendarClock className={iconClass} />}
            title="Jobs · Upcoming"
            value={jobs?.UPCOMING ?? 0}
          />
          <MetricCard
            loading={isLoading}
            icon={<BriefcaseBusiness className={iconClass} />}
            title="Jobs · Active"
            value={jobs?.ACTIVE ?? 0}
          />
          <MetricCard
            loading={isLoading}
            icon={<CalendarRange className={iconClass} />}
            title="Shifts · Upcoming"
            value={shifts?.UPCOMING ?? 0}
          />
          <MetricCard
            loading={isLoading}
            icon={<Activity className={iconClass} />}
            title="Shifts · Active"
            value={shifts?.ACTIVE ?? 0}
          />
          <MetricCard
            loading={isLoading}
            icon={<ClipboardClock className={iconClass} />}
            title="Shifts · Late Check-In"
            value={shifts?.LATE_CHECK_IN ?? 0}
            valueClassName="text-orange-600"
          />
          <MetricCard
            loading={isLoading}
            icon={<AlertOctagon className={iconClass} />}
            title="Shifts · Missed"
            value={shifts?.MISSED ?? 0}
            valueClassName="text-red-500"
          />
          <MetricCard
            loading={isLoading}
            icon={<Ban className={iconClass} />}
            title="Shifts · Cancelled"
            value={shifts?.CANCELLED ?? 0}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch">
          <QuickActions />
          <DashboardWalletCard />
        </div>

        <div className="grid grid-cols-1 gap-3 items-stretch">
          <DashboardOperationsTabs />
        </div>

      </div>
    </AppLayout>
  );
};

export default DashboardPage;
