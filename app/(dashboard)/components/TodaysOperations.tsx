'use client';
import { Phone, MessageSquare, MoreVertical } from 'lucide-react';
import { useTodayShifts } from '@/hooks/useDashboard';

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  ACTIVE:    { label: 'Active',           className: 'bg-green-100 text-green-700'   },
  UPCOMING:  { label: 'Pending Check-In', className: 'bg-yellow-100 text-yellow-700' },
  COMPLETED: { label: 'Completed',        className: 'bg-gray-100 text-gray-500'     },
  CANCELLED: { label: 'Cancelled',        className: 'bg-red-50 text-red-400'        },
  MISSED:    { label: 'No-Show',          className: 'bg-red-100 text-red-600'       },
};

const AVATAR_COLORS = [
  'bg-orange-100 text-[#F4781B]',
  'bg-blue-100 text-blue-600',
  'bg-green-100 text-green-600',
  'bg-purple-100 text-purple-600',
  'bg-pink-100 text-pink-600',
];

export const TodaysOperations = () => {
  const { shifts, isLoading } = useTodayShifts();

  const rows = shifts.map((s) => ({
    id:       s.shift_id,
    initials: `${s.candidate_profile.first_name[0]}${s.candidate_profile.last_name[0]}`.toUpperCase(),
    name:     `${s.candidate_profile.first_name} ${s.candidate_profile.last_name}`,
    role:     s.job_title,
    time:     `${s.shift_check_in_time.slice(0, 5)} - ${s.shift_check_out_time.slice(0, 5)}`,
    status:   s.shift_status,
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-900">Today&apos;s Operations</h2>
        <button className="text-xs text-[#F4781B] font-medium hover:underline">
          View Full Schedule
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Candidate', 'Job & Time', 'Status', 'Action'].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-gray-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(4)].map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-gray-100 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-400">
                  No shifts scheduled for today.
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => {
                const statusCfg = STATUS_CONFIG[row.status] ?? STATUS_CONFIG.UPCOMING;
                const avatarCls = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                return (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${avatarCls}`}>
                          {row.initials}
                        </div>
                        <span className="font-medium text-gray-800 whitespace-nowrap">{row.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{row.role}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{row.time}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${statusCfg.className}`}>
                        {statusCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5 text-gray-300">
                        <button className="hover:text-[#F4781B] transition-colors" aria-label="Call"><Phone className="w-4 h-4" /></button>
                        <button className="hover:text-[#F4781B] transition-colors" aria-label="Message"><MessageSquare className="w-4 h-4" /></button>
                        <button className="hover:text-gray-500 transition-colors" aria-label="More"><MoreVertical className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};