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

function InfoItem({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="text-[#F4781B] flex-shrink-0">{icon}</span>
      {children}
    </span>
  );
}

function DetailChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-3 py-1 rounded-md text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 whitespace-nowrap">
      {children}
    </span>
  );
}

function DetailRow({
  label,
  isEmpty,
  children,
}: {
  label: string;
  isEmpty?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 min-w-0">
      <span className="text-sm font-semibold text-[#F4781B] whitespace-nowrap flex-shrink-0">
        {label} :
      </span>
      {isEmpty ? (
        <span className="text-sm text-gray-400">N/A</span>
      ) : (
        <div className="flex flex-wrap items-center gap-1.5">{children}</div>
      )}
    </div>
  );
}

function SummaryItem({
  icon,
  label,
  value,
  subLabel,
  className = "",
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  subLabel?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-start gap-2 min-w-0 ${className}`}>
      <span className="mt-0.5 text-[#F4781B] flex-shrink-0">{icon}</span>
      <div className="min-w-0 flex-1">
        <span className="block text-xs font-medium text-gray-400 whitespace-nowrap">
          {label}
        </span>
        <span className="block text-sm font-semibold text-gray-900 leading-snug">
          {value}
        </span>
        {subLabel && (
          <span className="block text-xs text-gray-400 mt-0.5">{subLabel}</span>
        )}
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

  return (
    <div className="flex flex-col gap-4">
      {/* ── Main card ── */}
      <div className="bg-white rounded-2xl border border-gray-200 px-4 sm:px-5 py-4">

        {/* Title row */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-2">
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight">
              {job.job_title}
            </h1>
            {job.department && (
              <span className="px-3 py-1 rounded-md text-xs font-medium text-gray-600 border border-gray-200 bg-gray-50 whitespace-nowrap">
                {job.department} Department
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-shrink-0 sm:justify-end">
            <span className="px-3 py-1 rounded-md text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 whitespace-nowrap">
              {formatLabel(job.status)}
            </span>
            <span className="px-3 py-1 rounded-md text-xs font-semibold text-[#F4781B] bg-orange-50 border border-orange-100 whitespace-nowrap">
              {formatLabel(job.job_type)}
            </span>
            {!isInstantJob && (
              <span
                className={`px-3 py-1 rounded-md text-xs font-semibold border whitespace-nowrap ${
                  isRotational
                    ? "text-orange-600 bg-orange-50 border-orange-100"
                    : "text-blue-600 bg-blue-50 border-blue-100"
                }`}
              >
                {isRotational ? "Rotational Shifts" : "Standard Shifts"}
              </span>
            )}
          </div>
        </div>

        {/* Meta info row */}
        <div className="flex flex-wrap items-center gap-x-0 gap-y-2 text-sm text-gray-500 pb-3">
          {location && (
            <>
              <InfoItem icon={<MapPin size={13} />}>
                {location}, Canada
              </InfoItem>
              <span className="mx-3 text-gray-300 hidden xs:inline">|</span>
            </>
          )}
          {instantJob?.neighborhood_name && (
            <>
              <InfoItem icon={<Home size={13} />}>
                {instantJob.neighborhood_name}
              </InfoItem>
              <span className="mx-3 text-gray-300 hidden xs:inline">|</span>
            </>
          )}
          {instantJob?.direct_number && (
            <>
              <InfoItem icon={<Phone size={13} />}>
                {instantJob.direct_number}
              </InfoItem>
              <span className="mx-3 text-gray-300 hidden xs:inline">|</span>
            </>
          )}
          <InfoItem icon={<Clock size={13} />}>
            {formatLabel(job.job_type)}
          </InfoItem>
          <span className="mx-3 text-gray-300 hidden xs:inline">|</span>
          <InfoItem icon={<DollarSign size={13} />}>
            <strong className="text-gray-900 font-bold">
              {formatPay(job.pay_per_hour_cents)}
            </strong>
            /hr
          </InfoItem>
        </div>

        <div className="h-px bg-gray-100 mb-3" />

        {/* ── Two-column layout: detail rows (left) + date/time (right) ── */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:gap-6">

          {/* LEFT — detail rows */}
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            {isInstantJob ? (
              <>
                <DetailRow
                  label="Neighborhood Name"
                  isEmpty={!instantJob?.neighborhood_name}
                >
                  <DetailChip>{instantJob?.neighborhood_name}</DetailChip>
                </DetailRow>
                <DetailRow
                  label="Neighborhood Type"
                  isEmpty={!instantJob?.neighborhood_type}
                >
                  <DetailChip>
                    {formatLabel(instantJob?.neighborhood_type)}
                  </DetailChip>
                </DetailRow>
                <DetailRow
                  label="Direct Number"
                  isEmpty={!instantJob?.direct_number}
                >
                  <DetailChip>{instantJob?.direct_number}</DetailChip>
                </DetailRow>
              </>
            ) : (
              <>
                <DetailRow
                  label="Experience Required"
                  isEmpty={!normalJob?.years_of_experience}
                >
                  <DetailChip>
                    {formatLabel(normalJob?.years_of_experience)}
                  </DetailChip>
                </DetailRow>
                <DetailRow
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
                </DetailRow>
                <DetailRow
                  label="Required Qualification"
                  isEmpty={!qualifications.length}
                >
                  {qualifications.map((qualification) => (
                    <DetailChip key={qualification}>
                      {formatLabel(qualification)}
                    </DetailChip>
                  ))}
                </DetailRow>
                {job.employment_tenure && (
                  <DetailRow label="Employment Tenure">
                    <DetailChip>{formatLabel(job.employment_tenure)}</DetailChip>
                  </DetailRow>
                )}
                <DetailRow label="AI Interview">
                  <DetailChip>
                    {normalJob?.ai_interview ? "Enabled" : "Disabled"}
                  </DetailChip>
                </DetailRow>
                {isRotational && (
                  <>
                    <DetailRow
                      label="Rotation Teams"
                      isEmpty={!rotationalTeams.length}
                    >
                      {rotationalTeams.map((team) => (
                        <DetailChip key={team.id}>{team.team_name}</DetailChip>
                      ))}
                    </DetailRow>
                    <DetailRow label="Rotation Cycle">
                      <DetailChip>
                        {job.rotation_cycle_days ?? 14} days
                        {job.cycle_start_day
                          ? ` · starts ${formatLabel(job.cycle_start_day)}`
                          : ""}
                      </DetailChip>
                    </DetailRow>
                  </>
                )}
              </>
            )}
          </div>

          {/* RIGHT — Date & Time, vertically stacked, visually separated */}
          <div className="mt-3 lg:mt-0 lg:flex-shrink-0 lg:w-64 xl:w-72 flex flex-row lg:flex-col gap-4 sm:gap-6 lg:gap-3 flex-wrap rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
            {/* Date */}
            <SummaryItem
              icon={<CalendarDays size={15} />}
              label="Date"
              value={formatDateRange(job.start_date, job.end_date)}
              subLabel={formatDateDuration(job.start_date, job.end_date)}
              className="flex-1 lg:flex-none min-w-[140px]"
            />

            {/* vertical divider on lg, horizontal on mobile */}
            <div className="hidden lg:block h-px bg-gray-200 w-full" />
            <div className="block lg:hidden w-px bg-gray-200 self-stretch" />

            {/* Time */}
            <SummaryItem
              icon={<Clock size={15} />}
              label="Time"
              value={
                shiftDisplayLines.length > 0 ? (
                  <span className="flex flex-col gap-0.5">
                    {shiftDisplayLines.map((line) => (
                      <span key={line} className="text-sm font-semibold text-gray-900 leading-snug">
                        {line}
                      </span>
                    ))}
                  </span>
                ) : (
                  timing
                )
              }
              subLabel={
                rotationalSubLabel ??
                (shiftDisplayLines.length > 0
                  ? `${shiftsPerDay} shift${shiftsPerDay === 1 ? "" : "s"} per day`
                  : formatTimeDuration(job.check_in_time, job.check_out_time))
              }
              className="flex-1 lg:flex-none min-w-[140px]"
            />
          </div>
        </div>

        {/* ── Stats bar ── */}
        <div className="mt-4 rounded-xl bg-gray-50/70 border border-gray-100 p-3 sm:p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <SummaryItem
              icon={<Users size={16} />}
              label="Applications"
              value={job.application_count}
              subLabel={
                job.closed_reason
                  ? `Closed: ${formatLabel(job.closed_reason)}`
                  : null
              }
            />
            <SummaryItem
              icon={<Layers size={16} />}
              label="Requirements"
              value={job.no_of_hires_required}
            />
            <SummaryItem
              icon={<UserCheck size={16} />}
              label="Hired"
              value={job.no_of_hires_hired}
            />
            <SummaryItem
              icon={<CalendarCheck size={16} />}
              label="Number of Shifts"
              value={shiftCount}
            />
          </div>
        </div>
      </div>

      {/* ── Funding metric cards ── */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {funding && (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}