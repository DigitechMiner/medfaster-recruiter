// View-models: UI-only shapes (not API contracts).
// UI-owned shapes. Backend never sees these.
// Change freely when designs change.

import type { AiInterviewResultPayload } from "@/features/candidates/types";

// ══════════════════════════════════════════════════════════════════════════════
// CANDIDATE — CARD (grid/kanban view everywhere)
// ══════════════════════════════════════════════════════════════════════════════

export interface CandidateCardVM {
  id: string;
  application_id: string;
  full_name: string;
  initials: string;
  profile_image_url: string | null;
  /** One job: full label. Several jobs: abbreviations, e.g. `RN | LPN | PSW` */
  designation: string;
  /** Full title-case labels per slug (search / tooltips) */
  job_title_labels: string[];
  experience: string; // "3+ yrs"
  distance: string; // "12km" or "N/A"
  interview_score: number | null; // 0–100
  rating: number | null; // 0–5
  work_eligibility: string | null;
  is_online: boolean; // always false until WebSocket added
  /** Set from GET /recruiter/candidates when API sends it */
  is_active?: boolean;
  application_status: string;
  href: string;
  /** invited | active — shows status pill instead of Add in house on pool cards */
  in_house_status?: string | null;
}

// ══════════════════════════════════════════════════════════════════════════════
// CANDIDATE — DETAIL PAGE (/candidates/[id])
// Source: fromDetailProfile()
// ══════════════════════════════════════════════════════════════════════════════

interface QualificationVM {
  id: string;
  degree: string;
  field: string;
  institution: string | null;
  start_year: string | null;
  end_year: string | null;
}

interface DocumentVM {
  document_id: string;
  title: string;
  document_type: string;
  verified: boolean;
  category: "personal" | "license_certificate";
  file_url: string | null;
  signed_url: string | null; // fetch on-demand
}

interface WorkExperienceVM {
  id: string;
  organization: string;
  role: string;
  job_type: string | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
  org_photo: null; // ❌ not in API
}

interface WorkHistoryEntryVM {
  application_id: string;
  job_title: string;
  organization: string;
  job_type: string;
  completed_date: string | null;
  status: string;
}

interface ReviewVM {
  id: string;
  rating: number;
  comment: string | null;
  job_title: string;
  organization: string | null;
  recruiter_title: string | null;
  created_at: string;
}

interface StarDistributionVM {
  stars: 5 | 4 | 3 | 2 | 1;
  count: number;
  percentage: number;
}

interface RatingsBlockVM {
  average_score: number;
  total_reviews: number;
  star_distribution: StarDistributionVM[];
  reviews: ReviewVM[];
}
export type ScoreRound = {
  score: number | null;
  strengths: string | null;
  // conversational_intelligence
  engagement?: number;
  adaptability?: number;
  responsiveness?: number;
  clarity_of_thought?: number;
  // behavioral_professionalism
  empathy?: number;
  ethical_reasoning?: number;
  stress_management?: number;
  team_collaboration?: number;
  // communication_clarity
  confidence?: number;
  articulation?: number;
  active_listening?: number;
  structure_of_answers?: number;
  // clinical_competency
  medical_accuracy?: number;
  clinical_reasoning?: number;
  evidence_based_decision?: number;
  patient_safety_awareness?: number;
} | null;
export type InterviewSummaryBlock = {
  strengths: string[];
  risk_flags: {
    communication_red_flag: boolean;
    unsafe_decision_detected: boolean;
    critical_safety_violation: boolean;
  };
  interview_summary: string | null;
  recommendation: string | null;
  areas_to_improve: string[];
} | null;
export interface CandidateDetailVM {
  // Header
  id: string;
  display_id: string; // "KRV-A1B2C3"
  full_name: string;
  profile_image_url: string | null;
  job_title: string;
  city: string | null;
  province: string | null;
  work_eligibility: string | null;
  specializations: string[]; // ❌ not in API — always []
  job_type: string | null; // ❌ not in detail API

  // KPI cards
  kpis: {
    attendance_accuracy: null; // ❌ not in API
    total_work_experience_months: number | null;
    total_work_experience: string; // "4 yrs 2 mos"
    current_role: string | null;
    current_organization: string | null;
    preferred_location: null; // ❌ not in API
  };

  // General score
  general_score: {
    overall_score: number | null;
    /** Max AI / self-interview score from API (flat general_score). */
    max_self_interview_score: number | null;
    /** Parsed `general_score.result` from API. */
    interview_result: AiInterviewResultPayload | null;
    /** ISO date string from API `created_at` when present. */
    interview_created_at: string | null;
    avg_rating_score: number | null;
    interview_summary_block: InterviewSummaryBlock;
    conversational_round: ScoreRound;
    behavioral_round: ScoreRound;
    communication_analysis: ScoreRound;
    accuracy_of_answers: ScoreRound;
  };

  qualifications: QualificationVM[];
  documents: {
    personal: DocumentVM[];
    licenses_certificates: DocumentVM[];
  };
  work_experiences: WorkExperienceVM[];
  work_history: WorkHistoryEntryVM[];
  ratings: RatingsBlockVM;
}
