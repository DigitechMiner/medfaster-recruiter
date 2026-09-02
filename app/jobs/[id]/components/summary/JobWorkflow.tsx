"use client";

import { Check, Eye } from "lucide-react";
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
  sublabel?: string;
  time?: string;
  count?: number;
  hint?: string;
  startsPublic?: boolean;
};

/**
 * Instant job broadcast waves.
 * Dispatch stops when filled. After in-house (stage 2), stage 3 marks the
 * job public (`is_public`) so it appears in GET /jobs/urgent. Later radius
 * waves still notify their ring. A cancel-after-accept restarts at stage 1.
 */
const PUBLIC_STAGE_INDEX = 2;
const TEAM_STAGE_COUNT = 2;

const INSTANT_BROADCAST_STAGES: WorkflowStage[] = [
  {
    key: "inner-team",
    label: "Inner Team",
    time: "0 min",
    hint: "Immediate — notify inner team only",
  },
  {
    key: "in-house",
    label: "In-house",
    time: "1 min",
    hint: "After 1 min — notify in-house team only",
  },
  {
    key: "external-5km",
    label: "5 km",
    time: "3 min",
    startsPublic: true,
    hint: "Notify 5 km and list the job in the public feed for everyone under 40 km",
  },
  {
    key: "external-10km",
    label: "10 km",
    time: "5 min",
    hint: "Notify 10 km. Already listed in the public feed",
  },
  {
    key: "external-20km",
    label: "20 km",
    time: "7 min",
    hint: "Notify 20 km. Already listed in the public feed",
  },
  {
    key: "external-30km",
    label: "30 km",
    time: "9 min",
    hint: "Notify 30 km. Already listed in the public feed",
  },
  {
    key: "global",
    label: "Global",
    time: "11 min",
    hint: "Notify 40 km. Already listed in the public feed",
  },
];

export type JobWorkflowData = {
  title: string;
  subtitle: string;
  stages: WorkflowStage[];
  currentStageIndex: number;
  fillPercent: number;
  variant: "broadcast" | "hiring";
  isPublic?: boolean;
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
    subtitle: "Candidate pipeline",
    stages,
    currentStageIndex,
    fillPercent: progress.fill_percent,
    variant: "hiring",
  };
}

function buildInstantWorkflow(
  progress: JobDetailInstantHiringProgress,
  visibilityStage: number | null,
): JobWorkflowData {
  const stages = INSTANT_BROADCAST_STAGES;
  const rawStage = visibilityStage && visibilityStage > 0
    ? visibilityStage
    : progress.stage;
  const currentStageIndex = Math.min(
    Math.max(rawStage, 1) - 1,
    stages.length - 1,
  );
  const isPublic = currentStageIndex >= PUBLIC_STAGE_INDEX;
  const current = stages[currentStageIndex];

  return {
    title: "Broadcast Progress",
    subtitle: `Now notifying ${current.label} · stops when filled`,
    stages,
    currentStageIndex,
    fillPercent: progress.fill_percent,
    variant: "broadcast",
    isPublic,
  };
}

export function buildJobWorkflow(
  urgency: JobUrgency,
  progress: JobDetailHiringProgress | null | undefined,
  visibilityStage: number | null,
  _totalVisibilityStages: number | null,
): JobWorkflowData | null {
  if (!progress) return null;

  if (urgency === "INSTANT" && progress.kind === "instant") {
    return buildInstantWorkflow(progress, visibilityStage);
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

function StageNode({
  stage,
  index,
  isActive,
  isPast,
  isFirst,
  isLast,
}: {
  stage: WorkflowStage;
  index: number;
  isActive: boolean;
  isPast: boolean;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <div
      className="flex min-w-0 flex-1 flex-col items-center text-center"
      title={stage.hint}
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
          "mt-2 px-0.5 text-[10px] font-medium leading-tight sm:text-xs",
          isActive ? "font-semibold text-[#F4781B]" : "text-gray-600",
        )}
      >
        {stage.label}
      </p>
      {stage.time ? (
        <p
          className={cn(
            "mt-0.5 text-[10px] tabular-nums leading-tight",
            isActive ? "font-semibold text-[#F4781B]" : "text-gray-400",
          )}
        >
          {stage.time}
        </p>
      ) : null}
      {stage.startsPublic ? (
        <span
          className={cn(
            "mt-1 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-semibold",
            isPast || isActive
              ? "bg-orange-50 text-[#F4781B]"
              : "bg-gray-50 text-gray-400",
          )}
        >
          <Eye className="h-2.5 w-2.5" />
          Public starts
        </span>
      ) : null}
      {stage.count != null ? (
        <p
          className={cn(
            "mt-0.5 text-sm font-bold",
            isActive ? "text-[#F4781B]" : "text-gray-900",
          )}
        >
          {stage.count}
        </p>
      ) : null}
    </div>
  );
}

