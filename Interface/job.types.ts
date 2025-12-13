// ============ BACKEND API TYPES (snake_case) ============
export interface JobBackendResponse {
  id: string;
  recruiter_profile_id: string;
  job_title: string;
  department: string | null;
  job_type: string | null;
  location: string | null;
  pay_range_min: number | null;
  pay_range_max: number | null;
  years_of_experience: string | null;
  qualifications: string[] | null;
  specializations: string[] | null;
  urgency: string | null;
  in_person_interview: boolean | null;
  physical_interview: boolean | null;
  description: string | null;
  questions: Record<string, any> | null;
  status: 'draft' | 'published' | 'closed' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface JobCreatePayload {
  job_title: string;
  department?: string | null;
  job_type?: string | null;
  location?: string | null;
  pay_range_min?: number | null;
  pay_range_max?: number | null;
  years_of_experience?: string | null;
  qualifications?: string[] | null;
  specializations?: string[] | null;
  urgency?: string | null;
  in_person_interview?: boolean | null;
  physical_interview?: boolean | null;
  description?: string | null;
  questions?: Record<string, any> | null;
  status?: 'draft' | 'published' | 'closed' | 'archived';
}

export interface JobUpdatePayload extends Partial<JobCreatePayload> {}

export interface JobsListResponse {
  success: boolean;
  message: string;
  data: {
    jobs: Array<{
      id: string;
      job_title: string;
      years_of_experience: string | null;
      department: string | null;
      job_type: string | null;
      specializations: string[] | null;
      qualifications: string[] | null;
      created_at: string;
      updated_at: string;
    }>;
    pagination: {
      total: number;
      count: number;
      page: number;
      limit: number;
      offset: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
}

export interface JobDetailResponse {
  success: boolean;
  message: string;
  data: {
    job: JobBackendResponse;
  };
}

export interface JobCreateResponse {
  success: boolean;
  message: string;
  data: {
    job: JobBackendResponse;
  };
}

export interface JobUpdateResponse {
  success: boolean;
  message: string;
  data: {
    job: JobBackendResponse;
  };
}

export interface JobDeleteResponse {
  success: boolean;
  message: string;
}

// ============ FRONTEND TYPES (camelCase) ============
export interface JobFormData {
  jobTitle: string;
  department: string;
  jobType: string;
  location: string;
  payRange: [number, number];
  experience: string;
  qualification: string[];
  specialization: string[];
  urgency: string;
  inPersonInterview: string; // "Yes" or "No" for UI
  physicalInterview: string; // "Yes" or "No" for UI
  description: string;
}

// ============ LEGACY TYPES (Keep for other components) ============
export interface TopJob {
  id: number;
  title: string;
  experience: string;
  position: string;
  specializations: string[];
  postedDaysAgo: number;
  applicantCount: number;
}

export interface Job {
  id: number;
  doctorName: string;
  experience: number;
  position: string;
  score: number;
  specialization: string[];
  currentCompany?: string;
}

export type StatusType = 'applied' | 'shortlisted' | 'interviewing' | 'hired';
export type BadgeColor = 'blue' | 'orange' | 'red' | 'green';

export interface JobsData {
  applied: Job[];
  shortlisted: Job[];
  interviewing: Job[];
  hired: Job[];
}

export interface DetailedJobCardProps {
  job: Job;
  status: StatusType;
  onClose: () => void;
}

export interface JobListingCardProps {
  job: JobBackendResponse;
}

export interface JobCardProps {
  job: Job;
  status: StatusType;
  badgeColor: BadgeColor;
  index?: number;
  onView?: (job: Job, status: StatusType, index: number) => void;
}

export interface StatusSectionProps {
  status: StatusType;
  title: string;
  count: number;
  jobs: Job[];
  badgeColor: BadgeColor;
  onJobView?: (job: Job, status: StatusType, index: number) => void;
}

export interface StatusTableProps {
  status: StatusType;
  title: string;
  count: number;
  jobs: Job[];
  badgeColor: BadgeColor;
}
