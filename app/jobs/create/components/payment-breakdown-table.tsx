"use client";

import type { JobPreviewTaxComponent } from "@/types";

export type PaymentBreakdownColumn = {
  id: string;
  title: string;
  subtitle?: string;
  shiftCount?: number;
  totalWorkingHours?: number;
  subtotalCents: number;
  taxComponents: JobPreviewTaxComponent[];
  totalCents: number;
  footerNote?: string | null;
};

type TaxRow = {
  key: string;
  label: string;
  displayOrder: number;
};

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-CA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function collectTaxRows(columns: PaymentBreakdownColumn[]): TaxRow[] {
  const rows = new Map<string, TaxRow>();

  for (const column of columns) {
    for (const component of column.taxComponents) {
      const key = `${component.tax_name}-${component.tax_percentage}`;
      if (!rows.has(key)) {
        rows.set(key, {
          key,
          label: `${component.tax_name} (${component.tax_percentage}%)`,
          displayOrder: component.display_order,
        });
      }
    }
  }

  return [...rows.values()].sort((a, b) => a.displayOrder - b.displayOrder);
}

function getTaxAmountCents(
  column: PaymentBreakdownColumn,
  taxKey: string,
): number | null {
  const match = column.taxComponents.find(
    (component) =>
      `${component.tax_name}-${component.tax_percentage}` === taxKey,
  );
  return match?.tax_amount_cents ?? null;
}

interface PaymentBreakdownTableProps {
  columns: PaymentBreakdownColumn[];
  showShiftMetrics?: boolean;
}

export function PaymentBreakdownTable({
  columns,
  showShiftMetrics = true,
}: PaymentBreakdownTableProps) {
  if (columns.length === 0) return null;

  const taxRows = collectTaxRows(columns);
  const footerNote = columns.find((column) => column.footerNote)?.footerNote;

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full min-w-[860px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Period
              </th>
              {showShiftMetrics ? (
                <>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Shifts
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Working hours
                  </th>
                </>
              ) : null}
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                Subtotal
              </th>
              {taxRows.map((taxRow) => (
                <th
                  key={taxRow.key}
                  className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500"
                >
                  {taxRow.label}
                </th>
              ))}
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {columns.map((column) => (
              <tr key={column.id} className="bg-white">
                <td className="px-4 py-3 align-top">
                  <span className="block font-semibold text-gray-900">
                    {column.title}
                  </span>
                  {column.subtitle ? (
                    <span className="mt-0.5 block text-xs text-gray-500">
                      {column.subtitle}
                    </span>
                  ) : null}
                </td>
                {showShiftMetrics ? (
                  <>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      {column.shiftCount ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      {column.totalWorkingHours != null
                        ? `${column.totalWorkingHours} hrs`
                        : "—"}
                    </td>
                  </>
                ) : null}
                <td className="px-4 py-3 text-right font-medium text-gray-900">
                  {formatCurrency(column.subtotalCents)}
                </td>
                {taxRows.map((taxRow) => {
                  const amount = getTaxAmountCents(column, taxRow.key);
                  return (
                    <td
                      key={`${column.id}-${taxRow.key}`}
                      className="px-4 py-3 text-right font-medium text-gray-900"
                    >
                      {amount != null ? formatCurrency(amount) : "—"}
                    </td>
                  );
                })}
                <td className="px-4 py-3 text-right font-bold text-[#F4781B]">
                  {formatCurrency(column.totalCents)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-gray-200 bg-orange-50/40">
              <td className="px-4 py-2.5 text-xs text-gray-600">
                {columns.length} billing period{columns.length === 1 ? "" : "s"}
              </td>
              {columns.map((column) => (
                <td key={`${column.id}-summary`} className="hidden" />
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
      {footerNote ? (
        <p className="text-xs text-gray-500">{footerNote}</p>
      ) : null}
    </div>
  );
}
