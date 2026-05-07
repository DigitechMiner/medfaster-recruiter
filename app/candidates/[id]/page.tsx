// app/candidates/[id]/page.tsx
"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { apiRequest } from "@/stores/api/api-client";
import { ENDPOINTS } from "@/stores/api/api-endpoints";
import { CalendarCard } from "@/components/card/calendar-card";
import SuccessModal from "@/components/modal";
import {
  CandidateDetailTabs,
  type CandidateDetailTab,
} from "./components/tab";
import { CandidateBasicInfo, CandidateHero } from "./components/basic-info";
import { CandidateActionModal } from "./components/candidate-action-modal";
import type {
  ActionType,
  CandidateDetailsResponse,
} from "@/Interface/recruiter.types";
import type { CandidateDetailVM } from "@/Interface/view-models";
import type { CandidateDetailApiResponse } from "./interfaces";
import { fromDetailProfile, normalizeCandidateResponse } from "./helpers";

export default function CandidateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["candidate-detail", id],
    queryFn: () =>
      apiRequest<CandidateDetailsResponse | CandidateDetailApiResponse>(
        ENDPOINTS.CANDIDATE_DETAIL(id),
        { method: "GET" }
      ),
    enabled: Boolean(id),
  });
  const rawResponse = normalizeCandidateResponse(data);
  const profile = rawResponse?.data.candidate ?? null;
  const isMock = false;
  const fullName = useMemo(
    () =>
      profile
        ? profile.full_name || `${profile.first_name} ${profile.last_name ?? ""}`.trim()
        : "",
    [profile]
  );
  const candidateVM = useMemo<CandidateDetailVM | null>(
    () => (profile ? fromDetailProfile(profile) : null),
    [profile]
  );
  const [activeTab, setActiveTab] = useState<CandidateDetailTab>("General score");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [actionModalType, setActionModalType] = useState<ActionType | null>(null);

  const handlePrimaryAction = (actionType: ActionType) => {
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
    <main className="p-4 md:p-6">
      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-48 rounded-2xl bg-gray-100" />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-20 rounded-2xl bg-gray-100" />
            ))}
          </div>
          <div className="h-80 rounded-2xl bg-gray-100" />
        </div>
      ) : isError || !rawResponse || !profile ? (
        <div className="p-6 text-center text-sm text-red-400">
          Failed to load candidate. Please try again.
        </div>
      ) : (
        <>
          <div className="mb-4">
            <CandidateHero
              candidate={profile}
              onExport={() => {
                setSuccessMessage("Profile export initiated.");
                setIsSuccessOpen(true);
              }}
              onPrimaryAction={handlePrimaryAction}
            />
          </div>
          <div className="mb-4">
            <CandidateBasicInfo candidate={profile} />
          </div>
          {candidateVM && (
            <CandidateDetailTabs
              activeTab={activeTab}
              candidate={candidateVM}
              fullName={fullName}
              onTabChange={setActiveTab}
            />
          )}
        </>
      )}
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
      {actionModalType && candidateVM && profile && (
        <CandidateActionModal
          actionType={actionModalType}
          candidate={candidateVM}
          applicationId={profile.applications?.[0]?.id}
          onClose={() => setActionModalType(null)}
        />
      )}
    </main>
  );
}
