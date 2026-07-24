"use client";

import { Building2, Receipt, User } from "lucide-react";
import type { JobDetailPaymentsData, JobFeeBreakdown } from "@/types";
import { formatLabel, formatPay } from "../shared/job-detail-helpers";

function formatPerHour(cents?: number | null) {
  if (cents == null) return null;
  return `${formatPay(cents)}/hr`;
}

function hasFeeBreakdownContent(breakdown: JobFeeBreakdown): boolean {
  return Boolean(
    breakdown.per_hour ||
      breakdown.contract ||
      (breakdown.components?.length ?? 0) > 0 ||
      breakdown.candidate_percentage != null,
  );
}

function shouldShowComponentsTable(
  components: NonNullable<JobFeeBreakdown["components"]>,
  hasMainFlow: boolean,
) {
  if (components.length === 0) return false;
  if (!hasMainFlow) return true;
  if (components.length > 2) return true;

  const payees = new Set(
    components.map((c) => (c.payee ?? "").toUpperCase()),
  );
  const onlyBasicSplit =
    payees.size <= 2 &&
    [...payees].every(
      (payee) =>
        payee.includes("CANDIDATE") ||
        payee.includes("PLATFORM") ||
        payee === "",
    );

  return !onlyBasicSplit;
}

function FeeBreakdownPanel({ breakdown }: { breakdown: JobFeeBreakdown }) {
  const perHour = breakdown.per_hour;
  const contract = breakdown.contract;
  const taxComponents = [...(contract?.tax?.components ?? [])].sort(
    (a, b) => a.display_order - b.display_order,
  );
  const sortedComponents = [...(breakdown.components ?? [])].sort(
    (a, b) => a.display_order - b.display_order,
  );
  const candidatePercent = breakdown.candidate_percentage;
  const platformPercent = breakdown.platform_percentage;
  const hasMainFlow = Boolean(perHour || contract);
  const showComponents = shouldShowComponentsTable(
    sortedComponents,
    hasMainFlow,
  );

  const recruiterPay = contract?.recruiter_pay_cents;
  const candidateShare = contract?.candidate_share_cents;
  const platformShare = contract?.platform_share_cents;
  const totalPay = contract?.total_pay_cents;
  const taxTotal =
    taxComponents.length > 0
      ? taxComponents.reduce(
          (sum, tax) => sum + Number(tax.tax_amount_cents ?? 0),
          0,
        )
      : null;

  if (!hasFeeBreakdownContent(breakdown)) return null;

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-4 py-2.5 sm:px-5">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Fee Breakdown</h3>
          <p className="text-xs text-gray-500">
            Recruiter pay → candidate + platform
            {taxComponents.length > 0 ? " + tax" : ""}
            {breakdown.province
              ? ` · ${formatLabel(breakdown.province)}`
              : ""}
          </p>
        </div>
        {(candidatePercent != null || platformPercent != null) && (
          <div className="flex items-center gap-2">
            <div className="flex h-1.5 w-24 overflow-hidden rounded-full bg-gray-100 sm:w-28">
              <div
                className="h-full bg-[#F4781B]"
                style={{ width: `${candidatePercent ?? 0}%` }}
              />
              <div
                className="h-full bg-blue-500"
                style={{ width: `${platformPercent ?? 0}%` }}
              />
            </div>
            <span className="text-[11px] font-semibold text-gray-500">
              <span className="text-[#F4781B]">{candidatePercent ?? 0}%</span>
              {" / "}
              <span className="text-blue-600">{platformPercent ?? 0}%</span>
            </span>
          </div>
        )}
      </div>

      <div className="px-4 py-3 sm:px-5">
        {/* Recruiter → split row */}
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch">
          <div className="rounded-xl border border-orange-100 bg-orange-50/50 px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#F4781B]">
              Recruiter pays
            </p>
            <p className="mt-0.5 text-lg font-bold text-gray-900">
              {recruiterPay != null
                ? formatPay(recruiterPay)
                : (formatPerHour(perHour?.recruiter_pay_per_hour_cents) ??
                  "N/A")}
            </p>
            {recruiterPay != null && perHour && (
              <p className="text-[11px] text-gray-500">
                {formatPerHour(perHour.recruiter_pay_per_hour_cents)}
              </p>
            )}
          </div>

          <div className="hidden items-center px-1 text-xs font-semibold text-gray-300 lg:flex">
            →
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-orange-100 bg-white px-3 py-2.5">
              <div className="flex items-center justify-between gap-1">
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                  <User size={11} className="text-[#F4781B]" />
                  Candidate
                </span>
                {candidatePercent != null && (
                  <span className="text-[10px] font-bold text-[#F4781B]">
                    {candidatePercent}%
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-sm font-bold text-gray-900">
                {candidateShare != null
                  ? formatPay(candidateShare)
                  : (formatPerHour(
                      perHour?.candidate_receive_per_hour_cents,
                    ) ?? "N/A")}
              </p>
              {candidateShare != null && perHour && (
                <p className="text-[10px] text-gray-400">
                  {formatPerHour(perHour.candidate_receive_per_hour_cents)}
                </p>
              )}
            </div>

            <div className="rounded-xl border border-blue-100 bg-white px-3 py-2.5">
              <div className="flex items-center justify-between gap-1">
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                  <Building2 size={11} className="text-blue-500" />
                  Platform
                </span>
                {platformPercent != null && (
                  <span className="text-[10px] font-bold text-blue-600">
                    {platformPercent}%
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-sm font-bold text-gray-900">
                {platformShare != null
                  ? formatPay(platformShare)
                  : (formatPerHour(perHour?.platform_fee_per_hour_cents) ??
                    "N/A")}
              </p>
              {platformShare != null && perHour && (
                <p className="text-[10px] text-gray-400">
                  {formatPerHour(perHour.platform_fee_per_hour_cents)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Tax + total — compact receipt lines */}
        {(taxComponents.length > 0 || totalPay != null) && (
          <div className="mt-2.5 overflow-hidden rounded-xl border border-gray-100">
            {taxComponents.map((tax) => (
              <div
                key={`${tax.tax_name}-${tax.tax_percentage}`}
                className="flex items-center justify-between gap-3 border-b border-gray-50 px-3 py-1.5"
              >
                <span className="text-xs text-gray-500">
                  + {tax.tax_name}
                  <span className="text-gray-400"> ({tax.tax_percentage}%)</span>
                </span>
                <span className="text-xs font-semibold text-gray-900">
                  {formatPay(tax.tax_amount_cents)}
                </span>
              </div>
            ))}
            {totalPay != null && (
              <div className="flex items-center justify-between gap-3 border-t border-orange-100 bg-transparent px-3 py-2">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-[#F4781B]/80">
                    Total you pay
                  </p>
                  {recruiterPay != null && taxTotal != null && (
                    <p className="text-[10px] text-gray-400">
                      {formatPay(recruiterPay)} + {formatPay(taxTotal)} tax
                    </p>
                  )}
                </div>
                <p className="text-base font-bold text-[#F4781B]">
                  {formatPay(totalPay)}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {showComponents && (
        <div className="border-t border-gray-100 px-4 py-2.5 sm:px-5">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
            Additional fee components
          </p>
          <div className="overflow-x-auto rounded-lg border border-gray-100">
            <table className="w-full min-w-[480px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  <th className="px-3 py-1.5 text-left text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                    Component
                  </th>
                  <th className="px-3 py-1.5 text-left text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                    Payee
                  </th>
                  <th className="px-3 py-1.5 text-right text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                    Rate
                  </th>
                  <th className="px-3 py-1.5 text-right text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                    Per Hour
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedComponents.map((component) => (
                  <tr
                    key={`${component.code}-${component.display_order}`}
                    className="border-b border-gray-50 last:border-b-0"
                  >
                    <td className="px-3 py-1.5 text-xs font-medium text-gray-900">
                      {component.name}
                    </td>
                    <td className="px-3 py-1.5 text-xs text-gray-500">
                      {formatLabel(component.payee)}
                    </td>
                    <td className="px-3 py-1.5 text-right text-xs text-gray-700">
                      {component.percentage}%
                    </td>
                    <td className="px-3 py-1.5 text-right text-xs font-semibold whitespace-nowrap text-gray-900">
                      {formatPerHour(component.amount_per_hour_cents) ?? "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

function ActualPayoutsPanel({ payments }: { payments: JobDetailPaymentsData }) {
  const funding = payments.funding;
  const candidatePayout = funding?.total_candidate_payout_cents;
  const platformFee = funding?.total_platform_fee_cents;

  if (candidatePayout == null && platformFee == null) return null;

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-5">
        <div className="flex items-center gap-2">
          <Receipt size={14} className="text-[#F4781B]" />
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Actual Payouts
            </h3>
            <p className="text-xs text-gray-500">Settled after shifts</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-right">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
              Candidates
            </p>
            <p className="text-sm font-bold text-gray-900">
              {formatPay(candidatePayout)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
              Platform
            </p>
            <p className="text-sm font-bold text-gray-900">
              {formatPay(platformFee)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

type FeeBreakdownSectionProps = {
  payments: JobDetailPaymentsData;
};

export function FeeBreakdownSection({ payments }: FeeBreakdownSectionProps) {
  const breakdown = payments.fee_breakdown;
  const showBreakdown = breakdown && hasFeeBreakdownContent(breakdown);
  const showPayouts =
    payments.funding?.total_candidate_payout_cents != null ||
    payments.funding?.total_platform_fee_cents != null;

  if (!showBreakdown && !showPayouts) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      {showBreakdown && breakdown && <FeeBreakdownPanel breakdown={breakdown} />}
      <ActualPayoutsPanel payments={payments} />
    </div>
  );
}
