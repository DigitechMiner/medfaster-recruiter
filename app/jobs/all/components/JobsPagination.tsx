'use client';
import React from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

interface Props {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPage: (p: number) => void;
  onLimit: (l: number) => void;
}

export const JobsPagination: React.FC<Props> = ({
  page, totalPages, total, limit, onPage, onLimit,
}) => {
  const from = (page - 1) * limit + 1;
  const to   = Math.min(page * limit, total);

  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1, 2, 3, '...', totalPages - 2, totalPages - 1, totalPages);
  }

  return (
    <div className="flex items-center justify-between border-gray-100">
      {/* Prev */}
      <button
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronLeft size={16} /> Previous
      </button>

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm">...</span>
          ) : (
            <button
              key={p}
              onClick={() => onPage(p as number)}
              className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                page === p
                  ? 'bg-[#F4781B] text-white'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {p}
            </button>
          )
        )}
      </div>

      {/* Right: showing + per page */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">
          Showing <strong>{from}–{to}</strong> of <strong>{total}</strong> Jobs
        </span>
        <div className="relative">
          <select
            value={limit}
            onChange={(e) => onLimit(Number(e.target.value))}
            className="appearance-none border border-gray-200 rounded-lg pl-3 pr-8 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-orange-200 cursor-pointer"
          >
            {[9, 10, 20, 50].map((n) => (
              <option key={n} value={n}>{n} per page</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Next */}
      <button
        onClick={() => onPage(page + 1)}
        disabled={page === totalPages}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Next <ChevronRight size={16} />
      </button>
    </div>
  );
};