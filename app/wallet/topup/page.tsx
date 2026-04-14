// app/wallet/topup/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import NumPad from '@/components/wallet/NumPad';
import { getWallet, initiateWalletTopup } from '@/stores/api/recruiter-wallet-api';
import { Navbar } from '@/components/global/navbar';

export default function TopupPage() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [availableBalance, setAvailableBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useState(() => {
    getWallet()
      .then((w) => setAvailableBalance(Number(w.available_balance) / 100))
      .catch(() => {});
  });

  const displayAmount = (() => {
    if (!amount) return 'CA$ 0';
    const [intPart, decPart] = amount.split('.');
    const formattedInt = Number(intPart || 0).toLocaleString('en-CA');
    if (decPart === undefined) return `CA$ ${formattedInt}`;
    return `CA$ ${formattedInt}.${decPart}`;
  })();

  const handleWithdraw = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount < 1) {
      setError('Minimum amount is CA$ 1');
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const { client_secret, topup_id } = await initiateWalletTopup(numAmount);
      router.push(`/wallet/topup/confirm?secret=${client_secret}&topup_id=${topup_id}&amount=${numAmount}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to initiate topup');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div
        className="bg-gray-50 flex flex-col overflow-hidden"
        style={{ height: "calc(100vh - 56px)" }}
      >
        {/* Amount Display */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 overflow-y-auto">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl w-full py-10 text-center shadow-sm mb-6">
              <p className="text-4xl font-bold text-[#F4781B] tracking-tight">
                {displayAmount}
              </p>
              {availableBalance !== null && (
                <p className="mt-2 text-sm text-gray-400">
                  Available Balance: CA$ {availableBalance.toLocaleString('en-CA')}
                </p>
              )}
            </div>

            {error && (
              <p className="text-sm text-red-500 mb-4 text-center">{error}</p>
            )}

            <button
              onClick={handleWithdraw}
              disabled={isLoading || !amount || parseFloat(amount) < 1}
              className="w-full bg-orange-500 text-white font-semibold text-base py-4 rounded-2xl
                disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-transform mb-6"
            >
              {isLoading ? 'Processing...' : 'Instant Withdraw'}
            </button>
          </div>
        </div>

        {/* NumPad */}
        <div className="bg-gray-100 pb-8 flex-shrink-0">
          <div className="max-w-md mx-auto px-4 pt-4">
            <NumPad value={amount} onChange={setAmount} />
          </div>
        </div>
      </div>
    </>
  );
}