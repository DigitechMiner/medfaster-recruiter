"use client";
import Image from "next/image";
import { MapPin, Briefcase, Zap, CalendarDays, BadgeCheck } from "lucide-react";
import { useState } from "react";
import { useCandidatesList } from "@/hooks/useRecruiterData";
import type { CandidateListItem } from '@/Interface/recruiter.types';

interface CardData {
  name: string;
  role: string;
  exp: string;
  type: string;
  dist: string;
  score: number;
  verified: boolean;
  badge: string | null;
  badge2: string | null;
  img: string;
}

const toCardData = (c: CandidateListItem): CardData => {
  const score      = c.highest_job_interview_score ?? c.highest_interview_score ?? 0;
  const shift      = c.preferred_shift?.[0] ?? c.availability?.[0] ?? null;
  const shiftLabel = shift ? shift.charAt(0).toUpperCase() + shift.slice(1).toLowerCase() : null;
  const specialty  = c.specialty?.[0]
    ? c.specialty[0].replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    : c.medical_industry?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) ?? "Healthcare Professional";

  return {
    name:     c.full_name || `${c.first_name} ${c.last_name ?? ""}`.trim(),
    role:     specialty,
    exp:      "—",
    type:     shiftLabel ?? "—",
    dist:     [c.city, c.state].filter(Boolean).join(", ") || "N/A",
    score,
    verified: Number(c.completion_percentage) >= 80,
    badge:    score >= 90 ? "Hire Instantly" : null,
    badge2:   (c.availability?.length ?? 0) > 0 ? `Available ${shiftLabel ?? ""}` : null,  // ✅ fix TS18048
    img:      c.profile_image_url ?? "/svg/Photo.svg",
  };
};

const ScoreBadge = ({ score }: { score: number }) => {
  const isGreen     = score >= 80;
  const isOrange    = score >= 60 && score < 80;
  const arcColor    = isGreen ? "#22c55e" : isOrange ? "#f97316" : "#ef4444";
  const textColor   = isGreen ? "text-green-600" : isOrange ? "text-[#F4781B]" : "text-red-500";
  const borderColor = isGreen ? "border-green-500" : isOrange ? "border-orange-400" : "border-red-400";
  const size        = 32;
  const strokeWidth = 3;
  const radius      = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress    = (score / 100) * circumference;

  return (
    <div className={`flex flex-row items-center gap-1.5 px-2 py-1.5 rounded-xl border-2 ${borderColor} shrink-0`}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }} className="shrink-0">
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#f3f4f6" strokeWidth={strokeWidth} />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={arcColor} strokeWidth={strokeWidth}
          strokeDasharray={`${progress} ${circumference}`} strokeLinecap="round" />
      </svg>
      <div className="flex flex-col items-start">
        <span className={`text-sm font-bold leading-none ${textColor}`}>{score}/100</span>
        <span className="text-[10px] text-gray-400 leading-tight">Score</span>
      </div>
    </div>
  );
};

const CandidateCard = ({ c }: { c: CardData }) => (
  <div className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 hover:border-orange-200 hover:bg-orange-50/30 transition-colors">
    <div className="w-10 h-10 rounded-xl overflow-hidden bg-orange-50 shrink-0">
      <Image src={c.img} alt={c.name} width={40} height={40} className="object-cover w-full h-full" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1">
        <span className="text-sm font-semibold text-gray-900">{c.name}</span>
        {c.verified && <BadgeCheck className="w-4 h-4 shrink-0" fill="#22c55e" color="white" />}
      </div>
      <p className="text-xs text-[#F4781B] font-medium">{c.role}</p>
      <div className="flex items-center gap-2 mt-1 flex-wrap">
        <span className="flex items-center gap-0.5 text-[11px] text-gray-500"><Briefcase size={10} />{c.exp}</span>
        <span className="text-[11px] text-gray-300">|</span>
        <span className="text-[11px] text-gray-500">{c.type}</span>
        <span className="flex items-center gap-0.5 text-[11px] text-gray-500"><MapPin size={10} className="text-green-500" />{c.dist}</span>
      </div>
      <div className="flex gap-1.5 mt-1.5 flex-wrap">
        {c.badge && (
          <span className="flex items-center gap-0.5 text-[10px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-lg">
            <Zap size={9} className="text-[#F4781B]" fill="#f97316" />{c.badge}
          </span>
        )}
        {c.badge2 && (
          <span className="flex items-center gap-0.5 text-[10px] font-medium text-[#F4781B] bg-orange-100 px-2 py-0.5 rounded-lg">
            <CalendarDays size={9} />{c.badge2}
          </span>
        )}
      </div>
    </div>
    <ScoreBadge score={c.score} />
  </div>
);

export const BottomCandidateCards = () => {
  const [radius, setRadius] = useState("Within 5km");
  const { data, isLoading } = useCandidatesList({ page: 1, limit: 9 });

  // ✅ fix TS2339: data.data.candidates not data.candidates
  const all       = (data?.data?.candidates ?? []).map(toCardData);
  const available = all.slice(0, 3);
  const nearby    = all.slice(3, 6);
  const urgent    = all.slice(6, 9);

  const skeletons = [...Array(3)].map((_, i) => (
    <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
  ));

  return (
    <div className="-mx-4 px-4 md:-mx-5 md:px-5 lg:mx-0 lg:px-0">
      <div
        className={[
          "flex flex-row gap-3",
          "overflow-x-auto scroll-smooth",
          "snap-x snap-mandatory",
          "pb-3",
          "lg:grid lg:grid-cols-3",
          "lg:overflow-x-visible lg:snap-none lg:pb-0",
        ].join(" ")}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
      >
        {/* Panel 1 — Currently Available */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex-none snap-start w-[85vw] sm:w-[60vw] md:w-[46vw] lg:w-auto lg:flex-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Currently Available</h2>
          </div>
          <div className="flex flex-col gap-3">
            {isLoading ? skeletons : available.map((c: CardData) => <CandidateCard key={c.name + c.role} c={c} />)}
          </div>
        </div>

        {/* Panel 2 — Nearby Professionals */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex-none snap-start w-[85vw] sm:w-[60vw] md:w-[46vw] lg:w-auto lg:flex-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Nearby Professionals</h2>
            <select
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600"
            >
              <option>Within 5km</option>
              <option>Within 10km</option>
              <option>Within 25km</option>
            </select>
          </div>
          <div className="flex flex-col gap-3">
            {isLoading ? skeletons : nearby.map((c: CardData) => <CandidateCard key={c.name + c.role} c={c} />)}
          </div>
        </div>

        {/* Panel 3 — Urgent Hire */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex-none snap-start w-[85vw] sm:w-[60vw] md:w-[46vw] lg:w-auto lg:flex-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Urgent Hire (Pre-Verified)</h2>
          </div>
          <div className="flex flex-col gap-3">
            {isLoading ? skeletons : urgent.map((c: CardData) => <CandidateCard key={c.name + c.role} c={c} />)}
          </div>
        </div>
      </div>

      {/* Scroll dots */}
      <div className="flex justify-center gap-1.5 mt-2 lg:hidden">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full ${i === 0 ? "w-4 bg-orange-400" : "w-1.5 bg-gray-200"}`}
          />
        ))}
      </div>
    </div>
  );
};