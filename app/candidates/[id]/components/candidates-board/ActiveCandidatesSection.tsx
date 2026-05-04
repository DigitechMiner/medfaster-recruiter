'use client';

import { useState }          from "react";
import { useCandidateCards } from "@/hooks/useCandidateCards";
import { JobTable }          from "./JobTable";
import { PaginationBar }     from "./ui";

const PAGE_LIMIT = 10;

export function ActiveCandidatesSection() {
  const [page, setPage] = useState(1);

  const { cards, total, isLoading } = useCandidateCards({
    status: 'INTERVIEWING',
    page,
    limit: PAGE_LIMIT,
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
        <h3 className="text-sm font-bold text-gray-900">Active Candidates</h3>
        <span className="text-xs text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-full">
          {total}
        </span>
      </div>

      {isLoading ? (
        <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
      ) : (
        <div className="rounded-xl border border-gray-100 overflow-hidden">
          <JobTable jobs={cards} showCandidateType headerBg="bg-blue-50/40" />
          <PaginationBar
            total={total}
            page={page}
            perPage={PAGE_LIMIT}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}