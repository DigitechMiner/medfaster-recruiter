'use client';

import Image from 'next/image';
import { Briefcase, MapPin, Star } from 'lucide-react';
import ScoreCard from '@/components/card/scorecard';
import type { CandidateCardVM } from '@/Interface/view-models';

interface CandidateCardShellProps {
  vm:          CandidateCardVM;
  statusPill?: React.ReactNode;   // left pill slot — if null, gap added automatically
  actions:     React.ReactNode;   // bottom action row slot
  onClick?:    () => void;
}

const VerifiedBadge = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="#22c55e" className="shrink-0">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
  </svg>
);

export function CandidateCardShell({
  vm, statusPill, actions, onClick,
}: CandidateCardShellProps) {
  return (
    <div
      onClick={onClick}
      className={`relative border border-gray-200 rounded-xl p-4 flex flex-col gap-3 bg-white
        ${onClick ? 'hover:border-orange-300 hover:shadow-sm transition-all cursor-pointer' : ''}`}
    >
      {/* ScoreCard — absolute, never affects layout */}
      {vm.interview_score !== null && (
        <div className="absolute top-4 right-4 z-10">
          <ScoreCard
            category="candidate-score"
            score={vm.interview_score}
            maxScore={100}
            className="shrink-0"
          />
        </div>
      )}

      {/* Status pill row — adds gap when absent */}
      {statusPill ? (
        <div>{statusPill}</div>
      ) : (
        <div className="mt-2" />
      )}

      {/* Identity row */}
      <div className={`flex items-center gap-3 ${vm.is_online ? '' : 'mt-4'}`}>
        <div className="w-12 h-12 rounded-full overflow-hidden bg-orange-50 shrink-0">
          {vm.profile_image_url ? (
            <Image
              src={vm.profile_image_url}
              alt={vm.full_name}
              width={48} height={48}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm font-bold text-[#F4781B]">
              {vm.initials}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 min-w-0">
            <span className="text-sm font-bold text-gray-900 truncate">{vm.full_name}</span>
            <VerifiedBadge />
          </div>
          <p className="text-xs text-[#F4781B] font-medium truncate mt-0.5">{vm.designation}</p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="flex items-center gap-1 text-[11px] text-gray-500">
              <Briefcase size={10} className="text-gray-400" /> {vm.experience}
            </span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-1 text-[11px] text-gray-500">
              <MapPin size={10} className="text-gray-400" /> {vm.distance}
            </span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-1 text-[11px] text-gray-500">
              <Star size={10} className="text-yellow-400" fill="#facc15" />
              {vm.rating ? `${vm.rating}/5` : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Actions slot */}
      <div onClick={(e) => e.stopPropagation()}>
        {actions}
      </div>
    </div>
  );
}