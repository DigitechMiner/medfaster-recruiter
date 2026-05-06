// stores/api/common.api.ts
import { apiRequest } from "./api-client";
import { ENDPOINTS } from "./api-endpoints";

export interface MetadataOption {
  uuid: string;
  label: string;
  value: string;
}

export interface Department extends MetadataOption {
  jobTitles?: MetadataOption[];
}

export interface MetadataValueOption {
  id: number | string;
  label: string;
  value: string;
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
  device_id:    string;
  fcm_token:    string;
  platform:     "ios" | "android" | "web";
  device_name?: string;
  app_version?: string;
  os_version?:  string;
}

// ── Departments + Job Titles ───────────────────────────────────────────────

export const fetchDepartmentsAndJobTitles = async (): Promise<{
  departments: Department[];
  jobTitles:   MetadataOption[];
}> => {
  const res = await apiRequest<{ data: { departments: Department[]; jobTitles: MetadataOption[] } }>(
    ENDPOINTS.COMMON_DEPARTMENTS
  );
  return {
    departments: res.data?.departments ?? [],
    jobTitles:   res.data?.jobTitles   ?? [],
  };
};

// ── Specializations ────────────────────────────────────────────────────────

export const fetchSpecializations = async (): Promise<MetadataOption[]> => {
  const res = await apiRequest<{ data: { specialization: MetadataOption[] } }>(
    ENDPOINTS.COMMON_SPECIALIZATIONS
  );
  return res.data?.specialization ?? [];
};

// ── App Metadata (gender, jobTypes, work_eligibility, shiftTypes) ──────────

export const fetchAppMetadata = async (version?: string): Promise<{
  updated: boolean;
  version: string;
  data:    AppMetadata | null;
}> => {
  const query = version ? `?version=${version}` : "";
  const res = await apiRequest<{ updated: boolean; version: string; data: AppMetadata | null }>(
    `${ENDPOINTS.COMMON_METADATA}${query}`
  );
  return { updated: res.updated, version: res.version, data: res.data ?? null };
};

// ── FCM Device Registration ────────────────────────────────────────────────

export const registerFcmDevice = async (payload: RegisterFcmPayload) => {
  return apiRequest(ENDPOINTS.COMMON_FCM_REGISTER, {
    method: "POST",
    data: payload,            // axios uses `data`, not `body`
  });
};

export const setDeviceActive = async (device_id: string, is_active: boolean) => {
  return apiRequest(ENDPOINTS.COMMON_DEVICE_ACTIVE, {
    method: "POST",
    data: { device_id, is_active },
  });
};