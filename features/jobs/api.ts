import { apiRequest, axiosInstance } from "@/stores/api/api-client";
import { ENDPOINTS } from "@/stores/api/api-endpoints";
import { extractData, extractRoot } from "@/stores/api/response-helpers";
import { JOB_SHIFT_RECORD_STATUSES } from "./types";

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
  ApplicationStatus,
  JobApplicationListResponse,
  JobChildrenResponse,
  JobChildListItem,
  JobCreatePayload,
  RecruiterJobCreateBody,
  JobCreateResponse,
  CloseJobPayload,
  CloseJobResponse,
  JobDeleteResponse,
  JobDetailRecord,
  JobDetailResponse,
  JobDetailActivityData,
  JobDetailActivityEvent,
  JobDetailDescriptionData,
  JobDetailPaymentsData,
  JobDetailPaymentCycle,
  JobPaymentInvoice,
  JobPaymentLedgerSummary,
  JobFeeBreakdown,
  JobFeeBreakdownContract,
  JobPreviewTaxSummary,
  JobDetailSummaryData,
  JobScheduleData,
  JobWorkersResponse,
  JobTeamParams,
  JobTeamResponse,
  JobInfoResponse,
  RecruiterJobInfo,
  JobDisputeItem,
  JobDisputesResponse,
  JobFeePreviewPayload,
  JobFeePreviewResponse,
  JobShiftItem,
  JobShiftStatus,
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
  FeesSummaryData,
  FeesSummaryScope,
  ProvinceTaxesData,
  UpdateApplicationStatusPayload,
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

function normalizeJobChildren(data: unknown): JobChildrenResponse {
  if (Array.isArray(data)) {
    return { children: data as JobChildListItem[], pagination: null };
  }

  if (!isRecord(data)) {
    return { children: [], pagination: null };
  }

  const children = Array.isArray(data.children)
    ? (data.children as JobChildListItem[])
    : Array.isArray(data.jobs)
      ? (data.jobs as JobChildListItem[])
      : Array.isArray(data.child_jobs)
        ? (data.child_jobs as JobChildListItem[])
        : Array.isArray(data.instant_shifts)
          ? (data.instant_shifts as JobChildListItem[])
          : Array.isArray(data.items)
            ? (data.items as JobChildListItem[])
            : [];

  const pagination = isRecord(data.pagination)
    ? (data.pagination as unknown as NonNullable<JobChildrenResponse["pagination"]>)
    : null;

  return { ...data, children, pagination } as JobChildrenResponse;
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

export async function getRecruiterJobSummary(
  id: string,
): Promise<JobDetailSummaryData> {
  const res = await axiosInstance.get(ENDPOINTS.JOBS_DETAIL_SUMMARY(id));
  const data = extractData<JobDetailSummaryData>(res.data);
  return {
    ...data,
    specializations: Array.isArray(data.specializations)
      ? data.specializations.map((item) => String(item).trim()).filter(Boolean)
      : [],
  };
}

export async function getRecruiterJobChildren(
  id: string,
  params?: {
    page?: number;
    limit?: number;
    job_urgency?: string;
    status?: string;
  },
): Promise<JobChildrenResponse> {
  const res = await axiosInstance.get(ENDPOINTS.JOBS_DETAIL_CHILDREN(id), {
    params,
  });
  return normalizeJobChildren(extractData<unknown>(res.data));
}

export async function getRecruiterJobDescription(
  id: string,
): Promise<JobDetailDescriptionData> {
  const res = await axiosInstance.get(ENDPOINTS.JOBS_DETAIL_DESCRIPTION(id));
  const data = extractData<JobDetailDescriptionData>(res.data);
  return {
    ...data,
    specializations: Array.isArray(data.specializations)
      ? data.specializations.map((item) => String(item).trim()).filter(Boolean)
      : [],
  };
}

function flattenQuestionItems(items: unknown[]): string[] {
  return items.flatMap((item) => {
    if (typeof item === "string" && item.trim()) return [item.trim()];
    if (!isRecord(item)) return [];
    const text = item.text ?? item.question ?? item.title;
    if (typeof text === "string" && text.trim()) return [text.trim()];
    if (Array.isArray(item.questions)) return flattenQuestionItems(item.questions);
    return [];
  });
}

function flattenGroupedQuestions(value: unknown): string[] {
  if (!isRecord(value)) return [];
  return Object.values(value).flatMap((entry) => {
    if (typeof entry === "string" && entry.trim()) return [entry.trim()];
    if (Array.isArray(entry)) return flattenQuestionItems(entry);
    if (isRecord(entry) && Array.isArray(entry.questions)) {
      return flattenQuestionItems(entry.questions);
    }
    return [];
  });
}

function normalizeJobQuestions(data: unknown): string[] {
  if (Array.isArray(data)) return flattenQuestionItems(data);
  if (!isRecord(data)) return [];

  const questions = data.questions;
  if (Array.isArray(questions)) return flattenQuestionItems(questions);
  if (isRecord(questions)) return flattenGroupedQuestions(questions);
  return [];
}

export async function getRecruiterJobQuestions(id: string): Promise<string[]> {
  const res = await axiosInstance.get(ENDPOINTS.JOBS_DETAIL_QUESTIONS(id));
  return normalizeJobQuestions(extractData<unknown>(res.data));
}

function normalizeJobActivity(data: unknown): JobDetailActivityData {
  if (!isRecord(data)) {
    return { events: [] };
  }

  const events = Array.isArray(data.events)
    ? (data.events as JobDetailActivityEvent[])
    : Array.isArray(data.activity)
      ? (data.activity as JobDetailActivityEvent[])
      : Array.isArray(data)
        ? (data as JobDetailActivityEvent[])
        : [];

  const sortedEvents = [...events].sort((a, b) => {
    const aTime = new Date(
      a.occurred_at ?? a.timestamp ?? a.created_at ?? 0,
    ).getTime();
    const bTime = new Date(
      b.occurred_at ?? b.timestamp ?? b.created_at ?? 0,
    ).getTime();
    return bTime - aTime;
  });

  return {
    job_id: typeof data.job_id === "string" ? data.job_id : undefined,
    events: sortedEvents,
  };
}

export async function getRecruiterJobActivity(
  id: string,
): Promise<JobDetailActivityData> {
  const res = await axiosInstance.get(ENDPOINTS.JOBS_DETAIL_ACTIVITY(id));
  const data = extractData<unknown>(res.data);
  return normalizeJobActivity(data);
}

function asCents(value: unknown): string | number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") return value;
  return undefined;
}

function asOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
}

function normalizePaymentInvoice(value: unknown): JobPaymentInvoice | null {
  if (!isRecord(value)) return null;
  return {
    id: asOptionalString(value.id),
    invoice_number: asOptionalString(value.invoice_number) ?? null,
    due_date: asOptionalString(value.due_date) ?? null,
    total_amount_cents: asCents(value.total_amount_cents) ?? null,
    paid_at: asOptionalString(value.paid_at) ?? null,
    status: asOptionalString(value.status) ?? null,
  };
}

function normalizePaymentLedgerSummary(
  value: unknown,
): JobPaymentLedgerSummary | null {
  if (!isRecord(value)) return null;
  return {
    total_payment_received_cents: asCents(value.total_payment_received_cents),
    total_candidate_payout_cents: asCents(value.total_candidate_payout_cents),
    total_platform_fee_cents: asCents(value.total_platform_fee_cents),
    total_tax_collected_cents: asCents(value.total_tax_collected_cents),
    total_refund_cents: asCents(value.total_refund_cents),
    total_tax_refund_cents: asCents(value.total_tax_refund_cents),
    total_adjustment_cents: asCents(value.total_adjustment_cents),
    held_amount_cents: asCents(value.held_amount_cents),
  };
}

function normalizePaymentCycle(
  value: unknown,
  index: number,
): JobDetailPaymentCycle {
  if (!isRecord(value)) {
    return { label: `Cycle ${index + 1}` };
  }

  const cycleNumber =
    typeof value.cycle_number === "number" && Number.isFinite(value.cycle_number)
      ? value.cycle_number
      : index + 1;
  const actual = asCents(value.actual_amount_cents);
  const estimated = asCents(value.estimated_amount_cents);

  return {
    id: asOptionalString(value.id),
    cycle_number: cycleNumber,
    label: asOptionalString(value.label) ?? `Cycle ${cycleNumber}`,
    period_start:
      asOptionalString(value.period_start_date) ??
      asOptionalString(value.period_start),
    period_end:
      asOptionalString(value.period_end_date) ??
      asOptionalString(value.period_end),
    estimated_amount_cents: estimated,
    actual_amount_cents: actual,
    refund_amount_cents: asCents(value.refund_amount_cents),
    amount_cents: actual ?? estimated ?? asCents(value.amount_cents),
    status: asOptionalString(value.status),
    shift_count:
      typeof value.shift_count === "number" ? value.shift_count : undefined,
    invoice: normalizePaymentInvoice(value.invoice),
    ledger: normalizePaymentLedgerSummary(value.ledger),
  };
}

