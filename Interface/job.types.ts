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

export type JobStatus =
  | 'DRAFT'
  | 'OPEN'
  | 'PAUSED'
  | 'CLOSED'
  | 'UPCOMING'
  | 'ACTIVE'
  | 'COMPLETED';

/** Fields that belong ONLY to a normal/regular job */
export interface NormalJobDetails {
  id:                  string;
  job_id:              string;
  years_of_experience: string;
  qualifications:      string[];
  specializations:     number[];   // DB stores integer IDs — use convertSpecializationToFrontend()
  ai_interview:        boolean;
  questions:           Record<string, { title: string; questions: string[] }> | null;
  created_at:          string;
  updated_at:          string;
}

/** Fields that belong ONLY to an instant/urgent job */
export interface InstantJobDetails {
  id:                string;
  job_id:            string;
  neighborhood_name: string | null;
  neighborhood_type: string | null;
  direct_number:     string | null;
  created_at:        string;
  updated_at:        string;
}

/** Job details narrative fields (stored in job_details table, flattened in API response) */
export interface JobDetails {
  description:       string | null;
  responsibilities:  string[];
  required_skills:   string[];
  experience:        string[];
  working_conditions: string[];
  why_join:          string[];
}

/**
 * Full job response from GET /recruiter/jobs/:id
 * Shift fields (start_date, check_in_time etc.) live flat on the jobs table —
 * they are NOT exclusive to instantJob.
 */
export interface JobBackendResponse {
  id:                   string;
  recruiter_profile_id: string;
  job_title:            string;
  department:           string | null;
  job_type:             'casual' | 'part_time' | 'full_time' | null;
  job_urgency:          'instant' | 'normal' | null;

  // ── Location ───────────────────────────────────────────────
  street:      string | null;
  postal_code: string | null;
  province:    string | null;
  city:        string | null;

  // ── Pay ────────────────────────────────────────────────────
  /** Hourly pay in cents (BIGINT). Divide by 100 for dollars. */
  pay_per_hour_cents: number | null;
  fee_snapshot:       JobFeeSnapshot | null;

  // ── Hiring ─────────────────────────────────────────────────
  no_of_hires_required: number;   // default 1, never null
  no_of_hires_hired:    number;   // default 0, never null
  application_count:    number;

  // ── Shift (flat on jobs table — both instant and normal) ───
  start_date:     string | null;   // "YYYY-MM-DD"
  end_date:       string | null;   // "YYYY-MM-DD" — null for full_time
  check_in_time:  string | null;   // "HH:mm:ss"
  check_out_time: string | null;   // "HH:mm:ss"

  // ── Status ─────────────────────────────────────────────────
  status:               JobStatus;
  closed_reason:        'FILLED' | 'EXPIRED' | 'MANUAL' | null;
  recruiter_close_note: string | null;

  created_at: string;
  updated_at: string;

  // ── Type-specific extras ───────────────────────────────────
  normalJob:  NormalJobDetails | null;
  instantJob: InstantJobDetails | null;

  // ── Job details (narrative fields from job_details table) ──
  description:        string | null;
  responsibilities:   string[];
  required_skills:    string[];
  experience:         string[];
  working_conditions: string[];
  why_join:           string[];
}

// ============ LIST RESPONSE ============
// The list endpoint returns a flattened subset — no normalJob/instantJob nesting.
// start_date, end_date, check_in_time, check_out_time may not be returned by the list API.
// Use the detail endpoint (/jobs/:id) to get full details.

export interface JobListItem {
  id:                   string;
  job_title:            string;
  department:           string | null;
  job_type:             'casual' | 'part_time' | 'full_time' | null;
  job_urgency:          'instant' | 'normal' | null;
  status:               JobStatus;
  closed_reason:        string | null;
  recruiter_close_note: string | null;
  years_of_experience:  string | null;   // flattened from normalJob
  application_count:    number;
  no_of_hires_required: number;
  no_of_hires_hired:    number;
  pay_per_hour_cents:   number | null;
  created_at:           string;
  updated_at:           string;

  // Location — present on list response
  city?:        string | null;
  province?:    string | null;
  street?:      string | null;
  postal_code?: string | null;

  // Shift — may be present for instant jobs
  start_date?:     string | null;
  end_date?:       string | null;
  check_in_time?:  string | null;
  check_out_time?: string | null;

