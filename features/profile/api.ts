import { axiosInstance } from "@/stores/api/api-client";
import { ENDPOINTS } from "@/stores/api/api-endpoints";

import type {
  ProfileWithDocumentsResponse,
  RecruiterCredentialApiResponse,
  RecruiterDocumentViewResponse,
  RecruiterProfile,
  SendOtpPayload,
  SendOtpResponse,
  UpdateProfileResponse,
  ValidateOtpPayload,
  ValidateOtpResponse,
} from "./types";

const multipartHeaders = { headers: { "Content-Type": "multipart/form-data" } } as const;

// ============================================================================
// API FUNCTIONS — Auth (OTP login + logout)
// ============================================================================

export async function sendRecruiterOtp(
  payload: SendOtpPayload,
): Promise<SendOtpResponse> {
  const res = await axiosInstance.post<SendOtpResponse>(
    ENDPOINTS.RECRUITER_SEND_OTP,
    payload,
  );
  return res.data;
}

export async function validateRecruiterOtp(
  payload: ValidateOtpPayload,
): Promise<ValidateOtpResponse> {
  const res = await axiosInstance.post<ValidateOtpResponse>(
    ENDPOINTS.RECRUITER_VALIDATE_OTP,
    payload,
  );
  return res.data;
}

export async function logoutRecruiter(): Promise<void> {
  await axiosInstance.post(ENDPOINTS.RECRUITER_LOGOUT);
}

// ============================================================================
// API FUNCTIONS — Profile + Registration
// ============================================================================

export async function getRecruiterProfile(): Promise<RecruiterProfile> {
  const res = await axiosInstance.get<{
    success: boolean;
    message: string;
    data: { profile: RecruiterProfile };
  }>(ENDPOINTS.RECRUITER_PROFILE);
  return res.data.data.profile;
}

/** Same endpoint as `getRecruiterProfile`, but returns the full envelope including documents. */
export async function getRecruiterProfileWithDocuments(): Promise<ProfileWithDocumentsResponse> {
  const res = await axiosInstance.get<ProfileWithDocumentsResponse>(
    ENDPOINTS.RECRUITER_PROFILE,
  );
  return res.data;
}

export async function updateRecruiterProfile(
  formData: FormData,
): Promise<UpdateProfileResponse> {
  const res = await axiosInstance.patch<UpdateProfileResponse>(
    ENDPOINTS.RECRUITER_PROFILE_UPDATE,
    formData,
    multipartHeaders,
  );
  return res.data;
}

export async function registerRecruiterStep(
  formData: FormData,
  step: 1 | 2 | 3,
): Promise<UpdateProfileResponse> {
  const res = await axiosInstance.post<UpdateProfileResponse>(
    `${ENDPOINTS.RECRUITER_REGISTER}?step=${step}`,
    formData,
    multipartHeaders,
  );
  return res.data;
}

export async function viewRecruiterDocument(
  id: string,
): Promise<RecruiterDocumentViewResponse> {
  const res = await axiosInstance.get<RecruiterDocumentViewResponse>(
    ENDPOINTS.RECRUITER_DOCUMENT_VIEW(id),
  );
  return res.data;
}

// ============================================================================
// API FUNCTIONS — Login Credential (email/phone) + Verification
// ============================================================================

export async function getRecruiterCredential(): Promise<RecruiterCredentialApiResponse> {
  const res = await axiosInstance.get<RecruiterCredentialApiResponse>(
    ENDPOINTS.RECRUITER_CREDENTIAL,
  );
  return res.data;
}

export async function updateRecruiterCredential(body: {
  email?: string | null;
  phone?: string | null;
}): Promise<RecruiterCredentialApiResponse> {
  const res = await axiosInstance.patch<RecruiterCredentialApiResponse>(
    ENDPOINTS.RECRUITER_CREDENTIAL,
    body,
  );
  return res.data;
}

/**
 * Send OTP for verifying login email or phone (session must match saved credential).
 * Backend: `POST /api/v1/recruiter/verify-credential/send-otp` — authenticateRecruiter, validateSendOtp, then send-verify handler.
 * Body matches login send-OTP (`email` xor `phone` + optional `country_code` for phone).
 */
export async function sendVerifyCredentialOtp(body: {
  email?: string;
  phone?: string;
  country_code?: string;
}): Promise<{ success: boolean; message: string }> {
  const res = await axiosInstance.post<{ success: boolean; message: string }>(
    ENDPOINTS.VERIFY_CREDENTIAL_SEND_OTP,
    body,
  );
  return res.data;
}

/**
 * Submit OTP for credential verification.
 * Backend: `POST /api/v1/recruiter/verify-credential/validate-otp` — authenticateRecruiter, validateVerifyCredentialOtpMiddleware, then validate handler.
 */
export async function validateVerifyCredentialOtp(body: {
  otp: string;
  email?: string;
  phone?: string;
  country_code?: string;
}): Promise<RecruiterCredentialApiResponse> {
  const res = await axiosInstance.post<RecruiterCredentialApiResponse>(
    ENDPOINTS.VERIFY_CREDENTIAL_VALIDATE_OTP,
    body,
  );
  return res.data;
}
