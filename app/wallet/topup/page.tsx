"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getWalletTopups,
  initiateWalletTopup,
  type WalletTopup,
  type WalletTopupInitResponse,
} from "@/features/wallet";
import { AppLayout } from "@/components/global/app-layout";
import { useWalletStore } from "@/stores/walletStore";
import { AmountPicker } from "./components/amount-picker";
import { TopupTable } from "./components/table";
import { TopupSuccessDialog } from "./components/topup-success-dialog";

const getCheckoutUrl = (response: WalletTopupInitResponse) =>
  response.checkout_url ?? response.checkoutUrl ?? null;

const buildTopupRedirectUrls = (amount: number) => {
  const origin = window.location.origin;
  const encodedAmount = encodeURIComponent(String(amount));

  return {
    successUrl: `${origin}/wallet/topup?topup_success=true&amount=${encodedAmount}&session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${origin}/wallet/topup?error=payment_cancelled`,
  };
};

async function redirectToStripeCheckout(response: WalletTopupInitResponse) {
  const checkoutUrl = getCheckoutUrl(response);

  if (checkoutUrl) {
    window.location.assign(checkoutUrl);
    return true;
  }

  throw new Error("Payment checkout is not available yet. Please try again later.");
}

// ── Orchestrator ──────────────────────────────────────────────────────────────
function TopupPageContent() {
  const router = useRouter();
  const params = useSearchParams();
  const wallet = useWalletStore((s) => s.wallet);

  const [isProceedLoading, setIsProceedLoading] = useState(false);
  const [topups, setTopups] = useState<WalletTopup[]>([]);
  const [totalTopups, setTotalTopups] = useState(0);
  const [topupsLoading, setTopupsLoading] = useState(true);
  const [topupsError, setTopupsError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [topupsReloadKey, setTopupsReloadKey] = useState(0);
  const [showTopupSuccess, setShowTopupSuccess] = useState(false);
  const [isRefreshingWallet, setIsRefreshingWallet] = useState(false);

  const topupSuccess = params.get("topup_success") === "true";
  const redirectStatus = params.get("redirect_status");
  const paymentFailed = topupSuccess && redirectStatus !== null && redirectStatus !== "succeeded";
  const successAmount = params.get("amount") ?? "0";
  const newBalance = wallet
    ? `$ ${(Number(wallet.available_balance) / 100).toLocaleString("en-CA")}`
    : null;

  useEffect(() => {
    if (!topupSuccess) {
      setShowTopupSuccess(false);
      return;
    }

    if (paymentFailed) {
      router.replace("/wallet/topup?error=payment_failed");
      return;
    }

    setShowTopupSuccess(true);
  }, [paymentFailed, router, topupSuccess]);

  useEffect(() => {
    let cancelled = false;

    async function loadTopups() {
      try {
        setTopupsLoading(true);
        setTopupsError(null);

        const res = await getWalletTopups({
          page,
          limit: perPage,
        });

        if (!cancelled) {
          setTopups(res.items ?? []);
          setTotalTopups(res.total ?? res.items?.length ?? 0);
        }
      } catch (e) {
        if (!cancelled) {
          setTopups([]);
          setTotalTopups(0);
          setTopupsError(
            e instanceof Error ? e.message : "Failed to load top-up history",
          );
        }
      } finally {
        if (!cancelled) {
          setTopupsLoading(false);
        }
      }
    }

    loadTopups();

    return () => {
      cancelled = true;
    };
  }, [page, perPage, topupsReloadKey]);

  useEffect(() => {
    if (!showTopupSuccess) return;

    const previousBalance = useWalletStore.getState().wallet?.available_balance;
    let attempts = 0;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    const pollWallet = async () => {
      await useWalletStore.getState().refreshWallet();
      if (cancelled) return;

      const currentBalance = useWalletStore.getState().wallet?.available_balance;

      if (currentBalance !== previousBalance || attempts >= 8) {
        setIsRefreshingWallet(false);
        setTopupsReloadKey((key) => key + 1);
        return;
      }

      attempts += 1;
      timeoutId = setTimeout(pollWallet, 1500);
    };

    setIsRefreshingWallet(true);
    timeoutId = setTimeout(pollWallet, 1500);

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [showTopupSuccess]);

  const handleProceed = async (amount: number) => {
    setIsProceedLoading(true);
    let didStartRedirect = false;

    try {
      const response = await initiateWalletTopup(
        amount,
        undefined,
        buildTopupRedirectUrls(amount),
      );

      didStartRedirect = await redirectToStripeCheckout(response);
    } catch (e) {
      // re-throw so AmountPicker can catch and show the error message
      throw e;
    } finally {
      if (!didStartRedirect) {
        setIsProceedLoading(false);
      }
    }
  };

  const handleSuccessClose = () => {
    setShowTopupSuccess(false);
    router.replace("/wallet/topup", { scroll: false });
  };

  const handleViewWallet = () => {
    setShowTopupSuccess(false);
    router.replace("/wallet");
  };

  return (
    <AppLayout padding="none">
      <div className="flex flex-col gap-4 p-3 sm:p-4 md:p-5 xl:p-6 mx-auto w-full max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold leading-8 text-gray-900">
            Wallet Topup
          </h1>
          <button
            type="button"
            onClick={() => router.push("/wallet")}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900"
          >
            Back to Wallet
          </button>
        </div>

        <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <AmountPicker
            isLoading={isProceedLoading}
            onProceed={handleProceed}
          />
        </div>

        <TopupTable
          topups={topups}
          totalTopups={totalTopups}
          isLoading={topupsLoading}
          error={topupsError}
          page={page}
          perPage={perPage}
          onPageChange={setPage}
          onPerPageChange={(nextPerPage) => {
            setPerPage(nextPerPage);
            setPage(1);
          }}
        />
      </div>
      <TopupSuccessDialog
        open={showTopupSuccess}
        amount={successAmount}
        isRefreshing={isRefreshingWallet}
        newBalance={newBalance}
        onClose={handleSuccessClose}
        onViewWallet={handleViewWallet}
      />
    </AppLayout>
  );
}

// Wrap in Suspense — useSearchParams() requires it in Next.js App Router
export default function TopupPage() {
  return (
    <Suspense
      fallback={
        <AppLayout padding="none">
          <div className="flex flex-col p-3 sm:p-4 md:p-5 xl:p-6 mx-auto w-full min-h-[50vh] items-center justify-center">
            <p className="text-gray-400 text-sm animate-pulse">Loading...</p>
          </div>
        </AppLayout>
      }
    >
      <TopupPageContent />
    </Suspense>
  );
}