function StageRow({
  stages,
  startIndex,
  currentStageIndex,
}: {
  stages: WorkflowStage[];
  startIndex: number;
  currentStageIndex: number;
}) {
  return (
    <div className="flex items-start">
      {stages.map((stage, offset) => {
        const index = startIndex + offset;
        return (
          <StageNode
            key={stage.key}
            stage={stage}
            index={index}
            isActive={index === currentStageIndex}
            isPast={index < currentStageIndex}
            isFirst={offset === 0}
            isLast={offset === stages.length - 1}
          />
        );
      })}
    </div>
  );
}

function BroadcastStepper({
  stages,
  currentStageIndex,
}: {
  stages: WorkflowStage[];
  currentStageIndex: number;
}) {
  const teamStages = stages.slice(0, TEAM_STAGE_COUNT);
  const radiusStages = stages.slice(TEAM_STAGE_COUNT);

  return (
    <div className="-mx-1 overflow-x-auto">
      <div className="flex min-w-[40rem] items-stretch gap-3">
        <div className="w-[30%] min-w-[9.5rem] rounded-lg bg-gray-50 px-2 pb-3 pt-2">
          <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-wide text-gray-400">
            Team
          </p>
          <StageRow
            stages={teamStages}
            startIndex={0}
            currentStageIndex={currentStageIndex}
          />
        </div>
        <div className="min-w-0 flex-1 rounded-lg border border-orange-100 bg-orange-50/40 px-2 pb-3 pt-2">
          <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-wide text-[#F4781B]">
            Radius notify · public listing
          </p>
          <StageRow
            stages={radiusStages}
            startIndex={TEAM_STAGE_COUNT}
            currentStageIndex={currentStageIndex}
          />
        </div>
      </div>
    </div>
  );
}

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

  const isBroadcast = workflow.variant === "broadcast";

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            {workflow.title}
          </p>
          <p className="mt-0.5 text-[11px] text-gray-400">
            {workflow.subtitle}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          {workflow.isPublic ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-orange-100 bg-orange-50 px-2.5 py-1 text-[11px] font-semibold text-[#F4781B]">
              <Eye className="h-3 w-3" />
              In public feed
            </span>
          ) : null}
          <span className="rounded-full border border-orange-100 bg-orange-50 px-2.5 py-1 text-xs font-bold text-[#F4781B]">
            {workflow.fillPercent}% filled
          </span>
        </div>
      </div>

      <div className="px-4 py-3.5">
        {isBroadcast ? (
          <BroadcastStepper
            stages={workflow.stages}
            currentStageIndex={workflow.currentStageIndex}
          />
        ) : (
          <StageRow
            stages={workflow.stages}
            startIndex={0}
            currentStageIndex={workflow.currentStageIndex}
          />
        )}

        <div className="mt-3 h-1 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-[#F4781B] transition-all"
            style={{ width: `${Math.min(workflow.fillPercent, 100)}%` }}
          />
        </div>

        {isBroadcast ? (
          <p className="mt-3 text-[11px] leading-5 text-gray-400">
            At <span className="font-medium text-gray-600">5 km</span> the job
            is listed in the public feed for everyone under 40 km. Later waves
            only notify a wider radius. If a hire cancels, broadcast restarts
            from Inner Team.
          </p>
        ) : null}
      </div>
    </div>
  );
}