function normalizeFeeBreakdownTax(value: unknown): JobPreviewTaxSummary | null {
  if (!isRecord(value)) return null;
  const components = Array.isArray(value.components)
    ? value.components.flatMap((component) => {
        if (!isRecord(component)) return [];
        return [
          {
            tax_name: asOptionalString(component.tax_name) ?? "Tax",
            tax_percentage: Number(component.tax_percentage ?? 0),
            display_order: Number(component.display_order ?? 0),
            tax_amount_cents: Number(component.tax_amount_cents ?? 0),
          },
        ];
      })
    : [];

  return {
    components,
    total_tax_cents: Number(value.total_tax_cents ?? 0),
    total_tax_percentage: Number(value.total_tax_percentage ?? 0),
  };
}

function normalizeFeeBreakdownContract(
  value: unknown,
): JobFeeBreakdownContract | null {
  if (!isRecord(value)) return null;
  return {
    recruiter_pay_cents: asCents(value.recruiter_pay_cents),
    candidate_share_cents: asCents(value.candidate_share_cents),
    platform_share_cents: asCents(value.platform_share_cents),
    tax: normalizeFeeBreakdownTax(value.tax),
    total_tax_cents: asCents(value.total_tax_cents),
    total_pay_cents: asCents(value.total_pay_cents),
  };
}

function normalizeFeeBreakdown(value: unknown): JobFeeBreakdown | null {
  if (!isRecord(value)) return null;
  const perHour = isRecord(value.per_hour) ? value.per_hour : null;
  const components = Array.isArray(value.components)
    ? value.components.flatMap((component) => {
        if (!isRecord(component)) return [];
        return [
          {
            payee: asOptionalString(component.payee) ?? "",
            code: asOptionalString(component.code) ?? "",
            name: asOptionalString(component.name) ?? "",
            value_type: asOptionalString(component.value_type) ?? "",
            percentage: Number(component.percentage ?? 0),
            amount_per_hour_cents: Number(component.amount_per_hour_cents ?? 0),
            display_order: Number(component.display_order ?? 0),
          },
        ];
      })
    : [];

  return {
    province: asOptionalString(value.province) ?? null,
    candidate_percentage:
      typeof value.candidate_percentage === "number"
        ? value.candidate_percentage
        : null,
    platform_percentage:
      typeof value.platform_percentage === "number"
        ? value.platform_percentage
        : null,
    per_hour: perHour
      ? {
          recruiter_pay_per_hour_cents: Number(
            perHour.recruiter_pay_per_hour_cents ?? 0,
          ),
          candidate_receive_per_hour_cents: Number(
            perHour.candidate_receive_per_hour_cents ?? 0,
          ),
          platform_fee_per_hour_cents: Number(
            perHour.platform_fee_per_hour_cents ?? 0,
          ),
        }
      : null,
    components,
    contract: normalizeFeeBreakdownContract(value.contract),
  };
}

function extractPaymentTransactions(data: JobDetailRecord): JobWalletTransactionItem[] {
  if (Array.isArray(data.ledger)) {
    return data.ledger as JobWalletTransactionItem[];
  }
  if (Array.isArray(data.transactions)) {
    return data.transactions as JobWalletTransactionItem[];
  }
  if (Array.isArray(data.wallet_transactions)) {
    return data.wallet_transactions as JobWalletTransactionItem[];
  }
  const funding = isRecord(data.funding) ? data.funding : null;
  if (funding && Array.isArray(funding.ledger)) {
    return funding.ledger as JobWalletTransactionItem[];
  }
  return [];
}

