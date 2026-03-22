"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { AlertTriangle } from "lucide-react";

interface LabelProps {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  value?: number;
  name?: string;
}

const roleWiseDemand = [
  { role: "LPN", openings: 12, applicants: 4,  barColor: "bg-red-400",    barPct: 27  },
  { role: "HCA", openings: 3,  applicants: 45, barColor: "bg-green-500",  barPct: 100 },
  { role: "RN",  openings: 5,  applicants: 8,  barColor: "bg-yellow-400", barPct: 44  },
];

const recruiterPerformance = [
  { rank: "1st", name: "Sarah Jenkins", jobs: 12, hires: 8,  avgTime: "2 hrs"  },
  { rank: "2nd", name: "Michael Lee",   jobs: 8,  hires: 5,  avgTime: "5 hrs"  },
  { rank: "3rd", name: "Priya Sharma",  jobs: 15, hires: 3,  avgTime: "12 hrs" },
  { rank: "4th", name: "John Doe",      jobs: 4,  hires: 1,  avgTime: "24 hrs" },
  { rank: "5th", name: "David Chen",    jobs: 6,  hires: 4,  avgTime: "3 hrs"  },
  { rank: "6th", name: "Emily White",   jobs: 5,  hires: 2,  avgTime: "8 hrs"  },
];

const jobStatusData = [
  { name: "Live jobs",         value: 82,  color: "#22c55e" },
  { name: "On Hold",           value: 15,  color: "#f97316" },
  { name: "Awaiting Approval", value: 8,   color: "#3b82f6" },
  { name: "Closed",            value: 40,  color: "#e5e7eb" },
];

// Custom label rendered ON the segment
const renderCustomLabel = ({
  cx = 0,
  cy = 0,
  midAngle = 0,
  innerRadius = 0,
  outerRadius = 0,
  value = 0,
}: LabelProps) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (value < 5) return null;
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
      fontSize={13} fontWeight="600">
      {value}
    </text>
  );
};

const GridLines = () => (
  <div className="absolute inset-0 pointer-events-none">
    {[25, 50, 75, 100].map((p) => (
      <div key={p} className="absolute top-0 bottom-0 border-l border-dashed border-gray-200"
        style={{ left: `${p}%` }} />
    ))}
  </div>
);

export const BottomWidgets = () => (
  <div className="flex flex-col gap-4">

    {/* ── Row 1: Role-Wise + Hired Candidates Performance ── */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

      {/* Role-Wise Hiring Demand */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Role-Wise Hiring Demand</h2>
        </div>
        <div className="px-6 py-6 flex flex-col gap-6">
          {roleWiseDemand.map((r) => (
            <div key={r.role} className="flex items-center gap-4">
              <span className="text-sm text-gray-400 w-10 shrink-0">{r.role}</span>
              <div className="flex-1 flex flex-col gap-1.5">
                {/* Stats row with divider */}
                <div className="flex items-center gap-0 text-sm mb-1">
                  <span className="text-gray-500">
                    Opening: <span className="font-bold text-green-600">{String(r.openings).padStart(2,"0")}</span>
                  </span>
                  <span className="mx-3 text-gray-300">|</span>
                  <span className="text-gray-500">
                    Applicants: <span className="font-bold text-green-600">{String(r.applicants).padStart(2,"0")}</span>
                  </span>
                </div>
                {/* Single bar */}
                <div className="relative h-10">
                  <GridLines />
                  <div className={`h-full ${r.barColor} rounded-r-lg`} style={{ width: `${r.barPct}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Zero applicants warning */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0" />
            <span className="text-sm font-semibold text-gray-700">Roles With Zero Applicants</span>
          </div>
          <p className="text-sm text-orange-500 ml-6">• Radiologist</p>
          <p className="text-sm text-orange-500 ml-6">• Senior Pediatrician</p>
        </div>
      </div>

      {/* Hired Candidates Performance */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Hired Candidates Performance</h2>
          <select className="text-sm border border-gray-200 rounded-xl px-4 py-2 text-gray-700 bg-white focus:outline-none">
            <option>Most Hired</option>
          </select>
        </div>
        <div className="p-5">
          {/* Inner bordered table card */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Rank</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Candidates</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Jobs</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Hired</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Avg. Time</th>
                </tr>
              </thead>
              <tbody>
                {recruiterPerformance.map((r, i) => (
                  <tr key={r.rank} className={i < recruiterPerformance.length - 1 ? "border-t border-gray-200" : "border-t border-gray-200"}>
                    <td className="px-4 py-3.5 text-sm text-gray-700">{r.rank}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-700">{r.name}</td>
                    <td className="px-4 py-3.5 text-sm text-right text-gray-700">{String(r.jobs).padStart(2,"0")}</td>
                    <td className="px-4 py-3.5 text-sm text-right text-gray-700">{String(r.hires).padStart(2,"0")}</td>
                    <td className="px-4 py-3.5 text-sm text-right text-gray-700">{r.avgTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    {/* ── Row 2: Job Status + Download Reports ── */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

      {/* Job Status Overview */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Job status Overview</h2>
        </div>
        <div className="px-6 py-6 flex items-center gap-10">
          {/* Donut chart */}
          <div className="relative w-44 h-44 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={jobStatusData}
                  innerRadius={52}
                  outerRadius={82}
                  dataKey="value"
                  paddingAngle={2}
                  labelLine={false}
                  label={renderCustomLabel}
                >
                  {jobStatusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-gray-900">145</span>
              <span className="text-xs text-gray-400">Total</span>
            </div>
          </div>
          {/* Legend */}
          <div className="flex flex-col gap-3">
            {jobStatusData.map((d) => (
              <div key={d.name} className="flex items-center gap-3">
                <span className="w-4 h-4 rounded-md shrink-0" style={{ background: d.color }} />
                <span className="text-sm text-gray-700">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Download Reports */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Download Reports</h2>
        </div>
        <div className="px-6 py-6 flex flex-col gap-5">
          {[
            "Export Hiring Report (PDF/CSV)",
            "Export Candidates Performance Detailed Report",
            "Export Job-wise Pipeline",
            "Export Role Wise Report",
          ].map((label) => (
            <button
              key={label}
              className="text-base text-orange-500 hover:text-orange-600 underline underline-offset-2 text-left transition-colors font-medium"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

    </div>
  </div>
);
