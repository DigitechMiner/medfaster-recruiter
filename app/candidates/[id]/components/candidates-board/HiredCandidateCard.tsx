"use client";

import { Download, MapPin, Briefcase, Star } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CandidateListItem } from '@/Interface/recruiter.types';
import ScoreCard from "@/components/card/scorecard";
import { BaseCard, CardHeader, CardIdentity, CardStats } from "@/components/candidate/BaseCard";
import { JobTypePill } from "./ui";
import { CandidateActionModal } from "../CandidateActionModal";

export function HiredCandidateCard({ c, leftTag, rightTag }: {
  c: CandidateListItem;
  leftTag?: string;
  rightTag?: string;
}) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const name       = c.full_name || `${c.first_name} ${c.last_name ?? ""}`.trim();
  const role       = c.specialty?.[0] ?? c.medical_industry ?? "Registered Nurse";
  const score      = c.highest_job_interview_score ?? c.highest_interview_score ?? 40;
  const isAssigned = (leftTag ?? "Assigned").toLowerCase().includes("assigned");

  return (
    <>
      <BaseCard
        onClick={() => router.push(`/candidates/${c.id}`)}
        className="flex flex-col gap-2 p-3 rounded-xl border border-gray-200 bg-white hover:border-orange-300 hover:shadow-sm transition-all cursor-pointer"
      >
        <CardHeader className="flex items-center justify-between gap-1">
          {isAssigned ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-300">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Assigned
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-light px-2 py-0.5 rounded-full bg-[#079455] text-white border">
              Active
            </span>
          )}
          {rightTag && <JobTypePill type={rightTag} />}
        </CardHeader>

        <CardIdentity className="flex items-start gap-2">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-orange-50 shrink-0 border border-gray-100">
            <Image src={c.profile_image_url || "/svg/Photo.svg"} alt={name} width={40} height={40} className="object-cover w-full h-full" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 leading-tight">{name}</p>
            <p className="text-[11px] text-[#F4781B] font-medium mt-0.5">{role}</p>
            <CardStats className="flex items-center gap-2 text-[10px] text-gray-500 flex-wrap mt-1">
              <span className="flex items-center gap-1"><Briefcase size={10} className="text-gray-400" /> 5+ yrs</span>
              <span className="text-gray-300">|</span>
              <span className="flex items-center gap-0.5"><MapPin size={9} className="text-green-500" /> 25km</span>
              <span className="text-gray-300">|</span>
              <span className="flex items-center gap-0.5"><Star size={9} className="fill-yellow-400 text-yellow-400" /> 4.8/5</span>
            </CardStats>
          </div>
          <ScoreCard category="good" score={score} maxScore={100} />
        </CardIdentity>

        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <button className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-medium py-1 rounded-md transition-colors flex items-center justify-center gap-1">
            <Download size={11} /> Export Profile
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex-1 bg-[#F4781B] hover:bg-[#e06a10] text-white text-sm font-light py-1 rounded-md transition-colors flex items-center justify-center"
          >
            Direct Hire
          </button>
        </div>
      </BaseCard>

      {showModal && (
        <CandidateActionModal actionType="hire" candidate={c} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}