// ============ JOB TYPES ============
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

// ============ COMPONENT PROPS ============
export interface DetailedJobCardProps {
  job: Job;
  status: StatusType;
  onClose: () => void;
}

export interface ScoreBoxProps {
  score: number;
}

export interface JobListingCardProps {
  job: TopJob;
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
