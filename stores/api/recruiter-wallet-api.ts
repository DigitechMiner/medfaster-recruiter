import { axiosInstance } from './api-client';
import { ENDPOINTS } from './api-endpoints';

export interface WalletData {
  id: string;
  user_id: string;
  platform: 'RECRUITER';
  currency: 'CAD';
  is_active: boolean;
  wallet_lock_reason: string | null;
  available_balance: string;
  held_balance: string;
  pending_balance: string;
  balance_version: number;
  created_at: string;
  updated_at: string;
}

export interface WalletTopupInitResponse {
  client_secret: string;
  topup_id: string;
  idempotency_key: string;
  amount: number;
  currency: 'CAD';
  stripe_payment_intent_id: string;
}

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  type: string;
  amount: string;
  description?: string;
  reference?: string;
  transaction_id?: string;
  category?: string;
  job_id?: string;
  job_type?: string;
  status?: string;
  created_at: string;
  updated_at: string;
}

export interface WalletTopup {
  id: string;
  wallet_id: string;
  amount: number;
  currency: 'CAD';
  status: string;
  stripe_payment_intent_id: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedItems<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  offset: number;
}

const extractData = <T>(payload: unknown): T => (payload as { data: T }).data;

export async function getWallet(): Promise<WalletData> {
  const res = await axiosInstance.get(ENDPOINTS.WALLET);
  return extractData<WalletData>(res.data);
}

export async function initiateWalletTopup(
  amount: number,
  idempotencyKey?: string
): Promise<WalletTopupInitResponse> {
  const res = await axiosInstance.post(
    ENDPOINTS.WALLET_PAY,
    { amount },
    idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : undefined
  );
  return extractData<WalletTopupInitResponse>(res.data);
}

export async function getWalletTopups(params?: {
  page?: number;
  limit?: number;
  offset?: number;
}): Promise<PaginatedItems<WalletTopup>> {
  const res = await axiosInstance.get(ENDPOINTS.WALLET_TOPUPS, { params });
  return extractData<PaginatedItems<WalletTopup>>(res.data);
}

export async function getWalletTransactions(params?: {
  page?: number;
  limit?: number;
  offset?: number;
  type?: string;
}): Promise<PaginatedItems<WalletTransaction>> {
  const res = await axiosInstance.get(ENDPOINTS.WALLET_TRANSACTIONS, { params });
  return extractData<PaginatedItems<WalletTransaction>>(res.data);
}
