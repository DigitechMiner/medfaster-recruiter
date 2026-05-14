"use client";

import { useState } from "react";
import { DataTable } from "@/components/table/DataTable";
import { PaginationFooter } from "@/components/table/PaginationFooter";
import { useJobWalletTransactions } from "@/hooks/useJobData";
import { EmptyState, LoadingRows } from "./JobDetailDataView";
import { formatDateTime, formatLabel, formatPay } from "./job-detail-helpers";

type TransitionTabProps = {
  jobId: string;
};

export function TransitionTab({ jobId }: TransitionTabProps) {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const {
    transactions,
    isLoading: transactionsLoading,
    error: transactionsError,
  } = useJobWalletTransactions(jobId);
  const walletTransactions = transactions?.transactions ?? [];
  const transactionHeadings = [
    "Transaction",
    "Type",
    "Amount",
    "Status",
    "Date",
  ];
  const totalTransactions = walletTransactions.length;
  const totalPages = Math.max(1, Math.ceil(totalTransactions / perPage));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * perPage;
  const paginatedTransactions = walletTransactions.slice(
    startIndex,
    startIndex + perPage,
  );

  if (transactionsLoading) {
    return <LoadingRows count={3} />;
  }

  if (transactionsError) {
    return (
      <EmptyState
        title="Unable to load wallet transactions"
        description={transactionsError}
      />
    );
  }

  if (walletTransactions.length === 0) {
    return (
      <EmptyState
        title="No wallet transactions found"
        description="Job wallet transactions will appear here once funds are held, released, or refunded."
      />
    );
  }

  return (
    <>
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
  );
}
