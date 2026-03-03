// utils/constant/jobTypes.ts
export const JOB_TYPES: Record<string, string> = {
  "Full Time": "full_time",  // ✅ was "fulltime"
  "Part Time": "part_time",  // ✅ was "parttime"
  "Casual":    "casual",
};

export const convertToBackendValue = (frontendValue: string): string => {
  return JOB_TYPES[frontendValue] ?? "part_time";
};

export const convertToFrontendValue = (backendValue: string | null | undefined): string => {
  if (!backendValue) return Object.keys(JOB_TYPES)[0];
  const entry = Object.entries(JOB_TYPES).find(([_, v]) => v === backendValue);
  return entry ? entry[0] : Object.keys(JOB_TYPES)[0];
};

export const JOB_TYPE_LABELS = Object.keys(JOB_TYPES);
export const JOB_TYPE_VALUES = Object.keys(JOB_TYPES);
