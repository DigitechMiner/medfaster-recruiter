import type { JobCreatePayload, JobFormData } from "@/types";

// START SECTION: Payload To Form Field Map
export const PAYLOAD_TO_FORM_FIELD = {
  job_title: "job_title",
  department: "department",
  job_type: "job_type",
  street: "street",
  postal_code: "postal_code",
  province: "province",
  city: "city",
  start_date: "start_date",
  end_date: "end_date",
  check_in_time: "check_in_time",
  check_out_time: "check_out_time",
  description: "description",
  responsibilities: "responsibilities",
  required_skills: "required_skills",
  no_of_hires_required: "no_of_hires_required",
  neighborhood_name: "neighborhood_name",
  neighborhood_type: "neighborhood_type",
  direct_number: "direct_number",
  qualifications: "qualifications",
  specializations: "specializations",
  years_of_experience: "years_of_experience",
  ai_interview: "ai_interview",
  questions: "questions",
} as const satisfies Partial<Record<keyof JobCreatePayload, keyof JobFormData>>;
// END SECTION: Payload To Form Field Map
