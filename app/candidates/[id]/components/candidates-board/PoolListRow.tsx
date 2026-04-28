"use client";

import { Calendar, MapPin, Star, Zap } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CandidateCardVM } from '@/Interface/view-models';

type ActionType = "shortlist" | "hire" | "schedule" | "invite";

export function PoolListRow({ c, actionType }: { c: CandidateCardVM; actionType: ActionType }) {
  const router     = useRouter();
  const [_showModal, setShowModal] = useState(false);

  // ✅ all fields from CandidateCardVM — no CandidateListItem fields
  const score = c.interview_score ?? 0;

  return (
    <>
      <tr
        onClick={() => router.push(c.href)}
        className="border-b border-gray-100 hover:bg-orange-50/40 cursor-pointer transition-colors"
      >
        <td className="py-3 px-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-orange-50 shrink-0 border border-gray-100">
              <Image
                src={c.profile_image_url || "/svg/Photo.svg"}
                alt={c.full_name}
                width={36} height={36}
                className="object-cover w-full h-full"
              />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{c.full_name}</p>
              <p className="text-[11px] text-[#F4781B]">{c.designation}</p>
            </div>
          </div>
        </td>
        <td className="py-3 px-4 text-xs text-gray-600">{c.department}</td>
        <td className="py-3 px-4 text-xs text-gray-600">{c.designation}</td>
        <td className="py-3 px-4 text-xs text-gray-600">{c.experience}</td>
        <td className="py-3 px-4">
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin size={11} className="text-green-500" /> {c.distance}
          </span>
        </td>
        <td className="py-3 px-4 text-xs font-semibold text-gray-800">
          {score > 0 ? `${score}/100` : "—"}
        </td>
        <td className="py-3 px-4">
          <span className="flex items-center gap-1 text-xs text-yellow-600">
            <Star size={11} className="fill-yellow-400 text-yellow-400" />
            {c.rating ? `${c.rating}/5` : "—"}
          </span>
        </td>
        <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setShowModal(true)}
            className={
              actionType === "hire"
                ? "flex items-center gap-1 border border-green-400 text-green-600 hover:bg-green-50 text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors"
                : actionType === "schedule"
                ? "border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-medium px-3 py-1.5 rounded-xl transition-colors"
                : actionType === "invite"
                ? "flex items-center gap-1 border border-orange-200 text-[#F4781B] hover:bg-orange-50 text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors"
                : "bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors"
            }
          >
            {actionType === "hire"      && <><Zap size={11} className="fill-green-500 text-green-500" /> Hire Instantly</>}
            {actionType === "schedule"  && "Schedule a Interview"}
            {actionType === "invite"    && <><Calendar size={11} /> Invite For a Job</>}
            {actionType === "shortlist" && "Shortlist"}
          </button>
        </td>
      </tr>
{/* 
      {showModal && (
        <CandidateActionModal actionType={actionType} candidate={c} onClose={() => setShowModal(false)} />
      )} */}
    </>
  );
}