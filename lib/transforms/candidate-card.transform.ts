import type { JobApplicationItem } from "@/Interface/recruiter.types";
import type { CandidateCardVM, CandidateTableRowVM }    from "@/Interface/view-models";

function toInitials(first: string, last?: string | null) {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();
}

function toExperience(months?: number | null) {
  if (!months) return "—";
  const yrs = Math.max(1, Math.round(months / 12));
  return `${yrs}+ yrs`;
}

function toLabel(raw?: string | null) {
  if (!raw) return "—";
  return raw.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
}

export function fromJobApplication(app: JobApplicationItem): CandidateCardVM {
  const c = app.candidate;
  return {
    id:                 c.id,
    application_id:     app.id,
    full_name:          c.full_name || `${c.first_name} ${c.last_name ?? ""}`.trim(),
    initials:           toInitials(c.first_name, c.last_name),
    profile_image_url:  c.profile_image_url ?? null,
    designation:        toLabel(c.job_title),
    department:         toLabel(c.department),
    experience:         c.experience ?? toExperience(c.experience_months),
    distance:           [c.city, c.state].filter(Boolean).join(", ") || "N/A",
    interview_score:    c.job_interview_score ?? c.best_ai_interview_score ?? null,
    rating:             null,
    work_eligibility:   c.work_eligibility ?? null,
    is_online:          false,
    application_status: app.status,
    href:               `/candidates/${c.id}`,
  };
}

export function fromJobApplicationToRow(app: JobApplicationItem): CandidateTableRowVM {
  const c = app.candidate;
  return {
    id:                 c.id,
    application_id:     app.id,
    full_name:          c.full_name || `${c.first_name} ${c.last_name ?? ""}`.trim(),
    department:         toLabel(c.department),
    designation:        toLabel(c.job_title),
    experience:         c.experience ?? toExperience(c.experience_months),
    distance:           [c.city, c.state].filter(Boolean).join(", ") || "N/A",
    general_score:      c.job_interview_score ?? c.best_ai_interview_score ?? null,
    rating:             null,   // TODO(backend): not on JobApplicationItem yet
    application_status: app.status,
    href:               `/candidates/${c.id}`,
  };
}