import type { JobStatus } from "@/Interface/recruiter.types";

// ✅ JobStatus = DRAFT | OPEN | PAUSED | UPCOMING | ACTIVE | COMPLETED | CLOSED
// Keep it for job-level badge mapping only

// ✅ PipelineStatus = the candidate pipeline — completely separate concept
export type PipelineStatus = "applied" | "interviewing" | "hired";

export type BadgeColor = "green" | "yellow" | "red" | "gray" | "blue" | "orange";

// ── Job-level status badges (uses real JobStatus) ─────────────────────────────
export const JOB_STATUS_BADGE_MAP: Record<JobStatus, BadgeColor> = {
  DRAFT:     "gray",
  OPEN:      "green",
  PAUSED:    "yellow",
  UPCOMING:  "blue",
  ACTIVE:    "green",
  COMPLETED: "orange",
  CLOSED:    "red",
};

export const JOB_STATUS_LABEL_MAP: Record<JobStatus, string> = {
  DRAFT:     "Draft",
  OPEN:      "Open",
  PAUSED:    "Paused",
  UPCOMING:  "Upcoming",
  ACTIVE:    "Active",
  COMPLETED: "Completed",
  CLOSED:    "Closed",
};

// ── Pipeline status colors (uses PipelineStatus) ──────────────────────────────
export const STATUS_COLORS: Record<PipelineStatus, string> = {
  applied:      "text-blue-600",
  interviewing: "text-red-600",
  hired:        "text-green-600",
};

export const STATUS_SECTION_COLORS: Record<BadgeColor, { border: string; bg: string; dot: string; text: string }> = {
  blue:   { border: "border-blue-200",   bg: "bg-blue-50",   dot: "bg-blue-500",   text: "text-blue-600"   },
  orange: { border: "border-orange-200", bg: "bg-orange-50", dot: "bg-orange-500", text: "text-orange-600" },
  red:    { border: "border-red-200",    bg: "bg-red-50",    dot: "bg-red-500",    text: "text-red-600"    },
  green:  { border: "border-green-200",  bg: "bg-green-50",  dot: "bg-green-500",  text: "text-green-600"  },
  gray:   { border: "border-gray-200",   bg: "bg-gray-50",   dot: "bg-gray-400",   text: "text-gray-600"   },
  yellow: { border: "border-yellow-200", bg: "bg-yellow-50", dot: "bg-yellow-400", text: "text-yellow-600" },
};

export const STATUS_TABLE_COLORS: Record<BadgeColor, { border: string; bg: string; dot: string; text: string; rowTint: string }> = {
  blue:   { border: "border-blue-200",   bg: "bg-blue-50",   dot: "bg-blue-500",   text: "text-blue-600",   rowTint: "bg-blue-50/40"   },
  orange: { border: "border-orange-200", bg: "bg-orange-50", dot: "bg-orange-500", text: "text-orange-600", rowTint: "bg-orange-50/40" },
  red:    { border: "border-red-200",    bg: "bg-red-50",    dot: "bg-red-500",    text: "text-red-600",    rowTint: "bg-red-50/40"    },
  green:  { border: "border-green-200",  bg: "bg-green-50",  dot: "bg-green-500",  text: "text-green-600",  rowTint: "bg-green-50/40"  },
  gray:   { border: "border-gray-200",   bg: "bg-gray-50",   dot: "bg-gray-400",   text: "text-gray-600",   rowTint: "bg-gray-50/40"   },
  yellow: { border: "border-yellow-200", bg: "bg-yellow-50", dot: "bg-yellow-400", text: "text-yellow-600", rowTint: "bg-yellow-50/40" },
};

// ✅ All configs below use PipelineStatus — not JobStatus
export const STATUS_CONFIG: Record<PipelineStatus, { textColor: string; statusLabel: string }> = {
  applied:      { textColor: "text-blue-600",  statusLabel: "Applied"      },
  interviewing: { textColor: "text-red-600",   statusLabel: "Interviewing" },
  hired:        { textColor: "text-green-600", statusLabel: "Hired"        },
};

