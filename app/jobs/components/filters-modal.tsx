"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import type { JobStatusFilter } from "./helper";

interface JobsFiltersModalProps {
  open: boolean;
  jobStatus: JobStatusFilter;
  onJobStatusChange: (value: JobStatusFilter) => void;
  onClose: () => void;
  onClear: () => void;
  onApply: () => void;
}

export function JobsFiltersModal({
  open,
  jobStatus,
  onJobStatusChange,
  onClose,
  onClear,
  onApply,
}: JobsFiltersModalProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="jobs-filters-title"
        className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2 border-b border-gray-100 px-4 py-3">
          <p id="jobs-filters-title" className="text-sm font-semibold text-gray-900">
            Filters
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            aria-label="Close filters"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-[11px] text-gray-600">
            <span className="font-medium">Status</span>
            <select
              value={jobStatus}
              onChange={(event) => onJobStatusChange(event.target.value as JobStatusFilter)}
              className="rounded-lg border border-gray-200 bg-white px-2 py-2 text-xs text-gray-800 outline-none focus:border-[#F4781B]"
            >
              <option value="all">All</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="OPEN">Open</option>
              <option value="CLOSED">Closed</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </label>

          <div className="flex flex-wrap items-center justify-end gap-2 pt-1 border-t border-gray-100">
            <button
              type="button"
              onClick={onClear}
              className="text-xs font-medium text-[#F4781B] hover:underline px-2 py-2"
            >
              Clear filters
            </button>
            <button
              type="button"
              onClick={onApply}
              className="rounded-xl bg-[#F4781B] hover:bg-[#e06a10] text-white text-xs font-semibold px-4 py-2.5"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
