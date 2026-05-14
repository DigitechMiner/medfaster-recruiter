'use client';

import type { ReactNode } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Briefcase, CalendarCheck, MapPin, Star, Zap } from 'lucide-react';
import { useCandidateCards } from '@/hooks/useCandidateCards';
import type { CandidateCardVM } from '@/types/view-models';
import ScoreCard from '@/components/card/scorecard';
import { JobTitlesLine } from '@/app/candidates/components/TableView';

interface Props {
  section: 'nearby' | 'urgent';
  title:   string;
}

interface CandidateCardShellProps {
  vm: CandidateCardVM;
  statusPill?: ReactNode;
  actions: ReactNode;
  onClick?: () => void;
}

const VerifiedBadge = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="#22c55e" className="shrink-0">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
);

function CandidateCardShell({
  vm,
  statusPill,
  actions,
  onClick,
}: CandidateCardShellProps) {
  return (
    <div
      onClick={onClick}
      className={`relative border border-gray-200 rounded-xl p-4 flex flex-col gap-3 bg-white
        ${onClick ? 'hover:border-orange-300 hover:shadow-sm transition-all cursor-pointer' : ''}`}
    >
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

      {statusPill ? (
        <div>{statusPill}</div>
      ) : (
        <div className="mt-2" />
      )}

      <div className={`flex items-center gap-3 ${vm.is_online ? '' : 'mt-4'}`}>
        <div className="w-12 h-12 rounded-full overflow-hidden bg-orange-50 shrink-0">
          {vm.profile_image_url ? (
            <Image
              src={vm.profile_image_url}
              alt={vm.full_name}
              width={48}
              height={48}
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
          <div className="mt-0.5 min-w-0">
            <JobTitlesLine designation={vm.designation} jobTitleLabelCount={vm.job_title_labels.length} />
          </div>
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

      <div onClick={(e) => e.stopPropagation()}>
        {actions}
      </div>
    </div>
  );
}

const CandidateCard = ({
  vm, section, index,
}: {
  vm:      CandidateCardVM;
  section: 'nearby' | 'urgent';
  index:   number;
}) => {
  const router = useRouter();
  const showInviteOnly = section === 'urgent' || index % 2 === 0;

  return (
    <CandidateCardShell
      vm={vm}
      statusPill={
        vm.is_online ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
            Online
          </span>
        ) : undefined
      }
      actions={
        section === 'urgent' ? (
          <button
            onClick={() => router.push('/jobs/create/instant')}
            className="w-full flex items-center justify-center gap-2 text-sm font-semibold border border-green-500 text-green-600 hover:bg-green-50 py-2.5 rounded-xl transition-colors"
          >
            <Zap size={14} fill="#22c55e" className="text-green-500" /> Hire Instantly
          </button>
        ) : showInviteOnly ? (
          <button
            onClick={() => router.push(`/candidates/${vm.id}`)}
            className="w-full flex items-center justify-center gap-2 text-sm font-semibold border border-[#F4781B] text-[#F4781B] hover:bg-orange-50 py-2.5 rounded-xl transition-colors"
          >
            <CalendarCheck size={14} /> Invite For a Job
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => router.push(`/candidates/${vm.id}`)}
              className="flex-1 text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 py-2.5 rounded-xl transition-colors"
            >
              Shortlist
            </button>
            <button
              onClick={() => router.push(`/candidates/${vm.id}`)}
              className="flex-1 text-sm font-semibold bg-[#F4781B] hover:bg-orange-600 text-white py-2.5 rounded-xl transition-colors"
            >
              Direct Hire
            </button>
          </div>
        )
      }
    />
  );
};

export const BottomCandidateCards = ({ section, title }: Props) => {
  const router = useRouter();
  const { cards, isLoading } = useCandidateCards({
    page:  1,
    limit: 3,
    ...(section === 'urgent' ? { is_ai_recommended: true } : {}),
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        <button
          onClick={() => router.push('/candidates')}
          className="text-xs text-[#F4781B] font-medium hover:underline"
        >
          View all
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />
          ))
        ) : cards.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No candidates found.</p>
        ) : (
          cards.map((vm, i) => (
            <CandidateCard key={`${vm.application_id}-${vm.id}-${i}`} vm={vm} section={section} index={i} />
          ))
        )}
      </div>
    </div>
  );
};

export { CandidateCard };
export type { CandidateCardVM };