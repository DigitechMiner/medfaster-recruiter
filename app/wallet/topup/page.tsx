'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getWallet, initiateWalletTopup } from '@/stores/api/recruiter-wallet-api';
import { Minus, Plus, Wallet } from 'lucide-react';

const QUICK_AMOUNTS = [100, 500, 1000, 2500, 5000, 10000];

export default function TopupPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [amount, setAmount]                     = useState('');
  const [availableBalance, setAvailableBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading]               = useState(false);
  const [error, setError]                       = useState<string | null>(null);

  useEffect(() => {
    getWallet()
      .then((w) => setAvailableBalance(Number(w.available_balance) / 100))
      .catch(() => {});
  }, []);

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
    const next = Math.max(0, numericAmount + by);
    setAmount(String(next));
    setError(null);
  };

  const handleQuickSelect = (val: number) => {
    setAmount(String(val));
    setError(null);
  };

  const displayAmount = numericAmount > 0
    ? `$ ${numericAmount.toLocaleString('en-CA', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
    : '$ 0';

  const handleSubmit = async () => {
    if (!numericAmount || numericAmount < 1) {
      setError('Minimum amount is $ 1');
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const { client_secret, topup_id } = await initiateWalletTopup(numericAmount);
      router.push(`/wallet/topup/confirm?secret=${client_secret}&topup_id=${topup_id}&amount=${numericAmount}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to initiate topup');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

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

          <div className="px-6 py-6 space-y-6">

            {/* Amount display */}
            <div className="text-center">
              <p className="text-[13px] text-gray-400 mb-2">Enter amount to add</p>
              <p className={`text-[40px] font-bold tracking-tight transition-colors ${
                numericAmount > 0 ? 'text-[#F4781B]' : 'text-gray-300'
              }`}>
                {displayAmount}
              </p>
            </div>

            {/* Input with +/- */}
            <div>
              <label className="text-[12px] font-medium text-gray-500 mb-1.5 block">
                Amount (USD)
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
                    onClick={() => handleQuickSelect(val)}
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
              <p className="text-[13px] text-red-500 text-center -mt-2">{error}</p>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-[14px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading || numericAmount < 1}
                className="flex-1 py-3 rounded-xl bg-[#F4781B] text-white text-[14px] font-semibold
                  hover:bg-[#e06a10] disabled:opacity-40 disabled:cursor-not-allowed
                  active:scale-[0.98] transition-all"
              >
                {isLoading ? 'Processing...' : 'Add Funds'}
              </button>
            </div>
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