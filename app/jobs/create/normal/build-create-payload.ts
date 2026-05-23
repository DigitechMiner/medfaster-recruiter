import type {
  EmploymentTenure,
  EmploymentType,
  JobCreatePayload,
  JobFormData,
  JobUrgency,
  NormalJobCreatePayload,
} from "@/types";
import {
  buildNormalJobSchedulingPayload,
  type NormalJobSchedulingSource,
} from "./build-preview-payload";

const EMPLOYMENT_TENURE_BY_TYPE: Record<EmploymentType, EmploymentTenure> = {
  temporary: "TEMPORARY",
  permanent: "PERMANENT",
};

function toEmploymentTenure(
  employmentType?: EmploymentType,
): EmploymentTenure {
  if (!employmentType) return "TEMPORARY";
  return EMPLOYMENT_TENURE_BY_TYPE[employmentType] ?? "TEMPORARY";
}

function toCreateJobUrgency(urgency?: JobUrgency): JobUrgency {
  const raw = (urgency ?? "NORMAL").toString().toUpperCase();
  return raw === "INSTANT" ? "INSTANT" : "NORMAL";
}

function resolveNoOfHires(source: CreateSource): number {
  const raw = source.no_of_hires_required;
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return Math.max(1, raw);
  }
  if (typeof raw === "string") {
    const parsed = Number.parseInt(raw, 10);
    if (Number.isFinite(parsed)) return Math.max(1, parsed);
  }
  return 1;
}

type CreateSource = JobCreatePayload | JobFormData;

/**
 * Builds the backend create-job body for normal (non-instant) posts.
 */
export function buildNormalJobCreatePayload(
  source: CreateSource,
): NormalJobCreatePayload | null {
  const scheduling = buildNormalJobSchedulingPayload(
    source as NormalJobSchedulingSource,
  );
  if (!scheduling) return null;

  const aiInterview = source.ai_interview === true;
  const questions =
    aiInterview && Array.isArray(source.questions)
      ? source.questions.filter(
          (q): q is string => typeof q === "string" && q.trim().length > 0,
        )
      : undefined;

  const payload: NormalJobCreatePayload = {
    ...scheduling,
    job_urgency: toCreateJobUrgency(scheduling.job_urgency),
    department: source.department?.trim() || undefined,
    employment_tenure: toEmploymentTenure(source.employment_type),
    street: source.street?.trim() || undefined,
    postal_code: source.postal_code?.trim() || undefined,
    province: source.province?.trim() || undefined,
    city: source.city?.trim() || undefined,
    years_of_experience: source.years_of_experience,
    qualifications: source.qualifications,
    specializations: source.specializations,
    ai_interview: aiInterview,
    description: source.description?.trim() || undefined,
    responsibilities: source.responsibilities,
    required_skills: source.required_skills,
    experience: source.experience,
    working_conditions: source.working_conditions,
    why_join: source.why_join,
    no_of_hires_required: resolveNoOfHires(source),
    questions: questions?.length ? questions : undefined,
    pay_per_hour_cents:
      "pay_per_hour_cents" in source
        ? source.pay_per_hour_cents
        : undefined,
    status: source.status,
  };

  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined),
  ) as NormalJobCreatePayload;
}
