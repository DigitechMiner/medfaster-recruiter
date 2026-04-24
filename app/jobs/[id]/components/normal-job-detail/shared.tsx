import React from "react";
import type { JobBackendResponse } from "@/Interface/job.types";
import type { CandidateListItem } from '@/Interface/recruiter.types';
import { convertProvinceToFrontend, provinces } from "@/utils/constant/metadata";

export interface Props {
  job: JobBackendResponse;
  jobId: string;
  onCloseJob: () => void;
}

export type TabKey = "applied" | "shortlisted" | "ai_interviewing" | "interviewed" | "hired";

export interface Tab {
  key: TabKey;
  label: string;
  aiOnly?: boolean;
}

export const TABS: Tab[] = [
  { key: "applied", label: "Applied Candidates" },
  { key: "shortlisted", label: "Shortlisted Candidates" },
  { key: "ai_interviewing", label: "AI-Interviewing Candidates", aiOnly: true },
  { key: "interviewed", label: "Interviewed Candidates" },
  { key: "hired", label: "Hired Candidates" },
];

export interface Candidate {
  id: string;
  name: string;
  department: string;
  role: string;
  exp: string;
  rating: number;
  score: number;
  distance: string;
  online: boolean;
  avatar: string;
}

export interface InfoItem {
  icon: React.ReactNode;
  text: string | null;
  node?: React.ReactNode;
}

function toTitleCase(value?: string | null) {
  return value
    ?.replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function toCandidate(candidate: CandidateListItem): Candidate {
  const specialty = toTitleCase(candidate.specialty?.[0])
    ?? toTitleCase(candidate.medical_industry)
    ?? "Healthcare Professional";

  return {
    id: candidate.id ?? candidate.candidate_id ?? '',
    name: candidate.full_name || `${candidate.first_name} ${candidate.last_name ?? ""}`.trim(),
    department: toTitleCase(candidate.medical_industry) ?? "—",
    role: specialty,
    exp: "—",
    rating: Number(candidate.completion_percentage ?? 0) / 20,
    score: candidate.highest_job_interview_score ?? candidate.highest_interview_score ?? 0,
    distance: [candidate.city, candidate.state].filter(Boolean).join(", ") || "N/A",
    online: false,
    avatar: candidate.profile_image_url ?? "/icon/card-doctor.svg",
  };
}

export function formatTime(value?: string | null) {
  if (!value) {
    return null;
  }

  const [hours, minutes] = value.split(":").map(Number);
  return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${hours >= 12 ? "pm" : "am"}`;
}

export function calcShiftHours(checkIn?: string | null, checkOut?: string | null) {
  if (!checkIn || !checkOut) {
    return "";
  }

  const [inHours, inMinutes] = checkIn.split(":").map(Number);
  const [outHours, outMinutes] = checkOut.split(":").map(Number);

  let totalMinutes = outHours * 60 + outMinutes - (inHours * 60 + inMinutes);
  if (totalMinutes < 0) {
    totalMinutes += 1440;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes > 0 ? `Total ${hours}h ${minutes}m Shift` : `Total ${hours} Hours Shift`;
}

export function formatJobDate(value?: string | null) {
  if (!value) {
    return "N/A";
  }

  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function getCountdown(dateStr?: string | null) {
  if (!dateStr) {
    return "";
  }

  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) {
    return "Already Started";
  }

  const days = Math.floor(diff / 86400000);
  if (days > 0) {
    return `Starts in ${days} Day${days > 1 ? "s" : ""}`;
  }

  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  return `Starts in ${hours}:${String(minutes).padStart(2, "0")}:00 hrs`;
}

export function getProvinceLabel(province?: string | null) {
  const provinceSnake = convertProvinceToFrontend(province);
  return provinces.find((item) => item.value === provinceSnake)?.label ?? province ?? "";
}

export function getStatusLabel(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export function getInitialInterviewQuestions(job: JobBackendResponse): string[] {
  if (!job.normalJob?.questions) {
    return [];
  }

  return Object.values(job.normalJob.questions as Record<string, { questions: string[] }>)
    .flatMap((topic) => topic.questions ?? []);
}

export function getVisibleCountRange(page: number, limit: number, total: number) {
  return {
    start: Math.min((page - 1) * limit + 1, total),
    end: Math.min(page * limit, total),
  };
}

export function buildTablePages(totalPages: number): Array<number | "..."> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  return [1, 2, 3, "...", totalPages - 2, totalPages - 1, totalPages];
}

export function buildKanbanPages(totalPages: number): number[] {
  return Array.from({ length: Math.min(totalPages, 5) }, (_, index) => index + 1);
}

export function LocIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#F4781B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function ClockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#F4781B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

export function DollarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#F4781B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

export function LayersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F4781B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

export function TimerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F4781B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

export function CalIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F4781B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
