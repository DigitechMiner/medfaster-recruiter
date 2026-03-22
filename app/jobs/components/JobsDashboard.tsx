"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
} from "recharts";
import { ArrowRight } from "lucide-react";
import type { JobsListResponse } from "@/Interface/job.types";

type JobListItem = JobsListResponse["data"]["jobs"][0];

interface JobsDashboardProps {
  jobs: JobListItem[];
}

const radarData = [
  { subject: "Active Openings",        Benchmark: 60, Canada: 82 },
  { subject: "Rejections",             Benchmark: 40, Canada: 55 },
  { subject: "Interviewing Scheduled", Benchmark: 50, Canada: 70 },
  { subject: "Urgent Staffings",       Benchmark: 45, Canada: 60 },
  { subject: "Position Filled",        Benchmark: 55, Canada: 75 },
  { subject: "Closed Jobs",            Benchmark: 35, Canada: 40 },
];

// Icons as SVG inline — matching Figma
const BriefcaseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F4781B" strokeWidth="2">
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
  </svg>
);

const PeopleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F4781B" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const TrashIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F4781B" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
);

const LayersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F4781B" strokeWidth="2">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

export const JobsDashboard: React.FC<JobsDashboardProps> = ({ jobs }) => {
  const router = useRouter();

  const total  = jobs.length;
  const active = jobs.filter((j) => j.status === "OPEN").length;
  const closed = jobs.filter((j) => j.status === "CLOSED").length;
  const filled = jobs.filter((j) => j.status === "PAUSED").length;

  // Category counts
  const countByKeyword = (keywords: string[]) =>
    jobs.filter((j) =>
      keywords.some((kw) =>
        `${j.job_title} ${j.department ?? ""}`.toLowerCase().includes(kw)
      )
    ).length;

  const lpnCount = countByKeyword(["lpn", "licensed practical"]);
  const hcaCount = countByKeyword(["hca", "health care assistant"]);
  const rnCount  = countByKeyword(["rn", "registered nurse"]);

  const statCards = [
    {
      label: "Total Jobs Created",
      value: total,
      change: "-0.10%",
      up: false,
      href: "/jobs/all",
      icon: <BriefcaseIcon />,
      isFirst: true,
    },
    {
      label: "Active Job Openings",
      value: active,
      change: "+1.10%",
      up: true,
      href: "/jobs/active",
      icon: <PeopleIcon />,
      isFirst: false,
    },
    {
      label: "Closed Jobs",
      value: closed,
      change: "+1.10%",
      up: true,
      href: "/jobs/all",
      icon: <TrashIcon />,
      isFirst: false,
    },
    {
      label: "Positions Filled",
      value: filled,
      change: "+2.10%",
      up: false,
      href: "/jobs/all",
      icon: <LayersIcon />,
      isFirst: false,
    },
  ];

  return (
    <div className="flex flex-col gap-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
        <button
          onClick={() => router.push("/jobs/all")}
          className="flex items-center gap-2 bg-[#F4781B] hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors"
        >
          View Jobs <ArrowRight size={16} />
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <button
            key={card.label}
            onClick={() => router.push(card.href)}
            className={`bg-white rounded-2xl p-5 text-left transition-all hover:shadow-md border-2 ${
              card.isFirst ? "border-[#F4781B]" : "border-transparent hover:border-orange-200"
            }`}
            style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
          >
            {/* Top row: label + icon */}
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500 font-medium">{card.label}</p>
              <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                {card.icon}
              </div>
            </div>

            {/* Big number */}
            <p className="text-4xl font-bold text-gray-900 mb-4">{card.value}</p>

            {/* Since last week */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Since last week</span>
              <span className={`text-xs font-semibold flex items-center gap-0.5 ${card.up ? "text-green-500" : "text-red-500"}`}>
                {card.change}
                <span className="text-sm">{card.up ? "↑" : "↓"}</span>
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* ── Radar Chart Card ── */}
      <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-gray-900">Based On Job Categories</h2>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-gray-300 inline-block" />
              Benchmark
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#F4781B] inline-block" />
              Canada
            </span>
          </div>
        </div>

        {/* Radar */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="72%">
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fontSize: 12, fill: "#9ca3af" }}
              />
              <Radar
                name="Benchmark"
                dataKey="Benchmark"
                stroke="#e5e7eb"
                fill="#e5e7eb"
                fillOpacity={0.5}
              />
              <Radar
                name="Canada"
                dataKey="Canada"
                stroke="#F4781B"
                fill="#F4781B"
                fillOpacity={0.35}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* ── Bottom 3 category stat boxes ── */}
        <div className="grid grid-cols-3 gap-4 mt-2">

          {/* LPN — orange number */}
          <div className="bg-orange-50 rounded-2xl px-6 py-5 text-center">
            <p className="text-xs text-gray-500 mb-3 leading-snug">
              Total Licensed Practical Jobs Created
            </p>
            <p className="text-4xl font-bold text-[#F4781B]">{lpnCount}</p>
          </div>

          {/* HCA — black bold number */}
          <div className="bg-gray-50 rounded-2xl px-6 py-5 text-center">
            <p className="text-xs text-gray-500 mb-3 leading-snug">
              Total Health Care Assistant Jobs Created
            </p>
            <p className="text-4xl font-extrabold text-gray-900">{hcaCount}</p>
          </div>

          {/* RN — green number */}
          <div className="bg-green-50 rounded-2xl px-6 py-5 text-center">
            <p className="text-xs text-gray-500 mb-3 leading-snug">
              Total Registered Nurse Jobs Created
            </p>
            <p className="text-4xl font-bold text-green-600">{rnCount}</p>
          </div>

        </div>
      </div>

    </div>
  );
};
