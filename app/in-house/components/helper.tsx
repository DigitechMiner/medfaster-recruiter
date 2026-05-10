'use client';

import Image from 'next/image';
import { apiRequest, getBackendImageUrl } from '@/stores/api/api-client';
import { ENDPOINTS } from '@/stores/api/api-endpoints';

export type InHouseCandidateMapStatus = 'active' | 'invited';

interface RawInHouseCandidateBase {
  id: string;
  mapping_id: string;
  invited_at: string;
  first_name?: string | null;
  last_name?: string | null;
  profile_image_url?: string | null;
  city?: string | null;
  state?: string | null;
}

/**
 * API shape for in-house candidates.
 * `joined_at` is only present when `status === 'active'`.
 */
export type RawInHouseCandidate =
  | (RawInHouseCandidateBase & { status: 'invited' })
  | (RawInHouseCandidateBase & { status: 'active'; joined_at: string });

interface InHouseListResponse {
  success: boolean;
  message: string;
  data: { candidates: RawInHouseCandidate[] };
}

export function candidateId(c: RawInHouseCandidate): string {
  return c.id.trim();
}

export function candidateFirstLastName(c: RawInHouseCandidate): string {
  const parts = [c.first_name, c.last_name].filter(Boolean).join(' ').trim();
  return parts || '—';
}

function titleCaseLocationPart(s: string): string {
  return s.replace(/\b\w/g, (ch) => ch.toUpperCase());
}

export function locationLine(c: RawInHouseCandidate): string {
  const parts = [c.city, c.state]
    .filter((p): p is string => Boolean(p?.trim()))
    .map(titleCaseLocationPart);
  return parts.join(', ') || '—';
}

/** Relative API paths or absolute URLs for Next/Image `src`. */
export function candidateAvatarSrc(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;
  const resolved = getBackendImageUrl(url);
  return resolved || null;
}

export function fetchInHouseCandidates(
  status: InHouseCandidateMapStatus,
): Promise<InHouseListResponse> {
  return apiRequest<InHouseListResponse>(ENDPOINTS.INHOUSE_CANDIDATES, {
    method: 'GET',
    params: { status },
  });
}

export const PAGE_LIMIT = 10;

export const TD = 'text-[13px] text-gray-700 py-3.5 px-4 border-t border-gray-100';

export function formatShortDate(iso: string): string {
  if (!iso?.trim()) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function inviteStatusPillClass(status: string): string {
  const s = status.toLowerCase();
  if (s === 'registered' || s === 'accepted') return 'bg-green-50 text-green-700 border border-green-200';
  if (s === 'pending') return 'bg-orange-50 text-orange-600 border border-orange-100';
  if (s === 'expired' || s === 'cancelled') return 'bg-gray-100 text-gray-600 border border-gray-200';
  return 'bg-gray-50 text-gray-700 border border-gray-200';
}

export function formatInviteStatusLabel(status: string): string {
  if (!status?.trim()) return '—';
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Mapping status from in-house staff list (`active` | `invited`). */
export function InHouseMappingStatusPill({ status }: { status: string }) {
  const s = status?.toLowerCase() ?? '';
  if (s === 'active') {
    return (
      <span className="text-[12px] font-medium px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
        Active
      </span>
    );
  }
  if (s === 'invited') {
    return (
      <span className="text-[12px] font-medium px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-100">
        Invited
      </span>
    );
  }
  return (
    <span className="text-[12px] font-medium px-2.5 py-1 rounded-full bg-gray-50 text-gray-700 border border-gray-200">
      {status?.trim() ? formatInviteStatusLabel(status) : '—'}
    </span>
  );
}

export function EmptyState({ message, sub }: { message: string; sub: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="relative w-36 h-36">
        <Image src="/svg/empty-job.svg" alt={message} fill sizes="144px" className="object-contain" />
      </div>
      <div className="text-center">
        <p className="text-[15px] font-bold text-gray-800">{message}</p>
        <p className="text-[13px] text-gray-400 mt-1 max-w-xs">{sub}</p>
      </div>
    </div>
  );
}

export function SkeletonRows({ cols }: { cols: number }) {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <tr key={`skeleton-row-${i}`} className="animate-pulse">
          {Array.from({ length: cols }).map((_, j) => (
            <td key={`skeleton-col-${i}-${j}`} className={TD}>
              <div className="h-3.5 bg-gray-100 rounded w-3/4" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
