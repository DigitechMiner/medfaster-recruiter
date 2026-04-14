"use client";

import React from "react";
import { ViewHeader } from "@/components/candidate/ViewHeader";

export const JobTypePill = ({ type }: { type: string }) =>
  type === "Urgent" ? (
    <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-600 border border-orange-200">
      {type}
    </span>
  ) : (
    <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-green-100 text-green-600 border border-green-200">
      {type}
    </span>
  );

export const StatusPill = ({ status }: { status: string }) => {
  const s =
    status === "Active"    ? "bg-[#079455] text-white" :
    status === "Completed" ? "bg-[#FEDF89] text-[#4E1D09]" :
    status === "Upcoming"  ? "bg-[#C36016] text-white" :
    "bg-gray-100 text-gray-500";
  return (
    <span className={`inline-flex items-center text-[11px] font-semibold px-3 py-1 rounded-full ${s}`}>
      {status}
    </span>
  );
};

export const CandidateTypePill = ({ type }: { type: string }) =>
  type === "In-House" ? (
    <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-600 border border-sky-200">
      {type}
    </span>
  ) : (
    <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200">
      {type}
    </span>
  );

export const MetricCard = ({
  icon, title, value, change, isPositive, onClick, isActive,
}: {
  icon: React.ReactNode; title: string; value: string | number;
  change: string; isPositive: boolean;
  onClick?: () => void; isActive?: boolean;
}) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-xl p-4 border shadow-sm flex flex-col gap-2 transition-all
      ${onClick ? "cursor-pointer hover:shadow-md hover:border-orange-200" : ""}
      ${isActive ? "border-orange-400 ring-2 ring-orange-100" : "border-gray-100"}`}
  >
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-500 font-medium">{title}</span>
      <span className="text-orange-400">{icon}</span>
    </div>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-400">Since last week</span>
      <span className={`text-xs font-semibold ${isPositive ? "text-green-500" : "text-red-400"}`}>
        {change} {isPositive ? "↑" : "↓"}
      </span>
    </div>
  </div>
);

export const PaginationBar = ({ total }: { total: number }) => (
  <div className="flex items-center justify-between flex-wrap gap-3 pt-3 border-t border-gray-100 mt-3">
    <div className="flex items-center gap-1">
      <button className="flex items-center gap-1 border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50 transition-colors">
        ← Previous
      </button>
      {[1, 2, 3].map((p) => (
        <button key={p} className={`w-8 h-8 rounded-xl text-xs font-semibold transition-colors
          ${p === 1 ? "bg-orange-500 text-white" : "text-gray-500 hover:bg-gray-50"}`}>{p}</button>
      ))}
      <span className="text-xs text-gray-400 px-1">...</span>
      {[8, 9, 10].map((p) => (
        <button key={p} className="w-8 h-8 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-50 transition-colors">{p}</button>
      ))}
      <button className="flex items-center gap-1 border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50 transition-colors">
        Next →
      </button>
    </div>
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500">Showing <strong>1–{Math.min(10, total)}</strong> of <strong>{total}</strong> Jobs</span>
      <select className="border border-gray-200 rounded-xl px-2 py-1.5 text-xs text-gray-600 outline-none">
        <option>10 per page</option>
        <option>20 per page</option>
        <option>50 per page</option>
      </select>
    </div>
  </div>
);

export const SectionHeader = ({
  title,
  dotColor,
  count,
  view,
  onViewToggle,
  rightSlot,
}: {
  title: string;
  dotColor: string;
  count: number;
  view: "grid" | "list";
  onViewToggle: (v: "grid" | "list") => void;
  rightSlot?: React.ReactNode;
}) => (
  <div className="flex items-center justify-between mb-1">
    <div className="flex items-center gap-2">
      <span className={`w-2.5 h-2.5 rounded-full ${dotColor} shrink-0`} />
      <h3 className="text-sm font-bold text-gray-900">{title}</h3>
      <span className="text-xs text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-full">{count}</span>
    </div>
    <ViewHeader
      wrapperClassName="flex items-center gap-2"
      filterButtonClassName="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      toggleWrapperClassName="flex bg-white border border-gray-200 rounded-xl overflow-hidden"
      gridButtonClassName={`p-2 transition-colors ${view === "grid" ? "bg-orange-50 text-[#F4781B]" : "text-gray-400 hover:bg-gray-50"}`}
      listButtonClassName={`p-2 transition-colors ${view === "list" ? "bg-orange-50 text-[#F4781B]" : "text-gray-400 hover:bg-gray-50"}`}
      filterSize={13}
      gridSize={14}
      listSize={14}
      leftSlot={rightSlot}
      rightSlot={null}
      onGrid={() => onViewToggle("grid")}
      onList={() => onViewToggle("list")}
    />
  </div>
);

export function MainViewHeader({
  view,
  setView,
}: {
  view: "grid" | "list";
  setView: (view: "grid" | "list") => void;
}) {
  return (
    <ViewHeader
      wrapperClassName="flex items-center gap-3"
      filterButtonClassName="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap"
      toggleWrapperClassName="flex bg-white border border-gray-200 rounded-xl overflow-hidden"
      gridButtonClassName={`p-2.5 transition-colors ${view === "grid" ? "bg-orange-50 text-[#F4781B]" : "text-gray-400 hover:bg-gray-50"}`}
      listButtonClassName={`p-2.5 transition-colors ${view === "list" ? "bg-orange-50 text-[#F4781B]" : "text-gray-400 hover:bg-gray-50"}`}
      filterSize={16}
      gridSize={16}
      listSize={16}
      onGrid={() => setView("grid")}
      onList={() => setView("list")}
    />
  );
}
