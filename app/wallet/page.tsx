'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import WalletBalanceCard from '@/components/wallet/WalletBalancedCard';
import TransactionItem from '@/components/wallet/TransactionItem';
import {
  getWallet,
  getWalletTransactions,
  WalletData,
  WalletTransaction,
} from '@/stores/api/recruiter-wallet-api';

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="relative px-4 py-4 flex items-center">
          <button onClick={() => router.back()} className="p-1">
            <ArrowLeft size={22} className="text-gray-800" />
          </button>
          <div className="flex-1 flex justify-center">
            <h1 className="text-lg font-semibold text-gray-900">Wallet</h1>
          </div>
          <div className="w-8" />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Balance Card */}
        {isLoading ? (
          <div className="bg-white rounded-2xl p-8 animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-48 mx-auto mb-3" />
            <div className="h-5 bg-gray-100 rounded w-32 mx-auto" />
          </div>
        ) : (
          <WalletBalanceCard
            balanceCAD={balanceCAD}
            isLocked={!wallet?.is_active}
            onWithdraw={() => router.push('/wallet/topup')}
          />
        )}

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

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-48" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8 text-gray-400 text-sm">{error}</div>
          ) : transactions.length === 0 ? (
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
  );
}
