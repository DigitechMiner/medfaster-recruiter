"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircle } from "lucide-react";

const MIN_TOPUP_AMOUNT = 100;
const SUGGESTED_AMOUNTS = [100, 500, 1000, 2500, 5000, 10000];

type AmountPickerProps = {
  isLoading: boolean;
  onProceed: (amount: number) => Promise<void>;
};

export function AmountPicker({
  isLoading,
  onProceed,
}: AmountPickerProps) {
  const params = useSearchParams();
  const loadError = params.get("error");
  const loadErrorMessage =
    loadError === "payment_load_failed"
      ? "Your payment session expired. Please try again."
      : loadError === "payment_cancelled"
        ? "Payment was cancelled. Please choose an amount and try again."
        : loadError === "payment_failed"
          ? "Your payment was not completed. Please choose an amount and try again."
          : null;

  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  const numericAmount = parseFloat(amount) || 0;
  const isWholeAmount = Number.isInteger(numericAmount);

  const handleInput = (val: string) => {
    const cleaned = val.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) return;
    if (parts[1]?.length > 2) return;
    setAmount(cleaned);
    setError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!numericAmount || numericAmount < MIN_TOPUP_AMOUNT) {
      setError(`Minimum amount is $ ${MIN_TOPUP_AMOUNT}`);
      return;
    }

    if (!isWholeAmount) {
      setError("Amount must be a whole number (e.g. 100, not 100.54)");
      return;
    }

    try {
      setError(null);
      await onProceed(numericAmount);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to initiate topup");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6">
      <h2 className="text-[16px] font-bold text-gray-900">Recharge Wallet</h2>

      <div className="space-y-3">
        {loadErrorMessage && (
          <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 text-[13px] rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{loadErrorMessage}</span>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex flex-1 items-center rounded-xl border border-gray-200 px-3 transition-all focus-within:border-[#F4781B] focus-within:ring-1 focus-within:ring-[#F4781B]/20">
            <span className="text-gray-400 text-[15px] mr-1">$</span>
            <input
              type="text"
              inputMode="decimal"
              aria-label="Amount in CAD"
              placeholder={`${MIN_TOPUP_AMOUNT}`}
              value={amount}
              onChange={(e) => handleInput(e.target.value)}
              className="flex-1 py-3 text-[15px] font-semibold text-gray-900 bg-transparent outline-none placeholder:text-gray-300"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || numericAmount < MIN_TOPUP_AMOUNT}
            className="rounded-xl bg-[#F4781B] px-6 py-3 text-[14px] font-semibold text-white transition-all hover:bg-[#e06a10] disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.98]"
          >
            {isLoading ? "Processing..." : "Pay"}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {SUGGESTED_AMOUNTS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setAmount(String(value));
                setError(null);
              }}
              className={`rounded-lg border px-3 py-2 text-[13px] font-semibold transition-all ${
                numericAmount === value
                  ? "border-[#F4781B] bg-[#F4781B] text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:border-[#F4781B] hover:text-[#F4781B]"
              }`}
            >
              $ {value.toLocaleString("en-CA")}
            </button>
          ))}
        </div>

        {error && (
          <p className="text-[13px] text-red-500">{error}</p>
        )}
      </div>
    </form>
  );
}
