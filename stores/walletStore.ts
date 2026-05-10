import { create } from 'zustand';
import { getWallet, WalletData } from '@/features/wallet';

let refreshWalletPromise: Promise<void> | null = null;

interface WalletStore {
  wallet:         WalletData | null;
  isLoading:      boolean;
  hasError:       boolean;        // ✅ NEW — stops retry loop on 401
  refreshWallet:  () => Promise<void>;
  ensureWalletLoaded: () => Promise<void>;
  clearWallet:    () => void;     // ✅ NEW — call this on logout
}

export const useWalletStore = create<WalletStore>((set, get) => ({
  wallet:    null,
  isLoading: false,
  hasError:  false,

  refreshWallet: async () => {
    // Deduplicate concurrent refreshes triggered by multiple components/effects.
    if (refreshWalletPromise) return refreshWalletPromise;

    refreshWalletPromise = (async () => {
      set({ isLoading: true, hasError: false });
      try {
        const wallet = await getWallet();
        set({ wallet, isLoading: false, hasError: false });
      } catch {
        set({ isLoading: false, hasError: true });  // ✅ hasError=true stops the loop
      } finally {
        refreshWalletPromise = null;
      }
    })();

    return refreshWalletPromise;
  },

  ensureWalletLoaded: async () => {
    const { wallet, isLoading, hasError, refreshWallet } = get();
    if (wallet || isLoading || hasError) return;
    await refreshWallet();
  },

  clearWallet: () => set({ wallet: null, isLoading: false, hasError: false }),
}));

export const fmtBalance = (cents: number) =>
  `$ ${(cents / 100).toLocaleString('en-CA', { minimumFractionDigits: 0 })}`;