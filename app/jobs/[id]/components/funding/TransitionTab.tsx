"use client";

import { useState, type ReactNode } from "react";
import { ClipboardList, CreditCard, DollarSign, RotateCcw, Users, Wallet } from "lucide-react";
import { DataTable } from "@/components/table/DataTable";
import { PaginationFooter } from "@/components/table/PaginationFooter";
import { MetricCard } from "@/components/ui/metric-card";
import { cn } from "@/lib/utils";
import { useJobInterviewFunds, useJobPayments } from "@/hooks/useJobData";
import type {
  JobDetailPaymentCycle,
  JobDetailSummaryData,
  JobInterviewFundItem,
  JobInterviewFundsData,
  JobInterviewFundSummary,
  JobWalletTransactionItem,
} from "@/types";
import { InterviewResultDetailsModal } from "../candidates/InterviewResultDetailsModal";
import { EmptyState, LoadingRows } from "../shared/JobDetailDataView";
import { formatRelativeTimestamp } from "@/utils/datetime";
import { formatDate, formatDateTime, formatLabel, formatPay } from "../shared/job-detail-helpers";

type LedgerView = "all" | "timeline";
type FundingPanel = "job" | "interview";

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
  const [ledgerPage, setLedgerPage] = useState(1);
  const [ledgerPerPage, setLedgerPerPage] = useState(10);
  const [interviewPage, setInterviewPage] = useState(1);
  const [interviewPerPage, setInterviewPerPage] = useState(10);
  const [ledgerView, setLedgerView] = useState<LedgerView>("all");
  const [fundingPanel, setFundingPanel] = useState<FundingPanel>("job");
  const interviewFundingEnabled = summary.ai_interview === true;
  const activePanel: FundingPanel = interviewFundingEnabled
    ? fundingPanel
    : "job";
  const { payments, isLoading, error } = useJobPayments(
    jobId,
    enabled && activePanel === "job",
  );
  const {
    funds: interviewFunds,
    isLoading: interviewLoading,
    error: interviewError,
  } = useJobInterviewFunds(
    jobId,
    { page: interviewPage, limit: interviewPerPage },
    enabled && activePanel === "interview",
  );
  const ledger = payments?.ledger ?? payments?.transactions ?? [];
  const cycles = payments?.cycles ?? [];
  const visibleLedger = ledger;
  const contracted =
    payments?.contract_amount_cents ?? summary.contract_amount_cents;
  const held = payments?.escrow_held_cents ?? summary.escrow_held_cents;
  const spent = payments?.spent_cents ?? summary.spent_cents;
  const refunded = payments?.refunded_cents ?? summary.refunded_cents;
  const fundingStatus = payments?.funding_status ?? summary.funding_status;
  const funding = payments?.funding;
  const transactionHeadings = [
    "Transaction",
    "Type",
    "Amount",
    "Status",
    "Date",
  ];
  const totalTransactions = visibleLedger.length;
  const totalPages = Math.max(1, Math.ceil(totalTransactions / ledgerPerPage));
  const currentPage = Math.min(ledgerPage, totalPages);
  const startIndex = (currentPage - 1) * ledgerPerPage;
  const paginatedTransactions = visibleLedger.slice(
    startIndex,
    startIndex + ledgerPerPage,
  );
  const timelineTransactions = [...visibleLedger].sort(
    (left, right) => transactionTime(left) - transactionTime(right),
  );
  const paginatedTimeline = timelineTransactions.slice(
    startIndex,
    startIndex + ledgerPerPage,
  );
  const fundingType = funding?.funding_type;
  const modeLabel = formatFundingMode(fundingType);
  const statusValue = funding?.status ?? fundingStatus;
  const contractWindow = formatContractWindow(
    funding?.contract_start_date,
    funding?.contract_end_date,
  );
  const nextUnpaid = findNextUnpaidCycle(cycles);
  const contractIsCurrent = cycles.length > 0 && nextUnpaid == null;
  const heldSubLabel = (fundingType ?? "").toUpperCase().includes("MONTH")
    ? "This billing cycle"
    : "In escrow";

  const summaryLoading = isLoading && !payments;
  const interviewCount =
    interviewFunds?.pagination?.total ?? interviewFunds?.interviews.length ?? 0;
  const interviewSummaryLoading = interviewLoading && !interviewFunds;

  const fundingHeader = (
    <FundingModeHeader
      modeLabel={modeLabel}
      statusValue={statusValue}
      contractWindow={contractWindow}
      nextUnpaid={nextUnpaid}
      contractIsCurrent={contractIsCurrent}
      loading={summaryLoading}
    />
  );

  const fundingSummary = (
    <SummaryGrid>
      <MetricCard
        icon={<DollarSign size={18} />}
        title="Contracted"
        value={formatPay(contracted)}
        subLabel={fundingType ? formatLabel(fundingType) : formatLabel(fundingStatus)}
        loading={summaryLoading}
        className="border-gray-200"
      />
      <MetricCard
        icon={<Wallet size={18} />}
        title="Held"
        value={formatPay(held)}
        subLabel={heldSubLabel}
        loading={summaryLoading}
        className="border-gray-200"
      />
      <MetricCard
        icon={<CreditCard size={18} />}
        title="Spent"
        value={formatPay(spent)}
        subLabel="Paid to candidates"
        loading={summaryLoading}
        className="border-gray-200"
      />
      <MetricCard
        icon={<RotateCcw size={18} />}
        title="Refunded"
        value={formatPay(refunded)}
        subLabel="Returned"
        loading={summaryLoading}
        className="border-gray-200"
      />
    </SummaryGrid>
  );

  return (
    <div className="flex flex-col gap-4">
      {fundingHeader}
      {interviewFundingEnabled && (
        <FundingUnderlineTabs
          value={activePanel}
          onChange={setFundingPanel}
        />
      )}

      {activePanel === "job" && (
      <section className="flex flex-col gap-4">
      {fundingSummary}
      {isLoading && <LoadingRows count={3} />}

      {!isLoading && error && (
        <EmptyState
          title="Unable to load funding details"
          description={error}
        />
      )}

      {!isLoading && !error && !payments && (
        <EmptyState
          title="No funding data found"
          description="Funding details will appear here once the job is published and funded."
        />
      )}

      {!isLoading && cycles.length > 0 && (
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-4 py-3 sm:px-5">
            <h3 className="text-sm font-semibold text-gray-900">
              Billing Cycles
            </h3>
            <p className="mt-0.5 text-xs text-gray-500">
              {funding?.funding_type
                ? `${formatLabel(funding.funding_type)} funding`
                : "Escrow windows for this job"}
              {funding?.contract_start_date && funding?.contract_end_date
                ? ` · ${formatDate(funding.contract_start_date)} – ${formatDate(funding.contract_end_date)}`
                : ""}
            </p>
          </div>
          <DataTable
            headers={["Cycle", "Period", "Invoice", "Amount", "Status"]}
            minWidthClassName="min-w-[720px]"
            headerRowClassName="border-b border-gray-100 bg-gray-50/80"
            wrapperClassName="overflow-x-auto"
          >
            {cycles.map((cycle, index) => {
              const invoice = cycle.invoice;
              const invoiceStatus = invoice?.status?.toUpperCase();
              const invoiceStatusClass =
                invoiceStatus === "PAID"
                  ? "bg-green-50 text-green-700"
                  : invoiceStatus === "PENDING"
                    ? "bg-orange-50 text-[#F4781B]"
                    : "bg-gray-100 text-gray-600";

              return (
                <tr
                  key={cycle.id ?? `cycle-${index}`}
                  className="border-b border-gray-50 last:border-b-0"
                >
                  <td className="px-4 py-2.5 text-xs font-semibold text-gray-900 sm:px-5">
                    {cycle.label ?? `Cycle ${cycle.cycle_number ?? index + 1}`}
                  </td>
                  <td className="px-4 py-2.5 text-xs whitespace-nowrap text-gray-500">
                    {cycle.period_start && cycle.period_end
                      ? `${formatDate(cycle.period_start)} – ${formatDate(cycle.period_end)}`
                      : "N/A"}
                  </td>
                  <td className="px-4 py-2.5">
                    {invoice ? (
                      <div>
                        <p className="font-mono text-xs font-semibold text-gray-900">
                          {invoice.invoice_number ?? "Invoice"}
                        </p>
                        <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                          {invoice.status && (
                            <span
                              className={`inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${invoiceStatusClass}`}
                            >
                              {formatLabel(invoice.status)}
                            </span>
                          )}
                          <span className="text-[11px] text-gray-400">
                            {invoice.paid_at
                              ? `Paid ${formatDateTime(invoice.paid_at)}`
                              : invoice.due_date
                                ? `Due ${formatDate(invoice.due_date)}`
                                : ""}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <p className="text-xs font-semibold text-gray-900">
                      {formatPay(cycle.amount_cents)}
                    </p>
                    {cycle.estimated_amount_cents != null &&
                      cycle.actual_amount_cents != null &&
                      String(cycle.estimated_amount_cents) !==
                        String(cycle.actual_amount_cents) && (
                        <p className="mt-0.5 text-[11px] text-gray-400">
                          Est. {formatPay(cycle.estimated_amount_cents)}
                        </p>
                      )}
                  </td>
                  <td className="px-4 py-2.5 sm:pr-5">
                    <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">
                      {formatLabel(cycle.status)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </DataTable>
        </section>
      )}

      {!isLoading && visibleLedger.length > 0 && ledgerView === "timeline" && (
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Money timeline
              </h3>
              <p className="mt-0.5 text-xs text-gray-500">
                Holds, payouts, and refunds, oldest first
              </p>
            </div>
            <LedgerPresentationSwitch
              value={ledgerView}
              onChange={setLedgerView}
            />
          </div>
          <ol className="px-4 py-4 sm:px-5">
            {paginatedTimeline.map((transaction, index) => {
              const details = describeTransaction(transaction, startIndex + index);
              return (
                <li
                  key={details.key}
                  className="relative border-l border-gray-200 pb-4 pl-4 last:pb-0"
                >
                  <span className="absolute -left-1 top-1.5 h-2 w-2 rounded-full bg-[#F4781B]" />
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">
                        {details.description}
                      </p>
                      <p className="mt-0.5 text-[11px] text-gray-400">
                        {formatLabel(transaction.type)}
                        {details.occurredAt.relative
                          ? ` · ${details.occurredAt.relative}`
                          : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <p className={`text-sm font-semibold ${details.amountClass}`}>
                        {details.amount}
                      </p>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${details.statusClassName}`}
                      >
                        {formatLabel(transaction.status)}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
          <div className="border-t border-gray-100 px-4 py-3 sm:px-5">
            <PaginationFooter
              page={currentPage}
              totalItems={totalTransactions}
              perPage={ledgerPerPage}
              onPageChange={setLedgerPage}
              itemLabel="transactions"
              perPageOptions={[5, 10, 25, 50]}
              onPerPageChange={(nextPerPage) => {
                setLedgerPerPage(nextPerPage);
                setLedgerPage(1);
              }}
            />
          </div>
        </section>
      )}

      {!isLoading && visibleLedger.length > 0 && ledgerView === "all" && (
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Ledger</h3>
              <p className="mt-0.5 text-xs text-gray-500">
                Wallet holds, releases, and refunds for this job
              </p>
            </div>
            <LedgerPresentationSwitch
              value={ledgerView}
              onChange={setLedgerView}
            />
          </div>
          <DataTable
            headers={transactionHeadings}
            minWidthClassName="min-w-[780px]"
            headerRowClassName="border-b border-gray-100 bg-gray-50/80"
          >
            {paginatedTransactions.map((transaction, index) => {
                const details = describeTransaction(transaction, startIndex + index);

                return (
                  <tr
                    key={details.key}
                    className="border-b border-gray-50 last:border-b-0"
                  >
                    <td className="px-4 py-2.5">
                      <p className="font-mono text-xs font-semibold text-gray-900">
                        {details.formattedId}
                      </p>
                      <p className="mt-0.5 max-w-xs truncate text-[11px] text-gray-400">
                        {details.description}
                      </p>
                    </td>

                    <td className="px-4 py-2.5">
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">
                        {formatLabel(transaction.type)}
                      </span>
                    </td>

                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <p className={`text-xs font-semibold ${details.amountClass}`}>
                        {details.amount}
                      </p>
                      {transaction.balance_after != null && (
                        <p className="mt-0.5 text-[11px] text-gray-400">
                          Balance {formatPay(transaction.balance_after)}
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-2.5">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${details.statusClassName}`}
                      >
                        {formatLabel(transaction.status)}
                      </span>
                    </td>

                    <td
                      className="px-4 py-2.5 text-xs whitespace-nowrap text-gray-500"
                      title={details.occurredAt.absolute ?? undefined}
                    >
                      {details.occurredAt.relative ?? "N/A"}
                    </td>
                  </tr>
                );
              })}
            </DataTable>

            <div className="border-t border-gray-100 px-4 py-3 sm:px-5">
              <PaginationFooter
                page={currentPage}
                totalItems={totalTransactions}
                perPage={ledgerPerPage}
                onPageChange={setLedgerPage}
                itemLabel="transactions"
                perPageOptions={[5, 10, 25, 50]}
                onPerPageChange={(nextPerPage) => {
                  setLedgerPerPage(nextPerPage);
                  setLedgerPage(1);
                }}
              />
            </div>
        </section>
      )}
      </section>
      )}

      {interviewFundingEnabled && activePanel === "interview" && (
      <section className="flex flex-col gap-4">
        <InterviewFundsSummary
          summary={interviewFunds?.summary}
          interviewCount={interviewCount}
          isLoading={interviewSummaryLoading}
        />
        <InterviewFundsPanel
          funds={interviewFunds}
          isLoading={interviewLoading}
          error={interviewError}
          jobTitle={summary.title}
          page={interviewPage}
          perPage={interviewPerPage}
          onPageChange={setInterviewPage}
          onPerPageChange={(nextPerPage) => {
            setInterviewPerPage(nextPerPage);
            setInterviewPage(1);
          }}
        />
      </section>
      )}
    </div>
  );
}

function FundingUnderlineTabs({
  value,
  onChange,
}: {
  value: FundingPanel;
  onChange: (value: FundingPanel) => void;
}) {
  const tabs: { id: FundingPanel; label: string }[] = [
    { id: "job", label: "Job funding" },
    { id: "interview", label: "Interview funding" },
  ];

  return (
    <div
      role="tablist"
      aria-label="Funding sections"
      className="flex gap-6 border-b border-gray-200"
    >
      {tabs.map((tab) => {
        const selected = value === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab.id)}
            className={cn(
              "-mb-px inline-flex items-center gap-2 border-b-2 pb-2.5 text-sm font-semibold transition-colors",
              selected
                ? "border-[#F4781B] text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-800",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

function LedgerPresentationSwitch({
  value,
  onChange,
}: {
  value: LedgerView;
  onChange: (view: LedgerView) => void;
}) {
  const options: { value: LedgerView; label: string }[] = [
    { value: "all", label: "Ledger" },
    { value: "timeline", label: "Timeline" },
  ];

  return (
    <div className="inline-flex shrink-0 rounded-lg border border-gray-200 bg-gray-50 p-0.5">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
            value === option.value
              ? "bg-white text-[#f47b20] shadow-sm"
              : "text-gray-500 hover:text-gray-800",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function SummaryGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 sm:gap-4">
      {children}
    </div>
  );
}

function FundingModeHeader({
  modeLabel,
  statusValue,
  contractWindow,
  nextUnpaid,
  contractIsCurrent,
  loading = false,
}: {
  modeLabel: string;
  statusValue?: string | null;
  contractWindow: string | null;
  nextUnpaid: JobDetailPaymentCycle | null;
  contractIsCurrent: boolean;
  loading?: boolean;
}) {
  const status = statusValue?.toUpperCase();
  const statusClass =
    status === "ACTIVE" || status === "PAID" || status === "FUNDED"
      ? "bg-green-50 text-green-700"
      : status === "PENDING" || status === "DUE"
        ? "bg-orange-50 text-[#F4781B]"
        : "bg-gray-100 text-gray-600";
  const dueDate = nextUnpaid?.invoice?.due_date;
  const nextStatus = nextUnpaid?.invoice?.status ?? nextUnpaid?.status;
  const nextDetail = [
    dueDate ? `Due ${formatDate(dueDate)}` : null,
    nextStatus ? formatLabel(nextStatus) : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 py-4 sm:px-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Funding
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-900">{modeLabel}</h3>
            {statusValue && (
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusClass}`}
              >
                {formatLabel(statusValue)}
              </span>
            )}
          </div>
          {contractWindow && (
            <p className="mt-1 text-xs text-gray-500">{contractWindow}</p>
          )}
        </div>

        {loading ? (
          <div
            className="h-[72px] w-full animate-pulse rounded-xl bg-gray-100 sm:w-[220px]"
            aria-hidden
          />
        ) : nextUnpaid ? (
          <div className="rounded-xl border border-orange-100 bg-orange-50 px-3 py-2.5 sm:min-w-[220px]">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#F4781B]">
              Next payment
            </p>
            <p className="mt-0.5 text-sm font-semibold text-gray-900">
              {formatPay(nextUnpaid.amount_cents)}
            </p>
            {nextDetail && (
              <p className="mt-0.5 text-xs text-gray-600">{nextDetail}</p>
            )}
          </div>
        ) : contractIsCurrent ? (
          <div className="rounded-xl border border-green-100 bg-green-50 px-3 py-2.5 sm:min-w-[220px]">
            <p className="text-sm font-semibold text-green-700">
              Contract is current
            </p>
            <p className="mt-0.5 text-xs text-green-700/80">
              Every billing cycle is paid.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function formatFundingMode(value?: string | null) {
  if (!value) return "Job funding";
  const label = formatLabel(value);
  if (/billing|upfront|escrow|hold/i.test(`${value} ${label}`)) return label;
  return `${label} billing`;
}

function formatContractWindow(start?: string | null, end?: string | null) {
  if (start && end) return `${formatDate(start)} – ${formatDate(end)}`;
  if (start) return `Starts ${formatDate(start)}`;
  if (end) return `Ends ${formatDate(end)}`;
  return null;
}

function isCyclePaid(cycle: JobDetailPaymentCycle) {
  if (cycle.invoice?.status?.toUpperCase() === "PAID") return true;
  if (cycle.invoice) return false;
  const cycleStatus = cycle.status?.toUpperCase();
  return cycleStatus === "PAID" || cycleStatus === "COMPLETED";
}

function findNextUnpaidCycle(cycles: JobDetailPaymentCycle[]) {
  return cycles.find((cycle) => !isCyclePaid(cycle)) ?? null;
}

function InterviewFundsSummary({
  summary,
  interviewCount,
  isLoading,
}: {
  summary?: JobInterviewFundSummary | null;
  interviewCount: number;
  isLoading: boolean;
}) {
  return (
    <SummaryGrid>
      <MetricCard
        icon={<Users size={18} />}
        title="Interviews"
        value={interviewCount}
        subLabel="Requests on this job"
        loading={isLoading}
        className="border-gray-200"
      />
      <MetricCard
        icon={<Wallet size={18} />}
        title="Held"
        value={formatPay(summary?.held_amount_cents ?? 0)}
        subLabel="Still reserved"
        loading={isLoading}
        className="border-gray-200"
      />
      <MetricCard
        icon={<CreditCard size={18} />}
        title="Spent"
        value={formatPay(summary?.spent_amount_cents ?? 0)}
        subLabel="Captured"
        loading={isLoading}
        className="border-gray-200"
      />
      <MetricCard
        icon={<RotateCcw size={18} />}
        title="Refunded"
        value={formatPay(summary?.refunded_amount_cents ?? 0)}
        subLabel="Returned"
        loading={isLoading}
        className="border-gray-200"
      />
    </SummaryGrid>
  );
}

function InterviewFundsPanel({
  funds,
  isLoading,
  error,
  jobTitle,
  page,
  perPage,
  onPageChange,
  onPerPageChange,
}: {
  funds: JobInterviewFundsData | null;
  isLoading: boolean;
  error: string | null;
  jobTitle?: string | null;
  page: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
}) {
  const [selectedInterview, setSelectedInterview] =
    useState<JobInterviewFundItem | null>(null);
  const selectedCandidate = selectedInterview?.candidate;
  const selectedName = [selectedCandidate?.first_name, selectedCandidate?.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();

  if (isLoading && !funds) {
    return <LoadingRows count={3} />;
  }

  if (error) {
    return (
      <EmptyState title="Unable to load interview funds" description={error} />
    );
  }

  const interviews = funds?.interviews ?? [];
  const total = funds?.pagination?.total ?? interviews.length;
  const currentPage = funds?.pagination?.page ?? page;

  if (!isLoading && total === 0) {
    return (
      <EmptyState
        title="No interview charges on this job"
        description="Interview holds and payments will appear here when a request is funded."
      />
    );
  }

  return (
    <>
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="border-b border-gray-100 px-4 py-3 sm:px-5">
        <h3 className="text-sm font-semibold text-gray-900">Interview requests</h3>
        <p className="mt-0.5 text-xs text-gray-500">
          Each fee is held, captured, or refunded
        </p>
      </div>
      <DataTable
        headers={[
          "Candidate",
          "Request",
          "Interview",
          "Fee status",
          "Fee",
          "Held",
          "Spent",
          "Refunded",
          "Score",
          "Result",
        ]}
        minWidthClassName="min-w-[1180px]"
        headerRowClassName="border-b border-gray-100 bg-gray-50/80"
        wrapperClassName="overflow-x-auto"
      >
        {interviews.map((interview, index) => (
          <InterviewFundRow
            key={interview.interview_request_id ?? `interview-${index}`}
            interview={interview}
            onViewDetails={
              interview.interview_id
                ? () => setSelectedInterview(interview)
                : undefined
            }
          />
        ))}
      </DataTable>
      {total > perPage && (
        <div className="border-t border-gray-100 px-4 py-3 sm:px-5">
          <PaginationFooter
            page={currentPage}
            totalItems={total}
            perPage={funds?.pagination?.limit ?? perPage}
            onPageChange={onPageChange}
            itemLabel="interviews"
            perPageOptions={[5, 10, 25, 50]}
            onPerPageChange={onPerPageChange}
          />
        </div>
      )}
    </section>
    <InterviewResultDetailsModal
      open={selectedInterview != null}
      interviewId={selectedInterview?.interview_id ?? null}
      candidateName={selectedName || undefined}
      candidateProfileImageUrl={selectedCandidate?.profile_image_url}
      jobTitle={jobTitle}
      overallScore={selectedInterview?.interview_score}
      onClose={() => setSelectedInterview(null)}
    />
    </>
  );
}

function InterviewFundRow({
  interview,
  onViewDetails,
}: {
  interview: JobInterviewFundItem;
  onViewDetails?: () => void;
}) {
  const candidate = interview.candidate;
  const name = [candidate?.first_name, candidate?.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  const displayName = name || "Candidate";
  const feeStatus = interview.fee_status?.toUpperCase();
  const feeStatusClass =
    feeStatus === "HELD"
      ? "bg-orange-50 text-[#F4781B]"
      : feeStatus === "CAPTURED"
        ? "bg-green-50 text-green-700"
        : feeStatus === "REFUNDED"
          ? "bg-sky-50 text-sky-700"
          : "bg-gray-100 text-gray-600";
  const requestStatus = formatRequestStatus(interview.interview_request_status);
  const outcome = formatInterviewOutcome(
    interview.interview_status,
    interview.termination_reason,
  );

  return (
    <tr className="border-b border-gray-50 last:border-b-0">
      <td className="px-4 py-2.5 sm:px-5">
        <div className="flex min-w-0 items-center gap-2.5">
          <InterviewCandidateAvatar
            name={displayName}
            image={candidate?.profile_image_url}
          />
          <div className="min-w-0">
            <p
              className="truncate text-xs font-semibold text-gray-900"
              title={candidate?.id ?? undefined}
            >
              {displayName}
            </p>
            {candidate?.id && (
              <p className="mt-0.5 font-mono text-[10px] text-gray-400">
                {shortId(candidate.id)}
              </p>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-2.5">
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${requestStatus.className}`}
        >
          {requestStatus.label}
        </span>
      </td>
      <td className="px-4 py-2.5">
        <p className={`text-xs font-semibold ${outcome.className}`}>
          {outcome.label}
        </p>
        {outcome.detail && (
          <p className="mt-0.5 text-[11px] text-gray-500">{outcome.detail}</p>
        )}
      </td>
      <td className="px-4 py-2.5">
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${feeStatusClass}`}
        >
          {formatLabel(interview.fee_status)}
        </span>
      </td>
      <td className="px-4 py-2.5 text-xs font-semibold whitespace-nowrap text-gray-900">
        {formatPay(interview.interview_fee_cents)}
      </td>
      <td className="px-4 py-2.5 text-xs font-semibold whitespace-nowrap text-[#F4781B]">
        {formatPay(interview.hold_amount_cents)}
      </td>
      <td className="px-4 py-2.5 text-xs font-semibold whitespace-nowrap text-gray-900">
        {formatPay(interview.spent_amount_cents)}
      </td>
      <td className="px-4 py-2.5 text-xs font-semibold whitespace-nowrap text-gray-900">
        {formatPay(interview.refunded_amount_cents)}
      </td>
      <td className="px-4 py-2.5">
        <InterviewScoreChip score={interview.interview_score} />
      </td>
      <td className="px-4 py-2.5 sm:pr-5">
        {onViewDetails ? (
          <button
            type="button"
            onClick={onViewDetails}
            aria-label="View interview result"
            title="View interview result"
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-sky-200 bg-sky-50 px-2.5 text-xs font-semibold whitespace-nowrap text-sky-800 shadow-sm transition-colors hover:border-sky-300 hover:bg-sky-100"
          >
            <ClipboardList size={14} />
            Result
          </button>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        )}
      </td>
    </tr>
  );
}

function InterviewScoreChip({ score }: { score?: number | null }) {
  if (score == null) {
    return <span className="text-xs text-gray-400">—</span>;
  }

  const tone =
    score >= 70
      ? "bg-green-50 text-[#17B26A]"
      : score >= 40
        ? "bg-orange-50 text-orange-600"
        : "bg-red-50 text-red-600";

  return (
    <span
      className={`inline-flex items-baseline rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${tone}`}
    >
      {score}
      <span className="ml-0.5 text-[10px] font-medium text-gray-400">/100</span>
    </span>
  );
}

function formatRequestStatus(status?: string | null) {
  const normalized = status?.toUpperCase() ?? "";
  const label = status ? formatLabel(status) : "—";

  switch (normalized) {
    case "PENDING":
      return { label, className: "bg-amber-50 text-amber-700" };
    case "ACCEPTED":
      return { label, className: "bg-sky-50 text-sky-700" };
    case "COMPLETED":
      return { label, className: "bg-green-50 text-green-700" };
    case "EXPIRED":
      return { label, className: "bg-gray-100 text-gray-600" };
    case "CANCELLED":
    case "CANCELED":
      return { label, className: "bg-red-50 text-red-600" };
    default:
      return { label, className: "bg-gray-100 text-gray-600" };
  }
}

function formatInterviewOutcome(
  status?: string | null,
  reason?: string | null,
) {
  const normalized = status?.toUpperCase() ?? "";
  const terminated = normalized === "TERMINATED" || Boolean(reason);

  if (terminated) {
    return {
      label: "Terminated",
      detail: formatTerminationReason(reason),
      className: "text-red-600",
    };
  }

  if (normalized === "COMPLETED") {
    return {
      label: "Completed",
      detail: null,
      className: "text-green-700",
    };
  }

  if (!normalized) {
    return {
      label: "Not completed",
      detail: null,
      className: "text-gray-500",
    };
  }

  return {
    label: formatLabel(status),
    detail: null,
    className: "text-gray-700",
  };
}

function formatTerminationReason(reason?: string | null) {
  if (!reason) return "Interview was stopped";
  switch (reason.toUpperCase()) {
    case "CANDIDATE_ABORT":
      return "By candidate";
    case "RECRUITER_ABORT":
      return "By recruiter";
    case "TIMEOUT":
    case "TIME_LIMIT":
      return "Time limit";
    case "SYSTEM":
    case "SYSTEM_ERROR":
      return "By system";
    default:
      return formatLabel(reason);
  }
}

function shortId(value: string) {
  return value.length <= 12 ? value : `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function InterviewCandidateAvatar({
  name,
  image,
}: {
  name: string;
  image?: string | null;
}) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(image) && !failed;
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-orange-100 text-[#F4781B] ring-1 ring-orange-50">
      <span className="flex h-full w-full items-center justify-center text-[10px] font-bold">
        {initials || "?"}
      </span>
      {showImage && (
        // eslint-disable-next-line @next/next/no-img-element -- candidate CDNs vary; avoid next/image host restrictions
        <img
          src={image as string}
          alt={name}
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

function transactionTime(transaction: JobWalletTransactionItem) {
  const raw = transaction.created_at ?? transaction.updated_at;
  const time = raw ? new Date(raw).getTime() : 0;
  return Number.isNaN(time) ? 0 : time;
}

function describeTransaction(
  transaction: JobWalletTransactionItem,
  index: number,
) {
  const transactionId =
    transaction.transaction_id ??
    transaction.id ??
    transaction.reference_group_id;
  const metadataDescription =
    typeof transaction.metadata?.description === "string"
      ? transaction.metadata.description
      : null;
  const direction = transaction.direction?.toUpperCase();
  const type = transaction.type?.toUpperCase();
  const status = transaction.status?.toUpperCase();

  return {
    key:
      transaction.id ??
      transaction.transaction_id ??
      transaction.reference_group_id ??
      `transaction-${index}`,
    formattedId: !transactionId
      ? "N/A"
      : transactionId.length <= 12
        ? transactionId
        : `${transactionId.slice(0, 6)}...${transactionId.slice(-4)}`,
    description:
      transaction.description ??
      metadataDescription ??
      formatLabel(transaction.direction ?? transaction.type),
    amount: formatPay(
      transaction.amount_cents ??
        transaction.amount ??
        transaction.total_amount_cents,
    ),
    amountClass:
      direction === "CREDIT" ||
      direction === "RELEASE" ||
      direction === "REFUND" ||
      type === "REFUND"
        ? "text-green-700"
        : direction === "DEBIT" ||
            direction === "HOLD" ||
            type === "ESCROW_HOLD"
          ? "text-[#F4781B]"
          : "text-gray-900",
    statusClassName:
      status === "COMPLETED" || status === "SUCCESS" || status === "PAID"
        ? "bg-green-50 text-green-700"
        : status === "PENDING"
          ? "bg-orange-50 text-[#F4781B]"
          : status === "FAILED"
            ? "bg-red-50 text-red-600"
            : "bg-gray-100 text-gray-600",
    occurredAt: formatRelativeTimestamp(
      transaction.created_at ?? transaction.updated_at,
    ),
  };
}
