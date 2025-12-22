"use client";

import { axiosInstance } from "./api-client";
import { ENDPOINTS } from "./api-endpoints";

export async function fetchChatConversations() {
  const res = await axiosInstance.get(ENDPOINTS.CHAT_CONVERSATIONS);
  return (res.data as any).data; // array of ChatConversation
}

export async function fetchChatMessages(conversationId: string) {
  const res = await axiosInstance.get(
    ENDPOINTS.CHAT_CONVERSATION_MESSAGES(conversationId)
  );
  return (res.data as any).data; // { messages, pagination }
}

export async function sendChatMessage(conversationId: string, text: string) {
  const res = await axiosInstance.post(ENDPOINTS.CHAT_SEND_MESSAGE, {
    conversationId,
    message: text,
  });
  return (res.data as any).data; // ChatMessage
}
