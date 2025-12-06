// lib/api/recruiterService.ts

import { apiRequest } from './client';
import { ENDPOINTS } from './endpoints';

// Match your backend interfaces
interface SendOtpPayload {
  email?: string;
  phone?: string;
  country_code?: string;
}

interface ValidateOtpPayload {
  email?: string;
  phone?: string;
  country_code?: string;
  otp: string;
}

interface SendOtpResponse {
  success: boolean;
  message: string;
}

interface ValidateOtpResponse {
  success: boolean;
  message: string;
  data?: {
    token: string; // This is set in cookie, not returned in body
    user?: any;
  };
}

interface ProfileResponse {
  success: boolean;
  message: string;
  data: {
    profile: {
      id: string;
      user_id: string;
      company_name?: string;
      organization_type?: string;
      contact_person?: string;
      status: string;
      created_at: string;
      updated_at: string;
    };
    documents: Array<{
      id: string;
      recruiter_profile_id: string;
      document_type: string;
      document_url: string;
      verification_status: string;
    }>;
  };
}

export const recruiterService = {
  /**
   * Send OTP to recruiter's phone or email
   * Backend sets JWT in HTTP-only cookie upon success
   */
  async sendOtp(
    phone: string, 
    countryCode: string = '+1'
  ): Promise<SendOtpResponse> {
    return apiRequest<SendOtpResponse>(ENDPOINTS.RECRUITER_SEND_OTP, {
      method: 'POST',
      body: JSON.stringify({
        phone, // Backend expects 'phone', not 'mobile'
        country_code: countryCode,
      } as SendOtpPayload),
    });
  },

  /**
   * Validate OTP and authenticate
   * Backend returns token in HTTP-only cookie (recruiter_token)
   */
  async validateOtp(
    phone: string, 
    otp: string, 
    countryCode: string = '+1'
  ): Promise<ValidateOtpResponse> {
    return apiRequest<ValidateOtpResponse>(ENDPOINTS.RECRUITER_VALIDATE_OTP, {
      method: 'POST',
      body: JSON.stringify({
        phone,
        otp,
        country_code: countryCode,
      } as ValidateOtpPayload),
    });
  },

  /**
   * Get recruiter profile
   * Uses JWT from HTTP-only cookie (no Authorization header needed)
   */
  async getProfile(): Promise<ProfileResponse> {
    return apiRequest<ProfileResponse>(ENDPOINTS.RECRUITER_PROFILE, {
      method: 'GET',
      // No Authorization header - cookie is sent automatically with credentials: 'include'
    });
  },
};
