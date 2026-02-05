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
    "Full Time",
    "Part Time",
    "Contract",
    "Temporary",
    "Internship",
    "Remote",
  ],

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
  // ORGANIZATION-RELATED METADATA (UPDATED FOR FILE UPLOAD API)
  // ============================================================================

  // ✅ UPDATED: Complete list matching backend ORGANIZATION_TYPES
  organization_type: [
    "Hospital",
    "Clinic",
    "Long Term Care",
    "Home Care",
    "Pharmacy",
    "Diagnostic Lab",
    "Nursing Home",
    "Rehabilitation Center",
    "Hospice",
    "Mental Health Facility",
    "Public Health",
    "Other",
  ],

  // ✅ UPDATED: Complete mapping for backend API
  organization_type_mapping: {
    "Hospital": "hospital",
    "Clinic": "clinic",
    "Long Term Care": "long_term_care",
    "Home Care": "home_care",
    "Pharmacy": "pharmacy",
    "Diagnostic Lab": "diagnostic_lab",
    "Nursing Home": "nursing_home",
    "Rehabilitation Center": "rehabilitation_center",
    "Hospice": "hospice",
    "Mental Health Facility": "mental_health_facility",
    "Public Health": "public_health",
    "Other": "other",
  },

  // ✅ Canadian provinces (display format)
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

  // ============================================================================
  // PERSONAL INFORMATION METADATA
  // ============================================================================

  gender: [
    "Male",
    "Female",
    "Other",
  ],

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
 * @param frontendValue - "Hospital", "Long Term Care", etc.
 * @returns Backend API value - "hospital", "long_term_care", etc.
 * @example convertOrganizationTypeToBackend("Long Term Care") => "long_term_care"
 */
export function convertOrganizationTypeToBackend(frontendValue: string): string {
  return metadata.organization_type_mapping[frontendValue as keyof typeof metadata.organization_type_mapping] 
    || "other";
}

/**
 * @param backendValue - "hospital", "long_term_care", etc.
 * @returns Frontend display value - "Hospital", "Long Term Care", etc.
 * @example convertOrganizationTypeToFrontend("long_term_care") => "Long Term Care"
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
 * ✅ NEW: Extract province code from display string
 * @param provinceDisplay - "Ontario (ON)" or "ON"
 * @returns Province code - "ON"
 * @example extractProvinceCode("Ontario (ON)") => "ON"
 * @example extractProvinceCode("ON") => "ON"
 */
export function extractProvinceCode(provinceDisplay: string): string {
  const match = provinceDisplay.match(/\(([A-Z]{2})\)/);
  if (match) return match[1];
  
  // If already a code (e.g., "ON"), return as-is
  if (provinceDisplay.length === 2 && /^[A-Z]{2}$/.test(provinceDisplay)) {
    return provinceDisplay;
  }
  
  // Fallback: try to find matching province
  const found = provinces.find(p => 
    provinceDisplay.includes(p.label) || provinceDisplay === p.value
  );
  return found?.value || "ON";
}

/**
 * Get array of frontend job type labels (for dropdowns)
 */
export function getJobTypeLabels(): string[] {
  return [...metadata.job_type];
}

// ============================================================================
// FORMATTED ARRAYS FOR FORM COMPONENTS
// ============================================================================

/**
 * ✅ Provinces array for FormSelect component (value/label format)
 * Backend expects: "AB", "BC", "ON", etc.
 */
export const provinces = [
  { value: "AB", label: "Alberta" },
  { value: "BC", label: "British Columbia" },
  { value: "MB", label: "Manitoba" },
  { value: "NB", label: "New Brunswick" },
  { value: "NL", label: "Newfoundland and Labrador" },
  { value: "NT", label: "Northwest Territories" },
  { value: "NS", label: "Nova Scotia" },
  { value: "NU", label: "Nunavut" },
  { value: "ON", label: "Ontario" },
  { value: "PE", label: "Prince Edward Island" },
  { value: "QC", label: "Quebec" },
  { value: "SK", label: "Saskatchewan" },
  { value: "YT", label: "Yukon" },
];

/**
 * Backend expects: "hospital", "long_term_care", "nursing_home", etc.
 */
export const orgTypes = [
  { value: "hospital", label: "Hospital" },
  { value: "clinic", label: "Clinic" },
  { value: "long_term_care", label: "Long Term Care" },
  { value: "home_care", label: "Home Care" },
  { value: "pharmacy", label: "Pharmacy" },
  { value: "diagnostic_lab", label: "Diagnostic Lab" },
  { value: "nursing_home", label: "Nursing Home" },
  { value: "rehabilitation_center", label: "Rehabilitation Center" },
  { value: "hospice", label: "Hospice" },
  { value: "mental_health_facility", label: "Mental Health Facility" },
  { value: "public_health", label: "Public Health" },
  { value: "other", label: "Other" },
];

// ============================================================================
// FILE VALIDATION HELPERS (ADD TO END OF metadata.ts)
// ============================================================================

/**
 * Validate file before upload
 * @param file - File to validate
 * @param maxSizeMB - Maximum file size in MB (default: 10)
 * @param allowedExtensions - Allowed file extensions
 * @returns Validation result with error message if invalid
 */
export function validateFile(
  file: File,
  maxSizeMB: number = 10,
  allowedExtensions: string[] = ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx']
): { valid: boolean; error?: string } {
  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size must be less than ${maxSizeMB}MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`
    };
  }

  // Check file extension
  const fileName = file.name.toLowerCase();
  const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
  
  if (!hasValidExtension) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${allowedExtensions.join(', ')}`
    };
  }

  return { valid: true };
}

/**
 * Validate organization photo (JPG/PNG only, max 10MB)
 */
export function validateOrganizationPhoto(file: File) {
  return validateFile(file, 10, ['.jpg', '.jpeg', '.png']);
}

/**
 * Validate document file (PDF/DOC/Images, max 10MB)
 */
export function validateDocumentFile(file: File) {
  return validateFile(file, 10, ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png']);
}

/**
 * Get file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
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
