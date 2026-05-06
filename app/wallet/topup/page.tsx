'use client';

import { useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams }             from 'next/navigation';
import { loadStripe }                             from '@stripe/stripe-js';
import {
  Elements, PaymentElement,
  useStripe, useElements,
} from '@stripe/react-stripe-js';
import { initiateWalletTopup }                     from '@/stores/api/recruiter-wallet-api';
import { useWallet }                               from '@/hooks/useWallet';
import { Minus, Plus, Wallet, AlertCircle }        from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
const QUICK_AMOUNTS = [100, 500, 1000, 2500, 5000, 10000];

// ── Step 1: Amount picker ─────────────────────────────────────────────────────
function AmountPicker({
  availableBalance,
  isLoading,
  onProceed,
}: {
  availableBalance: number | null;
  isLoading:        boolean;
  onProceed:        (amount: number) => Promise<void>;
}) {
  const router    = useRouter();
  const inputRef  = useRef<HTMLInputElement>(null);
  const params    = useSearchParams();
  const loadError = params.get('error');

  const [amount, setAmount] = useState('');
  const [error,  setError]  = useState<string | null>(null);

  const numericAmount = parseFloat(amount) || 0;

  const handleInput = (val: string) => {
    const cleaned = val.replace(/[^0-9.]/g, '');
    const parts   = cleaned.split('.');
    if (parts.length > 2) return;
    if (parts[1]?.length > 2) return;
    setAmount(cleaned);
    setError(null);
  };

  const increment = (by: number) => {
    setAmount(String(Math.max(0, numericAmount + by)));
    setError(null);
  };

  const handleSubmit = async () => {
    if (!numericAmount || numericAmount < 1) {
      setError('Minimum amount is $ 1');
      return;
    }
    try {
      setError(null);
      await onProceed(numericAmount);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to initiate topup');
    }
  };

  const displayAmount = numericAmount > 0
    ? `$ ${numericAmount.toLocaleString('en-CA', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
    : '$ 0';

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-1">
          <Wallet className="w-5 h-5 text-[#F4781B]" />
          <h1 className="text-[16px] font-bold text-gray-900">Recharge Wallet</h1>
        </div>
        {availableBalance !== null && (
          <p className="text-[13px] text-gray-400">
            Current balance:{' '}
            <span className="font-semibold text-gray-700">
              $ {availableBalance.toLocaleString('en-CA')}
            </span>
          </p>
        )}
      </div>

      <div className="px-6 py-6 space-y-6 flex-1">
        {loadError === 'payment_load_failed' && (
          <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 text-[13px] rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Your payment session expired. Please try again.</span>
          </div>
        )}

        {/* Large display */}
        <div className="text-center">
          <p className="text-[13px] text-gray-400 mb-2">Enter amount to add</p>
          <p className={`text-[40px] font-bold tracking-tight transition-colors ${
            numericAmount > 0 ? 'text-[#F4781B]' : 'text-gray-300'
          }`}>
            {displayAmount}
          </p>
        </div>

        {/* Input +/- */}
        <div>
          <label className="text-[12px] font-medium text-gray-500 mb-1.5 block">
            Amount (CAD)
          </label>
          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#F4781B] focus-within:ring-1 focus-within:ring-[#F4781B]/20 transition-all">
            <button
              type="button"
              onClick={() => increment(-100)}
              disabled={numericAmount <= 0}
              className="flex items-center justify-center w-11 h-11 bg-gray-50 hover:bg-gray-100 disabled:opacity-30 transition-colors flex-shrink-0 border-r border-gray-200"
            >
              <Minus className="w-4 h-4 text-gray-500" />
            </button>
            <div className="flex-1 flex items-center px-3">
              <span className="text-gray-400 text-[15px] mr-1">$</span>
              <input
                ref={inputRef}
                type="text"
                inputMode="decimal"
                placeholder="0"
                value={amount}
                onChange={(e) => handleInput(e.target.value)}
                className="flex-1 py-2.5 text-[15px] font-semibold text-gray-900 bg-transparent outline-none placeholder:text-gray-300 text-center"
              />
            </div>
            <button
              type="button"
              onClick={() => increment(100)}
              className="flex items-center justify-center w-11 h-11 bg-gray-50 hover:bg-gray-100 transition-colors flex-shrink-0 border-l border-gray-200"
            >
              <Plus className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <p className="text-[11px] text-gray-400 mt-1.5">
            Click +/– to adjust by $100, or type any amount directly
          </p>
        </div>

        {/* Quick select */}
        <div>
          <p className="text-[12px] font-medium text-gray-500 mb-2">Quick select</p>
          <div className="grid grid-cols-3 gap-2">
            {QUICK_AMOUNTS.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => { setAmount(String(val)); setError(null); }}
                className={`py-2 rounded-lg text-[13px] font-semibold border transition-all ${
                  numericAmount === val
                    ? 'bg-[#F4781B] text-white border-[#F4781B]'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-[#F4781B] hover:text-[#F4781B]'
                }`}
              >
                $ {val.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-[13px] text-red-500 text-center">{error}</p>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={isLoading}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-[14px] font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || numericAmount < 1}
            className="flex-1 py-3 rounded-xl bg-[#F4781B] text-white text-[14px] font-semibold hover:bg-[#e06a10] disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
          >
            {isLoading ? 'Processing...' : 'Add Funds'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Step 2: Stripe payment form ───────────────────────────────────────────────
function PaymentForm({
  amount,
  topupId,
  onBack,
}: {
  amount:  number;
  topupId: string;
  onBack:  () => void;
}) {
  const stripe   = useStripe();
  const elements = useElements();

  const [isProcessing, setIsProcessing] = useState(false);
  const [error,        setError]        = useState<string | null>(null);

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
      setError(stripeError.message ?? 'Payment failed');
      setIsProcessing(false);
    }
    // No error → Stripe redirects automatically
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-6 pb-4 border-b border-gray-100">
        <h2 className="text-[16px] font-bold text-gray-900">Payment Details</h2>
        <p className="text-[13px] text-gray-400 mt-0.5">
          Adding{' '}
          <span className="font-semibold text-gray-700">
            $ {amount.toLocaleString('en-CA')}
          </span>{' '}
          to your wallet
        </p>
      </div>

      <div className="px-6 py-6 flex-1 flex flex-col gap-6">
        <PaymentElement
          onLoadError={() => onBack()}
        />

        {error && (
          <p className="text-[13px] text-red-500">{error}</p>
        )}

        <div className="flex gap-3 mt-auto">
          <button
            type="button"
            onClick={onBack}
            disabled={isProcessing}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-[14px] font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isProcessing || !stripe}
            className="flex-1 py-3 rounded-xl bg-[#F4781B] text-white text-[14px] font-semibold hover:bg-[#e06a10] disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
          >
            {isProcessing ? 'Processing...' : `Pay $ ${amount.toLocaleString('en-CA')}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Orchestrator ──────────────────────────────────────────────────────────────
function TopupPageContent() {
  const router = useRouter();
  const { wallet, balanceCAD, isLoading } = useWallet();

  const [step,              setStep]              = useState<'pick' | 'pay'>('pick');
  const [clientSecret,      setClientSecret]      = useState<string | null>(null);
  const [topupId,           setTopupId]           = useState<string | null>(null);
  const [selectedAmount,    setSelectedAmount]    = useState<number>(0);
  const [isProceedLoading,  setIsProceedLoading]  = useState(false); // ← lifted from AmountPicker

  const availableBalance = wallet ? balanceCAD : isLoading ? null : 0;

  const handleProceed = async (amount: number) => {
    setIsProceedLoading(true);
    try {
      const { client_secret, topup_id } = await initiateWalletTopup(amount);
      setClientSecret(client_secret);
      setTopupId(topup_id);
      setSelectedAmount(amount);
      setStep('pay');
    } catch (e) {
      // re-throw so AmountPicker can catch and show the error message
      throw e;
    } finally {
      setIsProceedLoading(false); // ← always resets — success, error, or back
    }
  };

  const handleBack = () => {
    setStep('pick');
    setClientSecret(null);
    setTopupId(null);
    setIsProceedLoading(false); // ← belt-and-suspenders reset
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl">

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row">

          {/* Left — amount picker, always visible */}
          <div className={`md:w-1/2 md:border-r border-gray-100 transition-opacity duration-300 ${
            step === 'pay' ? 'opacity-50 pointer-events-none select-none' : 'opacity-100'
          }`}>
            <AmountPicker
              availableBalance={availableBalance}
              isLoading={isProceedLoading}
              onProceed={handleProceed}
            />
          </div>

          {/* Right — Stripe form or placeholder */}
          <div className="md:w-1/2">
            {step === 'pay' && clientSecret && topupId ? (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: { theme: 'stripe', variables: { colorPrimary: '#F4781B' } },
                }}
              >
                <PaymentForm
                  amount={selectedAmount}
                  topupId={topupId}
                  onBack={handleBack}
                />
              </Elements>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[320px] gap-3 px-6 text-center">
                <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center">
                  <Wallet className="w-7 h-7 text-[#F4781B]" />
                </div>
                <p className="text-[14px] font-semibold text-gray-700">Payment Details</p>
                <p className="text-[13px] text-gray-400 max-w-[200px]">
                  Select an amount on the left to proceed to payment.
                </p>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => router.push('/wallet')}
          className="mt-4 w-full text-center text-[13px] text-gray-400 hover:text-gray-600 transition-colors"
        >
          ← Back to Wallet
        </button>
      </div>
    </div>
  );
}

// Wrap in Suspense — useSearchParams() requires it in Next.js App Router
export default function TopupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F9F8F6] flex items-center justify-center">
        <p className="text-gray-400 text-sm animate-pulse">Loading...</p>
      </div>
    }>
      <TopupPageContent />
    </Suspense>
  );
}