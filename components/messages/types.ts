export interface Conversation {
  id: string;
  recruiter_id: string;
  candidate_id: string;
  last_message: string | null;
  last_message_at: string | null;
  recruiter_unread_count: number;
  starred?: boolean;
  candidate?: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  };
}

export interface ChatMessage {
  id: string;
  text?: string;
  type: "text" | "voice";
  direction: "sent" | "received";
  time: string;
  duration?: string;
}

// ── Shared helpers ─────────────────────────────────────────────────────────

export const AVATAR_COLORS = [
  "bg-rose-100 text-rose-700",
  "bg-purple-100 text-purple-700",
  "bg-blue-100 text-blue-700",
  "bg-teal-100 text-teal-700",
  "bg-amber-100 text-amber-700",
  "bg-orange-100 text-orange-700",
  "bg-green-100 text-green-700",
  "bg-indigo-100 text-indigo-700",
];

export const getAvatarColor = (id: string) =>
  AVATAR_COLORS[id.charCodeAt(id.length - 1) % AVATAR_COLORS.length];

export const getCandidateName = (conv: Conversation) => {
  if (conv.candidate?.first_name || conv.candidate?.last_name)
    return `${conv.candidate.first_name ?? ""} ${conv.candidate.last_name ?? ""}`.trim();
  return conv.candidate?.email ?? "Candidate";
};

export const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

export const formatTime = (dateStr: string | null) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
};

export const formatDateLabel = (dateStr: string | null) => {
  if (!dateStr) return "Today";
  const d = new Date(dateStr);
  if (d.toDateString() === new Date().toDateString()) return "Today";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

export function normalizeMessage(
  raw: Record<string, unknown>,
  currentRecruiterId: string
): ChatMessage {
  const senderId = (raw.sender_id ?? raw.senderId ?? raw.recruiter_id ?? "") as string;
  const isVoice  = ((raw.message_type ?? raw.type ?? "text") as string) === "voice";
  const sentAt   = (raw.sent_at ?? raw.created_at ?? raw.createdAt ?? null) as string | null;
  return {
    id:        (raw.id ?? raw.message_id ?? `msg-${Math.random()}`) as string,
    type:      isVoice ? "voice" : "text",
    direction: senderId === currentRecruiterId ? "sent" : "received",
    text:      isVoice ? undefined : ((raw.message ?? raw.text ?? raw.content ?? "") as string),
    duration:  isVoice ? ((raw.duration ?? "0:00") as string) : undefined,
    time:      sentAt
      ? new Date(sentAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
      : new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
  };
}