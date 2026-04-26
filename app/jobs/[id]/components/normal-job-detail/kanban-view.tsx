import React, { useState } from "react";
import Image from "next/image";
import ScoreCard from "@/components/card/scorecard";
import { useCandidatesList } from "@/hooks/useRecruiterData";
import { buildKanbanPages, getVisibleCountRange, TabKey, toCandidate } from "./shared";

const KANBAN_COLS = [
  { key: "applied", label: "Applied", dotColor: "bg-blue-500", border: "border-blue-200", bg: "bg-blue-50/50", textColor: "text-blue-600", aiOnly: false },
  { key: "shortlisted", label: "Shortlisted", dotColor: "bg-orange-400", border: "border-orange-200", bg: "bg-orange-50/50", textColor: "text-[#F4781B]", aiOnly: false },
  { key: "ai_interviewing", label: "AI-Interviewing", dotColor: "bg-red-400", border: "border-red-200", bg: "bg-red-50/40", textColor: "text-red-500", aiOnly: true },
  { key: "interviewed", label: "Interviewed", dotColor: "bg-amber-700", border: "border-amber-200", bg: "bg-amber-50/40", textColor: "text-amber-800", aiOnly: false },
  { key: "hired", label: "Hired", dotColor: "bg-green-500", border: "border-green-200", bg: "bg-green-50/50", textColor: "text-green-600", aiOnly: false },
] as const;

interface KanbanSectionProps {
  hasAI: boolean;
  jobId: string;
}

