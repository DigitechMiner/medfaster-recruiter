// ============================================================================
// TYPES — shared metadata, departments, FCM
// ============================================================================

export interface MetadataOption {
  uuid: string;
  label: string;
  value: string;
  /** Numeric id from the API (job titles, etc.). */
  id?: number;
  /** Job title ids this specialization applies to (from specializations API). */
  job_title_ids?: number[];
}

export interface Department extends MetadataOption {
  jobTitles?: MetadataOption[];
}

export interface MetadataValueOption {
  id: number | string;
  label: string;
  value: string;
  abvName?: string;
  cities?: { id: number; label: string; value: string }[];
  [key: string]: unknown;
}

export interface MetadataDocumentOption {
  id?: number | string;
  type: string;
  label: string;
  sides: number;
  personal_dropdown: boolean;
  unique: boolean;
  countries_allowed: string[];
  isRequired: boolean;
}

export interface AppMetadata {
  gender?: MetadataValueOption[];
  job_types?: MetadataValueOption[];
  work_experience_employment_types?: MetadataValueOption[];
  countryList?: MetadataValueOption[];
  social_media_platforms?: MetadataValueOption[];
  organisation_type?: MetadataValueOption[];
  location_options?: MetadataValueOption[];
  canadian_provinces?: MetadataValueOption[];
  work_eligibility?: MetadataValueOption[];
  shift_types?: MetadataValueOption[];
  interview_types?: MetadataValueOption[];
  candidateCommonRequiredIdentityDocument?: MetadataDocumentOption[];
  nonCanadianCandidateDocument?: MetadataDocumentOption[];
  professionalCertificates?: MetadataDocumentOption[];

  // legacy keys kept optional for backward compatibility
  jobTypes?: MetadataValueOption[];
  shiftTypes?: MetadataValueOption[];
  specialization?: MetadataValueOption[];
}

export interface RegisterFcmPayload {
  device_id: string;
  fcm_token: string;
  platform: "ios" | "android" | "web";
  device_name?: string;
  app_version?: string;
  os_version?: string;
}

export interface AppMetadataFetchResult {
  updated: boolean;
  version: string;
  data: AppMetadata | null;
}

export interface DepartmentsAndJobTitlesResult {
  departments: Department[];
  jobTitles: MetadataOption[];
}
