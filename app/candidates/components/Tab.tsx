'use client';

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { CandidateCardVM } from '@/types/view-models';
import { fromRecruiterCandidateRow } from '@/lib/transforms/candidate-card.transform';
import { getRecruiterCandidates } from '@/features/candidates';
import { InviteCandidateToJobModal } from './CandidateActionModal';
import { CandidatesPoolCardView } from '@/app/candidates/components/CardView';
import { CandidatesPoolTableView } from '@/app/candidates/components/TableView';
import { CandidatesPoolFiltersModal } from './FiltersModal';
import { useCandidatesPoolFilters, type PoolTab } from './useFilters';
import { TableTabs, TabToolbarFilterViewToggle } from '@/components/table/TableTabs';
import { useMetadataStore } from '@/stores/metadataStore';

export const PAGE_LIMIT = 10;

const POOL_TABLE_TABS: { key: PoolTab; label: string }[] = [
  { key: 'nearby', label: 'Nearby' },
  { key: 'active', label: 'Active candidates' },
];

export function CandidatesPoolSection({
  view,
  filterOpen,
  onFilterOpenChange,
  onViewChange,
}: {
  view: 'grid' | 'list';
  filterOpen: boolean;
  onFilterOpenChange: (open: boolean) => void;
  onViewChange: (view: 'grid' | 'list') => void;
}) {
  const jobTitlesMeta = useMetadataStore((s) => s.jobTitles);
  const metadataLoading = useMetadataStore((s) => s.loading);

  const [poolTab, setPoolTab] = useState<PoolTab>('nearby');
  const [page, setPage] = useState(1);
  const [inviteModalCandidate, setInviteModalCandidate] = useState<CandidateCardVM | null>(null);
  const queryClient = useQueryClient();

  const {
    filters,
    selectedRoleSlug,
    setSelectedRoleSlug,
    radiusKm,
    setRadiusKm,
    customKm,
    setCustomKm,
    coords,
    geoHint,
    kmValidationHint,
    locating,
    requestLocation,
    clearFilters,
  } = useCandidatesPoolFilters({ poolTab, page, limit: PAGE_LIMIT });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['recruiter-candidates', filters],
    queryFn: () => getRecruiterCandidates(filters),
  });

  const cards = (data?.data?.candidates ?? []).map(fromRecruiterCandidateRow) as CandidateCardVM[];
  const total = data?.data?.pagination?.total ?? 0;

  useEffect(() => {
    setPage(1);
  }, [poolTab, selectedRoleSlug, coords, radiusKm, customKm]);

  return (
    <div className="flex flex-col">
      <TableTabs
        tabs={POOL_TABLE_TABS}
        activeTab={poolTab}
        onTabChange={setPoolTab}
        tabClassName="relative px-5 py-4 text-sm font-medium transition-colors whitespace-nowrap"
        activeTabClassName="text-[#F4781B]"
        inactiveTabClassName="text-gray-400 hover:text-gray-600"
        toolbarClassName="justify-between border-b border-gray-100 px-6"
        endSlotClassName="py-2 sm:py-2"
        endSlot={
          <TabToolbarFilterViewToggle
            view={view}
            onViewChange={onViewChange}
            onFilterClick={() => onFilterOpenChange(true)}
          />
        }
      />

      <CandidatesPoolFiltersModal
        open={filterOpen}
        onOpenChange={onFilterOpenChange}
        jobTitlesMeta={jobTitlesMeta}
        metadataLoading={metadataLoading}
        selectedRoleSlug={selectedRoleSlug}
        onSelectedRoleSlugChange={setSelectedRoleSlug}
        coords={coords}
        radiusKm={radiusKm}
        onRadiusKmChange={setRadiusKm}
        customKm={customKm}
        onCustomKmChange={setCustomKm}
        geoHint={geoHint}
        kmValidationHint={kmValidationHint}
        locating={locating}
        onRequestLocation={requestLocation}
        onClearFilters={clearFilters}
      />

      {isError && (
        <p className="text-xs text-red-700 bg-red-50 border-b border-red-100 px-6 py-3">
          Could not load candidates. Adjust filters or try again.
        </p>
      )}

      {view === 'list' ? (
        <CandidatesPoolTableView
          cards={cards}
          isLoading={isLoading}
          total={total}
          page={page}
          pageLimit={PAGE_LIMIT}
          onPageChange={setPage}
          onOpenInviteJob={setInviteModalCandidate}
        />
      ) : (
        <CandidatesPoolCardView
          cards={cards}
          isLoading={isLoading}
          total={total}
          page={page}
          pageLimit={PAGE_LIMIT}
          onPageChange={setPage}
        />
      )}
      {inviteModalCandidate && (
        <InviteCandidateToJobModal
          candidate={{
            id: inviteModalCandidate.id,
            full_name: inviteModalCandidate.full_name,
          }}
          applicationId={inviteModalCandidate.application_id}
          onClose={() => setInviteModalCandidate(null)}
          onActionSuccess={() => {
            void queryClient.invalidateQueries({ queryKey: ['recruiter-candidates'] });
          }}
        />
      )}
    </div>
  );
}
