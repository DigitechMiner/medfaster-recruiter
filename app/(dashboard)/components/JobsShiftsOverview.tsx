"use client";
import React from "react";

interface JobsShiftsOverviewProps {
  active: number;
  upcoming: number;
  open: number;
  completed: number;
  isLoading?: boolean;
}

const SEGMENTS = [
  { key: "active",    label: "Active",    color: "#22c55e" },
  { key: "upcoming",  label: "Upcoming",  color: "#F4781B" },
  { key: "open",      label: "Open",      color: "#3b82f6" },
  { key: "completed", label: "Completed", color: "#e5e7eb" },
];

export function JobsShiftsOverview({
  active, upcoming, open, completed, isLoading,
}: JobsShiftsOverviewProps) {
  const counts = [active, upcoming, open, completed];
  const total = counts.reduce((a, b) => a + b, 0);

  const r = 48;
  const cx = 60;
  const cy = 60;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * r;

  let cumulative = 0;
  const arcs = SEGMENTS.map(({ color }, idx) => {
    const frac = total > 0 ? counts[idx] / total : 0;
    const dash = `${frac * circumference} ${circumference}`;
    const rotation = -90 + (cumulative / (total || 1)) * 360;
    cumulative += counts[idx];
    return { color, dash, rotation };
  });

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 min-h-[180px]">
      <h2 className="text-sm font-semibold text-gray-900 mb-3">Jobs/Shifts Overview</h2>
      {isLoading ? (
        <div className="flex items-center justify-center h-28">
          <div className="w-20 h-20 rounded-full border-[12px] border-gray-100 animate-pulse" />
        </div>
      ) : (
        <div className="flex items-center gap-4">
          {/* SVG Donut */}
          <div className="relative shrink-0 w-[100px] h-[100px]">
  <svg width="100" height="100" viewBox="0 0 120 120" className="w-full h-full">
              {total === 0 ? (
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb" strokeWidth={strokeWidth} />
              ) : arcs.map(({ color, dash, rotation }, i) => (
                <circle
                  key={i}
                  cx={cx} cy={cy} r={r}
                  fill="none"
                  stroke={color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={dash}
                  strokeDashoffset={0}
                  transform={`rotate(${rotation} ${cx} ${cy})`}
                  strokeLinecap="butt"
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold text-gray-900 tabular-nums leading-none">{total}</span>
              <span className="text-[10px] text-gray-400 mt-0.5">Total</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-2 flex-1">
            {SEGMENTS.map(({ label, color }, idx) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: color }} />
                <span className="text-[11px] text-gray-600 flex-1">{label}</span>
                <span className="text-[11px] font-semibold text-gray-800 tabular-nums">
                  {counts[idx]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}