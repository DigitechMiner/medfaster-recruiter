// app/wallet/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import WalletBalanceCard from '@/components/wallet/WalletBalancedCard';
import TransactionItem from '@/components/wallet/TransactionItem';
import {
  getWallet,
  getWalletTransactions,
  WalletData,
  WalletTransaction,
} from '@/stores/api/recruiter-wallet-api';
import { Navbar } from '@/components/global/navbar';

export default function WalletPage() {
  const router = useRouter();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const [walletData, txData] = await Promise.all([
          getWallet(),
          getWalletTransactions({ page: 1, limit: 5 }),
        ]);
        setWallet(walletData);
        setTransactions(txData.items);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load wallet');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const balanceCAD = wallet ? Number(wallet.available_balance) / 100 : 0;

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div
          className="flex items-center justify-center bg-gray-50"
          style={{ height: "calc(100vh - 56px)" }}
        >
          <div className="bg-white rounded-2xl p-8 animate-pulse w-full max-w-md mx-4">
            <div className="h-10 bg-gray-200 rounded w-48 mx-auto mb-3" />
            <div className="h-5 bg-gray-100 rounded w-32 mx-auto" />
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div
          className="flex items-center justify-center p-4 bg-gray-50"
          style={{ height: "calc(100vh - 56px)" }}
        >
          <div className="bg-white rounded-2xl p-6 shadow text-center max-w-sm">
            <p className="font-semibold text-gray-800">Failed to load</p>
            <p className="text-sm text-gray-500 mt-1">{error}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div
        className="bg-gray-50 overflow-y-auto"
        style={{ height: "calc(100vh - 56px)" }}
      >
        <div className="max-w-md mx-auto px-4 py-6 space-y-6">
          {/* Balance Card */}
          <WalletBalanceCard
            balanceCAD={balanceCAD}
            isLocked={!wallet?.is_active}
            onWithdraw={() => router.push('/wallet/topup')}
          />

          {/* Transactions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-gray-900">Transactions</h2>
              <button
                onClick={() => router.push('/wallet/transactions')}
                className="text-sm font-medium text-orange-500"
              >
                View All
              </button>
            </div>

            {transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">No transactions yet</div>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <TransactionItem key={tx.id} transaction={tx} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}