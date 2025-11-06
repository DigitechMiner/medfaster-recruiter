// TODO: Replace this mock service with actual API calls when backend is ready
// This service simulates API calls with a 500ms delay

import { TopJob, JobsData, Job, StatusType } from '@/Interface/job.types';
import { jobsData } from '../data/jobs';
import { candidatesData } from '../data/candidates';
import { jobDetailsData, JobDetailsData } from '../data/job-details';
import { JobFormData } from '../components/JobForm';

// Mock delay function to simulate API call
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class JobService {
  /**
   * TODO: Replace with actual API call
   * GET /api/jobs
   */
  static async getAllJobs(): Promise<TopJob[]> {
    await delay(500);
    return jobsData;
  }

  /**
   * TODO: Replace with actual API call
   * GET /api/jobs/:id
   */
  static async getJobById(id: number): Promise<TopJob | null> {
    await delay(500);
    return jobsData.find((job: TopJob) => job.id === id) || null;
  }

  /**
   * TODO: Replace with actual API call
   * GET /api/jobs/:id/details
   */
  static async getJobDetails(_jobId: number): Promise<JobDetailsData | null> {
    await delay(500);
    // In real API, this would fetch details for the specific job
    // For now, return the same mock data for all jobs
    return jobDetailsData;
  }

  /**
   * TODO: Replace with actual API call
   * GET /api/jobs/candidates
   */
  static async getCandidatesByStatus(status: StatusType): Promise<Job[]> {
    await delay(500);
    return candidatesData[status] || [];
  }

  /**
   * TODO: Replace with actual API call
   * GET /api/jobs/candidates/:id
   */
  static async getCandidateById(id: string): Promise<{ job: Job; status: StatusType } | null> {
    await delay(500);
    const statuses: StatusType[] = ['applied', 'shortlisted', 'interviewing', 'hired'];

    for (const status of statuses) {
      const candidate = candidatesData[status].find((job: Job) => job.id.toString() === id);
      if (candidate) {
        return { job: candidate, status };
      }
    }

    return null;
  }

  /**
   * TODO: Replace with actual API call
   * GET /api/jobs/candidates/all
   */
  static async getAllCandidates(): Promise<JobsData> {
    await delay(500);
    return candidatesData;
  }

  /**
   * TODO: Replace with actual API call
   * POST /api/jobs
   */
  static async createJob(_jobData: JobFormData): Promise<TopJob> {
    await delay(500);
    // In real API, this would create a new job
    throw new Error('Not implemented - will be added when API is ready');
  }

  /**
   * TODO: Replace with actual API call
   * PUT /api/jobs/:id
   */
  static async updateJob(_id: number, _jobData: Partial<JobFormData>): Promise<TopJob> {
    await delay(500);
    // In real API, this would update the job
    throw new Error('Not implemented - will be added when API is ready');
  }

  /**
   * TODO: Replace with actual API call
   * DELETE /api/jobs/:id
   */
  static async deleteJob(_id: number): Promise<void> {
    await delay(500);
    // In real API, this would delete the job
    throw new Error('Not implemented - will be added when API is ready');
  }
}

export default JobService;

