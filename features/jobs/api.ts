import { apiRequest, axiosInstance } from "@/stores/api/api-client";
import { ENDPOINTS } from "@/stores/api/api-endpoints";
import { extractData, extractRoot } from "@/stores/api/response-helpers";
import { toJobTitleSlug } from "@/utils/constant/job-title-slug";

import type {
  GenerateDescriptionPayload,
  GenerateDescriptionResponse,
  GenerateQuestionsPayload,
  GenerateQuestionsResponse,
  JobDescriptionInput,
  GetJobsParams,
  InterviewDetailsResponse,
  InterviewListItem,
  InterviewPagination,
  InterviewRequest,
  InterviewRequestStatus,
  JobApplicationListResponse,
  JobCreatePayload,
  JobCreateResponse,
  JobDeleteResponse,
  JobDetailResponse,
  JobFeePreviewPayload,
  JobFeePreviewResponse,
  JobUpdatePayload,
  JobUpdateResponse,
  JobsListResponse,
} from "./types";

// ============================================================================
// API FUNCTIONS — Jobs
// ============================================================================

export async function getRecruiterJobs(params?: GetJobsParams): Promise<JobsListResponse> {
  const res = await axiosInstance.get(ENDPOINTS.JOBS_LIST, { params });
  return extractRoot<JobsListResponse>(res.data);
}

export async function getRecruiterJob(id: string): Promise<JobDetailResponse> {
  const res = await axiosInstance.get(ENDPOINTS.JOBS_DETAIL(id));
  return extractRoot<JobDetailResponse>(res.data);
}

export async function createRecruiterJob(payload: JobCreatePayload & { status?: string }) {
  const res = await axiosInstance.post(ENDPOINTS.JOBS_CREATE, payload);
  return extractRoot<JobCreateResponse>(res.data);
}

export async function updateRecruiterJob(
  id: string,
  payload: JobUpdatePayload,
): Promise<JobUpdateResponse> {
  const res = await axiosInstance.patch(ENDPOINTS.JOBS_UPDATE(id), payload);
  return extractRoot<JobUpdateResponse>(res.data);
}

export async function deleteRecruiterJob(id: string): Promise<JobDeleteResponse> {
  const res = await axiosInstance.delete(ENDPOINTS.JOBS_DELETE(id));
  return extractRoot<JobDeleteResponse>(res.data);
}

export async function generateJobDescription(
  payload: GenerateDescriptionPayload,
): Promise<GenerateDescriptionResponse> {
  const res = await axiosInstance.post(ENDPOINTS.GENERATE_JOB_DESCRIPTION, payload);
  return extractRoot<GenerateDescriptionResponse>(res.data);
}

export async function generateJobQuestions(
  payload: GenerateQuestionsPayload,
): Promise<GenerateQuestionsResponse> {
  const res = await axiosInstance.post(ENDPOINTS.GENERATE_JOB_QUESTIONS, payload);
  return extractRoot<GenerateQuestionsResponse>(res.data);
}

/** Slugifies title, then returns only the inner `data` block (same behavior as legacy job-description helper). */
export async function generateJobDescriptionFromUi(
  input: JobDescriptionInput,
): Promise<GenerateDescriptionResponse["data"]> {
  const slug = toJobTitleSlug(input.jobTitle) ?? input.jobTitle;
  const envelope = await generateJobDescription({
    job_title: slug,
    department: input.department,
  });
  return envelope.data;
}

/** Returns question strings only (convenience for hooks). */
export async function generateInterviewQuestions(
  payload: GenerateQuestionsPayload,
): Promise<string[]> {
  const envelope = await generateJobQuestions(payload);
  return envelope.data?.questions ?? [];
}

export async function getJobFeePreview(
  params: JobFeePreviewPayload,
): Promise<JobFeePreviewResponse["data"]> {
  const body: JobFeePreviewPayload = {
    job_title: params.job_title,
    no_of_hires_required: params.no_of_hires_required,
    start_date: new Date(params.start_date).toISOString(),
    end_date: new Date(params.end_date).toISOString(),
    check_in_time: params.check_in_time,
    check_out_time: params.check_out_time,
  };
  const res = await axiosInstance.post(ENDPOINTS.JOBS_FEE_PREVIEW, body);
  return extractData<JobFeePreviewResponse["data"]>(res.data);
}

