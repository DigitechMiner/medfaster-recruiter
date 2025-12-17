/**
 * ============================================================================
 * METADATA.TS - SINGLE SOURCE OF TRUTH FOR FORM/DROPDOWN CONSTANTS
 * ============================================================================
 */

const metadata = {
  // ============================================================================
  // JOB-RELATED METADATA
  // ============================================================================

  job_title: [
    "Nurse",
    "Orthopaedics",
    "Dermatology",
    "Neurology",
    "Cardiology",
    "Pediatrics",
  ],

  department: [
    "Cardiology",
    "Neurology",
    "Orthopaedics",
    "Dermatology",
    "Pediatrics",
    "Emergency",
  ],

  experience: [
    "0-1 Yrs",
    "1-2 Yrs",
    "2-3 Yrs",
    "3-5 Yrs",
    "5-7 Yrs",
    "7-10 Yrs",
    "10+ Yrs",
  ],

  // Updated to match backend EMPLOYMENT_TYPES
  job_type: [
    "Full Time",
    "Part Time",
    "Contract",
    "Temporary",
    "Internship",
    "Remote",
  ],

  // Job type mapping for backend API (frontend → backend)
  job_type_mapping: {
    "Full Time": "fulltime",
    "Part Time": "parttime",
    "Contract": "contract",
    "Temporary": "temporary",
    "Internship": "internship",
    "Remote": "remote",
  },

  urgency: [
    "Low",
    "Medium",
    "High",
    "Immediate",
  ],

  qualification: [
    "Cardiology",
    "Orthopedics",
    "Neurology",
    "Dermatology",
    "Pediatrics",
    "Emergency Medicine",
    "Internal Medicine",
    "Surgery",
    "Anesthesiology",
    "Radiology",
  ],

  specialization: [
    "Cardiology",
    "Orthopedics",
    "Neurology",
    "Dermatology",
    "Pediatrics",
    "Emergency Medicine",
    "Internal Medicine",
    "Surgery",
    "General Practice",
    "Critical Care",
  ],

  // ============================================================================
  // ORGANIZATION-RELATED METADATA
  // ============================================================================

  // Updated to match backend CANADIAN_PROVINCES (alphabetically sorted)
  province: [
    "Alberta (AB)",
    "British Columbia (BC)",
    "Manitoba (MB)",
    "New Brunswick (NB)",
    "Newfoundland and Labrador (NL)",
    "Northwest Territories (NT)",
    "Nova Scotia (NS)",
    "Nunavut (NU)",
    "Ontario (ON)",
    "Prince Edward Island (PE)",
    "Quebec (QC)",
    "Saskatchewan (SK)",
    "Yukon (YT)",
  ],

  // Updated to match backend ORGANIZATION_TYPES
  organization_type: [
    "Hospital",
    "Clinic",
    "Nursing Home",
    "Medical Center",
    "Pharmacy",
    "Laboratory",
    "Other",
  ],

  // Organization type mapping for backend API (frontend → backend)
  organization_type_mapping: {
    "Hospital": "hospital",
    "Clinic": "clinic",
    "Nursing Home": "nursing_home",
    "Medical Center": "medical_center",
    "Pharmacy": "pharmacy",
    "Laboratory": "laboratory",
    "Other": "other",
  },

  // ============================================================================
  // PERSONAL INFORMATION METADATA
  // ============================================================================

  gender: [
    "Male",
    "Female",
    "Other",
  ],

  // Gender mapping for backend API (frontend → backend)
  gender_mapping: {
    "Male": "male",
    "Female": "female",
    "Other": "other",
  },

  // ============================================================================
  // INTERVIEW/HIRING METADATA
  // ============================================================================

  yes_no: [
    "Yes",
    "No",
  ],

  interview_type: [
    "In-Person",
    "Virtual",
    "Phone",
    "Hybrid",
  ],

  // ============================================================================
  // PAY RANGE CONFIGURATION
  // ============================================================================

  pay_range: {
    min: 1000,
    max: 10000,
    step: 100,
    default_min: 2300,
    default_max: 2800,
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert frontend job type value to backend API value
 * @param frontendValue - "Full Time", "Part Time", etc.
 * @returns Backend API value - "fulltime", "parttime", etc.
 */
export function convertJobTypeToBackend(frontendValue: string): string {
  return metadata.job_type_mapping[frontendValue as keyof typeof metadata.job_type_mapping] 
    || "fulltime";
}

/**
 * Convert backend API value to frontend display value
 * @param backendValue - "fulltime", "parttime", etc.
 * @returns Frontend display value - "Full Time", "Part Time", etc.
 */
export function convertJobTypeToFrontend(backendValue: string | null | undefined): string {
  if (!backendValue) return metadata.job_type[0];

  const normalized = backendValue.toLowerCase();
  const entry = Object.entries(metadata.job_type_mapping).find(
    ([_, value]) => value === normalized
  );
  return entry ? entry[0] : metadata.job_type[0];
}

/**
 * Convert frontend organization type to backend API value
 * @param frontendValue - "Hospital", "Clinic", etc.
 * @returns Backend API value - "hospital", "clinic", etc.
 */
export function convertOrganizationTypeToBackend(frontendValue: string): string {
  return metadata.organization_type_mapping[frontendValue as keyof typeof metadata.organization_type_mapping] 
    || "other";
}

/**
 * Convert backend organization type to frontend display value
 * @param backendValue - "hospital", "clinic", etc.
 * @returns Frontend display value - "Hospital", "Clinic", etc.
 */
export function convertOrganizationTypeToFrontend(backendValue: string | null | undefined): string {
  if (!backendValue) return metadata.organization_type[0];

  const normalized = backendValue.toLowerCase();
  const entry = Object.entries(metadata.organization_type_mapping).find(
    ([_, value]) => value === normalized
  );
  return entry ? entry[0] : metadata.organization_type[0];
}

/**
 * Convert frontend gender to backend API value
 * @param frontendValue - "Male", "Female", "Other"
 * @returns Backend API value - "male", "female", "other"
 */
export function convertGenderToBackend(frontendValue: string): string {
  return metadata.gender_mapping[frontendValue as keyof typeof metadata.gender_mapping] 
    || "other";
}

/**
 * Convert backend gender to frontend display value
 * @param backendValue - "male", "female", "other"
 * @returns Frontend display value - "Male", "Female", "Other"
 */
export function convertGenderToFrontend(backendValue: string | null | undefined): string {
  if (!backendValue) return metadata.gender[0];

  const normalized = backendValue.toLowerCase();
  const entry = Object.entries(metadata.gender_mapping).find(
    ([_, value]) => value === normalized
  );
  return entry ? entry[0] : metadata.gender[0];
}

/**
 * Get array of frontend job type labels (for dropdowns)
 */
export function getJobTypeLabels(): string[] {
  return [...metadata.job_type];
}

// ============================================================================
// EXPORTS
// ============================================================================

// Export the metadata object as default
export default metadata;

// Also export individual properties for convenience
export const {
  job_title,
  department,
  experience,
  job_type,
  job_type_mapping,
  urgency,
  qualification,
  specialization,
  province,
  organization_type,
  organization_type_mapping,
  gender,
  gender_mapping,
  yes_no,
  interview_type,
  pay_range,
} = metadata;
