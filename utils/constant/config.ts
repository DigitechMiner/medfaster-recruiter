/**
 * ============================================================================
 * CONFIG.TS - APPLICATION CONFIGURATION CONSTANTS
 * ============================================================================
 * Location: utils/constant/config.ts
 * Contains: Timers, limits, validation rules, feature flags
 * ============================================================================
 */

const config = {
  // ============================================================================
  // OTP & AUTHENTICATION
  // ============================================================================
  otp: {
    resend_timer_seconds: 120,        // 2 minutes
    expiry_seconds: 600,              // 10 minutes
    default_country_code: "1",        // USA/Canada
    phone_min_length: 5,
  },

  session: {
    timeout_ms: 30 * 60 * 1000,             // 30 minutes
    token_refresh_interval_ms: 15 * 60 * 1000, // 15 minutes
  },

  // ============================================================================
  // VALIDATION PATTERNS
  // ============================================================================
  regex: {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    postal_code: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
    business_number: /^\d{9}$/,
    phone: /^[\d\s\-\+\(\)]+$/,
  },

  // ============================================================================
  // FILE UPLOAD
  // ============================================================================
  file_upload: {
    max_image_size_bytes: 5 * 1024 * 1024,       // 5MB
    max_document_size_bytes: 10 * 1024 * 1024,   // 10MB
    accepted_image_types: [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ],
    accepted_document_types: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ],
  },

  // ============================================================================
  // CACHING & PERFORMANCE
  // ============================================================================
  cache: {
    job_listings_ms: 5 * 60 * 1000,     // 5 minutes
    candidate_ms: 10 * 60 * 1000,       // 10 minutes
    static_content_ms: 60 * 60 * 1000,  // 1 hour
  },

  performance: {
    search_debounce_ms: 300,
    form_autosave_interval_ms: 30 * 1000, // 30 seconds
  },

  // ============================================================================
  // PAGINATION
  // ============================================================================
  pagination: {
    default_page_size: 10,
    max_page_size: 100,
    page_size_options: [10, 20, 50, 100],
  },

  // ============================================================================
  // LIMITS
  // ============================================================================
  limits: {
    max_tags_per_field: 10,
    max_questions_per_topic: 10,
    max_topics_per_job: 5,
    min_job_description_length: 50,
    max_job_description_length: 5000,
  },

  // ============================================================================
  // API & NETWORK
  // ============================================================================
  api: {
    timeout_ms: 30 * 1000,       // 30 seconds
    retry_attempts: 3,
    retry_delay_ms: 1000,        // 1 second
    rate_limit_per_minute: 60,
  },

  // ============================================================================
  // NOTIFICATIONS
  // ============================================================================
  toast: {
    default_duration_ms: 3000,
    success_duration_ms: 3000,
    error_duration_ms: 5000,
    warning_duration_ms: 4000,
  },

  // ============================================================================
  // JOB POSTING
  // ============================================================================
  job_posting: {
    default_expiry_days: 30,
    max_expiry_days: 90,
  },

  // ============================================================================
  // CALENDAR & SCHEDULING
  // ============================================================================
  scheduling: {
    working_hours_start: 9,            // 9 AM
    working_hours_end: 17,             // 5 PM
    interview_slot_duration_minutes: 30,
    min_interview_notice_hours: 24,
  },

  // ============================================================================
  // LOCAL STORAGE KEYS
  // ============================================================================
  storage_keys: {
    prefix: "medfaster_recruiter_",
    auth_token: "medfaster_recruiter_auth_token",
    user_data: "medfaster_recruiter_user_data",
    form_draft: "medfaster_recruiter_form_draft",
    has_jobs: "medfaster_recruiter_has_jobs",
    theme: "medfaster_recruiter_theme",
    sidebar_state: "medfaster_recruiter_sidebar_state",
    last_visited_page: "medfaster_recruiter_last_page",
  },

  // ============================================================================
  // FEATURE FLAGS
  // ============================================================================
  features: {
    enable_ai_features: true,
    enable_analytics: true,
    enable_chat: true,
    enable_video_interviews: false,  // Coming soon
    enable_bulk_actions: true,
    enable_export: true,
    debug_mode: process.env.NODE_ENV === "development",
  },
};

// ============================================================================
// EXPORTS
// ============================================================================

export default config;

export const {
  otp,
  session,
  regex,
  file_upload,
  cache,
  performance,
  pagination,
  limits,
  api,
  toast,
  job_posting,
  scheduling,
  storage_keys,
  features,
} = config;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  );
}

export const MAX_IMAGE_SIZE_FORMATTED = formatBytes(
  config.file_upload.max_image_size_bytes
);

export const MAX_DOCUMENT_SIZE_FORMATTED = formatBytes(
  config.file_upload.max_document_size_bytes
);
