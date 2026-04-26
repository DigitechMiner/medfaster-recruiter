'use client';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface Props {
  jobs?: {
    ACTIVE?: number; UPCOMING?: number; OPEN?: number; COMPLETED?: number; TOTAL?: number;
  } | null;
}

export const JobsOverviewChart = ({ jobs }: Props) => {
  const active    = jobs?.ACTIVE    ?? 82;
  const upcoming  = jobs?.UPCOMING  ?? 15;
  const open      = jobs?.OPEN      ?? 8;
  const completed = jobs?.COMPLETED ?? 40;
  const total     = jobs?.TOTAL     ?? (active + upcoming + open + completed);

  const data = [
    { name: 'Active',    value: active,    color: '#22c55e' },
    { name: 'Upcoming',  value: upcoming,  color: '#f97316' },
    { name: 'Open',      value: open,      color: '#3b82f6' },
    { name: 'Completed', value: completed, color: '#e5e7eb' },
  ];

  return (
    /* h-full so this card fills the flex-1 wrapper */
    <div className="bg-white rounded-xl border border-gray-200 p-5 h-full flex flex-col">
      <h2 className="text-sm font-semibold text-gray-900 mb-4 shrink-0">Jobs/Shifts Overview</h2>

      <div className="flex items-center gap-4 flex-1 min-h-0">
        {/* Donut */}
        <div className="relative w-36 h-36 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} innerRadius={44} outerRadius={68} dataKey="value" paddingAngle={2}>
                {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold text-gray-900">{total}</span>
            <span className="text-xs text-gray-400">Total</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2">
          {data.map((d) => (
            <div key={d.name} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: d.color }} />
              <span className="text-xs text-gray-600 flex-1">{d.name}</span>
              <span className="text-xs font-semibold text-gray-800 pl-2">{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};