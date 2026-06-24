"use client";

import { Building2, Percent, Receipt, User } from "lucide-react";
import type { JobDetailPaymentsData, JobFeeBreakdown } from "@/types";
import { formatLabel, formatPay } from "./job-detail-helpers";

function formatPerHour(cents?: number | null) {
  if (cents == null) return "N/A";
  return `${formatPay(cents)}/hr`;
}

function SummaryRow({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: React.ReactNode;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 border-b border-gray-100 last:border-b-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span
        className={`text-sm whitespace-nowrap ${emphasis ? "font-bold text-gray-900" : "font-semibold text-gray-900"}`}
      >
        {value}
      </span>
    </div>
  );
}

function hasFeeBreakdownContent(breakdown: JobFeeBreakdown): boolean {
  return Boolean(
    breakdown.per_hour ||
      breakdown.contract ||
      (breakdown.components?.length ?? 0) > 0 ||
      breakdown.candidate_percentage != null,
  );
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
  const candidatePercent = breakdown.candidate_percentage ?? 0;
  const platformPercent = breakdown.platform_percentage ?? 0;
  const hasSplitRate =
    breakdown.candidate_percentage != null ||
    breakdown.platform_percentage != null;

  if (!hasFeeBreakdownContent(breakdown)) return null;

  return (
    <section className="rounded-xl border border-gray-200 overflow-hidden">
      <div className="border-b border-gray-100 bg-gray-50/80 px-4 py-3 sm:px-5">
        <h3 className="text-sm font-semibold text-gray-900">Fee Breakdown</h3>
        <p className="mt-0.5 text-xs text-gray-500">
          Planned split from fee structure at job creation
          {breakdown.province
            ? ` · ${formatLabel(breakdown.province)} tax rules`
            : ""}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 p-4 sm:p-5 lg:grid-cols-3">
        {perHour && (
          <div className="rounded-lg border border-orange-100 bg-orange-50/40 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#F4781B] mb-3">
              Per Hour
            </p>
            <div className="space-y-2">
              <SummaryRow
                label="Recruiter pay"
                value={formatPerHour(perHour.recruiter_pay_per_hour_cents)}
              />
              <SummaryRow
                label="Candidate receives"
                value={formatPerHour(perHour.candidate_receive_per_hour_cents)}
              />
              <SummaryRow
                label="Platform fee"
                value={formatPerHour(perHour.platform_fee_per_hour_cents)}
              />
            </div>
          </div>
        )}

        {hasSplitRate && (
          <div className="rounded-lg border border-gray-100 bg-gray-50/40 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-3">
              Split Rate
            </p>
            <div className="flex items-center gap-3">
              <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full bg-[#F4781B]"
                  style={{ width: `${candidatePercent}%` }}
                />
                <div
                  className="h-full bg-blue-500"
                  style={{ width: `${platformPercent}%` }}
                />
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <span className="flex items-center gap-1.5 text-gray-600">
                <User size={14} className="text-[#F4781B]" />
                Candidate {candidatePercent}%
              </span>
              <span className="flex items-center gap-1.5 text-gray-600">
                <Building2 size={14} className="text-blue-500" />
                Platform {platformPercent}%
              </span>
            </div>
          </div>
        )}

        {contract && (
          <div className="rounded-lg border border-gray-100 bg-white p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-3">
              Contract Total
            </p>
            <div className="space-y-0">
              <SummaryRow
                label="Recruiter pay"
                value={formatPay(contract.recruiter_pay_cents)}
              />
              <SummaryRow
                label="Candidate share"
                value={formatPay(contract.candidate_share_cents)}
              />
              <SummaryRow
                label="Platform share"
                value={formatPay(contract.platform_share_cents)}
              />
              {taxComponents.map((tax) => (
                <SummaryRow
                  key={`${tax.tax_name}-${tax.tax_percentage}`}
                  label={`${tax.tax_name} (${tax.tax_percentage}%)`}
                  value={formatPay(tax.tax_amount_cents)}
                />
              ))}
              <SummaryRow
                label="Total incl. tax"
                value={formatPay(contract.total_pay_cents)}
                emphasis
              />
            </div>
          </div>
        )}
      </div>

      {sortedComponents.length > 0 && (
        <div className="border-t border-gray-100 px-4 py-4 sm:px-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Fee Components
          </p>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full min-w-[520px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Component
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Payee
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Rate
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Per Hour
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedComponents.map((component) => (
                  <tr
                    key={`${component.code}-${component.display_order}`}
                    className="border-b border-gray-100 last:border-b-0"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {component.name}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {formatLabel(component.payee)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">
                      <span className="inline-flex items-center gap-1">
                        <Percent size={12} className="text-gray-400" />
                        {component.percentage}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900 whitespace-nowrap">
                      {formatPerHour(component.amount_per_hour_cents)}
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
    <section className="rounded-xl border border-gray-200 p-4 sm:p-5">
      <div className="mb-3 flex items-start gap-2">
        <Receipt size={16} className="mt-0.5 text-[#F4781B]" />
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Actual Payouts</h3>
          <p className="text-xs text-gray-500">
            Settled amounts from funding ledger once shifts complete
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-gray-100 bg-gray-50/60 px-4 py-3">
          <p className="text-xs text-gray-500">Paid to candidates</p>
          <p className="mt-1 text-lg font-bold text-gray-900">
            {formatPay(candidatePayout)}
          </p>
        </div>
        <div className="rounded-lg border border-gray-100 bg-gray-50/60 px-4 py-3">
          <p className="text-xs text-gray-500">Platform fees collected</p>
          <p className="mt-1 text-lg font-bold text-gray-900">
            {formatPay(platformFee)}
          </p>
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
    <div className="flex flex-col gap-4">
      {showBreakdown && breakdown && <FeeBreakdownPanel breakdown={breakdown} />}
      <ActualPayoutsPanel payments={payments} />
      {showBreakdown && (
        <p className="text-xs text-gray-400 leading-relaxed">
          Contract shares above are planned from the fee structure at posting.
          Held, spent, and refunded amounts reflect actual wallet movements in
          the ledger below.
        </p>
      )}
    </div>
  );
}
