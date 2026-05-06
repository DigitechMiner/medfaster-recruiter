import { axiosInstance } from './api-client';
import { ENDPOINTS }     from './api-endpoints';
import type { RecruiterWallet } from '@/Interface/recruiter.types';

export type WalletData = RecruiterWallet;

export interface WalletTopupInitResponse {
  client_secret:            string;
  topup_id:                 string;
  idempotency_key:          string;
  amount:                   number;
  currency:                 'CAD';
  stripe_payment_intent_id: string;
}

export interface WalletTopup {
  id:                       string;
  wallet_id:                string;
  amount:                   number;
  currency:                 'CAD';
  status:                   string;
  stripe_payment_intent_id: string;
  created_at:               string;
  updated_at:               string;
}

// Confirmed from live API — optional fields may be absent depending on tx type
export interface WalletTransaction {
  id:                        string;
  wallet_id:                 string;
  type:                      | 'TOPUP' | 'DEPOSIT' | 'ESCROW_HOLD'
                             | 'ESCROW_RELEASE' | 'JOB_PAYMENT'
                             | 'REFUND' | 'WITHDRAWAL' | string;
  direction:                 'HOLD' | 'RELEASE' | 'CREDIT' | 'DEBIT' | 'REFUND' | string;
  amount:                    string;
  currency:                  string;
  status:                    'COMPLETED' | 'PENDING' | 'FAILED' | string;
  description?:              string;
  balance_after?:            string;
  platform?:                 string;
  reference_group_id?:       string;
  idempotency_key?:          string;
  transaction_id?:           string;
  related_transaction_id?:   string | null;
  stripe_payment_intent_id?: string | null;
  stripe_transfer_id?:       string | null;
  job_payment_id?:           string | null;
  withdraw_request_id?:      string | null;
  created_by_webhook?:       boolean;
  // ── Not returned by API — kept optional so pages compile ──────────────────
  created_at?:               string;   // ⚠️ absent from GET /transactions
  updated_at?:               string;   // ⚠️ absent from GET /transactions
  category?:                 string;   // ⚠️ absent — inferred from type
  job_id?:                   string;   // ⚠️ absent top-level — lives in metadata
  job_type?:                 string;   // ⚠️ absent from GET /transactions
  // ── Confirmed metadata shape from live response ────────────────────────────
  metadata?: {
    job_id?:             string;
    job_funding_id?:     string;
    held_amount_cents?:  string;
    description?:        string;
    [key: string]:       unknown;
  };
}

export interface PaginatedItems<T> {
  items:  T[];
  total:  number;
  page:   number;
  limit:  number;
  offset: number;
}

const extractData = <T>(payload: unknown): T =>
  (payload as { data: T }).data;

export async function getWallet(): Promise<WalletData> {
  const res = await axiosInstance.get(ENDPOINTS.WALLET);
  return extractData<WalletData>(res.data);
}

export async function initiateWalletTopup(
  amount: number,
  idempotencyKey?: string,
): Promise<WalletTopupInitResponse> {
  const res = await axiosInstance.post(
    ENDPOINTS.WALLET_PAY,
    { amount },
    idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : undefined,
  );
  return extractData<WalletTopupInitResponse>(res.data);
}

export async function getWalletTopups(params?: {
  page?:   number;
  limit?:  number;
  offset?: number;
}): Promise<PaginatedItems<WalletTopup>> {
  const res = await axiosInstance.get(ENDPOINTS.WALLET_TOPUPS, { params });
  return extractData<PaginatedItems<WalletTopup>>(res.data);
}

// NOTE: Swagger only supports page/limit/offset — no server-side type filter
export async function getWalletTransactions(params?: {
  page?:   number;
  limit?:  number;
  offset?: number;
}): Promise<PaginatedItems<WalletTransaction>> {
  const res = await axiosInstance.get(ENDPOINTS.WALLET_TRANSACTIONS, { params });
  return extractData<PaginatedItems<WalletTransaction>>(res.data);
}