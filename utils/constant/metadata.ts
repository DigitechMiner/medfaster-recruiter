/**
 * ============================================================================
 * METADATA.TS - SINGLE SOURCE OF TRUTH FOR FORM/DROPDOWN CONSTANTS
 * ============================================================================
 */

const metadata = {
  job_title: [
    "Registered Nurse",
    "Licensed Practical Nurse",
    "Home Care Aid",
  ],

  job_title_mapping: {
    "Registered Nurse":         "registered_nurse",
    "Licensed Practical Nurse": "licensed_practical_nurse",
    "Home Care Aid":            "home_care_aid",
  },

  department: [
    { label: "Nursing", value: "nursing" },
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
  ],

  job_type_mapping: {
    "Full Time": "full_time",
    "Part Time": "part_time",
  },

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
    "Palliative Care / End of Life Care":     "palliative_care",
    "Continuing Care / Residential Care":     "continuing_care",
    "Rehabilitation Care":                    "rehabilitation_care",
    "Chronic Disease Care":                   "chronic_disease_care",
    "Wound Care":                             "wound_care",
    "Medication Management":                  "medication_management",
    "Mental Health & Behavioral Health Care": "mental_health",
    "Adult Mental Health":                    "adult_mental_health",
  },

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
    "Continuing Care Facility":      "nursing_home",
    "Medical Clinic":                "clinic",
    "Community Health Care Center":  "medical_center",
    "Home Care Agency":              "other",
    "Staffing Agency":               "other",
  },

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

  // Display label → camelCase backend value
  province_mapping: {
    "Alberta (AB)":                    "alberta",
    "British Columbia (BC)":           "britishColumbia",
    "Manitoba (MB)":                   "manitoba",
    "New Brunswick (NB)":              "newBrunswick",
    "Newfoundland and Labrador (NL)":  "newfoundlandAndLabrador",
    "Northwest Territories (NT)":      "northwestTerritories",
    "Nova Scotia (NS)":                "novaScotia",
    "Nunavut (NU)":                    "nunavut",
    "Ontario (ON)":                    "ontario",
    "Prince Edward Island (PE)":       "princeEdwardIsland",
    "Quebec (QC)":                     "quebec",
    "Saskatchewan (SK)":               "saskatchewan",
    "Yukon (YT)":                      "yukon",
  },

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

  yes_no: ["Yes", "No"],

  interview_type: [
    "In-Person",
    "Virtual",
    "Phone",
    "Hybrid",
  ],

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

  pay_range: {
    min:         0,
    max:         100,
    step:        1,
    default_min: 0,
    default_max: 100,
  },

  qualification_mapping: {
    "Cardiology":         "cardiology",
    "Orthopedics":        "orthopedics",
    "Neurology":          "neurology",
    "Dermatology":        "dermatology",
    "Pediatrics":         "pediatrics",
    "Emergency Medicine": "emergency_medicine",
    "Internal Medicine":  "internal_medicine",
    "Surgery":            "surgery",
    "Anesthesiology":     "anesthesiology",
    "Radiology":          "radiology",
  },

  experience_mapping: {
    "0-1 Yrs":  "0",
    "1-2 Yrs":  "1",
    "2-3 Yrs":  "2",
    "3-5 Yrs":  "3",
    "5-7 Yrs":  "5",
    "7-10 Yrs": "7",
    "10+ Yrs":  "10",
  },
};

// ============================================================================
// PROVINCE HELPERS
// ============================================================================

export const provinces = [
  { value: "alberta",                   label: "Alberta" },
  { value: "british_columbia",          label: "British Columbia" },
  { value: "manitoba",                  label: "Manitoba" },
  { value: "new_brunswick",             label: "New Brunswick" },
  { value: "newfoundland_and_labrador", label: "Newfoundland and Labrador" },
  { value: "nova_scotia",               label: "Nova Scotia" },
  { value: "ontario",                   label: "Ontario" },
  { value: "prince_edward_island",      label: "Prince Edward Island" },
  { value: "quebec",                    label: "Quebec" },
  { value: "saskatchewan",              label: "Saskatchewan" },
  { value: "northwest_territories",     label: "Northwest Territories" },
  { value: "nunavut",                   label: "Nunavut" },
  { value: "yukon",                     label: "Yukon" },
];

/**
 * snake_case frontend value → camelCase backend value
 * "new_brunswick" → "newBrunswick"
 * Also handles already-camelCase passthrough
 */
const PROVINCE_VALUE_TO_BACKEND: Record<string, string> = {
  "alberta":                   "alberta",
  "british_columbia":          "britishColumbia",
  "manitoba":                  "manitoba",
  "new_brunswick":             "newBrunswick",
  "newfoundland_and_labrador": "newfoundlandAndLabrador",
  "northwest_territories":     "northwestTerritories",
  "nova_scotia":               "novaScotia",
  "nunavut":                   "nunavut",
  "ontario":                   "ontario",
  "prince_edward_island":      "princeEdwardIsland",
  "quebec":                    "quebec",
  "saskatchewan":              "saskatchewan",
  "yukon":                     "yukon",
};

