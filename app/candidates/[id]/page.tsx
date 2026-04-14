'use client';

import React from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { CandidateDetailContent } from "./components/CandidateDetailContent";
import { AppLayout } from "@/components/global/app-layout";
import { useCandidateDetails } from "@/hooks/useCandidate";
import { STATIC_CANDIDATE } from "./constants/staticData";

export default function CandidateDetailPage() {
  const router       = useRouter();
  const params       = useParams();
  const searchParams = useSearchParams();

  const candidateId      = params?.id as string;
  const jobApplicationId = searchParams.get("job_application_id") || undefined;

  const { candidate, isLoading, error } = useCandidateDetails(candidateId);
  const handleBack = () => router.push("/candidates");
  const displayCandidate = candidate ?? STATIC_CANDIDATE;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex-1 flex items-center justify-center p-8">
          <p className="text-gray-600 text-lg">Loading candidate...</p>
        </div>
      </AppLayout>
    );
  }

  if (error || !candidate) {
    return (
      <AppLayout>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Candidate not found</h1>
            <button onClick={handleBack} className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600">
              Back to Jobs
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-400 px-6 pt-4 pb-0">
        <a href="/candidates" className="hover:text-gray-700 transition-colors">Candidates</a>
        <span>/</span>
        <span className="text-gray-700 font-medium">{candidateId}</span>
      </nav>

      <CandidateDetailContent
        candidate={displayCandidate}
        status="applied"
        onBack={handleBack}
        candidateId={candidateId}
        jobApplicationId={jobApplicationId}
      />
    </AppLayout>
  );
}