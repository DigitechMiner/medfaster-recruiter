// No "use client" directive ✅

import { axiosInstance } from "./api-client";
import { ENDPOINTS } from "./api-endpoints";
import { getRecruiterProfile } from "./recruiter-api";

const extractData = <T>(payload: unknown): T => (payload as { data: T }).data;

export async function fetchChatConversations() {
  const res = await axiosInstance.get(ENDPOINTS.CHAT_CONVERSATIONS);
  const data = extractData<{ conversations?: unknown[] } | unknown[]>(res.data);

  // ✅ Handle both: data[] directly OR data.conversations[]
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && "conversations" in data) {
    return (data as { conversations: unknown[] }).conversations ?? [];
  }
  return [];
}

export async function fetchChatMessages(conversationId: string) {
  const res = await axiosInstance.get(
    ENDPOINTS.CHAT_MESSAGES(conversationId)
  );
  const data = extractData<{ messages?: unknown[] } | unknown[]>(res.data);

  // ✅ API returns data.messages[], not data[] directly
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
  fileName?: string
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

export async function uploadChatFile(file: File): Promise<{ fileUrl: string; fileName: string }> {
  const formData = new FormData();
  formData.append("file", file);
  // ✅ Adjust endpoint to whatever your backend uses for file uploads
  const res = await axiosInstance.post("/chat/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return extractData(res.data);
}