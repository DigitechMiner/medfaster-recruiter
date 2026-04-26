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

export interface JobDetails {
  description:        string | null;
  responsibilities:   string[];
  required_skills:    string[];
  experience:         string[];
  working_conditions: string[];
  why_join:           string[];
}

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

export interface JobBackendResponse {
  id:                   string;
  recruiter_profile_id: string;

  job_title:   string;
  department:  string | null;

  job_type:    'casual' | 'part_time' | 'full_time' | null;
  job_urgency: 'instant' | 'normal' | null;

  street:      string | null;
  postal_code: string | null;
  province:    string | null;
  city:        string | null;
  geolocation: { type: 'Point'; coordinates: [number, number] } | null;

  pay_per_hour_cents: string;        // BIGINT returned as string
  fee_snapshot:       JobFeeSnapshot | null;
  shift_snapshot:     JobShiftSnapshot | null;

  no_of_hires_required: number;
  no_of_hires_hired:    number;
  application_count:    number;

  start_date:     string | null;     // "YYYY-MM-DD"
  end_date:       string | null;
  check_in_time:  string | null;     // "HH:mm:ss"
  check_out_time: string | null;

  status:               JobStatus;
  closed_reason:        'FILLED' | 'EXPIRED' | 'MANUAL' | null;
  recruiter_close_note: string | null;

  created_at: string;
  updated_at: string;

  normalJob:  NormalJobDetails | null;
  instantJob: InstantJobDetails | null;

  description:        string | null;
  responsibilities:   string[];
  required_skills:    string[];
  experience:         string[];
  working_conditions: string[];
  why_join:           string[];
}

export interface JobDetailResponse {
  success: boolean;
  message: string;
  data: { job: JobBackendResponse };
}

// ─── List response ────────────────────────────────────────────────────────────

export interface JobListItem {
  id:                   string;
  job_title:            string;
  department:           string | null;
  job_type:             'casual' | 'part_time' | 'full_time' | null;
  job_urgency:          'instant' | 'normal' | null;
  status:               JobStatus;
  closed_reason:        'FILLED' | 'EXPIRED' | 'MANUAL' | null;
  recruiter_close_note: string | null;
  years_of_experience:  string | null;
  application_count:    number;
  no_of_hires_required: number;
  no_of_hires_hired:    number;
  pay_per_hour_cents:   string;       // BIGINT as string
  created_at:           string;
  updated_at:           string;

  street?:      string | null;
  postal_code?: string | null;
  province?:    string | null;
  city?:        string | null;

  start_date?:     string | null;
  end_date?:       string | null;
  check_in_time?:  string | null;
  check_out_time?: string | null;

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
    };
  };
}

// ─── Create / Update ──────────────────────────────────────────────────────────

export interface JobCreatePayload {
  // Required
  job_title:        string;
  department?:      string;
  job_type:         'casual' | 'part_time' | 'full_time';
  job_urgency:      'instant' | 'normal';
  description?:     string;
  responsibilities: string[];
  required_skills:  string[];

  // Location
  street?:      string;
  postal_code?: string;
  province?:    string;
  city?:        string;

  // Narrative
  experience?:         string[];
  working_conditions?: string[];
  why_join?:           string[];

  // Hiring
  no_of_hires_required?: number;

  // Shift — "HH:mm" e.g. "08:00"
  start_date?:     string;   // "YYYY-MM-DD"
  end_date?:       string;
  check_in_time?:  string;
  check_out_time?: string;

  // Instant job only
  neighborhood_name?: string;
  neighborhood_type?: string;
  direct_number?:     string;

  // Normal job only
  years_of_experience?: string;
  qualifications?:      string[];
  specializations?:     string[];
  ai_interview?:        boolean;
  questions?:           string[];

  // ✅ number — frontend sends Math.round(rate * 100), not a string
  pay_per_hour_cents?: number;

  status?: JobStatus;
}

export type JobUpdatePayload = Partial<JobCreatePayload> & {
  status?:             JobStatus;
  pay_per_hour_cents?: number;
};

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
    job_title:                              string;
    job_title_label:                        string;
    no_of_hires:                            number;
    recruiter_pay_per_hour_cents:           number;
    is_night_shift:                         boolean;
    shift_summaries:                        string[];
    total_working_hours_label:              string;
    total_working_hours:                    number;
    per_candidate_shift_recruiter_pay_cents: number;
    total_recruiter_pay_cents:              number;
  };
}

// ─── Frontend form types (camelCase) ─────────────────────────────────────────

export interface JobFormData {
  jobTitle:           string;
  department:         string;
  jobType:            string;
  location:           string;
  payRange:           [number, number];
  experience:         string;
  qualification:      string[];
  specialization:     string[];
  urgency:            'instant' | 'normal';
  inPersonInterview:  string;
  physicalInterview:  string;
  aiInterview?:       string;
  description:        string;
  responsibilities?:  string[];
  required_skills?:   string[];
  workingConditions?: string[];
  whyJoin?:           string[];
  experienceList?:    string[];
  streetAddress?:     string;
  postalCode?:        string;
  province?:          string;
  city?:              string;
  country?:           string;
  numberOfHires?:     string;
  fromDate?:          Date;
  tillDate?:          Date;
  fromTime?:          string;
  toTime?:            string;
  status:             JobStatus;
  questions?:         string[];
}

// ─── AI Content Generation ────────────────────────────────────────────────────

export interface GenerateDescriptionPayload {
  job_title:  string;
  department: string;
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

// ─── Legacy / UI types ───────────────────────────────────────────────────────

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