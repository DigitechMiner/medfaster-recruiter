"use client";

import {
  Briefcase,
  Calendar,
  CircleDollarSign,
  Eye,
  FileText,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import { useJobActivity } from "@/hooks/useJobData";
import type { JobDetailActivityEvent } from "@/types";
import { EmptyState, LoadingRows } from "../shared/JobDetailDataView";
import { formatDateTime, formatLabel, formatPay } from "../shared/job-detail-helpers";

type ActivityTabProps = {
  jobId: string;
  enabled?: boolean;
  limit?: number;
};

const ACTIVITY_ICON_MAP: Record<string, typeof Briefcase> = {
  JOB_CREATED: Briefcase,
  FUNDING_HELD: CircleDollarSign,
  FUNDING_RELEASED: CircleDollarSign,
  VISIBILITY_STAGE: Eye,
  BROADCAST_SENT: Eye,
  CANDIDATE_APPLIED: Users,
  CANDIDATE_SHORTLISTED: UserPlus,
  INTERVIEW_SCHEDULED: Calendar,
  INTERVIEW_COMPLETED: Calendar,
  CANDIDATE_HIRED: UserCheck,
  WORKER_HIRED: UserCheck,
  CANDIDATE_REJECTED: XCircle,
  CANDIDATE_WITHDRAWN: UserMinus,
};

function getActivityIcon(type: string) {
  if (ACTIVITY_ICON_MAP[type]) return ACTIVITY_ICON_MAP[type];

  const normalized = type.toLowerCase();
  if (normalized.includes("fund") || normalized.includes("escrow")) {
    return CircleDollarSign;
  }
  if (normalized.includes("visibility") || normalized.includes("broadcast")) {
    return Eye;
  }
  if (normalized.includes("shortlist")) return UserPlus;
  if (normalized.includes("interview")) return Calendar;
  if (normalized.includes("reject")) return XCircle;
  if (normalized.includes("withdraw")) return UserMinus;
  if (normalized.includes("applied")) return Users;
  if (normalized.includes("hire") || normalized.includes("worker")) {
    return UserCheck;
  }
  if (normalized.includes("created")) return Briefcase;
  return FileText;
}

function getEventTimestamp(event: JobDetailActivityEvent) {
  return event.occurred_at ?? event.timestamp ?? event.created_at ?? null;
}

function formatCandidateId(candidateId: string) {
  if (candidateId.length <= 12) return candidateId;
  return `${candidateId.slice(0, 6)}…${candidateId.slice(-4)}`;
}

function getEventDetail(event: JobDetailActivityEvent): string | null {
  if (event.amount_cents != null && event.amount_cents !== "") {
    return formatPay(event.amount_cents);
  }
  if (event.candidate_id) {
    return `Candidate ${formatCandidateId(event.candidate_id)}`;
  }
  if (event.description) return event.description;
  return null;
}

export function ActivityTab({
  jobId,
  enabled = true,
  limit,
}: ActivityTabProps) {
  const { activity, isLoading, error } = useJobActivity(jobId, enabled);
  const events = (activity?.events ?? []).slice(0, limit);

  if (isLoading) {
    return <LoadingRows count={5} />;
  }

  if (error) {
    return (
      <EmptyState title="Unable to load activity" description={error} />
    );
  }

  if (events.length === 0) {
    return (
      <EmptyState
        title="No activity yet"
        description={
          limit
            ? undefined
            : "Job timeline events will appear here as the post goes live, receives applications, and hires are made."
        }
      />
    );
  }

  return (
    <ol className="relative flex flex-col gap-0">
      {events.map((event, index) => {
        const Icon = getActivityIcon(event.type);
        const isLast = index === events.length - 1;
        const detail = getEventDetail(event);
        const eventKey = `${event.type}-${getEventTimestamp(event) ?? index}`;

        return (
          <li key={eventKey} className="relative flex gap-4 pb-8">
            {!isLast && (
              <span
                className="absolute left-[17px] top-9 bottom-0 w-px bg-gray-200"
                aria-hidden
              />
            )}
            <span className="relative z-10 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-orange-100 bg-orange-50 text-[#F4781B]">
              <Icon size={16} />
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-gray-900">
                  {event.label || formatLabel(event.type)}
                </p>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                  {formatLabel(event.type)}
                </span>
              </div>
              {detail && (
                <p className="mt-1 text-sm text-gray-600">{detail}</p>
              )}
              <p className="mt-1.5 text-xs text-gray-400">
                {formatDateTime(getEventTimestamp(event))}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
