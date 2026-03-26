import { axiosInstance } from './api-client';
import { ENDPOINTS } from './api-endpoints';

export interface WalletData {
  id: string;
  user_id: string;
  platform: 'RECRUITER';
  currency: 'CAD';
  is_active: boolean;
  wallet_lock_reason: string | null;
  available_balance: string; // cents — divide by 100 for display
  held_balance: string;
  pending_balance: string;
  balance_version: number;
  created_at: string;
  updated_at: string;
}

export interface WalletTopupInitResponse {
  client_secret: string; // confirm via Stripe.js — do NOT charge directly
  topup_id: string;
  idempotency_key: string;
  amount: number;
  currency: 'CAD';
  stripe_payment_intent_id: string;
}

export interface PaginatedItems<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  offset: number;
}

export async function getWallet(): Promise<WalletData> {
  const res = await axiosInstance.get(ENDPOINTS.WALLET);
  return res.data.data;
}

// Returns client_secret — must be confirmed with Stripe.js (not a direct charge)
export async function initiateWalletTopup(
  amount: number,
  idempotencyKey?: string
): Promise<WalletTopupInitResponse> {
  const res = await axiosInstance.post(
    ENDPOINTS.WALLET_PAY,
    { amount },
    idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : undefined
  );
  return res.data.data;
}

export async function getWalletTopups(params?: {
  page?: number;
  limit?: number;
  offset?: number;
}): Promise<PaginatedItems<any>> {
  const res = await axiosInstance.get(ENDPOINTS.WALLET_TOPUPS, { params });
  return res.data.data;
}

export async function getWalletTransactions(params?: {
  page?: number;
  limit?: number;
  offset?: number;
}): Promise<PaginatedItems<any>> {
  const res = await axiosInstance.get(ENDPOINTS.WALLET_TRANSACTIONS, { params });
  return res.data.data;
}
