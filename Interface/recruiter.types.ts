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
  range:                      string;
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
  shift_date:        string;
  shift_status:      'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  candidate_id:      string;
  candidate_name:    string;
  check_in:          string | null;
  check_out:         string | null;
  check_out_source:  string | null;
  planned_check_in:  string;
  planned_check_out: string;
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
export interface CandidateListItem {
  candidate_id?:                string;
  id?:                          string;
  first_name:                   string;
  last_name?:                   string;
  full_name?:                   string;
  profile_image_url?:           string;
  specialty?:                   string[];
  medical_industry?:            string;
  city?:                        string;
  state?:                       string;
  preferred_shift?:             string[];
  availability?:                string[];
  completion_percentage?:       number | string;
  best_ai_interview_score?:     number;
  highest_job_interview_score?: number;
  highest_interview_score?:     number;
  avg_rating_score?:            number;
  status?:                      string;
  job_type?:                    string;
  work_eligibility?:            string;
  is_ai_recommended?:           boolean;
  department?:                  string;
  job_title?:                   string;
  experience_in_months?:        number;
  distance?:                    number;
  postal_code?:                 string;
  role?:                        string;
}

export interface CandidatesListParams {
  page?:              number;
  limit?:             number;
  status?:            'applied' | 'shortlisted' | 'ai_interviewing' | 'interviewed' | 'hired';
  job_id?:            string;
  search?:            string;
  candidate_status?:  string;
  is_ai_recommended?: boolean;
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
  id:                      string;
  full_name:               string;
  first_name:              string;
  last_name?:              string;
  email?:                  string;
  phone_number?:           string;
  profile_image_url?:      string;
  city?:                   string;
  state?:                  string;
  preferred_location?:     string;
  job_type?:               string;
  work_eligibility?:       string;
  skill?:                  string | string[];
  specialty?:              string[];
  specializations?:        string[];
  medical_industry?:       string;
  completion_percentage?:  number | string;
  ai_interview_score?:     number | null;
  ai_interview_summary?:   string | null;
  work_experiences?:       WorkExperience[];
  educations?:             Education[];
  documents?:              CandidateDocument[];
  applications?:           CandidateApplication[];
  is_hired?:               boolean;
  is_ai_recommended?:      boolean;
  is_instant_hire?:        boolean;
  is_currently_available?: boolean;
}

export interface CandidateDetailsResponse {
  success: boolean;
  message: string;
  data: {
    candidate: CandidateDetailProfile;
  };
}

// ─── Candidate Sub-types ──────────────────────────────────────────────────────
export interface CandidateApplication {
  id:         string;
  job_id:     string;
  status:     'APPLIED' | 'SHORTLISTED' | 'INTERVIEWING' | 'INTERVIEWED'
            | 'HIRE' | 'REJECTED' | 'ACCEPTED' | 'CANCELLED';
  created_at: string;
  updated_at: string;
  job: {
    id:         string;
    job_title:  string;
    department: string;
    job_type:   string;
    status:     string;
  };
}

export interface WorkExperience {
  id:          string;
  company:     string;
  title:       string;
  start_date?: string;
  end_date?:   string;
}

export interface Education {
  id:          string;
  school:      string;
  degree?:     string;
  field?:      string;
  start_date?: string;
  end_date?:   string;
  start_year?: string;
  end_year?:   string;
}

export interface CandidateDocument {
  id:            string;
  document_type: string;
  title?:        string;
  file_url?:     string;
  status?:       string;
}

// ─── In-House Candidates ──────────────────────────────────────────────────────
export interface InHouseCandidate {
  candidate_id:       string;
  mapping_id:         string;
  status:             'active' | 'removed';
  joined_at:          string;
  first_name:         string;
  last_name?:         string;
  full_name:          string;
  profile_image_url?: string;
  location?: {
    city?:        string;
    state?:       string;
    postal_code?: string;
  };
}

export interface InHouseCandidatesResponse {
  success: boolean;
  message: string;
  data: {
    candidates: InHouseCandidate[];
  };
}

// ─── Job Applications ─────────────────────────────────────────────────────────
export type ApplicationStatus =
  | 'APPLIED'
  | 'SHORTLISTED'
  | 'INTERVIEWING'
  | 'INTERVIEWED'
  | 'REJECTED'
  | 'HIRE'
  | 'ACCEPTED'
  | 'CANCELLED';

export interface JobApplicationItem {
  id:           string;
  job_id:       string;
  candidate_id: string;
  status:       ApplicationStatus;
  created_at:   string;
  updated_at:   string;
  job: {
    id:         string;
    job_title:  string;
    department: string;
    job_type:   string;
    status:     string;
  };
  candidate: {
    id:                       string;
    first_name:               string;
    last_name?:               string;
    full_name:                string;
    profile_image_url?:       string;
    city?:                    string;
    state?:                   string;
    department?:              string;
    job_title?:               string;
    experience?:              string;
    experience_months?:       number;
    work_eligibility?:        string;
    best_ai_interview_score?: number | null;
    job_interview_score?:     number | null;
  };
}

