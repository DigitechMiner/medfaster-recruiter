// src/hooks/useWallet.ts — replace useWallet entirely

import { useEffect } from "react";
import { useWalletStore } from "@/stores/walletStore";
import { useAuthStore } from "@/stores/authStore";

export function useWallet() {
  const wallet     = useWalletStore((s) => s.wallet);
  const isLoading  = useWalletStore((s) => s.isLoading);
  const refresh    = useWalletStore((s) => s.refreshWallet);
  const recruiterProfile = useAuthStore((s) => s.recruiterProfile);

  useEffect(() => {
    if (!recruiterProfile) return;
    // Only fetch if not already loaded and profile is authenticated
    if (!wallet && !isLoading) {
      refresh();
    }
  }, [recruiterProfile, wallet, isLoading, refresh]);

  const balanceCAD = wallet ? Number(wallet.available_balance) / 100 : 0;

  return { wallet, balanceCAD, isLoading, refetch: refresh };
}