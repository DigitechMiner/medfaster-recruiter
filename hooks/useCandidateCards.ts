import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/stores/api/api-client";
import { ENDPOINTS } from "@/stores/api/api-endpoints";
import type { CandidateCardVM } from "@/types/view-models";
import type {
  JobApplicationItem,
  JobApplicationsResponse,
  JobApplicationsParams,
} from "@/types";

type UseCandidateCardsParams = JobApplicationsParams & { enabled?: boolean };

function toInitials(first: string, last?: string | null) {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();
}

function toExperience(months?: number | null) {
  if (!months) return "—";
  const yrs = Math.max(1, Math.round(months / 12));
  return `${yrs}+ yrs`;
}

function toJobTitleLabel(raw: string): string {
  const value = raw.trim();
  if (!value) return "—";
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function abbreviateJobTitle(slug: string): string {
  return slug
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function jobTitlesDesignation(slugs: string[]): {
  designation: string;
  job_title_labels: string[];
} {
  const cleaned = slugs
    .map((slug) => String(slug ?? "").trim())
    .filter(Boolean);
  const job_title_labels = cleaned.map(toJobTitleLabel);
  if (cleaned.length === 0) return { designation: "—", job_title_labels: [] };
  if (cleaned.length === 1)
    return { designation: job_title_labels[0], job_title_labels };
  return {
    designation: cleaned.map(abbreviateJobTitle).join(" | "),
    job_title_labels,
  };
}

function fromJobApplication(app: JobApplicationItem): CandidateCardVM {
  const c = app.candidate;
  const jobTitleStr = c.job_title || app.job?.job_title;
  const titleTokens = jobTitleStr ? [jobTitleStr] : [];
  const { designation, job_title_labels } = jobTitlesDesignation(titleTokens);

  return {
    id: c.id,
    application_id: app.id,
    full_name: c.full_name || `${c.first_name} ${c.last_name ?? ""}`.trim(),
    initials: toInitials(c.first_name, c.last_name),
    profile_image_url: c.profile_image_url ?? null,
    designation,
    job_title_labels,
    experience: c.experience ?? toExperience(c.experience_months),
    distance: [c.city, c.state].filter(Boolean).join(", ") || "N/A",
    interview_score: c.job_interview_score ?? c.best_ai_interview_score ?? null,
    rating: null,
    work_eligibility: c.work_eligibility ?? null,
    is_online: false,
    application_status: app.status,
    href: `/candidates/${c.id}`,
  };
}

export function useCandidateCards(params: UseCandidateCardsParams) {
  const { enabled = true, ...queryParams } = params;
  const { data, isLoading, isError } = useQuery({
    queryKey: ["candidate-cards", queryParams],
    queryFn: () =>
      apiRequest<JobApplicationsResponse>(ENDPOINTS.JOB_APPLICATIONS, {
        method: "GET",
        params: queryParams,
      }),
    enabled,
  });

  return {
    cards: (data?.data?.applications ?? []).map(
      fromJobApplication,
    ) as CandidateCardVM[],
    total: data?.data?.pagination?.total ?? 0,
    isLoading,
    isError,
  };
}
