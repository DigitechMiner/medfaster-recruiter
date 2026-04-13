"use client";

import React, { useState } from "react";
import { LayoutGrid, List, Filter } from "lucide-react";
import ScoreCard from "@/components/card/scorecard";
import type { JobBackendResponse } from "@/Interface/job.types";
import Image from "next/image";

// ── Types ──────────────────────────────────────────────────────
interface Candidate {
  id: string;
  name: string;
  role: string;
  exp: string;
  distance: string;
  rating: number;
  score: number;
  online: boolean;
  avatar: string;
}

const DUMMY_CANDIDATES: Candidate[] = Array.from({ length: 12 }, (_, i) => ({
  id: String(i + 1),
  name: 'Michael Liam',
  role: 'Registered Nurse',
  exp: '5+ yrs',
  distance: '25km',
  rating: 4.8,
  score: 40,
  online: true,
  avatar: '/icon/card-doctor.svg',
}));

// ── Column config ──────────────────────────────────────────────
type ColKey = 'applied' | 'shortlisted' | 'ai_interviewing' | 'interviewed' | 'hired';

interface ColConfig {
  key:       ColKey;
  label:     string;
  count:     number;
  dotColor:  string;
  border:    string;
  bg:        string;
  textColor: string;
  aiOnly?:   boolean;
}

const COLUMNS: ColConfig[] = [
  { key: 'applied',         label: 'Applied',               count: 40, dotColor: 'bg-blue-500',   border: 'border-blue-300',   bg: 'bg-blue-50/60',   textColor: 'text-blue-600' },
  { key: 'shortlisted',     label: 'Shortlisted',           count: 20, dotColor: 'bg-orange-400', border: 'border-orange-300', bg: 'bg-orange-50/60', textColor: 'text-orange-500' },
  { key: 'ai_interviewing', label: 'AI-Interviewing',       count: 5,  dotColor: 'bg-red-400',    border: 'border-red-300',    bg: 'bg-red-50/60',    textColor: 'text-red-500', aiOnly: true },
  { key: 'interviewed',     label: 'Interviewed',           count: 6,  dotColor: 'bg-red-500',    border: 'border-red-400',    bg: 'bg-red-50/40',    textColor: 'text-red-500' },
  { key: 'hired',           label: 'Hired',                 count: 2,  dotColor: 'bg-green-500',  border: 'border-green-300',  bg: 'bg-green-50/60',  textColor: 'text-green-600' },
];

// ── Props ──────────────────────────────────────────────────────
interface Props {
  job:   JobBackendResponse;
  jobId: string;
  hasAI: boolean;
  noOfHires: number;
}

