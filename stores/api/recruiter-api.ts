import { axiosInstance } from "./api-client";
import { ENDPOINTS } from "./api-endpoints";

// ============================================================================
// TYPES
// ============================================================================

export type OrganizationType =
  | 'hospital' | 'clinic' | 'long_term_care' | 'home_care'
  | 'pharmacy' | 'diagnostic_lab' | 'nursing_home' | 'rehabilitation_center'
  | 'hospice' | 'mental_health_facility' | 'public_health' | 'other';

export type CanadianProvince =
  | 'AB' | 'BC' | 'MB' | 'NB' | 'NL' | 'NS' | 'NT' | 'NU'
  | 'ON' | 'PE' | 'QC' | 'SK' | 'YT';

export interface RecruiterProfile {
  id: string;
  user_id: string;
  organization_name?: string;
  registered_business_name?: string;
  organization_type?: string;
  official_email_address?: string;
  contact_number?: string;
  organization_website?: string;
  canadian_business_number?: string;
  gst_no?: string;
  organization_photo_url?: string;
  street_address?: string;
  postal_code?: string;
  province?: string;
  city?: string;
  country?: string;
  primary_contact_person?: string;
  contact_person_name?: string;
  contact_person_designation?: string;
  contact_person_email?: string;
  contact_person_phone?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// ✅ Single source of truth — matches actual API response fields
export interface RecruiterDocument {
  id: string;
  recruiter_profile_id: string;
  document_type: string;
  file_url: string;        // ← actual API field
  status: string;          // ← actual API field
  created_at?: string;
  updated_at?: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data: {
    profile: RecruiterProfile;
    documents: RecruiterDocument[];
  };
}

const multipartHeaders = { headers: { "Content-Type": "multipart/form-data" } } as const;

// ============================================================================
// API FUNCTIONS
// ============================================================================

export async function getRecruiterProfile(): Promise<RecruiterProfile> {
  const res = await axiosInstance.get<{
    success: boolean;
    message: string;
    data: { profile: RecruiterProfile };
  }>(ENDPOINTS.RECRUITER_PROFILE);
  return res.data.data.profile;
}

export async function updateRecruiterProfile(
  formData: FormData
): Promise<UpdateProfileResponse> {
  const res = await axiosInstance.patch<UpdateProfileResponse>(
    ENDPOINTS.RECRUITER_PROFILE_UPDATE,
    formData,
    multipartHeaders
  );
  return res.data;
}

export async function registerRecruiterStep(
  formData: FormData,
  step: 1 | 2 | 3
): Promise<UpdateProfileResponse> {
  const res = await axiosInstance.post<UpdateProfileResponse>(
    `${ENDPOINTS.RECRUITER_REGISTER}?step=${step}`,
    formData,
    multipartHeaders
  );
  return res.data;
}