  // Normal job extras — may be present
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

// ============ DETAIL RESPONSE ============

export interface JobDetailResponse {
  success: boolean;
  message: string;
  data: { job: JobBackendResponse };
}

// ============ CREATE / UPDATE ============

export interface JobCreatePayload {
  job_title:    string;
  department?:  string | null;
  job_type?:    'casual' | 'part_time' | 'full_time' | null;
  job_urgency?: 'instant' | 'normal';

  // ── Location ─────────────────────────────────────────────
  street?:            string | null;
  postal_code?:       string | null;
  province?:          string | null;
  city?:              string | null;
  neighborhood_name?: string | null;
  neighborhood_type?: string | null;
  direct_number?:     string | null;

  // ── Pay ──────────────────────────────────────────────────
  pay_per_hour_cents?: number | null;   // ← replaces pay_range_min / pay_range_max

  // ── Normal job fields ────────────────────────────────────
  years_of_experience?: string | null;
  qualifications?:      string[] | null;
  specializations?:     string[] | null;
  ai_interview?:        boolean;
  questions?:           string[] | Record<string, unknown> | null;

  // ── Shift ────────────────────────────────────────────────
  start_date?:     string | null;   // "YYYY-MM-DD"
  end_date?:       string | null;   // "YYYY-MM-DD"
  check_in_time?:  string | null;   // "HH:mm"
  check_out_time?: string | null;   // "HH:mm"

  // ── Narrative ────────────────────────────────────────────
  description?: string | null;

  // ── Hiring ───────────────────────────────────────────────
  no_of_hires_required?: number;    // ← replaces no_of_hires

  status: JobStatus;
}

export type JobUpdatePayload = Partial<JobCreatePayload>;

export interface JobCreateResponse {
  success: boolean;
  message: string;
  data: {
    id:                   string;
    recruiter_profile_id: string;
    job_title_id:         number;
    department_id:        number;
    job_type:             'casual' | 'part_time' | 'full_time';
    street:               string | null;
    postal_code:          string | null;
    province:             string | null;
    city:                 string | null;
    geolocation:          { type: string; coordinates: [number, number] } | null;
    pay_per_hour_cents:   string;   // BIGINT returned as string — parse with parseInt()
    fee_snapshot:         JobFeeSnapshot | null;
    shift_snapshot:       unknown | null;
    job_urgency:          'instant' | 'normal';
    no_of_hires_required: number;
    no_of_hires_hired:    number;
    start_date:           string | null;
    end_date:             string | null;
    check_in_time:        string | null;
    check_out_time:       string | null;
    status:               JobStatus;
    closed_reason:        string | null;
    recruiter_close_note: string | null;
    application_count:    number;
    // Normal job fields (flattened in create response)
    years_of_experience:  string | null;
    qualifications:       string[];
    specializations:      number[];   // IDs, not slugs
    ai_interview:         boolean;
    questions:            Record<string, unknown> | null;
    // Narrative fields
    description:          string | null;
    responsibilities:     string[];
    required_skills:      string[];
    experience:           string[];
    working_conditions:   string[];
    why_join:             string[];
    created_at:           string;
    updated_at:           string;
  };
}

export interface JobUpdateResponse {
  success: boolean;
  message: string;
  data:    JobCreateResponse['data'];
}

export interface JobDeleteResponse {
  success: boolean;
  message: string;
}

// ============ FRONTEND FORM TYPES (camelCase) ============

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
  workingConditions?:   string[];
  whyJoinUs?:           string[];
  experienceList?:      string[];
  streetAddress?:    string;
  postalCode?:       string;
  province?:         string;
  city?:             string;
  country?:          string;
  numberOfHires?:    string;
  // ── Instant job form fields ──────────────────────────────
  fromDate?: Date;
  tillDate?: Date;
  fromTime?: string;
  toTime?:   string;
  status:    JobStatus;
}

// ============ GENERATE AI CONTENT ============

export interface GenerateDescriptionPayload {
  jobTitle:            string;
  department:          string;
  jobType:             string;
  payRange?:           string;
  location?:           string;
  experienceRequired?: string;
  qualification?:      string;
  specialization?:     string;
  urgency?:            string;
  inPersonInterview?:  boolean;
  physicalInterview?:  boolean;
}

export type GenerateDescriptionResponse = {
  success: boolean;
  message: string;
  data: { description: string };
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

// ============ LEGACY TYPES ============

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

export type StatusType = 'applied' | 'interviewing' | 'hired';
export type BadgeColor = 'blue' | 'orange' | 'red' | 'green';

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