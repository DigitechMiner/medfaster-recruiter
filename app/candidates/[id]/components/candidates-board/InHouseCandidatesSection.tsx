"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { MOCK_JOBS } from "./constants";
import { AddInHouseModal, SuccessModal } from "./InHouseModals";
import { JobTable } from "./JobTable";
import { PaginationBar, SectionHeader } from "./ui";

interface InHouseCandidatesSectionProps {
  candidateId?: string;
  jobId?: string;
}

export function InHouseCandidatesSection({
  candidateId = "",
  jobId = "",
}: InHouseCandidatesSectionProps) {
  const [localView, setLocalView]           = useState<"grid" | "list">("list");
  const [showAddModal, setShowAddModal]     = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [inviteCount, setInviteCount]       = useState(0);
  const [hasStaff, setHasStaff]             = useState(false);

  const inHouseJobs = MOCK_JOBS.filter((j) => j.candidateType === "In-House");

  const handleSuccess = (count: number) => {
    setInviteCount(count);
    setShowAddModal(false);
    setShowSuccessModal(true);
  };

  const handleDone = () => {
    setShowSuccessModal(false);
    setHasStaff(true);
  };

  return (
    <>
      {showAddModal && (
        <AddInHouseModal
          onClose={() => setShowAddModal(false)}
          onSuccess={handleSuccess}
          candidateId={candidateId}
          jobId={jobId}
        />
      )}
      {showSuccessModal && (
        <SuccessModal count={inviteCount} onDone={handleDone} />
      )}

      <div className="flex flex-col gap-3">
        <SectionHeader
          title="In-House Candidates"
          dotColor="bg-green-500"
          count={hasStaff ? inHouseJobs.length : 0}
          view={localView}
          onViewToggle={setLocalView}
          rightSlot={
            hasStaff ? (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 bg-[#F4781B] hover:bg-[#e06a10] text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
              >
                <Plus size={12} /> Add Staff
              </button>
            ) : null
          }
        />

        {!hasStaff ? (
          <div className="flex flex-col items-center justify-center py-20 gap-5">
            <div className="relative">
              <svg width="80" height="90" viewBox="0 0 80 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="10" y="15" width="52" height="65" rx="4" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="1.5"/>
                <rect x="28" y="8" width="16" height="14" rx="3" fill="#E5E7EB" stroke="#D1D5DB" strokeWidth="1.5"/>
                <circle cx="36" cy="15" r="2.5" fill="#9CA3AF"/>
                <rect x="20" y="36" width="32" height="2.5" rx="1.25" fill="#D1D5DB"/>
                <rect x="20" y="44" width="24" height="2.5" rx="1.25" fill="#E5E7EB"/>
                <rect x="20" y="52" width="28" height="2.5" rx="1.25" fill="#E5E7EB"/>
                <circle cx="30" cy="64" r="1.5" fill="#9CA3AF"/>
                <circle cx="42" cy="64" r="1.5" fill="#9CA3AF"/>
                <path d="M30 70 Q36 66 42 70" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                <line x1="64" y1="30" x2="72" y2="22" stroke="#D1D5DB" strokeWidth="1" strokeDasharray="3 2"/>
                <line x1="68" y1="50" x2="76" y2="50" stroke="#D1D5DB" strokeWidth="1" strokeDasharray="3 2"/>
              </svg>
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-gray-800">You Do Not Have Any In-House Staff List Yet</p>
              <p className="text-sm text-gray-400 mt-1">Let us help you to invite your staff on our KeRaeva&apos;s platform</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-[#F4781B] hover:bg-[#e06a10] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              <Plus size={14} /> Add My In-House Staff
            </button>
          </div>
        ) : (
          <>
            <JobTable jobs={inHouseJobs} headerBg="bg-green-50/60" />
            <PaginationBar total={inHouseJobs.length} />
          </>
        )}
      </div>
    </>
  );
}