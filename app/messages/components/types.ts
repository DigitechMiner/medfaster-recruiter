export interface Conversation {
  id: string;
  recruiter_id: string;
  candidate_id: string;
  last_message: string | null;
  last_message_at: string | null;
  recruiter_unread_count: number;
  candidate?: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  };
}

export interface ChatMessage {
  id: string;
  text: string;
  direction: "sent" | "received";
  time: string;
}
