import { axiosInstance } from "@/stores/api/api-client";
import { ENDPOINTS } from "@/stores/api/api-endpoints";
import { extractData } from "@/stores/api/response-helpers";

import type {
  CreateSupportTicketInput,
  ListSupportTicketsParams,
  SupportTicket,
  SupportTicketList,
} from "./types";

const multipartHeaders = {
  headers: { "Content-Type": "multipart/form-data" },
} as const;

export async function listSupportTickets(
  params?: ListSupportTicketsParams,
): Promise<SupportTicketList> {
  const res = await axiosInstance.get(ENDPOINTS.SUPPORT_TICKETS, { params });
  return extractData<SupportTicketList>(res.data);
}

export async function getSupportTicket(ticketId: string): Promise<SupportTicket> {
  const res = await axiosInstance.get(ENDPOINTS.SUPPORT_TICKET(ticketId));
  return extractData<SupportTicket>(res.data);
}

export async function createSupportTicket(
  input: CreateSupportTicketInput,
): Promise<SupportTicket> {
  const documents = input.documents ?? [];
  const fields = {
    issue_type: input.issue_type,
    title: input.title,
    description: input.description,
  };

  if (documents.length === 0) {
    const res = await axiosInstance.post(ENDPOINTS.SUPPORT_TICKETS, fields);
    return extractData<SupportTicket>(res.data);
  }

  const formData = new FormData();
  formData.append("issue_type", fields.issue_type);
  formData.append("title", fields.title);
  formData.append("description", fields.description);
  for (const file of documents) {
    formData.append("documents", file);
  }

  const res = await axiosInstance.post(
    ENDPOINTS.SUPPORT_TICKETS,
    formData,
    multipartHeaders,
  );
  return extractData<SupportTicket>(res.data);
}
