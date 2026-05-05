"use client";

import { useCandidatesList } from "@/hooks/useRecruiterData";

export interface Candidate {
  id:            string;
  applicationId: string;  // ✅ already added
  name:          string;
  role:          string;
  exp:           string;
  distance:      string;
  rating:        number;
  score:         number;
  online:        boolean;
  avatar:        string;
}

export type ColKey = 'applied' | 'shortlisted' | 'ai_interviewing' | 'interviewed' | 'hired';

export interface ColConfig {
  key:       ColKey;
  label:     string;
  count:     number;
  dotColor:  string;
  border:    string;
  bg:        string;
  textColor: string;
  aiOnly?:   boolean;
}

// ✅ DUMMY_CANDIDATES removed — use useCandidatesForKanban() below

export const COLUMNS: ColConfig[] = [
  { key: 'applied',         label: 'Applied',         count: 0, dotColor: 'bg-blue-500',   border: 'border-blue-300',   bg: 'bg-blue-50/60',   textColor: 'text-blue-600'  },
  { key: 'shortlisted',     label: 'Shortlisted',     count: 0, dotColor: 'bg-orange-400', border: 'border-orange-300', bg: 'bg-orange-50/60', textColor: 'text-[#F4781B]' },
  { key: 'ai_interviewing', label: 'AI-Interviewing', count: 0, dotColor: 'bg-red-400',    border: 'border-red-300',    bg: 'bg-red-50/60',    textColor: 'text-red-500',  aiOnly: true },
  { key: 'interviewed',     label: 'Interviewed',     count: 0, dotColor: 'bg-red-500',    border: 'border-red-400',    bg: 'bg-red-50/40',    textColor: 'text-red-500'   },
  { key: 'hired',           label: 'Hired',           count: 0, dotColor: 'bg-green-500',  border: 'border-green-300',  bg: 'bg-green-50/60',  textColor: 'text-green-600' },
];

// ── Transform CandidateListItem → Candidate (kanban shape) ───────────────────

import type { CandidateListItem } from "@/Interface/recruiter.types";

function toTitleCase(value?: string | null) {
  return value
    ?.replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

export function toKanbanCandidate(raw: CandidateListItem): Candidate {
  return {
    id:            raw.id ?? raw.candidate_id ?? "",
    applicationId: raw.job_application_id ?? raw.application_id ?? "",
    name:          raw.full_name || `${raw.first_name} ${raw.last_name ?? ""}`.trim(),
    role:          toTitleCase(raw.specialty?.[0]) ?? toTitleCase(raw.medical_industry) ?? "Healthcare Professional",
    exp:           raw.experience_in_months
                     ? `${Math.round(raw.experience_in_months / 12)}+ yrs`
                     : "—",
    distance:      [raw.city, raw.state].filter(Boolean).join(", ") || "N/A",
    rating:        Number(raw.completion_percentage ?? 0) / 20,
    score:         raw.highest_job_interview_score ?? raw.highest_interview_score ?? 0,
    online:        false,
    avatar:        raw.profile_image_url ?? "/icon/card-doctor.svg",
  };
}

// ── Hook — use this in the kanban board parent component ─────────────────────

export function useCandidatesForKanban({
  jobId,
  page  = 1,
  limit = 10,
}: {
  jobId:   string;
  page?:   number;
  limit?:  number;
}) {
  const { data, isLoading, refetch } = useCandidatesList({
    page,
    limit,
    job_id: jobId,
  });

  const raw        = data?.data.candidates ?? [];
  const candidates = raw.map(toKanbanCandidate);
  const total      = data?.data.pagination?.total ?? 0;

  return { candidates, total, isLoading, refetch };
}