export interface JobApplicationsResponse {
  success: boolean;
  message: string;
  data: {
    applications: JobApplicationItem[];
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

export interface UpdateApplicationStatusPayload {
  status: ApplicationStatus;
}

export interface UpdateApplicationStatusResponse {
  success: boolean;
  message: string;
  data: {
    id:           string;
    job_id:       string;
    candidate_id: string;
    status:       ApplicationStatus;
    updated_at:   string;
  };
}

// ─── Invite Candidate ─────────────────────────────────────────────────────────
export interface InviteCandidatePayload {
  job_id:       string;
  candidate_id: string;
}

export interface InviteCandidateResponse {
  success: boolean;
  message: string;
  data: {
    job_id:       string;
    candidate_id: string;
  };
}

// ─── Interview Requests ───────────────────────────────────────────────────────
export interface CreateInterviewRequestPayload {
  candidate_id:       string;
  job_application_id: string;
  valid_until:        string;
  message?:           string;
}

export interface InterviewRequest {
  id:                   string;
  recruiter_profile_id: string;
  candidate_id:         string;
  job_application_id:   string;
  status:               'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED' | 'SCHEDULED';
  message:              string | null;
  valid_until:          string;
  created_at:           string;
  updated_at:           string;
}

export interface InterviewRequestsResponse {
  success: boolean;
  message: string;
  data: {
    interviewRequests: InterviewRequest[];
    pagination: {
      currentPage:     number;
      totalPages:      number;
      totalCount:      number;
      limit:           number;
      hasNextPage:     boolean;
      hasPreviousPage: boolean;
    };
  };
}

// ─── Wallet ───────────────────────────────────────────────────────────────────
export interface RecruiterWallet {
  id:                 string;
  user_id:            string;
  platform:           'RECRUITER';
  currency:           string;
  is_active:          boolean;
  wallet_lock_reason: string | null;
  available_balance:  string;        // BIGINT as string — parse with Number()
  held_balance:       string;
  pending_balance:    string;
  balance_version:    number;
  created_at:         string;
  updated_at:         string;
}

export interface WalletResponse {
  success: boolean;
  message: string;
  data:    RecruiterWallet;
}

export interface WalletPayPayload {
  amount: number;
}

export interface WalletPayResponse {
  success: boolean;
  message: string;
  data: {
    client_secret:             string;
    topup_id:                  string;
    idempotency_key:           string;
    amount:                    number;   // cents, from Stripe
    currency:                  string;
    stripe_payment_intent_id:  string;
  };
}

export interface WalletTopup {
  id:                        string;
  amount:                    string;   // BIGINT as string (DB-stored cents)
  status:                    string;
  stripe_payment_intent_id?: string;
  created_at:                string;
}

export interface WalletTopupsResponse {
  success: boolean;
  message: string;
  data: {
    items:  WalletTopup[];
    total:  number;
    page:   number;
    limit:  number;
    offset: number;
  };
}

export interface WalletTransaction {
  id:            string;
  type:          string;
  amount:        string;        // BIGINT as string
  balance_after: string;
  description?:  string | null;
  created_at:    string;
}

export interface WalletTransactionsResponse {
  success: boolean;
  message: string;
  data: {
    items:  WalletTransaction[];
    total:  number;
    page:   number;
    limit:  number;
    offset: number;
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
  offset?:  number;
  is_read?: boolean;
}

export interface NotificationsResponse {
  success: boolean;
  message: string;
  data: {
    notifications: RecruiterNotification[];
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

// ─── Recruiter Profile ────────────────────────────────────────────────────────
export type OrganizationType =
  | 'hospital' | 'clinic' | 'nursing_home' | 'medical_center'
  | 'pharmacy' | 'laboratory' | 'other';

export type RecruiterStatus =
  | 'pending' | 'active' | 'suspended' | 'rejected';

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
  province:                   string | null;
  city:                       string | null;
  country:                    string | null;
  contact_person_name:        string | null;
  contact_person_designation: string | null;
  contact_person_email:       string | null;
  contact_person_phone:       string | null;
  completion_percentage:      number;
  status:                     RecruiterStatus;
  created_at:                 string;
  updated_at:                 string;
}

export interface RecruiterDocument {
  id:                   string;
  recruiter_profile_id: string;
  document_type:        string;
  file_url:             string;
  status:               string;
  verified_by:          string | null;
  verified_at:          string | null;
  created_at:           string;
  updated_at:           string;
}

export interface RecruiterProfileResponse {
  success: boolean;
  message: string;
  data: {
    profile:   RecruiterProfileData;
    documents: RecruiterDocument[];
  };
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export interface RecruiterDashboardData {
  job_status_overview: {
    TOTAL:     number;
    DRAFT:     number;
    OPEN:      number;
    PAUSED:    number;
    UPCOMING:  number;
    ACTIVE:    number;
    COMPLETED: number;
    CLOSED:    number;
  };
  application_status_overview: {
    TOTAL:         number;
    NORMAL_JOB:    Record<string, number>;
    INSTANT_JOB?:  Record<string, number>;
  };
  interview_overview: {
    REQUESTS:   Record<string, number>;
    BOOKINGS:   Record<string, number>;
    INTERVIEWS: Record<string, number>;
  };
}

export interface RecruiterDashboardResponse {
  success: boolean;
  message: string;
  data:    RecruiterDashboardData;
}