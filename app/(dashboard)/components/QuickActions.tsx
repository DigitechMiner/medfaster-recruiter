"use client";

import { useRouter } from "next/navigation";
import { Plus, UserPlus, Wallet, Zap } from "lucide-react";

const squareBoxClass =
  "bg-white rounded-xl border border-gray-200 p-4 flex flex-col h-full min-h-0 shadow-sm";

const actions = [
  {
    icon: Zap,
    label: "Urgent Shift",
    href: "/jobs/create/instant",
    bg: "bg-orange-50",
    color: "text-[#F4781B]",
  },
  {
    icon: Plus,
    label: "Post a Job",
    href: "/jobs/create/normal",
    bg: "bg-blue-50",
    color: "text-blue-600",
  },
  {
    icon: UserPlus,
    label: "Add Candidate",
    href: "/candidates",
    bg: "bg-green-50",
    color: "text-green-600",
  },
  {
    icon: Wallet,
    label: "Recharge Wallet",
    href: "/wallet/topup",
    bg: "bg-purple-50",
    color: "text-purple-600",
  },
];

export const QuickActions = () => {
  const router = useRouter();

  return (
    <div className={squareBoxClass}>
      <h2 className="text-sm font-semibold text-gray-900 mb-3 shrink-0">
        Quick Actions
      </h2>

      <div className="grid h-full min-h-0 flex-1 grid-cols-2 grid-rows-[1fr_1fr] gap-2">
        {actions.map(({ icon: Icon, label, href, bg, color }) => (
          <button
            key={label}
            type="button"
            onClick={() => router.push(href)}
            className="flex h-full min-h-0 flex-col items-center justify-center gap-1.5 rounded-lg border border-gray-100 bg-gray-50/50 px-1 py-2 hover:border-orange-200 hover:bg-orange-50/40 transition-all"
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${bg}`}
            >
              <Icon className={`w-4 h-4 ${color}`} aria-hidden />
            </div>
            <span className="text-[10px] font-medium text-gray-600 text-center leading-tight px-0.5">
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
