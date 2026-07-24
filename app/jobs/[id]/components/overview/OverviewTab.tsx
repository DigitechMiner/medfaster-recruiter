"use client";

import type { JobDetailSummaryData } from "@/types";
import { ChildJobsSection } from "../shared/ChildJobsSection";

type OverviewTabProps = {
  jobId: string;
  summary: JobDetailSummaryData;
  enabled?: boolean;
};

export function OverviewTab({
  jobId,
  summary,
  enabled = true,
}: OverviewTabProps) {
  return (
    <ChildJobsSection
      jobId={jobId}
      jobUrgency={summary.job_urgency}
      enabled={enabled}
    />
  );
}
