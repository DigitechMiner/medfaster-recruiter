"use client";

import React, { useEffect, useMemo, useState } from "react";
import { CandidateHero } from "./candidate-hero";
import { CalendarCard } from "@/components/card/calendar-card";
import SuccessModal from "@/components/modal";
import {
  fetchRecruiterInterviewRequests,
} from "@/app/jobs/services/interviewApi";
import { CandidateDetailsResponse } from "@/stores/api/recruiter-job-api";
import { TABS, Tab } from "./candidate-detail-content/data";
import { CandidateDetailTabsContent } from "./candidate-detail-content/TabsContent";
import { AddInHouseModal, SuccessModal as InviteSuccessModal } from "./candidates-board/InHouseModals";

type InterviewRequestItem = {
  candidate_id?: string | null;
  job_application_id?: string | null;
};

type HeroActionType = "shortlist" | "hire" | "schedule" | "invite";

interface CandidateDetailContentProps {
  candidate:        CandidateDetailsResponse;
  status?:          string;
  onBack:           () => void;
  candidateId:      string;
  jobApplicationId?: string;
  jobId?:           string;   // ← added: needed by AddInHouseModal
}

export const CandidateDetailContent: React.FC<CandidateDetailContentProps> = ({
  candidate,
  onBack,
  candidateId,
  jobApplicationId,
  jobId = "",
}) => {
  const [activeTab,          setActiveTab]          = useState<Tab>("General score");
  const [isCalendarOpen,     setIsCalendarOpen]     = useState(false);
  const [isSuccessOpen,      setIsSuccessOpen]      = useState(false);
  const [isInviteModalOpen,  setIsInviteModalOpen]  = useState(false);
  const [isInviteSuccessOpen, setIsInviteSuccessOpen] = useState(false);
  const [inviteCount,        setInviteCount]        = useState(0);
  const [scheduledDate,      setScheduledDate]      = useState("");
  const [hasExistingRequest, setHasExistingRequest] = useState(false);
  const [successMessage,     setSuccessMessage]     = useState("");
  const [pendingAction,      setPendingAction]      = useState<HeroActionType | null>(null);

  const fullName = useMemo(
    () =>
      candidate.full_name ||
      `${candidate.first_name} ${candidate.last_name ?? ""}`.trim(),
    [candidate]
  );

  useEffect(() => {
    const check = async () => {
      if (!candidateId || !jobApplicationId) return;
      try {
        const response = await fetchRecruiterInterviewRequests(undefined, 1, 100);
        setHasExistingRequest(
          !!response.interviewRequests?.find(
            (r: InterviewRequestItem) =>
              (r.candidate_id ?? undefined) === candidateId &&
              (r.job_application_id ?? undefined) === jobApplicationId
          )
        );
      } catch {
        // ignore silently
      }
    };
    check();
  }, [candidateId, jobApplicationId]);


  const handleExportProfile = () => {
    setSuccessMessage("Export Profile action triggered.");
    setIsSuccessOpen(true);
  };

  const handleShortlist = () => {
    setPendingAction("shortlist");
    setSuccessMessage(`${fullName} shortlisted successfully.`);
    setIsSuccessOpen(true);
  };

  const handlePrimaryAction = async (actionType: HeroActionType) => {
    setPendingAction(actionType);

    if (actionType === "schedule") {
      setIsCalendarOpen(true);
      return;
    }

    // ── "invite" opens the AddInHouseModal — API called inside modal ────────
    if (actionType === "invite") {
      setIsInviteModalOpen(true);
      return;
    }

    if (actionType === "hire") {
      setSuccessMessage(`${fullName} moved to hire flow.`);
      setIsSuccessOpen(true);
      return;
    }

    if (actionType === "shortlist") {
      setSuccessMessage(`${fullName} shortlisted successfully.`);
      setIsSuccessOpen(true);
    }
  };

  return (
    <>
      <div className="mb-5">
        <CandidateHero
          candidate={candidate}
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
          <CandidateDetailTabsContent
            activeTab={activeTab}
            candidate={candidate}
            fullName={fullName}
          />
        </div>
      </div>

      {/* ── Calendar ── */}
      <CalendarCard
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        onSchedule={(date) => {
          setScheduledDate(date);
          setIsCalendarOpen(false);
          setSuccessMessage(`Interview Scheduled on ${date}`);
          setIsSuccessOpen(true);
        }}
      />

      {/* ── General success modal (schedule, shortlist, hire, export) ── */}
      <SuccessModal
        visible={isSuccessOpen}
        onClose={() => {
          setIsSuccessOpen(false);
          setScheduledDate("");
          setPendingAction(null);
          setSuccessMessage("");
        }}
        title="Success"
        message={
          scheduledDate
            ? `Interview Scheduled on ${scheduledDate}`
            : successMessage || "Action completed successfully!"
        }
        buttonText="Done"
      />

      {/* ── Invite modal — opened by "invite" action ── */}
      {isInviteModalOpen && (
        <AddInHouseModal
          onClose={() => {
            setIsInviteModalOpen(false);
            setPendingAction(null);
          }}
          onSuccess={(count) => {
            setIsInviteModalOpen(false);
            setInviteCount(count);
            setIsInviteSuccessOpen(true);
          }}
          candidateId={candidateId}
          jobId={jobId}
        />
      )}

      {/* ── Invite success modal ── */}
      {isInviteSuccessOpen && (
        <InviteSuccessModal
          count={inviteCount}
          onDone={() => {
            setIsInviteSuccessOpen(false);
            setInviteCount(0);
            setPendingAction(null);
          }}
        />
      )}
    </>
  );
};