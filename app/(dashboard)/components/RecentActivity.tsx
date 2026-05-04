'use client';
import { useRecentActivity } from '@/hooks/useDashboard';
import { formatDistanceToNow } from 'date-fns';

const DOT_COLOR: Record<string, string> = {
  green:  'bg-green-400',
  orange: 'bg-orange-400',
  red:    'bg-red-500',
  blue:   'bg-blue-400',
};

export const RecentActivity = () => {
  const { activities, isLoading } = useRecentActivity(10);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-900">Recent Activity</h2>
        <button className="text-xs text-[#F4781B] font-medium hover:underline">View all</button>
      </div>

      <div className="flex flex-col gap-3">
        {isLoading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
          ))
        ) : activities.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No recent activity.</p>
        ) : (
          activities.map((item, i) => (
            <div key={i} className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${DOT_COLOR[item.status_color] ?? 'bg-gray-400'}`} />
                <p className="text-xs text-gray-700">{item.title}</p>
              </div>
              <span className="text-[11px] text-gray-400 whitespace-nowrap shrink-0">
                {formatDistanceToNow(new Date(item.occurred_at), { addSuffix: true })}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};