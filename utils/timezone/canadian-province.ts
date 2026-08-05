/**
 * Map Canadian province metadata values → IANA timezones.
 * Must stay in sync with medfaster-backend `utils/timezone/canadianProvince.ts`.
 * Jobs store wall-clock times; interpret them with the job's province.
 */
export const DEFAULT_JOB_TIMEZONE = "America/Toronto";

/** Province slug (from master data) → IANA timezone. */
export const CANADIAN_PROVINCE_TIMEZONES: Record<string, string> = {
  alberta: "America/Edmonton",
  british_columbia: "America/Vancouver",
  manitoba: "America/Winnipeg",
  new_brunswick: "America/Moncton",
  newfoundland_and_labrador: "America/St_Johns",
  nova_scotia: "America/Halifax",
  ontario: "America/Toronto",
  prince_edward_island: "America/Halifax",
  quebec: "America/Toronto",
  saskatchewan: "America/Regina",
  northwest_territories: "America/Yellowknife",
  nunavut: "America/Iqaluit",
  yukon: "America/Whitehorse",
};

export function timezoneFromCanadianProvince(
  province: string | null | undefined,
): string {
  if (!province || typeof province !== "string") return DEFAULT_JOB_TIMEZONE;
  const key = province.trim().toLowerCase();
  return CANADIAN_PROVINCE_TIMEZONES[key] ?? DEFAULT_JOB_TIMEZONE;
}

/** Resolve facility timezone from job.province. */
export function resolveJobTimezone(
  job: { province?: string | null } | null | undefined,
): string {
  return timezoneFromCanadianProvince(job?.province);
}
