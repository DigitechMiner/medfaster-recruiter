export const ENDPOINTS = {
  // ── Auth ───────────────────────────────────────────────────────────────────
  RECRUITER_SEND_OTP:             '/recruiter/send-otp',
  RECRUITER_VALIDATE_OTP:         '/recruiter/validate-otp',
  RECRUITER_LOGOUT:               '/recruiter/logout',

  // ── Profile ────────────────────────────────────────────────────────────────
  RECRUITER_PROFILE:              '/recruiter/profile',
  RECRUITER_PROFILE_UPDATE:              '/recruiter/profile',
  RECRUITER_REGISTER:             '/recruiter/register',

  // ── Jobs ───────────────────────────────────────────────────────────────────
  JOBS_LIST:                      '/recruiter/jobs',
  JOBS_CREATE:                    '/recruiter/jobs',
  JOBS_DETAIL:                    (id: string) => `/recruiter/jobs/${id}`,
  JOBS_UPDATE:                    (id: string) => `/recruiter/jobs/${id}`,
  JOBS_DELETE:                    (id: string) => `/recruiter/jobs/${id}`,
  JOBS_SUMMARY:                   '/recruiter/jobs/summary',
  JOBS_CALENDAR:                  '/recruiter/jobs/calendar',
  JOBS_FEE_PREVIEW:               '/recruiter/jobs/preview',
  JOBS_FEES:                      (jobTitle: string) => `/recruiter/jobs/fees/${jobTitle}`,
  GENERATE_JOB_DESCRIPTION:       '/recruiter/jobs/generate-description',
  GENERATE_JOB_QUESTIONS:         '/recruiter/jobs/generate-questions',

  // ── Job Applications ───────────────────────────────────────────────────────
  JOB_APPLICATIONS:               '/recruiter/job-applications',
  JOB_APPLICATION_STATUS:         (id: string) => `/recruiter/job-applications/${id}/status`,

  // ── Candidates ─────────────────────────────────────────────────────────────
  CANDIDATES_LIST:                '/recruiter/candidates',
  CANDIDATES_SUMMARY:             '/recruiter/candidates/summary',
  CANDIDATE_DETAIL:               (id: string) => `/recruiter/candidates/${id}`,
  CANDIDATE_DOCUMENT_SIGNED_URL:  (candidateId: string, docId: string) =>
                                    `/recruiter/candidates/${candidateId}/documents/${docId}/url`,
  CANDIDATE_INVITE:  '/recruiter/job-applications/invite',

  // ── In-House Candidates ────────────────────────────────────────────────────
  INHOUSE_CANDIDATES:             '/recruiter/in-house-candidates',
  INHOUSE_INVITE:                 '/recruiter/in-house-candidates/invite',

  // ── Interview Requests ─────────────────────────────────────────────────────
  INTERVIEW_REQUESTS:             '/recruiter/interview-requests',
  INTERVIEW_REQUEST_CANCEL:       (id: string) => `/recruiter/interview-requests/${id}/cancel`,
  RECRUITER_INTERVIEW_DETAILS:    (interviewId: string) => `/recruiter/interviews/${interviewId}`,
  RECRUITER_CANDIDATE_INTERVIEWS: (candidateId: string) => `/recruiter/candidates/${candidateId}/interviews`,
  RECRUITER_BOOKING_INTERVIEWS:   (bookingId: string) => `/recruiter/bookings/${bookingId}/interviews`,

  // ── Chat ───────────────────────────────────────────────────────────────────
  CHAT_CONVERSATIONS:             '/chat/conversations',
  CHAT_MESSAGES:                  (conversationId: string) => `/chat/conversation/${conversationId}/messages`,
  CHAT_SEND_MESSAGE:              '/chat/message',
  CHAT_CREATE_OR_GET:             '/chat/conversation',

  // ── Dashboard ──────────────────────────────────────────────────────────────
  RECRUITER_DASHBOARD:            '/recruiter/dashboard',

  // ── Wallet ─────────────────────────────────────────────────────────────────
  WALLET:                         '/recruiter/wallet',
  WALLET_PAY:                     '/recruiter/wallet/pay',
  WALLET_TOPUPS:                  '/recruiter/wallet/topups',
  WALLET_TRANSACTIONS:            '/recruiter/wallet/transactions',

  // ── Credential Verification ────────────────────────────────────────────────
  VERIFY_CREDENTIAL_SEND_OTP:     '/recruiter/verify-credential/send-otp',
  VERIFY_CREDENTIAL_VALIDATE_OTP: '/recruiter/verify-credential/validate-otp',
  RECRUITER_CREDENTIAL:           '/recruiter/credential',

  // ── Notifications ──────────────────────────────────────────────────────────
  NOTIFICATIONS:                  '/recruiter/notifications',

  // ── Common / Metadata ──────────────────────────────────────────────────────
  COMMON_METADATA:                '/common/metadata',
  COMMON_DEPARTMENTS:             '/common/departments-job-titles',
  COMMON_SPECIALIZATIONS:         '/common/specializations',   // use to map specialization IDs → labels
  COMMON_FCM_REGISTER:            '/common/notifications/register',
  COMMON_DEVICE_ACTIVE:           '/common/notifications/device/active',
  COMMON_NOTIFICATIONS:           '/common/notifications',
} as const;