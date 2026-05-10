import type { JobApplicationItem, RecruiterCandidateRow } from "@/types";
import type { CandidateCardVM } from "@/types/view-models";
import { jobTitlesDesignation } from "@/lib/transforms/job-title-display";

function toInitials(first: string, last?: string | null) {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();
}

function toExperience(months?: number | null) {
  if (!months) return "—";
  const yrs = Math.max(1, Math.round(months / 12));
  return `${yrs}+ yrs`;
}

export function fromJobApplication(app: JobApplicationItem): CandidateCardVM {
  const c = app.candidate;
  const jobTitleStr = c.job_title || app.job?.job_title;
  const titleTokens = jobTitleStr ? [jobTitleStr] : [];
  const { designation, job_title_labels } = jobTitlesDesignation(titleTokens);
  return {
    id: c.id,
    application_id: app.id,
    full_name: c.full_name || `${c.first_name} ${c.last_name ?? ""}`.trim(),
    initials: toInitials(c.first_name, c.last_name),
    profile_image_url: c.profile_image_url ?? null,
    designation,
    job_title_labels,
    experience: c.experience ?? toExperience(c.experience_months),
    distance: [c.city, c.state].filter(Boolean).join(", ") || "N/A",
    interview_score: c.job_interview_score ?? c.best_ai_interview_score ?? null,
    rating: null,
    work_eligibility: c.work_eligibility ?? null,
    is_online: false,
    application_status: app.status,
    href: `/candidates/${c.id}`,
  };
}

function normalizeJobTitles(raw: RecruiterCandidateRow["job_titles"]): string[] {
  if (raw == null) return [];
  if (Array.isArray(raw)) {
    return raw.map((x) => String(x ?? "").trim()).filter(Boolean);
  }
  return String(raw)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseRating(raw: RecruiterCandidateRow["avg_rating_score"]): number | null {
  if (raw === null || raw === undefined || raw === "") return null;
  const n = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(n) ? n : null;
}

/** GET /recruiter/candidates row → card VM */
export function fromRecruiterCandidateRow(row: RecruiterCandidateRow): CandidateCardVM {
  const titleSlugs = normalizeJobTitles(row.job_titles);
  const { designation, job_title_labels } = jobTitlesDesignation(titleSlugs);
  const dist =
    row.distance != null && Number.isFinite(Number(row.distance))
      ? `${Number(row.distance).toFixed(1)} km`
      : "N/A";

  return {
    id: row.candidate_id,
    application_id: "",
    full_name: `${row.first_name} ${row.last_name}`.trim(),
    initials: toInitials(row.first_name, row.last_name),
    profile_image_url: row.profile_image_url ?? null,
    designation,
    job_title_labels,
    experience: toExperience(row.experience_in_months),
    distance: dist,
    interview_score: row.best_ai_interview_score ?? null,
    rating: parseRating(row.avg_rating_score),
    work_eligibility: null,
    is_online: false,
    is_active: row.is_active ?? undefined,
    application_status:
      row.is_active === false ? "Inactive" : "Active",
    href: `/candidates/${row.candidate_id}`,
    in_house_status: row.in_house_status ?? null,
  };
}