export function KanbanSection({ hasAI, jobId }: KanbanSectionProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [kanbanPage, setKanbanPage] = useState(1);
  const [kanbanLimit, setKanbanLimit] = useState(10);

  const visibleCols = KANBAN_COLS.filter((col) => !col.aiOnly || hasAI);

  const { data, isLoading } = useCandidatesList({
    page: kanbanPage,
    limit: kanbanLimit,
    job_id: jobId,
  });

  const totalCount = data?.data.pagination?.total ?? 0;
  const totalKanbanPages = Math.max(1, Math.ceil(totalCount / kanbanLimit));
  const candidates = (data?.data.candidates ?? []).map(toCandidate);
  const visibleRange = getVisibleCountRange(kanbanPage, kanbanLimit, totalCount);
  const pageButtons = buildKanbanPages(totalKanbanPages);

  return (
    <div className="flex flex-col">
      <div className="px-4 pt-2 pb-2 overflow-x-auto">
        <div className="flex gap-4 min-w-max">
          {visibleCols.map((col) => {
            const isExpanded = expanded === col.key;
            const shownCandidates = isLoading ? [] : candidates.slice(0, isExpanded ? 6 : 3);

            return (
              <div
                key={col.key}
                className={`rounded-2xl border-2 p-3 flex flex-col gap-3 transition-all duration-300 ${col.border} ${col.bg} ${isExpanded ? "w-[1200px]" : "w-[420px]"}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {col.key === "ai_interviewing" ? (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="#ef4444">
                        <path d="M12 2l1.09 3.26L16 6l-2.91.74L12 10l-1.09-3.26L8 6l2.91-.74L12 2zm6 10l.73 2.18L21 15l-2.27.82L18 18l-.73-2.18L15 15l2.27-.82L18 12zm-12 0l.73 2.18L9 15l-2.27.82L6 18l-.73-2.18L3 15l2.27-.82L6 12z" />
                      </svg>
                    ) : (
                      <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
                    )}
                    <span className={`text-sm font-bold ${col.textColor}`}>{col.label}</span>
                    <span className="text-sm text-gray-400 font-medium">
                      {col.key === "applied" && !isLoading ? totalCount : "—"}
                    </span>
                  </div>
                  <button
                    onClick={() => setExpanded(isExpanded ? null : col.key)}
                    className={`text-xs font-semibold ${col.textColor} hover:underline`}
                  >
                    {isExpanded ? "View Less" : "View all"}
                  </button>
                </div>

                {isLoading ? (
                  <div className="flex flex-col gap-2">
                    {[...Array(3)].map((_, index) => (
                      <div key={index} className="h-24 bg-white/60 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className={`grid gap-3 ${isExpanded ? "grid-cols-3" : "grid-cols-1"}`}>
                    {shownCandidates.map((candidate) => (
                      <KanbanCard key={candidate.id} candidate={candidate} colKey={col.key as TabKey} />
                    ))}
                    {shownCandidates.length === 0 && (
                      <p className="text-xs text-center text-gray-400 py-4">No candidates</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-[#FEF3E9] px-5 py-3 flex items-center justify-between flex-wrap gap-3 mt-2">
        <button
          onClick={() => setKanbanPage((current) => Math.max(1, current - 1))}
          disabled={kanbanPage === 1}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Previous
        </button>

        <div className="flex items-center gap-1">
          {pageButtons.map((pageNo) => (
            <button
              key={pageNo}
              onClick={() => setKanbanPage(pageNo)}
              className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${kanbanPage === pageNo ? "bg-[#F4781B] text-white" : "text-gray-500 hover:bg-white"}`}
            >
              {pageNo}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            Showing <strong>{visibleRange.start}–{visibleRange.end}</strong> of <strong>{totalCount}</strong> Candidates
          </span>
          <select
            value={kanbanLimit}
            onChange={(event) => {
              setKanbanLimit(Number(event.target.value));
              setKanbanPage(1);
            }}
            className="border border-gray-200 rounded-lg px-2 py-1 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-200"
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
          </select>
        </div>

        <button
          onClick={() => setKanbanPage((current) => Math.min(totalKanbanPages, current + 1))}
          disabled={kanbanPage === totalKanbanPages}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function KanbanActionButtons({ tab }: { tab: TabKey }) {
  switch (tab) {
    case "applied":
      return (
        <div className="flex gap-2">
          <button className="flex-1 py-2 rounded-xl border border-gray-200 text-xs text-gray-700 hover:bg-gray-50 font-medium">Shortlist</button>
          <button className="flex-1 py-2 rounded-xl bg-[#F4781B] text-white text-xs font-semibold hover:bg-[#e06a10]">Direct Hire</button>
        </div>
      );
    case "shortlisted":
      return (
        <div className="flex gap-2">
          <button className="flex-1 py-2 rounded-xl border border-red-300 text-red-500 text-xs hover:bg-red-50 font-medium">Remove</button>
          <button className="flex-1 py-2 rounded-xl border border-gray-200 text-xs text-gray-700 hover:bg-gray-50 font-medium">Request Interview</button>
        </div>
      );
    case "ai_interviewing":
      return <button className="w-full py-2 rounded-xl bg-red-500 text-white text-xs font-semibold hover:bg-red-600">Abort Interview</button>;
    case "interviewed":
      return (
        <div className="flex gap-2">
          <button className="flex-1 py-2 rounded-xl border border-red-300 text-red-500 text-xs hover:bg-red-50 font-medium">Reject</button>
          <button className="flex-1 py-2 rounded-xl bg-[#F4781B] text-white text-xs font-semibold hover:bg-[#e06a10]">Hire Now</button>
        </div>
      );
    case "hired":
      return <button className="w-full py-2 rounded-xl border border-gray-200 text-xs text-[#F4781B] font-semibold hover:bg-orange-50">View Schedule</button>;
    default:
      return null;
  }
}

function KanbanCard({
  candidate,
  colKey,
}: {
  candidate: ReturnType<typeof toCandidate>;
  colKey: TabKey;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 px-4 pb-2 flex flex-col gap-1 p-2" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
      <div className="flex items-center justify-between -mt-1">
        <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-1 py-px rounded-full border border-green-200 -mt-1">
          <span className={`w-1.5 h-1.5 rounded-full ${candidate.online ? "bg-green-500" : "bg-gray-400"}`} />
          {candidate.online ? "Online" : "Offline"}
        </span>
        <ScoreCard score={candidate.score} maxScore={100} category="good" />
      </div>

      <div className="flex items-center gap-3 -mt-3">
        <div className="relative w-12 h-12 rounded-xl bg-orange-50 flex-shrink-0 overflow-hidden border border-orange-100">
          <Image src={candidate.avatar} alt={candidate.name} fill className="object-cover" />
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold text-gray-900 leading-tight">{candidate.name}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#22c55e">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
          <span className="text-xs font-medium text-[#F4781B]">{candidate.role}</span>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
            <span className="flex items-center gap-0.5">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
              </svg>
              {candidate.exp}
            </span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-0.5">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {candidate.distance}
            </span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-0.5">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="#fbbf24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              {candidate.rating.toFixed(1)}/5
            </span>
          </div>
        </div>
      </div>

      <KanbanActionButtons tab={colKey} />
    </div>
  );
}
