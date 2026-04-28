import type { CandidateDetailProfile } from "@/Interface/recruiter.types";
import type {
  CandidateDetailVM,
  QualificationVM,
  DocumentVM,
  WorkExperienceVM,
  WorkHistoryEntryVM,
  RatingsBlockVM,
  ReviewVM,
} from "@/Interface/view-models";

// ── Helpers ──────────────────────────────────────────────────────────────────

function toLabel(raw?: string | null) {
  if (!raw) return "—";
  return raw.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
}

function toExperienceLabel(months?: number | null): string {
  if (!months) return "—";
  const yrs = Math.floor(months / 12);
  const mos = months % 12;
  if (yrs === 0) return `${mos} mos`;
  if (mos === 0) return `${yrs} yrs`;
  return `${yrs} yrs ${mos} mos`;
}

function toDisplayId(uuid: string): string {
  return `KRV-${uuid.slice(0, 6).toUpperCase()}`;
}

function toDateLabel(raw?: string | null): string | null {
  if (!raw) return null;
  return new Date(raw).toLocaleDateString("en-CA", { month: "short", year: "numeric" });
}

// ── Document category split ───────────────────────────────────────────────────

const PERSONAL_TYPES = new Set([
  "passport", "pr_card", "work_permit", "criminal_record_check",
]);

function toDocumentVM(doc: {
  document_id: string;
  title: string;
  document_type: string;
  file_url: string | null;
  created_at: string;
}): DocumentVM {
  return {
    document_id:   doc.document_id,
    title:         doc.title,
    document_type: doc.document_type,
    category:      PERSONAL_TYPES.has(doc.document_type) ? "personal" : "license_certificate",
    file_url:      doc.file_url,
    signed_url:    null,  // fetch on-demand via /candidates/{id}/documents/{docId}/url
  };
}

// ── Qualifications ────────────────────────────────────────────────────────────

function toQualificationVM(q: {
  id: string;
  type: string;
  institution: string | null;
  year: number | null;
  description: string | null;
}): QualificationVM {
  return {
    id:          q.id,
    degree:      toLabel(q.type),
    field:       q.description ?? "—",
    institution: q.institution,
    start_year:  null,                  // ⚠️ API only has single year — ask backend for range
    end_year:    q.year ? `${q.year}` : null,
  };
}

// ── Work Experience ───────────────────────────────────────────────────────────

function toWorkExperienceVM(w: {
  id: string;
  company: string;
  title: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
}): WorkExperienceVM {
  return {
    id:           w.id,
    organization: w.company,
    role:         w.title,
    job_type:     null,                 // ⚠️ not confirmed in API
    start_date:   toDateLabel(w.start_date) ?? w.start_date,
    end_date:     w.is_current ? "Present" : toDateLabel(w.end_date),
    is_current:   w.is_current,
    description:  w.description,
    org_photo:    null,                 // ❌ not in API
  };
}

// ── Work History ──────────────────────────────────────────────────────────────

function toWorkHistoryVM(h: {
  application_id: string;
  job_title: string;
  organization: string;
  job_type: string;
  end_date: string | null;
  status: string;
}): WorkHistoryEntryVM {
  return {
    application_id: h.application_id,
    job_title:      toLabel(h.job_title),
    organization:   h.organization,
    job_type:       toLabel(h.job_type),
    completed_date: toDateLabel(h.end_date),
    status:         toLabel(h.status),
  };
}

// ── Ratings block ─────────────────────────────────────────────────────────────

function toRatingsBlockVM(ratings: {
  id: string;
  job_id: string;
  job_title: string;
  rating: number;
  comment: string | null;
  created_at: string;
}[]): RatingsBlockVM {
  const total   = ratings.length;
  const average = total > 0
    ? Math.round((ratings.reduce((s, r) => s + r.rating, 0) / total) * 10) / 10
    : 0;

  const counts = [5, 4, 3, 2, 1].map(star => ({
    stars: star as 5 | 4 | 3 | 2 | 1,
    count: ratings.filter(r => r.rating === star).length,
    percentage: total > 0
      ? Math.round((ratings.filter(r => r.rating === star).length / total) * 100)
      : 0,
  }));

  const reviews: ReviewVM[] = ratings.map(r => ({
    id:              r.id,
    rating:          r.rating,
    comment:         r.comment,
    job_title:       toLabel(r.job_title),
    organization:    null,    // ⚠️ confirm with backend
    recruiter_title: null,    // ⚠️ confirm with backend
    created_at:      new Date(r.created_at).toLocaleDateString("en-CA", {
      day: "numeric", month: "short", year: "numeric",
    }),
  }));

  return { average_score: average, total_reviews: total, star_distribution: counts, reviews };
}

// ── Main transform ────────────────────────────────────────────────────────────

export function fromDetailProfile(p: CandidateDetailProfile): CandidateDetailVM {
  const currentJob = p.work_experiences?.find(w => w.is_current) ?? null;

  const allDocs    = (p.documents ?? []).map(toDocumentVM);

  return {
    id:                p.candidate_id ?? '' ,
    display_id:        toDisplayId(p.candidate_id ?? ''),
    full_name:         p.full_name,
    profile_image_url: p.profile_image_url ?? null,
    job_title:         toLabel(p.job_title),
    city:              p.city ?? null,
    province:          p.state ?? null,
    work_eligibility:  p.work_eligibility ?? null,
    specializations:   [],              // ❌ not in API — ask backend
    job_type:          null,            // ❌ not in detail API

    kpis: {
      attendance_accuracy:   null,      // ❌ not in API
      total_work_experience: toExperienceLabel(p.experience_in_months),
      current_role:          currentJob ? toLabel(currentJob.title) : null,
      current_organization:  currentJob ? currentJob.company : null,
      preferred_location:    null,      // ❌ not in API
    },

    general_score: {
      overall_score:          p.general_score?.best_ai_interview_score ?? null,
      avg_rating_score:       p.general_score?.avg_rating_score ?? null,
      conversational_round:   null,     // ❌ not in API
      behavioral_round:       null,     // ❌ not in API
      communication_analysis: null,     // ❌ not in API
      accuracy_of_answers:    null,     // ❌ not in API
    },

    qualifications:   (p.qualifications ?? []).map(toQualificationVM),

    documents: {
      personal:              allDocs.filter(d => d.category === "personal"),
      licenses_certificates: allDocs.filter(d => d.category === "license_certificate"),
    },

    work_experiences: (p.work_experiences ?? []).map(toWorkExperienceVM),
    work_history:     (p.work_history     ?? []).map(toWorkHistoryVM),
    ratings:          toRatingsBlockVM(p.ratings ?? []),
  };
}