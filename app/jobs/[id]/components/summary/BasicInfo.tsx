"use client";

import {
  CalendarDays,
  CreditCard,
  DollarSign,
  MapPin,
  Mic,
  RotateCcw,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";
import type { JobDetailSummaryData } from "@/types";
import { JobWorkflow } from "./JobWorkflow";
import {
  formatDateRange,
  formatLabel,
  formatPay,
} from "../shared/job-detail-helpers";

interface JobDetailSummaryProps {
  summary: JobDetailSummaryData;
}

function MetaPill({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-600">
      <span className="text-[#F4781B]">{icon}</span>
      {children}
    </span>
  );
}

function StatusBadge({
  children,
  variant = "status",
}: {
  children: React.ReactNode;
  variant?: "status" | "type" | "urgent" | "shift";
}) {
  const styles = {
    status: "text-blue-700 bg-blue-50 border-blue-100",
    type: "text-[#F4781B] bg-orange-50 border-orange-100",
    urgent: "text-red-700 bg-red-50 border-red-100",
    shift: "text-orange-700 bg-orange-50 border-orange-100",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold whitespace-nowrap ${styles[variant]}`}
    >
      {children}
    </span>
  );
}

function KpiCard({
  icon,
  label,
  value,
  subLabel,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  subLabel?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3.5 min-w-0">
      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[#F4781B]">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="mt-0.5 text-xl font-bold text-gray-900 leading-none">
          {value}
        </p>
        {subLabel && (
          <p className="mt-1 text-xs text-gray-400 truncate">{subLabel}</p>
        )}
      </div>
    </div>
  );
}

export function JobDetailSummary({ summary }: JobDetailSummaryProps) {
  const isInstant = summary.job_urgency === "INSTANT";
  const isRotational = summary.shift_mode?.toUpperCase() === "ROTATIONAL";

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* Header */}
        <div className="border-b border-gray-100 px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-2">
              <h1 className="text-xl font-extrabold leading-tight text-gray-900 sm:text-2xl">
                {summary.title}
              </h1>

              <div className="flex flex-wrap items-center gap-2">
                {summary.department && (
                  <MetaPill icon={<Users size={12} />}>
                    {summary.department}
                  </MetaPill>
                )}
                {summary.location && (
                  <MetaPill icon={<MapPin size={12} />}>
                    {summary.location}, Canada
                  </MetaPill>
                )}
                {(summary.start_date || summary.end_date) && (
                  <MetaPill icon={<CalendarDays size={12} />}>
                    {formatDateRange(summary.start_date, summary.end_date)}
                  </MetaPill>
                )}
                {!isInstant && summary.ai_interview != null && (
                  <MetaPill icon={<Mic size={12} />}>
                    AI Interview {summary.ai_interview ? "On" : "Off"}
                  </MetaPill>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <StatusBadge variant="status">
                {formatLabel(summary.status)}
              </StatusBadge>
              <StatusBadge variant="type">
                {formatLabel(summary.job_type)}
              </StatusBadge>
              {isInstant ? (
                <StatusBadge variant="urgent">Instant</StatusBadge>
              ) : (
                summary.shift_mode && (
                  <StatusBadge variant="shift">
                    {isRotational ? "Rotational Shifts" : "Standard Shifts"}
                  </StatusBadge>
                )
              )}
            </div>
          </div>
        </div>

        {/* KPI row — shown once, never duplicated in tabs */}
        <div className="border-b border-gray-100 bg-gray-50/50 px-4 py-4 sm:px-6">
          <div className="grid grid-cols-1 gap-3 xs:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              icon={<UserCheck size={16} />}
              label="Filled"
              value={`${summary.accepted}/${summary.required_workers}`}
              subLabel={`${summary.remaining} remaining`}
            />
            <KpiCard
              icon={<Users size={16} />}
              label="Workers"
              value={summary.required_workers}
              subLabel={
                isInstant
                  ? `${summary.applications} responses`
                  : `${summary.applications} applications`
              }
            />
            <KpiCard
              icon={<CalendarDays size={16} />}
              label="Shifts"
              value={summary.total_shifts}
              subLabel={`${summary.completed_shifts} completed`}
            />
            <KpiCard
              icon={<Wallet size={16} />}
              label="Funding"
              value={formatPay(summary.contract_amount_cents)}
              subLabel={formatLabel(summary.funding_status)}
            />
          </div>
        </div>

        {/* Workflow card — one per job type */}
        <div className="px-4 py-4 sm:px-6 sm:py-5">
          <JobWorkflow
            urgency={summary.job_urgency}
            progress={summary.hiring_progress}
            visibilityStage={summary.current_visibility_stage}
            totalVisibilityStages={summary.total_visibility_stages}
          />
        </div>
      </div>

      {/* Funding summary — top only, not repeated in Funding tab */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
          Funding summary
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
          <MetricCard
            icon={<DollarSign size={18} />}
            title="Contracted"
            value={formatPay(summary.contract_amount_cents)}
            subLabel={formatLabel(summary.funding_status)}
            className="border-gray-200"
          />
          <MetricCard
            icon={<Wallet size={18} />}
            title="Held"
            value={formatPay(summary.escrow_held_cents)}
            subLabel="In escrow"
            className="border-gray-200"
          />
          <MetricCard
            icon={<CreditCard size={18} />}
            title="Spent"
            value={formatPay(summary.spent_cents)}
            subLabel="Paid to candidates"
            className="border-gray-200"
          />
          <MetricCard
            icon={<RotateCcw size={18} />}
            title="Refunded"
            value={formatPay(summary.refunded_cents)}
            subLabel="Returned"
            className="border-gray-200"
          />
        </div>
      </div>
    </div>
  );
}
