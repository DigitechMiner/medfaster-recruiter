// app/dashboard/types.ts
import type { JobsListResponse } from "@/Interface/job.types";

export type MetricType = "openJobs" | "applied" | "interviewing" | "hired" | "pending";

// Use the job type from the API response
export type DashboardJob = JobsListResponse['data']['jobs'][number];

export interface Candidate {
  id: string;
  name: string;
  initials: string;
  skills: string;
  currentEmployer?: string;
  experience: string;
  status: string;
  assignedJob?: string;
}

export interface Application {
  id: string;
  job_id: string;
  candidate_id: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN' | 'INTERVIEWING';
  created_at: string;
  updated_at: string;
  job: {
    id: string;
    job_title: string;
    department: string | null;
    job_type: string | null;
    status: string;
  } | null;
  candidate: {
    id: string;
    first_name: string;
    last_name: string;
    full_name: string | null;
    email: string | null;
    phone_number: string | null;
    current_employer?: string;
    years_of_experience?: number;
  } | null;
}

export interface DashboardMetrics {
  totalOpenJobs: number;
  totalApplicants: number;
  inInterviewStage: number;
  hiredThisMonth: number;
  pendingApprovals: number;
}

export interface MetricCardProps {
  title: string;
  value: number;
  percentChange: number;
  isPositive: boolean;
  isActive: boolean;
  onClick: () => void;
}
