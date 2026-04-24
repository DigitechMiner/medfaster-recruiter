// ============ BACKEND RESPONSE TYPES (snake_case) ============

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

export type JobStatus =
  | 'DRAFT'
  | 'OPEN'
  | 'PAUSED'
  | 'UPCOMING'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CLOSED';

// ─── Sub-type models ──────────────────────────────────────────────────────────

/** Fields from normal_jobs table */
export interface NormalJobDetails {
  id:                  string;
  job_id:              string;
  years_of_experience: string;
  qualifications:      string[];
  specializations:     number[];   // integer IDs in DB
  ai_interview:        boolean;
  questions:           Record<string, { title: string; questions: string[] }> | null;
  created_at:          string;
  updated_at:          string;
}

/** Fields from instant_jobs table */
export interface InstantJobDetails {
  id:                string;
  job_id:            string;
  neighborhood_name: string | null;
  neighborhood_type: string | null;
  direct_number:     string | null;
  created_at:        string;
  updated_at:        string;
}

/** Narrative fields from job_details table — flattened in API response */
export interface JobDetails {
  description:        string | null;
  responsibilities:   string[];
  required_skills:    string[];
  experience:         string[];
  working_conditions: string[];
  why_join:           string[];     // ← "why_join" NOT "why_join_us" — matches model
}

/** Single shift row from job_shifts table */
export interface JobShift {
  id:                  string;
  job_id:              string;
  shift_date:          string;       // "YYYY-MM-DD"
  check_in_time:       string;       // "HH:mm:ss"
  check_out_time:      string;       // "HH:mm:ss"
  sequence_index:      number;
  total_hours:         number;
  recruiter_pay_cents: string;       // BIGINT as string
  fee_snapshot:        unknown | null;
  status:              'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  created_at:          string;
  updated_at:          string;
}

// ─── Detail response ──────────────────────────────────────────────────────────

/**
 * Full job object from GET /v1/recruiter/jobs/:id
 * All jobs table fields + flattened normalJob/instantJob + job_details fields
 */
export interface JobBackendResponse {
  id:                   string;
  recruiter_profile_id: string;

  // job_title_id / department_id are integers in DB but API returns labels
  job_title:            string;         // human-readable label
  department:           string | null;

  job_type:    'casual' | 'part_time' | 'full_time' | null;  // ← matches EMPLOYMENT_TYPES
  job_urgency: 'instant' | 'normal' | null;

  // ── Location ──────────────────────────────────────────────
  street:      string | null;
  postal_code: string | null;
  province:    string | null;
  city:        string | null;
  geolocation: { type: 'Point'; coordinates: [number, number] } | null;  // ← added; present in create response

  // ── Pay ───────────────────────────────────────────────────
  pay_per_hour_cents: string;           // ← BIGINT returned as string, NOT number
  fee_snapshot:       JobFeeSnapshot | null;
  shift_snapshot:     JobShiftSnapshot | null;  // ← was missing; present in jobs table

  // ── Hiring ────────────────────────────────────────────────
  no_of_hires_required: number;
  no_of_hires_hired:    number;
  application_count:    number;

  // ── Shift ─────────────────────────────────────────────────
  start_date:     string | null;   // "YYYY-MM-DD"
  end_date:       string | null;
  check_in_time:  string | null;   // "HH:mm:ss"
  check_out_time: string | null;

  // ── Status ────────────────────────────────────────────────
  status:               JobStatus;
  closed_reason:        'FILLED' | 'EXPIRED' | 'MANUAL' | null;
  recruiter_close_note: string | null;

  created_at: string;
  updated_at: string;

  // ── Type-specific child rows ───────────────────────────────
  normalJob:  NormalJobDetails | null;
  instantJob: InstantJobDetails | null;

  // ── Narrative fields (flattened from job_details) ─────────
  description:        string | null;
  responsibilities:   string[];
  required_skills:    string[];
  experience:         string[];
  working_conditions: string[];
  why_join:           string[];     // ← NOT why_join_us
}

export interface JobDetailResponse {
  success: boolean;
  message: string;
  data: { job: JobBackendResponse };
}

// ─── List response ────────────────────────────────────────────────────────────

/**
 * GET /v1/recruiter/jobs — flattened subset, no normalJob/instantJob nesting
 */
export interface JobListItem {
  id:                   string;
  job_title:            string;
  department:           string | null;
  job_type:             'casual' | 'part_time' | 'full_time' | null;
  job_urgency:          'instant' | 'normal' | null;
  status:               JobStatus;
  closed_reason:        'FILLED' | 'EXPIRED' | 'MANUAL' | null;
  recruiter_close_note: string | null;
  years_of_experience:  string | null;   // flattened from normalJob
  application_count:    number;
  no_of_hires_required: number;
  no_of_hires_hired:    number;
  pay_per_hour_cents:   string;          // ← BIGINT as string, NOT number
  created_at:           string;
  updated_at:           string;

  // Location
  street?:      string | null;
  postal_code?: string | null;
  province?:    string | null;
  city?:        string | null;

  // Shift
  start_date?:     string | null;
  end_date?:       string | null;
  check_in_time?:  string | null;
  check_out_time?: string | null;

  // Normal job extras
  specializations?: number[] | null;
  qualifications?:  string[] | null;
  ai_interview?:    boolean | null;
}

