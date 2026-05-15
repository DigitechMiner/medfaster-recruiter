"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Lock, Mic, Wallet } from "lucide-react";
import { formatCents } from "@/app/wallet/helpers";
import { useWalletStore } from "@/stores/walletStore";

const squareBoxClass =
  "bg-white rounded-xl border border-gray-200 p-4 flex flex-col h-full min-h-0 shadow-sm";

function toCents(value: string | undefined): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function DashboardWalletCard() {
  const router = useRouter();
  const wallet = useWalletStore((s) => s.wallet);
  const isLoading = useWalletStore((s) => s.isLoading);
  const ensureWalletLoaded = useWalletStore((s) => s.ensureWalletLoaded);

  useEffect(() => {
    void ensureWalletLoaded();
  }, [ensureWalletLoaded]);

  const balance = toCents(wallet?.available_balance);
  const holdAmount = toCents(wallet?.held_balance);
  const jobSpend = toCents(wallet?.monthly_job_spend_cents);
  const interviewSpend = toCents(wallet?.monthly_interview_spend_cents);

  const monthLabel = wallet?.monthly_spend_month
    ? ` (${wallet.monthly_spend_month})`
    : "";

  const metrics = [
    {
      icon: Wallet,
      label: "Wallet Balance",
      value: isLoading && !wallet ? "—" : formatCents(balance),
      bg: "bg-orange-50",
      color: "text-[#F4781B]",
    },
    {
      icon: Lock,
      label: "Hold Amount",
      value: isLoading && !wallet ? "—" : formatCents(holdAmount),
      bg: "bg-gray-50",
      color: "text-gray-700",
    },
    {
      icon: Briefcase,
      label: `Job Spend${monthLabel}`,
      value: isLoading && !wallet ? "—" : formatCents(jobSpend),
      bg: "bg-blue-50",
      color: "text-blue-600",
    },
    {
      icon: Mic,
      label: `Interview Spend${monthLabel}`,
      value: isLoading && !wallet ? "—" : formatCents(interviewSpend),
      bg: "bg-purple-50",
      color: "text-purple-600",
    },
  ];

  return (
    <div className={squareBoxClass}>
      <div className="flex items-start justify-between gap-2 shrink-0 mb-3">
        <h2 className="text-sm font-semibold text-gray-900">Wallet</h2>
        <button
          type="button"
          onClick={() => router.push("/wallet")}
          className="text-xs text-[#F4781B] font-medium hover:underline shrink-0"
        >
          View all
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 flex-1 min-h-0 content-center">
        {metrics.map(({ icon: Icon, label, value, bg, color }) => (
          <div
            key={label}
            className="flex flex-col items-center justify-center gap-1.5 rounded-lg border border-gray-100 bg-gray-50/50 py-2.5 px-1 min-h-0"
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${bg}`}
            >
              <Icon className={`w-4 h-4 ${color}`} aria-hidden />
            </div>
            <span className="text-[10px] font-medium text-gray-500 text-center leading-tight px-0.5">
              {label}
            </span>
            {isLoading && !wallet ? (
              <div className="h-4 w-14 rounded bg-gray-200 animate-pulse" />
            ) : (
              <span
                className={`text-xs font-semibold tabular-nums text-center ${color}`}
              >
                {value}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
