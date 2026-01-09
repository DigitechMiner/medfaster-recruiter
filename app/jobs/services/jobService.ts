// services/job.service.ts

import {
  getRecruiterJobs,
  getRecruiterJob,
  createRecruiterJob,
  updateRecruiterJob,
  deleteRecruiterJob,
  getJobApplications,
  getCandidateDetails,
  type JobCreatePayload,
  type JobUpdatePayload,
} from '@/stores/api/recruiter-job-api';

class JobService {
  static async getAllJobs(params?: {
    page?: number;
    limit?: number;
    status?: 'draft' | 'published' | 'closed' | 'archived';
  }) {
    return await getRecruiterJobs(params);
  }

  static async getJobById(id: string) {
    const response = await getRecruiterJob(id);
    return response.job;
  }

  static async getJobDetails(id: string) {
    return await this.getJobById(id);
  }

  static async createJob(jobData: JobCreatePayload) {
    const response = await createRecruiterJob(jobData);
    return response.job;
  }

  static async updateJob(id: string, jobData: JobUpdatePayload) {
    const response = await updateRecruiterJob(id, jobData);
    return response.job;
  }

  static async deleteJob(id: string) {
    await deleteRecruiterJob(id);
  }

  // ✅ FIX: Add default empty object
  static async getCandidatesByStatus(params?: {
    job_id?: string;
    status?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
    page?: number;
    limit?: number;
  }) {
    return await getJobApplications(params || {}); // ← Add || {}
  }

  // ✅ FIX: Add default empty object
  static async getAllCandidates(job_id?: string) {
    return await getJobApplications(job_id ? { job_id } : {}); // ← Add : {}
  }

  static async getCandidateById(candidateId: string) {
    return await getCandidateDetails(candidateId);
  }
}

export default JobService;
