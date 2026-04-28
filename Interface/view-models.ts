// Interface/view-models.ts
// UI-owned shapes. Backend never sees these.
// Change freely when designs change.


// ══════════════════════════════════════════════════════════════════════════════
// SHARED
// ══════════════════════════════════════════════════════════════════════════════

export interface PaginationVM {
  total:      number;
  page:       number;
  limit:      number;
  totalPages: number;
  hasNext:    boolean;
  hasPrev:    boolean;
}


// ══════════════════════════════════════════════════════════════════════════════
// CANDIDATE — CARD (grid/kanban view everywhere)
// Source: fromJobApplication()
// ══════════════════════════════════════════════════════════════════════════════

export interface CandidateCardVM {
  id:                  string;
  application_id:      string;
  full_name:           string;
  initials:            string;
  profile_image_url:   string | null;
  designation:         string;          // "Registered Nurse"
  department:          string;          // "Nursing"
  experience:          string;          // "3+ yrs"
  distance:            string;          // "12km" or "N/A"
  interview_score:     number | null;   // 0–100
  rating:              number | null;   // 0–5
  work_eligibility:    string | null;
  is_online:           boolean;         // always false until WebSocket added
  application_status:  string;
  href:                string;
}


// ══════════════════════════════════════════════════════════════════════════════
// CANDIDATE — TABLE ROW (list view)
// Source: fromJobApplication()
// ══════════════════════════════════════════════════════════════════════════════

export interface CandidateTableRowVM {
  id:               string;
  application_id:   string;
  full_name:        string;
  department:       string;
  designation:      string;
  experience:       string;
  distance:         string;
  general_score:    number | null;
  rating:           number | null;
  application_status: string;
  href:             string;
}


// ══════════════════════════════════════════════════════════════════════════════
// CANDIDATE — DETAIL PAGE (/candidates/[id])
// Source: fromDetailProfile()
// ══════════════════════════════════════════════════════════════════════════════

export interface ScoreRoundVM {
  label:      string;
  score:      number | null;
  max_score:  100;
  strengths:  string | null;
  graph_data: number[];
}

export interface QualificationVM {
  id:          string;
  degree:      string;
  field:       string;
  institution: string | null;
  start_year:  string | null;
  end_year:    string | null;
}

export interface DocumentVM {
  document_id:   string;
  title:         string;
  document_type: string;
  category:      'personal' | 'license_certificate';
  file_url:      string | null;
  signed_url:    string | null;   // fetch on-demand
}

export interface WorkExperienceVM {
  id:           string;
  organization: string;
  role:         string;
  job_type:     string | null;
  start_date:   string;
  end_date:     string | null;
  is_current:   boolean;
  description:  string | null;
  org_photo:    null;             // ❌ not in API
}

export interface WorkHistoryEntryVM {
  application_id: string;
  job_title:      string;
  organization:   string;
  job_type:       string;
  completed_date: string | null;
  status:         string;
}

export interface ReviewVM {
  id:              string;
  rating:          number;
  comment:         string | null;
  job_title:       string;
  organization:    string | null;
  recruiter_title: string | null;
  created_at:      string;
}

export interface StarDistributionVM {
  stars:      5 | 4 | 3 | 2 | 1;
  count:      number;
  percentage: number;
}

export interface RatingsBlockVM {
  average_score:      number;
  total_reviews:      number;
  star_distribution:  StarDistributionVM[];
  reviews:            ReviewVM[];
}

export interface CandidateDetailVM {
  // Header
  id:                  string;
  display_id:          string;          // "KRV-A1B2C3"
  full_name:           string;
  profile_image_url:   string | null;
  job_title:           string;
  city:                string | null;
  province:            string | null;
  work_eligibility:    string | null;
  specializations:     string[];        // ❌ not in API — always []
  job_type:            string | null;   // ❌ not in detail API

  // KPI cards
  kpis: {
    attendance_accuracy:   null;        // ❌ not in API
    total_work_experience: string;      // "4 yrs 2 mos"
    current_role:          string | null;
    current_organization:  string | null;
    preferred_location:    null;        // ❌ not in API
  };

