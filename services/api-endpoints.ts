export const ENDPOINTS = {
  // Recruiter Auth
  RECRUITER_SEND_OTP: '/recruiter/send-otp',
  RECRUITER_VALIDATE_OTP: '/recruiter/validate-otp',
  RECRUITER_PROFILE: '/recruiter/profile',
  
  // Jobs CRUD
  JOBS_LIST: '/recruiter/jobs',
  JOBS_CREATE: '/recruiter/jobs',
  JOBS_DETAIL: (id: string) => `/recruiter/jobs/${id}`,
  JOBS_UPDATE: (id: string) => `/recruiter/jobs/${id}`,
  JOBS_DELETE: (id: string) => `/recruiter/jobs/${id}`,
};