// ============================================================================
// API FUNCTIONS — Job Applications
// ============================================================================

export async function getJobApplications(params: {
  job_id?: string;
  status?:
    | "APPLIED"
    | "SHORTLISTED"
    | "INTERVIEWING"
    | "INTERVIEWED"
    | "HIRE"
    | "REJECTED"
    | "ACCEPTED"
    | "CANCELLED";
  page?: number;
  limit?: number;
  offset?: number;
}): Promise<JobApplicationListResponse> {
  const res = await axiosInstance.get(ENDPOINTS.JOB_APPLICATIONS, { params });
  return extractData<JobApplicationListResponse>(res.data);
}

export async function updateApplicationStatus(
  applicationId: string,
  status:
    | "APPLIED"
    | "SHORTLISTED"
    | "INTERVIEWING"
    | "INTERVIEWED"
    | "HIRE"
    | "REJECTED",
) {
  const res = await axiosInstance.patch(ENDPOINTS.JOB_APPLICATION_STATUS(applicationId), {
    status,
  });
  return extractRoot(res.data);
}

// ============================================================================
// API FUNCTIONS — Interviews (requests + sessions)
// ============================================================================

export async function fetchRecruiterInterviewRequests(
  status?: InterviewRequestStatus,
  page = 1,
  limit = 10,
): Promise<{
  interviewRequests: InterviewRequest[];
  pagination: InterviewPagination;
}> {
  const params: { page: number; limit: number; status?: InterviewRequestStatus } = {
    page,
    limit,
  };
  if (status) params.status = status;

  const res = await apiRequest<{
    data: {
      interviewRequests: InterviewRequest[];
      pagination: Omit<InterviewPagination, "page" | "total">;
    };
  }>(ENDPOINTS.INTERVIEW_REQUESTS, { method: "GET", params });

  const raw = res.data;
  return {
    interviewRequests: raw.interviewRequests,
    pagination: {
      ...raw.pagination,
      page: raw.pagination.currentPage,
      total: raw.pagination.totalCount,
    },
  };
}

export async function createRecruiterInterviewRequest(input: {
  candidate_id: string;
  job_application_id: string;
  message?: string;
  valid_until: string;
}) {
  const res = await apiRequest<{
    data: { interviewRequest: InterviewRequest };
  }>(ENDPOINTS.INTERVIEW_REQUESTS, {
    method: "POST",
    data: input,
  });

  return res.data.interviewRequest;
}

export async function cancelRecruiterInterviewRequest(id: string) {
  const res = await apiRequest<{
    data: { interviewRequest: InterviewRequest };
  }>(ENDPOINTS.INTERVIEW_REQUEST_CANCEL(id), {
    method: "PATCH",
  });

  return res.data.interviewRequest;
}

export async function getInterviewById(
  interviewId: string,
): Promise<InterviewDetailsResponse> {
  const res = await apiRequest<{ data: InterviewDetailsResponse }>(
    ENDPOINTS.RECRUITER_INTERVIEW_DETAILS(interviewId),
    { method: "GET" },
  );
  return res.data;
}

export async function getCandidateInterviews(
  candidateId: string,
): Promise<InterviewListItem[]> {
  const res = await apiRequest<{ data: { interviews: InterviewListItem[] } }>(
    ENDPOINTS.RECRUITER_CANDIDATE_INTERVIEWS(candidateId),
    { method: "GET" },
  );
  return res.data.interviews;
}

export async function getBookingInterviews(bookingId: string): Promise<InterviewListItem[]> {
  const res = await apiRequest<{ data: { interviews: InterviewListItem[] } }>(
    ENDPOINTS.RECRUITER_BOOKING_INTERVIEWS(bookingId),
    { method: "GET" },
  );
  return res.data.interviews;
}

export {
  addInHouseCandidate,
  removeInHouseCandidate,
  getCandidateDocumentUrl,
  inviteCandidateToJob,
} from "@/features/candidates";
