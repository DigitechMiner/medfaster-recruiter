'use client';

import React, { useState } from "react";
import { ViewHeader }      from "@/components/candidate/ViewHeader";

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
    status === "Active"    ? "bg-[#079455] text-white"      :
    status === "Completed" ? "bg-[#FEDF89] text-[#4E1D09]" :
    status === "Upcoming"  ? "bg-[#C36016] text-white"      :
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

// ── PaginationBar — fully controlled, page state lives in the parent ──────────
export function PaginationBar({
  total,
  page,
  perPage = 10,
  onPageChange,
}: {
  total:        number;
  page:         number;
  perPage?:     number;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const pages: (number | "...")[] = [];
  if (totalPages <= 6) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1, 2, 3, "...", totalPages - 2, totalPages - 1, totalPages);
  }

  const start = total === 0 ? 0 : (page - 1) * perPage + 1;
  const end   = Math.min(page * perPage, total);

  return (
    <div className="flex items-center justify-between flex-wrap gap-3 px-4 py-3 bg-orange-50/40 border-t border-orange-100 rounded-b-2xl">
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
      >
        ← Previous
      </button>

      <div className="flex items-center gap-1">
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={i} className="px-2 text-gray-400 text-[12px]">...</span>
          ) : (
            <button
              key={i}
              onClick={() => onPageChange(p as number)}
              className={`w-7 h-7 rounded-lg text-[12px] font-medium transition-colors ${
                page === p ? "bg-[#F4781B] text-white" : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {p}
            </button>
          )
        )}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-[12px] text-gray-500">
          Showing <b>{start}</b>–<b>{end}</b> of <b>{total}</b>
        </span>
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

export const SectionHeader = ({
  title, dotColor, count, view, onViewToggle, rightSlot,
}: {
  title:        string;
  dotColor:     string;
  count:        number;
  view:         "grid" | "list";
  onViewToggle: (v: "grid" | "list") => void;
  rightSlot?:   React.ReactNode;
}) => (
  <div className="flex items-center justify-between mb-1">
    <div className="flex items-center gap-2">
      <span className={`w-2.5 h-2.5 rounded-full ${dotColor} shrink-0`} />
      <h3 className="text-sm font-bold text-gray-900">{title}</h3>
      <span className="text-xs text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-full">
        {count}
      </span>
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
  view:    "grid" | "list";
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