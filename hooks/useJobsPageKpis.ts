import { useQuery }                from "@tanstack/react-query";
import { apiRequest }              from "@/stores/api/api-client";
import { ENDPOINTS }               from "@/stores/api/api-endpoints";
import type { JobsPageKpisVM }     from "@/Interface/view-models";

interface JobsSummaryResponse {
  data: {
    open_job_count:              number;
    no_checkin_candidate_count:  number;
    active_shift_count: {
      urgent_instant: number;
      normal:         number;
      total:          number;
    };
  };
}

export function useJobsPageKpis(range: "today" | "week" | "month" | "year" = "week") {
  const { data, isLoading } = useQuery({
    queryKey: ["jobs-kpis", range],
    queryFn:  () => apiRequest<JobsSummaryResponse>(ENDPOINTS.JOBS_SUMMARY, {
      method: "GET", params: { range },
    }),
  });

  const kpis: JobsPageKpisVM = {
    regular_job_openings:  data?.data?.open_job_count                         ?? 0,
    urgent_shift_openings: data?.data?.active_shift_count?.urgent_instant     ?? 0,
    no_show_alerts:        data?.data?.no_checkin_candidate_count              ?? 0,
    active_jobs_shifts:    data?.data?.active_shift_count?.total              ?? 0,
  };

  return { kpis, isLoading };
}