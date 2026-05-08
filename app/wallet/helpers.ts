import type { WalletTransaction } from "@/stores/api/recruiter-wallet-api";

export type TabKey =
  | "all"
  | "credit"
  | "hold"
  | "release"
  | "bonus"
  | "refund";

export function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-CA", { minimumFractionDigits: 0 })}`;
}

export function getTransactionId(tx: WalletTransaction): string {
  const rawId = tx.id ?? tx.transaction_id;
  if (!rawId) return "—";

  if (rawId.length <= 7) return rawId;
  return `TX-${rawId.slice(0, 4)}...${rawId.slice(-3)}`;
}

export function getDirection(tx: WalletTransaction): {
  label: string;
  color: string;
} {
  const direction = tx.direction?.toUpperCase();
  if (direction === "CREDIT") return { label: "Credit", color: "green" };
  if (direction === "DEBIT") return { label: "Debit", color: "orange" };
  if (direction === "HOLD") return { label: "Hold", color: "blue" };
  if (direction === "RELEASE") return { label: "Release", color: "green" };
  if (direction === "REFUND") return { label: "Refund", color: "green" };

  const type = tx.type?.toUpperCase();
  if (type === "TOPUP" || type === "DEPOSIT")
    return { label: "Credit", color: "green" };
  if (type === "ESCROW_HOLD") return { label: "Debit", color: "orange" };
  if (type === "ESCROW_RELEASE" || type === "JOB_PAYMENT")
    return { label: "Credit", color: "green" };
  if (type === "REFUND") return { label: "Refund", color: "green" };
  if (type === "WITHDRAWAL") return { label: "Debit", color: "orange" };
  return { label: tx.type ?? "—", color: "gray" };
}

export function getDescription(tx: WalletTransaction): {
  line1: string;
  line2?: string;
} {
  const metaDesc = tx.metadata?.description as string | undefined;
  const jobId = tx.metadata?.job_id as string | undefined;
  const type = tx.type?.toUpperCase();

  const line1 =
    tx.description ??
    metaDesc ??
    (type === "TOPUP" || type === "DEPOSIT"
      ? "Wallet Top-up"
      : type === "ESCROW_HOLD"
        ? "Funds locked for job shift"
        : type === "ESCROW_RELEASE" || type === "JOB_PAYMENT"
          ? "Funds released for job"
          : type === "REFUND"
            ? "Refund processed"
            : type === "WITHDRAWAL"
              ? "Withdrawal"
              : "—");

  const line2 = jobId ? `Job ref: ${jobId.slice(0, 8)}…` : undefined;
  return { line1, line2 };
}

export function getCategory(tx: WalletTransaction): {
  label: string;
  color: string;
} {
  const type = tx.type?.toUpperCase();
  if (type === "TOPUP" || type === "DEPOSIT")
    return { label: "Top-up", color: "green" };
  if (type === "ESCROW_HOLD") return { label: "Job Lock", color: "blue" };
  if (type === "ESCROW_RELEASE" || type === "JOB_PAYMENT")
    return { label: "Job Payment", color: "orange" };
  if (type === "REFUND") return { label: "Refund", color: "green" };
  if (type === "WITHDRAWAL") return { label: "Withdrawal", color: "gray" };
  return { label: tx.type ?? "—", color: "gray" };
}

export function getReference(tx: WalletTransaction): string {
  const jobId = tx.metadata?.job_id as string | undefined;
  if (jobId) return `Job Id: ${jobId.slice(0, 8)}`;
  if (tx.reference_group_id) return `${tx.reference_group_id.slice(0, 12)}…`;
  if (tx.job_payment_id) return `Pay: ${tx.job_payment_id.slice(0, 8)}`;
  return "—";
}

export function getFormattedAmount(tx: WalletTransaction): string {
  if (tx.amount == null) return "—";
  const amountInCents = Number(tx.amount);
  if (Number.isNaN(amountInCents)) return "—";
  return `$${(amountInCents / 100).toLocaleString("en-CA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function getHoldContextFromIdempotencyKey(idempotencyKey?: string): {
  label: string;
  referenceId?: string;
} | null {
  if (!idempotencyKey) return null;

  const interviewHoldPrefix = "interview-request-hold-";
  if (idempotencyKey.startsWith(interviewHoldPrefix)) {
    const referenceId = idempotencyKey.slice(interviewHoldPrefix.length);
    return {
      label: "Hold for Interview",
      referenceId: referenceId || undefined,
    };
  }

  const jobFundingHoldPrefix = "job-funding-hold-";
  if (idempotencyKey.startsWith(jobFundingHoldPrefix)) {
    const referenceId = idempotencyKey.slice(jobFundingHoldPrefix.length);
    return {
      label: "Hold for Job Funding",
      referenceId: referenceId || undefined,
    };
  }

  const recruiterReleasePrefix = "job-shift-recruiter-release-";
  if (idempotencyKey.startsWith(recruiterReleasePrefix)) {
    const referenceId = idempotencyKey.slice(recruiterReleasePrefix.length);
    return {
      label: "Release for Job Shift",
      referenceId: referenceId || undefined,
    };
  }

  return null;
}

export function getJobType(tx: WalletTransaction): string | null {
  return tx.type === "ESCROW_HOLD" ||
    tx.type === "ESCROW_RELEASE" ||
    tx.type === "JOB_PAYMENT"
    ? "Regular"
    : null;
}

export function getPageNumbers(
  currentPage: number,
  totalPages: number,
): (number | "...")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pageList: (number | "...")[] = [1, 2, 3];
  if (currentPage > 4) pageList.push("...");
  if (currentPage > 3 && currentPage < totalPages - 2) pageList.push(currentPage);
  if (currentPage < totalPages - 3) pageList.push("...");
  pageList.push(totalPages - 1, totalPages);
  return [...new Set(pageList)];
}
