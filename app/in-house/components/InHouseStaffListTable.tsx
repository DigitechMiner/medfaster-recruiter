'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Eye, Loader2, UserMinus } from 'lucide-react';
import { DataTable } from '@/components/table/DataTable';
import { PaginationFooter } from '@/components/table/PaginationFooter';
import { removeInHouseCandidate } from '@/features/jobs';
import {
  candidateAvatarSrc,
  candidateId,
  EmptyState,
  fetchInHouseCandidates,
  formatShortDate,
  InHouseMappingStatusPill,
  locationLine,
  candidateFirstLastName,
  PAGE_LIMIT,
  SkeletonRows,
  TD,
  type InHouseCandidateMapStatus,
  type RawInHouseCandidate,
} from './helper';

type InHouseTableRow = {
  candidate_id: string;
  full_name: string;
  profile_image_url: string | null;
  invited_at: string;
  location: string;
  status: 'active' | 'invited';
  /** Set for active (accepted) tab only */
  joined_at?: string;
};

function mapCandidateToRow(c: RawInHouseCandidate): InHouseTableRow {
  const base: InHouseTableRow = {
    candidate_id: candidateId(c),
    full_name: candidateFirstLastName(c),
    profile_image_url: candidateAvatarSrc(c.profile_image_url),
    invited_at: c.invited_at,
    location: locationLine(c),
    status: c.status,
  };
  return c.status === 'active' ? { ...base, joined_at: c.joined_at } : base;
}

function CandidateCell({ row }: { row: InHouseTableRow }) {
  return (
    <td className={TD}>
      <div className="flex items-center gap-2.5">
        {row.profile_image_url ? (
          <div className="w-[30px] h-[30px] rounded-full overflow-hidden flex-shrink-0">
            <Image
              src={row.profile_image_url}
              alt={row.full_name}
              width={30}
              height={30}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-[30px] h-[30px] rounded-full bg-orange-100 text-orange-500 text-[11px] font-bold flex items-center justify-center flex-shrink-0">
            {row.full_name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </div>
        )}
        <span>{row.full_name}</span>
      </div>
    </td>
  );
}

type Variant = 'invited' | 'active';

const EMPTY: Record<
  Variant,
  { message: string; sub: string }
> = {
  invited: {
    message: 'No Invitations Sent Yet',
    sub: 'Invite your in-house staff from your candidate pool to get started.',
  },
  active: {
    message: 'No Invitations Accepted Yet',
    sub: 'Once a candidate accepts your in-house request on the KeRaeva app, they will appear here.',
  },
};

function InHouseStaffListTableInner({
  variant,
  onTotalChange,
}: {
  variant: Variant;
  onTotalChange?: (total: number) => void;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const apiStatus: InHouseCandidateMapStatus = variant === 'active' ? 'active' : 'invited';

  const { data, isLoading } = useQuery({
    queryKey: ['inhouse-candidates', variant],
    queryFn: () => fetchInHouseCandidates(apiStatus),
  });

  const candidates = data?.data?.candidates ?? [];
  const rows: InHouseTableRow[] = candidates.map(mapCandidateToRow);
  const total = rows.length;
  const pagedRows = rows.slice((page - 1) * PAGE_LIMIT, page * PAGE_LIMIT);

  useEffect(() => {
    if (variant === 'invited') onTotalChange?.(total);
  }, [variant, total, onTotalChange]);

  const removeMutation = useMutation({
    mutationFn: (id: string) => removeInHouseCandidate(id),
    onMutate: (id) => setRemovingId(id),
    onSettled: () => setRemovingId(null),
    onSuccess: async () => {
      toast.success('Removed from in-house');
      await queryClient.invalidateQueries({ queryKey: ['inhouse-candidates'] });
      await queryClient.invalidateQueries({ queryKey: ['recruiter-candidates'] });
    },
    onError: (err: Error) => {
      toast.error(err?.message || 'Could not remove from in-house');
    },
  });

  const handleRemove = (candidateId: string) => {
    if (
      typeof window !== 'undefined' &&
      !window.confirm('Remove this candidate from your in-house staff list?')
    ) {
      return;
    }
    removeMutation.mutate(candidateId);
  };

  const isActive = variant === 'active';
  const colCount = isActive ? 6 : 4;
  const headers = isActive
    ? (['Candidate', 'Location', 'Status', 'Invited at', 'Joined at', 'Action'] as const)
    : (['Candidate', 'Location', 'Status', 'Invited at'] as const);

  if (!isLoading && rows.length === 0) {
    const empty = EMPTY[variant];
    return <EmptyState message={empty.message} sub={empty.sub} />;
  }

  return (
    <>
      <DataTable
        headers={[...headers]}
        minWidthClassName="min-w-full"
        headerRowClassName="bg-orange-50/60"
      >
        {isLoading ? (
          <SkeletonRows cols={colCount} />
        ) : (
          pagedRows.map((row) => (
            <tr
              key={row.candidate_id}
              role="link"
              tabIndex={0}
              className="hover:bg-gray-50/60 transition-colors cursor-pointer"
              onClick={() => router.push(`/candidates/${row.candidate_id}`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  router.push(`/candidates/${row.candidate_id}`);
                }
              }}
            >
              <CandidateCell row={row} />
              <td className={TD}>
                <span className="text-gray-500">{row.location}</span>
              </td>
              <td className={TD}>
                <InHouseMappingStatusPill status={row.status} />
              </td>
              <td className={TD}>{formatShortDate(row.invited_at)}</td>
              {isActive && (
                <>
                  <td className={TD}>{formatShortDate(row.joined_at ?? '')}</td>
                  <td className={`${TD} text-center`}>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        title="View profile"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/candidates/${row.candidate_id}`);
                        }}
                        className="text-blue-400 hover:text-blue-600 transition-colors p-1"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        type="button"
                        title="Remove from in-house"
                        disabled={removingId === row.candidate_id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(row.candidate_id);
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1 disabled:opacity-50"
                      >
                        {removingId === row.candidate_id ? (
                          <Loader2 size={18} className="animate-spin text-gray-400" />
                        ) : (
                          <UserMinus size={18} />
                        )}
                      </button>
                    </div>
                  </td>
                </>
              )}
            </tr>
          ))
        )}
      </DataTable>
      {!isLoading && (
        <PaginationFooter
          totalItems={total}
          page={page}
          perPage={PAGE_LIMIT}
          onPageChange={setPage}
          itemLabel="candidates"
        />
      )}
    </>
  );
}

export function InvitedTable({
  onTotalChange,
}: {
  onTotalChange?: (total: number) => void;
} = {}) {
  return <InHouseStaffListTableInner variant="invited" onTotalChange={onTotalChange} />;
}

export function AcceptedTable() {
  return <InHouseStaffListTableInner variant="active" />;
}
