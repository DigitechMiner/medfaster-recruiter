'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import type { ReferralInviteListItem } from '@/features/candidates';
import { DataTable } from '@/components/table/DataTable';
import { PaginationFooter } from '@/components/table/PaginationFooter';
import { getReferralInvites } from '@/features/candidates';
import {
  EmptyState,
  formatInviteStatusLabel,
  formatShortDate,
  inviteStatusPillClass,
  PAGE_LIMIT,
  SkeletonRows,
  TD,
} from './helper';

export function ReferralInviteTable({
  onTotalChange,
}: {
  onTotalChange?: (total: number) => void;
} = {}) {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['referral-invites', { page, limit: PAGE_LIMIT }],
    queryFn: () => getReferralInvites({ page, limit: PAGE_LIMIT }),
  });

  const payload = data?.data;
  const rows: ReferralInviteListItem[] = payload?.invites ?? [];
  const total = payload?.pagination?.total ?? 0;

  useEffect(() => {
    onTotalChange?.(total);
  }, [total, onTotalChange]);

  if (!isLoading && rows.length === 0)
    return (
      <div className="flex flex-col">
        <EmptyState
          message="No referral invites yet"
          sub="Send email invites so candidates can register with your referral code."
        />
      </div>
    );

  return (
    <>
      <DataTable
        headers={['Name', 'Email', 'Status', 'Sent', 'Expires', 'Registered at']}
        minWidthClassName="min-w-full"
        headerRowClassName="bg-orange-50/60"
      >
        {isLoading ? (
          <SkeletonRows cols={6} />
        ) : (
          rows.map((r) => (
            <tr key={r.invite_id} className="hover:bg-gray-50/60 transition-colors">
              <td className={TD}>
                {r.candidate_id ? (
                  <Link
                    href={`/candidates/${r.candidate_id}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                  >
                    {r.name?.trim() || '—'}
                  </Link>
                ) : (
                  r.name?.trim() || '—'
                )}
              </td>
              <td className={TD}>{r.email ?? '—'}</td>
              <td className={TD}>
                <span
                  className={`inline-flex text-[12px] font-medium px-2.5 py-1 rounded-full ${inviteStatusPillClass(r.status)}`}
                >
                  {formatInviteStatusLabel(r.status)}
                </span>
              </td>
              <td className={TD}>{formatShortDate(r.sent_at ?? '')}</td>
              <td className={TD}>{formatShortDate(r.expires_at ?? '')}</td>
              <td className={TD}>{formatShortDate(r.registered_at ?? '')}</td>
            </tr>
          ))
        )}
      </DataTable>
      {!isLoading  && (
        <PaginationFooter
          totalItems={total}
          page={page}
          perPage={PAGE_LIMIT}
          onPageChange={setPage}
          itemLabel="invites"
        />
      )}
    </>
  );
}
