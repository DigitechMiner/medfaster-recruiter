// stores/walletStore.ts — make sure refreshWallet exists and updates state:

import { create } from 'zustand';
import { getWallet, WalletData } from '@/stores/api/recruiter-wallet-api';

interface WalletStore {
  wallet:         WalletData | null;
  isLoading:      boolean;
  refreshWallet:  () => Promise<void>;
}

export const useWalletStore = create<WalletStore>((set) => ({
  wallet:    null,
  isLoading: false,

  refreshWallet: async () => {
    set({ isLoading: true });
    try {
      const wallet = await getWallet();
      set({ wallet, isLoading: false });  // ✅ Updates state → Navbar re-renders
    } catch {
      set({ isLoading: false });
    }
  },
}));

export const fmtBalance = (cents: number) =>
  `CA$ ${(cents / 100).toLocaleString('en-CA', { minimumFractionDigits: 0 })}`;