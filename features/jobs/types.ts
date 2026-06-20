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

export type JobType = "casual" | "part_time" | "full_time" | "PART_TIME" | "FULL_TIME" | "CASUAL" | string;
export type JobUrgency = "INSTANT" | "NORMAL";

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
  specializations: (number | string)[];
  ai_interview: boolean;
  questions: Record<string, { title: string; questions: string[] }> | null;
  created_at: string;
  updated_at: string;
  shift_mode?: PreviewShiftMode | null;
  rotation_cycle_days?: number | null;
  cycle_start_day?: CycleStartDay | null;
  rotational_teams?: JobRotationalTeam[];
  team_candidate_rotations?: unknown[];
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

export interface JobFundingDetails {
  id: string;
  job_id: string;
  recruiter_user_id: string;
  wallet_id: string;
  funding_type?: string | null;
  total_amount_cents: number | string | null;
  held_amount_cents: number | string | null;
  released_amount_cents: number | string | null;
  refunded_amount_cents: number | string | null;
  total_contract_amount_cents?: number | string | null;
  total_paid_amount_cents?: number | string | null;
  total_held_amount_cents?: number | string | null;
  total_spent_amount_cents?: number | string | null;
  total_refunded_amount_cents?: number | string | null;
  total_remaining_amount_cents?: number | string | null;
  status: string | null;
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
  funding: JobFundingDetails | null;
  description: string | null;
  responsibilities: string[];
  required_skills: string[];
  experience: string[];
  working_conditions: string[];
  why_join: string[];
  employment_tenure?: string | null;
  shift_templates?: JobListShiftTemplate[];
  shift_mode?: PreviewShiftMode | null;
  rotation_cycle_days?: number | null;
  cycle_start_day?: CycleStartDay | null;
  rotational_teams?: JobRotationalTeam[];
  team_candidate_rotations?: unknown[];
  /** Total scheduled shifts (from API / fee preview). */
  shift_count?: number | null;
}

export interface JobDetailResponse {
  success: boolean;
  message: string;
  data: { job: JobBackendResponse };
}

export interface JobListShiftTemplate {
  id?: string;
  shift_name: string;
  shift_type: string;
  start_time: string;
  end_time: string;
  duration_hours?: number;
  break_minutes?: number;
}

/** One scheduled shift slot for a team on a rotation cycle day (job detail API). */
export interface JobRotationalTeamCycle {
  id: string;
  cycle_day: number;
  shift_template_index: number;
  shift_template_id?: string;
  required_workers: number;
  is_working: boolean;
  shift_name: string;
  shift_type: string;
  start_time: string;
  end_time: string;
  duration_hours?: number;
  break_minutes?: number;
}

/** Rotational staffing team with expanded cycle rows (job detail API). */
export interface JobRotationalTeam {
  id: string;
  team_name: string;
  display_order: number;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  cycles: JobRotationalTeamCycle[];
}

export interface JobListItem {
  id: string;
  job_title: string;
  department: string | null;
  job_type: JobType | null;
  job_urgency: JobUrgency;
  status: JobStatus;
  closed_reason: "FILLED" | "EXPIRED" | "MANUAL" | null;
  application_count: number;
  workforce_count?: number;
  filled_positions?: number;
  required_positions?: number;
  remaining_hires?: number;
  start_date?: string | null;
  end_date?: string | null;
  city?: string | null;
  province?: string | null;
  shift_count?: number;
  shift_types?: string[];
  has_ai_interview?: boolean;
  total_recruiter_pay_cents?: number;
  /** @deprecated use filled_positions */
  no_of_hires_hired?: number;
  /** @deprecated use required_positions */
  no_of_hires_required?: number;
  /** @deprecated use has_ai_interview */
  ai_interview?: boolean | null;
  /** @deprecated use total_recruiter_pay_cents for list totals */
  pay_per_hour_cents?: string;
  recruiter_close_note?: string | null;
  years_of_experience?: string | null;
  created_at?: string;
  updated_at?: string;
  street?: string | null;
  postal_code?: string | null;
  check_in_time?: string | null;
  check_out_time?: string | null;
  shift_templates?: JobListShiftTemplate[];
  specializations?: number[] | null;
  qualifications?: string[] | null;
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
  active_job_count: number;
  active_normal_job_count: number;
  active_instant_job_count: number;
  active_shift_count: number;
}