  // General score
  general_score: {
    overall_score:          number | null;
    avg_rating_score:       number | null;
    conversational_round:   null;       // ❌ not in API
    behavioral_round:       null;       // ❌ not in API
    communication_analysis: null;       // ❌ not in API
    accuracy_of_answers:    null;       // ❌ not in API
  };

  qualifications:   QualificationVM[];
  documents: {
    personal:              DocumentVM[];
    licenses_certificates: DocumentVM[];
  };
  work_experiences: WorkExperienceVM[];
  work_history:     WorkHistoryEntryVM[];
  ratings:          RatingsBlockVM;
}


// ══════════════════════════════════════════════════════════════════════════════
// CANDIDATES PAGE — KPIs
// Source: useCandidatesPageKpis()
// ══════════════════════════════════════════════════════════════════════════════

export interface CandidatesPageKpisVM {
  hired_candidates:   number;
  inhouse_candidates: number;
  active_candidates:  number;
  candidates_pool:    number;
}


// ══════════════════════════════════════════════════════════════════════════════
// IN-HOUSE CANDIDATES
// ══════════════════════════════════════════════════════════════════════════════

export interface InHouseInvitedRowVM {
  candidate_id: string;
  full_name:    string;
  email:        string | null;
  remark:       string;
  invited_at:   string;
}

export interface InHouseAcceptedRowVM {
  candidate_id:      string;
  mapping_id:        string;
  full_name:         string;
  profile_image_url: string | null;
  departments:       string[];
  job_titles:        string[];
  experience_range:  string;
}


// ══════════════════════════════════════════════════════════════════════════════
// JOB — CARD (grid view in /jobs and action modals)
// Source: fromJobListItem()
// ══════════════════════════════════════════════════════════════════════════════

export interface JobCardVM {
  id:                  string;
  display_id:          string;          // "KRV-A1B2C3"
  job_title:           string;
  department:          string;
  job_type:            string;
  job_urgency:         'normal' | 'instant';
  status:              string;
  status_label:        string;
  urgency_label:       string;          // "Regular" | "Urgent"
  experience_required: string;
  province:            string;
  budget:              string;          // "$24.50/hr"
  interview_required:  boolean | null;
  application_count:   number;
  org_photo:           string | null;
  start_date:          string | null;
  href:                string;
  // Specializations — requires mapping IDs via /common/specializations
  specialization_labels: string[];      // ["Long-Term Care", "Home Care"]
}


// ══════════════════════════════════════════════════════════════════════════════
// JOB — TABLE ROW (list view in /jobs)
// Source: fromJobListItemToRow()
// ══════════════════════════════════════════════════════════════════════════════

export interface JobTableRowVM {
  id:           string;
  job_title:    string;
  requirements: number;
  start_date:   string | null;
  end_date:     string | null;
  timings:      string | null;
  job_type:     string;
  budget:       string;
  ai_interview: boolean | null;
  status:       string;
  status_label: string;
  href:         string;
}


// ══════════════════════════════════════════════════════════════════════════════
// JOBS PAGE — KPIs
// Source: useJobsPageKpis()
// ══════════════════════════════════════════════════════════════════════════════

export interface JobsPageKpisVM {
  regular_job_openings:  number;
  urgent_shift_openings: number;
  no_show_alerts:        number;
  active_jobs_shifts:    number;
}


// ══════════════════════════════════════════════════════════════════════════════
// JOB DETAIL PAGE — HEADER
// Source: fromJobBackendResponse()
// ══════════════════════════════════════════════════════════════════════════════

export interface JobDetailHeaderVM {
  id:                    string;
  job_title:             string;
  department:            string;
  province:              string;
  recruiter_email:       string | null;
  recruiter_phone:       string | null;
  job_type:              string;
  pay_per_hour:          string;
  specialization_labels: string[];     // mapped from NormalJobDetails.specializations (IDs)
  qualifications:        string[];
  total_requirements:    number;
  total_hired:           number;
  experience_required:   string;
  start_date:            string | null;
  timings:               string | null;
  is_requirements_filled: boolean;
  status:                string;
}