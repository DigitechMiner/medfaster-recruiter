import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest }  from "@/stores/api/api-client";
import { ENDPOINTS }   from "@/stores/api/api-endpoints";
import type { InHouseAcceptedRowVM } from "@/Interface/view-models";

// ── Raw shape from Swagger ────────────────────────────────────────────────────
interface RawInHouseCandidate {
  candidate_id:       string;
  mapping_id:         string;
  status:             "active";
  joined_at:          string;
  first_name:         string;
  last_name:          string;
  full_name:          string;
  profile_image_url?: string;
  location?: { city?: string; state?: string; postal_code?: string };
}

interface InHouseListResponse {
  success: boolean;
  message: string;
  data: { candidates: RawInHouseCandidate[] };
}

interface AddInHouseResponse {
  success: boolean;
  message: string;
  data: { candidate_id: string; map_id: string; status: "invited" };
}

interface RemoveInHouseResponse {
  success: boolean;
  message: string;
  data: { candidate_id: string; mapping_id: string; status: "removed" };
}

// ── Mapper ────────────────────────────────────────────────────────────────────
function fromRaw(c: RawInHouseCandidate): InHouseAcceptedRowVM {
  return {
    candidate_id:      c.candidate_id,
    mapping_id:        c.mapping_id,
    full_name:         c.full_name,
    profile_image_url: c.profile_image_url ?? null,
    joined_at:         c.joined_at,
    location:          [c.location?.city, c.location?.state].filter(Boolean).join(", ") || "—",
  };
}

// ── GET /recruiter/in-house-candidates ── active staff, no pagination ─────────
export function useInHouseCandidates() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["inhouse-candidates"],
    queryFn:  () => apiRequest<InHouseListResponse>(
      ENDPOINTS.INHOUSE_CANDIDATES,
      { method: "GET" }
    ),
  });

  return {
    rows:      (data?.data?.candidates ?? []).map(fromRaw),
    total:     data?.data?.candidates?.length ?? 0,
    isLoading,
    isError,
  };
}

// ── POST /recruiter/candidates/{id}/add-in-house ───────────────────────────────
export function useAddInHouse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (candidateId: string) =>
      apiRequest<AddInHouseResponse>(
        ENDPOINTS.INHOUSE_ADD(candidateId),
        { method: "POST" }
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inhouse-candidates"] }),
  });
}

// ── PATCH /recruiter/in-house-candidates/{id}/remove ──────────────────────────
export function useRemoveInHouse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (candidateId: string) =>
      apiRequest<RemoveInHouseResponse>(
        ENDPOINTS.INHOUSE_REMOVE(candidateId),
        { method: "PATCH" }
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inhouse-candidates"] }),
  });
}