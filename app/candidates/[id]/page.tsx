// app/candidates/[id]/page.tsx
"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCandidateDetail } from "@/hooks/useCandidateDetail";
import { CandidateDetailContent } from "./components/CandidateDetailContent";
import {
  MOCK_CANDIDATE_DETAIL_MAP,
  isMockCandidateId,
} from "@/app/candidates/data/candidatePoolMocks";

export default function CandidateDetailPage() {
  const { id }       = useParams<{ id: string }>();
  const router       = useRouter();
  const searchParams = useSearchParams();

  const isMock = searchParams.get("mock") === "true" || isMockCandidateId(id);

  // ── Mock path — skip API entirely ──────────────────────────────────────
  if (isMock) {
    const mockData = MOCK_CANDIDATE_DETAIL_MAP[id];
    if (!mockData) {
      return (
        <main className="p-6 text-center text-gray-400 text-sm">
          Mock candidate <code>{id}</code> not found.
        </main>
      );
    }
    return (
      <main className="p-4 md:p-6">
        <CandidateDetailContent
          candidate={mockData}
          onBack={() => router.back()}
          candidateId={id}
          isMock
        />
      </main>
    );
  }

  // ── Real API path ───────────────────────────────────────────────────────
  return <RealCandidateDetail id={id} onBack={() => router.back()} />;
}

// Extracted so hooks always run unconditionally
function RealCandidateDetail({ id, onBack }: { id: string; onBack: () => void }) {
  // ✅ rawResponse for CandidateHero, isError (not "error")
  const { rawResponse, isLoading, isError } = useCandidateDetail(id);

  if (isLoading) {
    return (
      <main className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-48 bg-gray-100 rounded-2xl" />
          <div className="h-8  bg-gray-100 rounded-xl w-1/3" />
          <div className="h-32 bg-gray-100 rounded-xl" />
        </div>
      </main>
    );
  }

  if (isError || !rawResponse) {
    return (
      <main className="p-6 text-center text-red-400 text-sm">
        Failed to load candidate. Please try again.
      </main>
    );
  }

  return (
    <main className="p-4 md:p-6">
      <CandidateDetailContent
        candidate={rawResponse}
        onBack={onBack}
        candidateId={id}
      />
    </main>
  );
}