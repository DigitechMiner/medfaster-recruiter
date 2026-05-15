"use client";

import { BriefcaseBusiness, CalendarClock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { UnderfilledJobsTable } from "./UnderfilledJobsTable";
import { TodaysOperations } from "./TodaysOperations";

const tabTriggerClass =
  "gap-1.5 px-3 py-2.5 text-sm font-medium text-gray-600 rounded-md border border-transparent transition-colors data-[state=active]:border-gray-200 data-[state=active]:bg-white data-[state=active]:text-[#f47b20] data-[state=active]:shadow-sm hover:text-gray-900";

export function DashboardOperationsTabs() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden h-full flex flex-col min-h-0">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-900">Operations</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Underfilled roles and scheduled shifts
        </p>
      </div>

      <Tabs
        defaultValue="underfilled"
        className="flex flex-1 flex-col min-h-0 gap-0"
      >
        <div className="px-4 sm:px-6 pt-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <TabsList
            className={cn(
              "inline-flex h-auto min-h-10 w-max min-w-full flex-wrap gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 sm:flex-nowrap sm:justify-start",
            )}
          >
            <TabsTrigger
              value="underfilled"
              className={cn("inline-flex items-center", tabTriggerClass)}
            >
              <BriefcaseBusiness
                className="h-4 w-4 shrink-0 opacity-80"
                aria-hidden
              />
              Underfilled jobs
            </TabsTrigger>
            <TabsTrigger
              value="today"
              className={cn("inline-flex items-center", tabTriggerClass)}
            >
              <CalendarClock
                className="h-4 w-4 shrink-0 opacity-80"
                aria-hidden
              />
              Today&apos;s operations
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="underfilled" className="mt-0 flex-1 outline-none">
          <p className="px-4 sm:px-6 pt-3 pb-1 text-xs text-gray-500">
            Roles that still need hires against your targets
          </p>
          <UnderfilledJobsTable embedded />
        </TabsContent>

        <TabsContent value="today" className="mt-0 flex-1 outline-none">
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 pt-3 pb-1">
            <p className="text-xs text-gray-500">
              Candidates scheduled for shifts by time range
            </p>
            <button
              type="button"
              className="text-xs text-[#F4781B] font-medium hover:underline shrink-0"
            >
              View full schedule
            </button>
          </div>
          <TodaysOperations embedded />
        </TabsContent>
      </Tabs>
    </div>
  );
}
