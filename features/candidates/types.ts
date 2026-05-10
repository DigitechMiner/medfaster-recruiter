import type { PaginationData } from "@/types";

// ============================================================================
// TYPES — candidate pool, list, detail, summary, invite
// ============================================================================

/** GET /recruiter/candidates — pool rows */
export interface RecruiterCandidateRow {
  candidate_id: string;
  first_name: string;
  last_name: string;
  department?: string | string[] | null;
  job_titles: string[] | string | null;
  experience_in_months: number | null;
  distance: number | null;
  is_active?: boolean | null;
  best_ai_interview_score: number | null;
  avg_rating_score: number | string | null;
  in_house_status?: string | null;
}

/** Serialized as query params for GET /recruiter/candidates */
export interface RecruiterCandidatesFilters {
  page?: number;
  limit?: number;
  offset?: number;
  roleSlugs?: string[];
  availability?: string[];
  is_active?: boolean;
  latitude?: number;
  longitude?: number;
  km?: number;
}

export interface RecruiterCandidatesResponse {
  success: boolean;
  message: string;
  data: {
    candidates: RecruiterCandidateRow[];
    pagination: PaginationData;
  };
}

export interface CandidateListItem {
  candidate_id?: string;
  id?: string;
  first_name: string;
  last_name?: string | null;
  full_name?: string;
  profile_image_url?: string | null;
  department?: string | string[];
  job_title?: string;
  job_titles?: string[];
  experience_in_months?: number | null;
  avg_rating_score?: number | null;
  best_ai_interview_score?: number | null;
  highest_job_interview_score?: number | null;
  highest_interview_score?: number | null;
  distance?: number | null;
  work_eligibility?: string | null;
  specialty?: string[];
  specializations?: string[];
  medical_industry?: string;
  city?: string;
  state?: string;
  preferred_shift?: string[];
  availability?: string[];
  completion_percentage?: number | string;
  status?: string;
  job_type?: string;
  is_ai_recommended?: boolean;
  role?: string;
  postal_code?: string;
  job_application_id?: string;
  application_id?: string;
}

export interface CandidatesListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  job_id?: string;
  candidate_status?: string;
  is_ai_recommended?: boolean;
}

export interface CandidatesListResponse {
  success: boolean;
  message: string;
  data: {
    candidates: CandidateListItem[];
    pagination: PaginationData;
  };
}

export interface CandidateSummaryData {
  UNIQUE_HIRED_CANDIDATES: number;
  INHOUSE_CANDIDATES: number;
  IN_HOUSE_CANDIDATES?: number;
  ACTIVE_HIRED_CANDIDATES: number;
  AVAILABLE_CANDIDATES_WITHIN_30KM: number;
}

export interface CandidateSummaryResponse {
  success: boolean;
  message: string;
  data: CandidateSummaryData;
}

export interface CandidateQualificationItem {
  id: string;
  type: string;
  institution: string | null;
  year: number | null;
  description: string | null;
}

export interface CandidateDocumentItem {
  document_id: string;
  document_type: string;
  title: string;
  file_url: string | null;
  created_at: string;
  status?: string;
  verified_by?: string | null;
  verified_at?: string | null;
}

export type CandidateDocument = CandidateDocumentItem & {
  id?: string;
  status?: string;
};

export interface CandidateWorkExperienceItem {
  id: string;
  company: string;
  title: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
}

export interface Education {
  id: string;
  school: string;
  degree?: string;
  field?: string;
  start_date?: string;
  end_date?: string;
  start_year?: string;
  end_year?: string;
}

export interface CandidateWorkHistoryItem {
  application_id: string;
  job_id: string;
  job_title: string;
  organization: string;
  job_type: string;
  start_date: string | null;
  end_date: string | null;
  status: string;
}

