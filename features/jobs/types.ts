import type { PaginationData } from "@/types";

// ============================================================================
// TYPES — jobs, calendar, summaries, applications, fee preview, AI generators
// ============================================================================

export type JobStatus =
  | "DRAFT"
  | "OPEN"
  | "PAUSED"
  | "UPCOMING"
  | "ACTIVE"
  | "COMPLETED"
  | "CLOSED";

export type JobType = "casual" | "part_time" | "full_time";
export type JobUrgency = "instant" | "normal";

export interface JobFeeSnapshot {
  candidate_total_per_hour_fees_with_gst_cents: number | null;
  total_recruiter_pay_cents: number | null;
  per_shift_recruiter_pay_cents: number | null;
  bonus: null | {
    type: "experience";
    years_of_experience: number;
    experience_months: number;
    bonus_percent: number;
    per_hour_bonus_cents: number;
    total_bonus_cents: number;
  };
}

export interface JobShiftSnapshot {
  shift_summaries: string[];
  is_night_shift: boolean;
  total_working_hours_label: string | null;
}

export interface NormalJobDetails {
  id: string;
  job_id: string;
  years_of_experience: string;
  qualifications: string[];
  specializations: number[];
  ai_interview: boolean;
  questions: Record<string, { title: string; questions: string[] }> | null;
  created_at: string;
  updated_at: string;
}

