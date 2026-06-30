"use client";

import Image from "next/image";
import { CalendarDays, Clock, Timer } from "lucide-react";
import { useJobDisputes } from "@/hooks/useJobData";
import type { JobDisputeItem, JobShiftCandidate } from "@/types";
import {
  EmptyState,
  LoadingRows,
  StatusBadge,
} from "../shared/JobDetailDataView";
import { formatDate, formatDateTime, formatLabel, formatPay, formatTime } from "../shared/job-detail-helpers";

type DisputesTabProps = {
  jobId: string;
};

export function DisputesTab({ jobId }: DisputesTabProps) {
  const { disputes, isLoading, error } = useJobDisputes(jobId);
  const disputeRows = disputes?.disputes ?? [];

  if (isLoading) return <LoadingRows />;
  if (error) return <EmptyState title="Unable to load disputes" description={error} />;
  if (disputeRows.length === 0) {
    return <EmptyState title="No disputes found" description="Disputes for this job will appear here." />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">Shift Disputes</h3>
        <p className="text-xs text-gray-400">Candidate attendance and dispute details for this job.</p>
      </div>
      {disputeRows.map((dispute, index) => (
        <DisputeCard key={dispute.id ?? dispute.dispute_id ?? dispute.assignment_id ?? index} dispute={dispute} />
      ))}
    </div>
  );
}

function DisputeCard({ dispute }: { dispute: JobDisputeItem }) {
  const assignment = dispute.assignment;
  const candidate = assignment?.candidate;
  const shift = assignment?.shift;
  const attendance = assignment?.shift_attendance ?? assignment?.latest_attendance;
  const candidateName = getCandidateName(candidate);
  const profileImage = candidate?.profile_image_url ?? candidate?.profile_image ?? null;

  return (
    <article className="overflow-hidden rounded-2xl border border-red-100 bg-white shadow-sm">
      <div className="border-b border-red-100 bg-gradient-to-r from-red-50 via-white to-white px-4 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-red-100 text-red-600 ring-2 ring-red-50">
              {profileImage ? (
                <Image
                  src={profileImage}
                  alt={candidateName}
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-sm font-bold">
                  {getInitials(candidateName)}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="truncate text-sm font-bold text-gray-900">{candidateName}</h4>
                {assignment?.status && (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                    {formatLabel(assignment.status)}
                  </span>
                )}
                <StatusBadge value={dispute.status ?? null} />
              </div>
              <p className="mt-1 text-xs font-medium text-gray-500">
                Raised {formatDateTime(dispute.created_at)}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-red-100 bg-white px-3 py-2 text-left sm:text-right">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Assignment</p>
            <p className="mt-1 max-w-[260px] truncate text-xs font-bold text-gray-900">
              {dispute.assignment_id ?? assignment?.id ?? "N/A"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <InfoPanel title="Reason" value={dispute.reason || "No reason provided"} />
          <InfoPanel title="Description" value={dispute.description || "No description provided"} />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <DisputeMetricCard
            icon={<CalendarDays size={16} />}
            label="Shift Date"
            value={formatDate(shift?.shift_date ?? null)}
          />
          <DisputeMetricCard
            icon={<Clock size={16} />}
            label="Planned Time"
            value={`${formatTime(shift?.planned_check_in ?? null)} - ${formatTime(shift?.planned_check_out ?? null)}`}
          />
          <DisputeMetricCard
            icon={<Timer size={16} />}
            label="Duration"
            value={formatDuration(shift?.planned_minutes)}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryMetricCard
            label="Check In"
            value={formatAttendanceTime(attendance?.actual_check_in)}
          />
          <SummaryMetricCard
            label="Check Out"
            value={formatAttendanceTime(attendance?.actual_check_out)}
          />
          <SummaryMetricCard label="Worked Min" value={formatDuration(attendance?.worked_minutes)} />
          <SummaryMetricCard label="Early Logout Min" value={formatDuration(attendance?.early_leave_minutes)} />
          <SummaryMetricCard label="Late Check-in" value={formatDuration(attendance?.late_minutes)} />
          <SummaryMetricCard
            label="Hourly Rate"
            value={formatPay(assignment?.hourly_rate_cents)}
          />
          <SummaryMetricCard
            label="Resolution"
            value={dispute.resolution_action ? formatLabel(dispute.resolution_action) : "N/A"}
          />
          <SummaryMetricCard
            label="Updated"
            value={formatDateTime(dispute.updated_at)}
          />
        </div>
      </div>
    </article>
  );
}

function InfoPanel({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{title}</p>
      <p className="mt-1 text-sm font-medium text-gray-700">{value}</p>
    </div>
  );
}

function DisputeMetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-red-600 ring-1 ring-gray-100">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-[11px] font-semibold uppercase tracking-wide text-gray-400">{label}</span>
        <span className="block truncate text-sm font-bold text-gray-900">{value}</span>
      </span>
    </div>
  );
}

function SummaryMetricCard({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white px-3 py-3 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-1 truncate text-sm font-bold text-gray-900">{value}</p>
    </div>
  );
}

function getCandidateName(candidate?: JobShiftCandidate | null) {
  const fullName = [candidate?.first_name, candidate?.last_name].filter(Boolean).join(" ");
  return candidate?.full_name?.trim() || fullName || "Unknown Candidate";
}

function formatDuration(value?: number | string | null) {
  if (value === null || value === undefined || value === "") return "N/A";

  const minutes = Number(value);
  if (!Number.isFinite(minutes)) return String(value);

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours === 0) return `${remainingMinutes}m`;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

function formatAttendanceTime(value?: string | null) {
  if (!value) return "N/A";
  if (/^\d{1,2}:\d{2}/.test(value)) return formatTime(value);

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return value;

  return parsedDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).toLowerCase();
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
