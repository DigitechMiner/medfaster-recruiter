"use client";

import type { ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProvinceTaxComponent } from "@/types";
import { useProvinceTaxes } from "@/hooks/useProvinceTaxes";
import { JobFormField } from "./form-field";

function formatHourlyRate(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

const rowLabelClass = "text-xs text-gray-600";
const rowAmountClass =
  "shrink-0 min-w-[5.25rem] text-right text-xs font-medium tabular-nums text-gray-800";
const totalLabelClass = "text-xs font-semibold text-gray-800";
const totalAmountClass =
  "shrink-0 min-w-[5.25rem] text-right text-xs font-bold tabular-nums text-[#F4781B]";

function PayBreakdownRow({
  label,
  amount,
  amountClassName = rowAmountClass,
  labelClassName = rowLabelClass,
  className,
}: {
  label: ReactNode;
  amount: ReactNode;
  amountClassName?: string;
  labelClassName?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 px-3 py-2",
        className,
      )}
    >
      <span className={labelClassName}>{label}</span>
      <span className={amountClassName}>{amount}</span>
    </div>
  );
}

function computeTaxBreakdown(
  payRateCents: number,
  components: ProvinceTaxComponent[],
) {
  const lines = [...components]
    .sort((a, b) => a.display_order - b.display_order)
    .map((component) => {
      const amountCents = Math.round(
        payRateCents * (component.tax_percentage / 100),
      );
      return { ...component, amountCents };
    });

  const totalTaxCents = lines.reduce((sum, line) => sum + line.amountCents, 0);

  return {
    lines,
    totalTaxCents,
    totalCents: payRateCents + totalTaxCents,
  };
}

interface HourlyPayWithTaxesProps {
  payRateCents: number | null;
  payRateLoading: boolean;
  payRateError: string | null;
  jobTitleSelected: boolean;
  province?: string;
  onRefreshPayRate?: () => void;
  canRefreshPayRate?: boolean;
  id?: string;
  label?: string;
  emptyJobTitleMessage?: string;
  className?: string;
}

export function HourlyPayWithTaxes({
  payRateCents,
  payRateLoading,
  payRateError,
  jobTitleSelected,
  province,
  onRefreshPayRate,
  canRefreshPayRate = false,
  id = "hourly-pay",
  label = "Hourly Pay per Hire",
  emptyJobTitleMessage = "Select a job title first",
  className,
}: HourlyPayWithTaxesProps) {
  const hasProvince = Boolean(province?.trim());
  const {
    data: taxes,
    loading: taxesLoading,
    error: taxesError,
    refresh: refreshTaxes,
  } = useProvinceTaxes(province, hasProvince);

  const breakdown =
    payRateCents !== null && taxes?.components?.length
      ? computeTaxBreakdown(payRateCents, taxes.components)
      : null;

  const showTaxBreakdown =
    hasProvince &&
    payRateCents !== null &&
    (taxesLoading || taxesError || breakdown);

  const canRefreshFees = canRefreshPayRate && Boolean(onRefreshPayRate);
  const canRefreshProvinceTaxes = hasProvince;
  const showRefreshButton = canRefreshFees || canRefreshProvinceTaxes;
  const isRefreshing = payRateLoading || taxesLoading;

  const handleRefresh = () => {
    if (canRefreshFees) {
      onRefreshPayRate?.();
    }
    if (canRefreshProvinceTaxes) {
      refreshTaxes();
    }
  };

  return (
    <JobFormField id={id} label={label} className={cn("space-y-2", className)}>
      {showRefreshButton && (
        <div className="-mt-1 flex justify-end">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-gray-600 transition-colors",
              "hover:bg-gray-100 hover:text-gray-900",
              "disabled:cursor-not-allowed disabled:opacity-50",
              (payRateError || taxesError) && "text-[#F4781B] hover:text-[#d96814]",
            )}
            aria-label="Refresh pay rate and tax information"
          >
            <RefreshCw
              className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")}
            />
            Refresh
          </button>
        </div>
      )}

      <div
        id={id}
        className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50/60"
      >
        {payRateLoading && (
          <div className="space-y-2 px-3 py-2.5">
            <div className="h-3.5 w-full animate-pulse rounded bg-gray-200/70" />
            <div className="h-3.5 w-3/5 animate-pulse rounded bg-gray-200/70" />
          </div>
        )}

        {payRateError && (
          <p className="flex items-center gap-1.5 px-3 py-2.5 text-xs text-red-600">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {payRateError}
          </p>
        )}

        {!payRateLoading && !payRateError && (
          <PayBreakdownRow
            label="Base Pay"
            amount={
              jobTitleSelected ? (
                payRateCents !== null ? (
                  `${formatHourlyRate(payRateCents)}/hr`
                ) : (
                  "—"
                )
              ) : (
                <span className="font-normal text-gray-400">
                  {emptyJobTitleMessage}
                </span>
              )
            }
            amountClassName={cn(
              rowAmountClass,
              payRateCents === null && "font-normal text-gray-400",
            )}
            className={showTaxBreakdown ? "border-b border-gray-100" : undefined}
          />
        )}

        {payRateCents !== null && !hasProvince && !payRateLoading && !payRateError && (
          <p className="border-t border-gray-100 px-3 py-2 text-xs text-gray-400">
            Select a province above to see applicable taxes.
          </p>
        )}

        {showTaxBreakdown && (
          <>
            {taxesLoading && (
              <div className="space-y-2 border-t border-gray-100 px-3 py-2.5">
                <div className="h-3.5 w-full animate-pulse rounded bg-gray-200/70" />
                <div className="h-3.5 w-3/5 animate-pulse rounded bg-gray-200/70" />
              </div>
            )}

            {taxesError && (
              <p className="flex items-center gap-1.5 border-t border-gray-100 px-3 py-2.5 text-xs text-red-600">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {taxesError}
              </p>
            )}

            {breakdown && !taxesLoading && !taxesError && (
              <>
                {breakdown.lines.map((line) => (
                  <PayBreakdownRow
                    key={`${line.tax_name}-${line.display_order}`}
                    className="border-b border-gray-100"
                    label={
                      <>
                        {line.tax_name}
                        <span className="ml-1 text-gray-400">
                          ({line.tax_percentage}%)
                        </span>
                      </>
                    }
                    amount={`${formatHourlyRate(line.amountCents)}/hr`}
                  />
                ))}
                <PayBreakdownRow
                  label="Total with tax"
                  amount={`${formatHourlyRate(breakdown.totalCents)}/hr`}
                  labelClassName={totalLabelClass}
                  amountClassName={totalAmountClass}
                  className="border-t border-gray-200 bg-white py-2.5"
                />
              </>
            )}

            {!taxesLoading &&
              !taxesError &&
              taxes &&
              taxes.components.length === 0 && (
                <p className="border-t border-gray-100 px-3 py-2.5 text-xs text-gray-500">
                  No applicable taxes for this province.
                </p>
              )}
          </>
        )}
      </div>
    </JobFormField>
  );
}
