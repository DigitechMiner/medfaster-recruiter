import { useQuery }                    from "@tanstack/react-query";
import { apiRequest }                  from "@/stores/api/api-client";
import { ENDPOINTS }                   from "@/stores/api/api-endpoints";
import type { CandidatesPageKpisVM }   from "@/Interface/view-models";

interface SummaryResponse {
  data: {
    UNIQUE_HIRED_CANDIDATES:        number;
    IN_HOUSE_CANDIDATES:             number;
    ACTIVE_HIRED_CANDIDATES:        number;
    AVAILABLE_CANDIDATES_WITHIN_30KM: number;
  };
}

export function useCandidatesPageKpis(coords?: { lat: number; lng: number }) {
  const { data, isLoading } = useQuery({
    queryKey: ["candidates-kpis", coords],
    queryFn:  () => apiRequest<SummaryResponse>(ENDPOINTS.CANDIDATES_SUMMARY, {
      method: "GET",
      params: coords ? { latitude: coords.lat, longitude: coords.lng } : {},
    }),
  });

  const kpis: CandidatesPageKpisVM = {
    hired_candidates:   data?.data?.UNIQUE_HIRED_CANDIDATES        ?? 0,
    inhouse_candidates: data?.data?.IN_HOUSE_CANDIDATES             ?? 0,
    active_candidates:  data?.data?.ACTIVE_HIRED_CANDIDATES        ?? 0,
    candidates_pool:    data?.data?.AVAILABLE_CANDIDATES_WITHIN_30KM ?? 0,
  };

  return { kpis, isLoading };
}