"use client";

import {
  CalendarCheck,
  CalendarDays,
  Clock,
  CreditCard,
  DollarSign,
  Home,
  Layers,
  MapPin,
  Phone,
  RotateCcw,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";
import type { JobBackendResponse } from "@/types";
import { useMetadataStore } from "@/stores/metadataStore";
import { getMetadataLabel } from "@/utils/constant/metadata";
import {
  formatDate,
  formatLabel,
  formatPay,
  formatTime,
  getJobRotationalTeams,
  getJobShiftCount,
  getJobShiftDisplayLines,
  getRotationalScheduleSubLabel,
  isRotationalJob,
} from "./job-detail-helpers";

interface JobDetailSummaryProps {
  job: JobBackendResponse;
}

function DetailChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-800">
      {children}
    </span>
  );
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
  variant?: "status" | "type" | "shift";
}) {
  const styles = {
    status: "text-blue-700 bg-blue-50 border-blue-100",
    type: "text-[#F4781B] bg-orange-50 border-orange-100",
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

function RequirementField({
  label,
  isEmpty,
  children,
}: {
  label: string;
  isEmpty?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/60 px-3.5 py-3 min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-1.5">
        {label}
      </p>
      {isEmpty ? (
        <p className="text-sm text-gray-400">N/A</p>
      ) : (
        <div className="flex flex-wrap items-center gap-1.5">{children}</div>
      )}
    </div>
  );
}

function StatCard({
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

function ScheduleCard({
  dateRange,
  dateDuration,
  shiftLines,
  timing,
  subLabel,
}: {
  dateRange: string;
  dateDuration: string | null;
  shiftLines: string[];
  timing: string;
  subLabel: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-orange-100 bg-gradient-to-br from-orange-50/80 to-white p-4 h-full">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#F4781B] mb-3">
        Schedule
      </p>

      <div className="space-y-4">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-white text-[#F4781B] shadow-sm">
            <CalendarDays size={14} />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-gray-500">Date</p>
            <p className="text-sm font-semibold text-gray-900 leading-snug">
              {dateRange}
            </p>
            {dateDuration && (
              <p className="text-xs text-gray-500 mt-0.5">{dateDuration}</p>
            )}
          </div>
        </div>

        <div className="h-px bg-orange-100" />

        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-white text-[#F4781B] shadow-sm">
            <Clock size={14} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium text-gray-500">Shifts</p>
            {shiftLines.length > 0 ? (
              <ul className="mt-1 space-y-1">
                {shiftLines.map((line) => (
                  <li
                    key={line}
                    className="text-sm font-medium text-gray-900 leading-snug"
                  >
                    {line}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm font-semibold text-gray-900">{timing}</p>
            )}
            {subLabel && (
              <p className="text-xs text-gray-500 mt-1.5">{subLabel}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDateRange(startDate?: string | null, endDate?: string | null) {
  if (!startDate && !endDate) return "N/A";
  if (!endDate) return formatDate(startDate);
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

function getDateDurationDays(
  startDate?: string | null,
  endDate?: string | null,
) {
  if (!startDate) return 0;
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : start;
  const days = Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1;
  if (!Number.isFinite(days) || days < 1) return 0;
  return days;
}

function formatDateDuration(
  startDate?: string | null,
  endDate?: string | null,
) {
  const days = getDateDurationDays(startDate, endDate);
  if (!days) return null;
  return `${days} ${days === 1 ? "Day" : "Days"}`;
}

function formatTimeDuration(checkIn?: string | null, checkOut?: string | null) {
  if (!checkIn || !checkOut) return null;
  const [inHours, inMinutes] = checkIn.split(":").map(Number);
  const [outHours, outMinutes] = checkOut.split(":").map(Number);
  if (
    [inHours, inMinutes, outHours, outMinutes].some(
      (value) => !Number.isFinite(value),
    )
  ) {
    return null;
  }
  let totalMinutes = outHours * 60 + outMinutes - (inHours * 60 + inMinutes);
  if (totalMinutes < 0) totalMinutes += 1440;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (minutes > 0) return `${hours}h ${minutes}m`;
  return `${hours} ${hours === 1 ? "Hour" : "Hours"}`;
}

export function JobDetailSummary({ job }: JobDetailSummaryProps) {
  const specializationOptions = useMetadataStore(
    (state) => state.specializations,
  );
  const instantJob = job.instantJob;
  const normalJob = job.normalJob;
  const location = [job.city, formatLabel(job.province)]
    .filter(Boolean)
    .join(", ");
  const timing =
    job.check_in_time && job.check_out_time
      ? `${formatTime(job.check_in_time)} to ${formatTime(job.check_out_time)}`
      : "N/A";
  const shiftDisplayLines = getJobShiftDisplayLines(job);
  const isInstantJob = job.job_urgency === "INSTANT";
  const isRotational = isRotationalJob(job);
  const rotationalTeams = getJobRotationalTeams(job);
  const specializations = normalJob?.specializations ?? [];
  const qualifications = normalJob?.qualifications ?? [];
  const funding = job.funding;
  const shiftCount = getJobShiftCount(job);
  const rotationalSubLabel = getRotationalScheduleSubLabel(job);
  const shiftsPerDay =
    job.shift_templates?.length ||
    new Set(
      rotationalTeams.flatMap((team) =>
        team.cycles
          .filter((cycle) => cycle.is_working)
          .map((cycle) => cycle.shift_template_index),
      ),
    ).size ||
    1;

  const scheduleSubLabel =
    rotationalSubLabel ??
    (shiftDisplayLines.length > 0
      ? `${shiftsPerDay} shift${shiftsPerDay === 1 ? "" : "s"} per day`
      : formatTimeDuration(job.check_in_time, job.check_out_time));

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* Header */}
        <div className="border-b border-gray-100 px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-extrabold leading-tight text-gray-900 sm:text-2xl">
                  {job.job_title}
                </h1>
                {job.department && (
                  <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600">
                    {job.department} Department
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {location && (
                  <MetaPill icon={<MapPin size={12} />}>
                    {location}, Canada
                  </MetaPill>
                )}
                {instantJob?.neighborhood_name && (
                  <MetaPill icon={<Home size={12} />}>
                    {instantJob.neighborhood_name}
                  </MetaPill>
                )}
                {instantJob?.direct_number && (
                  <MetaPill icon={<Phone size={12} />}>
                    {instantJob.direct_number}
                  </MetaPill>
                )}
                <MetaPill icon={<Clock size={12} />}>
                  {formatLabel(job.job_type)}
                </MetaPill>
                <MetaPill icon={<DollarSign size={12} />}>
                  <span className="font-semibold text-gray-900">
                    {formatPay(job.pay_per_hour_cents)}
                  </span>
                  <span className="text-gray-500"> /hr</span>
                </MetaPill>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <StatusBadge variant="status">
                {formatLabel(job.status)}
              </StatusBadge>
              <StatusBadge variant="type">
                {formatLabel(job.job_type)}
              </StatusBadge>
              {!isInstantJob && (
                <StatusBadge variant="shift">
                  {isRotational ? "Rotational Shifts" : "Standard Shifts"}
                </StatusBadge>
              )}
            </div>
          </div>
        </div>

        {/* Requirements + Schedule */}
        <div className="grid grid-cols-1 gap-4 px-4 py-4 sm:px-6 sm:py-5 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px]">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {isInstantJob ? (
              <>
                <RequirementField
                  label="Neighborhood Name"
                  isEmpty={!instantJob?.neighborhood_name}
                >
                  <DetailChip>{instantJob?.neighborhood_name}</DetailChip>
                </RequirementField>
                <RequirementField
                  label="Neighborhood Type"
                  isEmpty={!instantJob?.neighborhood_type}
                >
                  <DetailChip>
                    {formatLabel(instantJob?.neighborhood_type)}
                  </DetailChip>
                </RequirementField>
                <RequirementField
                  label="Direct Number"
                  isEmpty={!instantJob?.direct_number}
                >
                  <DetailChip>{instantJob?.direct_number}</DetailChip>
                </RequirementField>
              </>
            ) : (
              <>
                <RequirementField
                  label="Experience Required"
                  isEmpty={normalJob?.years_of_experience == null}
                >
                  <DetailChip>
                    {normalJob?.years_of_experience != null
                      ? `${formatLabel(normalJob.years_of_experience)} years`
                      : "N/A"}
                  </DetailChip>
                </RequirementField>
                <RequirementField
                  label="Required Specialization"
                  isEmpty={!specializations.length}
                >
                  {specializations.map((specialization) => (
                    <DetailChip key={specialization}>
                      {getMetadataLabel(
                        specializationOptions,
                        String(specialization),
                      )}
                    </DetailChip>
                  ))}
                </RequirementField>
                <RequirementField
                  label="Required Qualification"
                  isEmpty={!qualifications.length}
                >
                  {qualifications.map((qualification) => (
                    <DetailChip key={qualification}>
                      {formatLabel(qualification)}
                    </DetailChip>
                  ))}
                </RequirementField>
                {job.employment_tenure && (
                  <RequirementField label="Employment Tenure">
                    <DetailChip>{formatLabel(job.employment_tenure)}</DetailChip>
                  </RequirementField>
                )}
                <RequirementField label="AI Interview">
                  <DetailChip>
                    {normalJob?.ai_interview ? "Enabled" : "Disabled"}
                  </DetailChip>
                </RequirementField>
                {isRotational && (
                  <>
                    <RequirementField
                      label="Rotation Teams"
                      isEmpty={!rotationalTeams.length}
                    >
                      {rotationalTeams.map((team) => (
                        <DetailChip key={team.id}>{team.team_name}</DetailChip>
                      ))}
                    </RequirementField>
                    <RequirementField label="Rotation Cycle">
                      <DetailChip>
                        {job.rotation_cycle_days ?? 14} days
                        {job.cycle_start_day
                          ? ` · starts ${formatLabel(job.cycle_start_day)}`
                          : ""}
                      </DetailChip>
                    </RequirementField>
                  </>
                )}
              </>
            )}
          </div>

          <ScheduleCard
            dateRange={formatDateRange(job.start_date, job.end_date)}
            dateDuration={formatDateDuration(job.start_date, job.end_date)}
            shiftLines={shiftDisplayLines}
            timing={timing}
            subLabel={scheduleSubLabel}
          />
        </div>

        {/* Stats */}
        <div className="border-t border-gray-100 bg-gray-50/50 px-4 py-4 sm:px-6">
          <div className="grid grid-cols-1 gap-3 xs:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={<Users size={16} />}
              label="Applications"
              value={job.application_count}
              subLabel={
                job.closed_reason
                  ? `Closed: ${formatLabel(job.closed_reason)}`
                  : undefined
              }
            />
            <StatCard
              icon={<Layers size={16} />}
              label="Requirements"
              value={job.no_of_hires_required}
            />
            <StatCard
              icon={<UserCheck size={16} />}
              label="Hired"
              value={job.no_of_hires_hired}
            />
            <StatCard
              icon={<CalendarCheck size={16} />}
              label="Number of Shifts"
              value={shiftCount}
            />
          </div>
        </div>
      </div>

      {funding && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
          <MetricCard
            icon={<DollarSign size={18} />}
            title="Total Contracted"
            value={formatPay(
              funding.total_contract_amount_cents ?? funding.total_amount_cents,
            )}
            subLabel={
              funding.funding_type
                ? formatLabel(funding.funding_type)
                : formatLabel(funding.status)
            }
            className="border-gray-200"
          />
          <MetricCard
            icon={<Wallet size={18} />}
            title="Held Amount"
            value={formatPay(
              funding.total_held_amount_cents ?? funding.held_amount_cents,
            )}
            subLabel={formatLabel(funding.status)}
            className="border-gray-200"
          />
          <MetricCard
            icon={<CreditCard size={18} />}
            title="Spent Amount"
            value={formatPay(funding.total_spent_amount_cents)}
            subLabel="Paid to candidates"
            className="border-gray-200"
          />
          <MetricCard
            icon={<RotateCcw size={18} />}
            title="Refunded Amount"
            value={formatPay(
              funding.total_refunded_amount_cents ??
                funding.refunded_amount_cents,
            )}
            subLabel="Returned"
            className="border-gray-200"
          />
        </div>
      )}
    </div>
  );
}