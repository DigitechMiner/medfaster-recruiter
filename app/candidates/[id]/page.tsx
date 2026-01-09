// app/candidates/[id]/page.tsx
'use client';

import React from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { CandidateDetailContent } from "./components/CandidateDetailContent";
import { AppLayout } from "@/components/global/app-layout";
import { useCandidate } from "@/hooks/useJobData";

export default function CandidateDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const candidateId = params?.id as string;
  const jobApplicationId = searchParams.get('job_application_id') || undefined;
  
  const { candidate, isLoading, error } = useCandidate(candidateId);

  const handleBack = () => {
    router.push("/jobs");
  };

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
            <button
              onClick={handleBack}
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
        candidate={candidate}
        status="applied"
        onBack={handleBack}
        candidateId={candidateId}
        jobApplicationId={jobApplicationId}
      />
    </AppLayout>
  );
}
