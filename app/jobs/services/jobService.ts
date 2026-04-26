import {
  getRecruiterJobs,
  getRecruiterJob,
  createRecruiterJob,
  updateRecruiterJob,
  deleteRecruiterJob,
  getJobApplications,
} from '@/stores/api/recruiter-job-api';

// ✅ Import types from job.types.ts where they're actually defined
import type {
  JobCreatePayload,
  JobUpdatePayload,
} from '@/Interface/job.types';
import { getCandidateDetails } from '@/stores/api/recruiter-candidates-api';

class JobService {
  static async getAllJobs(params?: {
    page?:   number;
    limit?:  number;
    status?: 'DRAFT' | 'OPEN' | 'PAUSED' | 'CLOSED';
  }) {
    return await getRecruiterJobs(params);
  }

  static async getJobById(id: string) {
    const response = await getRecruiterJob(id);
    return response.data.job;  // ← .data.job based on your JobDetailResponse shape
  }

  static async getJobDetails(id: string) {
    return await this.getJobById(id);
  }

  static async createJob(jobData: JobCreatePayload) {
    const response = await createRecruiterJob(jobData);
    return response.data;  // ← .data based on your JobCreateResponse shape
  }

  static async updateJob(id: string, jobData: JobUpdatePayload) {
    const response = await updateRecruiterJob(id, jobData);
    return response.data;  // ← .data based on your JobUpdateResponse shape
  }

  static async deleteJob(id: string) {
    await deleteRecruiterJob(id);
  }

  static async getCandidatesByStatus(params?: {
  job_id?:  string;
  status?:  'APPLIED' | 'SHORTLISTED' | 'INTERVIEWING' | 'INTERVIEWED' | 'HIRE' | 'REJECTED' | 'ACCEPTED' | 'CANCELLED';
  page?:    number;
  limit?:   number;
  offset?:  number;
}) {
    return await getJobApplications(params ?? {});
  }

  static async getAllCandidates(job_id?: string) {
    return await getJobApplications(job_id ? { job_id } : {});
  }

  static async getCandidateById(candidateId: string) {
    return await getCandidateDetails(candidateId);
  }
}

export default JobService;