import { axiosInstance } from '@/stores/api/api-client';
import { ENDPOINTS } from '@/stores/api/api-endpoints';
import { extractData, extractRoot } from '@/stores/api/response-helpers';
import type {
  JobsSummaryResponse,
  JobsCalendarResponse,
} from "@/features/jobs/types";

import type {
  CandidateDetailsResponse,
  CandidateSummaryResponse,
  CandidatesListParams,
  CandidatesListResponse,
  GetReferralInvitesParams,
  InviteCandidatePayload,
  InviteCandidateResponse,
  PostReferralInvitesResponse,
  RecruiterCandidatesFilters,
  RecruiterCandidatesResponse,
  RecruiterInHouseSummaryResponse,
  ReferralInvitesListResponse,
} from './types';

// ============================================================================
// API FUNCTIONS
// ============================================================================

const getJson = <T>(url: string, params?: unknown): Promise<T> =>
  axiosInstance.get<T>(url, params ? { params } : undefined).then((r) => r.data);

const postJson = <T>(url: string, payload: unknown): Promise<T> =>
  axiosInstance.post<T>(url, payload).then((r) => r.data);

// ── Candidate Pool (GET /recruiter/candidates) ──────────────────────────────
export function buildRecruiterCandidatesQuery(
  f: RecruiterCandidatesFilters,
): Record<string, string | number | boolean> {
  const q: Record<string, string | number | boolean> = {};
  if (f.page != null) q.page = f.page;
  if (f.limit != null) q.limit = f.limit;
  if (f.offset != null) q.offset = f.offset;
  if (f.roleSlugs?.length) q.role = f.roleSlugs.join(",");
  if (f.availability?.length) q.availability = f.availability.join(",");
  if (f.is_active !== undefined) q.is_active = f.is_active;
  if (
    f.latitude != null &&
    f.longitude != null &&
    f.km != null &&
    f.km > 0
  ) {
    q.latitude = f.latitude;
    q.longitude = f.longitude;
    q.km = f.km;
  }
  return q;
}

export async function getRecruiterCandidates(
  filters: RecruiterCandidatesFilters,
): Promise<RecruiterCandidatesResponse> {
  const res = await axiosInstance.get<RecruiterCandidatesResponse>(
    ENDPOINTS.CANDIDATES_LIST,
    { params: buildRecruiterCandidatesQuery(filters) },
  );
  return res.data;
}

export const getCandidateSummary =
  (): Promise<CandidateSummaryResponse> =>
    getJson<CandidateSummaryResponse>(ENDPOINTS.CANDIDATES_SUMMARY);

export const getJobsSummary =
  (): Promise<JobsSummaryResponse> =>
    getJson<JobsSummaryResponse>(ENDPOINTS.JOBS_SUMMARY);

export const getJobsCalendar = (range: 'today' | 'week' | 'month' = 'week'): Promise<JobsCalendarResponse> =>
  getJson<JobsCalendarResponse>(`${ENDPOINTS.JOBS_CALENDAR}?range=${range}`);

export const getCandidatesList = (
  params?: CandidatesListParams
): Promise<CandidatesListResponse> =>
  getJson<CandidatesListResponse>(ENDPOINTS.CANDIDATES_LIST, params);

export const getCandidateDetails = (
  candidateId: string
): Promise<CandidateDetailsResponse> =>
  getJson<CandidateDetailsResponse>(ENDPOINTS.CANDIDATE_DETAIL(candidateId));

export const inviteCandidate = (
  payload: InviteCandidatePayload
): Promise<InviteCandidateResponse> =>
  postJson<InviteCandidateResponse>(ENDPOINTS.CANDIDATE_JOB_INVITE, payload);

// ── In-house summary ───────────────────────────────────────────────────────

export async function getRecruiterInHouseSummary(): Promise<RecruiterInHouseSummaryResponse> {
  const res = await axiosInstance.get<RecruiterInHouseSummaryResponse>(
    ENDPOINTS.INHOUSE_SUMMARY,
  );
  return res.data;
}

// ── Referral invites ───────────────────────────────────────────────────────

export async function getReferralInvites(
  params?: GetReferralInvitesParams,
): Promise<ReferralInvitesListResponse> {
  const res = await axiosInstance.get<ReferralInvitesListResponse>(
    ENDPOINTS.REFERRAL_INVITES,
    { params },
  );
  return res.data;
}

export async function postReferralInvites(
  invites: { name?: string; email: string }[],
): Promise<PostReferralInvitesResponse> {
  const res = await axiosInstance.post<PostReferralInvitesResponse>(
    ENDPOINTS.REFERRAL_INVITES,
    { invites },
  );
  return res.data;
}

// ── In-house roster mutations ───────────────────────────────────────────────

export async function addInHouseCandidate(candidateId: string) {
  const res = await axiosInstance.post(ENDPOINTS.INHOUSE_ADD(candidateId), {});
  return extractRoot(res.data);
}

export async function removeInHouseCandidate(candidateId: string) {
  const res = await axiosInstance.patch(ENDPOINTS.INHOUSE_REMOVE(candidateId), {});
  return extractRoot(res.data);
}

// ── Candidate document signed URL ───────────────────────────────────────────

export async function getCandidateDocumentUrl(
  candidateId: string,
  documentId: string,
): Promise<{ url: string }> {
  const res = await axiosInstance.get(
    ENDPOINTS.CANDIDATE_DOCUMENT_SIGNED_URL(candidateId, documentId),
  );
  const inner = extractData<{
    candidate_id?: string;
    document_id?: string;
    file_url?: string;
    signed_url?: string;
    view_url?: string;
    url?: string;
  }>(res.data);
  const url = inner.file_url ?? inner.signed_url ?? inner.view_url ?? inner.url ?? null;
  if (!url) {
    throw new Error("Document URL not found in response");
  }
  return { url };
}

export async function inviteCandidateToJob(payload: InviteCandidatePayload) {
  const res = await axiosInstance.post(ENDPOINTS.CANDIDATE_JOB_INVITE, payload);
  return extractRoot(res.data);
}
