// No "use client" directive — safe for server imports.

import { axiosInstance } from "@/stores/api/api-client";
import { ENDPOINTS } from "@/stores/api/api-endpoints";
import { extractData } from "@/stores/api/response-helpers";
import { getRecruiterProfile } from "@/features/profile/api";

import type { ChatConversationRow, ChatMessageRow } from "./types";

export async function fetchChatConversations(): Promise<ChatConversationRow[]> {
  const res = await axiosInstance.get(ENDPOINTS.CHAT_CONVERSATIONS);
  const data = extractData<{ conversations?: unknown[] } | unknown[]>(res.data);

  // Handle both: data[] directly OR data.conversations[]
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && "conversations" in data) {
    return (data as { conversations: unknown[] }).conversations ?? [];
  }
  return [];
}

export async function fetchChatMessages(conversationId: string): Promise<ChatMessageRow[]> {
  const res = await axiosInstance.get(
    ENDPOINTS.CHAT_MESSAGES(conversationId),
  );
  const data = extractData<{ messages?: unknown[] } | unknown[]>(res.data);

  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && "messages" in data) {
    return (data as { messages: unknown[] }).messages ?? [];
  }
  return [];
}

export async function sendChatMessage(
  conversationId: string,
  text: string,
  messageType: "text" | "voice" = "text",
  fileUrl?: string,
  fileName?: string,
) {
  const res = await axiosInstance.post(ENDPOINTS.CHAT_SEND_MESSAGE, {
    conversationId,
    message: text,
    messageType,
    ...(fileUrl && { fileUrl }),
    ...(fileName && { fileName }),
  });
  return extractData(res.data);
}

export async function editChatMessage(messageId: string, message: string) {
  const res = await axiosInstance.put(
    `${ENDPOINTS.CHAT_SEND_MESSAGE}/${messageId}`,
    { message },
  );
  return extractData(res.data);
}

export async function deleteChatMessage(messageId: string) {
  const res = await axiosInstance.delete(
    `${ENDPOINTS.CHAT_SEND_MESSAGE}/${messageId}`,
  );
  return extractData(res.data);
}

export async function createOrGetChatConversation(candidateId: string) {
  const profile = await getRecruiterProfile();
  const res = await axiosInstance.post(ENDPOINTS.CHAT_CREATE_OR_GET, {
    recruiterId: profile.id,
    candidateId,
  });
  return extractData(res.data);
}
