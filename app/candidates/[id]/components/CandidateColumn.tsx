'use client';

import { BoardCandidateCard } from "./BoardCandidateCard";
import type { CandidateCardVM } from '@/Interface/view-models';
import { ColumnShell } from "@/components/candidate/ColumnShell";
import { renderCandidateCards } from "@/components/candidate/renderers";
// ✅ Import section-specific mock data
import { MOCK_POOL_BY_SECTION, MOCK_AI_POOL } from "@/app/candidates/data/candidatePoolMocks";

// ── Mock toggle — flip to false when API is wired ─────────────────────────
export const USE_MOCK = true; // ← exported so CandidatesBoard can read it

type AccentColor = "orange" | "green" | "red" | "neutral";
type ActionType  = "shortlist" | "hire" | "schedule" | "invite";

interface Props {
  title:        string;
  count:        number;
  accentColor:  AccentColor;
  dotColor:     string;
  candidates:   CandidateCardVM[];
  actionType:   ActionType;
  leftTags?:    string[];
  rightTags?:   string[];
  onViewAll?:   () => void;
  hideHeader?:  boolean;
  hideViewAll?: boolean;
  search?:      string;
}

const colStyles: Record<AccentColor, {
  wrapper: string; headerBg: string; dot: string; viewAll: string; countPill: string;
}> = {
  orange:  { wrapper: "border-[#F4A300] bg-[#FFF9F0]", headerBg: "bg-[#FFF9F0]", dot: "bg-[#F59E0B]", viewAll: "text-[#F4A300]", countPill: "text-gray-400" },
  neutral: { wrapper: "border-[#92400E] bg-[#FFF5EE]", headerBg: "bg-[#FFF5EE]", dot: "bg-[#92400E]", viewAll: "text-[#92400E]", countPill: "text-gray-400" },
  green:   { wrapper: "border-[#22C55E] bg-[#F0FFF8]", headerBg: "bg-[#F0FFF8]", dot: "bg-[#22C55E]", viewAll: "text-[#16A34A]", countPill: "text-gray-400" },
  red:     { wrapper: "border-[#EF4444] bg-[#FFF5F5]", headerBg: "bg-[#FFF5F5]", dot: "bg-[#EF4444]", viewAll: "text-[#EF4444]", countPill: "text-gray-400" },
};

export const CandidateColumn = ({
  title, count, accentColor, candidates, actionType,
  leftTags, rightTags, onViewAll, hideHeader, hideViewAll, search = "",
}: Props) => {
  const s = colStyles[accentColor];

  // ✅ Each section gets its own 3 distinct mock candidates
  const source = USE_MOCK
    ? (MOCK_POOL_BY_SECTION[title] ?? MOCK_AI_POOL)
    : candidates;

  const filtered = search
    ? source.filter((c) =>
        `${c.full_name} ${c.designation} ${c.department}`
          .toLowerCase()
          .includes(search.toLowerCase())
      )
    : source;

  const displayCount = USE_MOCK ? filtered.length : count;

  return (
    <ColumnShell
      containerClassName={`rounded-2xl border-2 ${s.wrapper} flex flex-col overflow-hidden`}
      header={!hideHeader ? (
        <div className={`${s.headerBg} px-4 py-3.5 flex items-center justify-center gap-2`}>
          <span className={`w-2.5 h-2.5 rounded-full ${s.dot} shrink-0`} />
          <h2 className="text-sm font-bold text-gray-900">{title}</h2>
          <span className="text-xs font-medium text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-full">{displayCount}</span>
        </div>
      ) : undefined}
      content={
        <div className="flex flex-col gap-3 p-3">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-400">No candidates</div>
          ) : (
            renderCandidateCards(filtered, (c, i) => (
              <BoardCandidateCard
                key={c.id}
                c={c}
                actionType={actionType}
                leftTag={leftTags?.[i % (leftTags?.length ?? 1)]}
                rightTag={rightTags?.[i % (rightTags?.length ?? 1)]}
              />
            ))
          )}
        </div>
      }
      footer={!hideViewAll ? (
        <div className="px-4 pb-4 pt-1">
          <button onClick={onViewAll} className={`block w-full text-xs font-semibold text-center ${s.viewAll} hover:underline`}>
            View all
          </button>
        </div>
      ) : undefined}
    />
  );
};