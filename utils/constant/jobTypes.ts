/**
 * Job Types - Single source of truth for job type dropdown options
 * Maps frontend display values (keys) to backend API values (values)
 */
export const JOB_TYPES: Record<string, string> = {
  "Part Time": "parttime",
  "Full Time": "fulltime",
  "Freelancer": "freelancer",
};

/**
 * Convert frontend value to backend value
 */
export const convertToBackendValue = (frontendValue: string): string => {
  return JOB_TYPES[frontendValue] || JOB_TYPES["Part Time"]; // Default to "Part Time"
};

/**
 * Convert backend value to frontend value
 */
export const convertToFrontendValue = (backendValue: string | null | undefined): string => {
  if (!backendValue) return Object.keys(JOB_TYPES)[0]; // Default to first key
  
  const normalized = backendValue.toLowerCase();
  const entry = Object.entries(JOB_TYPES).find(([_, value]) => value === normalized);
  return entry ? entry[0] : Object.keys(JOB_TYPES)[0]; // Default to first key if not found
};

/**
 * Get array of frontend display values (for dropdowns)
 */
export const JOB_TYPE_LABELS = Object.keys(JOB_TYPES);

/**
 * Get array of frontend form values (same as labels)
 */
export const JOB_TYPE_VALUES = Object.keys(JOB_TYPES);
