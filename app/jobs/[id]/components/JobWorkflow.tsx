"use client";

import type {
  JobDetailHiringProgress,
  JobDetailInstantHiringProgress,
  JobDetailNormalHiringProgress,
  JobUrgency,
} from "@/types";
import { cn } from "@/lib/utils";

export type WorkflowStage = {
  key: string;
  label: string;
  count: number;
};

export type JobWorkflowData = {
  title: string;
  stages: WorkflowStage[];
  currentStageIndex: number;
  fillPercent: number;
};

function buildNormalWorkflow(
  progress: JobDetailNormalHiringProgress,
): JobWorkflowData {
  const reviewingCount = Math.max(
    0,
    progress.applications -
      progress.shortlisted -
      progress.interviewing -
      progress.interviewed -
      progress.hired -
      progress.rejected -
      progress.withdrawn,
  );

  const stages: WorkflowStage[] = [
    { key: "open", label: "Open", count: progress.applications },
    { key: "reviewing", label: "Reviewing", count: reviewingCount },
    { key: "shortlisted", label: "Shortlisted", count: progress.shortlisted },
    {
      key: "interviewing",
      label: "Interviewing",
      count: progress.interviewing + progress.interviewed,
    },
    { key: "hired", label: "Hired", count: progress.hired },
  ];

  const stageLabels = stages.map((stage) => stage.label.toLowerCase());
  const currentLabel = progress.current_stage_label.toLowerCase();
  let currentStageIndex = stageLabels.findIndex((label) =>
    currentLabel.includes(label),
  );

  if (currentStageIndex < 0) {
    if (currentLabel.includes("filled")) currentStageIndex = stages.length - 1;
    else if (currentLabel.includes("shortlist")) currentStageIndex = 2;
    else if (currentLabel.includes("interview")) currentStageIndex = 3;
    else currentStageIndex = 0;
  }

  return {
    title: "Hiring Progress",
    stages,
    currentStageIndex,
    fillPercent: progress.fill_percent,
  };
}

function buildInstantWorkflow(
  progress: JobDetailInstantHiringProgress,
  visibilityStage: number | null,
  totalVisibilityStages: number | null,
): JobWorkflowData {
  const stageCount = totalVisibilityStages && totalVisibilityStages > 0
    ? totalVisibilityStages
    : progress.total_stages;

  const defaultLabels = ["Inner Team", "Preferred", "Public", "Accepted"];
  const stages: WorkflowStage[] = Array.from(
    { length: Math.max(stageCount, 4) },
    (_, index) => {
      const label =
        defaultLabels[index] ??
        `Stage ${index + 1}`;

      let count = 0;
      if (index === stageCount - 1 || label === "Accepted") {
        count = progress.accepted;
      } else if (label === "Public" || index === stageCount - 2) {
        count = progress.responses;
      } else if (index === 0) {
        count = progress.broadcasts_sent;
      }

      return {
        key: `stage-${index}`,
        label,
        count,
      };
    },
  ).slice(0, Math.max(stageCount, 4));

  const currentStageIndex = visibilityStage
    ? Math.min(visibilityStage - 1, stages.length - 1)
    : Math.min(progress.stage - 1, stages.length - 1);

  return {
    title: "Broadcast Progress",
    stages,
    currentStageIndex: Math.max(0, currentStageIndex),
    fillPercent: progress.fill_percent,
  };
}

export function buildJobWorkflow(
  urgency: JobUrgency,
  progress: JobDetailHiringProgress | null | undefined,
  visibilityStage: number | null,
  totalVisibilityStages: number | null,
): JobWorkflowData | null {
  if (!progress) return null;

  if (urgency === "INSTANT" && progress.kind === "instant") {
    return buildInstantWorkflow(
      progress,
      visibilityStage,
      totalVisibilityStages,
    );
  }

  if (progress.kind === "normal") {
    return buildNormalWorkflow(progress);
  }

  return null;
}

type JobWorkflowProps = {
  urgency: JobUrgency;
  progress: JobDetailHiringProgress | null | undefined;
  visibilityStage?: number | null;
  totalVisibilityStages?: number | null;
};

export function JobWorkflow({
  urgency,
  progress,
  visibilityStage = null,
  totalVisibilityStages = null,
}: JobWorkflowProps) {
  const workflow = buildJobWorkflow(
    urgency,
    progress,
    visibilityStage,
    totalVisibilityStages,
  );

  if (!workflow) return null;

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
      <div className="mb-4 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          {workflow.title}
        </p>
        <span className="text-xs font-semibold text-[#F4781B]">
          {workflow.fillPercent}% filled
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-1">
          {workflow.stages.map((stage, index) => {
            const isActive = index === workflow.currentStageIndex;
            const isPast = index < workflow.currentStageIndex;

            return (
              <div
                key={stage.key}
                className="flex min-w-0 flex-1 flex-col items-center text-center"
              >
                <div className="flex w-full items-center">
                  {index > 0 && (
                    <div
                      className={cn(
                        "h-px flex-1",
                        isPast || isActive ? "bg-[#F4781B]" : "bg-gray-200",
                      )}
                    />
                  )}
                  <span
                    className={cn(
                      "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                      isActive
                        ? "bg-[#F4781B] text-white"
                        : isPast
                          ? "bg-orange-100 text-orange-700"
                          : "bg-gray-200 text-gray-500",
                    )}
                  >
                    {index + 1}
                  </span>
                  {index < workflow.stages.length - 1 && (
                    <div
                      className={cn(
                        "h-px flex-1",
                        isPast ? "bg-[#F4781B]" : "bg-gray-200",
                      )}
                    />
                  )}
                </div>
                <p
                  className={cn(
                    "mt-2 text-[10px] font-medium leading-tight sm:text-xs",
                    isActive ? "text-[#F4781B]" : "text-gray-500",
                  )}
                >
                  {stage.label}
                </p>
                <p className="mt-1 text-sm font-bold text-gray-900">
                  {stage.count}
                </p>
              </div>
            );
          })}
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-[#F4781B] transition-all"
            style={{ width: `${Math.min(workflow.fillPercent, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
