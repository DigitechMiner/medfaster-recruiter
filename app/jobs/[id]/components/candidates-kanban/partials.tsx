"use client";

import React from "react";
import { CandidateCard } from "./CandidateCard";
import type { Candidate } from "./config";

export function KanbanPagination({ total, perPage }: { total: number; perPage: number }) {
  return (
    <div className="flex items-center justify-between pt-2 border-t border-white/60 flex-wrap gap-2">
      <div className="flex items-center gap-1">
        <button className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 px-2 py-1 rounded-lg border border-gray-200 bg-white">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          Previous
        </button>
        <button className="w-7 h-7 rounded-lg bg-[#F4781B] text-white text-xs font-bold flex items-center justify-center">1</button>
        <button className="w-7 h-7 rounded-lg border border-gray-200 bg-white text-xs text-gray-600 flex items-center justify-center hover:bg-gray-50">2</button>
        <button className="w-7 h-7 rounded-lg border border-gray-200 bg-white text-xs text-gray-600 flex items-center justify-center hover:bg-gray-50">3</button>
        <span className="text-gray-400 text-xs px-0.5">...</span>
        <button className="w-7 h-7 rounded-lg border border-gray-200 bg-white text-xs text-gray-600 flex items-center justify-center hover:bg-gray-50">10</button>
        <button className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 px-2 py-1 rounded-lg border border-gray-200 bg-white">
          Next
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span>Showing <strong>1–{perPage}</strong> of <strong>{total}</strong> Jobs</span>
        <select className="border border-gray-200 rounded px-2 py-1 bg-white text-xs">
          <option>{perPage} per page</option>
          <option>6 per page</option>
        </select>
      </div>
    </div>
  );
}

export function AIRecommendationsPanel({ candidates }: { candidates: Candidate[] }) {
  return (
    <div className="w-[280px] flex-shrink-0 rounded-2xl border-2 border-orange-300 bg-orange-50/40 p-3 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#F4781B">
          <path d="M12 2l1.09 3.26L16 6l-2.91.74L12 10l-1.09-3.26L8 6l2.91-.74L12 2zm6 10l.73 2.18L21 15l-2.27.82L18 18l-.73-2.18L15 15l2.27-.82L18 12zm-12 0l.73 2.18L9 15l-2.27.82L6 18l-.73-2.18L3 15l2.27-.82L6 12z"/>
        </svg>
        <span className="text-sm font-bold text-gray-900 italic">Top 5 AI-Recommendations</span>
      </div>
      <div className="flex flex-col gap-2">
        {candidates.map((c) => (
          <CandidateCard key={c.id + '-ai'} candidate={c} colKey="applied" />
        ))}
      </div>
    </div>
  );
}

export function HiringCompletedBanner({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-100 mb-2">
      <div className="relative flex-shrink-0 w-14 h-14 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-green-100/60" />
        <div className="absolute inset-2 rounded-full bg-green-100" />
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="9 12 11 14 15 10"/>
        </svg>
      </div>
      <div>
        <p className="text-base font-bold text-gray-900">Hiring Completed</p>
        <p className="text-sm text-gray-500">{count} Required Candidates Have Been Hired !</p>
      </div>
    </div>
  );
}
