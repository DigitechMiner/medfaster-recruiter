'use client';

import { useState }        from "react";
import { CandidateColumn } from "../CandidateColumn";
import { COLUMNS, colStyles, KpiView } from "./constants";
import { PaginationBar }   from "./ui";
import { PoolListRow }     from "./PoolListRow";
import { useCandidateCards } from "@/hooks/useCandidateCards";

interface CandidatesPoolSectionProps {
  view:              "grid" | "list";
  search?:           string;
  activeListTab:     number;
  setActiveListTab:  (value: number) => void;
  expandedColumn:    string | null;
  setExpandedColumn: (value: string | null) => void;
  activeKpi:         KpiView;
  setActiveKpi:      (value: KpiView) => void;
}

const PAGE_LIMIT = 10;
const COL_STATUSES = ["APPLIED", "SHORTLISTED", "INTERVIEWING", "HIRE"] as const;

export function CandidatesPoolSection({
  view, search = "", activeListTab, setActiveListTab,
  expandedColumn, setExpandedColumn, activeKpi, setActiveKpi,
}: CandidatesPoolSectionProps) {

  const [pages, setPages] = useState<number[]>([1, 1, 1, 1]);
  const setPage = (colIdx: number, p: number) =>
    setPages((prev) => prev.map((v, i) => (i === colIdx ? p : v)));

  // ✅ Single active column index drives the one pagination bar in grid view
  const [activePaginatedCol, setActivePaginatedCol] = useState(0);

  const col0 = useCandidateCards({ status: COL_STATUSES[0], page: pages[0], limit: PAGE_LIMIT });
  const col1 = useCandidateCards({ status: COL_STATUSES[1], page: pages[1], limit: PAGE_LIMIT });
  const col2 = useCandidateCards({ status: COL_STATUSES[2], page: pages[2], limit: PAGE_LIMIT });
  const col3 = useCandidateCards({ status: COL_STATUSES[3], page: pages[3], limit: PAGE_LIMIT });
  const colData = [col0, col1, col2, col3];

  const filteredColData = colData.map(({ cards, total, isLoading }) => ({
    cards: search
      ? cards.filter((c) =>
          `${c.full_name} ${c.designation} ${c.department}`
            .toLowerCase()
            .includes(search.toLowerCase())
        )
      : cards,
    total,
    isLoading,
  }));

  // ── List view ──────────────────────────────────────────────────────────────
  if (view === "list") {
    const col = COLUMNS[activeListTab];
    const { cards: rows, total, isLoading } = filteredColData[activeListTab];

    return (
      <div className="flex flex-col gap-0">
        <div className="flex items-center gap-0 border-b border-gray-100 mb-4 overflow-x-auto">
          {COLUMNS.map((c, i) => (
            <button
              key={c.title}
              onClick={() => { setActiveListTab(i); setPage(i, 1); }}
              className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
                activeListTab === i
                  ? "border-orange-500 text-[#F4781B]"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {c.title}
              <span className="ml-1.5 text-[10px] text-gray-400">
                ({colData[i].total})
              </span>
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-orange-50/60">
                  {["Candidate Name", "Department", "Designation", "Experience", "Distance", "General Scoring", "Rating", "Action"].map((h) => (
                    <th key={h} className="py-3 px-4 text-xs font-semibold text-gray-600 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr><td colSpan={8} className="py-8 text-center text-xs text-gray-400">No candidates</td></tr>
                ) : (
                  rows.map((c, j) => (
                    <PoolListRow key={c.id ?? j} c={c} actionType={col.actionType} />
                  ))
                )}
              </tbody>
            </table>
            {/* ✅ Single bar — list view naturally has only one active tab */}
            <PaginationBar
              total={total}
              page={pages[activeListTab]}
              perPage={PAGE_LIMIT}
              onPageChange={(p) => setPage(activeListTab, p)}
            />
          </div>
        )}
      </div>
    );
  }

  // ── Expanded single column ─────────────────────────────────────────────────
  if (expandedColumn) {
    const colIdx = COLUMNS.findIndex((c) => c.title === expandedColumn);
    const col    = COLUMNS[colIdx];
    const { cards: rows, total, isLoading } = filteredColData[colIdx];
    const s      = colStyles[col.accentColor];

    return (
      <div className={`rounded-2xl border-2 ${s.wrapper} p-4`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
            <h3 className="text-sm font-bold text-gray-900">{col.title}</h3>
            <span className="text-xs text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-full">
              {total}
            </span>
          </div>
          <button
            onClick={() => setExpandedColumn(null)}
            className={`text-xs font-semibold ${s.viewAll} hover:underline`}
          >
            View Less
          </button>
        </div>

        {isLoading ? (
          <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {rows.map((c, i) => (
                <CandidateColumn
                  key={col.title + i}
                  title={col.title}
                  count={1}
                  accentColor={col.accentColor}
                  dotColor={col.dotColor}
                  candidates={[c]}
                  actionType={col.actionType}
                  leftTags={[col.leftTags?.[i % (col.leftTags?.length ?? 1)] ?? ""]}
                  rightTags={[col.rightTags?.[i % (col.rightTags?.length ?? 1)] ?? ""]}
                  hideHeader
                  hideViewAll
                />
              ))}
            </div>
            {/* ✅ Single bar — expanded view only ever shows one column */}
            <PaginationBar
              total={total}
              page={pages[colIdx]}
              perPage={PAGE_LIMIT}
              onPageChange={(p) => setPage(colIdx, p)}
            />
          </>
        )}
      </div>
    );
  }

  // ── Default grid (all 4 columns) ───────────────────────────────────────────
  return (
    <>
      {(activeKpi === "candidatesPool" || activeKpi === "none") && (
        <div className="flex flex-col gap-4">
          {/* 4-column grid — no PaginationBar inside each column */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
            {COLUMNS.map((col, i) => {
              const { cards, total, isLoading } = filteredColData[i];
              return (
                <CandidateColumn
                  key={col.title}
                  title={col.title}
                  count={total}
                  accentColor={col.accentColor}
                  dotColor={col.dotColor}
                  candidates={cards}
                  actionType={col.actionType}
                  leftTags={col.leftTags}
                  rightTags={col.rightTags}
                  isLoading={isLoading}
                  onViewAll={() => {
                    setActivePaginatedCol(i);   // ← track which column to page
                    if (activeKpi === "none") setActiveKpi("candidatesPool");
                    setExpandedColumn(col.title);
                  }}
                />
              );
            })}
          </div>

          {/* ✅ Single pagination bar + column selector pill tabs */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-1.5">
              {COLUMNS.map((col, i) => (
                <button
                  key={col.title}
                  onClick={() => setActivePaginatedCol(i)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                    activePaginatedCol === i
                      ? "bg-orange-50 border-orange-300 text-[#F4781B] font-semibold"
                      : "border-gray-200 text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {col.title}
                </button>
              ))}
            </div>
            <PaginationBar
              total={filteredColData[activePaginatedCol].total}
              page={pages[activePaginatedCol]}
              perPage={PAGE_LIMIT}
              onPageChange={(p) => setPage(activePaginatedCol, p)}
            />
          </div>
        </div>
      )}
    </>
  );
}