export interface CandidateRatingItem {
  id: string;
  job_id: string;
  job_title: string;
  recruiter_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface CandidateApplication {
  id: string;
  job_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  job: {
    id: string;
    job_title: string;
    department: string;
    job_type: string;
    status: string;
  };
}

export interface AiInterviewRiskFlags {
  communication_red_flag: boolean;
  unsafe_decision_detected: boolean;
  critical_safety_violation: boolean;
}

export interface AiInterviewRoundBreakdown {
  score: number;
  sub_metrics: Record<string, number>;
}

export interface AiInterviewScoreBreakdown {
  conversational_intelligence?: AiInterviewRoundBreakdown;
  behavioral_professionalism?: AiInterviewRoundBreakdown;
  communication_clarity?: AiInterviewRoundBreakdown;
  clinical_competency?: AiInterviewRoundBreakdown;
}

export interface AiInterviewResultPayload {
  strengths?: string[];
  risk_flags?: AiInterviewRiskFlags;
  overall_score?: number;
  recommendation?: string | null;
  interview_summary?: string | null;
  score_breakdown?: AiInterviewScoreBreakdown;
  areas_to_improve?: string[];
}

export interface CandidateGeneralScore {
  max_self_interview_score?: number | null;
  overall_score?: number | null;
  result?: AiInterviewResultPayload | null;
  created_at?: string | null;
  best_ai_interview_score?: number | Record<string, unknown> | null;
  avg_rating_score?: number | null;
}

export interface CandidateDetailProfile {
  candidate_id?: string;
  full_name: string;
  first_name: string;
  last_name?: string | null;
  profile_image_url?: string | null;
  city?: string | null;
  state?: string | null;
  department?: string | string[];
  job_title?: string;
  job_titles?: string[] | null;
  experience_in_months?: number | null;
  static_experience_months?: number | null;
  is_active?: boolean;
  work_eligibility?: string | null;
  user?: {
    email: string | null;
    phone: string | null;
  };
  general_score?: CandidateGeneralScore | null;
  qualifications?: CandidateQualificationItem[];
  documents?: CandidateDocumentItem[];
  work_experiences?: CandidateWorkExperienceItem[];
  work_history?: CandidateWorkHistoryItem[];
  ratings?: CandidateRatingItem[];
  id?: string;
  email?: string | null;
  phone_number?: string | null;
  preferred_location?: string | null;
  job_type?: string | string[] | null;
  skill?: string | string[];
  specialty?: string[];
  specializations?: string[];
  medical_industry?: string;
  completion_percentage?: number | string;
  ai_interview_score?: number | null;
  ai_interview_summary?: string | null;
  educations?: Education[];
  applications?: CandidateApplication[];
  is_hired?: boolean;
  is_ai_recommended?: boolean;
  is_instant_hire?: boolean;
  is_currently_available?: boolean;
}

export interface CandidateDetailsResponse {
  success: boolean;
  message: string;
  data: { candidate: CandidateDetailProfile };
}

export interface InHouseCandidate {
  candidate_id: string;
  mapping_id: string;
  status: "PENDING" | "ACTIVE" | "REMOVED" | string;
  joined_at: string;
  first_name: string;
  last_name?: string | null;
  full_name: string;
  profile_image_url?: string | null;
  experience_in_months?: number | null;
  department?: string[] | null;
  job_titles?: string[] | null;
  location?: {
    city?: string | null;
    state?: string | null;
    postal_code?: string | null;
  } | null;
  user?: { email: string | null } | null;
}

export interface InviteCandidatePayload {
  job_id: string;
  candidate_id: string;
}

export interface InviteCandidateResponse {
  success: boolean;
  message: string;
  data: {
    job_id: string;
    candidate_id: string;
  };
}

// ── In-house program summary (GET /recruiter/in-house/summary) ─────────────

/** GET `/recruiter/in-house/summary` */
export interface RecruiterInHouseSummaryData {
  IN_HOUSE_ACTIVE: number;
  IN_HOUSE_INVITED: number;
  REFERRAL_INVITES_TOTAL: number;
  REFERRAL_REGISTERED_TOTAL: number;
  referral_code: string | null;
}

export interface RecruiterInHouseSummaryResponse {
  success: boolean;
  message: string;
  data: RecruiterInHouseSummaryData;
}

// ── Referral invites (GET/POST /recruiter/referral-invites) ────────────────

/** GET/POST `/recruiter/referral-invites` — row in list + bulk results. */
export interface ReferralInviteListItem {
  invite_id: string;
  email: string | null;
  name: string | null;
  referral_code?: string | null;
  status: string;
  expires_at: string | null;
  candidate_id: string | null;
  sent_at: string | null;
  registered_at: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ReferralInvitesListResponse {
  success: boolean;
  message: string;
  data: {
    referral_code: string | null;
    invites: ReferralInviteListItem[];
    pagination: PaginationData;
  };
}

export interface PostReferralInvitesResponse {
  success: boolean;
  message: string;
  data: {
    referral_code: string;
    invited_count: number;
    skipped_existing_users_count: number;
    skipped_already_invited_count: number;
    invited: { email: string; invite_id: string }[];
    skipped_existing_users: string[];
    skipped_already_invited: string[];
  };
}

export type GetReferralInvitesParams = {
  page?: number;
  limit?: number;
  offset?: number;
  /** Optional filter when backend supports it */
  status?: string;
};
