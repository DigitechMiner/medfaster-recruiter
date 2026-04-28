// For the job detail page board — candidates per job, per status
import { useQuery }              from "@tanstack/react-query";
import { apiRequest }            from "@/stores/api/api-client";
import { ENDPOINTS }             from "@/stores/api/api-endpoints";
import { fromJobApplication }    from "@/lib/transforms/candidate-card.transform";
import type { CandidateCardVM }  from "@/Interface/view-models";

export type ApplicationStatus =
  | "APPLIED" | "SHORTLISTED" | "INTERVIEWING"
  | "INTERVIEWED" | "HIRE" | "REJECTED" | "CANCELLED";

export function useJobApplicationCards(params: {
  job_id: string;
  status?: ApplicationStatus;
  page?:  number;
  limit?: number;
}) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["job-application-cards", params],
    queryFn:  () => apiRequest(ENDPOINTS.JOB_APPLICATIONS, { method: "GET", params }),
    enabled:  !!params.job_id,
  });

  return {
    cards:      (data?.data?.applications ?? []).map(fromJobApplication) as CandidateCardVM[],
    total:      data?.data?.pagination?.total ?? 0,
    isLoading,
    isError,
  };
}