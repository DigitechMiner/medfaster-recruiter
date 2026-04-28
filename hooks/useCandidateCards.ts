import { useQuery }              from "@tanstack/react-query";
import { apiRequest }            from "@/stores/api/api-client";
import { ENDPOINTS }             from "@/stores/api/api-endpoints";
import { fromJobApplication }    from "@/lib/transforms/candidate-card.transform";
import type { CandidateCardVM }  from "@/Interface/view-models";
import type { JobApplicationsResponse, JobApplicationsParams } from "@/Interface/recruiter.types";

export function useCandidateCards(params: JobApplicationsParams) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["candidate-cards", params],
    queryFn:  () => apiRequest<JobApplicationsResponse>(ENDPOINTS.JOB_APPLICATIONS, {
      method: "GET", params,
    }),
  });

  return {
    cards:     (data?.data?.applications ?? []).map(fromJobApplication) as CandidateCardVM[],
    total:     data?.data?.pagination?.total ?? 0,
    isLoading,
    isError,
  };
}