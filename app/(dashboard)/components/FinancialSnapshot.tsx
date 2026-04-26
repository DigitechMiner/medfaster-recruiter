'use client';
import { useRouter } from 'next/navigation';
import { useWalletStore } from '@/stores/walletStore';

export const FinancialSnapshot = () => {
  const router = useRouter();
  const wallet = useWalletStore((s) => s.wallet);

  const fmt = (cents: string | undefined) =>
    cents ? `$${(Number(cents) / 100).toLocaleString('en-CA', { minimumFractionDigits: 0 })}` : '—';

  const rows = [
    { label: 'Wallet Balance',  value: fmt(wallet?.available_balance), color: 'text-[#F4781B] font-semibold' },
    { label: 'Locked Funds',    value: fmt(wallet?.held_balance),      color: 'text-gray-800' },
    { label: 'Spent This Week', value: '—',                            color: 'text-gray-800' },
    { label: 'Avg Cost / Job',  value: '—',                            color: 'text-gray-800' },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h2 className="text-sm font-semibold text-gray-900">Financial Snapshot</h2>
        <button
          className="text-xs text-[#F4781B] font-medium hover:underline"
          onClick={() => router.push('/wallet')}
        >
          View details
        </button>
      </div>

      <div className="flex flex-col gap-3 flex-1">
        {rows.map(({ label, value, color }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-xs text-gray-500">{label}</span>
            <span className={`text-sm ${color}`}>{value}</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => router.push('/wallet/topup')}
        className="mt-4 w-full bg-[#F4781B] hover:bg-orange-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors shrink-0"
      >
        Recharge Wallet
      </button>
    </div>
  );
};