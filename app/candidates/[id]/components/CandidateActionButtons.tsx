// components/candidate/CandidateActionButtons.tsx
"use client";

import { Download } from "lucide-react";
import { CandidateListItem } from "@/stores/api/recruiter-job-api";

interface Props {
  c: CandidateListItem;
  actionType: "hire" | "schedule" | "invite" | "shortlist";
  onAction: (c: CandidateListItem) => void;
}

export function CandidateActionButtons({ c, actionType, onAction }: Props) {
  const exportBtn = (
    <button
      onClick={(e) => { e.stopPropagation(); /* export logic */ }}
      className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-medium py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors"
    >
      <Download size={11} /> Export Profile
    </button>
  );

  return (
    <div className="flex gap-1.5 mt-2" onClick={(e) => e.stopPropagation()}>
      {exportBtn}
      {actionType === "hire" && (
        // AI Recommended gets 3 buttons: Export | Shortlist | Direct Hire
        c.is_ai_recommended ? (
          <>
            <button className="flex-1 border border-orange-200 text-orange-600 hover:bg-orange-50 text-xs font-medium py-1.5 rounded-lg flex items-center justify-center transition-colors">
              Shortlist
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onAction(c); }}
              className="flex-1 bg-[#F4781B] hover:bg-[#e06a10] text-white text-xs font-semibold py-1.5 rounded-lg flex items-center justify-center transition-colors"
            >
              Direct Hire
            </button>
          </>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); onAction(c); }}
            className="flex-1 bg-[#F4781B] hover:bg-[#e06a10] text-white text-xs font-semibold py-1.5 rounded-lg flex items-center justify-center transition-colors"
          >
            Hire Instantly
          </button>
        )
      )}
      {actionType === "schedule" && (
        <button
          onClick={(e) => { e.stopPropagation(); onAction(c); }}
          className="flex-1 bg-[#F4781B] hover:bg-[#e06a10] text-white text-xs font-semibold py-1.5 rounded-lg flex items-center justify-center transition-colors"
        >
          Schedule Interview
        </button>
      )}
      {actionType === "invite" && (
        <button
          onClick={(e) => { e.stopPropagation(); onAction(c); }}
          className="flex-1 bg-[#F4781B] hover:bg-[#e06a10] text-white text-xs font-semibold py-1.5 rounded-lg flex items-center justify-center transition-colors"
        >
          Invite for Job
        </button>
      )}
      {actionType === "shortlist" && (
        <button
          onClick={(e) => { e.stopPropagation(); onAction(c); }}
          className="flex-1 bg-[#F4781B] hover:bg-[#e06a10] text-white text-xs font-semibold py-1.5 rounded-lg flex items-center justify-center transition-colors"
        >
          Shortlist
        </button>
      )}
    </div>
  );
}