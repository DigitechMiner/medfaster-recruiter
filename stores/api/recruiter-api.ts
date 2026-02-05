import { axiosInstance } from "./api-client";
import { ENDPOINTS } from "./api-endpoints";

// ============================================================================
// TYPES
// ============================================================================

export type OrganizationType =
  | 'hospital'
  | 'clinic'
  | 'long_term_care'
  | 'home_care'
  | 'pharmacy'
  | 'diagnostic_lab'
  | 'nursing_home'
  | 'rehabilitation_center'
  | 'hospice'
  | 'mental_health_facility'
  | 'public_health'
  | 'other';

export type CanadianProvince =
  | 'AB' | 'BC' | 'MB' | 'NB' | 'NL' | 'NS' | 'NT' | 'NU'
  | 'ON' | 'PE' | 'QC' | 'SK' | 'YT';

export interface RecruiterProfile {
  id: string;
  user_id: string;
  organization_name?: string;
  organization_type?: string;
  official_email_address?: string;
  contact_number?: string;
  organization_website?: string;
  canadian_business_number?: string;
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

export interface RecruiterDocument {
  id: string;
  recruiter_profile_id: string;
  document_type: string;
  document_url: string;
  verification_status: string;
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

export async function getRecruiterProfile() {
  const res = await axiosInstance.get(ENDPOINTS.RECRUITER_PROFILE);
  return (res.data as any).data.profile; // Returns the profile object
}

export async function updateRecruiterProfile(
  formData: FormData
): Promise<UpdateProfileResponse> {
  const res = await axiosInstance.patch<UpdateProfileResponse>(
    ENDPOINTS.RECRUITER_PROFILE_UPDATE,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return res.data;
}