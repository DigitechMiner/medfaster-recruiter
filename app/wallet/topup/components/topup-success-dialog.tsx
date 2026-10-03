"use client";

import { CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

type TopupSuccessDialogProps = {
  open: boolean;
  amount: string;
  isRefreshing: boolean;
  balanceUpdated: boolean;
  newBalance: string | null;
  onClose: () => void;
  onViewWallet: () => void;
};

export function TopupSuccessDialog({
  open,
  amount,
  isRefreshing,
  balanceUpdated,
  newBalance,
  onClose,
  onViewWallet,
}: TopupSuccessDialogProps) {
  const numericAmount = Number(amount);
  const displayedAmount =
    Number.isFinite(numericAmount) && numericAmount > 0
      ? `$ ${numericAmount.toLocaleString("en-CA")}`
      : `$ ${amount}`;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <DialogContent className="w-[90vw] max-w-[440px] rounded-xl p-0">
        <DialogTitle className="sr-only">Payment submitted</DialogTitle>
        <div className="flex flex-col items-center p-8 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Payment submitted
          </h2>
          <p className="text-sm text-gray-500 mb-2">
            <span className="font-semibold text-gray-800">
              {displayedAmount}
            </span>{" "}
            was submitted.
          </p>
          <p className="text-sm text-gray-500 mb-2">
            Card payments update your wallet shortly. Bank debit can take
            several business days to clear. The wallet is credited the net
            amount after Stripe’s fee.
          </p>

          <p className="text-xs text-gray-400 mb-6">
            {isRefreshing ? (
              <span className="animate-pulse">Checking your wallet...</span>
            ) : balanceUpdated && newBalance ? (
              <>
                New balance:{" "}
                <span className="font-semibold text-gray-700">
                  {newBalance}
                </span>
              </>
            ) : (
              "Your wallet updates when the payment clears."
            )}
          </p>

          <button
            type="button"
            onClick={onViewWallet}
            disabled={isRefreshing}
            className="w-full bg-[#F4781B] hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-semibold py-3 rounded-xl transition-colors"
          >
            {isRefreshing ? "Checking..." : "View Wallet"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
