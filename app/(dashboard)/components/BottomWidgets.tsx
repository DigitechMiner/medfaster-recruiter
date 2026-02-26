"use client";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { AlertTriangle } from "lucide-react";

const jobStatusData = [
  { name: "Live jobs",         value: 100, color: "#22c55e" },
  { name: "On Hold",           value: 5,   color: "#f97316" },
  { name: "Awaiting Approval", value: 40,  color: "#3b82f6" },
  { name: "Closed",            value: 40,  color: "#d1d5db" },
];

const recruiterPerformance = [
  { rank: "1st", name: "Sarah Jenkins", jobs: 12, hires: 8,  avgTime: "2 hrs"  },
  { rank: "2nd", name: "Michael Lee",   jobs: 8,  hires: 5,  avgTime: "5 hrs"  },
  { rank: "3rd", name: "Priya Sharma",  jobs: 15, hires: 3,  avgTime: "12 hrs" },
  { rank: "4th", name: "John Doe",      jobs: 4,  hires: 1,  avgTime: "24 hrs" },
  { rank: "5th", name: "David Chen",    jobs: 6,  hires: 4,  avgTime: "3 hrs"  },
  { rank: "6th", name: "Emily White",   jobs: 5,  hires: 2,  avgTime: "8 hrs"  },
];

const roleWiseDemand = [
  { role: "ER Nurse",       openings: 12, applicants: 4,  openingPct: 80,  applicantPct: 27  },
  { role: "Cardiologist",   openings: 3,  applicants: 45, openingPct: 20,  applicantPct: 100 },
  { role: "Lab Technician", openings: 5,  applicants: 8,  openingPct: 33,  applicantPct: 53  },
];

export const BottomWidgets = () => (
  <div className="flex flex-col gap-4">

    {/* ── Row 1: Role-Wise + Recruiter Performance ── */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

      {/* Role-Wise Hiring Demand */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Role-Wise Hiring Demand</h2>
        <div className="flex flex-col gap-5">
          {roleWiseDemand.map((r) => (
            <div key={r.role} className="flex flex-col gap-1">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span className="font-medium text-gray-700">{r.role}</span>
                <span>
                  Opening: <span className="font-semibold text-gray-800">{String(r.openings).padStart(2, "0")}</span>
                  &nbsp;&nbsp; Applicants: <span className="font-semibold text-gray-800">{String(r.applicants).padStart(2, "0")}</span>
                </span>
              </div>
              {/* Opening bar (red) */}
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div className="h-full bg-red-400 rounded-full" style={{ width: `${r.openingPct}%` }} />
              </div>
              {/* Applicant bar (green) */}
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${r.applicantPct}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-start gap-2 pt-3 border-t border-gray-100">
          <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Roles With Zero Applicants</p>
            <p className="text-xs text-orange-500">• Radiologist</p>
            <p className="text-xs text-orange-500">• Senior Pediatrician</p>
          </div>
        </div>
      </div>

      {/* Recruiter Performance */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Recruiter Performance</h2>
          <select className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600">
            <option>Most Hires</option>
          </select>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 text-xs border-b border-gray-100">
              <th className="pb-3 text-left font-medium">Rank</th>
              <th className="pb-3 text-left font-medium">Recruiter</th>
              <th className="pb-3 text-center font-medium">Jobs</th>
              <th className="pb-3 text-center font-medium">Hires</th>
              <th className="pb-3 text-right font-medium">Avg. Time</th>
            </tr>
          </thead>
          <tbody>
            {recruiterPerformance.map((r) => (
              <tr key={r.rank} className="border-b border-gray-50 last:border-0">
                <td className="py-2.5 text-sm font-medium text-gray-700">{r.rank}</td>
                <td className="py-2.5 text-sm text-gray-700">{r.name}</td>
                <td className="py-2.5 text-sm text-center text-gray-700">{String(r.jobs).padStart(2, "0")}</td>
                <td className="py-2.5 text-sm text-center text-gray-700">{String(r.hires).padStart(2, "0")}</td>
                <td className="py-2.5 text-sm text-right text-gray-700">{r.avgTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    {/* ── Row 2: Job Status + Compliance + Download ── */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

      {/* Job Status Overview */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Job status Overview</h2>
        <div className="flex items-center gap-4">
          <div className="relative w-[120px] h-[120px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={jobStatusData} innerRadius={35} outerRadius={55} dataKey="value" paddingAngle={2}>
                  {jobStatusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-lg font-bold text-gray-800">145</span>
              <span className="text-[10px] text-gray-400">Total</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {jobStatusData.map((d) => (
              <div key={d.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                <span className="text-xs text-gray-600">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Compliance & Verification */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Compliance & Verification</h2>
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500 shrink-0" />
            <span className="text-sm text-gray-700">1240 Verified</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-400 shrink-0" />
            <span className="text-sm text-gray-700">45 Pending Review</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 shrink-0" />
            <span className="text-sm text-gray-700">12 Failed</span>
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-xs font-semibold text-yellow-700 mb-2 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Most Missing Documents
          </p>
          <p className="text-xs text-yellow-700">1. Nursing License (65%)</p>
          <p className="text-xs text-yellow-700">2. Degree Certificate (20%)</p>
          <p className="text-xs text-yellow-700">3. Aadhar Card (15%)</p>
        </div>
      </div>

      {/* Download Reports */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Download Reports</h2>
        <div className="flex flex-col gap-3">
          {[
            "Export Hiring Report (PDF/CSV)",
            "Export Recruiter Performance",
            "Export Job-wise Pipeline",
            "Export Verification Report",
          ].map((label) => (
            <button
              key={label}
              className="text-sm text-orange-500 hover:text-orange-600 hover:underline text-left transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

    </div>
  </div>
);
