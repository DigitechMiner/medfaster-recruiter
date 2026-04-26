'use client';
import { useRouter } from 'next/navigation';
import { Zap, Plus, UserPlus, Wallet } from 'lucide-react';

const actions = [
  { icon: Zap,      label: 'Urgent Shift',    href: '/jobs/urgent-replacement', bg: 'bg-orange-50', color: 'text-[#F4781B]' },
  { icon: Plus,     label: 'Post a Job',       href: '/jobs/create',            bg: 'bg-blue-50',   color: 'text-blue-600'  },
  { icon: UserPlus, label: 'Add Candidate',   href: '/candidates',             bg: 'bg-green-50',  color: 'text-green-600' },
  { icon: Wallet,   label: 'Recharge Wallet', href: '/wallet/topup',           bg: 'bg-purple-50', color: 'text-purple-600'},
];

export const QuickActions = () => {
  const router = useRouter();
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h2 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h2>

      {/* ── Single row of 4 ── */}
      <div className="flex items-stretch gap-2">
        {actions.map(({ icon: Icon, label, href, bg, color }) => (
          <button
            key={label}
            onClick={() => router.push(href)}
            className="flex-1 flex flex-col items-center justify-center gap-1.5 py-3 px-1 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50/30 transition-all"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bg}`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <span className="text-[11px] font-medium text-gray-600 text-center leading-tight">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};