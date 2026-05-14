/**
 * ============================================================================
 * METADATA.TS - SINGLE SOURCE OF TRUTH FOR FORM/DROPDOWN CONSTANTS
 * ============================================================================
 */

type LabelValueOption = { id: number | string; label: string; value: string; [key: string]: unknown };

export const metaData = {
  version: "1.3.0",
  data: {
    gender: [
      { id: 1, label: "Male", value: "male" },
      { id: 2, label: "Female", value: "female" },
      { id: 3, label: "Other", value: "other" },
    ],
    job_types: [
      { id: 1, label: "Full Time", value: "full_time" },
      { id: 2, label: "Part Time", value: "part_time" },
      { id: 3, label: "Casual", value: "casual" },
    ],
    work_experience_employment_types: [
      { id: 1, label: "Full Time", value: "full_time" },
      { id: 2, label: "Part Time", value: "part_time" },
      { id: 3, label: "Casual", value: "casual" },
      { id: 4, label: "Internship", value: "internship" },
    ],
    countryList: [
      { id: 1, label: "Canada", value: "CA", dial_code: "+1", flag: "🇨🇦" },
      { id: 2, label: "India", value: "IN", dial_code: "+91", flag: "🇮🇳" },
    ],
    social_media_platforms: [
      { id: 1, label: "LinkedIn", value: "linkedin" },
      { id: 2, label: "Portfolio Website", value: "portfolio" },
      { id: 3, label: "Other", value: "other" },
    ],
    organisation_type: [
      { id: 1, label: "Hospital", value: "hospital" },
      { id: 2, label: "Continuing Care Facility", value: "continuing_care_facility" },
      { id: 3, label: "Medical Clinic", value: "medical_clinic" },
      { id: 4, label: "Community Health Care Center", value: "community_health_care_center" },
      { id: 5, label: "Home Care Agency", value: "home_care_agency" },
      { id: 6, label: "Staffing Agency", value: "staffing_agency" },
    ],
    location_options: [
      { id: 1, label: "Toronto", value: "toronto" },
      { id: 2, label: "Vancouver", value: "vancouver" },
      { id: 3, label: "Montreal", value: "montreal" },
      { id: 4, label: "Calgary", value: "calgary" },
      { id: 5, label: "Edmonton", value: "edmonton" },
      { id: 6, label: "Ottawa", value: "ottawa" },
      { id: 7, label: "Winnipeg", value: "winnipeg" },
      { id: 8, label: "Quebec City", value: "quebec_city" },
      { id: 9, label: "Hamilton", value: "hamilton" },
      { id: 10, label: "Kitchener", value: "kitchener" },
    ],
    canadian_provinces: [
      { id: 1, label: "Alberta", value: "alberta", abvName: "AB" },
      { id: 2, label: "British Columbia", value: "british_columbia", abvName: "BC" },
      { id: 3, label: "Manitoba", value: "manitoba", abvName: "MB" },
      { id: 4, label: "New Brunswick", value: "new_brunswick", abvName: "NB" },
      {
        id: 5,
        label: "Newfoundland and Labrador",
        value: "newfoundland_and_labrador",
        abvName: "NL",
      },
      { id: 6, label: "Nova Scotia", value: "nova_scotia", abvName: "NS" },
      { id: 7, label: "Ontario", value: "ontario", abvName: "ON" },
      { id: 8, label: "Prince Edward Island", value: "prince_edward_island", abvName: "PEI" },
      { id: 9, label: "Quebec", value: "quebec", abvName: "QC" },
      { id: 10, label: "Saskatchewan", value: "saskatchewan", abvName: "SK" },
      { id: 11, label: "Northwest Territories", value: "northwest_territories", abvName: "NT" },
      { id: 12, label: "Nunavut", value: "nunavut", abvName: "NU" },
      { id: 13, label: "Yukon", value: "yukon", abvName: "YT" },
    ],
    work_eligibility: [
      { id: 1, label: "Canadian Citizen", value: "canadian_citizen" },
      { id: 2, label: "Permanent Resident", value: "permanent_resident" },
      { id: 3, label: "Work Permit Holder", value: "work_permit_holder" },
    ],
    shift_types: [
      { id: 1, label: "Morning", value: "morning" },
      { id: 2, label: "Evening", value: "evening" },
      { id: 3, label: "Night", value: "night" },
      { id: 4, label: "General", value: "general" },
    ],
    interview_types: [
      { id: 1, label: "Self Interview", value: "SELF" },
      { id: 2, label: "Job Interview", value: "JOB" },
    ],
    candidateCommonRequiredIdentityDocument: [
      {
        id: 0,
        type: "passport",
        label: "Passport",
        sides: 1,
        personal_dropdown: true,
        unique: true,
        countries_allowed: ["CA"],
        isRequired: true,
      },
    ],
    nonCanadianCandidateDocument: [
      {
        id: 0,
        type: "permanent_resident_card",
        label: "Permanent Resident (PR) Card",
        sides: 1,
        personal_dropdown: true,
        unique: true,
        countries_allowed: ["IN", "CA"],
        isRequired: false,
      },
      {
        id: 1,
        type: "work_permit",
        label: "Work Permit",
        sides: 1,
        personal_dropdown: true,
        unique: true,
        countries_allowed: ["IN", "CA"],
        isRequired: false,
      },
    ],
    professionalCertificates: [
      {
        type: "medical_license",
        label: "Medical License",
        sides: 1,
        personal_dropdown: true,
        unique: true,
        countries_allowed: ["CA"],
        isRequired: true,
      },
      {
        type: "first_aid_certificate",
        label: "First Aid Certificate",
        sides: 1,
        personal_dropdown: true,
        unique: true,
        countries_allowed: ["CA"],
        isRequired: true,
      },
      {
        type: "professional_liability_insurance",
        label: "Professional Liability Insurance",
        sides: 1,
        personal_dropdown: true,
        unique: true,
        countries_allowed: ["CA"],
        isRequired: true,
      },
      {
        type: "flu_vaccination_certificate",
        label: "Flu Vaccination Certificate",
        sides: 1,
        personal_dropdown: true,
        unique: true,
        countries_allowed: ["CA"],
        isRequired: true,
      },
      {
        type: "covid_vaccination_certificate",
        label: "COVID Vaccination Certificate",
        sides: 1,
        personal_dropdown: true,
        unique: true,
        countries_allowed: ["CA"],
        isRequired: true,
      },
      {
        type: "tb_screening_certificate",
        label: "TB Screening Certificate",
        sides: 1,
        personal_dropdown: true,
        unique: true,
        countries_allowed: ["CA"],
        isRequired: true,
      },
      {
        type: "criminal_record",
        label: "Criminal Record Check Less Than 6 month",
        sides: 1,
        personal_dropdown: true,
        unique: true,
        countries_allowed: ["CA"],
        isRequired: true,
      },
    ],
  },
};

