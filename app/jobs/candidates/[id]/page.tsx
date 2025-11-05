"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { CandidateDetailContent } from "./components/CandidateDetailContent";
import { AppLayout } from "@/components/global/app-layout";
import { useCandidate } from "../../hooks/useJobData";

export default function CandidateDetailPage() {
  const router = useRouter();
  const params = useParams();
  const candidateId = params?.id as string;
  const { candidate, isLoading, error } = useCandidate(candidateId);

  const handleBack = () => {
    router.push("/jobs");
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-600">Loading candidate...</p>
        </div>
      </AppLayout>
    );
  }

  if (error || !candidate) {
    return (
      <AppLayout>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Candidate not found
            </h1>
            <p className="text-gray-600 mb-4">
              {error || "The candidate you're looking for doesn't exist."}
            </p>
            <button
              onClick={() => router.push("/jobs")}
              className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600"
            >
              Back to Jobs
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <CandidateDetailContent
        candidate={candidate.job}
        status={candidate.status}
        onBack={handleBack}
      />
    </AppLayout>
  );
}
