import type { InHouseCandidate }    from "@/Interface/recruiter.types";
import type {
  InHouseInvitedRowVM,
  InHouseAcceptedRowVM,
} from "@/Interface/view-models";

function toDateLabel(raw?: string | null): string {
  if (!raw) return "—";
  return new Date(raw).toLocaleDateString("en-CA", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export function fromInHouseToInvited(c: InHouseCandidate): InHouseInvitedRowVM {
  return {
    candidate_id: c.candidate_id,
    full_name:    c.full_name,
    email:        c.user?.email ?? null,
    remark:       c.status === "ACTIVE" ? "Invitation Accepted" : "Invitation Sent",
    invited_at:   toDateLabel(c.joined_at),
  };
}

export function fromInHouseToAccepted(c: InHouseCandidate): InHouseAcceptedRowVM {
  return {
    candidate_id:     c.candidate_id,
    mapping_id:       c.mapping_id,
    full_name:        c.full_name,
    profile_image_url: c.profile_image_url ?? null,
    departments:      c.department ?? [],
    job_titles:       c.job_titles ?? [],
    experience_range: c.experience_in_months
      ? `${Math.max(1, Math.round(c.experience_in_months / 12))}+ yrs`
      : "—",
  };
}