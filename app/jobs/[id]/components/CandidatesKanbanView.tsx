"use client";

import React, { useState } from "react";
import type { JobBackendResponse } from "@/Interface/recruiter.types";
import { ViewHeader } from "@/components/candidate/ViewHeader";
import { renderCandidateCards } from "@/components/candidate/renderers";
import { COLUMNS, useCandidatesForKanban, ColKey } from "./candidates-kanban/config";
import { HiringCompletedBanner } from "./candidates-kanban/partials";
import { KanbanColumn } from "./candidates-kanban/KanbanColumn";

interface Props {
  job:       JobBackendResponse;
  jobId:     string;
  hasAI:     boolean;
  noOfHires: number;
}

export const CandidatesKanbanView: React.FC<Props> = ({ jobId, hasAI, noOfHires }) => {
  const [expanded, setExpanded] = useState<ColKey | null>(null);
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");

  // ✅ Real API — replaces DUMMY_CANDIDATES
  const { candidates, total, isLoading, refetch } = useCandidatesForKanban({
    jobId,
    page:  1,
    limit: 50,   // fetch enough to slice per column
  });

  const visibleCols = COLUMNS.filter((c) => !c.aiOnly || hasAI);
  const hiredCount  = candidates.filter((_, i) => i < 2).length; // replace with real hired count when API supports filtering by status
  const hiringDone  = hiredCount >= noOfHires;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {hiringDone && (
        <div className="px-5 pt-5">
          <HiringCompletedBanner count={noOfHires} />
        </div>
      )}

      <ViewHeader
        wrapperClassName="flex items-center justify-end gap-2 px-5 pt-4 pb-3"
        filterButtonClassName="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
        toggleWrapperClassName="flex items-center border border-gray-200 rounded-lg overflow-hidden"
        gridButtonClassName={`p-1.5 transition-colors ${viewMode === "kanban" ? "bg-gray-100 text-gray-800" : "text-gray-400 hover:text-gray-600"}`}
        listButtonClassName={`p-1.5 transition-colors ${viewMode === "list" ? "bg-gray-100 text-gray-800" : "text-gray-400 hover:text-gray-600"}`}
        filterSize={14}
        gridSize={16}
        listSize={16}
        onGrid={() => setViewMode("kanban")}
        onList={() => setViewMode("list")}
      />

      {isLoading ? (
        <div className="px-4 pb-4">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-64 flex-shrink-0 h-80 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      ) : (
        <div className="px-4 pb-4">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {renderCandidateCards(visibleCols, (col) => {
              const isExpanded    = expanded === col.key;
              const colCandidates = candidates.slice(0, isExpanded ? col.count : 3);
              const perPage       = col.key === "applied" ? 12 : 9;

              return (
                <KanbanColumn
                  key={col.key}
                  col={col}
                  candidates={colCandidates}
                  isExpanded={isExpanded}
                  perPage={perPage}
                  onToggle={() => setExpanded(isExpanded ? null : col.key)}
                  showAIPanel={col.key === "applied" && isExpanded}
                  aiCandidates={candidates.slice(0, 5)}
                  onRefetch={refetch}       // ✅ pass down so KanbanColumn/CandidateCard can refetch after action
                  totalCount={total}        // ✅ real total from API
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};