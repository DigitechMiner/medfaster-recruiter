// ── Wallet, top-up, transactions ────────────────────────────────────────────

export interface RecruiterWallet {
  id: string;
  user_id: string;
  platform: "RECRUITER";
  currency: string;
  is_active: boolean;
  wallet_lock_reason: string | null;
  available_balance: string;
  held_balance: string;
  pending_balance: string;
  balance_version: number;
  created_at: string;
  updated_at: string;
}

export type WalletData = RecruiterWallet;

export interface WalletTopupInitResponse {
  checkout_url?: string;
  checkoutUrl?: string;
  client_secret?: string;
  topup_id?: string;
  idempotency_key?: string;
  amount?: number;
  currency?: "CAD";
  stripe_payment_intent_id?: string;
}

export interface WalletTopup {
  id: string;
  wallet_id?: string;
  amount?: number | string;
  amount_cents?: number | string;
  currency?: string;
  status?: "COMPLETED" | "PENDING" | "FAILED" | "SUCCESS" | string;
  stripe_payment_intent_id?: string | null;
  stripe_checkout_session_id?: string | null;
  idempotency_key?: string | null;
  created_at?: string;
  updated_at?: string;
  metadata?: {
    stripe?: {
      fee?: number | string | null;
      net?: number | string | null;
      tax_amount?: number | string | null;
      payment_method_types?: string[];
    };
    [key: string]: unknown;
  };
}

// Confirmed from live API — optional fields may be absent depending on tx type
export interface WalletTransaction {
  id: string;
  wallet_id: string;
  type:
    | "TOPUP"
    | "DEPOSIT"
    | "ESCROW_HOLD"
    | "ESCROW_RELEASE"
    | "JOB_PAYMENT"
    | "REFUND"
    | "WITHDRAWAL"
    | string;
  direction: "HOLD" | "RELEASE" | "CREDIT" | "DEBIT" | "REFUND" | string;
  amount: string;
  currency: string;
  status: "COMPLETED" | "PENDING" | "FAILED" | string;
  description?: string;
  balance_after?: string;
  platform?: string;
  reference_group_id?: string;
  idempotency_key?: string;
  transaction_id?: string;
  related_transaction_id?: string | null;
  stripe_payment_intent_id?: string | null;
  stripe_transfer_id?: string | null;
  job_payment_id?: string | null;
  withdraw_request_id?: string | null;
  created_by_webhook?: boolean;
  // ── Not returned by API — kept optional so pages compile ──────────────────
  created_at?: string; // ⚠️ absent from GET /transactions
  updated_at?: string; // ⚠️ absent from GET /transactions
  category?: string; // ⚠️ absent — inferred from type
  job_id?: string; // ⚠️ absent top-level — lives in metadata
  job_type?: string; // ⚠️ absent from GET /transactions
  // ── Confirmed metadata shape from live response ────────────────────────────
  metadata?: {
    job_id?: string;
    job_funding_id?: string;
    held_amount_cents?: string;
    description?: string;
    [key: string]: unknown;
  };
}

export interface PaginatedItems<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  offset: number;
}