export interface JobsListResponse {
  success: boolean;
  message: string;
  data: {
    jobs: JobListItem[];
    pagination: {
      total:           number;
      page:            number;
      limit:           number;
      offset:          number;
      totalPages:      number;
      hasNextPage:     boolean;
      hasPreviousPage: boolean;
      // ↓ removed `count` — not in API response
    };
  };
}

// ─── Create / Update ──────────────────────────────────────────────────────────

export interface JobCreatePayload {
  // Required
  job_title:   string;
  department?:  string;
  job_type:    'casual' | 'part_time' | 'full_time';
  job_urgency: 'instant' | 'normal';
  description?: string;
  responsibilities: string[];
  required_skills:  string[];

  // Location — required, geocoded by backend
  street?:      string;
  postal_code?: string;
  province?:    string;
  city?:        string;

  // Narrative (optional arrays)
  experience?:         string[];
  working_conditions?: string[];
  why_join?:           string[];     // ← NOT why_join_us

  // Hiring
  no_of_hires_required?: number;

  // Shift (required for instant/casual, required unless full_time)
  start_date?:     string;   // "YYYY-MM-DD"
  end_date?:       string;
  check_in_time?:  string;   // "HHmm" — e.g. "0800"
  check_out_time?: string;

  // Instant job only
  neighborhood_name?: string;
  neighborhood_type?: string;
  direct_number?:     string;

  // Normal job only
  years_of_experience?: string;
  qualifications?:      string[];
  specializations?:     string[];   // slugs sent, IDs stored
  ai_interview?:        boolean;
  questions?:           string[]; 
  status?: JobStatus;
  pay_per_hour_cents?: string;
    // required if ai_interview: true
}

export type JobUpdatePayload = Partial<JobCreatePayload> & {
  status?:             JobStatus;   // ← ADD
  pay_per_hour_cents?: string;      // ← ADD
};

/**
 * POST /v1/recruiter/jobs response
 * Returns a single flattened object — all jobs + child + job_details fields merged
 */
export interface JobCreateResponse {
  success: boolean;
  message: string;
  data:    JobBackendResponse;   // ← same shape as detail response, not a separate type
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

// ─── Fee Preview ──────────────────────────────────────────────────────────────

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
    job_title:                         string;
    job_title_label:                   string;
    no_of_hires:                       number;
    recruiter_pay_per_hour_cents:      number;
    is_night_shift:                    boolean;
    shift_summaries:                   string[];
    total_working_hours_label:         string;
    total_working_hours:               number;
    per_candidate_shift_recruiter_pay_cents: number;
    total_recruiter_pay_cents:         number;
  };
}

// ─── Frontend form types (camelCase) ─────────────────────────────────────────

export interface JobFormData {
  jobTitle:          string;
  department:        string;
  jobType:           string;
  location:          string;
  payRange:          [number, number];
  experience:        string;
  qualification:     string[];
  specialization:    string[];
  urgency:           'instant' | 'normal';
  inPersonInterview: string;
  physicalInterview: string;
  aiInterview?:      string;
  description:       string;
  responsibilities?: string[];
  required_skills?:  string[];
  workingConditions?: string[];
  whyJoin?:          string[];    // ← renamed from whyJoin to match backend why_join
  experienceList?:   string[];
  streetAddress?:    string;
  postalCode?:       string;
  province?:         string;
  city?:             string;
  country?:          string;
  numberOfHires?:    string;
  fromDate?:         Date;
  tillDate?:         Date;
  fromTime?:         string;
  toTime?:           string;
  status:            JobStatus;
  questions?:        string[];
}

// ─── AI Content Generation ────────────────────────────────────────────────────

export interface GenerateDescriptionPayload {
  job_title:    string;   // ← backend expects snake_case slug
  department:   string;
}

export type GenerateDescriptionResponse = {
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
};

export interface GenerateQuestionsPayload {
  title:           string;
  department:      string;
  specialization?: string;
}

export type GenerateQuestionsResponse = {
  success: boolean;
  message: string;
  data: { questions: string[] };
};

// ─── Legacy / UI types (unchanged) ───────────────────────────────────────────

export interface TopJob {
  id:              number;
  title:           string;
  experience:      string;
  position:        string;
  specializations: string[];
  postedDaysAgo:   number;
  applicantCount:  number;
}

export interface Job {
  id:                number | string;
  doctorName:        string;
  experience:        number;
  position:          string;
  score:             number;
  specialization:    string[];
  currentCompany?:   string;
  candidateId?:      string;
  jobApplicationId?: string;
}

export type StatusType  = 'applied' | 'interviewing' | 'hired';
export type BadgeColor  = 'blue' | 'orange' | 'red' | 'green';

export interface JobsData {
  applied:      Job[];
  interviewing: Job[];
  hired:        Job[];
}

export interface DetailedJobCardProps {
  job:     Job;
  status:  StatusType;
  onClose: () => void;
}

export interface JobListingCardProps {
  job: JobBackendResponse;
}

export interface JobCardProps {
  job:        Job;
  status:     StatusType;
  badgeColor: BadgeColor;
  index?:     number;
  onView?:    (job: Job, status: StatusType, index: number) => void;
}

export interface StatusSectionProps {
  status:     StatusType;
  title:      string;
  count:      number;
  jobs:       Job[];
  badgeColor: BadgeColor;
  onJobView?: (job: Job, status: StatusType, index: number) => void;
}

export interface StatusTableProps {
  status:     StatusType;
  title:      string;
  count:      number;
  jobs:       Job[];
  badgeColor: BadgeColor;
}