function normalizeJobPayments(data: unknown): JobDetailPaymentsData {
  if (!isRecord(data)) {
    return { cycles: [], ledger: [], ledger_summary: null };
  }

  const funding = isRecord(data.funding) ? data.funding : null;
  const ledgerSummary =
    normalizePaymentLedgerSummary(data.ledger) ??
    (funding ? normalizePaymentLedgerSummary(funding.ledger) : null);
  const rawCycles = Array.isArray(data.cycles)
    ? data.cycles
    : funding && Array.isArray(funding.cycles)
      ? funding.cycles
      : [];
  const cycles = rawCycles.map(normalizePaymentCycle);
  const transactions = extractPaymentTransactions(data);
  const fundingStatus =
    asOptionalString(data.funding_status) ??
    (funding ? asOptionalString(funding.status) : undefined);

  return {
    job_id: asOptionalString(data.job_id),
    contract_amount_cents:
      asCents(data.contract_amount_cents) ??
      (funding ? asCents(funding.total_contract_amount_cents) : undefined),
    escrow_held_cents:
      asCents(data.escrow_held_cents) ??
      (ledgerSummary?.held_amount_cents ?? undefined),
    spent_cents: asCents(data.spent_cents),
    refunded_cents:
      asCents(data.refunded_cents) ??
      asCents(ledgerSummary?.total_refund_cents),
    funding_status: fundingStatus,
    fee_breakdown: normalizeFeeBreakdown(data.fee_breakdown),
    funding: funding
      ? {
          id: asOptionalString(funding.id),
          funding_type: asOptionalString(funding.funding_type) ?? null,
          status: asOptionalString(funding.status) ?? null,
          contract_start_date:
            asOptionalString(funding.contract_start_date) ?? null,
          contract_end_date: asOptionalString(funding.contract_end_date) ?? null,
          total_contract_amount_cents: asCents(
            funding.total_contract_amount_cents,
          ),
          total_paid_amount_cents: asCents(funding.total_paid_amount_cents),
          total_candidate_payout_cents:
            asCents(funding.total_candidate_payout_cents) ??
            ledgerSummary?.total_candidate_payout_cents,
          total_platform_fee_cents:
            asCents(funding.total_platform_fee_cents) ??
            ledgerSummary?.total_platform_fee_cents,
          total_tax_collected_cents:
            asCents(funding.total_tax_collected_cents) ??
            ledgerSummary?.total_tax_collected_cents,
          total_refund_cents:
            asCents(funding.total_refund_cents) ??
            ledgerSummary?.total_refund_cents,
          ledger: ledgerSummary,
        }
      : null,
    cycles,
    ledger_summary: ledgerSummary,
    ledger: transactions,
    transactions,
  };
}

export async function getRecruiterJobPayments(
  id: string,
): Promise<JobDetailPaymentsData> {
  const res = await axiosInstance.get(ENDPOINTS.JOBS_DETAIL_PAYMENTS(id));
  return normalizeJobPayments(extractData(res.data));
}

function normalizeJobSchedule(data: unknown): JobScheduleData {
  if (!isRecord(data)) {
    return {
      job_id: "",
      job_urgency: "NORMAL",
      shift_templates: [],
      rotational_teams: [],
      team_candidate_rotations: [],
    };
  }

  return {
    job_id: typeof data.job_id === "string" ? data.job_id : "",
    job_urgency:
      String(data.job_urgency ?? "NORMAL").toUpperCase() === "INSTANT"
        ? "INSTANT"
        : "NORMAL",
    shift_mode: typeof data.shift_mode === "string" ? data.shift_mode : null,
    rotation_cycle_days:
      typeof data.rotation_cycle_days === "number"
        ? data.rotation_cycle_days
        : null,
    cycle_start_day:
      typeof data.cycle_start_day === "string" ? data.cycle_start_day : null,
    shift_templates: Array.isArray(data.shift_templates)
      ? (data.shift_templates as JobScheduleData["shift_templates"])
      : [],
    rotational_teams: Array.isArray(data.rotational_teams)
      ? (data.rotational_teams as JobScheduleData["rotational_teams"])
      : [],
    team_candidate_rotations: Array.isArray(data.team_candidate_rotations)
      ? (data.team_candidate_rotations as JobScheduleData["team_candidate_rotations"])
      : [],
  };
}

export async function getRecruiterJobSchedule(
  id: string,
): Promise<JobScheduleData> {
  const res = await axiosInstance.get(ENDPOINTS.JOBS_DETAIL_SCHEDULE(id));
  return normalizeJobSchedule(extractData(res.data));
}

export async function getRecruiterJobWorkers(
  id: string,
): Promise<JobWorkersResponse> {
  const res = await axiosInstance.get(ENDPOINTS.JOBS_DETAIL_WORKERS(id));
  const data = extractData<JobWorkersResponse | JobWorkersResponse["workers"]>(
    res.data,
  );
  return Array.isArray(data) ? { workers: data } : { workers: data.workers ?? [] };
}

