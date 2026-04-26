'use client';
import { Phone, MessageSquare, MoreVertical } from 'lucide-react';
import { useJobsCalendar } from '@/hooks/useRecruiterData';
import type { CalendarJob } from '@/Interface/recruiter.types';

/* ── Status config ── */
const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  ACTIVE:   { label: 'Active',           className: 'bg-green-100 text-green-700'   },
  LATE:     { label: 'Late (10m)',        className: 'bg-orange-100 text-orange-600' },
  NO_SHOW:  { label: 'No-Show',          className: 'bg-red-100 text-red-600'       },
  UPCOMING: { label: 'Pending Check-In', className: 'bg-yellow-100 text-yellow-700' },
  COMPLETED:{ label: 'Completed',        className: 'bg-gray-100 text-gray-500'     },
  CANCELLED:{ label: 'Cancelled',        className: 'bg-red-50 text-red-400'        },
};

/* ── Mock fallback rows (pixel-matched to design image) ── */
const MOCK_ROWS = [
  {
    id: 'm1', initials: 'MM', name: 'Marvin McKinney',   role: 'RN',           time: '09:00 AM - 07:00 PM', status: 'ACTIVE'   },
  {
    id: 'm2', initials: 'BS', name: 'Brooklyn Simmons',  role: 'LPN',          time: '09:00 AM - 05:00 PM', status: 'LATE'     },
  {
    id: 'm3', initials: 'CF', name: 'Cody Fisher',       role: 'PSW',          time: '09:00 AM - 02:00 PM', status: 'ACTIVE'   },
  {
    id: 'm4', initials: 'DS', name: 'Darrell Steward',   role: 'HCA',          time: '09:00 AM - 03:00 PM', status: 'NO_SHOW'  },
  {
    id: 'm5', initials: 'PS', name: 'Priya Sharma',      role: 'Care Assistn', time: '09:00 AM - 03:00 PM', status: 'UPCOMING' },
];

/* ── Avatar colours cycling through brand palette ── */
const AVATAR_COLORS = [
  'bg-orange-100 text-[#F4781B]',
  'bg-blue-100 text-blue-600',
  'bg-green-100 text-green-600',
  'bg-purple-100 text-purple-600',
  'bg-pink-100 text-pink-600',
];

/* ── Derive display status from CalendarJob ── */
const resolveStatus = (job: CalendarJob): string => {
  const now = new Date();
  const plannedIn = job.planned_check_in
    ? new Date(`${job.shift_date}T${job.planned_check_in}`)
    : null;

  if (job.shift_status === 'ACTIVE') {
    // Late if actual check-in was >5 min after planned
    if (plannedIn && job.check_in) {
      const actualIn = new Date(job.check_in);
      if ((actualIn.getTime() - plannedIn.getTime()) > 5 * 60 * 1000) return 'LATE';
    }
    return 'ACTIVE';
  }
  if (job.shift_status === 'CANCELLED') return 'CANCELLED';
  if (job.shift_status === 'COMPLETED') return 'COMPLETED';
  // UPCOMING: if planned start has passed and no check-in → No-Show
  if (job.shift_status === 'UPCOMING') {
    if (plannedIn && now > plannedIn && !job.check_in) return 'NO_SHOW';
    return 'UPCOMING';
  }
  return job.shift_status ?? 'UPCOMING';
};

export const TodaysOperations = () => {
  const { calendarJobs, isLoading } = useJobsCalendar();
  const today = new Date().toISOString().split('T')[0];

  const liveRows = calendarJobs
    .filter((j: CalendarJob) => j.shift_date?.startsWith(today))
    .slice(0, 5)
    .map((j: CalendarJob, idx: number) => ({
      id:       j.assignment_id ?? String(idx),
      initials: j.candidate_name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) ?? '??',
      name:     j.candidate_name ?? '—',
      role:     j.job_title      ?? '—',
      time:     `${j.planned_check_in?.slice(0, 5) ?? '--:--'} - ${j.planned_check_out?.slice(0, 5) ?? '--:--'}`,
      status:   resolveStatus(j),
    }));

  /* Use live data if available, otherwise fall back to mock */
  const rows = liveRows.length > 0 ? liveRows : MOCK_ROWS;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-900">Today&apos;s Operations</h2>
        <button className="text-xs text-[#F4781B] font-medium hover:underline">
          View Full Schedule
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Candidate', 'Job & Time', 'Status', 'Action'].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-gray-400">
                  {h}
                </th>
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
            ) : (
              rows.map((row, idx) => {
                const statusCfg = STATUS_CONFIG[row.status] ?? STATUS_CONFIG.UPCOMING;
                const avatarCls = AVATAR_COLORS[idx % AVATAR_COLORS.length];

                return (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    {/* Candidate */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${avatarCls}`}>
                          {row.initials}
                        </div>
                        <span className="font-medium text-gray-800 whitespace-nowrap">
                          {row.name}
                        </span>
                      </div>
                    </td>

                    {/* Job & Time */}
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{row.role}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{row.time}</p>
                    </td>

                    {/* Status badge */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${statusCfg.className}`}>
                        {statusCfg.label}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5 text-gray-300">
                        <button className="hover:text-[#F4781B] transition-colors" aria-label="Call">
                          <Phone className="w-4 h-4" />
                        </button>
                        <button className="hover:text-[#F4781B] transition-colors" aria-label="Message">
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button className="hover:text-gray-500 transition-colors" aria-label="More">
                          <MoreVertical className="w-4 h-4" />
                        </button>
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