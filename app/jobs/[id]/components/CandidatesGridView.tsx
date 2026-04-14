"use client";

import React from "react";
import { Star, Briefcase, Users } from "lucide-react";
import ScoreCard from "@/components/card/scorecard";
import Image from "next/image";
import { BaseCard, CardHeader, CardIdentity, CardStats } from "@/components/candidate/BaseCard";
import { renderCandidateCards } from "@/components/candidate/renderers";

const DUMMY_CANDIDATES = [
  { id: '1', name: 'Michael Liam', role: 'Registered Nurse', exp: '5+ yrs', distance: '25km', rating: 4.8, score: 40, online: true, avatar: '/icon/card-doctor.svg' },
  { id: '2', name: 'Michael Liam', role: 'Registered Nurse', exp: '5+ yrs', distance: '25km', rating: 4.8, score: 40, online: true, avatar: '/icon/card-doctor.svg' },
];

interface Props { jobId: string; }

export const CandidatesGridView: React.FC<Props> = () => {
  const candidates = DUMMY_CANDIDATES;

  if (candidates.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {renderCandidateCards(candidates, (c) => (
        <CandidateGridCard key={c.id} candidate={c} />
      ))}
    </div>
  );
};

export function CandidateGridCard({ candidate: c }: { candidate: typeof DUMMY_CANDIDATES[0] }) {
  return (
    <BaseCard
      className="bg-white rounded-2xl border border-gray-100 p-3 flex flex-col pt-1 w-7/8"
      style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.06)', gap: '6px' }}
    >
      {/* Row 1: Online badge + ScoreCard on same row */}
      <CardHeader className="flex items-center justify-between -pt-1">
        <span className="flex items-center gap-1.5 text-xs font-medium text-green-600
          bg-green-50 px-2.5 py-1 rounded-full border border-green-200 w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          Online
        </span>
        <ScoreCard maxScore={100} category="good" score={c.score} className="p-1.5 mt-3" />
      </CardHeader>

      {/* Row 2: Avatar + Info block */}
      <CardIdentity className="flex gap-2 pb-1 -mt-2" style={{ alignItems: 'flex-start' }}>

        {/* Avatar */}
        <div className="relative w-16 h-16 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0 overflow-hidden border border-orange-100 mb-1">
          {c.avatar ? (
            <Image src={c.avatar} alt={c.name} fill className="object-cover" />
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#6366f1">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
            </svg>
          )}
        </div>

        {/* Info block */}
        <div className="flex-1 min-w-0" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

          {/* Name + verified */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', minWidth: 0 }}>
            <span className="text-sm font-bold text-gray-900 truncate">{c.name}</span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#22c55e" style={{ flexShrink: 0 }}>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>

          {/* Role */}
          <span
            className="text-xs font-medium text-[#F4781B]"
            style={{ lineHeight: '1.2', marginTop: '0px' }}
          >
            {c.role}
          </span>

          {/* Stats */}
          <CardStats
            className="text-xs text-gray-500"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Briefcase size={11} className="text-gray-400" />
              {c.exp}
            </span>
            <span className="text-gray-300">|</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Users size={11} className="text-gray-400" />
              {c.distance}
            </span>
            <span className="text-gray-300">|</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Star size={11} className="fill-amber-400 text-amber-400" />
              {c.rating}/5
            </span>
          </CardStats>

        </div>
      </CardIdentity>

      {/* View Schedule */}
      <button
        className="w-full rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        style={{ paddingTop: '8px', paddingBottom: '8px', marginTop: '2px' }}
      >
        View Schedule
      </button>
    </BaseCard>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
      <div className="w-24 h-24 opacity-60">
        <svg viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="20" y="16" width="56" height="68" rx="6" fill="#e5e7eb"/>
          <rect x="32" y="8" width="32" height="16" rx="4" fill="#d1d5db"/>
          <line x1="32" y1="44" x2="64" y2="44" stroke="#9ca3af" strokeWidth="3" strokeLinecap="round"/>
          <line x1="32" y1="56" x2="56" y2="56" stroke="#9ca3af" strokeWidth="3" strokeLinecap="round"/>
          <circle cx="76" cy="76" r="14" fill="#f9fafb" stroke="#e5e7eb" strokeWidth="2"/>
          <path d="M70 76 Q76 68 82 76" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" fill="none"/>
        </svg>
      </div>
      <p className="text-sm font-semibold text-gray-700">No Candidate Yet Accepted This Urgent Shift</p>
      <p className="text-sm text-gray-400">
        Try Our{' '}
        <span className="text-[#F4781B] font-semibold cursor-pointer inline-flex items-center gap-0.5">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="#F4781B">
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
          </svg>
          KeRaeva&apos;s AI
        </span>{' '}
        to Invite Available Candidates For This Shift
      </p>
    </div>
  );
}