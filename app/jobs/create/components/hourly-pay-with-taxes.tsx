"use client";

import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProvinceTaxComponent } from "@/types";
import { useProvinceTaxes } from "@/hooks/useProvinceTaxes";
import { JobFormField } from "./form-field";

function formatHourlyRate(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
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
  } = useProvinceTaxes(province, hasProvince);

  const breakdown =
    payRateCents !== null && taxes?.components?.length
      ? computeTaxBreakdown(payRateCents, taxes.components)
      : null;

  const showTaxBreakdown =
    hasProvince &&
    payRateCents !== null &&
    (taxesLoading || taxesError || breakdown);

  return (
    <JobFormField id={id} label={label} className={cn("space-y-2", className)}>
      <div
        id={id}
        className="flex h-11 items-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm text-gray-500 select-none"
      >
        {payRateLoading && (
          <span className="animate-pulse text-gray-400">Loading rate...</span>
        )}
        {payRateError && (
          <span className="flex items-center gap-1.5 text-xs text-red-600">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {payRateError}
          </span>
        )}
        {!payRateLoading && !payRateError && (
          <span
            className={cn(
              payRateCents !== null
                ? "font-semibold text-gray-800"
                : "text-gray-400",
            )}
          >
            {jobTitleSelected ? (
              payRateCents !== null ? (
                <>
                  {formatHourlyRate(payRateCents)}
                  <span className="font-normal text-gray-500"> / hr</span>
                </>
              ) : (
                "—"
              )
            ) : (
              emptyJobTitleMessage
            )}
          </span>
        )}
      </div>

      {payRateCents !== null && !hasProvince && !payRateLoading && (
        <p className="text-xs text-gray-400">
          Select a province above to see applicable taxes.
        </p>
      )}

      {showTaxBreakdown && (
        <div className="overflow-hidden rounded-lg border border-gray-100 bg-gray-50/60">
          {taxesLoading && (
            <div className="space-y-2 px-3 py-2.5">
              <div className="h-3.5 w-full animate-pulse rounded bg-gray-200/70" />
              <div className="h-3.5 w-3/5 animate-pulse rounded bg-gray-200/70" />
            </div>
          )}

          {taxesError && (
            <p className="flex items-center gap-1.5 px-3 py-2.5 text-xs text-red-600">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {taxesError}
            </p>
          )}

          {breakdown && !taxesLoading && !taxesError && (
            <>
              {breakdown.lines.map((line) => (
                <div
                  key={`${line.tax_name}-${line.display_order}`}
                  className="flex items-center justify-between gap-4 border-b border-gray-100 px-3 py-2 text-xs text-gray-600 last:border-b-0"
                >
                  <span>
                    {line.tax_name}
                    <span className="ml-1 text-gray-400">
                      ({line.tax_percentage}%)
                    </span>
                  </span>
                  <span className="shrink-0 font-medium text-gray-700">
                    +{formatHourlyRate(line.amountCents)}/hr
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between gap-4 border-t border-gray-200 bg-white px-3 py-2.5">
                <span className="text-sm font-semibold text-gray-800">
                  Total with tax
                </span>
                <span className="text-sm font-bold text-[#F4781B]">
                  {formatHourlyRate(breakdown.totalCents)}/hr
                </span>
              </div>
            </>
          )}

          {!taxesLoading &&
            !taxesError &&
            taxes &&
            taxes.components.length === 0 && (
              <p className="px-3 py-2.5 text-xs text-gray-500">
                No applicable taxes for this province.
              </p>
            )}
        </div>
      )}
    </JobFormField>
  );
}
