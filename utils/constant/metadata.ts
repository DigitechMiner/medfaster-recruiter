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
    "Registered Nurse",
    "Licensed Practical Nurse",
    "Home Care Aid",
  ],

  job_title_mapping: {
    "Registered Nurse":         "registered_nurse",
    "Licensed Practical Nurse": "licensed_practical_nurse",
    "Home Care Aid":            "home_care_aide",
  },

  department: [
    "Nursing",
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

  // ✅ Matches backend validator: ['full_time', 'part_time', 'casual']
  job_type: [
    "Full Time",
    "Part Time",
    "Casual",
  ],

  job_type_mapping: {
    "Full Time": "full_time",
    "Part Time": "part_time",
    "Casual":    "casual",
  },

  // ✅ Matches backend validator: ['instant', 'normal'] only
  urgency: [
    "Normal",
    "Instant",
  ],

  urgency_mapping: {
    "Normal":  "normal",
    "Instant": "instant",
  },

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

  // ✅ Matches backend specialization enum values
  specialization: [
    "Geriatric Care",
    "Long Term Care",
    "Dementia Care / Alzheimer Care",
    "Complex Dementia Care",
    "Palliative Care / End of Life Care",
    "Continuing Care / Residential Care",
    "Rehabilitation Care",
    "Chronic Disease Care",
    "Wound Care",
    "Medication Management",
    "Mental Health & Behavioral Health Care",
    "Adult Mental Health",
  ],

  specialization_mapping: {
    "Geriatric Care":                         "geriatric_care",
    "Long Term Care":                         "long_term_care",
    "Dementia Care / Alzheimer Care":         "dementia_care",
    "Complex Dementia Care":                  "complex_dementia_care",
    "Palliative Care / End of Life Care":     "palliative_care / end_of_life_care",
    "Continuing Care / Residential Care":     "continuing_care / residential_care",
    "Rehabilitation Care":                    "rehabilitation_care",
    "Chronic Disease Care":                   "chronic_disease_care",
    "Wound Care":                             "wound_care",
    "Medication Management":                  "medication_management",
    "Mental Health & Behavioral Health Care": "mental_health & behavioral_health_care",
    "Adult Mental Health":                    "adult_mental_health",
  },

  // ============================================================================
  // ORGANIZATION-RELATED METADATA
  // ============================================================================

  // ✅ Matches backend ORGANIZATION_TYPES constant
  organization_type: [
    "Hospital",
    "Continuing Care Facility",
    "Medical Clinic",
    "Community Health Care Center",
    "Home Care Agency",
    "Staffing Agency",
  ],

  organization_type_mapping: {
    "Hospital":                      "hospital",
    "Continuing Care Facility":      "continuing_care_facility",
    "Medical Clinic":                "medical_clinic",
    "Community Health Care Center":  "community_health_care_center",
    "Home Care Agency":              "home_care_agency",
    "Staffing Agency":               "staffing_agency",
  },

  // ✅ Canadian provinces display format
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

  // ✅ Matches backend gender enum
  gender: [
    "Male",
    "Female",
    "Other",
  ],

  gender_mapping: {
    "Male":   "male",
    "Female": "female",
    "Other":  "other",
  },

  // ✅ Matches backend work_eligibility enum
  work_eligibility: [
    "Canadian Citizen",
    "Permanent Resident",
    "Work Permit Holder",
  ],

  work_eligibility_mapping: {
    "Canadian Citizen":   "canadian_citizen",
    "Permanent Resident": "permanent_resident",
    "Work Permit Holder": "work_permit_holder",
  },

  // ============================================================================
  // INTERVIEW / HIRING METADATA
  // ============================================================================

  yes_no: ["Yes", "No"],

  interview_type: [
    "In-Person",
    "Virtual",
    "Phone",
    "Hybrid",
  ],

  // ✅ Matches backend: DRAFT, OPEN, PAUSED, CLOSED
  job_status: [
    "Draft",
    "Open",
    "Paused",
    "Closed",
  ],

  job_status_mapping: {
    "Draft":  "DRAFT",
    "Open":   "OPEN",
    "Paused": "PAUSED",
    "Closed": "CLOSED",
  },

  // ============================================================================
  // PAY RANGE CONFIGURATION
  // ============================================================================

  pay_range: {
    min:         1000,
    max:         10000,
    step:        100,
    default_min: 2300,
    default_max: 2800,
  },
};

// ============================================================================
// CONVERTER FUNCTIONS
// ============================================================================

export function convertJobTitleToBackend(frontendValue: string): string {
  return metadata.job_title_mapping[frontendValue as keyof typeof metadata.job_title_mapping]
    ?? "registered_nurse";
}

export function convertJobTitleToFrontend(backendValue: string | null | undefined): string {
  if (!backendValue) return metadata.job_title[0];
  const entry = Object.entries(metadata.job_title_mapping).find(([_, v]) => v === backendValue);
  return entry ? entry[0] : metadata.job_title[0];
}

export function convertJobTypeToBackend(frontendValue: string): string {
  return metadata.job_type_mapping[frontendValue as keyof typeof metadata.job_type_mapping]
    ?? "full_time";
}

export function convertJobTypeToFrontend(backendValue: string | null | undefined): string {
  if (!backendValue) return metadata.job_type[0];
  const entry = Object.entries(metadata.job_type_mapping).find(([_, v]) => v === backendValue);
  return entry ? entry[0] : metadata.job_type[0];
}

