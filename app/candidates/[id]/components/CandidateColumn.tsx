"use client";
import { BoardCandidateCard } from "./BoardCandidateCard";
import { CandidateListItem } from "@/stores/api/recruiter-job-api";

type AccentColor = "orange" | "green" | "red" | "neutral";
type ActionType  = "shortlist" | "hire" | "schedule" | "invite";

interface Props {
  title: string;
  count: number;
  accentColor: AccentColor;
  dotColor: string;
  candidates: CandidateListItem[];
  actionType: ActionType;
  leftTags?: string[];
  rightTags?: string[];
  onViewAll?: () => void;   // ← NEW: callback instead of Link
  hideHeader?: boolean;     // ← NEW: hide column header when used in expanded grid
  hideViewAll?: boolean;    // ← NEW: hide view all footer
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
  leftTags, rightTags, onViewAll, hideHeader, hideViewAll,
}: Props) => {
  const s = colStyles[accentColor];

  return (
    <div className={`rounded-2xl border-2 ${s.wrapper} flex flex-col overflow-hidden`}>
      {/* Header */}
      {!hideHeader && (
        <div className={`${s.headerBg} px-4 py-3.5 flex items-center justify-center gap-2`}>
          <span className={`w-2.5 h-2.5 rounded-full ${s.dot} shrink-0`} />
          <h2 className="text-sm font-bold text-gray-900">{title}</h2>
          <span className="text-xs font-medium text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-full">
            {count}
          </span>
        </div>
      )}

      {/* Cards */}
      <div className="flex flex-col gap-3 p-3">
        {candidates.length === 0 ? (
          <div className="text-center py-8 text-xs text-gray-400">No candidates</div>
        ) : (
          candidates.map((c, i) => (
            <BoardCandidateCard
              key={c.id ?? i}
              c={c}
              actionType={actionType}
              leftTag={leftTags?.[i]}
              rightTag={rightTags?.[i]}
            />
          ))
        )}
      </div>

      {/* View All */}
      {!hideViewAll && (
        <div className="px-4 pb-4 pt-1">
          <button
            onClick={onViewAll}
            className={`block w-full text-xs font-semibold text-center ${s.viewAll} hover:underline`}
          >
            View all
          </button>
        </div>
      )}
    </div>
  );
};