'use client';

import type { ActionType } from '@/types';
import type { CandidateCardVM } from '@/types/view-models';
import { BoardCandidateCard } from '@/components/card/CandidateCard';
import { PaginationFooter } from '@/components/table/PaginationFooter';

const POOL_CARD_ACTION: ActionType = 'invite';

export function CandidatesPoolCardView({
  cards,
  isLoading,
  total,
  page,
  pageLimit,
  onPageChange,
}: {
  cards: CandidateCardVM[];
  isLoading: boolean;
  total: number;
  page: number;
  pageLimit: number;
  onPageChange: (page: number) => void;
}) {
  if (isLoading) {
    return <div className="h-40 bg-gray-100 rounded-xl animate-pulse" />;
  }
  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3 p-4">
        {cards.length === 0 ? (
          <p className="text-sm text-gray-400 col-span-full text-center py-8">No candidates match your filters.</p>
        ) : (
          cards.map((c) => <BoardCandidateCard key={c.id} c={c} actionType={POOL_CARD_ACTION} />)
        )}
      </div>
      <PaginationFooter totalItems={total} page={page} perPage={pageLimit} onPageChange={onPageChange} itemLabel="candidates" />
    </>
  );
}
