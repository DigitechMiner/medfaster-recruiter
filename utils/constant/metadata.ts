/**
 * ============================================================================
 * METADATA.TS - SINGLE SOURCE OF TRUTH FOR FORM/DROPDOWN CONSTANTS
 * ============================================================================
 */
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

export const DEFAULT_NEIGHBORHOOD_TYPES = [
  "Independent Living",
  "Assisted Living",
  "Dementia / Memory Care",
  "Complex Dementia Care",
  "Adult Mental Health",
];

export const CDSW_NEIGHBORHOOD_TYPES = [
  "Group Home / Community Residential Home",
  "Intermediate Care / Community Care Facility for Developmental Disabilities",
  "Supported Independent Living (SIL)",
  "Board-and-Care / Adult Foster Care Homes",
  "Specialized Nursing Homes / Skilled Nursing for Disabilities",
  "Rehabilitation and Step-down Residential Care Programs",
];

type MetadataLabelValueOption = {
  label: string;
  value: string;
};

export function getMetadataLabel(
  options: readonly MetadataLabelValueOption[],
  value: string | null | undefined,
): string {
  if (!value) return "";
  return (
    options.find((option) => option.value === value || option.label === value)?.label ??
    value
  );
}

export function getMetadataValue(
  options: readonly MetadataLabelValueOption[],
  labelOrValue: string | null | undefined,
): string | undefined {
  if (!labelOrValue) return undefined;
  return options.find(
    (option) => option.value === labelOrValue || option.label === labelOrValue,
  )?.value;
}

// ============================================================================
// PROVINCE CONVERTERS
// ============================================================================

export function convertProvinceToFrontend(backendValue: string | null | undefined): string | undefined {
  return getMetadataValue(metaData.data.canadian_provinces, backendValue);
}

// ✅ Use this for jobs (snake_case)
export const convertProvinceToJobBackend = (province: string | undefined): string | null => {
  if (!province) return null;
  return (
    getMetadataValue(metaData.data.canadian_provinces, province) ??
    province.toLowerCase().replace(/\s+/g, "_")
  );
};
