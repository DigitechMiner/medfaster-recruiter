// stores/api/interview-questions.api.ts
import { apiRequest } from "./api-client";
import { ENDPOINTS }  from "./api-endpoints";

export interface GenerateQuestionsPayload {
  title:           string;  // job title slug
  department:      string;  // department slug
  specialization?: string;  // optional specialization slug
  count?:          number;
}

export interface GenerateQuestionsResponse {
  success:  boolean;
  data:     { questions: string[] };
  message?: string;
}

export async function generateInterviewQuestions(
  payload: GenerateQuestionsPayload
): Promise<string[]> {
  const res = await apiRequest<GenerateQuestionsResponse>(
    ENDPOINTS.GENERATE_JOB_QUESTIONS,
    { method: "POST", data: payload }
  );
  return res.data?.questions ?? [];
}