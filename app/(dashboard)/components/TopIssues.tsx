'use client';
import { UserX, Clock, UserMinus, XCircle } from 'lucide-react';

const issues = [
  { Icon: UserX,     bg: 'bg-red-50',    text: 'text-red-500',    label: '1 No-Show',          sub: 'RN  •  09:00 AM - 07:00 PM',  right: 'John Duo' },
  { Icon: Clock,     bg: 'bg-orange-50', text: 'text-orange-500', label: '2 Late Arrival',      sub: 'RN  •  15m Late',              right: '2 Candidates' },
  { Icon: UserMinus, bg: 'bg-yellow-50', text: 'text-yellow-500', label: '1 Position Unfilled', sub: 'HCA  •  09:00 AM - 07:00 PM',  right: '1 Upcoming Shift' },
  { Icon: XCircle,   bg: 'bg-red-50',    text: 'text-red-500',    label: '3 Cancelled Job',     sub: 'LPN  •  09:00 AM - 07:00 PM',  right: '1 Open Job' },
];

export const TopIssues = () => (
  <div className="bg-white rounded-xl border border-gray-200 p-5">
    <div className="flex items-center gap-2 mb-4">
      <h2 className="text-sm font-semibold text-gray-900">Top Issues</h2>
      <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">3</span>
    </div>
    <div className="flex flex-col gap-2">
      {issues.map(({ Icon, bg, text, label, sub, right }) => (
        <div key={label} className={`flex items-center justify-between px-4 py-3 rounded-xl ${bg}`}>
          <div className="flex items-center gap-3">
            <Icon className={`w-4 h-4 shrink-0 ${text}`} />
            <div>
              <p className="text-sm font-semibold text-gray-800">{label}</p>
              <p className="text-xs text-gray-500">{sub}</p>
            </div>
          </div>
          <span className="text-xs text-gray-500 whitespace-nowrap">{right} →</span>
        </div>
      ))}
    </div>
    <button className="mt-4 w-full bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">
      Resolve All Now
    </button>
  </div>
);