'use client';

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { CandidateCardVM } from '@/types/view-models';
import type { RecruiterCandidateRow } from '@/types';
import { getRecruiterCandidates } from '@/features/candidates';
import { InviteCandidateToJobModal } from './CandidateActionModal';
import { CandidatesPoolCardView } from '@/app/candidates/components/CardView';
import { CandidatesPoolTableView } from '@/app/candidates/components/TableView';
import { CandidatesPoolFiltersModal } from './FiltersModal';
import { useCandidatesPoolFilters } from './useFilters';
import { TabToolbarFilterViewToggle } from '@/components/table/TableTabs';
import { useMetadataStore } from '@/stores/metadataStore';

export const PAGE_LIMIT = 10;

function toInitials(first: string, last?: string | null) {
  return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase();
}

function toExperience(months?: number | null) {
  if (!months) return '—';
  const yrs = Math.max(1, Math.round(months / 12));
  return `${yrs}+ yrs`;
}

function toJobTitleLabel(raw: string): string {
  const value = raw.trim();
  if (!value) return '—';
  return value.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function abbreviateJobTitle(slug: string): string {
  return slug
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

function jobTitlesDesignation(slugs: string[]): {
  designation: string;
  job_title_labels: string[];
} {
  const cleaned = slugs.map((slug) => String(slug ?? '').trim()).filter(Boolean);
  const job_title_labels = cleaned.map(toJobTitleLabel);
  if (cleaned.length === 0) return { designation: '—', job_title_labels: [] };
  if (cleaned.length === 1) return { designation: job_title_labels[0], job_title_labels };
  return {
    designation: cleaned.map(abbreviateJobTitle).join(' | '),
    job_title_labels,
  };
}

function normalizeJobTitles(raw: RecruiterCandidateRow['job_titles']): string[] {
  if (raw == null) return [];
  if (Array.isArray(raw)) {
    return raw.map((x) => String(x ?? '').trim()).filter(Boolean);
  }
  return String(raw)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseRating(raw: RecruiterCandidateRow['avg_rating_score']): number | null {
  if (raw === null || raw === undefined || raw === '') return null;
  const n = typeof raw === 'number' ? raw : Number(raw);
  return Number.isFinite(n) ? n : null;
}

function fromRecruiterCandidateRow(row: RecruiterCandidateRow): CandidateCardVM {
  const titleSlugs = normalizeJobTitles(row.job_titles);
  const { designation, job_title_labels } = jobTitlesDesignation(titleSlugs);
  const dist =
    row.distance != null && Number.isFinite(Number(row.distance))
      ? `${Number(row.distance).toFixed(1)} km`
      : 'N/A';

  return {
    id: row.candidate_id,
    application_id: '',
    full_name: `${row.first_name} ${row.last_name}`.trim(),
    initials: toInitials(row.first_name, row.last_name),
    profile_image_url: row.profile_image_url ?? null,
    designation,
    job_title_labels,
    experience: toExperience(row.experience_in_months),
    distance: dist,
    interview_score: row.best_ai_interview_score ?? null,
    rating: parseRating(row.avg_rating_score),
    work_eligibility: null,
    is_online: false,
    is_active: row.is_active ?? undefined,
    application_status: row.is_active === false ? 'Inactive' : 'Active',
    href: `/candidates/${row.candidate_id}`,
    in_house_status: row.in_house_status ?? null,
  };
}

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

  const [page, setPage] = useState(1);
  const [inviteModalCandidate, setInviteModalCandidate] = useState<CandidateCardVM | null>(null);
  const queryClient = useQueryClient();

  const {
    filters,
    selectedRoleSlug,
    setSelectedRoleSlug,
    candidateStatus,
    setCandidateStatus,
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
  } = useCandidatesPoolFilters({ page, limit: PAGE_LIMIT });
  const [appliedFilters, setAppliedFilters] = useState(filters);

  const handleApplyFilters = () => {
    const nextPage = 1;
    setPage(nextPage);
    setAppliedFilters({ ...filters, page: nextPage, limit: PAGE_LIMIT });
    onFilterOpenChange(false);
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['recruiter-candidates', appliedFilters],
    queryFn: () => getRecruiterCandidates(appliedFilters),
  });

  const cards = (data?.data?.candidates ?? []).map(fromRecruiterCandidateRow) as CandidateCardVM[];
  const total = data?.data?.pagination?.total ?? 0;

  useEffect(() => {
    setAppliedFilters((prev) => ({ ...prev, page, limit: PAGE_LIMIT }));
  }, [page]);

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-3">
          <h2 className="text-base font-semibold text-gray-900">Candidate pool</h2>
          <TabToolbarFilterViewToggle
          view={view}
          onViewChange={onViewChange}
          onFilterClick={() => onFilterOpenChange(true)}
        />
      </div>

      <CandidatesPoolFiltersModal
        open={filterOpen}
        onOpenChange={onFilterOpenChange}
        onApply={handleApplyFilters}
        jobTitlesMeta={jobTitlesMeta}
        metadataLoading={metadataLoading}
        selectedRoleSlug={selectedRoleSlug}
        onSelectedRoleSlugChange={setSelectedRoleSlug}
        candidateStatus={candidateStatus}
        onCandidateStatusChange={setCandidateStatus}
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
