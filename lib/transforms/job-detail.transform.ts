import type { JobBackendResponse } from "@/Interface/recruiter.types";
import type { JobDetailHeaderVM }  from "@/Interface/view-models";

// ── Typed shape for fields only present on normalJob ──────────────────────
// InstantJobDetails doesn't have these — so we extract them safely
interface NormalJobExtras {
  specializations?: number[] | string[] | null;
  qualifications?:  string[] | string    | null;
  years_of_experience?: number | string  | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────

function toLabel(raw?: string | null) {
  if (!raw) return "—";
  return raw.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

function toBudget(raw?: string | number | null): string {
  if (!raw) return "—";
  const cents = typeof raw === "string" ? parseFloat(raw) : raw;
  if (isNaN(cents) || cents === 0) return "—";
  return `$${(cents / 100).toFixed(2)}/hr`;
}

function toTimings(checkIn?: string | null, checkOut?: string | null): string | null {
  if (!checkIn || !checkOut) return null;
  const fmt = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
  };
  return `${fmt(checkIn)} – ${fmt(checkOut)}`;
}

function toDateLabel(raw?: string | null): string | null {
  if (!raw) return null;
  return new Date(raw).toLocaleDateString("en-CA", {
    day: "numeric", month: "short", year: "numeric",
  });
}

// ── Transform ─────────────────────────────────────────────────────────────

export function fromJobBackendResponse(
  job: JobBackendResponse,
  specializationMap: Record<string, string> = {},
): JobDetailHeaderVM {
  // ✅ Cast to NormalJobExtras — safe because InstantJobDetails simply won't have these fields
  const detail = (job.normalJob ?? job.instantJob ?? null) as NormalJobExtras | null;

  // Specialization IDs live on normalJob.specializations
  const specIds = (detail?.specializations ?? []) as (number | string)[];
  const specLabels = specIds.map((id) => specializationMap[String(id)] ?? String(id));

  // Qualifications — string[] or comma-separated string depending on API version
  const rawQuals = detail?.qualifications ?? [];
  const qualifications: string[] = Array.isArray(rawQuals)
    ? rawQuals
    : rawQuals.split(",").map((q) => q.trim()).filter(Boolean);

  // years_of_experience lives on normalJob, not top-level
  const rawExp   = detail?.years_of_experience ?? null;
  const yearsExp = rawExp !== null ? Number(rawExp) : null;

  // ✅ no_of_hires_hired — correct field from JobBackendResponse
  const totalHired = job.no_of_hires_hired ?? 0;

  return {
    id:                     job.id,
    job_title:              toLabel(job.job_title),
    department:             toLabel(job.department),
    province:               job.city && job.province
                              ? `${job.city}, ${job.province}`
                              : (job.province ?? "—"),
    recruiter_email:        null,
    recruiter_phone:        null,
    job_type:               toLabel(job.job_type),
    pay_per_hour:           toBudget(job.pay_per_hour_cents),
    specialization_labels:  specLabels,
    qualifications,
    total_requirements:     job.no_of_hires_required ?? 0,
    total_hired:            totalHired,
    experience_required:    yearsExp ? `${yearsExp}+ yrs` : "—",
    start_date:             toDateLabel(job.start_date),
    timings:                toTimings(job.check_in_time, job.check_out_time),
    is_requirements_filled: totalHired >= (job.no_of_hires_required ?? 0),
    status:                 job.status,
  };
}