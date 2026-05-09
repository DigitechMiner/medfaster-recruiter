import type { ChatMessage, Conversation } from "./types";

export const AVATAR_COLORS = [
  "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300",
  "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300",
  "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
  "bg-teal-100 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300",
  "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
  "bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300",
  "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300",
  "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300",
];

export const getAvatarColor = (id: string) =>
  AVATAR_COLORS[id.charCodeAt(id.length - 1) % AVATAR_COLORS.length];

export const getCandidateName = (conv: Conversation) => {
  if (conv.candidate?.first_name || conv.candidate?.last_name)
    return `${conv.candidate.first_name ?? ""} ${conv.candidate.last_name ?? ""}`.trim();
  return conv.candidate?.email ?? "Candidate";
};

export const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

export const formatTime = (dateStr: string | null) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatDateLabel = (dateStr: string | null) => {
  if (!dateStr) return "Today";
  const d = new Date(dateStr);
  if (d.toDateString() === new Date().toDateString()) return "Today";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

/** Stable fallback keys when the API omits message id (avoids Math.random remount churn). */
let normalizeMessageIdSeq = 0;

export function normalizeMessage(
  raw: Record<string, unknown>,
  currentRecruiterId: string,
): ChatMessage {
  const senderId = (raw.sender_id ?? raw.senderId ?? raw.recruiter_id ?? "") as string;
  const isVoice =
    ((raw.message_type ?? raw.type ?? "text") as string) === "voice";
  const sentAt = (raw.sent_at ?? raw.created_at ?? raw.createdAt ?? null) as string | null;
  const body = ((raw.message ?? raw.text ?? raw.content ?? "") as string).trim();
  return {
    id: (raw.id ?? raw.message_id ?? `msg-fallback-${++normalizeMessageIdSeq}`) as string,
    direction: senderId === currentRecruiterId ? "sent" : "received",
    text: isVoice ? body || "Voice message" : body,
    time: sentAt
      ? new Date(sentAt).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      : new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
  };
}
