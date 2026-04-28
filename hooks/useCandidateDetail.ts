// hooks/useCandidateDetail.ts
import { useQuery }               from "@tanstack/react-query";
import { apiRequest }             from "@/stores/api/api-client";
import { ENDPOINTS }              from "@/stores/api/api-endpoints";
import { fromDetailProfile }      from "@/lib/transforms/candidate-detail.transform";
import type { CandidateDetailVM } from "@/Interface/view-models";
import type { CandidateDetailsResponse } from "@/Interface/recruiter.types";

export function useCandidateDetail(id: string) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["candidate-detail", id],
    queryFn:  () => apiRequest<CandidateDetailsResponse>(
      `${ENDPOINTS.CANDIDATE_DETAIL}/${id}`,
      { method: "GET" }
    ),
    enabled: !!id,
  });

  const detail: CandidateDetailVM | null = data?.data?.candidate
    ? fromDetailProfile(data.data.candidate)
    : null;

  // ✅ Expose raw response so CandidateDetailContent can pass it to CandidateHero
  return { detail, rawResponse: data, isLoading, isError };
}