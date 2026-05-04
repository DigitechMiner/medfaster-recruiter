'use client';

import { useState, useEffect }  from "react";
import { useCandidateCards }    from "@/hooks/useCandidateCards";
import { PaginationBar, SectionHeader } from "./ui";
import { JobTable }             from "./JobTable";
import { HiredCandidateCard }   from "./HiredCandidateCard";

interface Props {
  search?: string;
}

const PAGE_LIMIT = 10;

export function HiredCandidatesSection({ search = "" }: Props) {
  const [page,      setPage]      = useState(1);
  const [localView, setLocalView] = useState<"grid" | "list">("list");

  // Reset to page 1 whenever search changes
  useEffect(() => { setPage(1); }, [search]);

  const { cards, total, isLoading } = useCandidateCards({
    status: 'HIRE',
    page,
    limit:  PAGE_LIMIT,
    ...(search ? { search } : {}),
  });

  return (
    <div className="flex flex-col gap-3">
      <SectionHeader
        title="Hired Candidates"
        dotColor="bg-orange-500"
        count={total}
        view={localView}
        onViewToggle={(v) => { setLocalView(v); setPage(1); }}
      />

      {isLoading ? (
        <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
      ) : localView === "list" ? (
        <div className="rounded-xl border border-gray-100 overflow-hidden">
          <JobTable jobs={cards} headerBg="bg-orange-50/60" />
          <PaginationBar
            total={total}
            page={page}
            perPage={PAGE_LIMIT}
            onPageChange={setPage}
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {cards.length === 0 ? (
              <p className="text-sm text-gray-400 col-span-full text-center py-8">
                No hired candidates found.
              </p>
            ) : (
              cards.map((c) => <HiredCandidateCard key={c.id} c={c} />)
            )}
          </div>
          <PaginationBar
            total={total}
            page={page}
            perPage={PAGE_LIMIT}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}