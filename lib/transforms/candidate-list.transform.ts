import type { CandidateListItem } from "@/Interface/recruiter.types";
import type { CandidateCardVM }   from "@/Interface/view-models";

export function fromCandidateListItem(c: CandidateListItem): CandidateCardVM {
  const fullName = c.full_name?.trim()
    || `${c.first_name} ${c.last_name ?? ""}`.trim()
    || "—";

  const initials = [c.first_name?.[0], c.last_name?.[0]]
    .filter(Boolean).join("").toUpperCase() || "??";

  const department = Array.isArray(c.department)
    ? (c.department[0] ?? "—")
    : (c.department ?? "—");

  const experience = (() => {
    if (c.experience_in_months == null) return "—";
    const yrs = Math.floor(c.experience_in_months / 12);
    const mos = c.experience_in_months % 12;
    if (yrs === 0) return `${mos} mo${mos !== 1 ? "s" : ""}`;
    if (mos === 0) return `${yrs} yr${yrs !== 1 ? "s" : ""}`;
    return `${yrs} yr${yrs !== 1 ? "s" : ""} ${mos} mo${mos !== 1 ? "s" : ""}`;
  })();

  const distance = c.distance != null ? `${c.distance} km` : "—";

  const interview_score =
    c.best_ai_interview_score     ??
    c.highest_job_interview_score ??
    c.highest_interview_score     ??
    null;

  const id = c.candidate_id ?? c.id ?? "";

  return {
    id,                                                // ✅ was missing
    application_id:    id,
    full_name:         fullName,
    initials,
    profile_image_url: c.profile_image_url ?? null,
    designation:       c.job_title ?? c.job_titles?.[0] ?? c.role ?? "—",
    department,
    experience,
    distance,
    rating:            c.avg_rating_score  ?? null,
    interview_score,
    work_eligibility:  c.work_eligibility  ?? null,
    is_online:         false,
    application_status: c.status           ?? "—",    // ✅ was missing
    href:              `/candidates/${id}`,
  };
}