// components/wallet/wallet-balance.tsx
'use client';

import { useEffect } from 'react';
import { useWalletStore, fmtBalance } from '@/stores/walletStore';

export function WalletBalance() {
  const wallet    = useWalletStore((s) => s.wallet);
  const isLoading = useWalletStore((s) => s.isLoading);

  useEffect(() => {
    // Re-fetch whenever wallet is wiped (null) — catches success page cache clear
    if (wallet === null && !isLoading) {
      useWalletStore.getState().refreshWallet();
    }
  }, [wallet, isLoading]); // ← watch wallet — triggers when set to null

  if (isLoading || !wallet) {
    return <span className="w-16 h-4 bg-gray-100 rounded animate-pulse inline-block" />;
  }

  return (
    <span className="text-sm font-medium text-gray-800">
      {fmtBalance(Number(wallet.available_balance))}
    </span>
  );
}