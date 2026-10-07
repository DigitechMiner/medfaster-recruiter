export const SUPPORT_ISSUE_TYPES = [
  { value: "creating_urgent_jobs", label: "Creating Urgent Jobs" },
  { value: "jobs", label: "Jobs" },
  { value: "wallet", label: "Wallet" },
  { value: "profile", label: "Profile" },
  { value: "documents", label: "Documents" },
  { value: "other", label: "Other" },
] as const;

export type SupportIssueType = (typeof SUPPORT_ISSUE_TYPES)[number]["value"];

export const SUPPORT_STATUSES = [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
] as const;

export type SupportTicketStatus = (typeof SUPPORT_STATUSES)[number];

export const SUPPORT_STATUS_LABELS: Record<SupportTicketStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

export const SUPPORT_TITLE_MIN = 3;
export const SUPPORT_TITLE_MAX = 200;
export const SUPPORT_DESCRIPTION_MIN = 10;
export const SUPPORT_DESCRIPTION_MAX = 2000;
export const SUPPORT_MAX_FILES = 3;
export const SUPPORT_MAX_FILE_BYTES = 5 * 1024 * 1024;

export interface SupportAttachment {
  id: string;
  file_name: string;
  mime_type: string;
  file_size: number;
  file_url: string;
  created_at: string;
}

export interface SupportTicket {
  id: string;
  ticket_number: string;
  platform: "RECRUITER";
  issue_type: SupportIssueType;
  title: string;
  description: string;
  status: SupportTicketStatus;
  admin_note: string | null;
  resolved_at: string | null;
  attachment_count?: number;
  attachments?: SupportAttachment[];
  created_at: string;
  updated_at: string;
}

export interface SupportTicketList {
  tickets: SupportTicket[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface CreateSupportTicketInput {
  issue_type: SupportIssueType;
  title: string;
  description: string;
  documents?: File[];
}

export interface ListSupportTicketsParams {
  status?: SupportTicketStatus;
  page?: number;
  limit?: number;
  offset?: number;
}

export function supportIssueLabel(issueType: string): string {
  return (
    SUPPORT_ISSUE_TYPES.find((item) => item.value === issueType)?.label ??
    issueType
  );
}

export function supportStatusLabel(status: string): string {
  if (status in SUPPORT_STATUS_LABELS) {
    return SUPPORT_STATUS_LABELS[status as SupportTicketStatus];
  }
  return status;
}
