"use client";

import Image from "next/image";
import ScoreCard from "@/components/card/scorecard";
import { BaseCard, CardHeader, CardIdentity, CardStats } from "@/components/candidate/BaseCard";
import type { Candidate, ColKey } from "./config";

export function CandidateCard({ candidate: c, colKey }: { candidate: Candidate; colKey: ColKey }) {
  return (
    <BaseCard
      className="bg-white rounded-2xl border border-gray-100 p-2 flex flex-col gap-2"
      style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}
    >
      <CardHeader className="flex items-center justify-between">
        <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          Online
        </span>
        <ScoreCard score={c.score} maxScore={100} category="good" />
      </CardHeader>

      <CardIdentity className="flex items-center gap-2">
        <div className="relative w-12 h-12 rounded-xl bg-orange-50 flex-shrink-0 overflow-hidden border border-orange-100">
          {c.avatar
            ? <Image src={c.avatar} alt={c.name} fill className="object-cover" />
            : <span className="w-full h-full flex items-center justify-center text-orange-300 text-xl">👤</span>
          }
        </div>
        <div>
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold text-gray-900 leading-tight">{c.name}</span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#22c55e">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <span className="text-xs font-medium text-[#F4781B]">{c.role}</span>
        </div>
      </CardIdentity>

      <CardStats className="flex items-center gap-2 text-xs text-gray-500">
        <span className="flex items-center gap-0.5">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
          {c.exp}
        </span>
        <span className="text-gray-300">|</span>
        <span className="flex items-center gap-0.5">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          {c.distance}
        </span>
        <span className="text-gray-300">|</span>
        <span className="flex items-center gap-0.5">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="#fbbf24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          {c.rating}/5
        </span>
      </CardStats>

      <CardActions colKey={colKey} />
    </BaseCard>
  );
}

function CardActions({ colKey }: { colKey: ColKey }) {
  switch (colKey) {
    case 'applied':
      return (
        <div className="flex gap-1.5 mt-0.5">
          <button className="flex-1 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Shortlist
          </button>
          <button className="flex-1 py-2 rounded-xl bg-[#F4781B] text-white text-xs font-semibold hover:bg-[#e06a10] transition-colors">
            Direct Hire
          </button>
        </div>
      );
    case 'shortlisted':
      return (
        <div className="flex gap-1.5 mt-0.5">
          <button className="flex-1 py-2 rounded-xl border border-red-300 bg-red-50 text-xs font-medium text-red-500 hover:bg-red-100 transition-colors">
            Remove
          </button>
          <button className="flex-1 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Request Interview
          </button>
        </div>
      );
    case 'ai_interviewing':
      return (
        <button className="w-full py-2 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors mt-0.5">
          Abort Interview
        </button>
      );
    case 'interviewed':
      return (
        <div className="flex gap-1.5 mt-0.5">
          <button className="flex-1 py-2 rounded-xl border border-red-300 bg-red-50 text-xs font-medium text-red-500 hover:bg-red-100 transition-colors">
            Reject
          </button>
          <button className="flex-1 py-2 rounded-xl bg-[#F4781B] text-white text-xs font-semibold hover:bg-[#e06a10] transition-colors">
            Hire Now
          </button>
        </div>
      );
    case 'hired':
      return (
        <button className="w-full py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors mt-0.5">
          View Schedule
        </button>
      );
  }
}
