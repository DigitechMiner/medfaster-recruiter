import type { JobListItem }  from "@/Interface/recruiter.types";
import type { JobCardVM, JobTableRowVM } from "@/Interface/view-models";

function toLabel(raw?: string | null) {
  if (!raw) return "—";
  return raw.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
}

// ⚠️ pay_per_hour_cents is a STRING from the API — parse first
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

function toDisplayId(uuid: string): string {
  return `KRV-${uuid.slice(0, 6).toUpperCase()}`;
}

export function fromJobListItem(job: JobListItem): JobCardVM {
  return {
    id:                    job.id,
    display_id:            toDisplayId(job.id),
    job_title:             toLabel(job.job_title),
    department:            toLabel(job.department),
    job_type:              toLabel(job.job_type),
    job_urgency:           job.job_urgency,
    status:                job.status,
    status_label:          toLabel(job.status),
    urgency_label:         job.job_urgency === "instant" ? "Urgent" : "Regular",
    experience_required:   job.years_of_experience ? `${job.years_of_experience}+ yrs` : "—",
    province:              job.city && job.province ? `${job.city}, ${job.province}` : "—",
    budget:                toBudget(job.pay_per_hour_cents),
    interview_required:    false,    // ⚠️ only on normalJob nested — not in list
    application_count:     job.application_count ?? 0,
    org_photo:             null,     // ⚠️ needs separate recruiter profile call
    start_date:            toDateLabel(job.start_date),
    href:                  `/jobs/${job.id}`,
    specialization_labels: [],       // ⚠️ not in list endpoint — resolved in detail only
  };
}

export function fromJobListItemToRow(job: JobListItem): JobTableRowVM {
  return {
    id:           job.id,
    job_title:    toLabel(job.job_title),
    requirements: job.no_of_hires_required ?? 0,
    start_date:   toDateLabel(job.start_date),
    end_date:     toDateLabel(job.end_date),
    timings:      toTimings(job.check_in_time, job.check_out_time),
    job_type:     toLabel(job.job_type),
    budget:       toBudget(job.pay_per_hour_cents),
    ai_interview: null,              // ⚠️ only in normalJob nested
    status:       job.status,
    status_label: toLabel(job.status),
    href:         `/jobs/${job.id}`,
  };
}