// ── Main Component ─────────────────────────────────────────────
export const CandidatesKanbanView: React.FC<Props> = ({ hasAI, noOfHires }) => {
  // Which column is "expanded" (View Less mode, grid inside)
  const [expanded, setExpanded]   = useState<ColKey | null>(null);
  const [viewMode, setViewMode]   = useState<'kanban' | 'list'>('kanban');

  const visibleCols = COLUMNS.filter(c => !c.aiOnly || hasAI);
  const hiredCount  = COLUMNS.find(c => c.key === 'hired')!.count;
  const hiringDone  = hiredCount >= noOfHires;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* ── Hiring Completed Banner ─────────────────────────── */}
      {hiringDone && (
        <div className="px-5 pt-5">
          <HiringCompletedBanner count={noOfHires} />
        </div>
      )}

      {/* ── Filter + View toggle row ─────────────────────────── */}
      <div className="flex items-center justify-end gap-2 px-5 pt-4 pb-3">
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
          <Filter size={14} />
          Filter
        </button>
        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('kanban')}
            className={`p-1.5 transition-colors ${viewMode === 'kanban' ? 'bg-gray-100 text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 transition-colors ${viewMode === 'list' ? 'bg-gray-100 text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* ── Kanban columns ───────────────────────────────────── */}
      <div className="px-4 pb-4">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {visibleCols.map((col) => {
            const isExpanded = expanded === col.key;
            const candidates = DUMMY_CANDIDATES.slice(0, isExpanded ? col.count : 3);
            const perPage = col.key === 'applied' ? 12 : 9;

            return (
              <KanbanColumn
                key={col.key}
                col={col}
                candidates={candidates}
                isExpanded={isExpanded}
                perPage={perPage}
                onToggle={() => setExpanded(isExpanded ? null : col.key)}
                showAIPanel={col.key === 'applied' && isExpanded}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ── Kanban Column ──────────────────────────────────────────────
interface ColProps {
  col:          ColConfig;
  candidates:   Candidate[];
  isExpanded:   boolean;
  perPage:      number;
  onToggle:     () => void;
  showAIPanel:  boolean;
}

function KanbanColumn({ col, candidates, isExpanded, perPage, onToggle, showAIPanel }: ColProps) {
  const gridCols = isExpanded
    ? col.key === 'applied' ? 'grid-cols-3' : 'grid-cols-3'
    : 'grid-cols-1';

  return (
    <div className={`flex gap-3 flex-shrink-0 transition-all duration-300 ${isExpanded ? 'flex-1 min-w-0' : 'w-[280px]'}`}>
      {/* Main column */}
      <div className={`flex-1 rounded-2xl border-2 p-3 flex flex-col gap-3 ${col.border} ${col.bg}`}>
        {/* Column header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {col.key === 'ai_interviewing' ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#ef4444">
                <path d="M12 2l1.09 3.26L16 6l-2.91.74L12 10l-1.09-3.26L8 6l2.91-.74L12 2zm6 10l.73 2.18L21 15l-2.27.82L18 18l-.73-2.18L15 15l2.27-.82L18 12zm-12 0l.73 2.18L9 15l-2.27.82L6 18l-.73-2.18L3 15l2.27-.82L6 12z"/>
              </svg>
            ) : (
              <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
            )}
            <span className={`text-sm font-bold ${col.textColor} ${col.key === 'ai_interviewing' ? 'italic' : ''}`}>
              {col.key === 'ai_interviewing' ? <><em>AI-Interviewing</em></> : col.label}
            </span>
            <span className="text-sm text-gray-500">{col.count}</span>
          </div>
          <button
            onClick={onToggle}
            className={`text-xs font-semibold ${col.textColor} hover:underline`}
          >
            {isExpanded ? 'View Less' : 'View all'}
          </button>
        </div>

        {/* Cards grid */}
        <div className={`grid ${gridCols} gap-2`}>
          {candidates.map((c) => (
            <CandidateCard key={c.id} candidate={c} colKey={col.key} />
          ))}
        </div>

        {/* Pagination (only when expanded) */}
        {isExpanded && (
          <KanbanPagination total={col.count} perPage={perPage} />
        )}
      </div>

      {/* AI Recommendations side panel (Applied expanded only) */}
      {showAIPanel && (
        <AIRecommendationsPanel candidates={DUMMY_CANDIDATES.slice(0, 5)} />
      )}
    </div>
  );
}

// ── Candidate Card ─────────────────────────────────────────────
function CandidateCard({ candidate: c, colKey }: { candidate: Candidate; colKey: ColKey }) {
  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 p-2 flex flex-col gap-2"
      style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}
    >
      {/* Row 1: Online + Score */}
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          Online
        </span>
        <ScoreCard score={c.score} maxScore={100} category="good" />
      </div>

      {/* Row 2: Avatar + Name/Role */}
      <div className="flex items-center gap-2">
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
      </div>

      {/* Row 3: Stats */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
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
      </div>

      {/* Row 4: Action buttons */}
      <CardActions colKey={colKey} />
    </div>
  );
}

// ── Card Actions per column ────────────────────────────────────
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

// ── Kanban Pagination ──────────────────────────────────────────
function KanbanPagination({ total, perPage }: { total: number; perPage: number }) {
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

// ── Top 5 AI Recommendations Panel ────────────────────────────
function AIRecommendationsPanel({ candidates }: { candidates: Candidate[] }) {
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

// ── Hiring Completed Banner ────────────────────────────────────
function HiringCompletedBanner({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-100 mb-2">
      {/* Concentric circles icon */}
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