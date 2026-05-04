// stores/api/job-description.api.ts
import { apiRequest } from "./api-client";
import { ENDPOINTS }  from "./api-endpoints";
import { toJobTitleSlug } from "@/utils/constant/job-title-slug";

export interface JobDescriptionInput {
  jobTitle:    string;  // display label OR slug — both handled
  department:  string;
  jobType:     string;
}

export interface GeneratedDescriptionData {
  description:        string;
  responsibilities:   string[];
  required_skills:    string[];
  experience:         string[];
  working_conditions: string[];
  why_join:           string[];
}

interface GenerateDescriptionResponse {
  success:  boolean;
  data:     GeneratedDescriptionData;
  message?: string;
}

export async function generateJobDescription(
  input: JobDescriptionInput
): Promise<GeneratedDescriptionData> {
  // Swagger only requires job_title (the slug) — all other fields are ignored
  const slug = toJobTitleSlug(input.jobTitle) ?? input.jobTitle;

  const res = await apiRequest<GenerateDescriptionResponse>(
    ENDPOINTS.GENERATE_JOB_DESCRIPTION,
    { method: "POST", data: { job_title: slug } }
  );

  return res.data;
}