const toLabelToValueMap = (options: readonly LabelValueOption[]): Record<string, string> =>
  Object.fromEntries(options.map((option) => [option.label, option.value]));

const toCamelCase = (value: string): string =>
  value.replace(/_([a-z])/g, (_, chr: string) => chr.toUpperCase());

const PROVINCE_VALUE_TO_BACKEND: Record<string, string> = Object.fromEntries(
  metaData.data.canadian_provinces.map((province) => [
    province.value,
    toCamelCase(province.value),
  ])
);

const PROVINCE_BACKEND_TO_VALUE: Record<string, string> = Object.fromEntries(
  Object.entries(PROVINCE_VALUE_TO_BACKEND).map(([k, v]) => [v, k])
);

const metadata = {
  job_title_mapping: {
    "Registered Nurse": "registered_nurse",
    "Licensed Practical Nurse": "licensed_practical_nurse",
    "Home Care Aid": "home_care_aid",
  },
  experience_mapping: {
    "0-1 Yrs": "0",
    "1-2 Yrs": "1",
    "2-3 Yrs": "2",
    "3-5 Yrs": "3",
    "5-7 Yrs": "5",
    "7-10 Yrs": "7",
    "10+ Yrs": "10",
  },
  job_type_mapping: toLabelToValueMap(metaData.data.job_types),
  qualification: ["Geriatric", "Geriatric Mental Health"],
  qualification_mapping: {
    Geriatric: "geriatric",
    "Geriatric Mental Health": "geriatric_mental_health",
  },
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
    "Geriatric Care": "geriatric_care",
    "Long Term Care": "long_term_care",
    "Dementia Care / Alzheimer Care": "dementia_care",
    "Complex Dementia Care": "complex_dementia_care",
    "Palliative Care / End of Life Care": "palliative_care",
    "Continuing Care / Residential Care": "continuing_care",
    "Rehabilitation Care": "rehabilitation_care",
    "Chronic Disease Care": "chronic_disease_care",
    "Wound Care": "wound_care",
    "Medication Management": "medication_management",
    "Mental Health & Behavioral Health Care": "mental_health",
    "Adult Mental Health": "adult_mental_health",
  },
} as const;

// ============================================================================
// CONVERTER FUNCTIONS
// ============================================================================

export function convertExperienceToBackend(frontendValue: string): string | null {
  if (!frontendValue) return null;
  return (
    metadata.experience_mapping[frontendValue as keyof typeof metadata.experience_mapping] ??
    frontendValue.split("-")[0].replace(/\D/g, "")
  );
}

export function convertJobTitleToBackend(frontendValue: string): string {
  if (!frontendValue) return "registered_nurse";

  // ✅ Already a slug — pass through untouched
  if (!frontendValue.includes(" ") && frontendValue === frontendValue.toLowerCase()) {
    return frontendValue;
  }

  // Look up in mapping
  const mapped = metadata.job_title_mapping[frontendValue as keyof typeof metadata.job_title_mapping];
  if (mapped) return mapped;

  // Fallback: display string → snake_case
  return frontendValue.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
}

export function convertJobTypeToBackend(
  jobType: string
): 'casual' | 'part_time' | 'full_time' {
  return (
    metadata.job_type_mapping[jobType as keyof typeof metadata.job_type_mapping] ??
    "casual"
  ) as 'casual' | 'part_time' | 'full_time';
}

export function convertJobTypeToFrontend(backendValue: string | null | undefined): string {
  if (!backendValue) return "Not specified";
  const entry = Object.entries(metadata.job_type_mapping).find(([, v]) => v === backendValue);
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
  if (PROVINCE_VALUE_TO_BACKEND[backendValue]) return backendValue;
  // Map from camelCase backend value
  return PROVINCE_BACKEND_TO_VALUE[backendValue] ?? undefined;
}

// ============================================================================
// OTHER HELPERS
// ============================================================================

// ============================================================================
// FILE VALIDATION HELPERS
// ============================================================================

function validateFile(
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

export default metadata;

// ✅ Use this for jobs (snake_case)
export const convertProvinceToJobBackend = (province: string | undefined): string | null => {
  if (!province) return null;
  if (PROVINCE_VALUE_TO_BACKEND[province]) return province;
  if (PROVINCE_BACKEND_TO_VALUE[province]) return PROVINCE_BACKEND_TO_VALUE[province];
  return province.toLowerCase().replace(/\s+/g, "_");
};
