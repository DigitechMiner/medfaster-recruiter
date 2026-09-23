import type { RecruiterNotification } from '@/types';

type JobTab =
  | 'overview'
  | 'candidates'
  | 'team'
  | 'schedule'
  | 'funding'
  | 'activity';

/**
 * Maps notification type -> Job Details tab.
 */
const JOB_NOTIFICATION_TABS: Record<string, JobTab> = {
  // ============================================================
  // JOB
  // ============================================================

  job_created: 'overview',

  // ============================================================
  // APPLICATIONS / CANDIDATES
  // ============================================================

  job_application_submitted: 'candidates',
  job_application_hired_withdrawn: 'candidates',

  // ============================================================
  // TEAM
  // ============================================================

  // If an in-house/team assignment notification is related
  // to the job, use the team tab.
  //
  // Add future job/team notification types here.
  //
  // example:
  // candidate_assigned_to_job: 'team',

  // ============================================================
  // SCHEDULE / SHIFTS
  // ============================================================

  job_attendance_check_in: 'schedule',
  job_attendance_check_out: 'schedule',
  job_shift_leave_applied: 'schedule',

  shift_status_active: 'schedule',
  shift_start_reminder_1h: 'schedule',

  // ============================================================
  // FUNDING
  // ============================================================

  job_funding_payment_reminder: 'funding',
  job_funding_job_closed: 'funding',

  // ============================================================
  // ACTIVITY
  // ============================================================

  recruiter_job_cancelled: 'activity',
  candidate_job_cancelled: 'activity',

  // Your backend currently sends `job_cancelled`
  // for both recruiter/candidate cancellation.
  job_cancelled: 'activity',
};

/**
 * Safely get a string value from notification payload.
 */
const getPayloadValue = (
  notification: RecruiterNotification,
  key: string,
): string | undefined => {
  const payload = notification.payload as Record<string, unknown> | undefined;

  const value = payload?.[key];

  return typeof value === 'string' ? value : undefined;
};

/**
 * Get job ID from notification payload.
 */
const getJobId = (
  notification: RecruiterNotification,
): string | undefined => {
  return (
    getPayloadValue(notification, 'job_id') ??
    getPayloadValue(notification, 'jobId')
  );
};

/**
 * Get the route for a notification.
 */
export const getNotificationRoute = (
  notification: RecruiterNotification,
): string | undefined => {
  const type = notification.type?.toLowerCase();

  if (!type) {
    return undefined;
  }

  // ============================================================
  // JOB RELATED NOTIFICATIONS
  // ============================================================

  const jobTab = JOB_NOTIFICATION_TABS[type];

  if (jobTab) {
    const jobId = getJobId(notification);

    if (!jobId) {
      return undefined;
    }

    return `/jobs/${jobId}?tab=${jobTab}`;
  }

  // ============================================================
  // IN-HOUSE
  // ============================================================

  if (
    type === 'in_house_request' ||
    type === 'in_house_request_accepted'
  ) {
    return '/in-house';
  }

  // ============================================================
  // WALLET
  // ============================================================

  if (
    type === 'recruiter_signup_bonus_credited' ||
    type === 'recruiter_referral_bonus_credited'
  ) {
    return '/wallet';
  }

  // ============================================================
  // DOCUMENTS
  // ============================================================

  if (type === 'recruiter_document_rejected') {
    return '/profile';
  }

  // ============================================================
  // NO DESTINATION
  // ============================================================

  return undefined;
};