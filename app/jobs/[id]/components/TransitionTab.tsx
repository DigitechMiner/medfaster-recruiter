"use client";

import { useState } from "react";
import { DataTable } from "@/components/table/DataTable";
import { PaginationFooter } from "@/components/table/PaginationFooter";
import { useJobPayments } from "@/hooks/useJobData";
import { EmptyState, LoadingRows } from "./JobDetailDataView";
import { FeeBreakdownSection } from "./FeeBreakdownSection";
import { formatDate, formatDateTime, formatLabel, formatPay } from "./job-detail-helpers";

type TransitionTabProps = {
  jobId: string;
  enabled?: boolean;
};

export function TransitionTab({ jobId, enabled = true }: TransitionTabProps) {
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

  if (isLoading) {
    return <LoadingRows count={3} />;
  }

  if (error) {
    return (
      <EmptyState
        title="Unable to load funding details"
        description={error}
      />
    );
  }

  if (!payments) {
    return (
      <EmptyState
        title="No funding data found"
        description="Funding details will appear here once the job is published and funded."
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <FeeBreakdownSection payments={payments} />

      {cycles.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold text-gray-900">
            Billing Cycles
          </h3>
          <DataTable
            headers={["Cycle", "Period", "Shifts", "Amount", "Status"]}
            minWidthClassName="min-w-[640px]"
            headerRowClassName="border-b border-gray-200 bg-[#FEF3E9]"
          >
            {cycles.map((cycle, index) => (
              <tr
                key={cycle.id ?? `cycle-${index}`}
                className="border-b border-gray-100 last:border-b-0"
              >
                <td className="px-4 py-3.5 text-sm font-medium text-gray-900">
                  {cycle.label ?? `Cycle ${index + 1}`}
                </td>
                <td className="px-4 py-3.5 text-sm text-gray-500 whitespace-nowrap">
                  {cycle.period_start && cycle.period_end
                    ? `${formatDate(cycle.period_start)} – ${formatDate(cycle.period_end)}`
                    : "N/A"}
                </td>
                <td className="px-4 py-3.5 text-sm text-gray-700">
                  {cycle.shift_count ?? "—"}
                </td>
                <td className="px-4 py-3.5 text-sm font-semibold text-gray-900 whitespace-nowrap">
                  {formatPay(cycle.amount_cents)}
                </td>
                <td className="px-4 py-3.5">
                  <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                    {formatLabel(cycle.status)}
                  </span>
                </td>
              </tr>
            ))}
          </DataTable>
        </section>
      )}

      {ledger.length === 0 ? (
        <EmptyState
          title="No ledger entries yet"
          description="Wallet transactions for this job will appear here once funds are held, released, or refunded."
        />
      ) : (
        <>
          <h3 className="text-sm font-semibold text-gray-900">Ledger</h3>
          <DataTable
            headers={transactionHeadings}
            minWidthClassName="min-w-[780px]"
            headerRowClassName="border-b border-gray-200 bg-[#FEF3E9]"
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

              return (
                <tr
                  key={transactionKey}
                  className="border-b border-gray-100 last:border-b-0"
                >
                  <td className="px-4 py-3.5">
                    <p className="font-mono text-xs font-semibold text-gray-900">
                      {formattedTransactionId}
                    </p>
                    <p className="mt-1 max-w-xs truncate text-xs text-gray-400">
                      {transactionDescription}
                    </p>
                  </td>

                  <td className="px-4 py-3.5">
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                      {formatLabel(transaction.type)}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <p className={`font-semibold ${amountClass}`}>
                      {formatPay(
                        transaction.amount_cents ??
                          transaction.amount ??
                          transaction.total_amount_cents,
                      )}
                    </p>
                    {transaction.balance_after != null && (
                      <p className="mt-1 text-xs text-gray-400">
                        Balance {formatPay(transaction.balance_after)}
                      </p>
                    )}
                  </td>

                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClassName}`}
                    >
                      {formatLabel(transaction.status)}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">
                    {formatDateTime(
                      transaction.created_at ?? transaction.updated_at,
                    )}
                  </td>
                </tr>
              );
            })}
          </DataTable>

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
        </>
      )}
    </div>
  );
}
