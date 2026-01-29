// stores/api/api-endpoints.ts
export const ENDPOINTS = {
  // Recruiter Auth
  RECRUITER_SEND_OTP: '/recruiter/send-otp',
  RECRUITER_VALIDATE_OTP: '/recruiter/validate-otp',
  RECRUITER_LOGOUT: '/recruiter/logout',

  // Recruiter Profile
  RECRUITER_PROFILE: '/recruiter/profile',
  RECRUITER_PROFILE_UPDATE: '/recruiter/profile',

  // Jobs CRUD
  JOBS_LIST: '/recruiter/jobs',
  JOBS_CREATE: '/recruiter/jobs',
  JOBS_DETAIL: (id: string) => `/recruiter/jobs/${id}`,
  JOBS_UPDATE: (id: string) => `/recruiter/jobs/${id}`,
  JOBS_DELETE: (id: string) => `/recruiter/jobs/${id}`,
  GENERATE_JOB_DESCRIPTION: '/recruiter/jobs/generate-description',

  // Job Applications & Candidates
  JOB_APPLICATIONS: '/recruiter/job-applications',
  CANDIDATE_DETAILS: (id: string) => `/recruiter/candidates/${id}`,

  // Interview Requests
  INTERVIEW_REQUESTS: '/recruiter/interview-requests',
  INTERVIEW_REQUEST_CANCEL: (id: string) => `/recruiter/interview-requests/${id}/cancel`,

  // ✅ NEW: Interview Viewing (for VAPI integration)
  RECRUITER_INTERVIEW_DETAILS: (interviewId: string) => `/recruiter/interviews/${interviewId}`,
  RECRUITER_CANDIDATE_INTERVIEWS: (candidateId: string) => `/recruiter/candidates/${candidateId}/interviews`,
  RECRUITER_BOOKING_INTERVIEWS: (bookingId: string) => `/recruiter/bookings/${bookingId}/interviews`,

  // Chat
  CHAT_CONVERSATIONS: '/chat/conversations',
  CHAT_CONVERSATION_MESSAGES: (conversationId: string) => `/chat/conversation/${conversationId}/messages`,
  CHAT_SEND_MESSAGE: '/chat/message',
  CHAT_CREATE_OR_GET: '/chat/conversation',
} as const;
