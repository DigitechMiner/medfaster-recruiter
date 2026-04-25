"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { AppLayout } from "@/components/global/app-layout";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// ── Inner form (needs Elements context) ──────────────────────────────────────
function TopupForm({ amount, topupId }: { amount: string; topupId: string }) {
  const stripe   = useStripe();
  const elements = useElements();
  const router   = useRouter();

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError]               = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!stripe || !elements) return;
    setIsProcessing(true);
    setError(null);

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/wallet/topup/success?topup_id=${topupId}&amount=${amount}`,
      },
    });

    if (stripeError) {
      setError(stripeError.message ?? "Payment failed");
      setIsProcessing(false);
    }
    // If no error, Stripe redirects to return_url automatically
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8 max-w-md w-full mx-auto mt-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Top Up Wallet</h2>
      <p className="text-sm text-gray-500 mb-6">
        You are adding <span className="font-semibold text-gray-800">${amount}</span> to your wallet.
      </p>

      {/* Stripe Payment Element */}
      <div className="mb-6">
        <PaymentElement
  onLoadError={(event) => {
    console.error("PaymentElement load error:", event.error);
    // Redirect back to topup page so a fresh PI is created
    router.replace('/wallet/topup?error=payment_load_failed');
  }}
/>
      </div>

      {error && (
        <p className="text-sm text-red-500 mb-4">{error}</p>
      )}

      <button
        onClick={handleConfirm}
        disabled={isProcessing || !stripe}
        className="w-full bg-[#F4781B] hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-semibold py-3 rounded-xl transition-colors"
      >
        {isProcessing ? "Processing..." : `Pay $${amount}`}
      </button>

      <button
        onClick={() => router.back()}
        className="w-full mt-3 text-sm text-gray-400 hover:text-gray-600 transition-colors"
      >
        Cancel
      </button>
    </div>
  );
}

// ── Page wrapper ──────────────────────────────────────────────────────────────
function TopupConfirmContent() {
  const params  = useSearchParams();
  const secret  = params.get("secret");
  const topupId = params.get("topup_id");
  const amount  = params.get("amount") ?? "0";

  if (!secret || !topupId) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-gray-400 text-sm">Invalid top-up link.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="py-6 px-4">
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret: secret,
            appearance: {
              theme: "stripe",
              variables: { colorPrimary: "#F4781B" },
            },
          }}
        >
          <TopupForm amount={amount} topupId={topupId} />
        </Elements>
      </div>
    </AppLayout>
  );
}

export default function TopupConfirmPage() {
  return (
    <Suspense fallback={<AppLayout><div className="flex items-center justify-center min-h-[400px]"><p>Loading...</p></div></AppLayout>}>
      <TopupConfirmContent />
    </Suspense>
  );
}