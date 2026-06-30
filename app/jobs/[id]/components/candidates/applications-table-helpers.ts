import type { ApplicationStatus } from "@/types";
import { formatLabel } from "../shared/job-detail-helpers";

export const EMPTY_DISPLAY = "-";

const SHIFT_META: Record<string, { letter: string; label: string }> = {
  MORNING: { letter: "M", label: "Morning" },
  EVENING: { letter: "E", label: "Evening" },
  NIGHT: { letter: "N", label: "Night" },
  GENERAL: { letter: "G", label: "General" },
};

const STATUS_BADGE_CLASS: Record<string, string> = {
  APPLIED: "bg-slate-100 text-slate-700 border border-slate-200",
  SHORTLISTED: "bg-orange-100 text-orange-800 border border-orange-200",
  INTERVIEWING: "bg-violet-100 text-violet-800 border border-violet-200",
  INTERVIEWED: "bg-sky-100 text-sky-800 border border-sky-200",
  REJECTED: "bg-red-100 text-red-800 border border-red-200",
  WITHDRAWN: "bg-red-50 text-red-600 border border-red-100",
  CANCELLED: "bg-red-50 text-red-600 border border-red-100",
  HIRE: "bg-blue-100 text-blue-800 border border-blue-200",
  ACCEPTED: "bg-emerald-100 text-emerald-800 border border-emerald-200",
};

const SHIFT_BADGE_CLASS: Record<string, string> = {
  MORNING: "bg-amber-50 text-amber-800 border-amber-200",
  EVENING: "bg-orange-50 text-orange-800 border-orange-200",
  NIGHT: "bg-indigo-50 text-indigo-800 border-indigo-200",
  GENERAL: "bg-gray-50 text-gray-600 border-gray-200",
};

export function getShiftMeta(shift: string) {
  const key = shift.trim().toUpperCase();
  if (SHIFT_META[key]) return SHIFT_META[key];
  const label = formatLabel(shift);
  return { letter: label.charAt(0).toUpperCase(), label };
}

export function formatEligibilityLabel(eligibility?: string | null) {
  if (!eligibility) return EMPTY_DISPLAY;
  return formatLabel(eligibility);
}

export function formatCandidateLocation(
  city?: string | null,
  state?: string | null,
) {
  const parts = [city, state]
    .filter(Boolean)
    .map((value) => formatLabel(value!));
  return parts.length > 0 ? parts.join(", ") : EMPTY_DISPLAY;
}

export function formatExperienceCompact(
  experience?: string | null,
  experienceMonths?: number | null,
) {
  if (experienceMonths != null && experienceMonths >= 0) {
    const years = Math.floor(experienceMonths / 12);
    const months = experienceMonths % 12;
    if (years === 0) return `${months}m`;
    if (months === 0) return `${years}y`;
    return `${years}y ${months}m`;
  }

  if (!experience?.trim()) return EMPTY_DISPLAY;

  const yearMatch = experience.match(/(\d+)\s*(?:years?|yrs?|y)\b/i);
  const monthMatch = experience.match(/(\d+)\s*(?:months?|mos?|m)\b/i);
  if (yearMatch || monthMatch) {
    const years = yearMatch ? Number(yearMatch[1]) : 0;
    const months = monthMatch ? Number(monthMatch[1]) : 0;
    if (years === 0 && months === 0) return experience;
    if (years === 0) return `${months}m`;
    if (months === 0) return `${years}y`;
    return `${years}y ${months}m`;
  }

  return experience;
}

export function formatAppliedDate(value?: string | null) {
  if (!value) return { short: EMPTY_DISPLAY, full: "" };
  const date = new Date(value);
  const short = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
  const full = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return { short, full };
}

export function formatScoreDisplay(
  score: number | null | undefined,
  status: ApplicationStatus,
) {
  if (score != null) return String(score);
  if (["APPLIED", "SHORTLISTED", "INTERVIEWING"].includes(status)) {
    return "Pending";
  }
  return EMPTY_DISPLAY;
}

export function getShiftBadgeClass(shift: string) {
  const key = shift.trim().toUpperCase();
  return SHIFT_BADGE_CLASS[key] ?? "bg-gray-50 text-gray-600 border-gray-200";
}

export function getApplicationStatusBadgeClass(status: string) {
  return (
    STATUS_BADGE_CLASS[status.toUpperCase()] ??
    "bg-gray-100 text-gray-600 border border-gray-200"
  );
}
