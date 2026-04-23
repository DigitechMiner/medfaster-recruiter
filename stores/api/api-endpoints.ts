export const ENDPOINTS = {
  // Recruiter Auth
  RECRUITER_SEND_OTP:              '/recruiter/send-otp',
  RECRUITER_VALIDATE_OTP:          '/recruiter/validate-otp',
  RECRUITER_LOGOUT:                '/recruiter/logout',

  // Recruiter Profile
  RECRUITER_PROFILE:               '/recruiter/profile',
  RECRUITER_PROFILE_UPDATE:        '/recruiter/profile',
  RECRUITER_REGISTER:              '/recruiter/register',

  // Jobs CRUD
  JOBS_LIST:                       '/recruiter/jobs',
  JOBS_CREATE:                     '/recruiter/jobs',
  JOBS_DETAIL:                     (id: string) => `/recruiter/jobs/${id}`,
  JOBS_UPDATE:                     (id: string) => `/recruiter/jobs/${id}`,
  JOBS_DELETE:                     (id: string) => `/recruiter/jobs/${id}`,
  GENERATE_JOB_DESCRIPTION:        '/recruiter/jobs/generate-description',
  GENERATE_JOB_QUESTIONS:          '/recruiter/jobs/generate-questions',
  JOBS_FEES:                       '/recruiter/jobs/fees',
  JOB_PREVIEW:                     (id: string) => `/recruiter/jobs/${id}/preview`,

  // Jobs Summary & Calendar (new)
  JOBS_SUMMARY:                    '/recruiter/jobs/summary',
  JOBS_CALENDAR:                   '/recruiter/jobs/calendar',

  // Job Applications & Candidates
  JOB_APPLICATIONS:                '/recruiter/job-applications',
  JOB_APPLICATION_STATUS:          (id: string) => `/recruiter/job-applications/${id}/status`,
  CANDIDATE_DETAILS:               (id: string) => `/recruiter/candidates/${id}`,
  CANDIDATES_LIST:                 '/recruiter/candidates',

  // Candidates Summary, Detail, Invite (new)
  CANDIDATES_SUMMARY:              '/recruiter/candidates/summary',
  CANDIDATES_LIST_V1:              '/recruiter/candidates',
  CANDIDATE_DETAIL_V1:             (id: string) => `/v1/recruiter/candidates/${id}`,
  CANDIDATE_INVITE:                '/recruiter/candidates/invite',

  // Notifications (new)
  NOTIFICATIONS:                   '/recruiter/notifications',

  // Interview Requests
  INTERVIEW_REQUESTS:              '/recruiter/interview-requests',
  INTERVIEW_REQUEST_CANCEL:        (id: string) => `/recruiter/interview-requests/${id}/cancel`,

  // Interview Viewing (VAPI)
  RECRUITER_INTERVIEW_DETAILS:     (interviewId: string) => `/recruiter/interviews/${interviewId}`,
  RECRUITER_CANDIDATE_INTERVIEWS:  (candidateId: string) => `/recruiter/candidates/${candidateId}/interviews`,
  RECRUITER_BOOKING_INTERVIEWS:    (bookingId: string) => `/recruiter/bookings/${bookingId}/interviews`,

  // Chat
  CHAT_CONVERSATIONS:              '/chat/conversations',
  CHAT_CONVERSATION_MESSAGES:      (conversationId: string) => `/chat/conversation/${conversationId}/messages`,
  CHAT_SEND_MESSAGE:               '/chat/message',
  CHAT_CREATE_OR_GET:              '/chat/conversation',

  // Dashboard
  RECRUITER_DASHBOARD:             '/recruiter/dashboard',

  // Wallet
  WALLET:                          '/recruiter/wallet',
  WALLET_PAY:                      '/recruiter/wallet/pay',
  WALLET_TOPUPS:                   '/recruiter/wallet/topups',
  WALLET_TRANSACTIONS:             '/recruiter/wallet/transactions',

  // Credential Verification
  VERIFY_CREDENTIAL_SEND_OTP:      '/recruiter/verify-credential/send-otp',
  VERIFY_CREDENTIAL_VALIDATE_OTP:  '/recruiter/verify-credential/validate-otp',

  // Common
  COMMON_METADATA:                  '/common/metadata',
  COMMON_DEPARTMENTS:               '/common/departments-job-titles',     // ✅ hyphen, not underscore
  COMMON_SPECIALIZATIONS:           '/common/specializations',
  COMMON_FCM_REGISTER:              '/common/notifications/register',
  COMMON_DEVICE_ACTIVE:             '/common/notifications/device/active',
  COMMON_NOTIFICATIONS:             '/common/notifications',
} as const;