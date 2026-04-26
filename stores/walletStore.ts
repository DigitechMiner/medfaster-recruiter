// @/stores/walletStore.ts
import { create } from 'zustand';
import { getWallet, WalletData } from '@/stores/api/recruiter-wallet-api';

interface WalletStore {
  wallet: WalletData | null;
  isLoading: boolean;
  fetchWallet: () => Promise<void>;
  refreshWallet: () => Promise<void>;
}

export const useWalletStore = create<WalletStore>((set, get) => ({
  wallet: null,
  isLoading: false,

  // Cached — skips if wallet already loaded
  fetchWallet: async () => {
    if (get().wallet) return;
    return get().refreshWallet();
  },

  // Force fetch — always hits API
  refreshWallet: async () => {
    set({ isLoading: true });
    try {
      const data = await getWallet();
      set({ wallet: data, isLoading: false });
    } catch (e) {
      console.error('Failed to fetch wallet:', e);
      set({ isLoading: false });
    }
  },
}));

export function fmtBalance(cents: string | number | null): string {
  if (cents === null || cents === undefined) return '$ 0';
  return `$ ${(Number(cents) / 100).toLocaleString('en-CA', { minimumFractionDigits: 0 })}`;
}