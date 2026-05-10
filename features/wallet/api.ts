import { axiosInstance } from "@/stores/api/api-client";
import { ENDPOINTS } from "@/stores/api/api-endpoints";
import { extractData } from "@/stores/api/response-helpers";

import type {
  PaginatedItems,
  WalletData,
  WalletTopupInitResponse,
  WalletTransaction,
} from "./types";

// ============================================================================
// API FUNCTIONS
// ============================================================================

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
    idempotencyKey
      ? { headers: { "Idempotency-Key": idempotencyKey } }
      : undefined,
  );
  return extractData<WalletTopupInitResponse>(res.data);
}

// NOTE: Swagger only supports page/limit/offset — no server-side type filter
export async function getWalletTransactions(params?: {
  page?: number;
  limit?: number;
  offset?: number;
  type?: "credit" | "hold" | "release" | "bonus" | "refund";
}): Promise<PaginatedItems<WalletTransaction>> {
  const res = await axiosInstance.get(ENDPOINTS.WALLET_TRANSACTIONS, {
    params,
  });
  return extractData<PaginatedItems<WalletTransaction>>(res.data);
}

export async function getWalletTransactionById(
  id: string,
): Promise<WalletTransaction> {
  const res = await axiosInstance.get(ENDPOINTS.WALLET_TRANSACTION_DETAIL(id));
  return extractData<WalletTransaction>(res.data);
}
