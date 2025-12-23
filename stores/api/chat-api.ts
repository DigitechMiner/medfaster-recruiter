"use client";

import { axiosInstance } from "./api-client";
import { ENDPOINTS } from "./api-endpoints";
import { getRecruiterProfile } from "./recruiter-api";

export async function fetchChatConversations() {
  const res = await axiosInstance.get(ENDPOINTS.CHAT_CONVERSATIONS);
  return (res.data as any).data;
}

export async function fetchChatMessages(conversationId: string) {
  const res = await axiosInstance.get(
    ENDPOINTS.CHAT_CONVERSATION_MESSAGES(conversationId)
  );
  return (res.data as any).data;
}

export async function sendChatMessage(conversationId: string, text: string) {
  const res = await axiosInstance.post(ENDPOINTS.CHAT_SEND_MESSAGE, {
    conversationId,
    message: text,
  });
  return (res.data as any).data;
}

// ✅ FIXED - Use ENDPOINTS constant
export async function createOrGetChatConversation(candidateId: string) {
  const profile = await getRecruiterProfile();
  const res = await axiosInstance.post(ENDPOINTS.CHAT_CREATE_OR_GET, {  // ✅ Changed here
    recruiterId: profile.id,
    candidateId: candidateId,
  });
  return (res.data as any).data;
}
