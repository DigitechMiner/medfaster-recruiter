// Interface/recruiter.types.ts


// ══════════════════════════════════════════════════════════════════════════════
// SHARED
// ══════════════════════════════════════════════════════════════════════════════

export interface PaginationData {
  total:           number;
  page:            number;
  limit:           number;
  offset?:         number;
  totalPages:      number;
  hasNextPage:     boolean;
  hasPreviousPage: boolean;
}


// ══════════════════════════════════════════════════════════════════════════════
// RECRUITER PROFILE
// ══════════════════════════════════════════════════════════════════════════════

export type OrganizationType =
  | 'hospital' | 'clinic' | 'nursing_home' | 'medical_center'
  | 'pharmacy' | 'laboratory' | 'long_term_care' | 'home_care'
  | 'diagnostic_lab' | 'rehabilitation_center' | 'hospice'
  | 'mental_health_facility' | 'public_health' | 'other';

export type RecruiterStatus = 'pending' | 'active' | 'suspended' | 'rejected';

export type CanadianProvince =
  | 'AB' | 'BC' | 'MB' | 'NB' | 'NL' | 'NS' | 'NT' | 'NU'
  | 'ON' | 'PE' | 'QC' | 'SK' | 'YT';

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

// Alias for files that import RecruiterProfile (not RecruiterProfileData)
export type RecruiterProfile = RecruiterProfileData;

export interface RecruiterDocument {
  id:                   string;
  recruiter_profile_id: string;
  document_type:        string;
  file_url:             string;
  status:               string;
  verified_by?:         string | null;
  verified_at?:         string | null;
  created_at?:          string;
  updated_at?:          string;
}

export interface RecruiterProfileResponse {
  success: boolean;
  message: string;
  data: {
    profile:   RecruiterProfileData;
    documents: RecruiterDocument[];
  };
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data: {
    profile:   RecruiterProfileData;
    documents: RecruiterDocument[];
  };
}


// ══════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════

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
    TOTAL:        number;
    NORMAL_JOB:   Record<string, number>;
    INSTANT_JOB?: Record<string, number>;
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


// ══════════════════════════════════════════════════════════════════════════════
// WALLET
// ══════════════════════════════════════════════════════════════════════════════

