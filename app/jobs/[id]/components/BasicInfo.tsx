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
import {
  convertQualificationToFrontend,
  convertSpecializationToFrontend,
} from "@/utils/constant/metadata";
import {
  formatDate,
  formatLabel,
  formatPay,
  formatTime,
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
    <span className="flex items-center gap-2">
      <span className="text-[#F4781B]">{icon}</span>
      {children}
    </span>
  );
}

function DetailChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-3 py-1 rounded-md text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200">
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
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-semibold text-[#F4781B]">{label} :</span>
      {isEmpty ? <span className="text-sm text-gray-400">N/A</span> : children}
    </div>
  );
}

function SummaryItem({
  icon,
  label,
  value,
  subLabel,
  className = "",
  inline = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  subLabel?: React.ReactNode;
  className?: string;
  inline?: boolean;
}) {
  if (inline) {
    return (
      <div className={`flex items-center gap-2 text-sm ${className}`}>
        <span className="text-[#F4781B]">{icon}</span>
        <span className="font-medium text-gray-400">{label}</span>
        <span className="font-semibold text-gray-900">{value}</span>
        {subLabel && (
          <span className="text-xs text-gray-400">({subLabel})</span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-start gap-2 ${className}`}>
      <span className="mt-0.5 text-[#F4781B]">{icon}</span>
      <span className="min-w-0">
        <span className="block text-xs font-medium text-gray-400">{label}</span>
        <span className="block text-sm font-semibold text-gray-900">
          {value}
        </span>
        {subLabel && (
          <span className="block text-xs text-gray-400">{subLabel}</span>
        )}
      </span>
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
  const instantJob = job.instantJob;
  const normalJob = job.normalJob;
  const location = [job.city, formatLabel(job.province)]
    .filter(Boolean)
    .join(", ");
  const timing =
    job.check_in_time && job.check_out_time
      ? `${formatTime(job.check_in_time)} to ${formatTime(job.check_out_time)}`
      : "N/A";
  const isInstantJob = job.job_urgency === "instant";
  const specializations = normalJob?.specializations ?? [];
  const qualifications = normalJob?.qualifications ?? [];
  const funding = job.funding;
  const shiftCount =
    job.no_of_hires_required *
    getDateDurationDays(job.start_date, job.end_date);

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-2xl border border-gray-200 px-5 py-4">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="flex items-center gap-3 flex-wrap min-w-0">
            <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">
              {job.job_title}
            </h1>
            {job.department && (
              <span className="px-3 py-1 rounded-md text-xs font-medium text-gray-600 border border-gray-200 bg-gray-50">
                {job.department} Department
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
            <span className="px-3 py-1 rounded-md text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100">
              {formatLabel(job.status)}
            </span>
            <span className="px-3 py-1 rounded-md text-xs font-semibold text-[#F4781B] bg-orange-50 border border-orange-100">
              {formatLabel(job.job_type)}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-y-2 text-sm text-gray-500 pb-3">
          {location && (
            <>
              <InfoItem icon={<MapPin size={13} />}>
                {location}, Canada
              </InfoItem>
              <span className="mx-3 text-gray-300">|</span>
            </>
          )}
          {instantJob?.neighborhood_name && (
            <>
              <InfoItem icon={<Home size={13} />}>
                {instantJob.neighborhood_name}
              </InfoItem>
              <span className="mx-3 text-gray-300">|</span>
            </>
          )}
          {instantJob?.direct_number && (
            <>
              <InfoItem icon={<Phone size={13} />}>
                {instantJob.direct_number}
              </InfoItem>
              <span className="mx-3 text-gray-300">|</span>
            </>
          )}
          <InfoItem icon={<Clock size={13} />}>
            {formatLabel(job.job_type)}
          </InfoItem>
          <span className="mx-3 text-gray-300">|</span>
          <InfoItem icon={<DollarSign size={13} />}>
            <strong className="text-gray-900 font-bold">
              {formatPay(job.pay_per_hour_cents)}
            </strong>
            /hr
          </InfoItem>
        </div>

        <div className="h-px bg-gray-100 mb-3" />

        {isInstantJob ? (
          <div className="flex flex-col gap-2">
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
          </div>
        ) : (
          <div className="flex flex-col gap-2">
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
                  {convertSpecializationToFrontend(String(specialization))}
                </DetailChip>
              ))}
            </DetailRow>
            <DetailRow
              label="Required Qualification"
              isEmpty={!qualifications.length}
            >
              {qualifications.map((qualification) => (
                <DetailChip key={qualification}>
                  {convertQualificationToFrontend(qualification)}
                </DetailChip>
              ))}
            </DetailRow>
            <DetailRow label="AI Interview">
              <DetailChip>
                {normalJob?.ai_interview ? "Enabled" : "Disabled"}
              </DetailChip>
            </DetailRow>
          </div>
        )}

        <div className="flex flex-col gap-3 xl:w-80 xl:flex-shrink-0">
          <SummaryItem
            icon={<CalendarDays size={16} />}
            label="Date"
            value={formatDateRange(job.start_date, job.end_date)}
            subLabel={formatDateDuration(job.start_date, job.end_date)}
            inline
          />
          <SummaryItem
            icon={<Clock size={16} />}
            label="Time"
            value={timing}
            subLabel={formatTimeDuration(job.check_in_time, job.check_out_time)}
            inline
          />
        </div>

        <div className="mt-4 rounded-xl bg-gray-50/70 border border-gray-100 p-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
            <div className="flex flex-wrap gap-x-5 gap-y-3 xl:flex-1 xl:flex-nowrap">
              <SummaryItem
                icon={<Users size={16} />}
                label="Applications"
                value={job.application_count}
                subLabel={
                  job.closed_reason
                    ? `Closed: ${formatLabel(job.closed_reason)}`
                    : null
                }
                className="min-w-[130px] flex-1"
              />
              <SummaryItem
                icon={<Layers size={16} />}
                label="Requirements"
                value={job.no_of_hires_required}
                className="min-w-[130px] flex-1"
              />
              <SummaryItem
                icon={<UserCheck size={16} />}
                label="Hired"
                value={job.no_of_hires_hired}
                className="min-w-[130px] flex-1"
              />
              <SummaryItem
                icon={<CalendarCheck size={16} />}
                label="Number of Shifts"
                value={shiftCount}
                className="min-w-[130px] flex-1"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {funding && (
          <>
            <MetricCard
              icon={<DollarSign size={18} />}
              title="Total Funding"
              value={formatPay(funding.total_amount_cents)}
              subLabel={formatLabel(funding.status)}
              className="border-gray-200"
            />
            <MetricCard
              icon={<Wallet size={18} />}
              title="Held Amount"
              value={formatPay(funding.held_amount_cents)}
              subLabel="Currently held"
              className="border-gray-200"
            />
            <MetricCard
              icon={<CreditCard size={18} />}
              title="Released Amount"
              value={formatPay(funding.released_amount_cents)}
              subLabel="Paid out"
              className="border-gray-200"
            />
            <MetricCard
              icon={<RotateCcw size={18} />}
              title="Refunded Amount"
              value={formatPay(funding.refunded_amount_cents)}
              subLabel="Returned"
              className="border-gray-200"
            />
          </>
        )}
      </div>
    </div>
  );
}
