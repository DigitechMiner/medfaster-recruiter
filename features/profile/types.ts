// ============================================================================
// TYPES — auth, recruiter profile, documents, credentials
// ============================================================================

export type OrganizationType =
  | "hospital"
  | "clinic"
  | "nursing_home"
  | "medical_center"
  | "pharmacy"
  | "laboratory"
  | "long_term_care"
  | "home_care"
  | "diagnostic_lab"
  | "rehabilitation_center"
  | "hospice"
  | "mental_health_facility"
  | "public_health"
  | "other";

export type RecruiterStatus = "pending" | "active" | "suspended" | "rejected";

export type CanadianProvince =
  | "AB"
  | "BC"
  | "MB"
  | "NB"
  | "NL"
  | "NS"
  | "NT"
  | "NU"
  | "ON"
  | "PE"
  | "QC"
  | "SK"
  | "YT";

export interface RecruiterProfileData {
  id: string;
  user_id: string;
  organization_name: string | null;
  registered_business_name: string | null;
  organization_type: OrganizationType | null;
  official_email_address: string | null;
  contact_number: string | null;
  organization_website: string | null;
  organization_photo_url: string | null;
  street_address: string | null;
  postal_code: string | null;
  province: string | null;
  city: string | null;
  country: string | null;
  contact_person_name: string | null;
  contact_person_designation: string | null;
  contact_person_email: string | null;
  contact_person_phone: string | null;
  canadian_business_number?: string | null;
  gst_no?: string | null;
  primary_contact_person?: string | null;
  verified_by?: string | null;
  completion_percentage: number;
  status: RecruiterStatus;
  created_at: string;
  updated_at: string;
}

export type RecruiterProfile = RecruiterProfileData;

export interface RecruiterDocument {
  id: string;
  recruiter_profile_id: string;
  document_type: string;
  file_url: string;
  status: string;
  verified_by?: string | null;
  verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data: {
    profile: RecruiterProfileData;
    documents: RecruiterDocument[];
  };
}

export interface ProfileWithDocumentsResponse {
  success: boolean;
  message: string;
  data: { profile: RecruiterProfile; documents: RecruiterDocument[] };
}

export interface RecruiterDocumentViewResponse {
  success: boolean;
  message: string;
  data?: {
    document_id?: string;
    document_type?: string;
    file_url?: string;
    view_url?: string;
    url?: string;
    signed_url?: string;
  };
}

/** GET/PATCH /recruiter/credential — login email & phone (E.164) + verification flags */
export interface RecruiterCredential {
  email: string | null;
  phone: string | null;
  email_verified: boolean;
  phone_verified: boolean;
}

export interface RecruiterCredentialApiResponse {
  success: boolean;
  message: string;
  data: RecruiterCredential;
}

// ── Auth (OTP login) ─────────────────────────────────────────────────────────
export interface SendOtpPayload {
  email?: string;
  phone?: string;
  country_code?: string;
}

export interface SendOtpResponse {
  success: boolean;
  message: string;
}

export interface ValidateOtpPayload {
  otp: string;
  email?: string;
  phone?: string;
  country_code?: string;
}

export interface ValidateOtpResponse {
  success: boolean;
  message: string;
  data?: { token: string; user?: unknown };
}