export interface RecruiterWallet {
  id:                 string;
  user_id:            string;
  platform:           'RECRUITER';
  currency:           string;
  is_active:          boolean;
  wallet_lock_reason: string | null;
  available_balance:  string;
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

export interface WalletPayPayload { amount: number }

export interface WalletPayResponse {
  success: boolean;
  message: string;
  data: {
    client_secret:            string;
    topup_id:                 string;
    idempotency_key:          string;
    amount:                   number;
    currency:                 string;
    stripe_payment_intent_id: string;
  };
}

export interface WalletTopup {
  id:                        string;
  wallet_id?:                string;
  amount:                    string | number;
  currency?:                 string;
  status:                    string;
  stripe_payment_intent_id?: string;
  created_at:                string;
  updated_at?:               string;
}

export interface WalletTransaction {
  id:                   string;
  wallet_id?:           string;
  type:                 string;
  direction?:           string;
  amount:               string;
  currency?:            string;
  status?:              string;
  description:          string | null;
  balance_after?:       string;
  platform?:            string;
  reference_group_id?:  string;
  idempotency_key?:     string;
  transaction_id?:      string;
  category?:            string;
  job_id?:              string;
  job_type?:            string;
  metadata?:            Record<string, unknown>;
  created_at:           string;
  updated_at?:          string;
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


// ══════════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ══════════════════════════════════════════════════════════════════════════════

export interface RecruiterNotification {
  id:        string;
  title:     string;
  body:      string;
  type:      string;
  is_read:   boolean;
  created_at: string;
  metadata?: Record<string, unknown>;
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
    pagination:    PaginationData;
  };
}


// ══════════════════════════════════════════════════════════════════════════════
// JOBS
// ══════════════════════════════════════════════════════════════════════════════

export type JobStatus =
  | 'DRAFT' | 'OPEN' | 'PAUSED' | 'UPCOMING'
  | 'ACTIVE' | 'COMPLETED' | 'CLOSED';

export type JobType    = 'casual' | 'part_time' | 'full_time';
export type JobUrgency = 'instant' | 'normal';

export interface JobFeeSnapshot {
  candidate_total_per_hour_fees_with_gst_cents: number | null;
  total_recruiter_pay_cents:                    number | null;
  per_shift_recruiter_pay_cents:                number | null;
  bonus: null | {
    type:                 'experience';
    years_of_experience:  number;
    experience_months:    number;
    bonus_percent:        number;
    per_hour_bonus_cents: number;
    total_bonus_cents:    number;
  };
}

export interface JobShiftSnapshot {
  shift_summaries:           string[];
  is_night_shift:            boolean;
  total_working_hours_label: string | null;
}

export interface NormalJobDetails {
  id:                  string;
  job_id:              string;
  years_of_experience: string;
  qualifications:      string[];
  specializations:     number[];
  ai_interview:        boolean;
  questions:           Record<string, { title: string; questions: string[] }> | null;
  created_at:          string;
  updated_at:          string;
}

export interface InstantJobDetails {
  id:                string;
  job_id:            string;
  neighborhood_name: string | null;
  neighborhood_type: string | null;
  direct_number:     string | null;
  created_at:        string;
  updated_at:        string;
}

export interface JobBackendResponse {
  id:                   string;
  recruiter_profile_id: string;
  job_title:            string;
  department:           string | null;
  job_type:             JobType | null;
  job_urgency:          JobUrgency | null;
  street:               string | null;
  postal_code:          string | null;
  province:             string | null;
  city:                 string | null;
  geolocation:          { type: 'Point'; coordinates: [number, number] } | null;
  pay_per_hour_cents:   string;
  fee_snapshot:         JobFeeSnapshot | null;
  shift_snapshot:       JobShiftSnapshot | null;
  no_of_hires_required: number;
  no_of_hires_hired:    number;
  application_count:    number;
  start_date:           string | null;
  end_date:             string | null;
  check_in_time:        string | null;
  check_out_time:       string | null;
  status:               JobStatus;
  closed_reason:        'FILLED' | 'EXPIRED' | 'MANUAL' | null;
  recruiter_close_note: string | null;
  created_at:           string;
  updated_at:           string;
  normalJob:            NormalJobDetails | null;
  instantJob:           InstantJobDetails | null;
  description:          string | null;
  responsibilities:     string[];
  required_skills:      string[];
  experience:           string[];
  working_conditions:   string[];
  why_join:             string[];
}

export interface JobDetailResponse {
  success: boolean;
  message: string;
  data: { job: JobBackendResponse };
}

export interface JobListItem {
  id:                   string;
  job_title:            string;
  department:           string | null;
  job_type:             JobType | null;
  job_urgency:          JobUrgency
  status:               JobStatus;
  closed_reason:        'FILLED' | 'EXPIRED' | 'MANUAL' | null;
  recruiter_close_note: string | null;
  years_of_experience:  string | null;
  application_count:    number;
  no_of_hires_required: number;
  no_of_hires_hired:    number;
  pay_per_hour_cents:   string;
  created_at:           string;
  updated_at:           string;
  street?:              string | null;
  postal_code?:         string | null;
  province?:            string | null;
  city?:                string | null;
  start_date?:          string | null;
  end_date?:            string | null;
  check_in_time?:       string | null;
  check_out_time?:      string | null;
  specializations?:     number[] | null;
  qualifications?:      string[] | null;
  ai_interview?:        boolean | null;
}

export interface JobsListResponse {
  success: boolean;
  message: string;
  data: {
    jobs:       JobListItem[];
    pagination: PaginationData;
  };
}

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

// CalendarShift is the new name; CalendarJob is the alias for old code
export interface CalendarShift {
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

// ← alias so old imports don't break
export type CalendarJob = CalendarShift;

export interface JobsCalendarResponse {
  success: boolean;
  message: string;
  data: {
    range:     string;
    date_from: string;
    date_to:   string;
    shifts:    CalendarShift[];
  };
}

export interface JobCreatePayload {
  job_title:            string;
  department?:          string;
  job_type:             JobType;
  job_urgency:          JobUrgency;
  description?:         string;
  responsibilities?:    string[];
  required_skills?:     string[];
  street?:              string;
  postal_code?:         string;
  province?:            string;
  city?:                string;
  experience?:          string[];
  working_conditions?:  string[];
  why_join?:            string[];
  no_of_hires_required?: number;
  start_date?:          string;
  end_date?:            string;
  check_in_time?:       string;
  check_out_time?:      string;
  neighborhood_name?:   string;
  neighborhood_type?:   string;
  direct_number?:       string;
  years_of_experience?: string;
  qualifications?:      string[];
  specializations?:     string[];
  ai_interview?:        boolean;
  questions?:           string[];
  pay_per_hour_cents?:  number;
  status?:              JobStatus;
}

export type JobUpdatePayload = Partial<JobCreatePayload>;

export interface JobCreateResponse {
  success: boolean;
  message: string;
  data:    JobBackendResponse;
}

export interface JobUpdateResponse {
  success: boolean;
  message: string;
  data:    JobBackendResponse;
}

export interface JobDeleteResponse {
  success: boolean;
  message: string;
}

export interface JobFeePreviewPayload {
  job_title:            string;
  no_of_hires_required: number;
  start_date:           string;
  end_date:             string;
  check_in_time:        string;
  check_out_time:       string;
}

export interface JobFeePreviewResponse {
  success: boolean;
  message: string;
  data: {
    job_title:                               string;
    job_title_label:                         string;
    no_of_hires:                             number;
    recruiter_pay_per_hour_cents:            number;
    is_night_shift:                          boolean;
    shift_summaries:                         string[];
    total_working_hours_label:               string;
    total_working_hours:                     number;
    per_candidate_shift_recruiter_pay_cents: number;
    total_recruiter_pay_cents:               number;
  };
}

export interface GenerateDescriptionPayload {
  job_title:  string;
  department: string;
}

export interface GenerateDescriptionResponse {
  success: boolean;
  message: string;
  data: {
    description:        string;
    responsibilities:   string[];
    required_skills:    string[];
    experience:         string[];
    working_conditions: string[];
    why_join:           string[];
  };
}

export interface GenerateQuestionsPayload {
  title:           string;
  department:      string;
  specialization?: string;
}

export interface GenerateQuestionsResponse {
  success: boolean;
  message: string;
  data: { questions: string[] };
}

export type Province =
  | "" |'alberta' | 'britishColumbia' | 'manitoba' | 'newBrunswick'
  | 'newfoundlandAndLabrador' | 'northwestTerritories' | 'novaScotia'
  | 'nunavut' | 'ontario' | 'princeEdwardIsland' | 'quebec'
  | 'saskatchewan' | 'yukon';

export interface JobFormData {
  jobTitle:           string;
  department:         string;
  jobType:            string;
  urgency:            JobUrgency;
  description:        string;
  responsibilities:   string[];
  required_skills:    string[];
  streetAddress?:     string;
  postalCode?:        string;
  province?:          Province;
  city?:              string;
  country?:           string;
  qualification:      string[];
  specialization:     string[];
  experience:         string;
  experienceList?:    string[];
  aiInterview?:       boolean;
  questions?:         string[];
  numberOfHires?:     string;
  fromDate?:          Date;
  tillDate?:          Date;
  fromTime?:          string;
  toTime?:            string;
  status:             JobStatus;
  neighborhoodName?:  string;
  neighborhoodType?:  string;
  directNumber?:      string;
  workingConditions?: string[];
  whyJoin?:           string[];
  location?:          string;
  payRange?:          [number, number] | string;
  inPersonInterview?: string | boolean;
  physicalInterview?: string | boolean;
}

// Alias used by instant-replacement-form.tsx
export interface InstantJobFormData extends JobFormData {
  amountPerHire?:    string;    // ← fixes L50, L59, L60, L100
  numberOfHires?:    string;    // already on JobFormData but explicit here too
  neighborhoodName?: string;
  neighborhoodType?: string;
  directNumber?:     string;
}


// ══════════════════════════════════════════════════════════════════════════════
// CANDIDATES — LIST
// ══════════════════════════════════════════════════════════════════════════════

export interface CandidateListItem {
  // Core fields from GET /recruiter/candidates
  candidate_id?:                string;
  id?:                          string;
  first_name:                   string;
  last_name?:                   string | null;
  full_name?:                   string;
  profile_image_url?:           string | null;   // ← added back
  department?:                  string | string[];
  job_title?:                   string;
  job_titles?:                  string[];
  experience_in_months?:        number | null;
  avg_rating_score?:            number | null;
  best_ai_interview_score?:     number | null;
  highest_job_interview_score?: number | null;
  highest_interview_score?:     number | null;
  distance?:                    number | null;
  work_eligibility?:            string | null;
  // Legacy fields used by existing components
  specialty?:                   string[];
  specializations?:             string[];
  medical_industry?:            string;
  city?:                        string;
  state?:                       string;
  preferred_shift?:             string[];
  availability?:                string[];
  completion_percentage?:       number | string;
  status?:                      string;
  job_type?:                    string;
  is_ai_recommended?:           boolean;
  role?:                        string;
  postal_code?:                 string;
}

export interface CandidatesListParams {
  page?:              number;
  limit?:             number;
  search?:            string;
  status?:            string;
  job_id?:            string;
  candidate_status?:  string;
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
  UNIQUE_HIRED_CANDIDATES:          number;
  INHOUSE_CANDIDATES:               number;
  IN_HOUSE_CANDIDATES?:             number;   // ← alias, some API versions use this key
  ACTIVE_HIRED_CANDIDATES:          number;
  AVAILABLE_CANDIDATES_WITHIN_30KM: number;
}

export interface CandidateSummaryResponse {
  success: boolean;
  message: string;
  data:    CandidateSummaryData;
}


// ══════════════════════════════════════════════════════════════════════════════
// CANDIDATES — DETAIL
// ══════════════════════════════════════════════════════════════════════════════

export interface CandidateQualificationItem {
  id:          string;
  type:        string;
  institution: string | null;
  year:        number | null;
  description: string | null;
}

// CandidateDocumentItem is the new name; CandidateDocument is the alias
export interface CandidateDocumentItem {
  document_id:   string;
  document_type: string;
  title:         string;
  file_url:      string | null;
  created_at:    string;
}

// ← alias so old imports of CandidateDocument don't break
export type CandidateDocument = CandidateDocumentItem & { id?: string; status?: string };

export interface CandidateWorkExperienceItem {
  id:          string;
  company:     string;
  title:       string;
  start_date:  string;
  end_date:    string | null;
  is_current:  boolean;
  description: string | null;
}

// Alias for old code
export type WorkExperience = CandidateWorkExperienceItem;

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

export interface CandidateWorkHistoryItem {
  application_id: string;
  job_id:         string;
  job_title:      string;
  organization:   string;
  job_type:       string;
  start_date:     string | null;
  end_date:       string | null;
  status:         string;
}

export interface CandidateRatingItem {
  id:           string;
  job_id:       string;
  job_title:    string;
  recruiter_id: string;
  rating:       number;
  comment:      string | null;
  created_at:   string;
}

export interface CandidateApplication {
  id:         string;
  job_id:     string;
  status:     string;
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

export interface CandidateDetailProfile {
  // ── New fields (from updated API) ─────────────────────────────────────────
  candidate_id?:         string;
  full_name:             string;
  first_name:            string;
  last_name?:            string | null;
  profile_image_url?:    string | null;
  city?:                 string | null;
  state?:                string | null;
  department?:           string | string[];
  job_title?:            string;
  experience_in_months?: number | null;
  work_eligibility?:     string | null;
  user?: {
    email: string | null;
    phone: string | null;
  };
  general_score?: {
    best_ai_interview_score: number | null;
    avg_rating_score:        number | null;
  } | null;
  qualifications?:   CandidateQualificationItem[];
  documents?:        CandidateDocumentItem[];
  work_experiences?: CandidateWorkExperienceItem[];
  work_history?:     CandidateWorkHistoryItem[];
  ratings?:          CandidateRatingItem[];

