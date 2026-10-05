"use client";

import { type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useJobInvoice } from "@/hooks/useJobData";
import type { JobInvoiceDetail, JobWalletTransactionItem } from "@/types";
import { formatRelativeTimestamp } from "@/utils/datetime";
import {
  formatDate,
  formatDateTime,
  formatLabel,
  formatPay,
} from "../shared/job-detail-helpers";

type InvoiceDetailsDialogProps = {
  jobId: string;
  invoiceId: string | null;
  open: boolean;
  onClose: () => void;
};

function statusClass(status?: string | null) {
  switch ((status ?? "").toUpperCase()) {
    case "PAID":
    case "COMPLETED":
    case "SUCCESS":
      return "bg-green-50 text-green-700";
    case "PENDING":
      return "bg-orange-50 text-[#F4781B]";
    case "FAILED":
      return "bg-red-50 text-red-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

function formatTaxPercentage(value?: number | null) {
  if (value == null || !Number.isFinite(value)) return "N/A";
  const shown = Number.isInteger(value)
    ? String(value)
    : String(Number(value.toFixed(2)));
  return `${shown}%`;
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="text-right text-xs font-semibold text-gray-900">{value}</dd>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-gray-100 bg-gray-50/70 px-3 py-2.5">
      <h3 className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
        {title}
      </h3>
      <dl className="mt-1 divide-y divide-gray-100">{children}</dl>
    </section>
  );
}

function walletAmount(payment: JobWalletTransactionItem) {
  return formatPay(
    payment.amount_cents ?? payment.amount ?? payment.total_amount_cents,
  );
}

function InvoiceBody({ invoice }: { invoice: JobInvoiceDetail }) {
  const cycle = invoice.billing_cycle;
  const ledger = invoice.ledger;
  const payment = invoice.wallet_payment;
  const period =
    cycle?.period_start && cycle?.period_end
      ? `${formatDate(cycle.period_start)} – ${formatDate(cycle.period_end)}`
      : "N/A";
  const taxLabel = invoice.tax_name
    ? `${invoice.tax_name} (${formatTaxPercentage(invoice.tax_percentage)})`
    : formatTaxPercentage(invoice.tax_percentage);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {invoice.status ? (
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusClass(invoice.status)}`}
          >
            {formatLabel(invoice.status)}
          </span>
        ) : null}
        <span className="text-xs text-gray-500">
          {invoice.paid_at
            ? `Paid ${formatDateTime(invoice.paid_at)}`
            : invoice.due_date
              ? `Due ${formatDate(invoice.due_date)}`
              : "No due date"}
        </span>
      </div>

      <Section title="Amounts">
        <DetailRow label="Subtotal" value={formatPay(invoice.subtotal_cents)} />
        <DetailRow label={taxLabel === "N/A" ? "Tax" : taxLabel} value={formatPay(invoice.tax_amount_cents)} />
        <DetailRow label="Total" value={formatPay(invoice.total_amount_cents)} />
      </Section>

      <Section title="Hourly">
        <DetailRow
          label="1h charge"
          value={formatPay(invoice.recruiter_pay_per_hour_cents)}
        />
      </Section>

      <Section title="Billing cycle">
        <DetailRow label="Period" value={period} />
        <DetailRow
          label="Status"
          value={cycle?.status ? formatLabel(cycle.status) : "N/A"}
        />
      </Section>

      <Section title="Cycle ledger">
        <DetailRow
          label="Payment received"
          value={formatPay(ledger?.total_payment_received_cents)}
        />
        <DetailRow
          label="Tax collected"
          value={formatPay(ledger?.total_tax_collected_cents)}
        />
        <DetailRow
          label="Refunds"
          value={formatPay(ledger?.total_refund_cents)}
        />
      </Section>

      {payment ? (
        <Section title="Wallet payment">
          <DetailRow
            label="Description"
            value={
              payment.description ??
              formatLabel(payment.type ?? payment.direction)
            }
          />
          <DetailRow label="Amount" value={walletAmount(payment)} />
          <DetailRow
            label="Status"
            value={payment.status ? formatLabel(payment.status) : "N/A"}
          />
          <DetailRow
            label="Date"
            value={
              formatRelativeTimestamp(payment.created_at ?? payment.updated_at)
                .absolute ??
              formatDateTime(payment.created_at ?? payment.updated_at)
            }
          />
        </Section>
      ) : null}
    </div>
  );
}

export function InvoiceDetailsDialog({
  jobId,
  invoiceId,
  open,
  onClose,
}: InvoiceDetailsDialogProps) {
  const { invoice, isLoading, error } = useJobInvoice(jobId, invoiceId, open);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <DialogContent className="max-h-[85vh] gap-4 overflow-y-auto sm:max-w-lg">
        <DialogHeader className="space-y-1 pr-8 text-left">
          <DialogTitle>
            {invoice?.invoice_number ?? "Invoice"}
          </DialogTitle>
          <DialogDescription>
            Billing cycle invoice
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center gap-2 py-6 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading invoice…
          </div>
        ) : error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">
            {error}
          </p>
        ) : invoice ? (
          <InvoiceBody invoice={invoice} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
