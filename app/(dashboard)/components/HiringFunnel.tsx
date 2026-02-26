"use client";

const stages = [
  { label: "Applied", count: 150, rejected: 110, rejectedPct: 30, isDown: true, barWidth: "100%", color: "bg-green-500" },
  { label: "Shortlisted", count: 40, rejected: 25, rejectedPct: 62, isDown: true, barWidth: "27%", color: "bg-green-400" },
  { label: "Interviewed", count: 15, rejected: 7, rejectedPct: 46, isDown: true, barWidth: "10%", color: "bg-green-300" },
  { label: "Offered", count: 8, rejected: 3, rejectedPct: 37, isDown: true, barWidth: "5%", color: "bg-orange-400" },
  { label: "Hired", count: 5, rejected: null, rejectedPct: null, isDown: null, barWidth: "3%", color: "bg-orange-500" },
];

export const HiringFunnel = () => (
  <div className="bg-white rounded-xl border border-gray-200 p-5">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-base font-semibold text-gray-900">Hiring Funnel</h2>
      <select className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600">
        <option>This Month</option>
      </select>
    </div>
    <div className="flex flex-col gap-3">
      {stages.map((stage) => (
        <div key={stage.label} className="flex items-center gap-3">
          <span className="text-xs text-gray-500 w-20 shrink-0">{stage.label}</span>
          <div className="flex-1 relative h-6 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full ${stage.color} rounded-full`} style={{ width: stage.barWidth }} />
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-white">{stage.count}</span>
          </div>
          {stage.rejected !== null && (
            <span className="text-xs text-red-500 whitespace-nowrap">
              {stage.rejected} Rejected {stage.rejectedPct}% ↓
            </span>
          )}
        </div>
      ))}
    </div>
    <div className="flex justify-between mt-4 pt-3 border-t border-gray-100">
      <span className="text-xs text-red-500 font-medium">Total Rejected: 145</span>
      <span className="text-xs text-green-600 font-medium">Overall Conversion: 3.3%</span>
    </div>
  </div>
);
