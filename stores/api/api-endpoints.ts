/** Centralized REST endpoints for recruiter-portal API calls.
 *  Group headers note the primary feature module or store that consumes them.
 */
export const ENDPOINTS = {
  // -------------------------------------------------------------------------
  // profile api section start
  // -------------------------------------------------------------------------
  // ── Profile · Auth · Credentials — features/profile/api.ts ───────────────
  // Auth (OTP login + logout)
  RECRUITER_SEND_OTP: "/recruiter/send-otp",
  RECRUITER_VALIDATE_OTP: "/recruiter/validate-otp",
  RECRUITER_LOGOUT: "/recruiter/logout",
  // Profile + registration
  RECRUITER_PROFILE: "/recruiter/profile",
  RECRUITER_PROFILE_UPDATE: "/recruiter/profile",
  RECRUITER_REGISTER: "/recruiter/register",
  RECRUITER_DOCUMENT_VIEW: (id: string) => `/recruiter/documents/${id}/view`,
  // Login credential (email/phone) + verification
  RECRUITER_CREDENTIAL: "/recruiter/credential",
  VERIFY_CREDENTIAL_SEND_OTP: "/recruiter/verify-credential/send-otp",
  VERIFY_CREDENTIAL_VALIDATE_OTP: "/recruiter/verify-credential/validate-otp",
  // -------------------------------------------------------------------------
  // profile api section end
  // -------------------------------------------------------------------------

  // -------------------------------------------------------------------------
  // jobs feature api section start — features/jobs/api.ts (jobs, applications, interviews)
  // -------------------------------------------------------------------------
  // ── Job CRUD, calendar, fees, AI helpers ─────────────────────────────────
  JOBS_LIST: "/recruiter/jobs",
  JOBS_CREATE: "/recruiter/jobs",
  JOBS_DETAIL: (id: string) => `/recruiter/jobs/${id}`,
  JOBS_DETAIL_SUMMARY: (id: string) => `/recruiter/jobs/${id}/summary`,
  JOBS_DETAIL_DESCRIPTION: (id: string) => `/recruiter/jobs/${id}/description`,
  JOBS_DETAIL_ACTIVITY: (id: string) => `/recruiter/jobs/${id}/activity`,
  JOBS_DETAIL_PAYMENTS: (id: string) => `/recruiter/jobs/${id}/payments`,
  JOBS_DETAIL_SCHEDULE: (id: string) => `/recruiter/jobs/${id}/schedule`,
  JOBS_DETAIL_WORKERS: (id: string) => `/recruiter/jobs/${id}/workers`,
  JOBS_DETAIL_WORKER: (jobId: string, workerId: string) =>
    `/recruiter/jobs/${jobId}/workers/${workerId}`,
  JOBS_DETAIL_LEAVES: (id: string) => `/recruiter/jobs/${id}/leaves`,
  JOBS_DETAIL_VACANCIES: (id: string) => `/recruiter/jobs/${id}/vacancies`,
  JOBS_DETAIL_REPLACEMENTS: (id: string) => `/recruiter/jobs/${id}/replacements`,
  JOBS_INFO: (id: string) => `/recruiter/jobs/${id}/info`,
  JOBS_UPDATE: (id: string) => `/recruiter/jobs/${id}`,
  JOBS_DELETE: (id: string) => `/recruiter/jobs/${id}`,
  JOBS_DETAIL_APPLICATIONS: (id: string) => `/recruiter/jobs/${id}/applications`,
  JOBS_DETAIL_SHIFTS: (id: string) => `/recruiter/jobs/${id}/shifts`,
  JOBS_DETAIL_WALLET_TRANSACTIONS: (id: string) =>
    `/recruiter/jobs/${id}/wallet-transactions`,
  JOBS_DETAIL_DISPUTES: (id: string) => `/recruiter/jobs/${id}/disputes`,
  JOBS_DETAIL_SHIFT_PAYMENTS: (jobId: string, shiftId: string) =>
    `/recruiter/jobs/${jobId}/shifts/${shiftId}/payments`,
  JOBS_DETAIL_SHIFT_DETAILS: (jobId: string, shiftId: string) =>
    `/recruiter/jobs/${jobId}/shifts/${shiftId}/details`,
  JOBS_SUMMARY: "/recruiter/jobs/summary",
  JOBS_CALENDAR: "/recruiter/jobs/calendar",
  JOBS_FEE_PREVIEW: "/recruiter/jobs/preview",
  JOBS_FEES: (jobTitle: string) => `/recruiter/jobs/fees/${jobTitle}`,
  JOBS_FEES_SUMMARY: "/recruiter/jobs/fees/summary",
  JOBS_TAXES: (province: string) => `/recruiter/jobs/taxes/${province}`,
  JOB_REVIEW: (jobId: string) => `/recruiter/jobs/${jobId}/reviews`,
  GENERATE_JOB_DESCRIPTION: "/recruiter/jobs/generate-description",
  GENERATE_JOB_QUESTIONS: "/recruiter/jobs/generate-questions",
  // ── Job applications ──────────────────────────────────────────────────────
  JOB_APPLICATIONS: "/recruiter/job-applications",
  JOB_APPLICATION_STATUS: (id: string) => `/recruiter/job-applications/${id}/status`,
  // ── Interviews (requests, sessions, candidate/booking listings) ───────────
  INTERVIEW_REQUESTS: "/recruiter/interview-requests",
  INTERVIEW_REQUEST_CANCEL: (id: string) => `/recruiter/interview-requests/${id}/cancel`,
  RECRUITER_INTERVIEW_DETAILS: (interviewId: string) => `/recruiter/interviews/${interviewId}`,
  RECRUITER_CANDIDATE_INTERVIEWS: (candidateId: string) =>
    `/recruiter/candidates/${candidateId}/interviews`,
  RECRUITER_BOOKING_INTERVIEWS: (bookingId: string) =>
    `/recruiter/bookings/${bookingId}/interviews`,
  // -------------------------------------------------------------------------
  // jobs feature api section end
  // -------------------------------------------------------------------------

  // -------------------------------------------------------------------------
  // common api section start
  // -------------------------------------------------------------------------
  // ── Common (metadata, departments, device) — features/common/api.ts ─────
  COMMON_METADATA: "/common/metadata",
  COMMON_DEPARTMENTS: "/common/departments-job-titles",
  COMMON_SPECIALIZATIONS: "/common/specializations",
  COMMON_NOTIFICATIONS: "/common/notifications",
  COMMON_FCM_REGISTER: "/common/notifications/register",
  COMMON_DEVICE_ACTIVE: "/common/notifications/device/active",
  // -------------------------------------------------------------------------
  // common api section end
  // -------------------------------------------------------------------------

  // -------------------------------------------------------------------------
  // candidates feature api section start — features/candidates/api.ts
  // -------------------------------------------------------------------------
  // ── Candidate pool: list, summary, detail, document URL, job invite ─────
  CANDIDATES_LIST: "/recruiter/candidates",
  CANDIDATES_SUMMARY: "/recruiter/candidates/summary",
  CANDIDATE_DETAIL: (id: string) => `/recruiter/candidates/${id}`,
  CANDIDATE_DOCUMENT_SIGNED_URL: (candidateId: string, docId: string) =>
    `/recruiter/candidates/${candidateId}/documents/${docId}/url`,
  /** POST — invite an on-platform candidate to apply for a specific job */
  CANDIDATE_JOB_INVITE: "/recruiter/candidates/invite",
  // ── In-house roster ───────────────────────────────────────────────────────
  INHOUSE_CANDIDATES: "/recruiter/in-house-candidates",
  INHOUSE_SUMMARY: "/recruiter/in-house/summary",
  INHOUSE_ADD: (candidateId: string) => `/recruiter/candidates/${candidateId}/add-in-house`,
  INHOUSE_REMOVE: (candidateId: string) => `/recruiter/in-house-candidates/${candidateId}/remove`,
  // ── Referral invites (off-platform) ─────────────────────────────────────
  /** GET / POST — list & bulk-send 1–100 email referral invites */
  REFERRAL_INVITES: "/recruiter/referral-invites",
  /** POST — alternate bulk invite endpoint */
  RECRUITER_INVITES: "/recruiter/invites",
  // -------------------------------------------------------------------------
  // candidates feature api section end
  // -------------------------------------------------------------------------

  // -------------------------------------------------------------------------
  // chat api section start
  // -------------------------------------------------------------------------
  // ── Chat — features/chat/api.ts ──────────────────────────────────────────
  CHAT_CONVERSATIONS: "/chat/conversations",
  CHAT_MESSAGES: (conversationId: string) => `/chat/conversation/${conversationId}/messages`,
  CHAT_SEND_MESSAGE: "/chat/message",
  CHAT_CREATE_OR_GET: "/chat/conversation",
  // -------------------------------------------------------------------------
  // chat api section end
  // -------------------------------------------------------------------------

  // -------------------------------------------------------------------------
  // dashboard api section start
  // -------------------------------------------------------------------------
  // ── Dashboard — features/dashboard/api.ts ───────────────────────────────
  DASHBOARD_OVERVIEW: "/recruiter/dashboard",
  DASHBOARD_UNDERFILLED_JOBS: "/recruiter/dashboard/underfilled-jobs",
  DASHBOARD_TODAY_SHIFTS: "/recruiter/dashboard/todayshift",
  // Recruiter notification inbox
  NOTIFICATIONS: "/recruiter/notifications",
  NOTIFICATION_MARK_READ: (id: string) => `/recruiter/notifications/${id}/read`,
  // -------------------------------------------------------------------------
  // dashboard api section end
  // -------------------------------------------------------------------------

  // -------------------------------------------------------------------------
  // wallet api section start
  // -------------------------------------------------------------------------
  // ── Wallet — features/wallet/api.ts ──────────────────────────────────────
  WALLET: "/recruiter/wallet",
  WALLET_PAY: "/recruiter/wallet/pay",
  WALLET_TOPUPS: "/recruiter/wallet/topups",
  WALLET_TRANSACTIONS: "/recruiter/wallet/transactions",
  WALLET_TRANSACTION_DETAIL: (id: string) => `/recruiter/wallet/transactions/${id}`,
  // Escrow disputes (wallet-adjacent)
  ESCROW_DISPUTE: "/recruiter/escrow/disputes",
  // -------------------------------------------------------------------------
  // wallet api section end
  // -------------------------------------------------------------------------
} as const;