export function convertUrgencyToBackend(frontendValue: string): string {
  return metadata.urgency_mapping[frontendValue as keyof typeof metadata.urgency_mapping]
    ?? "normal";
}

export function convertUrgencyToFrontend(backendValue: string | null | undefined): string {
  if (!backendValue) return metadata.urgency[0];
  const entry = Object.entries(metadata.urgency_mapping).find(([_, v]) => v === backendValue);
  return entry ? entry[0] : metadata.urgency[0];
}

export function convertOrganizationTypeToBackend(frontendValue: string): string {
  return metadata.organization_type_mapping[frontendValue as keyof typeof metadata.organization_type_mapping]
    ?? "hospital";
}

export function convertOrganizationTypeToFrontend(backendValue: string | null | undefined): string {
  if (!backendValue) return metadata.organization_type[0];
  const entry = Object.entries(metadata.organization_type_mapping).find(([_, v]) => v === backendValue);
  return entry ? entry[0] : metadata.organization_type[0];
}

export function convertGenderToBackend(frontendValue: string): string {
  return metadata.gender_mapping[frontendValue as keyof typeof metadata.gender_mapping]
    ?? "other";
}

export function convertGenderToFrontend(backendValue: string | null | undefined): string {
  if (!backendValue) return metadata.gender[0];
  const entry = Object.entries(metadata.gender_mapping).find(([_, v]) => v === backendValue);
  return entry ? entry[0] : metadata.gender[0];
}

export function convertSpecializationToBackend(frontendValue: string): string {
  return metadata.specialization_mapping[frontendValue as keyof typeof metadata.specialization_mapping]
    ?? frontendValue.toLowerCase().replace(/ /g, "_");
}

export function convertSpecializationToFrontend(backendValue: string | null | undefined): string {
  if (!backendValue) return metadata.specialization[0];
  const entry = Object.entries(metadata.specialization_mapping).find(([_, v]) => v === backendValue);
  return entry ? entry[0] : backendValue;
}

export function convertWorkEligibilityToBackend(frontendValue: string): string {
  return metadata.work_eligibility_mapping[frontendValue as keyof typeof metadata.work_eligibility_mapping]
    ?? "canadian_citizen";
}

export function convertWorkEligibilityToFrontend(backendValue: string | null | undefined): string {
  if (!backendValue) return metadata.work_eligibility[0];
  const entry = Object.entries(metadata.work_eligibility_mapping).find(([_, v]) => v === backendValue);
  return entry ? entry[0] : backendValue;
}

export function convertJobStatusToBackend(frontendValue: string): string {
  return metadata.job_status_mapping[frontendValue as keyof typeof metadata.job_status_mapping]
    ?? "DRAFT";
}

export function convertJobStatusToFrontend(backendValue: string | null | undefined): string {
  if (!backendValue) return metadata.job_status[0];
  const entry = Object.entries(metadata.job_status_mapping).find(([_, v]) => v === backendValue);
  return entry ? entry[0] : backendValue;
}

// ============================================================================
// PROVINCE HELPERS
// ============================================================================

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

export const orgTypes = [
  { value: "hospital",                     label: "Hospital" },
  { value: "continuing_care_facility",     label: "Continuing Care Facility" },
  { value: "medical_clinic",               label: "Medical Clinic" },
  { value: "community_health_care_center", label: "Community Health Care Center" },
  { value: "home_care_agency",             label: "Home Care Agency" },
  { value: "staffing_agency",              label: "Staffing Agency" },
];

export function extractProvinceCode(provinceDisplay: string): string {
  const match = provinceDisplay.match(/\(([A-Z]{2})\)/);
  if (match) return match[1];
  if (provinceDisplay.length === 2 && /^[A-Z]{2}$/.test(provinceDisplay)) return provinceDisplay;
  const found = provinces.find(
    (p) => provinceDisplay.includes(p.label) || provinceDisplay === p.value
  );
  return found?.value ?? "ON";
}

export function getJobTypeLabels(): string[] {
  return [...metadata.job_type];
}

// ============================================================================
// FILE VALIDATION HELPERS
// ============================================================================

export function validateFile(
  file: File,
  maxSizeMB = 10,
  allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx']
): { valid: boolean; error?: string } {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size must be less than ${maxSizeMB}MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
    };
  }
  const fileName = file.name.toLowerCase();
  const hasValidExtension = allowedExtensions.some((ext) => fileName.endsWith(ext));
  if (!hasValidExtension) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${allowedExtensions.join(', ')}`,
    };
  }
  return { valid: true };
}

export function validateOrganizationPhoto(file: File) {
  return validateFile(file, 10, ['.jpg', '.jpeg', '.png']);
}

export function validateDocumentFile(file: File) {
  return validateFile(file, 10, ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png']);
}

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

export default metadata;

export const {
  job_title,
  job_title_mapping,
  department,
  experience,
  job_type,
  job_type_mapping,
  urgency,
  urgency_mapping,
  qualification,
  specialization,
  specialization_mapping,
  province,
  organization_type,
  organization_type_mapping,
  gender,
  gender_mapping,
  work_eligibility,
  work_eligibility_mapping,
  yes_no,
  interview_type,
  job_status,
  job_status_mapping,
  pay_range,
} = metadata;
