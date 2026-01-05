export const ENDPOINTS = {
  // Recruiter Auth
  RECRUITER_SEND_OTP: '/recruiter/send-otp',
  RECRUITER_VALIDATE_OTP: '/recruiter/validate-otp',

  // Recruiter Profile
  RECRUITER_PROFILE: '/recruiter/profile',
  RECRUITER_LOGOUT: '/recruiter/logout',

  // Jobs CRUD
  JOBS_LIST: '/recruiter/jobs',
  JOBS_CREATE: '/recruiter/jobs',
  JOBS_DETAIL: (id: string) => `/recruiter/jobs/${id}`,
  JOBS_UPDATE: (id: string) => `/recruiter/jobs/${id}`,
  JOBS_DELETE: (id: string) => `/recruiter/jobs/${id}`,

// AI Job Description
  GENERATE_JOB_DESCRIPTION: '/recruiter/jobs/generate-description',
  // Chat
  CHAT_CONVERSATIONS: '/chat/conversations',
  CHAT_CONVERSATION_MESSAGES: (conversationId: string) =>
    `/chat/conversation/${conversationId}/messages`,
  CHAT_SEND_MESSAGE: '/chat/message',
  CHAT_CREATE_OR_GET: '/chat/conversation',

   // Interview Requests
  RECRUITER_INTERVIEW_REQUESTS: '/recruiter/interview-requests',
  RECRUITER_INTERVIEW_REQUEST_CANCEL: (id: string) =>
    `/recruiter/interview-requests/${id}/cancel`,
} as const;
