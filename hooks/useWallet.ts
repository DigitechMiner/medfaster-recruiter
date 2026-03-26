'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getWallet,
  getWalletTopups,
  getWalletTransactions,
  initiateWalletTopup,
  WalletData,
  PaginatedItems,
} from '@/stores/api/recruiter-wallet-api';

export function useWallet() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    setIsLoading(true);
    getWallet()
      .then(setWallet)
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  // available_balance is in cents as string
  const balanceCAD = wallet ? Number(wallet.available_balance) / 100 : 0;

  return { wallet, balanceCAD, isLoading, error, refetch };
}

export function useWalletTransactions(params?: {
  page?: number;
  limit?: number;
  offset?: number;
}) {
  const [data, setData] = useState<PaginatedItems<any> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    getWalletTransactions(params)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [params?.page, params?.limit]);

  return { data, isLoading, error };
}

export function useWalletTopups(params?: {
  page?: number;
  limit?: number;
  offset?: number;
}) {
  const [data, setData] = useState<PaginatedItems<any> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    getWalletTopups(params)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [params?.page, params?.limit]);

  return { data, isLoading, error };
}

export function useInitiateTopup() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiate = async (amount: number, idempotencyKey?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      return await initiateWalletTopup(amount, idempotencyKey);
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  return { initiate, isLoading, error };
}
