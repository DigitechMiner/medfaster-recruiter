'use client';

import { useState, type MouseEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Building2, Calendar, MapPin, Star } from 'lucide-react';
import type { CandidateCardVM } from '@/types/view-models';
import { addInHouseCandidate } from '@/features/jobs';
import { DataTable } from '@/components/table/DataTable';
import { PaginationFooter } from '@/components/table/PaginationFooter';

/** Job title line: full label when one role; `RN | LPN | PSW` when several (orange, uppercase). */
export function JobTitlesLine({
  designation,
  jobTitleLabelCount,
  className = '',
}: {
  designation: string;
  jobTitleLabelCount: number;
  className?: string;
}) {
  if (!designation || designation === '—') {
    return <span className={['text-[11px] text-gray-400', className].filter(Boolean).join(' ')}>—</span>;
  }
  const multi = jobTitleLabelCount > 1;
  if (multi) {
    return (
      <p
        className={[
          'text-xs font-semibold uppercase tracking-wide text-[#F4781B]',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {designation}
      </p>
    );
  }
  return (
    <p className={['text-[11px] font-medium text-[#F4781B]', className].filter(Boolean).join(' ')}>{designation}</p>
  );
}

/** invited | active → show label; otherwise show Add in house */
export function parseInHouseStatusForInviteSlot(
  raw: string | null | undefined,
): 'invited' | 'active' | null {
  const s = (raw ?? '').trim().toLowerCase();
  if (s === 'invited') return 'invited';
  if (s === 'active') return 'active';
  return null;
}

type InHouseInviteVariant = 'card' | 'compact';

export function InHouseInviteSecondSlot({
  variant,
  inHouseStatus,
  onAddInHouse,
  pending,
}: {
  variant: InHouseInviteVariant;
  inHouseStatus?: string | null;
  onAddInHouse?: (e: MouseEvent) => void;
  pending?: boolean;
}) {
  const kind = parseInHouseStatusForInviteSlot(inHouseStatus);

  const invitedPill =
    variant === 'card'
      ? 'flex-1 min-w-0 inline-flex items-center justify-center text-xs font-semibold py-2 rounded-xl border border-orange-200 bg-orange-50 text-[#F4781B] whitespace-nowrap'
      : 'inline-flex shrink-0 items-center justify-center text-xs font-semibold px-3 py-1.5 rounded-xl border border-orange-200 bg-orange-50 text-[#F4781B] whitespace-nowrap';

  const activePill =
    variant === 'card'
      ? 'flex-1 min-w-0 inline-flex items-center justify-center text-xs font-semibold py-2 rounded-xl border border-green-300 bg-green-50 text-green-700 whitespace-nowrap'
      : 'inline-flex shrink-0 items-center justify-center text-xs font-semibold px-3 py-1.5 rounded-xl border border-green-300 bg-green-50 text-green-700 whitespace-nowrap';

  if (kind === 'invited') {
    return <span className={invitedPill}>In-house invited</span>;
  }
  if (kind === 'active') {
    return <span className={activePill}>Active in-house</span>;
  }

  const btnCard =
    'flex-1 min-w-0 flex items-center justify-center gap-1.5 border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold py-2 rounded-xl transition-colors disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap';
  const btnCompact =
    'inline-flex shrink-0 items-center gap-1 border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50 whitespace-nowrap';

  return (
    <button
      type="button"
      onClick={(e) => onAddInHouse?.(e)}
      disabled={!onAddInHouse || pending}
      className={variant === 'card' ? btnCard : btnCompact}
    >
      <Building2 size={11} className="shrink-0" /> Add in house
    </button>
  );
}

function PoolListRow({
  c,
  onOpenInviteJob,
}: {
  c: CandidateCardVM;
  onOpenInviteJob?: () => void;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [addInHousePending, setAddInHousePending] = useState(false);
  const score = c.interview_score ?? 0;
  const handleAddInHouse = async () => {
    if (addInHousePending || !c.id) return;
    setAddInHousePending(true);
    try {
      await addInHouseCandidate(c.id);
      toast.success('Candidate added to in-house');
      await queryClient.invalidateQueries({ queryKey: ['inhouse-candidates'] });
      await queryClient.invalidateQueries({ queryKey: ['recruiter-candidates'] });
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        (err instanceof Error ? err.message : 'Could not add to in-house');
      toast.error(msg);
    } finally {
      setAddInHousePending(false);
    }
  };
  return (
    <tr onClick={() => router.push(c.href)} className="border-b border-gray-50 hover:bg-orange-50/40 cursor-pointer transition-colors group">
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full overflow-hidden bg-orange-50 shrink-0 border border-gray-100">
            <Image src={c.profile_image_url || '/svg/Photo.svg'} alt={c.full_name} width={36} height={36} className="object-cover w-full h-full" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900">{c.full_name}</p>
          </div>
        </div>
      </td>
      <td className="py-4 px-4 whitespace-nowrap align-top">
        <span
          className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
            c.is_active === false
              ? 'border-gray-300 text-gray-600 bg-gray-50'
              : 'border-green-400 text-green-700 bg-green-50'
          }`}
        >
          {c.is_active === false ? 'Inactive' : 'Active'}
        </span>
      </td>
      <td className="py-4 px-4 text-xs align-top min-w-[160px]">
        <JobTitlesLine designation={c.designation} jobTitleLabelCount={c.job_title_labels.length} />
      </td>
      <td className="py-4 px-4 text-xs text-gray-600">{c.experience}</td>
      <td className="py-4 px-4"><span className="flex items-center gap-1 text-xs text-gray-500"><MapPin size={11} className="text-green-500" /> {c.distance}</span></td>
      <td className="py-4 px-4 text-xs font-semibold text-gray-800">{score > 0 ? `${score}/100` : '—'}</td>
      <td className="py-4 px-4"><span className="flex items-center gap-1 text-xs text-yellow-600"><Star size={11} className="fill-yellow-400 text-yellow-400" />{c.rating ? `${c.rating}/5` : '—'}</span></td>
      <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-nowrap items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenInviteJob?.();
            }}
            className="inline-flex shrink-0 items-center gap-1 border border-orange-200 text-[#F4781B] hover:bg-orange-50 text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap"
          >
            <Calendar size={11} className="shrink-0" /> Invite job
          </button>
          <InHouseInviteSecondSlot
            variant="compact"
            inHouseStatus={c.in_house_status}
            onAddInHouse={(e) => {
              e.stopPropagation();
              void handleAddInHouse();
            }}
            pending={addInHousePending}
          />
        </div>
      </td>
    </tr>
  );
}

export function CandidatesPoolTableView({
  cards,
  isLoading,
  total,
  page,
  pageLimit,
  onPageChange,
  onOpenInviteJob,
}: {
  cards: CandidateCardVM[];
  isLoading: boolean;
  total: number;
  page: number;
  pageLimit: number;
  onPageChange: (page: number) => void;
  onOpenInviteJob: (candidate: CandidateCardVM) => void;
}) {
  if (isLoading) {
    return <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />;
  }
  return (
    <>
      <DataTable
        headers={['Candidate Name', 'Status', 'Designation', 'Experience', 'Distance', 'General Scoring', 'Rating', 'Action']}
        minWidthClassName="min-w-full"
        tableClassName="text-left"
      >
        {cards.length === 0 ? (
          <tr>
            <td colSpan={8} className="px-4 py-16 text-center text-gray-400 text-sm">
              No candidates match your filters.
            </td>
          </tr>
        ) : (
          cards.map((c, j) => (
            <PoolListRow
              key={c.id ?? j}
              c={c}
              onOpenInviteJob={() => onOpenInviteJob(c)}
            />
          ))
        )}
      </DataTable>
      <PaginationFooter totalItems={total} page={page} perPage={pageLimit} onPageChange={onPageChange} itemLabel="candidates" />
    </>
  );
}
