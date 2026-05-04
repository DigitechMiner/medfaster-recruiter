/**
 * Maps job title labels (returned by API in job.job_title)
 * to the slugs accepted by GET /recruiter/jobs/fees/:jobtitle
 *
 * Source of truth: GET /common/departments-job-titles
 */
const LABEL_TO_SLUG: Record<string, string> = {
  // Nursing
  "Registered Nurse (RN)":              "registered_nurse",
  "Licensed Practical Nurse (LPN)":     "licensed_practical_nurse",
  "Home Care Aide":                     "home_care_aide",

  // Community Support & Disability Services
  "Personal Support Worker (PSW)":      "personal_support_worker",
  "Community Disability Support Worker": "community_disability_service_worker",
};

export function toJobTitleSlug(label: string): string | null {
  if (!label) return null;

  // 1. Exact match
  if (LABEL_TO_SLUG[label]) return LABEL_TO_SLUG[label];

  // 2. Case-insensitive fallback
  const lower = label.toLowerCase();
  const found = Object.entries(LABEL_TO_SLUG).find(
    ([k]) => k.toLowerCase() === lower
  );
  return found ? found[1] : null;
}