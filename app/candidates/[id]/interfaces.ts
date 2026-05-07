import type { CandidateDetailProfile } from "@/Interface/recruiter.types";

export type CandidateApiEducation = {
  id: string;
  school: string;
  degree?: string;
  field_of_study?: string;
  start_date?: string;
  end_date?: string;
};

export type CandidateApiDocument = {
  id: string;
  document_type: string;
  title: string;
  status?: string;
  expiry_date?: string | null;
};

export type CandidateApiWorkHistory = {
  application_id: string;
  job_title?: string;
  department?: string;
  job_type?: string;
  job_status?: string;
  application_status?: string;
};

export type CandidateApiWorkExperience = {
  id: string;
  title: string;
  company: string;
  start_date: string;
  end_date?: string | null;
  is_current?: boolean;
  description?: string | null;
  employment_type?: string;
};

export type CandidateDetailApiResponse = {
  success: boolean;
  message: string;
  data: {
    basic?: CandidateDetailProfile;
    general_score?: { best_ai_interview_evaluation?: number | null };
    qualification?: {
      departments?: string[];
      specializations?: string[];
      educations?: CandidateApiEducation[];
    };
    documentation?: CandidateApiDocument[];
    work_experience?: CandidateApiWorkExperience[];
    work_history?: CandidateApiWorkHistory[];
    ratings?: {
      avg_rating?: number;
      total_reviews?: number;
      recent_reviews?: CandidateDetailProfile["ratings"];
    };
  };
};

export type JobOption = {
  id: string;
  title: string;
  type: "Regular" | "Urgent";
  status: string;
  interviewRequired: boolean;
  org_photo: string | null;
  experience_range?: string | null;
  department?: string | null;
  job_type?: string | null;
  location?: string | null;
};

export type JobsResponse = {
  data: { jobs: JobOption[]; pagination: { total: number } };
};
