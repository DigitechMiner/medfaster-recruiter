import { apiRequest, axiosInstance } from "@/stores/api/api-client";
import { ENDPOINTS } from "@/stores/api/api-endpoints";
import { extractData, extractRoot } from "@/stores/api/response-helpers";

import type {
  CreateRecruiterShiftDisputePayload,
  CreateRecruiterShiftDisputeResponse,
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
  RecruiterJobCreateBody,
  JobCreateResponse,
  JobDeleteResponse,
  JobDetailRecord,
  JobDetailResponse,
  JobDisputeItem,
  JobDisputesResponse,
  InstantJobFeePreviewPayload,
  JobFeePreviewPayload,
  JobFeePreviewResponse,
  LegacyJobFeePreviewPayload,
  JobShiftItem,
  JobShiftPaymentItem,
  JobShiftPaymentsResponse,
  JobShiftDetailsResponse,
  JobShiftsParams,
  JobShiftsResponse,
  JobWalletTransactionItem,
  JobWalletTransactionsResponse,
  JobUpdatePayload,
  JobUpdateResponse,
  JobsSummaryData,
  JobsSummaryResponse,
  JobsListResponse,
} from "./types";

function isRecord(value: unknown): value is JobDetailRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeCollectionResponse<TItem, TResponse extends JobDetailRecord>(
  data: unknown,
  key: string,
): TResponse {
  if (Array.isArray(data)) {
    return { [key]: data } as TResponse;
  }

  if (!isRecord(data)) {
    return { [key]: [] } as TResponse;
  }

  return {
    ...data,
    [key]: Array.isArray(data[key]) ? (data[key] as TItem[]) : [],
  } as TResponse;
}

function normalizeJobWalletTransactions(data: unknown): JobWalletTransactionsResponse {
  if (Array.isArray(data)) {
    return { transactions: data as JobWalletTransactionItem[] };
  }

  if (!isRecord(data)) {
    return { transactions: [] };
  }

  let transactions: unknown[] = [];
  if (Array.isArray(data.transactions)) {
    transactions = data.transactions;
  } else if (Array.isArray(data.wallet_transactions)) {
    transactions = data.wallet_transactions;
  } else if (Array.isArray(data.walletTransactions)) {
    transactions = data.walletTransactions;
  } else if (Array.isArray(data.items)) {
    transactions = data.items;
  }

  return {
    ...data,
    transactions: transactions as JobWalletTransactionItem[],
  } as JobWalletTransactionsResponse;
}

// ============================================================================
// API FUNCTIONS — Jobs
// ============================================================================

export async function getRecruiterJobs(params?: GetJobsParams): Promise<JobsListResponse> {
  const res = await axiosInstance.get(ENDPOINTS.JOBS_LIST, { params });
  return extractRoot<JobsListResponse>(res.data);
}

export async function getRecruiterJobsSummary(): Promise<JobsSummaryData> {
  const res = await axiosInstance.get<JobsSummaryResponse>(ENDPOINTS.JOBS_SUMMARY);
  return res.data.data;
}

export async function getRecruiterJob(id: string): Promise<JobDetailResponse> {
  const res = await axiosInstance.get(ENDPOINTS.JOBS_DETAIL(id));
  return extractRoot<JobDetailResponse>(res.data);
}

export async function createRecruiterJob(
  payload: RecruiterJobCreateBody & { status?: string },
) {
  const res = await axiosInstance.post(ENDPOINTS.JOBS_CREATE, payload);
  return extractRoot<JobCreateResponse>(res.data);
}

export type JobFeesParams =
  | { feeType: "instant" }
  | { feeType: "normal"; yearsOfExperience: number };

