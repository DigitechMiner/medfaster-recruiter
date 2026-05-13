"use client";

import { CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

type TopupSuccessDialogProps = {
  open: boolean;
  amount: string;
  isRefreshing: boolean;
  newBalance: string | null;
  hasPendingJob: boolean;
  onClose: () => void;
  onContinueJob: () => void;
  onViewWallet: () => void;
};

export function TopupSuccessDialog({
  open,
  amount,
  isRefreshing,
  newBalance,
  hasPendingJob,
  onClose,
  onContinueJob,
  onViewWallet,
}: TopupSuccessDialogProps) {
  const numericAmount = Number(amount);
  const displayedAmount =
    Number.isFinite(numericAmount) && numericAmount > 0
      ? `$ ${numericAmount.toLocaleString("en-CA")}`
      : `$ ${amount}`;
  const actionText = hasPendingJob ? "Continue - Post Job" : "View Wallet";

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md w-[90vw] max-w-[400px] rounded-xl p-0">
        <DialogTitle className="sr-only">Payment Successful</DialogTitle>
        <div className="flex flex-col items-center p-8 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Payment Successful
          </h2>
          <p className="text-sm text-gray-500 mb-2">
            <span className="font-semibold text-gray-800">
              {displayedAmount}
            </span>{" "}
            has been added.
          </p>

          <p className="text-xs text-gray-400 mb-6">
            {isRefreshing ? (
              <span className="animate-pulse">Confirming with bank...</span>
            ) : newBalance ? (
              <>
                New balance:{" "}
                <span className="font-semibold text-gray-700">
                  {newBalance}
                </span>
              </>
            ) : (
              "Balance updated"
            )}
          </p>

          <button
            type="button"
            onClick={hasPendingJob ? onContinueJob : onViewWallet}
            disabled={isRefreshing}
            className="w-full bg-[#F4781B] hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-semibold py-3 rounded-xl transition-colors"
          >
            {isRefreshing ? "Confirming..." : actionText}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
