import type { JobListItem } from "@/types";

export interface StatCounts {
  activeJobs: number;
  normalJobs: number;
  instantJobs: number;
  activeShifts: number;
}

export type TabFilter = {
  job_urgency?: "instant" | "normal";
  status?: "OPEN" | "CLOSED" | "UPCOMING" | "COMPLETED";
};

export type JobUrgencyFilter = "all" | "instant" | "normal";
export type JobStatusFilter = "all" | "UPCOMING" | "OPEN" | "CLOSED" | "COMPLETED";

export const JOB_TABLE_HEADERS = [
  "Job Title",
  "Applications",
  "Job Start Date",
  "Job End Date",
  "Job Timings",
  "Job Type",
  "Budget",
  "AI-Interview",
  "Job Status",
  "Actions",
];

export const DEFAULT_JOB_BADGE_CLASS = "bg-[#F3F4F6] text-[#6B7280]";

export const jobBadgeVariantMap: Record<string, string> = {
  Regular: "bg-[#D1FAE5] text-[#059669]",
  Urgent: "bg-[#FEE9D6] text-[#F4781B]",
  OPEN: "bg-[#DBEAFE] text-[#2563EB]",
  Open: "bg-[#DBEAFE] text-[#2563EB]",
  DRAFT: "bg-[#F3F4F6] text-[#6B7280]",
  Draft: "bg-[#F3F4F6] text-[#6B7280]",
  PAUSED: "bg-[#FEF9C3] text-[#D97706]",
  Active: "bg-[#D1FAE5] text-[#059669]",
  Completed: "bg-[#FEF9C3] text-[#D97706]",
  Upcoming: "bg-[#7C2D12] text-white",
  CLOSED: "bg-[#FEE2E2] text-[#DC2626]",
  Closed: "bg-[#FEE2E2] text-[#DC2626]",
};

export const jobBadgeDisplayMap: Record<string, string> = {
  OPEN: "Open",
  CLOSED: "Closed",
  DRAFT: "Draft",
  PAUSED: "Paused",
};

export const formatDate = (date?: string | null) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const formatTime = (time?: string | null) => (time ? time.slice(0, 5) : null);

export const formatBudget = (cents?: number | null) => {
  if (cents == null) return "—";
  return `$${(cents / 100).toFixed(2)}/hr`;
};

export function getInterviewLabel(job: JobListItem): { label: string; cls: string } {
  if (job.job_urgency === "instant") {
    return { label: "No Interview Needed", cls: "bg-[#FEE4E2] text-[#912018]" };
  }

  if (job.ai_interview) {
    return { label: "AI Interview", cls: "bg-[#D1FAE5] text-[#059669]" };
  }

  return { label: "No Interview Required", cls: "bg-[#FEF9C3] text-[#854D0E]" };
}

export function JobsLoadingSkeleton() {
  return (
    <div className="flex flex-col gap-3 py-4">
      {[...Array(4)].map((_, index) => (
        <div key={index} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
      ))}
    </div>
  );
}

export function JobsErrorView({ error }: { error: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-2">
      <span className="text-4xl">!</span>
      <p className="text-sm font-medium text-gray-500">Failed to load jobs</p>
      <p className="text-xs text-gray-400">{error}</p>
    </div>
  );
}

export function JobsEmptyView() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-2">
      <span className="text-4xl">No jobs</span>
      <p className="text-sm font-medium text-gray-500">No data available</p>
      <p className="text-xs text-gray-400">There are no jobs matching this filter.</p>
    </div>
  );
}
