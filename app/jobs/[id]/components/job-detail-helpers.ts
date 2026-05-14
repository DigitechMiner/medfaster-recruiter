import type { JobBackendResponse } from "@/types";

export type JobDetailPayload = Omit<Partial<JobBackendResponse>, "pay_per_hour_cents"> & {
  id: string;
  title?: string;
  street?: string | null;
  city?: string | null;
  province?: string | null;
  postal_code?: string | null;
  neighborhood_name?: string | null;
  neighborhood_type?: string | null;
  direct_number?: string | null;
  pay_per_hour_cents?: string | number;
};

export function mapJobDetail(job: JobDetailPayload): JobBackendResponse {
  const createdAt = job.created_at ?? "";
  const jobUrgency = job.job_urgency ?? "normal";

  return {
    id: job.id,
    recruiter_profile_id: job.recruiter_profile_id ?? "",
    job_title: job.job_title ?? job.title ?? "Untitled Job",
    department: job.department ?? null,
    job_type: job.job_type ?? null,
    job_urgency: jobUrgency,
    street: job.street ?? null,
    postal_code: job.postal_code ?? null,
    province: job.province ?? null,
    city: job.city ?? null,
    geolocation: job.geolocation ?? null,
    pay_per_hour_cents: String(job.pay_per_hour_cents ?? "0"),
    fee_snapshot: job.fee_snapshot ?? null,
    shift_snapshot: job.shift_snapshot ?? null,
    no_of_hires_required: job.no_of_hires_required ?? 0,
    no_of_hires_hired: job.no_of_hires_hired ?? 0,
    application_count: job.application_count ?? 0,
    start_date: job.start_date ?? null,
    end_date: job.end_date ?? null,
    check_in_time: job.check_in_time ?? null,
    check_out_time: job.check_out_time ?? null,
    status: job.status ?? "OPEN",
    closed_reason: job.closed_reason ?? null,
    recruiter_close_note: job.recruiter_close_note ?? null,
    created_at: createdAt,
    updated_at: job.updated_at ?? createdAt,
    normalJob: job.normalJob ?? null,
    instantJob:
      job.instantJob ??
      (jobUrgency === "instant"
        ? {
            id: "",
            job_id: job.id,
            neighborhood_name: job.neighborhood_name ?? null,
            neighborhood_type: job.neighborhood_type ?? null,
            direct_number: job.direct_number ?? null,
            created_at: createdAt,
            updated_at: job.updated_at ?? createdAt,
          }
        : null),
    funding: job.funding ?? null,
    description: job.description ?? null,
    responsibilities: job.responsibilities ?? [],
    required_skills: job.required_skills ?? [],
    experience: job.experience ?? [],
    working_conditions: job.working_conditions ?? [],
    why_join: job.why_join ?? [],
  };
}

export function formatLabel(value?: string | null) {
  if (!value) return "N/A";
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatDate(value?: string | null) {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatDateTime(value?: string | null) {
  if (!value) return "N/A";
  return new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatTime(value?: string | null) {
  if (!value) return "N/A";
  const [hours, minutes] = value.split(":").map(Number);
  return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${hours >= 12 ? "pm" : "am"}`;
}

export function formatPay(value?: string | number | null) {
  if (value === null || value === undefined || value === "") return "N/A";
  return `$${(Number(value) / 100).toFixed(2)}`;
}
