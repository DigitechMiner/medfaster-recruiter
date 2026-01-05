// stores/api/job-description.api.ts
import { apiRequest } from "./api-client";
import { ENDPOINTS } from "./api-endpoints";

export interface JobDescriptionInput {
  jobTitle: string;        // Required
  department: string;      // Required
  jobType: string;         // Required
  payRange?: string;
  location?: string;
  experienceRequired?: string;
  qualification?: string;
  specialization?: string;
  urgency?: string;
  inPersonInterview?: boolean;
  physicalInterview?: boolean;
}

interface GenerateDescriptionResponse {
  success: boolean;
  data: {
    description: string;
  };
  message?: string;
}

// POST /recruiter/jobs/generate-description
export async function generateJobDescription(input: JobDescriptionInput) {
  const res = await apiRequest<GenerateDescriptionResponse>(
    ENDPOINTS.GENERATE_JOB_DESCRIPTION,
    {
      method: 'POST',
      data: input,
    }
  );

  return res.data;
}
