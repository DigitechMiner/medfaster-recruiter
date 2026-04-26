import React from "react";
import Image from "next/image";
import { LayoutGrid, List } from "lucide-react";
import { buildTablePages, Candidate, getVisibleCountRange, TabKey } from "./shared";

interface ViewToggleProps {
  view: "list" | "kanban";
  onChange: (view: "list" | "kanban") => void;
}

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden flex-shrink-0">
      <button
        onClick={() => onChange("kanban")}
        title="Kanban view"
        className={`p-1.5 transition-colors ${view === "kanban" ? "bg-gray-100 text-gray-800" : "text-gray-400 hover:text-gray-600"}`}
      >
        <LayoutGrid size={16} />
      </button>
      <button
        onClick={() => onChange("list")}
        title="List view"
        className={`p-1.5 transition-colors ${view === "list" ? "bg-gray-100 text-gray-800" : "text-gray-400 hover:text-gray-600"}`}
      >
        <List size={16} />
      </button>
    </div>
  );
}

interface CandidatesTableProps {
  tab: TabKey;
  candidates: Candidate[];
  isLoading: boolean;
}

export function CandidatesTable({ tab, candidates, isLoading }: CandidatesTableProps) {
  if (isLoading) {
    return (
      <div className="p-4 flex flex-col gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (candidates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <div className="w-20 h-20 opacity-50">
          <svg viewBox="0 0 96 96" fill="none">
            <rect x="20" y="16" width="56" height="68" rx="6" fill="#e5e7eb" />
            <rect x="32" y="8" width="32" height="16" rx="4" fill="#d1d5db" />
            <line x1="32" y1="44" x2="64" y2="44" stroke="#9ca3af" strokeWidth="3" strokeLinecap="round" />
            <line x1="32" y1="56" x2="56" y2="56" stroke="#9ca3af" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-gray-700">No Candidates Yet</p>
        <p className="text-xs text-gray-400">No candidates in this stage</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#FEF3E9]">
            {["Candidate Name", "Department", "Job Title", "Experience", "Rating", "Actions"].map((header) => (
              <th key={header} className="text-left px-4 py-3 text-xs font-semibold text-gray-600 whitespace-nowrap first:rounded-l-lg last:rounded-r-lg">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {candidates.map((candidate) => (
            <tr key={candidate.id} className="border-b border-gray-50 hover:bg-orange-50/20 transition-colors">
              <td className="px-4 py-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="relative w-9 h-9 rounded-xl bg-orange-50 border border-orange-100 overflow-hidden flex-shrink-0">
                    <Image src={candidate.avatar} alt={candidate.name} fill className="object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-gray-900">{candidate.name}</span>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="#22c55e">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                    </div>
                    <span className={`text-xs font-medium ${candidate.online ? "text-green-500" : "text-gray-400"}`}>
                      {candidate.online ? "● Online" : "○ Offline"}
                    </span>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3.5 text-gray-600">{candidate.department}</td>
              <td className="px-4 py-3.5 text-gray-600">{candidate.role}</td>
              <td className="px-4 py-3.5 text-gray-600">{candidate.exp}</td>
              <td className="px-4 py-3.5">
                <span className="flex items-center gap-1 text-gray-700">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  {candidate.rating.toFixed(1)}/5
                </span>
              </td>
              <td className="px-4 py-3.5">
                <TableActionButtons tab={tab} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TableActionButtons({ tab }: { tab: TabKey }) {
  switch (tab) {
    case "applied":
      return (
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-700 hover:bg-gray-50 font-medium">Shortlist</button>
          <button className="px-3 py-1.5 rounded-lg bg-[#F4781B] text-white text-xs font-semibold hover:bg-[#e06a10]">Direct Hire</button>
        </div>
      );
    case "shortlisted":
      return (
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-lg border border-red-300 text-red-500 text-xs hover:bg-red-50 font-medium">Remove</button>
          <button className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-700 hover:bg-gray-50 font-medium">Request Interview</button>
        </div>
      );
    case "ai_interviewing":
      return <button className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600">Abort Interview</button>;
    case "interviewed":
      return (
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-lg border border-red-300 text-red-500 text-xs hover:bg-red-50 font-medium">Reject</button>
          <button className="px-3 py-1.5 rounded-lg bg-[#F4781B] text-white text-xs font-semibold hover:bg-[#e06a10]">Hire Now</button>
        </div>
      );
    case "hired":
      return <button className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-[#F4781B] font-semibold hover:bg-orange-50">View Schedule</button>;
    default:
      return null;
  }
}

interface TablePaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export function TablePagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
}: TablePaginationProps) {
  const pages = buildTablePages(totalPages);
  const visibleRange = getVisibleCountRange(page, limit, total);

  return (
    <div className="bg-[#FEF3E9] px-5 py-3 flex items-center justify-between flex-wrap gap-3">
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Previous
      </button>

      <div className="flex items-center gap-1">
        {pages.map((item, index) =>
          item === "..." ? (
            <span key={`ellipsis-${index}`} className="px-2 text-gray-400 text-sm">...</span>
          ) : (
            <button
              key={item}
              onClick={() => onPageChange(item)}
              className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${page === item ? "bg-[#F4781B] text-white" : "text-gray-500 hover:bg-white"}`}
            >
              {item}
            </button>
          ),
        )}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">
          Showing <strong>{visibleRange.start}–{visibleRange.end}</strong> of <strong>{total}</strong> Candidates
        </span>
        <select
          value={limit}
          onChange={(event) => onLimitChange(Number(event.target.value))}
          className="border border-gray-200 rounded-lg px-2 py-1 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-200"
        >
          <option value={10}>10 per page</option>
          <option value={25}>25 per page</option>
          <option value={50}>50 per page</option>
        </select>
      </div>

      <button
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Next
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
}
