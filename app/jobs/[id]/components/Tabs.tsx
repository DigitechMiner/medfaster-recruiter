"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Activity,
  CalendarDays,
  Zap,
  Users,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { JobDetailSummaryData } from "@/types";
import { ActivityTab } from "./activity/ActivityTab";
import { ApplicationsTab } from "./candidates/ApplicationsTab";
import { JobShiftsTab } from "./schedule/JobShiftsTab";
import { OverviewTab } from "./overview/OverviewTab";
import { ScheduleTab } from "./schedule/ScheduleTab";
import { TeamTab } from "./team/TeamTab";
import { TransitionTab } from "./funding/TransitionTab";

type JobDetailTab =
  | "overview"
  | "candidates"
  | "team"
  | "schedule"
  | "funding"
  | "activity";

const tabTriggerClass =
  "gap-1.5 px-3 py-2.5 text-sm font-medium text-gray-600 rounded-md border border-transparent transition-colors data-[state=active]:border-gray-200 data-[state=active]:bg-white data-[state=active]:text-[#f47b20] data-[state=active]:shadow-sm hover:text-gray-900";

const DEFAULT_JOB_DETAIL_TAB: JobDetailTab = "overview";
const JOB_DETAIL_TAB_KEYS = new Set<JobDetailTab>([
  "overview",
  "candidates",
  "team",
  "schedule",
  "funding",
  "activity",
]);

function getValidJobDetailTab(tab: string | null): JobDetailTab {
  if (tab === "description" || tab === "details") return "overview";
  if (tab === "applications" || tab === "candidates") return "candidates";
  if (tab === "team" || tab === "workforce" || tab === "workers") return "team";
  if (tab === "schedule" || tab === "job_shifts" || tab === "shifts") {
    return "schedule";
  }
  if (
    tab === "transition" ||
    tab === "fund_details" ||
    tab === "funding" ||
    tab === "payments"
  ) {
    return "funding";
  }

  return JOB_DETAIL_TAB_KEYS.has(tab as JobDetailTab)
    ? (tab as JobDetailTab)
    : DEFAULT_JOB_DETAIL_TAB;
}

type JobDetailTabsProps = {
  summary: JobDetailSummaryData;
  jobId: string;
};

export function JobDetailTabs({ summary, jobId }: JobDetailTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isInstant = summary.job_urgency === "INSTANT";

  const activeTab = getValidJobDetailTab(searchParams.get("tab"));

  const handleTabChange = useCallback(
    (tab: JobDetailTab) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tab);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const jobDetailTabs = [
    {
      key: "overview" as const,
      label: "Instant shifts",
      icon: Zap,
    },
    {
      key: "candidates" as const,
      label: isInstant ? "Responses" : "Applications",
      icon: Users,
    },
    { key: "team" as const, label: "Team", icon: UsersRound },
    { key: "schedule" as const, label: "Schedule", icon: CalendarDays },
    { key: "funding" as const, label: "Funding", icon: WalletCards },
    { key: "activity" as const, label: "Activity", icon: Activity },
  ];

  return (
    <Tabs
      value={activeTab}
      onValueChange={(tab) => handleTabChange(tab as JobDetailTab)}
      className="gap-3"
    >
      <div className="-mx-1 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <TabsList
          className={cn(
            "inline-flex h-auto min-h-10 w-max min-w-full flex-wrap gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 sm:flex-nowrap sm:justify-start",
          )}
        >
          {jobDetailTabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <TabsTrigger
                key={tab.key}
                value={tab.key}
                className={cn("inline-flex items-center", tabTriggerClass)}
              >
                <Icon className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </div>

      <div
        className={cn(
          activeTab === "schedule" || activeTab === "funding"
            ? "m-0"
            : "overflow-hidden rounded-2xl border border-gray-200 bg-white",
        )}
      >
        <div
          className={
            activeTab === "schedule" || activeTab === "funding"
              ? "m-0"
              : "p-4 sm:p-5"
          }
        >
          <TabsContent value="overview" className="m-0">
            <OverviewTab
              jobId={jobId}
              summary={summary}
              enabled={activeTab === "overview"}
            />
          </TabsContent>

          <TabsContent value="candidates" className="m-0">
            <ApplicationsTab
              jobId={jobId}
              aiInterviewEnabled={summary.ai_interview === true}
            />
          </TabsContent>

          <TabsContent value="team" className="m-0">
            <TeamTab jobId={jobId} enabled={activeTab === "team"} />
          </TabsContent>

          <TabsContent value="schedule" className="m-0">
            <div className="flex flex-col gap-4">
              <ScheduleTab
                jobId={jobId}
                enabled={activeTab === "schedule"}
              />
              <JobShiftsTab
                jobId={jobId}
                enabled={activeTab === "schedule"}
                title={isInstant ? "Broadcast shifts" : "Live shifts"}
                startDate={summary.start_date}
                endDate={summary.end_date}
                checkInTime={summary.next_shift?.start_time}
                checkOutTime={summary.next_shift?.end_time}
              />
            </div>
          </TabsContent>

          <TabsContent value="funding" className="m-0">
            <TransitionTab
              jobId={jobId}
              summary={summary}
              enabled={activeTab === "funding"}
            />
          </TabsContent>

          <TabsContent value="activity" className="m-0">
            <ActivityTab
              jobId={jobId}
              enabled={activeTab === "activity"}
            />
          </TabsContent>
        </div>
      </div>
    </Tabs>
  );
}
