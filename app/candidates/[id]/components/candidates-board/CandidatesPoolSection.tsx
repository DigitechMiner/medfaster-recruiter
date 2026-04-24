"use client";

import { CandidateColumn } from "../CandidateColumn";
import type { CandidateListItem } from '@/Interface/recruiter.types';
import { COLUMNS, colStyles, KpiView } from "./constants";
import { PaginationBar } from "./ui";
import { PoolListRow } from "./PoolListRow";

interface CandidatesPoolSectionProps {
  view: "grid" | "list";
  activeListTab: number;
  setActiveListTab: (value: number) => void;
  expandedColumn: string | null;
  setExpandedColumn: (value: string | null) => void;
  filtered: CandidateListItem[][];
  activeKpi: KpiView;
  setActiveKpi: (value: KpiView) => void;
}

export function CandidatesPoolSection({
  view, activeListTab, setActiveListTab,
  expandedColumn, setExpandedColumn,
  filtered, activeKpi, setActiveKpi,
}: CandidatesPoolSectionProps) {

  if (view === "list") {
    const col  = COLUMNS[activeListTab];
    const rows = filtered[activeListTab] ?? [];
    return (
      <div className="flex flex-col gap-0">
        <div className="flex items-center gap-0 border-b border-gray-100 mb-4 overflow-x-auto">
          {COLUMNS.map((c, i) => (
            <button
              key={c.title}
              onClick={() => setActiveListTab(i)}
              className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors border-b-2
                ${activeListTab === i ? "border-orange-500 text-[#F4781B]" : "border-transparent text-gray-400 hover:text-gray-600"}`}
            >
              {c.title}
            </button>
          ))}
        </div>
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
              ) : rows.map((c, j) => (
                <PoolListRow key={c.id ?? j} c={c} actionType={col.actionType} />
              ))}
            </tbody>
          </table>
        </div>
        <PaginationBar total={rows.length} />
      </div>
    );
  }

  if (expandedColumn) {
    const colIdx = COLUMNS.findIndex((c) => c.title === expandedColumn);
    const col    = COLUMNS[colIdx];
    const rows   = filtered[colIdx] ?? [];
    const s      = colStyles[col.accentColor];
    return (
      <div className={`rounded-2xl border-2 ${s.wrapper} p-4`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
            <h3 className="text-sm font-bold text-gray-900">{col.title}</h3>
            <span className="text-xs text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-full">{rows.length}</span>
          </div>
          <button onClick={() => setExpandedColumn(null)} className={`text-xs font-semibold ${s.viewAll} hover:underline`}>
            View Less
          </button>
        </div>
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
              leftTags={[col.leftTags?.[i % col.leftTags.length] ?? ""]}
              rightTags={[col.rightTags?.[i % col.rightTags.length] ?? ""]}
              hideHeader
              hideViewAll
            />
          ))}
        </div>
        <PaginationBar total={rows.length} />
      </div>
    );
  }

  return (
    <>
      {activeKpi === "candidatesPool" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {COLUMNS.map((col, i) => (
            <CandidateColumn
              key={col.title}
              title={col.title}
              count={filtered[i]?.length ?? 0}
              accentColor={col.accentColor}
              dotColor={col.dotColor}
              candidates={filtered[i] ?? []}
              actionType={col.actionType}
              leftTags={col.leftTags}
              rightTags={col.rightTags}
              onViewAll={() => setExpandedColumn(col.title)}
            />
          ))}
        </div>
      )}
      {activeKpi === "none" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {COLUMNS.map((col, i) => (
            <CandidateColumn
              key={col.title}
              title={col.title}
              count={filtered[i]?.length ?? 0}
              accentColor={col.accentColor}
              dotColor={col.dotColor}
              candidates={filtered[i] ?? []}
              actionType={col.actionType}
              leftTags={col.leftTags}
              rightTags={col.rightTags}
              onViewAll={() => { setActiveKpi("candidatesPool"); setExpandedColumn(col.title); }}
            />
          ))}
        </div>
      )}
    </>
  );
}