export interface InstantJobDetails {
  id: string;
  job_id: string;
  neighborhood_name: string | null;
  neighborhood_type: string | null;
  direct_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface JobBackendResponse {
  id: string;
  recruiter_profile_id: string;
  job_title: string;
  department: string | null;
  job_type: JobType | null;
  job_urgency: JobUrgency | null;
  street: string | null;
  postal_code: string | null;
  province: string | null;
  city: string | null;
  geolocation: { type: "Point"; coordinates: [number, number] } | null;
  pay_per_hour_cents: string;
  fee_snapshot: JobFeeSnapshot | null;
  shift_snapshot: JobShiftSnapshot | null;
  no_of_hires_required: number;
  no_of_hires_hired: number;
  application_count: number;
  start_date: string | null;
  end_date: string | null;
  check_in_time: string | null;
  check_out_time: string | null;
  status: JobStatus;
  closed_reason: "FILLED" | "EXPIRED" | "MANUAL" | null;
  recruiter_close_note: string | null;
  created_at: string;
  updated_at: string;
  normalJob: NormalJobDetails | null;
  instantJob: InstantJobDetails | null;
  description: string | null;
  responsibilities: string[];
  required_skills: string[];
  experience: string[];
  working_conditions: string[];
  why_join: string[];
}

export interface JobDetailResponse {
  success: boolean;
  message: string;
  data: { job: JobBackendResponse };
}

export interface JobListItem {
  id: string;
  job_title: string;
  department: string | null;
  job_type: JobType | null;
  job_urgency: JobUrgency;
  status: JobStatus;
  closed_reason: "FILLED" | "EXPIRED" | "MANUAL" | null;
  recruiter_close_note: string | null;
  years_of_experience: string | null;
  application_count: number;
  no_of_hires_required: number;
  no_of_hires_hired: number;
  pay_per_hour_cents: string;
  created_at: string;
  updated_at: string;
  street?: string | null;
  postal_code?: string | null;
  province?: string | null;
  city?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  check_in_time?: string | null;
  check_out_time?: string | null;
  specializations?: number[] | null;
  qualifications?: string[] | null;
  ai_interview?: boolean | null;
}

export interface JobsListResponse {
  success: boolean;
  message: string;
  data: {
    jobs: JobListItem[];
    pagination: PaginationData;
  };
}

export interface JobsSummaryData {
  range: string;
  date_from: string;
  date_to: string;
  open_job_count: number;
  incomplete_shift_count: number;
  no_checkin_candidate_count: number;
  active_shift_count: {
    urgent_instant: number;
    normal: number;
    total: number;
  };
}

export interface JobsSummaryResponse {
  success: boolean;
  message: string;
  data: JobsSummaryData;
}

export interface CalendarShift {
  assignment_id: string;
  job_id: string;
  shift_id: string;
  shift_date: string;
  shift_status: "ACTIVE" | "UPCOMING" | "COMPLETED" | "CANCELLED";
  candidate_id: string;
  candidate_name: string;
  check_in: string | null;
  check_out: string | null;
  check_out_source: string | null;
  planned_check_in: string | null;
  planned_check_out: string | null;
  job_title: string;
  job_type: string;
}

export type CalendarJob = CalendarShift;

export type CalendarSummary = {
  active_shift: number;
  upcoming_shift: number;
  complete_shift: number;
  pending_checkin: number;
  early_checkout: number;
  no_show_missed: number;
};

export type JobsCalendarResponse = {
  success: boolean;
  message: string;
  data: {
    range: string;
    date_from: string;
    date_to: string;
    summary: CalendarSummary;
    shifts: CalendarJob[];
  };
};

export interface JobCreatePayload {
  job_title: string;
  department?: string;
  job_type: JobType;
  job_urgency: JobUrgency;
  description?: string;
  responsibilities?: string[];
  required_skills?: string[];
  street?: string;
  postal_code?: string;
  province?: string;
  city?: string;
  experience?: string[];
  working_conditions?: string[];
  why_join?: string[];
  no_of_hires_required?: number;
  start_date?: string;
  end_date?: string;
  check_in_time?: string;
  check_out_time?: string;
  neighborhood_name?: string;
  neighborhood_type?: string;
  direct_number?: string;
  years_of_experience?: string;
  qualifications?: string[];
  specializations?: string[];
  ai_interview?: boolean;
  questions?: string[] | null;
  pay_per_hour_cents?: number;
  status?: JobStatus;
  interview_questions?: string[];
}

export type JobUpdatePayload = Partial<JobCreatePayload>;

export interface JobCreateResponse {
  success: boolean;
  message: string;
  data: JobBackendResponse;
}

export interface JobUpdateResponse {
  success: boolean;
  message: string;
  data: JobBackendResponse;
}

export interface JobDeleteResponse {
  success: boolean;
  message: string;
}

export interface JobFeePreviewPayload {
  job_title: string;
  no_of_hires_required: number;
  start_date: string;
  end_date: string;
  check_in_time: string;
  check_out_time: string;
}

export interface JobFeePreviewResponse {
  success: boolean;
  message: string;
  data: {
    job_title: string;
    job_title_label: string;
    no_of_hires: number;
    recruiter_pay_per_hour_cents: number;
    is_night_shift: boolean;
    shift_summaries: string[];
    total_working_hours_label: string;
    total_working_hours: number;
    per_candidate_shift_recruiter_pay_cents: number;
    total_recruiter_pay_cents: number;
  };
}

export interface GenerateDescriptionPayload {
  job_title: string;
  department: string;
}

export interface GenerateDescriptionResponse {
  success: boolean;
  message: string;
  data: {
    description: string;
    responsibilities: string[];
    required_skills: string[];
    experience: string[];
    working_conditions: string[];
    why_join: string[];
  };
}

/** Hook / form input — `jobTitle` is slugified before calling the AI description endpoint. */
export interface JobDescriptionInput {
  jobTitle: string;
  department: string;
  jobType: string;
}

export type GeneratedDescriptionData = GenerateDescriptionResponse["data"];

export interface GenerateQuestionsPayload {
  title: string;
  department: string;
  specialization?: string;
  count?: number;
}

export interface GenerateQuestionsResponse {
  success: boolean;
  message: string;
  data: { questions: string[] };
}

export type Province =
  | ""
  | "alberta"
  | "britishColumbia"
  | "manitoba"
  | "newBrunswick"
  | "newfoundlandAndLabrador"
  | "northwestTerritories"
  | "novaScotia"
  | "nunavut"
  | "ontario"
  | "princeEdwardIsland"
  | "quebec"
  | "saskatchewan"
  | "yukon";

export interface JobFormData {
  jobTitle: string;
  department: string;
  jobType: string;
  urgency: JobUrgency;
  description: string;
  responsibilities: string[];
  required_skills: string[];
  streetAddress?: string;
  postalCode?: string;
  province?: Province;
  city?: string;
  country?: string;
  qualification?: string[];
  specialization: string[];
  experience: string;
  experienceList?: string[];
  aiInterview?: boolean;
  questions?: string[];
  numberOfHires?: string;
  fromDate?: Date;
  tillDate?: Date;
  fromTime?: string;
  toTime?: string;
  status: JobStatus;
  neighborhoodName?: string;
  neighborhoodType?: string;
  directNumber?: string;
  workingConditions?: string[];
  whyJoin?: string[];
  location?: string;
  payRange?: number | string;
  inPersonInterview?: string | boolean;
  physicalInterview?: string | boolean;
}

export interface InstantJobFormData extends JobFormData {
  amountPerHire?: string;
  numberOfHires?: string;
  neighborhoodName?: string;
  neighborhoodType?: string;
  directNumber?: string;
}

export type ApplicationStatus =
  | "APPLIED"
  | "SHORTLISTED"
  | "INTERVIEWING"
  | "INTERVIEWED"
  | "REJECTED"
  | "HIRE"
  | "ACCEPTED"
  | "CANCELLED";

export interface JobApplicationItem {
  id: string;
  job_id: string;
  candidate_id: string;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
  job: {
    id: string;
    job_title: string;
    department: string;
    job_type: string;
    status: string;
  };
  candidate: {
    id: string;
    first_name: string;
    last_name?: string | null;
    full_name: string;
    profile_image_url?: string | null;
    city?: string | null;
    state?: string | null;
    department?: string;
    departments?: string[];
    job_title?: string;
    experience?: string;
    experience_months?: number;
    work_eligibility?: string | null;
    best_ai_interview_score?: number | null;
    job_interview_score?: number | null;
  };
}

export interface JobApplicationsParams {
  page?: number;
  limit?: number;
  job_id?: string;
  status?: ApplicationStatus | string;
}

export interface JobApplicationsResponse {
  success: boolean;
  message: string;
  data: {
    applications: JobApplicationItem[];
    pagination: PaginationData;
  };
}

export type Job = JobListItem;
export type TopJob = JobListItem;

export type ActionType = "shortlist" | "hire" | "schedule" | "invite";

export interface JobApplicationListResponse {
  applications: Array<{
    id: string;
    job_id: string;
    candidate_id: string;
    status:
      | "APPLIED"
      | "SHORTLISTED"
      | "INTERVIEWING"
      | "INTERVIEWED"
      | "HIRE"
      | "REJECTED"
      | "ACCEPTED"
      | "CANCELLED";
    created_at: string;
    updated_at: string;
    job: {
      id: string;
      job_title: string;
      department: string | null;
      job_type: string | null;
      status: string;
    } | null;
    candidate: {
      id: string;
      first_name: string;
      last_name: string;
      full_name: string | null;
      email: string | null;
      phone_number: string | null;
      profile_image_url: string | null;
      expected_salary: string | null;
      skill: string | null;
      city: string | null;
      state: string | null;
      completion_percentage: number | null;
    } | null;
  }>;
  pagination: {
    total: number;
    count: number;
    page: number;
    limit: number;
  };
}

export interface GetJobsParams {
  /** When set, response excludes jobs this candidate already applied to or was invited to (job_invite). */
  candidate_id?: string;
  job_types?: string;
  job_urgency?: "instant" | "normal";
  status?: "DRAFT" | "OPEN" | "PAUSED" | "CLOSED" | "UPCOMING" | "ACTIVE" | "COMPLETED";
  page?: number;
  limit?: number;
  offset?: number;
}

// ============================================================================
// TYPES — interviews (requests, sessions, listings)
// ============================================================================

export type InterviewRequestStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "SCHEDULED"
  | "CANCELLED"
  | "EXPIRED";

export interface InterviewRequest {
  id: string;
  candidate_id: string;
  recruiter_id: string;
  job_application_id: string | null;
  message: string | null;
  valid_until: string;
  status: InterviewRequestStatus;
  created_at: string;
  updated_at: string;
}

export interface InterviewPagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  page: number;
  total: number;
}

