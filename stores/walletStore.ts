import { create } from 'zustand';
import { getWallet, WalletData } from '@/stores/api/recruiter-wallet-api';

interface WalletStore {
  wallet:         WalletData | null;
  isLoading:      boolean;
  hasError:       boolean;        // ✅ NEW — stops retry loop on 401
  refreshWallet:  () => Promise<void>;
  clearWallet:    () => void;     // ✅ NEW — call this on logout
}

export const useWalletStore = create<WalletStore>((set) => ({
  wallet:    null,
  isLoading: false,
  hasError:  false,

  refreshWallet: async () => {
    set({ isLoading: true, hasError: false });
    try {
      const wallet = await getWallet();
      set({ wallet, isLoading: false, hasError: false });
    } catch {
      set({ isLoading: false, hasError: true });  // ✅ hasError=true stops the loop
    }
  },

  clearWallet: () => set({ wallet: null, isLoading: false, hasError: false }),
}));

export const fmtBalance = (cents: number) =>
  `$ ${(cents / 100).toLocaleString('en-CA', { minimumFractionDigits: 0 })}`;