/**
 * camelCase backend value → snake_case frontend value
 * "newBrunswick" → "new_brunswick"
 */
const PROVINCE_BACKEND_TO_VALUE: Record<string, string> = Object.fromEntries(
  Object.entries(PROVINCE_VALUE_TO_BACKEND).map(([k, v]) => [v, k])
);

// ============================================================================
// CONVERTER FUNCTIONS
// ============================================================================

export function convertExperienceToBackend(frontendValue: string): string | null {
  if (!frontendValue) return null;
  return (
    metadata.experience_mapping[frontendValue as keyof typeof metadata.experience_mapping] ??
    String(frontendValue.split("-")[0].replace(/\D/g, "")) ??
    null
  );
}

export function convertExperienceToFrontend(backendValue: string | null | undefined): string {
  if (!backendValue) return "";
  const entry = Object.entries(metadata.experience_mapping).find(([, v]) => v === backendValue);
  return entry ? entry[0] : backendValue;
}

export function convertJobTitleToBackend(frontendValue: string): string {
  return (
    metadata.job_title_mapping[frontendValue as keyof typeof metadata.job_title_mapping] ??
    "registered_nurse"
  );
}

export function convertJobTitleToFrontend(backendValue: string | null | undefined): string {
  if (!backendValue) return metadata.job_title[0];
  const entry = Object.entries(metadata.job_title_mapping).find(([, v]) => v === backendValue);
  return entry ? entry[0] : metadata.job_title[0];
}

export function convertJobTypeToBackend(frontendValue: string): string {
  return (
    metadata.job_type_mapping[frontendValue as keyof typeof metadata.job_type_mapping] ??
    "full_time"
  );
}

export function convertJobTypeToFrontend(backendValue: string | null | undefined): string {
  if (!backendValue) return "Not specified";
  const entry = Object.entries(metadata.job_type_mapping).find(([, v]) => v === backendValue);
  return entry ? entry[0] : backendValue;
}

export function convertUrgencyToBackend(frontendValue: string): string {
  return (
    metadata.urgency_mapping[frontendValue as keyof typeof metadata.urgency_mapping] ?? "normal"
  );
}

export function convertUrgencyToFrontend(backendValue: string | null | undefined): string {
  if (!backendValue) return metadata.urgency[0];
  const entry = Object.entries(metadata.urgency_mapping).find(([, v]) => v === backendValue);
  return entry ? entry[0] : backendValue;
}

export function convertOrganizationTypeToBackend(frontendValue: string): string {
  return (
    metadata.organization_type_mapping[
      frontendValue as keyof typeof metadata.organization_type_mapping
    ] ?? "hospital"
  );
}

export function convertOrganizationTypeToFrontend(backendValue: string | null | undefined): string {
  if (!backendValue) return metadata.organization_type[0];
  const entry = Object.entries(metadata.organization_type_mapping).find(
    ([, v]) => v === backendValue
  );
  return entry ? entry[0] : backendValue;
}

export function convertGenderToBackend(frontendValue: string): string {
  return (
    metadata.gender_mapping[frontendValue as keyof typeof metadata.gender_mapping] ?? "other"
  );
}

export function convertGenderToFrontend(backendValue: string | null | undefined): string {
  if (!backendValue) return metadata.gender[0];
  const entry = Object.entries(metadata.gender_mapping).find(([, v]) => v === backendValue);
  return entry ? entry[0] : backendValue;
}

export function convertSpecializationToBackend(frontendValue: string): string {
  return (
    metadata.specialization_mapping[
      frontendValue as keyof typeof metadata.specialization_mapping
    ] ?? frontendValue.toLowerCase().replace(/ /g, "_")
  );
}

export function convertSpecializationToFrontend(backendValue: string | null | undefined): string {
  if (!backendValue) return "";
  const entry = Object.entries(metadata.specialization_mapping).find(
    ([, v]) => v === backendValue
  );
  return entry
    ? entry[0]
    : backendValue
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
}

export function convertWorkEligibilityToBackend(frontendValue: string): string {
  return (
    metadata.work_eligibility_mapping[
      frontendValue as keyof typeof metadata.work_eligibility_mapping
    ] ?? "canadian_citizen"
  );
}

export function convertWorkEligibilityToFrontend(backendValue: string | null | undefined): string {
  if (!backendValue) return metadata.work_eligibility[0];
  const entry = Object.entries(metadata.work_eligibility_mapping).find(
    ([, v]) => v === backendValue
  );
  return entry ? entry[0] : backendValue;
}

export function convertJobStatusToBackend(frontendValue: string): string {
  return (
    metadata.job_status_mapping[frontendValue as keyof typeof metadata.job_status_mapping] ??
    "DRAFT"
  );
}

