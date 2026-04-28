// success/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AppLayout } from "@/components/global/app-layout";
import { CheckCircle } from "lucide-react";
import { useWalletStore } from "@/stores/walletStore";

// ✅ REPLACE the entire SuccessContent with this:

function SuccessContent() {
  const params        = useSearchParams();
  const router        = useRouter();
  const amount        = params.get("amount")        ?? "0";
  const redirectStatus = params.get("redirect_status"); // Stripe adds this
  const wallet        = useWalletStore((s) => s.wallet);

  const [isRefreshing, setIsRefreshing] = useState(true);

  // ✅ Check Stripe's redirect_status — if not succeeded, show error
  const paymentFailed = redirectStatus && redirectStatus !== "succeeded";

  useEffect(() => {
  const store = useWalletStore.getState();
  const previousBalance = store.wallet?.available_balance;

  let attempts = 0;

  const poll = async () => {
    await store.refreshWallet();  // ✅ updates walletStore → Navbar picks it up

    const currentBalance = useWalletStore.getState().wallet?.available_balance;

    if (currentBalance !== previousBalance || attempts >= 8) {
      setIsRefreshing(false);  // ✅ unlocks the "View Wallet" button
      return;
    }

    attempts++;
    setTimeout(poll, 1500);  // retry every 1.5s max 8 times
  };

  setTimeout(poll, 1500);  // initial delay — give webhook time to fire
}, []); // eslint-disable-line

  const newBalance = wallet
    ? `CA$ ${(Number(wallet.available_balance) / 100).toLocaleString("en-CA")}`
    : null;

  const pendingJob = typeof window !== "undefined"
    ? sessionStorage.getItem("pending_job_payload")
    : null;

  // ✅ Payment failed state
  if (paymentFailed) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 max-w-sm w-full text-center">
            <p className="text-lg font-semibold text-red-600 mb-2">Payment Failed</p>
            <p className="text-sm text-gray-500 mb-6">Your payment was not completed.</p>
            <button
              onClick={() => router.push("/wallet/topup")}
              className="w-full bg-[#F4781B] text-white text-sm font-semibold py-3 rounded-xl"
            >
              Try Again
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 max-w-sm w-full text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Payment Successful</h2>
          <p className="text-sm text-gray-500 mb-2">
            <span className="font-semibold text-gray-800">CA$ {amount}</span> has been added.
          </p>

          <p className="text-xs text-gray-400 mb-6">
            {isRefreshing
              ? <span className="animate-pulse">Confirming with bank...</span>
              : newBalance
                ? <>New balance: <span className="font-semibold text-gray-700">{newBalance}</span></>
                : "Balance updated"
            }
          </p>

          {/* ✅ Never permanently disabled — isRefreshing clears after 12s max */}
          {pendingJob ? (
            <button
              onClick={() => router.push("/jobs/payment-complete")}
              disabled={isRefreshing}
              className="w-full bg-[#F4781B] hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-semibold py-3 rounded-xl transition-colors"
            >
              {isRefreshing ? "Confirming..." : "Continue — Post Job"}
            </button>
          ) : (
            <button
              onClick={() => router.push("/wallet")}
              disabled={isRefreshing}
              className="w-full bg-[#F4781B] hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-semibold py-3 rounded-xl transition-colors"
            >
              {isRefreshing ? "Confirming..." : "View Wallet"}
            </button>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

export default function TopupSuccessPage() {
  return (
    <Suspense fallback={<AppLayout><div className="flex items-center justify-center min-h-[400px]"><p>Loading...</p></div></AppLayout>}>
      <SuccessContent />
    </Suspense>
  );
}