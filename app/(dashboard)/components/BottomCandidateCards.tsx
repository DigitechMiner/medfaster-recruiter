'use client';

import { useRouter } from 'next/navigation';
import { CalendarCheck, Zap,  } from 'lucide-react';
import { useCandidateCards } from '@/hooks/useCandidateCards';
import type { CandidateCardVM } from '@/Interface/view-models';
import { CandidateCardShell } from '@/components/candidate/CandidateCardShell';
interface Props {
  section: 'nearby' | 'urgent';
  title:   string;
}

// ── Static preview data — exact shape of CandidateCardVM ──────────────────────
const STATIC_CARDS: CandidateCardVM[] = [
  {
    id:                 'static-1',
    application_id:     'app-static-1',
    full_name:          'Sarah Jenkins',
    initials:           'SJ',
    profile_image_url:  null,
    designation:        'Registered Nurse',
    department:         'Nursing',
    experience:         '5+ yrs',
    distance:           '12km',
    interview_score:    87,
    rating:             4.8,
    work_eligibility:   'Canadian Citizen',
    is_online:          true,
    application_status: 'APPLIED',
    href:               '/candidates/static-1',
  },
  {
    id:                 'static-2',
    application_id:     'app-static-2',
    full_name:          'Michael Lee',
    initials:           'ML',
    profile_image_url:  null,
    designation:        'Care Aide',
    department:         'Long-Term Care',
    experience:         '3+ yrs',
    distance:           '8km',
    interview_score:    62,
    rating:             4.2,
    work_eligibility:   'PR',
    is_online:          false,
    application_status: 'SHORTLISTED',
    href:               '/candidates/static-2',
  },
  {
    id:                 'static-3',
    application_id:     'app-static-3',
    full_name:          'Priya Sharma',
    initials:           'PS',
    profile_image_url:  null,
    designation:        'Medical Lab Technician',
    department:         'Laboratory',
    experience:         '7+ yrs',
    distance:           '25km',
    interview_score:    null,
    rating:             4.5,
    work_eligibility:   'Work Permit',
    is_online:          true,
    application_status: 'APPLIED',
    href:               '/candidates/static-3',
  },
];

/* ─── Single candidate card ─── */
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
      <button onClick={() => router.push('/jobs/urgent-replacement')}
        className="w-full flex items-center justify-center gap-2 text-sm font-semibold border border-green-500 text-green-600 hover:bg-green-50 py-2.5 rounded-xl transition-colors">
        <Zap size={14} fill="#22c55e" className="text-green-500" /> Hire Instantly
      </button>
    ) : showInviteOnly ? (
      <button onClick={() => router.push(vm.href)}
        className="w-full flex items-center justify-center gap-2 text-sm font-semibold border border-[#F4781B] text-[#F4781B] hover:bg-orange-50 py-2.5 rounded-xl transition-colors">
        <CalendarCheck size={14} /> Invite For a Job
      </button>
    ) : (
      <div className="flex gap-2">
        <button onClick={() => router.push(vm.href)} className="flex-1 text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 py-2.5 rounded-xl transition-colors">Shortlist</button>
        <button onClick={() => router.push(vm.href)} className="flex-1 text-sm font-semibold bg-[#F4781B] hover:bg-orange-600 text-white py-2.5 rounded-xl transition-colors">Direct Hire</button>
      </div>
    )
  }
/>
  );
};

/* ─── Section wrapper ─── */
export const BottomCandidateCards = ({ section, title }: Props) => {
  const router = useRouter();
  const { cards, isLoading } = useCandidateCards({
    page:  1,
    limit: 3,
    ...(section === 'urgent' ? { is_ai_recommended: true } : {}),
  });

  // Use real data if available, fall back to static for preview
  const displayCards = cards.length > 0 ? cards : STATIC_CARDS;

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
        ) : (
          displayCards.map((vm, i) => (
            <CandidateCard key={vm.id} vm={vm} section={section} index={i} />
          ))
        )}
      </div>
    </div>
  );
};

// Named export so other components can reuse just the card
export { CandidateCard };
export type { CandidateCardVM };