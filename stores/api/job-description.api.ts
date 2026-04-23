// stores/api/job-description.api.ts
import { apiRequest } from "./api-client";
import { ENDPOINTS } from "./api-endpoints";
import {
  convertJobTitleToBackend,
  convertJobTypeToBackend,
  convertSpecializationToBackend,
  convertQualificationToBackend,
} from "@/utils/constant/metadata";

export interface JobDescriptionInput {
  jobTitle:            string;   // display string or slug — both handled
  department:          string;
  jobType:             string;
  payRange?:           string;
  location?:           string;
  experienceRequired?: string;
  qualification?:      string;
  specialization?:     string;
  urgency?:            string;
  inPersonInterview?:  boolean;
  physicalInterview?:  boolean;
}

interface GenerateDescriptionResponse {
  success: boolean;
  data: { description: string };
  message?: string;
}

// Idempotent slug converter — safe on both "Registered Nurse" and "registered_nurse"
function toSlug(value: string): string {
  if (!value) return value;
  // Already a slug (no spaces, has underscore) — pass through
  if (!value.includes(" ") && value === value.toLowerCase()) return value;
  // Try mapping first, then fallback to manual conversion
  return convertJobTitleToBackend(value) !== "registered_nurse"
    ? convertJobTitleToBackend(value)
    : value.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
}

export async function generateJobDescription(input: JobDescriptionInput) {
  // ✅ Map camelCase input → snake_case payload the API expects
  const payload = {
    job_title:           toSlug(input.jobTitle),                    // "registered_nurse"
    department:          input.department,                          // already slug
    job_type:            convertJobTypeToBackend(input.jobType),    // "full_time"
    pay_range:           input.payRange,
    location:            input.location,
    experience_required: input.experienceRequired,
    qualification:       input.qualification
                           ? convertQualificationToBackend(input.qualification)
                           : undefined,
    specialization:      input.specialization
                           ? convertSpecializationToBackend(input.specialization)
                           : undefined,
    urgency:             input.urgency?.toLowerCase(),
    in_person_interview: input.inPersonInterview,
    physical_interview:  input.physicalInterview,
  };

  const res = await apiRequest<GenerateDescriptionResponse>(
    ENDPOINTS.GENERATE_JOB_DESCRIPTION,
    { method: "POST", data: payload }
  );

  return res.data;
}