  // ── Legacy fields (used by existing components — keep until refactored) ──
  id?:                      string;
  email?:                   string | null;
  phone_number?:            string | null;
  preferred_location?:      string | null;
  job_type?:                string | null;
  skill?:                   string | string[];
  specialty?:               string[];
  specializations?:         string[];
  medical_industry?:        string;
  completion_percentage?:   number | string;
  ai_interview_score?:      number | null;
  ai_interview_summary?:    string | null;
  educations?:              Education[];
  applications?:            CandidateApplication[];
  is_hired?:                boolean;
  is_ai_recommended?:       boolean;
  is_instant_hire?:         boolean;
  is_currently_available?:  boolean;
}

export interface CandidateDetailsResponse {
  success: boolean;
  message: string;
  data: { candidate: CandidateDetailProfile };
}


// ══════════════════════════════════════════════════════════════════════════════
// IN-HOUSE CANDIDATES
// ══════════════════════════════════════════════════════════════════════════════

export interface InHouseCandidate {
  candidate_id:         string;
  mapping_id:           string;
  status:               'PENDING' | 'ACTIVE' | 'REMOVED' | string;
  joined_at:            string;
  first_name:           string;
  last_name?:           string | null;
  full_name:            string;
  profile_image_url?:   string | null;
  experience_in_months?: number | null;
  department?:          string[] | null;
  job_titles?:          string[] | null;
  location?: {
    city?:        string | null;
    state?:       string | null;
    postal_code?: string | null;
  } | null;
  user?: { email: string | null } | null;
}

export interface InHouseCandidatesResponse {
  success: boolean;
  message: string;
  data: {
    candidates: InHouseCandidate[];
    pagination?: PaginationData;
  };
}

export interface InHouseInvitePayload {
  full_name: string;
  email:     string;
}

export interface InHouseInviteResponse {
  success: boolean;
  message: string;
}

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


// ══════════════════════════════════════════════════════════════════════════════
// JOB APPLICATIONS
// ══════════════════════════════════════════════════════════════════════════════

export type ApplicationStatus =
  | 'APPLIED' | 'SHORTLISTED' | 'INTERVIEWING' | 'INTERVIEWED'
  | 'REJECTED' | 'HIRE' | 'ACCEPTED' | 'CANCELLED';

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
    id:                      string;
    first_name:              string;
    last_name?:              string | null;
    full_name:               string;
    profile_image_url?:      string | null;
    city?:                   string | null;
    state?:                  string | null;
    department?:             string;
    departments?:            string[];
    job_title?:              string;
    experience?:             string;
    experience_months?:      number;
    work_eligibility?:       string | null;
    best_ai_interview_score?: number | null;
    job_interview_score?:    number | null;
  };
}

export interface JobApplicationsParams {
  page?:    number;
  limit?:   number;
  job_id?:  string;
  status?:  ApplicationStatus | string;
}

export interface JobApplicationsResponse {
  success: boolean;
  message: string;
  data: {
    applications: JobApplicationItem[];
    pagination:   PaginationData;
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


// ══════════════════════════════════════════════════════════════════════════════
// INTERVIEW REQUESTS
// ══════════════════════════════════════════════════════════════════════════════

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
  status:
    | 'PENDING' | 'ACCEPTED' | 'REJECTED'
    | 'EXPIRED' | 'CANCELLED' | 'SCHEDULED';
  message:     string | null;
  valid_until: string;
  created_at:  string;
  updated_at:  string;
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


// ══════════════════════════════════════════════════════════════════════════════
// COMMON / METADATA
// ══════════════════════════════════════════════════════════════════════════════

export interface SpecializationItem {
  id:    number;
  value: string;
  label: string;
}

export interface SpecializationsResponse {
  success: boolean;
  message: string;
  data: { specializations: SpecializationItem[] };
}

export type Job = JobListItem;
export type TopJob = JobListItem;