interface ButtonConfig {
  label:   string;
  style:   string;
  action?: "schedule" | "reject" | "hire";
}

export const JOB_CARD_BUTTON_CONFIGS: Record<PipelineStatus, { label: string; style: string }[]> = {
  applied: [
    { label: "Schedule", style: "text-gray-700 bg-gray-100 rounded border border-gray-300 hover:bg-gray-200" },
    { label: "Hire",     style: "bg-orange-500 text-white rounded hover:bg-orange-600"                       },
  ],
  interviewing: [
    { label: "Interviewing", style: "text-red-600 rounded border border-red-300 bg-red-50 hover:bg-red-100" },
    { label: "Hire",         style: "bg-orange-500 text-white rounded hover:bg-orange-600"                   },
  ],
  hired: [
    { label: "Hired", style: "bg-green-100 text-green-700 rounded border border-green-200" },
  ],
};

export const CANDIDATE_DETAIL_BUTTON_CONFIGS: Record<PipelineStatus, ButtonConfig[]> = {
  applied: [
    { label: "Reject",   style: "border-2 border-red-500 text-red-500 px-6 py-2 hover:bg-red-50 rounded",          action: "reject"   },
    { label: "Schedule", style: "border border-gray-300 text-gray-700 px-6 py-2 hover:bg-gray-50 rounded bg-white", action: "schedule" },
    { label: "Hire",     style: "bg-orange-500 text-white px-6 py-2 hover:bg-orange-600 rounded",                   action: "hire"     },
  ],
  interviewing: [
    { label: "Reject",       style: "border-2 border-red-500 text-red-500 px-6 py-2 hover:bg-red-50 rounded",           action: "reject" },
    { label: "Interviewing", style: "border border-orange-400 text-[#F4781B] px-6 py-2 hover:bg-orange-50 rounded bg-white"             },
    { label: "Hire",         style: "bg-orange-500 text-white px-6 py-2 hover:bg-orange-600 rounded",                   action: "hire"   },
  ],
  hired: [
    { label: "Reject", style: "border-2 border-red-500 text-red-500 px-6 py-2 hover:bg-red-50 rounded",                    action: "reject" },
    { label: "Hired",  style: "bg-green-500 text-white px-6 py-2 hover:bg-green-600 rounded cursor-not-allowed opacity-90"               },
  ],
};

export const CANDIDATE_HERO_BUTTON_CONFIGS: Record<PipelineStatus, { label: string; style: string }[]> = {
  applied: [
    { label: "Reject",    style: "border-2 border-red-500 text-red-500 hover:bg-red-50"    },
    { label: "Schedule",  style: "bg-gray-100 text-gray-700 hover:bg-gray-200"             },
    { label: "Shortlist", style: "bg-orange-500 text-white hover:bg-orange-600"            },
  ],
  interviewing: [
    { label: "Reject",     style: "border-2 border-red-500 text-red-500 hover:bg-red-50" },
    { label: "Reschedule", style: "bg-red-100 text-red-700 hover:bg-red-200"             },
    { label: "Hire",       style: "bg-green-500 text-white hover:bg-green-600"           },
  ],
  hired: [
    { label: "View Offer",     style: "bg-green-100 text-green-700 hover:bg-green-200" },
    { label: "Generate Offer", style: "bg-green-500 text-white hover:bg-green-600"     },
  ],
};

export const PRIMARY_BUTTON_COLOR_CLASSES: Record<"orange" | "red" | "green", string> = {
  orange: "bg-orange-500 hover:bg-orange-600",
  red:    "bg-red-500 hover:bg-red-600",
  green:  "bg-green-500 hover:bg-green-600",
};

// ✅ Re-export StatusType as PipelineStatus for backwards compat
export type StatusType = PipelineStatus;