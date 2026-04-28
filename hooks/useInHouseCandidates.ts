// hooks/useInHouseData.ts
import { useQuery }             from "@tanstack/react-query";
import { apiRequest }           from "@/stores/api/api-client";
import { ENDPOINTS }            from "@/stores/api/api-endpoints";
import { fromInHouseToInvited, fromInHouseToAccepted } from "@/lib/transforms/inhouse-candidate.transform";
import type { InHouseInvitedRowVM, InHouseAcceptedRowVM } from "@/Interface/view-models";

// ✅ Flip to false when API is ready
const USE_MOCK = true;

// ── Mock data ─────────────────────────────────────────────────────────────────
const MOCK_INVITED: InHouseInvitedRowVM[] = [
  {
    candidate_id: "c-001",
    full_name:    "Arjun Mehta",
    email:        "arjun.mehta@hospital.com",
    remark:       "Invitation Sent",
    invited_at:   "Apr 20, 2026",
  },
  {
    candidate_id: "c-002",
    full_name:    "Priya Nair",
    email:        "priya.nair@hospital.com",
    remark:       "Invitation Accepted",
    invited_at:   "Apr 18, 2026",
  },
  {
    candidate_id: "c-003",
    full_name:    "Rohan Das",
    email:        "rohan.das@hospital.com",
    remark:       "Invitation Sent",
    invited_at:   "Apr 22, 2026",
  },
];

const MOCK_ACCEPTED: InHouseAcceptedRowVM[] = [
  {
    candidate_id:      "c-004",
    mapping_id:        "m-001",
    full_name:         "Sneha Pillai",
    profile_image_url: null,
    departments:       ["ICU", "Emergency"],
    job_titles:        ["Registered Nurse", "Charge Nurse"],
    experience_range:  "4–6 yrs",
  },
  {
    candidate_id:      "c-005",
    mapping_id:        "m-002",
    full_name:         "Karthik Iyer",
    profile_image_url: null,
    departments:       ["Radiology"],
    job_titles:        ["Radiologist"],
    experience_range:  "2–4 yrs",
  },
];

// ── Hooks ─────────────────────────────────────────────────────────────────────
export function useInHouseInvited() {
  const { data, isLoading } = useQuery({
    queryKey: ["inhouse-invited"],
    queryFn:  () => apiRequest(ENDPOINTS.INHOUSE_CANDIDATES, {
      method: "GET", params: { status: "PENDING" },
    }),
    // skip API call when mocking
    enabled: !USE_MOCK,
  });

  return {
    rows:      USE_MOCK
                 ? MOCK_INVITED
                 : (data?.data?.candidates ?? []).map(fromInHouseToInvited) as InHouseInvitedRowVM[],
    isLoading: USE_MOCK ? false : isLoading,
  };
}

export function useInHouseAccepted() {
  const { data, isLoading } = useQuery({
    queryKey: ["inhouse-accepted"],
    queryFn:  () => apiRequest(ENDPOINTS.INHOUSE_CANDIDATES, {
      method: "GET", params: { status: "ACTIVE" },
    }),
    enabled: !USE_MOCK,
  });

  return {
    rows:      USE_MOCK
                 ? MOCK_ACCEPTED
                 : (data?.data?.candidates ?? []).map(fromInHouseToAccepted) as InHouseAcceptedRowVM[],
    isLoading: USE_MOCK ? false : isLoading,
  };
}