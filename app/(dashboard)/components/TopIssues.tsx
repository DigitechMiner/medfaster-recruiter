'use client';
import { UserX, Clock, UserMinus, XCircle } from 'lucide-react';
import type { DashboardOverview } from '@/hooks/useDashboard';
import { useRouter } from 'next/navigation';

interface Props {
  shifts?:     DashboardOverview['shiftOverview']     | null;
  interviews?: DashboardOverview['interviewOverview'] | null;
}

export const TopIssues = ({ shifts, interviews }: Props) => {
  const router = useRouter();

  const issues = [
    {
      Icon: UserX,     bg: 'bg-red-50',    text: 'text-red-500',
      label: `${shifts?.MISSED ?? 0} No-Show${(shifts?.MISSED ?? 0) !== 1 ? 's' : ''}`,
      sub:   'Shifts marked as missed',
      right: 'View shifts',
      href:  '/jobs',
    },
    {
      Icon: Clock,     bg: 'bg-orange-50', text: 'text-orange-500',
      label: `${interviews?.REQUESTS.PENDING ?? 0} Pending Requests`,
      sub:   'Interview requests awaiting action',
      right: 'View requests',
      href:  '/candidates',
    },
    {
      Icon: UserMinus, bg: 'bg-yellow-50', text: 'text-yellow-500',
      label: `${shifts?.UPCOMING ?? 0} Upcoming Shifts`,
      sub:   'Shifts pending check-in',
      right: 'View schedule',
      href:  '/calendar',
    },
    {
      Icon: XCircle,   bg: 'bg-red-50',    text: 'text-red-500',
      label: `${shifts?.CANCELLED ?? 0} Cancelled`,
      sub:   'Shifts cancelled',
      right: 'View all',
      href:  '/jobs',
    },
  ];

  const totalIssues = (shifts?.MISSED ?? 0) + (shifts?.CANCELLED ?? 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-sm font-semibold text-gray-900">Top Issues</h2>
        {totalIssues > 0 && (
          <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
            {totalIssues > 9 ? '9+' : totalIssues}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-2">
        {issues.map(({ Icon, bg, text, label, sub, right, href }) => (
          <div key={label} className={`flex items-center justify-between px-4 py-3 rounded-xl ${bg}`}>
            <div className="flex items-center gap-3">
              <Icon className={`w-4 h-4 shrink-0 ${text}`} />
              <div>
                <p className="text-sm font-semibold text-gray-800">{label}</p>
                <p className="text-xs text-gray-500">{sub}</p>
              </div>
            </div>
            <button
              onClick={() => router.push(href)}
              className="text-xs text-gray-500 hover:text-[#F4781B] whitespace-nowrap transition-colors"
            >
              {right} →
            </button>
          </div>
        ))}
      </div>
      <button className="mt-4 w-full bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">
        Resolve All Now
      </button>
    </div>
  );
};