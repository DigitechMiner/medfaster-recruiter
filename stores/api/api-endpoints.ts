// stores/api/api-endpoints.ts
export const ENDPOINTS = {
  // Recruiter Auth
  RECRUITER_SEND_OTP: '/recruiter/send-otp',
  RECRUITER_VALIDATE_OTP: '/recruiter/validate-otp',
  RECRUITER_LOGOUT: '/recruiter/logout',

  // Recruiter Profile
  RECRUITER_PROFILE: '/recruiter/profile',
  RECRUITER_PROFILE_UPDATE: '/recruiter/profile',
  RECRUITER_REGISTER: "/recruiter/register",

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

  RECRUITER_DASHBOARD:            '/recruiter/dashboard',

  CANDIDATES_LIST:                '/recruiter/candidates',
  JOB_APPLICATION_STATUS:         (id: string) => `/recruiter/job-applications/${id}/status`,


  WALLET:                         '/recruiter/wallet',
  WALLET_PAY:                     '/recruiter/wallet/pay',
  WALLET_TOPUPS:                  '/recruiter/wallet/topups',
  WALLET_TRANSACTIONS:            '/recruiter/wallet/transactions',

  
  VERIFY_CREDENTIAL_SEND_OTP:     '/recruiter/verify-credential/send-otp',
  VERIFY_CREDENTIAL_VALIDATE_OTP: '/recruiter/verify-credential/validate-otp',


  // Add these to ENDPOINTS
JOBS_FEES:                '/recruiter/jobs/fees',
GENERATE_JOB_QUESTIONS:   '/recruiter/jobs/generate-questions',
JOB_PREVIEW:              (id: string) => `/recruiter/jobs/${id}/preview`,
COMMON_DEPARTMENTS:       '/common/departments_job_titles',
COMMON_SPECIALIZATIONS:   '/common/specializations',

} as const;
