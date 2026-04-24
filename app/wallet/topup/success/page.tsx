// success/page.tsx
"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AppLayout } from "@/components/global/app-layout";
import { CheckCircle } from "lucide-react";
import { useWalletStore } from "@/stores/walletStore";

function SuccessContent() {
  const params  = useSearchParams();
  const router  = useRouter();
  const amount  = params.get("amount") ?? "0";
  const wallet  = useWalletStore((s) => s.wallet);

  useEffect(() => {
    // Wipe cache → triggers WalletBalance's useEffect → it calls refreshWallet()
    // Both Navbar and this page re-render with fresh balance automatically
    useWalletStore.setState({ wallet: null });
  }, []);

  const newBalance = wallet
    ? `CA$ ${(Number(wallet.available_balance) / 100).toLocaleString('en-CA')}`
    : null;

  const pendingJob = typeof window !== "undefined"
    ? sessionStorage.getItem("pending_job_payload")
    : null;

  return (
    <AppLayout>
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 max-w-sm w-full text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Payment Successful</h2>
          <p className="text-sm text-gray-500 mb-2">
            <span className="font-semibold text-gray-800">CA$ {amount}</span> has been added to your wallet.
          </p>

          {/* Shows updated balance once refreshWallet() resolves */}
          <p className="text-xs text-gray-400 mb-6">
            {newBalance
              ? <>New balance: <span className="font-semibold text-gray-700">{newBalance}</span></>
              : <span className="animate-pulse">Updating balance...</span>
            }
          </p>

          {pendingJob ? (
            <button
              onClick={() => router.push("/jobs/payment-complete")}
              className="w-full bg-[#F4781B] hover:bg-orange-600 text-white text-sm font-semibold py-3 rounded-xl transition-colors"
            >
              Continue — Post Job
            </button>
          ) : (
            <button
              onClick={() => router.push("/wallet")}
              disabled={!newBalance}
              className="w-full bg-[#F4781B] hover:bg-orange-600 disabled:opacity-40 text-white text-sm font-semibold py-3 rounded-xl transition-colors"
            >
              {newBalance ? "View Wallet" : "Updating..."}
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