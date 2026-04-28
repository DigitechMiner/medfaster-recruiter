"use client";

import React, { useMemo, useState } from "react";
import { CandidateHero }            from "./candidate-hero";
import { CalendarCard }             from "@/components/card/calendar-card";
import SuccessModal                 from "@/components/modal";
import { CandidateActionModal }     from "./CandidateActionModal";
import { fromDetailProfile }        from "@/lib/transforms/candidate-detail.transform";
import type { CandidateDetailVM }   from "@/Interface/view-models";
import type { CandidateDetailsResponse } from "@/stores/api/recruiter-job-api";
import { TABS, Tab }                from "./candidate-detail-content/data";
import { CandidateDetailTabsContent } from "./candidate-detail-content/TabsContent";

type HeroActionType = "shortlist" | "hire" | "schedule" | "invite";

interface CandidateDetailContentProps {
  candidate:         CandidateDetailsResponse;
  onBack:            () => void;
  candidateId:       string;
  jobApplicationId?: string;
  jobId?:            string;
  isMock?:           boolean;
}

export const CandidateDetailContent: React.FC<CandidateDetailContentProps> = ({
  candidate,
  onBack,
  jobApplicationId: _jobApplicationId,
  isMock = false,
}) => {

  const profile = candidate.data.candidate;

  const fullName = useMemo(
    () => profile.full_name || `${profile.first_name} ${profile.last_name ?? ""}`.trim(),
    [profile]
  );

  // ✅ Single transform — used for both tabs AND CandidateActionModal
  const candidateVM = useMemo<CandidateDetailVM | null>(
    () => (profile ? fromDetailProfile(profile) : null),
    [profile]
  );

  // ── NO candidateCardVM memo — CandidateActionModal now accepts CandidateDetailVM directly ──

  const [activeTab,       setActiveTab]       = useState<Tab>("General score");
  const [isCalendarOpen,  setIsCalendarOpen]  = useState(false);
  const [isSuccessOpen,   setIsSuccessOpen]   = useState(false);
  const [successMessage,  setSuccessMessage]  = useState("");
  const [scheduledDate,   setScheduledDate]   = useState("");
  const [actionModalType, setActionModalType] = useState<HeroActionType | null>(null);

  const handleExportProfile = () => {
    setSuccessMessage("Profile export initiated.");
    setIsSuccessOpen(true);
  };

  const handleShortlist = () => {
    setSuccessMessage(`${fullName} shortlisted successfully.`);
    setIsSuccessOpen(true);
  };

  const handlePrimaryAction = (actionType: HeroActionType) => {
    if (isMock) {
      setActionModalType(actionType);
      return;
    }
    switch (actionType) {
      case "schedule":
        setIsCalendarOpen(true);
        break;
      case "invite":
      case "shortlist":
      case "hire":
        setActionModalType(actionType);
        break;
    }
  };

  return (
    <>
      <div className="mb-5">
        <CandidateHero
          candidate={profile}
          onBack={onBack}
          onExport={handleExportProfile}
          onShortlist={handleShortlist}
          onPrimaryAction={handlePrimaryAction}
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="border-b border-gray-200 overflow-x-auto">
          <div className="flex min-w-max">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 sm:px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === tab
                    ? "border-orange-500 text-[#F4781B]"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div className="p-5 sm:p-6">
          {candidateVM && (
            <CandidateDetailTabsContent
              activeTab={activeTab}
              candidate={candidateVM}
              fullName={fullName}
            />
          )}
        </div>
      </div>

      <CalendarCard
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        onSchedule={(date) => {
          setScheduledDate(date);
          setIsCalendarOpen(false);
          setSuccessMessage(`Interview scheduled for ${date}`);
          setIsSuccessOpen(true);
        }}
      />

      <SuccessModal
        visible={isSuccessOpen}
        onClose={() => {
          setIsSuccessOpen(false);
          setScheduledDate("");
          setSuccessMessage("");
        }}
        title="Success"
        message={
          scheduledDate
            ? `Interview scheduled for ${scheduledDate}`
            : successMessage || "Action completed successfully!"
        }
        buttonText="Done"
      />

      {/* ✅ candidateVM passed directly — no intermediate card mapping */}
      {actionModalType && candidateVM && (
        <CandidateActionModal
          actionType={actionModalType}
          candidate={candidateVM}
          onClose={() => setActionModalType(null)}
        />
      )}
    </>
  );
};