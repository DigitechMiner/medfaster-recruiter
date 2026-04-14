"use client";

import { ColumnShell } from "@/components/candidate/ColumnShell";
import { renderCandidateCards } from "@/components/candidate/renderers";
import type { Candidate, ColConfig } from "./config";
import { CandidateCard } from "./CandidateCard";
import { AIRecommendationsPanel, KanbanPagination } from "./partials";

interface ColProps {
  col:          ColConfig;
  candidates:   Candidate[];
  isExpanded:   boolean;
  perPage:      number;
  onToggle:     () => void;
  showAIPanel:  boolean;
  aiCandidates: Candidate[];
}

export function KanbanColumn({
  col,
  candidates,
  isExpanded,
  perPage,
  onToggle,
  showAIPanel,
  aiCandidates,
}: ColProps) {
  const gridCols = isExpanded
    ? col.key === 'applied' ? 'grid-cols-3' : 'grid-cols-3'
    : 'grid-cols-1';

  return (
    <ColumnShell
      wrapperClassName={`flex gap-3 flex-shrink-0 transition-all duration-300 ${isExpanded ? 'flex-1 min-w-0' : 'w-[280px]'}`}
      containerClassName={`flex-1 rounded-2xl border-2 p-3 flex flex-col gap-3 ${col.border} ${col.bg}`}
      header={
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
      }
      content={
        <div className={`grid ${gridCols} gap-2`}>
          {renderCandidateCards(candidates, (c) => (
            <CandidateCard key={c.id} candidate={c} colKey={col.key} />
          ))}
        </div>
      }
      footer={isExpanded ? <KanbanPagination total={col.count} perPage={perPage} /> : undefined}
      sideContent={showAIPanel ? <AIRecommendationsPanel candidates={aiCandidates} /> : undefined}
    />
  );
}