export async function getJobFees(
  jobTitle: string,
  params: JobFeesParams,
): Promise<{ recruiter_pay_per_hour: number }> {
  const queryParams =
    params.feeType === "instant"
      ? { fee_type: "instant" }
      : {
          fee_type: "normal",
          years_of_experience: params.yearsOfExperience,
        };

  const res = await axiosInstance.get(ENDPOINTS.JOBS_FEES(jobTitle), {
    params: queryParams,
  });
  return extractData<{ recruiter_pay_per_hour: number }>(res.data);
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

/** Returns only the inner `data` block (same behavior as legacy job-description helper). */
export async function generateJobDescriptionFromUi(
  input: JobDescriptionInput,
): Promise<GenerateDescriptionResponse["data"]> {
  const envelope = await generateJobDescription({
    job_title: input.jobTitle,
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

function isLegacyFeePreviewPayload(
  params: JobFeePreviewPayload,
): params is LegacyJobFeePreviewPayload {
  return (
    "check_in_time" in params &&
    "no_of_hires_required" in params &&
    !("shift_templates" in params)
  );
}

function isInstantFeePreviewPayload(
  params: JobFeePreviewPayload,
): params is InstantJobFeePreviewPayload {
  return (
    "shift_templates" in params &&
    "no_of_hires_required" in params &&
    !("teams" in params)
  );
}

export async function getJobFeePreview(
  params: JobFeePreviewPayload,
): Promise<JobFeePreviewResponse["data"]> {
  const body = isLegacyFeePreviewPayload(params)
    ? {
        job_title: params.job_title,
        no_of_hires_required: params.no_of_hires_required,
        start_date: new Date(params.start_date).toISOString(),
        end_date: new Date(params.end_date).toISOString(),
        check_in_time: params.check_in_time,
        check_out_time: params.check_out_time,
      }
    : isInstantFeePreviewPayload(params)
      ? {
          ...params,
          start_date: new Date(params.start_date).toISOString(),
          end_date: new Date(params.end_date).toISOString(),
        }
      : {
          ...params,
          start_date: new Date(params.start_date).toISOString(),
          end_date: new Date(params.end_date).toISOString(),
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
  const { job_id: jobId, ...queryParams } = params;
  const endpoint = jobId ? ENDPOINTS.JOBS_DETAIL_APPLICATIONS(jobId) : ENDPOINTS.JOB_APPLICATIONS;
  const res = await axiosInstance.get(endpoint, { params: queryParams });
  const data = extractData<JobApplicationListResponse | JobApplicationListResponse["applications"]>(res.data);

  return Array.isArray(data) ? { applications: data, pagination: { total: data.length, count: data.length, page: 1, limit: data.length } } : data;
}

export async function getRecruiterJobShifts(
  jobId: string,
  params?: JobShiftsParams,
): Promise<JobShiftsResponse> {
  const res = await axiosInstance.get(ENDPOINTS.JOBS_DETAIL_SHIFTS(jobId), { params });
  return normalizeCollectionResponse<JobShiftItem, JobShiftsResponse>(extractData(res.data), "shifts");
}

export async function getRecruiterJobWalletTransactions(
  jobId: string,
): Promise<JobWalletTransactionsResponse> {
  const res = await axiosInstance.get(ENDPOINTS.JOBS_DETAIL_WALLET_TRANSACTIONS(jobId));
  return normalizeJobWalletTransactions(extractData(res.data));
}

export async function getRecruiterJobDisputes(jobId: string): Promise<JobDisputesResponse> {
  const res = await axiosInstance.get(ENDPOINTS.JOBS_DETAIL_DISPUTES(jobId));
  return normalizeCollectionResponse<JobDisputeItem, JobDisputesResponse>(extractData(res.data), "disputes");
}

export async function createRecruiterShiftDispute(
  payload: CreateRecruiterShiftDisputePayload,
): Promise<CreateRecruiterShiftDisputeResponse> {
  const res = await axiosInstance.post(ENDPOINTS.ESCROW_DISPUTE, payload);
  return extractRoot<CreateRecruiterShiftDisputeResponse>(res.data);
}

export async function getRecruiterJobShiftPayments(
  jobId: string,
  shiftId: string,
): Promise<JobShiftPaymentsResponse> {
  const res = await axiosInstance.get(ENDPOINTS.JOBS_DETAIL_SHIFT_PAYMENTS(jobId, shiftId));
  return normalizeCollectionResponse<JobShiftPaymentItem, JobShiftPaymentsResponse>(
    extractData(res.data),
    "payments",
  );
}

export async function getRecruiterJobShiftDetails(
  jobId: string,
  shiftId: string,
): Promise<JobShiftDetailsResponse> {
  const res = await axiosInstance.get(ENDPOINTS.JOBS_DETAIL_SHIFT_DETAILS(jobId, shiftId));
  const data = extractData<JobShiftDetailsResponse>(res.data);
  return isRecord(data) ? data : {};
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