export interface JobsSummaryResponse {
  success: boolean;
  message: string;
  data: JobsSummaryData;
}

export interface CalendarJob {
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

  // NEW FIELDS mirroring form state where needed
  employment_type?: EmploymentType;
  job_period_option?: JobPeriodOption;
  staffing_type?: StaffingType;
  shift_duration_type?: ShiftDurationType;
  selected_shift_types?: ShiftType[];

  break_duration_minutes?: number;
  morning_shift_start?: string;
  morning_shift_end?: string;
  evening_shift_start?: string;
  evening_shift_end?: string;
  night_shift_start?: string;
  night_shift_end?: string;
  job_duration_per_day?: "24" | "12" | "8";
  cycle_start_day?: CycleStartDay;
  number_of_teams?: number;
  shift_schedule_details?: Partial<Record<ShiftType, ShiftScheduleDetail>>;
  schedule_template?: string[];
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

/** Legacy instant / simple shift preview request. */
export interface LegacyJobFeePreviewPayload {
  job_title: string;
  no_of_hires_required: number;
  start_date: string;
  end_date: string;
  check_in_time: string;
  check_out_time: string;
}

/** Instant job preview request (POST /recruiter/jobs/preview). */
export interface InstantJobFeePreviewPayload {
  job_title: string;
  no_of_hires_required: number;
  start_date: string;
  end_date: string;
  shift_templates: JobPreviewShiftTemplate[];
}

export type PreviewShiftMode = "STANDARD" | "ROTATIONAL";

export type PreviewShiftTemplateType = "MORNING" | "DAY" | "EVENING" | "NIGHT";

export interface JobPreviewShiftTemplate {
  shift_name: string;
  shift_type: PreviewShiftTemplateType;
  start_time: string;
  end_time: string;
  duration_hours: number;
  break_minutes: number;
}

export interface JobPreviewTeamCycleEntry {
  cycle_day: number;
  shift_template_index: number;
  required_workers: number;
}

export interface JobPreviewTeam {
  team_name: string;
  cycle: JobPreviewTeamCycleEntry[];
}

/** Shared scheduling block for normal job preview and create requests. */
export interface NormalJobSchedulingPayload {
  job_title: string;
  job_urgency: JobUrgency;
  job_type: JobType;
  shift_mode: PreviewShiftMode;
  rotation_cycle_days: number;
  cycle_start_day: CycleStartDay;
  start_date: string;
  end_date: string;
  shift_templates: JobPreviewShiftTemplate[];
  teams: JobPreviewTeam[];
}

/** Normal job preview/fee request (POST /recruiter/jobs/preview). */
export type NormalJobFeePreviewPayload = NormalJobSchedulingPayload;

export type EmploymentTenure = "TEMPORARY" | "PERMANENT";

/** Normal job create request (POST /recruiter/jobs). */
export interface NormalJobCreatePayload extends NormalJobSchedulingPayload {
  department?: string;
  employment_tenure: EmploymentTenure;
  street?: string;
  postal_code?: string;
  province?: string;
  city?: string;
  years_of_experience?: string;
  qualifications?: string[];
  specializations?: string[];
  ai_interview: boolean;
  description?: string;
  responsibilities?: string[];
  required_skills?: string[];
  experience?: string[];
  working_conditions?: string[];
  why_join?: string[];
  no_of_hires_required: number;
  questions?: string[] | null;
  pay_per_hour_cents?: number;
  status?: JobStatus;
}

export type JobFeePreviewPayload =
  | LegacyJobFeePreviewPayload
  | InstantJobFeePreviewPayload
  | NormalJobFeePreviewPayload;

/** Instant job create request (POST /recruiter/jobs). */
export type InstantJobCreatePayload = Omit<
  JobCreatePayload,
  "check_in_time" | "check_out_time"
> & {
  shift_templates: JobPreviewShiftTemplate[];
};

export type RecruiterJobCreateBody =
  | JobCreatePayload
  | InstantJobCreatePayload
  | NormalJobCreatePayload;

export interface JobPreviewBillingPeriod {
  billingStartDate: string;
  billingEndDate: string;
  nextPaymentDueDate: string;
}

export interface JobPreviewWindow {
  start_date: string;
  end_date: string;
  max_preview_days?: number;
  was_capped?: boolean;
  /** @deprecated Prefer was_capped from API */
  capped_to_one_month?: boolean;
}

export interface JobPreviewShift {
  shift_date: string;
  /** Normal / rotational template day (1–14). */
  cycle_day?: number;
  /** Instant preview: sequential shift in the preview window. */
  shift_index?: number;
  shift_type: PreviewShiftTemplateType;
  shift_name: string;
  is_night_shift: boolean;
  planned_check_in: string;
  planned_check_out: string;
  /** Net workable minutes (after break) for this shift. */
  planned_minutes?: number;
  required_workers: number;
  team_name?: string;
  summary?: string;
}

export interface JobPreviewPaymentSlice {
  period: JobPreviewBillingPeriod;
  total_working_hours: number;
  total_recruiter_pay_cents: number;
  per_shift_recruiter_pay_cents: number;
  shift_count: number;
  rotation_cycle_days?: number;
}

/** Shared fields returned by POST /recruiter/jobs/preview (legacy + normal + instant). */
export interface JobFeePreviewDataBase {
  job_title: string;
  job_title_label?: string;
  no_of_hires: number;
  recruiter_pay_per_hour_cents: number;
  is_night_shift: boolean;
  shift_summaries?: string[];
  total_working_hours_label: string;
  total_working_hours: number;
  per_candidate_shift_recruiter_pay_cents: number;
  total_recruiter_pay_cents: number;
}

/** Instant job preview from POST /recruiter/jobs/preview. */
export interface InstantJobFeePreviewData extends JobFeePreviewDataBase {
  job_urgency?: JobUrgency | string;
  funding_type?: string;
  shift_templates?: JobPreviewShiftTemplate[];
  preview_window?: JobPreviewWindow;
  preview_shifts?: JobPreviewShift[];
  shift_count?: number;
}

/** Normal / rotational preview from POST /recruiter/jobs/preview. */
export interface NormalJobFeePreviewData extends JobFeePreviewDataBase {
  job_urgency?: string;
  shift_mode?: PreviewShiftMode;
  funding_type?: string;
  billing_period?: JobPreviewBillingPeriod;
  preview_window?: JobPreviewWindow;
  preview_shifts?: JobPreviewShift[];
  shift_count?: number;
  one_cycle_payment?: JobPreviewPaymentSlice;
  first_month_payment?: JobPreviewPaymentSlice;
  second_month_payment?: JobPreviewPaymentSlice;
}

export type JobFeePreviewData =
  | InstantJobFeePreviewData
  | NormalJobFeePreviewData;

export interface JobFeePreviewResponse {
  success: boolean;
  message: string;
  data: JobFeePreviewData;
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

/** Hook / form input — `jobTitle` should be the metadata store option value. */
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
  job_title: string;
  department: string;
  job_type: string;
  job_urgency: JobUrgency;
  description: string;
  responsibilities: string[];
  required_skills: string[];
  street?: string;
  postal_code?: string;
  province?: Province;
  city?: string;
  country?: string;
  qualifications?: string[];
  specializations: string[];
  years_of_experience?: string;
  experience?: string[];
  ai_interview?: boolean;
  questions?: string[];
  no_of_hires_required?: string;
  start_date?: Date;
  end_date?: Date;
  check_in_time?: string;
  check_out_time?: string;
  status: JobStatus;
  neighborhood_name?: string;
  neighborhood_type?: string;
  direct_number?: string;
  working_conditions?: string[];
  why_join?: string[];
  location?: string;
  payRange?: number | string;
  physicalInterview?: string | boolean;

