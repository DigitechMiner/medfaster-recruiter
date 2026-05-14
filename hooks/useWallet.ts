// src/hooks/useWallet.ts — replace useWallet entirely

import { useEffect } from "react";
import { useWalletStore } from "@/stores/walletStore";
import { useAuthStore } from "@/stores/authStore";

export function useWallet() {
  const wallet = useWalletStore((s) => s.wallet);
  const isLoading = useWalletStore((s) => s.isLoading);
  const refresh = useWalletStore((s) => s.refreshWallet);
  const ensureWalletLoaded = useWalletStore((s) => s.ensureWalletLoaded);
  const recruiterProfile = useAuthStore((s) => s.recruiterProfile);

  useEffect(() => {
    if (!recruiterProfile) return;
    ensureWalletLoaded();
  }, [recruiterProfile, ensureWalletLoaded]);

  const balanceCAD = wallet ? Number(wallet.available_balance) / 100 : 0;

  return { wallet, balanceCAD, isLoading, refetch: refresh };
}
