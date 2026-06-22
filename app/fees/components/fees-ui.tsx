"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { AlertCircle, BadgeDollarSign, Search } from "lucide-react";

export function CustomRateBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-100">
      <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden />
      Custom rates
    </span>
  );
}

export function ConfiguredBadge({ configured }: { configured: boolean }) {
  return (
    <span
      className={
        configured
          ? "inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-100"
          : "inline-flex items-center gap-1 rounded-full bg-gray-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500 ring-1 ring-gray-100"
      }
    >
      <span
        className={`size-1.5 rounded-full ${configured ? "bg-emerald-500" : "bg-gray-300"}`}
        aria-hidden
      />
      {configured ? "Configured" : "Not set"}
    </span>
  );
}

export function CandidateShareBar({ percentage }: { percentage: number }) {
  return (
    <div className="flex min-w-[88px] flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-gray-500">Candidate</span>
        <span className="text-xs font-semibold text-gray-800">{percentage}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-[#F4781B] transition-all"
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
        />
      </div>
    </div>
  );
}

export function ExperienceRateTier({
  tierLabel,
  tierRange,
  rate,
  formatHourlyRate,
}: {
  tierLabel: string;
  tierRange: string;
  rate: {
    recruiter_pay_per_hour: number;
    candidate_percentage: number;
    has_recruiter_discount: boolean;
    platform_recruiter_pay_per_hour: number;
    discount_per_hour: number;
  };
  formatHourlyRate: (amount: number) => string;
}) {
  return (
    <div
      className={
        rate.has_recruiter_discount
          ? "flex flex-col gap-3 rounded-xl border border-emerald-100 bg-emerald-50/30 p-4"
          : "flex flex-col gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-4"
      }
    >
      <div className="space-y-0.5">
        <p className="text-sm font-semibold text-gray-900">{tierLabel}</p>
        <p className="text-xs text-gray-400">{tierRange}</p>
      </div>

      <div className="rounded-lg bg-white p-3 ring-1 ring-gray-100">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
          Your rate
        </p>
        <p className="mt-1 text-xl font-bold text-gray-900">
          {formatHourlyRate(rate.recruiter_pay_per_hour)}
          <span className="ml-1 text-sm font-medium text-gray-400">/hr</span>
        </p>
        {rate.has_recruiter_discount && (
          <div className="mt-2 space-y-1 border-t border-gray-100 pt-2">
            <p className="text-xs text-gray-400 line-through">
              Platform {formatHourlyRate(rate.platform_recruiter_pay_per_hour)}
            </p>
            <p className="text-xs font-semibold text-emerald-700">
              Save {formatHourlyRate(rate.discount_per_hour)}/hr
            </p>
          </div>
        )}
      </div>

      <CandidateShareBar percentage={rate.candidate_percentage} />
    </div>
  );
}

export function FeesCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="h-5 w-40 animate-pulse rounded-lg bg-gray-200" />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="h-28 animate-pulse rounded-xl bg-gray-100" />
        <div className="h-28 animate-pulse rounded-xl bg-gray-100" />
      </div>
    </div>
  );
}


export function FeesLoadingState({ columns = 2 }: { columns?: number }) {
  return (
    <div className="grid gap-4 p-5 sm:grid-cols-2">
      {Array.from({ length: columns }).map((_, index) => (
        <FeesCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function FeesErrorState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[320px] items-center justify-center px-6 py-10">
      <div className="flex max-w-md flex-col items-center text-center">
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-red-50 text-red-500 ring-1 ring-red-100">
          <AlertCircle className="size-6" aria-hidden />
        </div>
        <p className="text-base font-semibold text-gray-900">Failed to load fee rates</p>
        <p className="mt-2 text-sm text-gray-500">{message}</p>
      </div>
    </div>
  );
}

export function FeesEmptyState({
  icon: Icon = BadgeDollarSign,
  title,
  description,
}: {
  icon?: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[320px] items-center justify-center px-6 py-10">
      <div className="flex max-w-sm flex-col items-center text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-orange-50 text-[#F4781B] ring-1 ring-orange-100">
          <Icon className="size-7" aria-hidden />
        </div>
        <p className="text-base font-semibold text-gray-900">{title}</p>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">{description}</p>
      </div>
    </div>
  );
}

export function FeesSearchInput({
  value,
  onChange,
  placeholder = "Search job titles...",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative w-full sm:w-72">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400"
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#F4781B] focus:outline-none focus:ring-2 focus:ring-[#F4781B]/20"
      />
    </div>
  );
}

export function FeesTabPanelHeader({
  icon: Icon,
  title,
  description,
  countLabel,
  endSlot,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  countLabel?: string;
  endSlot?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-gray-100 bg-gradient-to-r from-[#FFFAF5] to-white px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#F4781B] shadow-sm ring-1 ring-orange-100">
          <Icon className="size-5" aria-hidden />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-gray-900">{title}</p>
            {countLabel && (
              <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-gray-500 ring-1 ring-gray-200">
                {countLabel}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
      </div>
      {endSlot}
    </div>
  );
}
