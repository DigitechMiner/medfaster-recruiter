// ============ BACKEND API TYPES (snake_case) ============
export interface JobBackendResponse {
  id: string;
  recruiter_profile_id: string;
  job_title: string;
  department: string | null;
  job_type: string | null;

  // Location fields
  street?: string | null;
  postal_code?: string | null;
  province?: string | null;
  city?: string | null;

  // Pay range — comes as string "2300.00" from DECIMAL type
  pay_range_min: string | number | null;
  pay_range_max: string | number | null;

  // Job urgency
  job_urgency: 'instant' | 'normal' | null;

  // Other fields
  description: string | null;
  no_of_hires: number | null;
  status: 'DRAFT' | 'OPEN' | 'PAUSED' | 'CLOSED';
  closed_reason: string | null;
  application_count: number;
  created_at: string;
  updated_at: string;

  // ✅ Nested relations — actual structure from API
  normalJob: {
    id: string;
    job_id: string;
    years_of_experience: string;
    qualifications: string[];
    specializations: string[];
    ai_interview: boolean;
    questions: Record<string, { title: string; questions: string[] }> | null;
    created_at: string;
    updated_at: string;
  } | null;

  instantJob: {
    id: string;
    job_id: string;
    start_date: string;
    end_date: string;
    check_in_time: string;
    check_out_time: string;
  } | null;

  // Extra labels from API
  specialization_labels?: string[];
}



export interface JobCreatePayload {
  job_title: string;
  department?: string | null;
  job_type?: string | null;
  
  // Location fields - ADD these based on backend validation
  street?: string | null;
  postal_code?: string | null;
  province?: string | null;
  city?: string | null;
  neighborhood_name?: string | null;
  neighborhood_type?: string | null;
  direct_number?: string | null;
  location?: string | null;
  
  pay_range_min?: number | null;
  pay_range_max?: number | null;
  years_of_experience?: string | null;
  qualifications?: string[] | null;
  specializations?: string[] | null;
  
  job_urgency?: 'instant' | 'normal'; // Use correct type instead of string
  
  no_of_hires?: number | null; // Backend uses 'no_of_hires', not 'numberOfHires'
  
  ai_interview?: boolean; // Make optional since it's only for normal jobs
  in_person_interview?: boolean | null;
  physical_interview?: boolean | null;
  
  description?: string | null;
  questions?: Record<string, any> | null;
  
  status?: 'DRAFT' | 'OPEN' | 'PAUSED' | 'CLOSED';
  
  start_date?: string | null;
  end_date?: string | null;
  check_in_time?: string | null;
  check_out_time?: string | null;
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
      status: 'DRAFT' | 'OPEN' | 'PAUSED' | 'CLOSED';
      created_at: string;
      updated_at: string;
      application_count: number;
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
  urgency: 'instant' | 'normal'; // Only these two values
  inPersonInterview: string;
  physicalInterview: string;
  aiInterview?: string;
  description: string;
  streetAddress?: string;
  postalCode?: string;
  province?: string;
  city?: string;
  country?: string;
  numberOfHires?: string;
  fromDate?: Date;
  tillDate?: Date;
  fromTime?: string;
  toTime?: string;
  status: 'DRAFT' | 'OPEN' | 'PAUSED' | 'CLOSED';
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
  candidateId?: string;
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
