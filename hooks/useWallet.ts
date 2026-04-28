// src/hooks/useWallet.ts — replace useWallet entirely

import { useEffect } from "react";
import { useWalletStore } from "@/stores/walletStore";

export function useWallet() {
  const wallet     = useWalletStore((s) => s.wallet);
  const isLoading  = useWalletStore((s) => s.isLoading);
  const refresh    = useWalletStore((s) => s.refreshWallet);

  useEffect(() => {
    // Only fetch if not already loaded
    if (!wallet && !isLoading) {
      refresh();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const balanceCAD = wallet ? Number(wallet.available_balance) / 100 : 0;

  return { wallet, balanceCAD, isLoading, refetch: refresh };
}