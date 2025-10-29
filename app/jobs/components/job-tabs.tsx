"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function JobTabs() {
  return (
    <div className="mb-4 sm:mb-6 lg:mb-8">
      <Tabs defaultValue="jobs" className="w-full">
        <div className="w-full flex justify-center md:justify-start md:pl-[25%] lg:pl-[30%]">
          <TabsList className="bg-white border border-gray-200 w-full sm:w-auto inline-flex h-auto p-1">
            <TabsTrigger
              value="dashboard"
              className="data-[state=active]:bg-gray-100 text-xs sm:text-sm px-3 sm:px-4 py-2 flex-1 sm:flex-none"
            >
              Dashboard
            </TabsTrigger>
            <TabsTrigger
              value="jobs"
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-white text-xs sm:text-sm px-3 sm:px-4 py-2 flex-1 sm:flex-none"
            >
              Jobs
            </TabsTrigger>
            <TabsTrigger
              value="message"
              className="data-[state=active]:bg-gray-100 text-xs sm:text-sm px-3 sm:px-4 py-2 flex-1 sm:flex-none"
            >
              Message
            </TabsTrigger>
            <TabsTrigger
              value="closed"
              className="data-[state=active]:bg-gray-100 text-xs sm:text-sm px-3 sm:px-4 py-2 flex-1 sm:flex-none"
            >
              Closed Job
            </TabsTrigger>
          </TabsList>
        </div>
      </Tabs>
    </div>
  );
}
