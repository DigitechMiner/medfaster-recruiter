'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { MapPin, Briefcase, Star, Zap, Calendar } from "lucide-react";
import { useState } from "react";
import type { CandidateCardVM } from '@/Interface/view-models';
import ScoreCard from "@/components/card/scorecard";
import { BaseCard, CardHeader, CardIdentity, CardStats } from "@/components/candidate/BaseCard";

type ActionType = "shortlist" | "hire" | "schedule" | "invite";

// ── Pills ─────────────────────────────────────────────────────────
const LeftPill = ({ text }: { text: string }) => {
  const isOnline = text.toLowerCase() === "online";
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2.5 py-1 rounded-full border
      ${isOnline ? "border-green-400 text-green-600 bg-green-50" : "border-[#F4781B] text-[#F4781B] bg-orange-50"}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isOnline ? "bg-green-500" : "bg-[#F4781B]"}`} />
      {text}
    </span>
  );
};

const RightPill = ({ text }: { text: string }) => {
  const t = text.toLowerCase();
  if (t.includes("most") || t.includes("best choice"))
    return <span className="inline-flex items-center text-[10px] font-semibold px-2.5 py-1 rounded-full bg-[#12B76A] text-white">{text}</span>;
  if (t.includes("night shift"))
    return <span className="inline-flex items-center text-[10px] font-semibold px-2.5 py-1 rounded-full bg-gray-900 text-white">{text}</span>;
  if (t.includes("high demand"))
    return <span className="inline-flex items-center text-[10px] font-semibold px-1 py-0.5 rounded-full border border-red-500 text-red-500 bg-red-50 tracking-tight">{text}</span>;
  return <span className="inline-flex items-center text-[10px] font-semibold px-2.5 py-1 rounded-full border border-[#F4781B] text-[#F4781B] bg-orange-50">{text}</span>;
};

const Verified = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="#3b82f6" className="shrink-0 inline-block ml-0.5">
    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
  </svg>
);

// ── Action buttons ─────────────────────────────────────────────────
const ActionButtons = ({ actionType, score, onOpenModal }: {
  actionType:   ActionType;
  score:        number;
  onOpenModal:  () => void;
}) => {
  const open = (e: React.MouseEvent) => { e.stopPropagation(); onOpenModal(); };

  if (actionType === "hire") return (
    <button onClick={open} className="w-full flex items-center justify-center gap-1.5 bg-green-50 border border-green-400 text-green-600 text-xs font-semibold py-2 rounded-xl hover:bg-green-100 transition-colors">
      <Zap size={12} fill="#16a34a" stroke="#16a34a" /> Hire Instantly
    </button>
  );

  if (actionType === "schedule") return score >= 80 ? (
    <div className="flex gap-2">
      <button onClick={open} className="flex-1 border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-medium py-2 rounded-xl transition-colors">Schedule Interview</button>
      <button onClick={open} className="flex-1 border border-[#F4781B] text-[#F4781B] hover:bg-orange-50 text-xs font-semibold py-2 rounded-xl transition-colors">Direct Hire</button>
    </div>
  ) : (
    <button onClick={open} className="w-full border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-medium py-2 rounded-xl transition-colors">Schedule Interview</button>
  );

  if (actionType === "invite") return (
    <button onClick={open} className="w-full flex items-center justify-center gap-1.5 border border-[#F4781B] text-[#F4781B] hover:bg-orange-50 text-xs font-semibold py-2 rounded-xl transition-colors">
      <Calendar size={11} /> Invite For a Job
    </button>
  );

  return score >= 75 ? (
    <div className="flex gap-2">
      <button onClick={open} className="flex-1 bg-[#F4781B] hover:bg-[#e06a10] text-white text-xs font-semibold py-2 rounded-xl transition-colors">Shortlist</button>
      <button onClick={open} className="flex-1 border border-[#F4781B] text-[#F4781B] hover:bg-orange-50 text-xs font-semibold py-2 rounded-xl transition-colors bg-orange-50/50">Direct Hire</button>
    </div>
  ) : (
    <button onClick={open} className="w-full bg-[#F4781B] hover:bg-[#e06a10] text-white text-xs font-semibold py-2 rounded-xl transition-colors">Shortlist</button>
  );
};

// ── Card ──────────────────────────────────────────────────────────
export const BoardCandidateCard = ({ c, actionType, leftTag, rightTag }: {
  c:            CandidateCardVM;
  actionType:   ActionType;
  leftTag?:     string;
  rightTag?:    string;
}) => {
  const router = useRouter();
  const [_showModal, setShowModal] = useState(false);

  const score    = c.interview_score ?? 0;
  const hasScore = c.interview_score !== null;

  // leftTag overrides → fallback to is_online → fallback to work_eligibility
  const pillLeft  = leftTag  ?? (c.is_online ? "Online" : c.work_eligibility ?? "Active");
  const pillRight = rightTag ?? null;

  return (
    <>
      <BaseCard
        onClick={() => router.push(c.href)}
        className="flex flex-col gap-2 p-3 rounded-xl border border-gray-200 bg-white hover:border-orange-300 hover:shadow-sm transition-all cursor-pointer"
      >
        <CardHeader className="flex items-center justify-between gap-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <LeftPill text={pillLeft} />
          </div>
          {pillRight && <RightPill text={pillRight} />}
        </CardHeader>

        <CardIdentity className="flex items-start gap-2">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-orange-50 shrink-0 border border-gray-100">
            {c.profile_image_url ? (
              <Image src={c.profile_image_url} alt={c.full_name} width={40} height={40} className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm font-bold text-[#F4781B]">{c.initials}</div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 leading-tight">
              {c.full_name}<Verified />
            </p>
            <p className="text-[11px] text-[#F4781B] font-medium mt-0.5">{c.designation}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">
              Dept: <span className="text-gray-600">{c.department}</span>
            </p>
          </div>
          {hasScore
            ? <ScoreCard category="good" score={score} maxScore={100} />
            : <ScoreCard category="none" score={0} maxScore={100} noBackground />
          }
        </CardIdentity>

        <CardStats className="flex items-center gap-2 text-[10px] text-gray-500 flex-wrap">
          <span className="flex items-center gap-1"><Briefcase size={10} className="text-gray-400" /> {c.experience}</span>
          <span className="text-gray-300">|</span>
          <span className="flex items-center gap-0.5"><MapPin size={9} className="text-green-500" /> {c.distance}</span>
          <span className="text-gray-300">|</span>
          <span className="flex items-center gap-0.5"><Star size={9} className="fill-yellow-400 text-yellow-400" /> {c.rating ? `${c.rating}/5` : 'N/A'}</span>
        </CardStats>

        <div onClick={(e) => e.stopPropagation()}>
          <ActionButtons actionType={actionType} score={score} onOpenModal={() => setShowModal(true)} />
        </div>
      </BaseCard>

      {/* {showModal && (
        <CandidateActionModal actionType={actionType} candidate={c} onClose={() => setShowModal(false)} />
      )} */}
    </>
  );
};