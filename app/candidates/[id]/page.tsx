// app/candidates/[id]/page.tsx
"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { apiRequest } from "@/stores/api/api-client";
import { ENDPOINTS } from "@/stores/api/api-endpoints";
import SuccessModal from "@/components/modal";
import { Briefcase, Building2, Layers, MapPin } from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";
import {
  CandidateDetailTabs,
  type CandidateDetailTab,
} from "./components/tab";
import { CandidateHero } from "./components/basic-info";
import {
  fromDetailProfile,
  normalizeCandidateResponse,
  toExperienceLabel,
  toLabel,
} from "./components/helpers";
import { InviteCandidateToJobModal } from "../components/CandidateActionModal";
import type {
  CandidateDetailsResponse,
} from "@/types";
import type { CandidateDetailVM } from "@/types/view-models";
import type { CandidateDetailApiResponse } from "./components/interfaces";

export default function CandidateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
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
  const basicInfoDetail = useMemo(() => {
    if (!profile) return null;
    const totalWorkExperience = toExperienceLabel(
      profile.static_experience_months ?? profile.experience_in_months
    );
    const currentJob = profile.work_experiences?.find((exp) => exp.is_current);
    const preferredLocation =
      profile.city && profile.state ? `${profile.city}, ${profile.state}` : "N/A";
    return { totalWorkExperience, currentJob, preferredLocation };
  }, [profile]);
  const [activeTab, setActiveTab] = useState<CandidateDetailTab>("General score");
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  /** Hero only exposes “Invite for a job”; pool/grid uses the same invite modal component. */
  const handlePrimaryAction = () => setInviteModalOpen(true);

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
          {basicInfoDetail && (
            <div className="mb-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  title="Total Work Experience"
                  value={basicInfoDetail.totalWorkExperience || "—"}
                  icon={<Briefcase className="h-4 w-4" aria-hidden />}
                  className="min-w-0 border-gray-200 [&_p]:break-words"
                />
                <MetricCard
                  title="Current role"
                  value={toLabel(basicInfoDetail.currentJob?.title)}
                  icon={<Layers className="h-4 w-4" aria-hidden />}
                  className="min-w-0 border-gray-200 [&_p]:break-words"
                />
                <MetricCard
                  title="Current Company"
                  value={basicInfoDetail.currentJob?.company?.trim() || "N/A"}
                  icon={<Building2 className="h-4 w-4" aria-hidden />}
                  className="min-w-0 border-gray-200 [&_p]:break-words"
                />
                <MetricCard
                  title="Preferred Location"
                  value={basicInfoDetail.preferredLocation}
                  icon={<MapPin className="h-4 w-4" aria-hidden />}
                  className="min-w-0 border-gray-200 [&_p]:break-words"
                />
              </div>
            </div>
          )}
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
      <SuccessModal
        visible={isSuccessOpen}
        onClose={() => {
          setIsSuccessOpen(false);
          setSuccessMessage("");
        }}
        title="Success"
        message={successMessage || "Action completed successfully!"}
        buttonText="Done"
      />
      {inviteModalOpen && candidateVM && profile && (
        <InviteCandidateToJobModal
          candidate={candidateVM}
          applicationId={profile.applications?.[0]?.id}
          onClose={() => setInviteModalOpen(false)}
          onActionSuccess={() => {
            void queryClient.invalidateQueries({ queryKey: ["candidate-detail", id] });
          }}
        />
      )}
    </main>
  );
}