  // NEW FIELDS for Figma flow
  employment_type?: EmploymentType;
  job_period_option?: JobPeriodOption;
  staffing_type?: StaffingType;
  shift_duration_type?: ShiftDurationType;
  selected_shift_types?: ShiftType[]; // radios → array length 1, checkboxes → 1+


 morning_shift_start?: string; // "HH:MM"
morning_shift_end?: string;
evening_shift_start?: string;
evening_shift_end?: string;
night_shift_start?: string;
night_shift_end?: string;

job_duration_per_day?: "24" | "12" | "8";

break_duration_minutes?: number;
  cycle_start_day?: CycleStartDay;
  number_of_teams?: string;
  shift_schedule_details?: Partial<Record<ShiftType, ShiftScheduleDetail>>;
  schedule_template?: string[];
  /** Platform hourly pay (dollars), from JOBS_FEES for the selected job title. */
  backend_pay_rate?: number;
}

export interface InstantJobFormData extends JobFormData {
  amountPerHire?: string;
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
      last_name: string | null;
      full_name: string | null;
      email: string | null;
      phone_number: string | null;
      profile_image_url: string | null;
      expected_salary: string | null;
      skill: string | null;
      city: string | null;
      state: string | null;
      departments?: string[];
      department?: string | null;
      job_title?: string | null;
      experience?: string | null;
      experience_months?: number | null;
      work_eligibility?: string | null;
      best_ai_interview_score?: number | null;
      job_interview_score?: number | null;
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

export type JobDetailRecord = Record<string, unknown>;

export interface JobShiftCandidate extends JobDetailRecord {
  id?: string;
  user_id?: string;
  candidate_user_id?: string;
  candidate_id?: string;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  profile_image?: string | null;
  profile_image_url?: string | null;
}

export interface JobShiftAttendance extends JobDetailRecord {
  actual_check_in?: string | null;
  actual_check_out?: string | null;
  check_out_source?: string | null;
  late_minutes?: number | string | null;
  early_leave_minutes?: number | string | null;
  worked_minutes?: number | string | null;
}

export interface JobShiftPayment extends JobDetailRecord {
  id?: string;
  assignment_id?: string;
  job_funding_id?: string;
  planned_amount_cents?: number | string | null;
  actual_amount_cents?: number | string | null;
  candidate_earning_cents?: number | string | null;
  platform_fee_cents?: number | string | null;
  recruiter_refund_cents?: number | string | null;
  status?: string | null;
  release_at?: string | null;
  released_at?: string | null;
}

export interface JobShiftAssignment extends JobDetailRecord {
  id?: string;
  assignment_id?: string;
  job_id?: string;
  job_shift_id?: string;
  candidate_id?: string;
  status?: string | null;
  hourly_rate_cents?: number | string | null;
  platform_fee_cents?: number | string | null;
  candidate?: JobShiftCandidate | null;
  shift?: JobShiftItem | null;
  latest_attendance?: JobShiftAttendance | null;
  shift_attendance?: JobShiftAttendance | null;
  shift_payment?: JobShiftPayment | null;
}

export interface JobShiftItem extends JobDetailRecord {
  id?: string;
  shift_id?: string;
  assignment_id?: string;
  candidate_id?: string;
  candidate_name?: string;
  shift_date?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  status?: string | null;
  shift_status?: string | null;
  planned_check_in?: string | null;
  planned_check_out?: string | null;
  planned_minutes?: number | string | null;
  check_in?: string | null;
  check_out?: string | null;
  total_hours?: number | string | null;
  total_amount_cents?: number | string | null;
  assignments?: JobShiftAssignment[];
}

export interface JobShiftsResponse extends JobDetailRecord {
  shifts: JobShiftItem[];
  pagination?: {
    total?: number;
    count?: number;
    page?: number;
    limit?: number;
  };
}

export interface JobShiftsParams {
  status?: string;
  start_date?: string;
  end_date?: string;
}

export interface JobShiftPaymentItem extends JobDetailRecord {
  id?: string;
  payment_id?: string;
  candidate_id?: string;
  candidate_name?: string;
  status?: string | null;
  amount_cents?: number | string | null;
  total_amount_cents?: number | string | null;
  created_at?: string | null;
  paid_at?: string | null;
}

export interface JobShiftPaymentsResponse extends JobDetailRecord {
  payments: JobShiftPaymentItem[];
  pagination?: {
    total?: number;
    count?: number;
    page?: number;
    limit?: number;
  };
}

export type JobShiftDetailsResponse = JobDetailRecord;

export interface JobWalletTransactionItem extends JobDetailRecord {
  id?: string;
  transaction_id?: string;
  wallet_id?: string;
  type?: string | null;
  direction?: string | null;
  category?: string | null;
  amount?: number | string | null;
  amount_cents?: number | string | null;
  total_amount_cents?: number | string | null;
  currency?: string | null;
  status?: string | null;
  description?: string | null;
  balance_after?: number | string | null;
  reference_group_id?: string | null;
  related_transaction_id?: string | null;
  job_payment_id?: string | null;
  idempotency_key?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  metadata?: JobDetailRecord | null;
}

export interface JobWalletTransactionsResponse extends JobDetailRecord {
  job_id?: string;
  wallet_id?: string;
  wallet_transactions?: JobWalletTransactionItem[];
  transactions: JobWalletTransactionItem[];
  pagination?: {
    total?: number;
    count?: number;
    page?: number;
    limit?: number;
    offset?: number;
    totalPages?: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
  };
  total?: number;
  page?: number;
  limit?: number;
  offset?: number;
}

export interface JobDisputeItem extends JobDetailRecord {
  id?: string;
  dispute_id?: string;
  assignment_id?: string;
  raised_by_user_id?: string | null;
  status?: string | null;
  reason?: string | null;
  description?: string | null;
  resolution_action?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  assignment?: JobShiftAssignment | null;
}

export interface CreateRecruiterShiftDisputePayload {
  assignment_id: string;
  reason?: string;
  description?: string;
}

export interface CreatedRecruiterShiftDispute extends JobDetailRecord {
  id: string;
  assignment_id: string;
  raised_by_user_id?: string | null;
  reason?: string | null;
  description?: string | null;
  status: string;
  resolution_action?: string | null;
  created_at?: string | null;
}

export interface CreateRecruiterShiftDisputeResponse extends JobDetailRecord {
  success: boolean;
  message: string;
  data: CreatedRecruiterShiftDispute;
}

export interface JobDisputesResponse extends JobDetailRecord {
  job_id?: string;
  disputes: JobDisputeItem[];
  pagination?: {
    total?: number;
    count?: number;
    page?: number;
    limit?: number;
    offset?: number;
    totalPages?: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
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
// New enums

export type EmploymentType = "temporary" | "permanent";

export type TemporaryJobPeriod =
  | "3_months"
  | "6_months"
  | "9_months"
  | "custom_end_date";

export type PermanentJobPeriod =
  | "1_year"
  | "2_years"
  | "3_years"
  | "custom_end_date";

export type JobPeriodOption = TemporaryJobPeriod | PermanentJobPeriod;

export type StaffingType = "standard" | "rotational";

export type ShiftDurationType = "8_hrs" | "12_hrs";

export type ShiftType = "morning" | "day" | "evening" | "night";

export type CycleStartDay = "SATURDAY" | "SUNDAY" | "MONDAY";

export interface ShiftScheduleDetail {
  break_duration_minutes?: number;
  no_of_candidates?: number;
}