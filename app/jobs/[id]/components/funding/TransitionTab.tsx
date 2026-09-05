"use client";

import { useState } from "react";
import { CreditCard, DollarSign, RotateCcw, Wallet } from "lucide-react";
import { DataTable } from "@/components/table/DataTable";
import { PaginationFooter } from "@/components/table/PaginationFooter";
import { MetricCard } from "@/components/ui/metric-card";
import { useJobPayments } from "@/hooks/useJobData";
import type { JobDetailSummaryData } from "@/types";
import { EmptyState, LoadingRows } from "../shared/JobDetailDataView";
import { FeeBreakdownSection } from "./FeeBreakdownSection";
import { formatRelativeTimestamp } from "@/utils/datetime";
import { formatDate, formatLabel, formatPay } from "../shared/job-detail-helpers";

type TransitionTabProps = {
  jobId: string;
  summary: JobDetailSummaryData;
  enabled?: boolean;
};

export function TransitionTab({
  jobId,
  summary,
  enabled = true,
}: TransitionTabProps) {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const { payments, isLoading, error } = useJobPayments(jobId, enabled);
  const ledger = payments?.ledger ?? payments?.transactions ?? [];
  const cycles = payments?.cycles ?? [];
  const transactionHeadings = [
    "Transaction",
    "Type",
    "Amount",
    "Status",
    "Date",
  ];
  const totalTransactions = ledger.length;
  const totalPages = Math.max(1, Math.ceil(totalTransactions / perPage));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * perPage;
  const paginatedTransactions = ledger.slice(
    startIndex,
    startIndex + perPage,
  );

  const fundingSummary = (
    <section>
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
    </section>
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {fundingSummary}
        <LoadingRows count={3} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        {fundingSummary}
        <EmptyState
          title="Unable to load funding details"
          description={error}
        />
      </div>
    );
  }

  if (!payments) {
    return (
      <div className="flex flex-col gap-4">
        {fundingSummary}
        <EmptyState
          title="No funding data found"
          description="Funding details will appear here once the job is published and funded."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {fundingSummary}

      <FeeBreakdownSection payments={payments} />

      {cycles.length > 0 && (
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-4 py-3 sm:px-5">
            <h3 className="text-sm font-semibold text-gray-900">
              Billing Cycles
            </h3>
            <p className="mt-0.5 text-xs text-gray-500">
              Escrow release windows for this job
            </p>
          </div>
          <DataTable
            headers={["Cycle", "Period", "Shifts", "Amount", "Status"]}
            minWidthClassName="min-w-[640px]"
            headerRowClassName="border-b border-gray-100 bg-gray-50/80"
            wrapperClassName="overflow-x-auto"
          >
            {cycles.map((cycle, index) => (
              <tr
                key={cycle.id ?? `cycle-${index}`}
                className="border-b border-gray-50 last:border-b-0"
              >
                <td className="px-4 py-2.5 text-xs font-semibold text-gray-900 sm:px-5">
                  {cycle.label ?? `Cycle ${index + 1}`}
                </td>
                <td className="px-4 py-2.5 text-xs whitespace-nowrap text-gray-500">
                  {cycle.period_start && cycle.period_end
                    ? `${formatDate(cycle.period_start)} – ${formatDate(cycle.period_end)}`
                    : "N/A"}
                </td>
                <td className="px-4 py-2.5 text-xs text-gray-700">
                  {cycle.shift_count ?? "—"}
                </td>
                <td className="px-4 py-2.5 text-xs font-semibold whitespace-nowrap text-gray-900">
                  {formatPay(cycle.amount_cents)}
                </td>
                <td className="px-4 py-2.5 sm:pr-5">
                  <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">
                    {formatLabel(cycle.status)}
                  </span>
                </td>
              </tr>
            ))}
          </DataTable>
        </section>
      )}

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-4 py-3 sm:px-5">
          <h3 className="text-sm font-semibold text-gray-900">Ledger</h3>
          <p className="mt-0.5 text-xs text-gray-500">
            Wallet holds, releases, and refunds for this job
          </p>
        </div>

        {ledger.length === 0 ? (
          <div className="px-4 py-5 text-center sm:px-5">
            <p className="text-sm font-semibold text-gray-700">
              No ledger entries yet
            </p>
            <p className="mt-1 text-xs leading-relaxed text-gray-400">
              Transactions appear here once funds are held, released, or
              refunded.
            </p>
          </div>
        ) : (
          <>
            <DataTable
              headers={transactionHeadings}
              minWidthClassName="min-w-[780px]"
              headerRowClassName="border-b border-gray-100 bg-gray-50/80"
            >
              {paginatedTransactions.map((transaction, index) => {
                const transactionKey =
                  transaction.id ??
                  transaction.transaction_id ??
                  transaction.reference_group_id ??
                  `transaction-${startIndex + index}`;
                const transactionId =
                  transaction.transaction_id ??
                  transaction.id ??
                  transaction.reference_group_id;
                const formattedTransactionId = !transactionId
                  ? "N/A"
                  : transactionId.length <= 12
                    ? transactionId
                    : `${transactionId.slice(0, 6)}...${transactionId.slice(-4)}`;
                const metadataDescription =
                  typeof transaction.metadata?.description === "string"
                    ? transaction.metadata.description
                    : null;
                const transactionDescription =
                  transaction.description ??
                  metadataDescription ??
                  formatLabel(transaction.direction ?? transaction.type);
                const direction = transaction.direction?.toUpperCase();
                const type = transaction.type?.toUpperCase();
                const amountClass =
                  direction === "CREDIT" ||
                  direction === "RELEASE" ||
                  direction === "REFUND" ||
                  type === "REFUND"
                    ? "text-green-700"
                    : direction === "DEBIT" ||
                        direction === "HOLD" ||
                        type === "ESCROW_HOLD"
                      ? "text-[#F4781B]"
                      : "text-gray-900";
                const status = transaction.status?.toUpperCase();
                const statusClassName =
                  status === "COMPLETED" || status === "SUCCESS"
                    ? "bg-green-50 text-green-700"
                    : status === "PENDING"
                      ? "bg-orange-50 text-[#F4781B]"
                      : status === "FAILED"
                        ? "bg-red-50 text-red-600"
                        : "bg-gray-100 text-gray-600";

                const occurredAt = formatRelativeTimestamp(
                  transaction.created_at ?? transaction.updated_at,
                );

                return (
                  <tr
                    key={transactionKey}
                    className="border-b border-gray-50 last:border-b-0"
                  >
                    <td className="px-4 py-2.5">
                      <p className="font-mono text-xs font-semibold text-gray-900">
                        {formattedTransactionId}
                      </p>
                      <p className="mt-0.5 max-w-xs truncate text-[11px] text-gray-400">
                        {transactionDescription}
                      </p>
                    </td>

                    <td className="px-4 py-2.5">
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">
                        {formatLabel(transaction.type)}
                      </span>
                    </td>

                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <p className={`text-xs font-semibold ${amountClass}`}>
                        {formatPay(
                          transaction.amount_cents ??
                            transaction.amount ??
                            transaction.total_amount_cents,
                        )}
                      </p>
                      {transaction.balance_after != null && (
                        <p className="mt-0.5 text-[11px] text-gray-400">
                          Balance {formatPay(transaction.balance_after)}
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-2.5">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusClassName}`}
                      >
                        {formatLabel(transaction.status)}
                      </span>
                    </td>

                    <td
                      className="px-4 py-2.5 text-xs whitespace-nowrap text-gray-500"
                      title={occurredAt.absolute ?? undefined}
                    >
                      {occurredAt.relative ?? "N/A"}
                    </td>
                  </tr>
                );
              })}
            </DataTable>

            <div className="border-t border-gray-100 px-4 py-3 sm:px-5">
              <PaginationFooter
                page={currentPage}
                totalItems={totalTransactions}
                perPage={perPage}
                onPageChange={setPage}
                itemLabel="transactions"
                perPageOptions={[5, 10, 25, 50]}
                onPerPageChange={(nextPerPage) => {
                  setPerPage(nextPerPage);
                  setPage(1);
                }}
              />
            </div>
          </>
        )}
      </section>
    </div>
  );
}
