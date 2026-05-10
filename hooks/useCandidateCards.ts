import { useQuery }              from "@tanstack/react-query";
import { apiRequest }            from "@/stores/api/api-client";
import { ENDPOINTS }             from "@/stores/api/api-endpoints";
import { fromJobApplication }    from "@/lib/transforms/candidate-card.transform";
import type { CandidateCardVM }  from "@/types/view-models";
import type { JobApplicationsResponse, JobApplicationsParams } from "@/types";

type UseCandidateCardsParams = JobApplicationsParams & { enabled?: boolean };

export function useCandidateCards(params: UseCandidateCardsParams) {
  const { enabled = true, ...queryParams } = params;
  const { data, isLoading, isError } = useQuery({
    queryKey: ["candidate-cards", queryParams],
    queryFn:  () => apiRequest<JobApplicationsResponse>(ENDPOINTS.JOB_APPLICATIONS, {
      method: "GET", params: queryParams,
    }),
    enabled,
  });

  return {
    cards:     (data?.data?.applications ?? []).map(fromJobApplication) as CandidateCardVM[],
    total:     data?.data?.pagination?.total ?? 0,
    isLoading,
    isError,
  };
}