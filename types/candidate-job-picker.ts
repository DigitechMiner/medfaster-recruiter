/** Types for job picker modals (invite / schedule / shortlist / hire). */
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

export type JobApiItem = {
  id: string;
  job_title: string;
  department?: string | null;
  job_type?: string | null;
  status?: string | null;
  job_urgency?: string | null;
  years_of_experience?: string | null;
  city?: string | null;
  province?: string | null;
};

export type JobsResponse = {
  data: { jobs: JobApiItem[]; pagination: { total: number } };
};