export type InterviewSessionStatus = "PENDING" | "IN_PROGRESS" | "ENDED" | "FAILED";
export type InterviewKind = "JOB" | "PRACTICE" | "MOCK";
export type TranscriptRole = "assistant" | "user" | "system";

export interface InterviewContext {
  interview_type: InterviewKind;
  position: string;
  level: string;
  skills: string[];
  duration_min: number;
  language: string;
  question_strategy?: string;
  created_at: string;
}

export interface InterviewTranscript {
  role: TranscriptRole;
  text: string;
  sequence: number;
  created_at: string;
}

export interface InterviewEvaluation {
  id: string;
  interview_id: string;
  communication: number;
  confidence: number;
  behavioral: number;
  accuracy: number;
  strengths: string[];
  areas_to_improve: string[];
  evaluator_type: string;
  model_name: string | null;
  created_at: string;
}

export interface InterviewDetailsResponse {
  interview: {
    id: string;
    booking_id: string;
    started_at: string | null;
    ended_at: string | null;
    status: InterviewSessionStatus;
  };
  transcripts: InterviewTranscript[];
  evaluation: InterviewEvaluation | null;
}

export interface InterviewListItem {
  id: string;
  booking_id: string;
  status: InterviewSessionStatus;
  started_at: string | null;
  ended_at: string | null;
  duration_sec: number | null;
  interview_context: InterviewContext | null;
}

/** Aliases for UI/helper modules — same values as interview session types above. */
export type InterviewStatus = InterviewSessionStatus;
export type InterviewType = InterviewKind;