export function convertJobStatusToFrontend(backendValue: string | null | undefined): string {
  if (!backendValue) return metadata.job_status[0];
  const entry = Object.entries(metadata.job_status_mapping).find(([, v]) => v === backendValue);
  return entry ? entry[0] : backendValue;
}

export function convertQualificationToBackend(frontendValue: string): string {
  return (
    metadata.qualification_mapping[
      frontendValue as keyof typeof metadata.qualification_mapping
    ] ?? frontendValue.toLowerCase().replace(/ /g, "_")
  );
}

export function convertQualificationToFrontend(backendValue: string | null | undefined): string {
  if (!backendValue) return "";
  const entry = Object.entries(metadata.qualification_mapping).find(
    ([, v]) => v === backendValue
  );
  return entry
    ? entry[0]
    : backendValue
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
}

// ============================================================================
// PROVINCE CONVERTERS
// ============================================================================

/**
 * Convert frontend snake_case province value → camelCase backend value
 * Used in ALL create/update payloads before sending to API
 *
 * "new_brunswick"             → "newBrunswick"
 * "newfoundland_and_labrador" → "newfoundlandAndLabrador"
 * "prince_edward_island"      → "princeEdwardIsland"
 * Already camelCase values pass through unchanged
 */
export function convertProvinceToBackend(frontendValue: string | null | undefined): string | null {
  if (!frontendValue) return null;
  // Already a valid camelCase backend value — pass through
  if (PROVINCE_BACKEND_TO_VALUE[frontendValue]) return frontendValue;
  // Map from snake_case frontend value
  return PROVINCE_VALUE_TO_BACKEND[frontendValue] ?? frontendValue;
}

/**
 * Convert camelCase backend province value → snake_case frontend value
 * Used when populating form from API response
 *
 * "newBrunswick"             → "new_brunswick"
 * "newfoundlandAndLabrador"  → "newfoundland_and_labrador"
 * "princeEdwardIsland"       → "prince_edward_island"
 * Already snake_case values pass through unchanged
 */
export function convertProvinceToFrontend(backendValue: string | null | undefined): string | undefined {
  if (!backendValue) return undefined;
  // Already a valid snake_case frontend value
  if (provinces.find((p) => p.value === backendValue)) return backendValue;
  // Map from camelCase backend value
  return PROVINCE_BACKEND_TO_VALUE[backendValue] ?? undefined;
}

// ============================================================================
// OTHER HELPERS
// ============================================================================

export const orgTypes = [
  { value: "hospital",       label: "Hospital" },
  { value: "nursing_home",   label: "Continuing Care Facility" },
  { value: "clinic",         label: "Medical Clinic" },
  { value: "medical_center", label: "Community Health Care Center" },
  { value: "other",          label: "Other" },
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
  allowedExtensions = [".jpg", ".jpeg", ".png", ".pdf", ".doc", ".docx"]
): { valid: boolean; error?: string } {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size must be less than ${maxSizeMB}MB. Current size: ${(
        file.size /
        1024 /
        1024
      ).toFixed(2)}MB`,
    };
  }
  const fileName = file.name.toLowerCase();
  const hasValidExtension = allowedExtensions.some((ext) => fileName.endsWith(ext));
  if (!hasValidExtension) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${allowedExtensions.join(", ")}`,
    };
  }
  return { valid: true };
}

export function validateOrganizationPhoto(file: File) {
  return validateFile(file, 10, [".jpg", ".jpeg", ".png"]);
}

export function validateDocumentFile(file: File) {
  return validateFile(file, 10, [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"]);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

// ============================================================================
// EXPORTS
// ============================================================================

export default metadata;

export const {
  job_title,
  job_title_mapping,
  experience,
  job_type,
  job_type_mapping,
  urgency,
  urgency_mapping,
  qualification,
  qualification_mapping,
  specialization,
  specialization_mapping,
  province,
  province_mapping,
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
  experience_mapping,
} = metadata;


// utils/constant/metadata.ts — add this
const PROVINCE_TO_SNAKE: Record<string, string> = {
  alberta:                    "alberta",
  britishColumbia:            "british_columbia",
  manitoba:                   "manitoba",
  newBrunswick:               "new_brunswick",
  newfoundlandAndLabrador:    "newfoundland_and_labrador",
  novaScotia:                 "nova_scotia",
  ontario:                    "ontario",
  princeEdwardIsland:         "prince_edward_island",
  quebec:                     "quebec",
  saskatchewan:               "saskatchewan",
  northwestTerritories:       "northwest_territories",
  nunavut:                    "nunavut",
  yukon:                      "yukon",
};

// ✅ Use this for jobs (snake_case)
export const convertProvinceToJobBackend = (province: string | undefined): string | null => {
  if (!province) return null;
  return PROVINCE_TO_SNAKE[province] ?? province.toLowerCase().replace(/\s+/g, "_");
};