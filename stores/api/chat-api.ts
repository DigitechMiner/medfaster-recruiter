// No "use client" directive ✅

import { axiosInstance } from "./api-client";
import { ENDPOINTS } from "./api-endpoints";
import { getRecruiterProfile } from "./recruiter-api";

const extractData = <T>(payload: unknown): T => (payload as { data: T }).data;

export async function fetchChatConversations() {
  const res = await axiosInstance.get(ENDPOINTS.CHAT_CONVERSATIONS);
  return extractData(res.data);
}

export async function fetchChatMessages(conversationId: string) {
  const res = await axiosInstance.get(
    ENDPOINTS.CHAT_MESSAGES(conversationId)   // ✅ was CHAT_CONVERSATIONS
  );
  return extractData(res.data);
}

export async function sendChatMessage(conversationId: string, text: string) {
  const res = await axiosInstance.post(ENDPOINTS.CHAT_SEND_MESSAGE, {
    conversationId,
    message: text,
  });
  return extractData(res.data);
}

export async function editChatMessage(messageId: string, message: string) {
  const res = await axiosInstance.put(
    `${ENDPOINTS.CHAT_SEND_MESSAGE}/${messageId}`,
    { message }
  );
  return extractData(res.data);
}

export async function deleteChatMessage(messageId: string) {
  const res = await axiosInstance.delete(
    `${ENDPOINTS.CHAT_SEND_MESSAGE}/${messageId}`
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