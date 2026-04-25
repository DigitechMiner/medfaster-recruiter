'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { BadgeCheck, Briefcase, MapPin, Star, CalendarCheck, Zap, Phone } from 'lucide-react';
import { useCandidatesList } from '@/hooks/useRecruiterData';
import type { CandidateListItem } from '@/Interface/recruiter.types';

interface Props {
  section: 'nearby' | 'urgent';
  title:   string;
}

/* ─── Score badge: right side of avatar row ─── */
const ScoreBadge = ({ score }: { score: number }) => {
  const borderColor =
    score >= 80 ? 'border-green-500' :
    score >= 60 ? 'border-[#F4781B]' : 'border-red-400';
  const textColor =
    score >= 80 ? 'text-green-600' :
    score >= 60 ? 'text-[#F4781B]'  : 'text-red-500';

  return (
    <div className={`flex items-center gap-1.5 border ${borderColor} rounded-xl px-2.5 py-2 shrink-0`}>
      {/* red phone circle — matches design */}
      <div className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center">
        <Phone className="w-3 h-3 text-red-400" />
      </div>
      <div className="flex flex-col leading-tight">
        <span className={`text-sm font-bold ${textColor}`}>{score}/100</span>
        <span className="text-[10px] text-gray-400">Score</span>
      </div>
    </div>
  );
};

/* ─── Single candidate card ─── */
const CandidateCard = ({
  c,
  section,
  index,
}: {
  c:       CandidateListItem;
  section: 'nearby' | 'urgent';
  index:   number;
}) => {
  const router = useRouter();

  const score     = c.highest_job_interview_score ?? c.highest_interview_score ?? 40;
  const initials  = `${c.first_name?.[0] ?? ''}${c.last_name?.[0] ?? ''}`.toUpperCase();
  const fullName  = c.full_name ?? `${c.first_name ?? ''} ${c.last_name ?? ''}`.trim();
  const specialty = c.specialty?.[0]
    ? c.specialty[0].replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
    : 'Registered Nurse';
  const verified  = Number(c.completion_percentage ?? 0) >= 80;
  const xp        = c.experience_in_months ? `${Math.max(1, Math.round(c.experience_in_months / 12))}+ yrs` : '5+ yrs';
  const dist      = c.distance ? `${c.distance}km` : '25km';
  const rating    = c.avg_rating_score   ? `${c.avg_rating_score}/5`   : '4.8/5';
  const href      = `/candidates/${c.id ?? c.candidate_id}`;

  // Nearby: even index → "Invite For a Job", odd → "Shortlist + Direct Hire"
  const showInviteOnly = section === 'urgent' || index % 2 === 0;

  return (
    <div className="border border-gray-200 rounded-xl p-4 flex flex-col gap-3 bg-white">

      {/* ── Row 1: Online badge (alone, left-aligned) ── */}
      <div>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
          Online
        </span>
      </div>

      {/* ── Row 2: [Avatar] [Name/Specialty/Stats flex-1] [ScoreBadge] ── */}
      <div className="flex items-center gap-3">

        {/* Avatar */}
        <div className="w-12 h-12 rounded-full overflow-hidden bg-orange-50 shrink-0">
          {c.profile_image_url ? (
            <Image
              src={c.profile_image_url}
              alt={fullName}
              width={48}
              height={48}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm font-bold text-[#F4781B]">
              {initials}
            </div>
          )}
        </div>

        {/* Name / Specialty / Stats — grows to fill space */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 min-w-0">
            <span className="text-sm font-bold text-gray-900 truncate">{fullName}</span>
            {verified && (
              <BadgeCheck className="w-4 h-4 shrink-0" fill="#22c55e" color="white" />
            )}
          </div>
          <p className="text-xs text-[#F4781B] font-medium truncate mt-0.5">{specialty}</p>
          <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
            <span className="flex items-center gap-1 text-[11px] text-gray-500">
              <Briefcase size={10} className="text-gray-400" /> {xp}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-gray-500">
              <MapPin size={10} className="text-gray-400" /> {dist}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-gray-500">
              <Star size={10} className="text-yellow-400" fill="#facc15" /> {rating}
            </span>
          </div>
        </div>

        {/* Score badge — right end of this row */}
        <ScoreBadge score={score} />
      </div>

      {/* ── Row 3: Action button(s) ── */}
      {section === 'urgent' ? (
        <button
          onClick={() => router.push('/jobs/urgent-replacement')}
          className="w-full flex items-center justify-center gap-2 text-sm font-semibold border border-green-500 text-green-600 hover:bg-green-50 py-2.5 rounded-xl transition-colors"
        >
          <Zap size={14} fill="#22c55e" className="text-green-500" />
          Hire Instantly
        </button>
      ) : showInviteOnly ? (
        <button
          onClick={() => router.push(href)}
          className="w-full flex items-center justify-center gap-2 text-sm font-semibold border border-[#F4781B] text-[#F4781B] hover:bg-orange-50 py-2.5 rounded-xl transition-colors"
        >
          <CalendarCheck size={14} />
          Invite For a Job
        </button>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => router.push(href)}
            className="flex-1 text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 py-2.5 rounded-xl transition-colors"
          >
            Shortlist
          </button>
          <button
            onClick={() => router.push(href)}
            className="flex-1 text-sm font-semibold bg-[#F4781B] hover:bg-orange-600 text-white py-2.5 rounded-xl transition-colors"
          >
            Direct Hire
          </button>
        </div>
      )}

    </div>
  );
};

/* ─── Section wrapper ─── */
export const BottomCandidateCards = ({ section, title }: Props) => {
  const router = useRouter();
  const { data, isLoading } = useCandidatesList({
    page:  1,
    limit: 3,
    ...(section === 'urgent' ? { is_ai_recommended: true } : {}),
  });
  const candidates = data?.data?.candidates ?? [];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        <button
          onClick={() => router.push('/candidates')}
          className="text-xs text-[#F4781B] font-medium hover:underline"
        >
          View all
        </button>
      </div>

      {/* Cards list */}
      <div className="flex flex-col gap-3">
        {isLoading ? (
          [...Array(2)].map((_, i) => (
            <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />
          ))
        ) : candidates.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No candidates found</p>
        ) : (
          candidates.map((c: CandidateListItem, i: number) => (
            <CandidateCard
              key={c.id ?? c.candidate_id ?? i}
              c={c}
              section={section}
              index={i}
            />
          ))
        )}
      </div>
    </div>
  );
};