"use client";

import { Check } from "lucide-react";
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
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            {workflow.title}
          </p>
          <p className="mt-0.5 text-[11px] text-gray-400">
            Candidate pipeline
          </p>
        </div>
        <span className="rounded-full border border-orange-100 bg-orange-50 px-2.5 py-1 text-xs font-bold text-[#F4781B]">
          {workflow.fillPercent}% filled
        </span>
      </div>

      <div className="px-4 py-3.5">
        <div className="flex items-start">
          {workflow.stages.map((stage, index) => {
            const isActive = index === workflow.currentStageIndex;
            const isPast = index < workflow.currentStageIndex;
            const isFirst = index === 0;
            const isLast = index === workflow.stages.length - 1;

            return (
              <div
                key={stage.key}
                className="flex min-w-0 flex-1 flex-col items-center text-center"
              >
                <div className="relative flex h-7 w-full items-center justify-center">
                  {!isFirst && (
                    <div
                      className={cn(
                        "absolute left-0 top-1/2 h-0.5 w-1/2 -translate-y-1/2",
                        isPast || isActive ? "bg-[#F4781B]" : "bg-gray-200",
                      )}
                    />
                  )}
                  {!isLast && (
                    <div
                      className={cn(
                        "absolute right-0 top-1/2 h-0.5 w-1/2 -translate-y-1/2",
                        isPast ? "bg-[#F4781B]" : "bg-gray-200",
                      )}
                    />
                  )}
                  <span
                    className={cn(
                      "relative z-10 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border text-[10px] font-bold",
                      isActive
                        ? "border-[#F4781B] bg-[#F4781B] text-white ring-4 ring-orange-50"
                        : isPast
                          ? "border-orange-200 bg-orange-50 text-[#F4781B]"
                          : "border-gray-200 bg-white text-gray-400",
                    )}
                  >
                    {isPast ? <Check className="h-3.5 w-3.5" /> : index + 1}
                  </span>
                </div>
                <p
                  className={cn(
                    "mt-2 truncate px-1 text-[10px] font-medium leading-tight sm:text-xs",
                    isActive
                      ? "font-semibold text-[#F4781B]"
                      : "text-gray-500",
                  )}
                >
                  {stage.label}
                </p>
                <p
                  className={cn(
                    "mt-0.5 text-sm font-bold",
                    isActive ? "text-[#F4781B]" : "text-gray-900",
                  )}
                >
                  {stage.count}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-3 h-1 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-[#F4781B] transition-all"
            style={{ width: `${Math.min(workflow.fillPercent, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