export async function getRecruiterJobTeam(
  id: string,
  params?: JobTeamParams,
): Promise<JobTeamResponse> {
  const query: Record<string, string | number> = {};

  if (params?.team_id) query.team_id = params.team_id;
  if (params?.status) query.status = params.status;
  if (params?.include_shifts === false) query.include_shifts = "false";
  if (params?.shift_limit != null) query.shift_limit = params.shift_limit;
  if (params?.shift_from) query.shift_from = params.shift_from;
  if (params?.shift_to) query.shift_to = params.shift_to;
  if (params?.page != null) query.page = params.page;
  if (params?.limit != null) query.limit = params.limit;
  if (params?.offset != null) query.offset = params.offset;

  const res = await axiosInstance.get(ENDPOINTS.JOBS_DETAIL_TEAM(id), {
    params: query,
  });
  const data = extractData<JobTeamResponse>(res.data);

  return {
    job: data.job,
    teams: Array.isArray(data.teams) ? data.teams : [],
    members: Array.isArray(data.members) ? data.members : [],
    pagination: data.pagination ?? {
      total: data.members?.length ?? 0,
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  };
}

export async function getRecruiterJobInfo(id: string): Promise<RecruiterJobInfo> {
  const res = await axiosInstance.get<JobInfoResponse>(ENDPOINTS.JOBS_INFO(id));
  const data = extractData<RecruiterJobInfo>(res.data);
  return {
    ...data,
    specializations: Array.isArray(data.specializations)
      ? data.specializations.map((item) => String(item))
      : [],
    qualifications: data.qualifications ?? [],
    shift_templates: data.shift_templates ?? [],
  };
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

export async function getJobFeesSummary(
  scope: Exclude<FeesSummaryScope, "all"> = "default",
): Promise<FeesSummaryData> {
  const res = await axiosInstance.get(ENDPOINTS.JOBS_FEES_SUMMARY, {
    params: { scope },
  });
  return extractData<FeesSummaryData>(res.data);
}

export async function getProvinceTaxes(
  province: string,
): Promise<ProvinceTaxesData> {
  const res = await axiosInstance.get(ENDPOINTS.JOBS_TAXES(province));
  return extractData<ProvinceTaxesData>(res.data);
}

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

export async function closeRecruiterJob(
  id: string,
  payload?: CloseJobPayload,
): Promise<CloseJobResponse> {
  const body: CloseJobPayload = {};
  const note = payload?.recruiter_close_note?.trim();
  if (note) {
    body.recruiter_close_note = note;
  }

  const res = await axiosInstance.post(ENDPOINTS.JOBS_CLOSE(id), body);
  return extractRoot<CloseJobResponse>(res.data);
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

export async function getJobFeePreview(
  params: JobFeePreviewPayload,
): Promise<JobFeePreviewResponse["data"]> {
  const res = await axiosInstance.post(ENDPOINTS.JOBS_FEE_PREVIEW, params);
  return extractData<JobFeePreviewResponse["data"]>(res.data);
}

// ============================================================================
// API FUNCTIONS — Job Applications
// ============================================================================

export async function getJobApplications(params: {
  job_id?: string;
  status?: ApplicationStatus;
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

function serializeShiftStatusParam(
  status: JobShiftsParams["status"],
): string | undefined {
  if (status == null || status === "") return undefined;

  const value = Array.isArray(status) ? status.filter(Boolean).join(",") : status;
  return value || undefined;
}

function normalizeAppliedShiftStatuses(value: unknown): JobShiftStatus[] | null {
  if (value == null || value === "") return null;

  const raw = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",")
      : [];
  const statuses = raw
    .map((item) => String(item).trim().toUpperCase())
    .filter((item): item is JobShiftStatus =>
      (JOB_SHIFT_RECORD_STATUSES as readonly string[]).includes(item),
    );

  return statuses.length > 0 ? statuses : null;
}

function normalizeJobShifts(data: unknown): JobShiftsResponse {
  const normalized = normalizeCollectionResponse<JobShiftItem, JobShiftsResponse>(
    data,
    "shifts",
  );

  return {
    ...normalized,
    status: normalizeAppliedShiftStatuses(normalized.status),
  };
}

export async function getRecruiterJobShifts(
  jobId: string,
  params?: JobShiftsParams,
): Promise<JobShiftsResponse> {
  const query: Record<string, string | number> = {};
  const status = serializeShiftStatusParam(params?.status);

  if (status) query.status = status;
  if (params?.start_date) query.start_date = params.start_date;
  if (params?.end_date) query.end_date = params.end_date;
  if (params?.page != null) query.page = params.page;
  if (params?.limit != null) query.limit = params.limit;

  const res = await axiosInstance.get(ENDPOINTS.JOBS_DETAIL_SHIFTS(jobId), {
    params: query,
  });
  return normalizeJobShifts(extractData(res.data));
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
  jobId: string,
  applicationId: string,
  payload: UpdateApplicationStatusPayload,
) {
  const res = await axiosInstance.patch(
    ENDPOINTS.JOB_DETAIL_APPLICATION_STATUS(jobId, applicationId),
    payload,
  );
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
