"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, FileText, TriangleAlert, Users, WalletCards } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { JobBackendResponse } from "@/types";
import { ApplicationsTab } from "./ApplicationsTab";
import { DescriptionTab } from "./DescriptionTab";
import { DisputesTab } from "./DisputesTab";
import { JobShiftsTab } from "./JobShiftsTab";
import { TransitionTab } from "./TransitionTab";

type JobDetailTab = "overview" | "applications" | "shifts" | "payments" | "dispute";

const tabTriggerClass =
  "gap-1.5 px-3 py-2.5 text-sm font-medium text-gray-600 rounded-md border border-transparent transition-colors data-[state=active]:border-gray-200 data-[state=active]:bg-white data-[state=active]:text-[#f47b20] data-[state=active]:shadow-sm hover:text-gray-900";

const JOB_DETAIL_TABS = [
  { key: "overview", label: "Overview", icon: FileText },
  { key: "applications", label: "Applications", icon: Users },
  { key: "shifts", label: "Shifts", icon: CalendarDays },
  { key: "payments", label: "Payments", icon: WalletCards },
  { key: "dispute", label: "Dispute", icon: TriangleAlert },
] satisfies { key: JobDetailTab; label: string; icon: typeof FileText }[];

const DEFAULT_JOB_DETAIL_TAB: JobDetailTab = "overview";
const JOB_DETAIL_TAB_KEYS = new Set<JobDetailTab>(
  JOB_DETAIL_TABS.map((tab) => tab.key),
);

function getValidJobDetailTab(tab: string | null): JobDetailTab {
  if (tab === "description") return "overview";
  if (tab === "job_shifts") return "shifts";
  if (tab === "transition" || tab === "fund_details") return "payments";

  return JOB_DETAIL_TAB_KEYS.has(tab as JobDetailTab)
    ? (tab as JobDetailTab)
    : DEFAULT_JOB_DETAIL_TAB;
}

type JobDetailTabsProps = {
  job: JobBackendResponse;
  jobId: string;
};

export function JobDetailTabs({ job, jobId }: JobDetailTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTab = getValidJobDetailTab(searchParams.get("tab"));

  const handleTabChange = useCallback(
    (tab: JobDetailTab) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tab);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

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
          {JOB_DETAIL_TABS.map((tab) => {
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

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="p-4 sm:p-5">
          <TabsContent value="overview" className="m-0">
            <DescriptionTab job={job} />
          </TabsContent>
          <TabsContent value="applications" className="m-0">
            <ApplicationsTab jobId={jobId} />
          </TabsContent>
          <TabsContent value="shifts" className="m-0">
            <JobShiftsTab job={job} jobId={jobId} />
          </TabsContent>
          <TabsContent value="payments" className="m-0">
            <TransitionTab jobId={jobId} />
          </TabsContent>
          <TabsContent value="dispute" className="m-0">
            <DisputesTab jobId={jobId} />
          </TabsContent>
        </div>
      </div>
    </Tabs>
  );
}
