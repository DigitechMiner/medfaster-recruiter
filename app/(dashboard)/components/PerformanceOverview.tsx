'use client';

const metrics = [
  { label: 'Fill Rate',         value: '92%',  color: 'text-green-600',  trend: [30,45,40,60,55,70,92] },
  { label: 'Avg Time to Fill',  value: '8min', color: 'text-blue-600',   trend: [20,15,18,12,10,9,8]  },
  { label: 'Cancellation Rate', value: '5%',   color: 'text-orange-500', trend: [8,7,9,6,7,5,5]       },
  { label: 'No-Show Rate',      value: '3%',   color: 'text-red-500',    trend: [5,4,6,5,4,3,3]       },
];

const sparkColor: Record<string, string> = {
  'text-green-600':  '#22c55e',
  'text-blue-600':   '#3b82f6',
  'text-orange-500': '#f97316',
  'text-red-500':    '#ef4444',
};

const Sparkline = ({ data, color }: { data: number[]; color: string }) => {
  const max = Math.max(...data);
  const w = 52; const h = 32;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * (h - 4) + 2}`).join(' ');
  return (
    <svg width={w} height={h} className="mt-auto">
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const PerformanceOverview = () => (
  <div className="bg-white rounded-xl border border-gray-200 p-5 h-full flex flex-col">
    <h2 className="text-sm font-semibold text-gray-900 mb-3 shrink-0">Performance Overview</h2>

    {/* ── 4 individual bordered boxes in one row ── */}
    <div className="grid grid-cols-4 gap-2 flex-1">
      {metrics.map(({ label, value, color, trend }) => (
        <div
          key={label}
          className="border border-gray-200 rounded-xl p-3 flex flex-col items-center justify-between h-full"
        >
          <p className={`text-lg font-bold ${color} leading-tight`}>{value}</p>
          <p className="text-[10px] text-gray-500 text-center leading-snug mt-1">{label}</p>
          <Sparkline data={trend} color={sparkColor[color] ?? '#9ca3af'} />
        </div>
      ))}
    </div>
  </div>
);