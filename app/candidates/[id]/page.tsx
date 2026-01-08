// app/candidates/[id]/page.tsx - FIXED VERSION
'use client';

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { CandidateDetailContent } from "./components/CandidateDetailContent";
import { AppLayout } from "@/components/global/app-layout";
import { useCandidate } from "@/hooks/useJobData";

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
        <div className="flex-1 flex items-center justify-center p-8">
          <p className="text-gray-600 text-lg">Loading candidate {candidateId?.slice(0,8)}...</p>
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
            <p className="text-gray-600 mb-6">ID: <code>{candidateId}</code></p>
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

  // ✅ FIXED: Pass correct props
  return (
    <AppLayout>
      <CandidateDetailContent
        candidate={candidate}           // ✅ WHOLE candidate object
        status="applied"      // ✅ Hardcoded for now
        onBack={handleBack}
        candidateId={candidateId}
      />
    </AppLayout>
  );
}
