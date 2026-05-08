"use client";

import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

type PaginationFooterProps = {
  page: number;
  totalItems: number;
  perPage: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
  perPageOptions?: number[];
  onPerPageChange?: (perPage: number) => void;
  className?: string;
};

function getPageNumbers(currentPage: number, totalPages: number): (number | "...")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages: (number | "...")[] = [1, 2, 3];
  if (currentPage > 4) pages.push("...");
  if (currentPage > 3 && currentPage < totalPages - 2) pages.push(currentPage);
  if (currentPage < totalPages - 3) pages.push("...");
  pages.push(totalPages - 1, totalPages);
  return [...new Set(pages)];
}

export function PaginationFooter({
  page,
  totalItems,
  perPage,
  onPageChange,
  itemLabel = "items",
  perPageOptions,
  onPerPageChange,
  className = "flex items-center justify-between px-6 py-4 bg-orange-50/60 border-t border-orange-100",
}: PaginationFooterProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const showingFrom =
    totalItems === 0 ? 0 : Math.min((page - 1) * perPage + 1, totalItems);
  const showingTo = Math.min(page * perPage, totalItems);
  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <div className={className}>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 bg-white rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors font-medium"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>

        <div className="flex items-center gap-1">
          {pageNumbers.map((value, index) =>
            value === "..." ? (
              <span key={`ellipsis-${index}`} className="px-2 text-gray-400 text-sm">
                ...
              </span>
            ) : (
              <button
                key={value}
                onClick={() => onPageChange(Number(value))}
                className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${
                  page === value
                    ? "bg-[#F4781B] text-white shadow-sm"
                    : "text-gray-600 bg-white border border-gray-200 hover:bg-orange-50"
                }`}
              >
                {value}
              </button>
            ),
          )}
        </div>

        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 bg-white rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors font-medium"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">
          Showing{" "}
          <span className="font-semibold text-gray-800">
            {showingFrom}-{showingTo}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-gray-800">{totalItems}</span>{" "}
          {itemLabel}
        </span>

        {perPageOptions && onPerPageChange && (
          <div className="relative">
            <select
              value={perPage}
              onChange={(event) => onPerPageChange(Number(event.target.value))}
              className="appearance-none pl-3 pr-7 py-1.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none"
            >
              {perPageOptions.map((option) => (
                <option key={option} value={option}>
                  {option} per page
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        )}
      </div>
    </div>
  );
}
