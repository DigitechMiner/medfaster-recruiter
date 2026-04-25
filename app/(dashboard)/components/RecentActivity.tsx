'use client';

const activity = [
  { dot: 'bg-green-400',  text: 'Rahul Sharma',   action: 'Checked-In',            time: '09:01 AM' },
  { dot: 'bg-red-400',    text: 'Emma White',      action: 'marked as Late',        time: '09:12 AM' },
  { dot: 'bg-blue-400',   text: 'Job #KRV-123',    action: 'created',               time: '08:45 AM' },
  { dot: 'bg-orange-400', text: 'Refund',          action: 'Processed $200',        time: 'Yesterday' },
  { dot: 'bg-red-500',    text: 'John Duo',        action: 'marked as No-Show',     time: 'April 12, 2026' },
];

export const RecentActivity = () => (
  <div className="bg-white rounded-xl border border-gray-200 p-5">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-sm font-semibold text-gray-900">Recent Activity</h2>
      <button className="text-xs text-[#F4781B] font-medium hover:underline">View all</button>
    </div>
    <div className="flex flex-col gap-3">
      {activity.map(({ dot, text, action, time }, i) => (
        <div key={i} className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${dot}`} />
            <p className="text-xs text-gray-700">
              <span className="font-semibold">{text}</span> {action}
            </p>
          </div>
          <span className="text-[11px] text-gray-400 whitespace-nowrap shrink-0">{time}</span>
        </div>
      ))}
    </div>
  </div>
);