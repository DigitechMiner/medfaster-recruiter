import { useQuery }              from "@tanstack/react-query";
import { apiRequest }            from "@/stores/api/api-client";
import { ENDPOINTS }             from "@/stores/api/api-endpoints";
import { fromJobListItem, fromJobListItemToRow } from "@/lib/transforms/job-card.transform";
import type { JobCardVM, JobTableRowVM }          from "@/Interface/view-models";

interface JobsListResponse {
  data: { jobs: any[]; pagination: any };
}

export interface JobCardsParams {
  page?:        number;
  limit?:       number;
  status?:      string;
  job_urgency?: "instant" | "normal";
}

export function useJobCards(params: JobCardsParams) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["job-cards", params],
    queryFn:  () => apiRequest<JobsListResponse>(ENDPOINTS.JOBS_LIST, { method: "GET", params }),
  });

  return {
    cards:      (data?.data?.jobs ?? []).map(fromJobListItem) as JobCardVM[],
    rows:       (data?.data?.jobs ?? []).map(fromJobListItemToRow) as JobTableRowVM[],
    pagination: data?.data?.pagination ?? null,
    isLoading,
    isError,
  };
}