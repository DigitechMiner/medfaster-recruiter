'use client';

import React from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { CandidateDetailContent } from "./components/CandidateDetailContent";
import { AppLayout } from "@/components/global/app-layout";
import { useCandidateDetails } from "@/hooks/useCandidate";
import Link from "next/link";

export default function CandidateDetailPage() {
  const router       = useRouter();
  const params       = useParams();
  const searchParams = useSearchParams();

  const candidateId      = params?.id as string;
  const jobApplicationId = searchParams.get("job_application_id") || undefined;

  const { candidate, isLoading, error } = useCandidateDetails(candidateId);
  const handleBack = () => router.push("/candidates");

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin" />
            <p className="text-gray-500 text-sm">Loading candidate...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !candidate) {
    return (
      <AppLayout>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md mx-auto">
            <span className="text-4xl">👤</span>
            <h1 className="text-xl font-bold text-gray-900 mt-3 mb-2">Candidate not found</h1>
            <p className="text-sm text-gray-500 mb-5">{error ?? "This candidate profile could not be loaded."}</p>
            <button
              onClick={handleBack}
              className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 text-sm font-medium"
            >
              Back to Candidates
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <nav className="flex items-center gap-1.5 text-xs text-gray-400 px-6 pt-4 pb-0">
        <Link href="/candidates" className="hover:text-gray-700 transition-colors">Candidates</Link>
        <span>/</span>
        <span className="text-gray-700 font-medium">
          {candidate.full_name ?? candidateId}
        </span>
      </nav>

      <CandidateDetailContent
        candidate={candidate}
        status="applied"
        onBack={handleBack}
        candidateId={candidateId}
        jobApplicationId={jobApplicationId}
      />
    </AppLayout>
  );
}