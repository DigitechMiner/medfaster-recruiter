"use client";

import { useEffect } from "react";
import { useWalletStore, fmtBalance } from "@/stores/walletStore";
import { useAuthStore } from "@/stores/authStore";

export function WalletBalance() {
  const wallet    = useWalletStore((s) => s.wallet);
  const isLoading = useWalletStore((s) => s.isLoading);
  const hasError  = useWalletStore((s) => s.hasError);
  const recruiterProfile = useAuthStore((s) => s.recruiterProfile);

  useEffect(() => {
    // Call wallet API only after profile has been loaded successfully.
    if (!recruiterProfile) return;
    if (wallet === null && !isLoading && !hasError) {
      useWalletStore.getState().refreshWallet();
    }
  }, [recruiterProfile, wallet, isLoading, hasError]);

  if (hasError) {
    return (
      <span
        className="text-sm text-red-500 cursor-pointer hover:underline"
        onClick={() => useWalletStore.setState({ hasError: false })}
        title="Click to retry"
      >
        Retry
      </span>
    );
  }

  if (isLoading || wallet === null) {
    return (
      <span className="w-16 h-4 bg-gray-100 rounded animate-pulse inline-block" />
    );
  }

  return (
    <span className="text-sm font-medium text-gray-800">
      {fmtBalance(Number(wallet.available_balance))}
    </span>
  );
}