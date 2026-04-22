// ─── Candidate Summary ────────────────────────────────────────────────────────
export interface CandidateSummaryData {
  UNIQUE_HIRED_CANDIDATES:          number;
  IN_HOUSE_CANDIDATES:              number;
  ACTIVE_HIRED_CANDIDATES:          number;
  AVAILABLE_CANDIDATES_WITHIN_30KM: number;
}

export interface CandidateSummaryResponse {
  success: boolean;
  message: string;
  data:    CandidateSummaryData;
}

// ─── Jobs Summary ─────────────────────────────────────────────────────────────
export interface JobsSummaryData {
  range:                      string;   // "week"
  date_from:                  string;
  date_to:                    string;
  open_job_count:             number;
  incomplete_shift_count:     number;
  no_checkin_candidate_count: number;
  active_shift_count: {
    urgent_instant: number;
    normal:         number;
    total:          number;
  };
}

export interface JobsSummaryResponse {
  success: boolean;
  message: string;
  data:    JobsSummaryData;
}

// ─── Jobs Calendar ────────────────────────────────────────────────────────────
export interface CalendarJob {
  assignment_id:     string;
  job_id:            string;
  shift_id:          string;
  shift_date:        string;        // "YYYY-MM-DD"
  shift_status:      'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  candidate_id:      string;
  candidate_name:    string;
  check_in:          string | null; // ISO 8601 actual timestamp, or null
  check_out:         string | null;
  check_out_source:  string | null;
  planned_check_in:  string;        // "HH:mm:ss"
  planned_check_out: string;        // "HH:mm:ss"
  job_title:         string;
  job_type:          string;
}

export interface JobsCalendarResponse {
  success: boolean;
  message: string;
  data: {
    range:     string;
    date_from: string;
    date_to:   string;
    shifts:    CalendarJob[];
  };
}

// ─── Candidates List ──────────────────────────────────────────────────────────
/**
 * Flat shape returned by GET /recruiter/candidates
 * and GET /recruiter/candidates?job_id=...
 */
export interface CandidateListItem {
  // ── Application fields (present when job_id filter is used) ──
  id:                    string;   // application ID
  candidate_id?:         string;
  job_id?:               string;
  status?:               'applied' | 'shortlisted' | 'ai_interviewing' | 'interviewed' | 'hired';
  // ── Candidate profile fields (flat) ──────────────────────────
  first_name:            string | null;
  last_name:             string | null;
  full_name:             string | null;
  email:                 string | null;
  phone:                 string | null;
  profile_image_url:     string | null;
  city:                  string | null;
  state:                 string | null;   // province
  medical_industry:      string | null;
  specialty:             string[] | null;
  completion_percentage: number | null;
  highest_job_interview_score: number | null;
  highest_interview_score:     number | null;
  created_at:            string;
  updated_at:            string;
}

export interface CandidatesListParams {
  page?:             number;
  limit?:            number;
  status?:           'applied' | 'shortlisted' | 'ai_interviewing' | 'interviewed' | 'hired';
  job_id?:           string;
  search?:           string;
  candidate_status?: string;
}

export interface CandidatesListResponse {
  success: boolean;
  message: string;
  data: {
    candidates: CandidateListItem[];
    pagination: {
      total:           number;
      page:            number;
      limit:           number;
      offset:          number;
      totalPages:      number;
      hasNextPage:     boolean;
      hasPreviousPage: boolean;
    };
  };
}

// ─── Candidate Details ────────────────────────────────────────────────────────
export interface CandidateDetailProfile {
  id:                   string;
  full_name:            string | null;
  first_name:           string | null;
  last_name:            string | null;
  email:                string | null;
  phone:                string | null;
  profile_image_url:    string | null;
  city:                 string | null;
  state:                string | null;
  medical_industry:     string | null;
  specialty:            string[] | null;
  years_of_experience:  number | null;
  completion_percentage: number | null;
  // Extended fields — only on detail endpoint
  bio:                  string | null;
  certifications:       string[] | null;
  specializations:      string[] | null;
  qualifications:       string[] | null;
  ai_interview_summary: string | null;
  ai_interview_score:   number | null;
  highest_job_interview_score: number | null;
  highest_interview_score:     number | null;
}

export interface CandidateDetailsResponse {
  success: boolean;
  message: string;
  data: {
    candidate: CandidateDetailProfile;
  };
}

// ─── Job Application ──────────────────────────────────────────────────────────
export type ApplicationStatus =
  | 'APPLIED'
  | 'SHORTLISTED'
  | 'INTERVIEWING'
  | 'INTERVIEWED'
  | 'REJECTED'
  | 'HIRE';

export interface UpdateApplicationStatusPayload {
  status: ApplicationStatus;
}

export interface UpdateApplicationStatusResponse {
  success: boolean;
  message: string;
  data: {
    id:         string;
    status:     ApplicationStatus;
    updated_at: string;
  };
}

