// lib/api/recruiterService.ts

import { apiRequest } from './client';
import { ENDPOINTS } from './endpoints';
import type {
  JobsListResponse,
  JobDetailResponse,
  JobCreateResponse,
  JobUpdateResponse,
  JobDeleteResponse,
  JobCreatePayload,
  JobUpdatePayload,
} from '@/Interface/job.types';

// ============ AUTH TYPES ============
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
    token: string;
    user?: {
      id: string;
      phone: string;
      [key: string]: unknown;
    };
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
  // ============ AUTH METHODS ============
  async sendOtp(phone: string, countryCode: string = '+1'): Promise<SendOtpResponse> {
    return apiRequest<SendOtpResponse>(ENDPOINTS.RECRUITER_SEND_OTP, {
      method: 'POST',
      body: JSON.stringify({
        phone,
        country_code: countryCode,
      } as SendOtpPayload),
    });
  },

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

  async getProfile(): Promise<ProfileResponse> {
    return apiRequest<ProfileResponse>(ENDPOINTS.RECRUITER_PROFILE, {
      method: 'GET',
    });
  },

  // ============ JOBS CRUD METHODS ============
  /**
   * Get all jobs with pagination and filtering
   * @param params - Query parameters for filtering and pagination
   */
  async getJobs(params?: {
    status?: 'draft' | 'published' | 'closed' | 'archived';
    page?: number;
    limit?: number;
    offset?: number;
  }): Promise<JobsListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const endpoint = queryParams.toString()
      ? `${ENDPOINTS.JOBS_LIST}?${queryParams.toString()}`
      : ENDPOINTS.JOBS_LIST;

    return apiRequest<JobsListResponse>(endpoint, {
      method: 'GET',
    });
  },

  /**
   * Get a single job by ID
   * @param jobId - UUID of the job
   */
  async getJob(jobId: string): Promise<JobDetailResponse> {
    return apiRequest<JobDetailResponse>(ENDPOINTS.JOBS_DETAIL(jobId), {
      method: 'GET',
    });
  },

  /**
   * Create a new job
   * @param jobData - Job creation payload
   */
  async createJob(jobData: JobCreatePayload): Promise<JobCreateResponse> {
    return apiRequest<JobCreateResponse>(ENDPOINTS.JOBS_CREATE, {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  },

  /**
   * Update an existing job
   * @param jobId - UUID of the job
   * @param jobData - Job update payload
   */
  async updateJob(jobId: string, jobData: JobUpdatePayload): Promise<JobUpdateResponse> {
    return apiRequest<JobUpdateResponse>(ENDPOINTS.JOBS_UPDATE(jobId), {
      method: 'PATCH',
      body: JSON.stringify(jobData),
    });
  },

  /**
   * Delete a job
   * @param jobId - UUID of the job
   */
  async deleteJob(jobId: string): Promise<JobDeleteResponse> {
    return apiRequest<JobDeleteResponse>(ENDPOINTS.JOBS_DELETE(jobId), {
      method: 'DELETE',
    });
  },
};
