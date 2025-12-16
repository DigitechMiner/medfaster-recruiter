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

  job_type: [
    "Part Time",
    "Full Time",
    "Freelancer",
  ],

  // Job type mapping for backend API (frontend → backend)
  job_type_mapping: {
    "Part Time": "parttime",
    "Full Time": "fulltime",
    "Freelancer": "freelancer",
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

  province: [
    "Ontario (ON)",
    "Quebec (QC)",
    "British Columbia (BC)",
    "Alberta (AB)",
    "Manitoba (MB)",
    "Saskatchewan (SK)",
    "Nova Scotia (NS)",
    "New Brunswick (NB)",
    "Newfoundland and Labrador (NL)",
    "Prince Edward Island (PE)",
    "Northwest Territories (NT)",
    "Yukon (YT)",
    "Nunavut (NU)",
  ],

  organization_type: [
    "Hospital",
    "Clinic",
    "Medical Center",
    "Healthcare Facility",
    "Nursing Home",
    "Rehabilitation Center",
  ],

  // ============================================================================
  // PERSONAL INFORMATION METADATA
  // ============================================================================

  gender: [
    "Male",
    "Female",
    "Other",
  ],

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
 * @param frontendValue - "Part Time", "Full Time", or "Freelancer"
 * @returns Backend API value - "parttime", "fulltime", or "freelancer"
 */
export function convertJobTypeToBackend(frontendValue: string): string {
  return metadata.job_type_mapping[frontendValue as keyof typeof metadata.job_type_mapping] 
    || metadata.job_type_mapping["Part Time"];
}

/**
 * Convert backend API value to frontend display value
 * @param backendValue - "parttime", "fulltime", or "freelancer"
 * @returns Frontend display value - "Part Time", "Full Time", or "Freelancer"
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
  gender,
  yes_no,
  interview_type,
  pay_range,
} = metadata;