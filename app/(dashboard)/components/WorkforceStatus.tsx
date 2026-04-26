'use client';

interface Props {
  jobs?: { ACTIVE?: number; OPEN?: number; UPCOMING?: number; CLOSED?: number } | null;
}

const specialties = [
  { label: 'Aged Care',          count: 3  },
  { label: 'Disability support', count: 20 },
  { label: 'HCA',                count: 12 },
  { label: 'Palliative',         count: 5  },
  { label: 'Mental Health',      count: 8  },
  { label: 'ICU',                count: 4  },
];

export const WorkforceStatus = ({ jobs }: Props) => {
  const stats = [
    { label: 'Active',    value: jobs?.ACTIVE   ?? 24, bg: 'bg-green-50',  text: 'text-green-600'  },
    { label: 'Open',      value: jobs?.OPEN      ?? 10, bg: 'bg-blue-50',   text: 'text-blue-600'   },
    { label: 'Upcoming',  value: jobs?.UPCOMING  ?? 30, bg: 'bg-orange-50', text: 'text-orange-500' },
    { label: 'Cancelled', value: jobs?.CLOSED    ?? 2,  bg: 'bg-red-50',    text: 'text-red-500'    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 h-full flex flex-col gap-5">

      {/* ── 4 stat boxes in one row ── */}
      <div>
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Workforce Status</h2>
        <div className="grid grid-cols-4 gap-2">
          {stats.map(({ label, value, bg, text }) => (
            <div key={label} className={`${bg} rounded-xl py-3 px-1 flex flex-col items-center`}>
              <span className={`text-xl font-bold ${text}`}>{value}</span>
              <span className="text-[10px] text-gray-500 mt-0.5 text-center">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Scrollable specialties ── */}
      <div className="flex-1">
        <h2 className="text-sm font-semibold text-gray-900 mb-2">Top Specialities in Demand</h2>
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {specialties.map(({ label, count }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs bg-orange-50 text-orange-700 font-medium px-2.5 py-1.5 rounded-full shrink-0"
            >
              {label}
              <span className="bg-orange-200 text-orange-800 rounded-full px-1.5 py-0.5 text-[10px] font-bold">
                {count}
              </span>
            </span>
          ))}
        </div>
      </div>

    </div>
  );
};