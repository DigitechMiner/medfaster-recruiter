"use client";

const stages = [
  { label: "Applied",     count: "150", rejected: 110, rejectedPct: 30,  color: "bg-green-700",  widthPct: 100 },
  { label: "Shortlisted", count: "40",  rejected: 25,  rejectedPct: 62,  color: "bg-green-600",  widthPct: 68  },
  { label: "Interviewed", count: "15",  rejected: 7,   rejectedPct: 46,  color: "bg-green-400",  widthPct: 42  },
  { label: "Offered",     count: "08",  rejected: 3,   rejectedPct: 37,  color: "bg-green-300",  widthPct: 20  },
  { label: "Hired",       count: "05",  rejected: null, rejectedPct: null, color: "bg-orange-500", widthPct: 12  },
];

// Dashed vertical grid lines at 25%, 50%, 75%, 100%
const GridLines = () => (
  <div className="absolute inset-0 flex pointer-events-none">
    {[25, 50, 75, 100].map((p) => (
      <div
        key={p}
        className="absolute top-0 bottom-0 border-l border-dashed border-gray-200"
        style={{ left: `${p}%` }}
      />
    ))}
  </div>
);

export const HiringFunnel = () => (
  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
    {/* Header */}
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
      <h2 className="text-sm md:text-2xl font-bold text-gray-900 truncate">Recruiting Funnel</h2>
      <select className="text-sm border border-gray-200 rounded-xl px-4 py-2 text-gray-700 bg-white focus:outline-none">
        <option>This Month</option>
        <option>Last Month</option>
      </select>
    </div>

    {/* Bars area */}
    <div className="px-6 py-6 flex flex-col gap-4">
      {stages.map((stage) => (
        <div key={stage.label} className="flex items-center gap-4">
          {/* Label */}
          <span className="text-sm text-gray-400 w-20 shrink-0 text-right">{stage.label}</span>

          {/* Bar track with grid lines */}
          <div className="flex-1 relative">
            <GridLines />
            <div className="relative h-10 bg-transparent rounded-lg overflow-visible">
              <div
                className={`h-full ${stage.color} rounded-r-lg flex items-center px-3`}
                style={{ width: `${stage.widthPct}%` }}
              >
                <span className="text-sm font-bold text-white">{stage.count}</span>
              </div>
            </div>
          </div>

          {/* Rejected label */}
          {stage.rejected !== null ? (
            <span className="text-sm text-red-500 whitespace-nowrap w-40 shrink-0">
              {stage.rejected} Rejected{" "}
              <span className="font-bold">{stage.rejectedPct}%</span>{" "}
              <span className="font-bold">↓</span>
            </span>
          ) : (
            <span className="w-40 shrink-0" />
          )}
        </div>
      ))}
    </div>

    {/* Footer */}
    <div className="flex justify-between px-6 py-4 border-t border-gray-200">
      <span className="text-sm font-bold text-red-500">Total Rejected: 145</span>
      <span className="text-sm font-bold text-green-600">Overall Conversion Rate: 3.3%</span>
    </div>
  </div>
);
