"use client";

import { useJobSchedule } from "@/hooks/useJobData";
import { SchedulePlanPanel } from "./SchedulePlanPanel";

type ScheduleTabProps = {
  jobId: string;
  enabled?: boolean;
};

export function ScheduleTab({ jobId, enabled = true }: ScheduleTabProps) {
  const { schedule, isLoading, error } = useJobSchedule(jobId, enabled);

  return (
    <SchedulePlanPanel
      schedule={schedule}
      isLoading={isLoading}
      error={error}
    />
  );
}