// ─── Invite Candidate ─────────────────────────────────────────────────────────
export interface InviteCandidatePayload {
  candidate_id: string;
  job_id:       string;
  message?:     string;
}

export interface InviteCandidateResponse {
  success: boolean;
  message: string;
  data: {
    invitation_id: string;
    status:        string;
  };
}

// ─── Interview Requests ───────────────────────────────────────────────────────
export interface CreateInterviewRequestPayload {
  candidate_id:        string;   // UUID
  job_application_id:  string;   // UUID — required
  valid_until:         string;   // ISO 8601 future datetime
  message?:            string;
}

export interface InterviewRequest {
  id:                  string;
  recruiter_profile_id: string;
  candidate_id:        string;
  job_application_id:  string;
  status:              'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED';
  message:             string | null;
  valid_until:         string;
  created_at:          string;
  updated_at:          string;
}

export interface InterviewRequestsResponse {
  success: boolean;
  message: string;
  data: {
    interview_requests: InterviewRequest[];
    pagination: {
      total:           number;
      page:            number;
      limit:           number;
      offset:          number;
      totalPages:      number;
      hasNextPage:     boolean;
      hasPreviousPage: boolean;
    };
  };
}

// ─── Wallet ───────────────────────────────────────────────────────────────────
export interface RecruiterWallet {
  id:               string;
  recruiter_id:     string;
  balance_cents:    number;
  held_cents:       number;
  available_cents:  number;
  status:           'active' | 'frozen' | 'suspended';
  currency:         string;   // "CAD"
  created_at:       string;
  updated_at:       string;
}

export interface WalletResponse {
  success: boolean;
  message: string;
  data:    RecruiterWallet;
}

export interface WalletPayPayload {
  amount: number;   // CAD, minimum 1
}

export interface WalletPayResponse {
  success: boolean;
  message: string;
  data: {
    client_secret: string;   // Stripe client_secret for confirmPayment()
  };
}

export interface WalletTopup {
  id:           string;
  amount_cents: number;
  status:       string;
  created_at:   string;
}

export interface WalletTopupsResponse {
  success: boolean;
  message: string;
  data: {
    topups: WalletTopup[];
    pagination: {
      total:      number;
      page:       number;
      limit:      number;
      offset:     number;
      totalPages: number;
    };
  };
}

export interface WalletTransaction {
  id:            string;
  type:          string;
  amount_cents:  number;
  balance_after: number;
  description:   string | null;
  created_at:    string;
}

export interface WalletTransactionsResponse {
  success: boolean;
  message: string;
  data: {
    transactions: WalletTransaction[];
    pagination: {
      total:      number;
      page:       number;
      limit:      number;
      offset:     number;
      totalPages: number;
    };
  };
}

// ─── Notifications ────────────────────────────────────────────────────────────
export interface RecruiterNotification {
  id:         string;
  title:      string;
  body:       string;
  type:       string;
  is_read:    boolean;
  created_at: string;
  metadata?:  Record<string, unknown>;
}

export interface NotificationsParams {
  page?:    number;
  limit?:   number;
  is_read?: boolean;
}

export interface NotificationsResponse {
  success: boolean;
  message: string;
  data: {
    notifications: RecruiterNotification[];
    pagination: {
      total:           number;
      count:           number;
      page:            number;
      limit:           number;
      offset:          number;
      totalPages:      number;
      hasNextPage:     boolean;
      hasPreviousPage: boolean;
    };
  };
}

// ─── Recruiter Profile ────────────────────────────────────────────────────────
export type OrganizationType =
  | 'hospital' | 'clinic' | 'nursing_home' | 'medical_center'
  | 'pharmacy' | 'laboratory' | 'other';

export type RecruiterStatus =
  | 'pending_verification' | 'active' | 'suspended' | 'rejected';

export interface RecruiterProfileData {
  id:                         string;
  user_id:                    string;
  organization_name:          string | null;
  registered_business_name:   string | null;
  organization_type:          OrganizationType | null;
  official_email_address:     string | null;
  contact_number:             string | null;
  organization_website:       string | null;
  organization_photo_url:     string | null;
  street_address:             string | null;
  postal_code:                string | null;
  province:                   string | null;   // camelCase slug e.g. "britishColumbia"
  city:                       string | null;
  country:                    string | null;
  contact_person_name:        string | null;
  contact_person_designation: string | null;
  contact_person_email:       string | null;
  contact_person_phone:       string | null;
  completion_percentage:      number;          // 0–100
  status:                     RecruiterStatus;
  created_at:                 string;
  updated_at:                 string;
}

export interface RecruiterProfileResponse {
  success: boolean;
  message: string;
  data:    RecruiterProfileData;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export interface RecruiterDashboardData {
  total_jobs:       number;
  open_jobs:        number;
  total_candidates: number;
  hired_candidates: number;
  wallet_balance?:  number;
}

export interface RecruiterDashboardResponse {
  success: boolean;
  message: string;
  data:    RecruiterDashboardData;
}