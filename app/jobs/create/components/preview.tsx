"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Mail, MapPin, Phone, Users } from "lucide-react";
import { toast } from "react-toastify";
import SuccessModal from "@/components/modal";
import { DataTable } from "@/components/table/DataTable";
import { PaginationFooter } from "@/components/table/PaginationFooter";
import { getJobFeePreview } from "@/features/jobs";
import { buildNormalJobCreatePayload } from "../normal/build-create-payload";
import { buildNormalJobFeePreviewPayload } from "../normal/build-preview-payload";
import { buildInstantJobCreatePayload, buildInstantJobFeePreviewPayload } from "../instant/build-instant-payload";
import {
  buildInstantPreviewCostSummary,
  hasInstantPreviewShifts,
} from "../instant/map-instant-preview-response";
import {
  buildNormalPreviewCostSummary,
  hasNormalPreviewShifts,
  mapPreviewShiftsToRows,
  type ShiftPreviewRow,
} from "../normal/map-preview-response";
import {
  PaymentBreakdownTable,
  type PaymentBreakdownColumn,
} from "./payment-breakdown-table";
import { useMetadataStore } from "@/stores/metadataStore";
import { useWalletStore } from "@/stores/walletStore";
import type {
  InstantJobFeePreviewData,
  InstantJobFeePreviewPayload,
  JobCreatePayload,
  JobFeePreviewResponse,
  JobStatus,
  LegacyJobFeePreviewPayload,
  NormalJobFeePreviewData,
  NormalJobFeePreviewPayload,
  RecruiterJobCreateBody,
} from "@/types";
import {
  getShiftDurationHours,
  parseLocalDate,
  shiftSpansMidnight,
} from "../validation/helpers";
import { getMetadataLabel } from "@/utils/constant/metadata";
import { getTeamForTemplateDay } from "../normal/scheduling-utils";

interface JobReviewProps {
  mode: "normal" | "urgent";
  payload: JobCreatePayload;
  onSubmit: (
    payload: RecruiterJobCreateBody,
  ) => Promise<{
    success: boolean;
    message?: string;
    jobId?: string;
  }>;
  formId?: string;
  onActionStateChange?: (state: JobReviewActionState) => void;
}

export interface JobReviewActionState {
  isProcessing: boolean;
  isSubmitDisabled: boolean;
}

function formatTime(timeStr?: string | null): string {
  if (!timeStr) return "-";
  const [h, m] = timeStr.split(":");
  const date = new Date();
  date.setHours(Number(h), Number(m));
  return date.toLocaleTimeString("en-CA", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function parsePayloadDate(value?: string | Date | null): Date | null {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const trimmed = value.trim();
  const slashMatch = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(trimmed);
  if (slashMatch) {
    const month = Number(slashMatch[1]) - 1;
    const day = Number(slashMatch[2]);
    const year = Number(slashMatch[3]);
    const parsed = new Date(year, month, day);
    if (
      parsed.getFullYear() === year &&
      parsed.getMonth() === month &&
      parsed.getDate() === day
    ) {
      return parsed;
    }
    return null;
  }

  return parseLocalDate(trimmed);
}

function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function resolveShiftTimes(payload: JobCreatePayload): {
  checkIn?: string;
  checkOut?: string;
} {
  return {
    checkIn:
      payload.check_in_time ??
      payload.morning_shift_start ??
      undefined,
    checkOut:
      payload.check_out_time ??
      payload.morning_shift_end ??
      undefined,
  };
}

/** Matches schedule template in normal-scheduling-step. */
function getTeamForDay(payload: JobCreatePayload, dayIndex: number): string {
  return getTeamForTemplateDay(payload.schedule_template, dayIndex);
}

function buildShiftRows(payload: JobCreatePayload): ShiftPreviewRow[] {
  const start = parsePayloadDate(payload.start_date);
  const end = parsePayloadDate(payload.end_date);
  if (!start || !end || start > end) return [];

  const { checkIn, checkOut } = resolveShiftTimes(payload);
  const hoursPerDay = getShiftDurationHours(checkIn, checkOut);
  const overnight = shiftSpansMidnight(checkIn, checkOut);
  const rows: ShiftPreviewRow[] = [];
  const cursor = new Date(start);
  let day = 1;

  while (cursor <= end) {
    const rowStart = new Date(cursor);
    const rowEnd = new Date(cursor);
    if (overnight) {
      rowEnd.setDate(rowEnd.getDate() + 1);
    }

    rows.push({
      id: `legacy-day-${day}`,
      day: `Day ${day}`,
      shiftName: "-",
      startDate: formatDisplayDate(rowStart),
      endDate: formatDisplayDate(rowEnd),
      checkIn: formatTime(checkIn),
      checkOut: formatTime(checkOut),
      totalWorkingHours:
        hoursPerDay != null ? `${hoursPerDay} hrs` : "-",
      team: getTeamForDay(payload, day - 1),
      workers: payload.no_of_hires_required ?? 1,
    });

    cursor.setDate(cursor.getDate() + 1);
    day++;
  }

  return rows;
}

/** Row span per index: number = render merged cell; null = skip (same date as row above). */
function computeConsecutiveCellSpans(
  rows: ShiftPreviewRow[],
  getValue: (row: ShiftPreviewRow) => string,
): (number | null)[] {
  const spans: (number | null)[] = new Array(rows.length).fill(null);
  let index = 0;

  while (index < rows.length) {
    const value = getValue(rows[index]);
    let end = index + 1;
    while (end < rows.length && getValue(rows[end]) === value) {
      end += 1;
    }
    spans[index] = end - index;
    index = end;
  }

  return spans;
}

const MERGED_TABLE_CELL_CLASS =
  "px-4 py-3 whitespace-nowrap align-middle bg-white border-r border-gray-100";

function validateShiftDuration(
  checkIn?: string | null,
  checkOut?: string | null,
): string | null {
  const hours = getShiftDurationHours(checkIn ?? undefined, checkOut ?? undefined);
  if (hours == null) return null;

  if (hours < 4) {
    return "Shift duration must be at least 4 hours. Please go back and adjust the shift times.";
  }
  if (hours > 12) {
    return "Shift duration cannot exceed 12 hours. Please go back and adjust the shift times.";
  }
  return null;
}

function isInsufficientBalanceError(msg: string): boolean {
  const lower = msg.toLowerCase();
  return (
    lower.includes("insufficient") ||
    lower.includes("insufficient balance") ||
    lower.includes("not enough") ||
    lower.includes("balance too low")
  );
}

function redirectToTopup(router: ReturnType<typeof useRouter>) {
  router.push("/wallet/topup");
}

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-CA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function toPaymentBreakdownColumns(
  months: NonNullable<ReturnType<typeof buildNormalPreviewCostSummary>>["monthlyPayments"],
): PaymentBreakdownColumn[] {
  return months.map((month) => ({
    id: `month-${month.monthIndex}`,
    title: month.label,
    subtitle: month.periodLabel || undefined,
    shiftCount: month.shiftCount,
    totalWorkingHours: month.totalWorkingHours ?? undefined,
    subtotalCents: month.subtotalCents,
    taxComponents: month.taxComponents,
    totalCents: month.totalCents,
    footerNote:
      month.monthIndex === 1 && month.nextPaymentDueLabel
        ? `Next payment due: ${month.nextPaymentDueLabel}`
        : null,
  }));
}

function formatUpcomingMonthsNote(
  months: NonNullable<ReturnType<typeof buildNormalPreviewCostSummary>>["monthlyPayments"],
  maxMonths: number,
): string | null {
  if (months.length <= 1) return null;

  const futureMonths = months.slice(1);
  const cappedNote =
    maxMonths > months.length
      ? ` Preview shows ${months.length} billing month${months.length === 1 ? "" : "s"} (up to ${maxMonths} from job start).`
      : months.length >= maxMonths
        ? ` Preview capped at ${maxMonths} billing months from job start.`
        : "";

  if (futureMonths.length === 1) {
    const month = futureMonths[0];
    return `Month ${month.monthIndex} (${month.periodLabel}): estimated ${formatCurrency(month.totalCents)} incl. tax — charged on the next billing cycle, not included in the publish amount.${cappedNote}`;
  }

  const lastMonth = futureMonths[futureMonths.length - 1];
  return `Months 2–${lastMonth.monthIndex} (${futureMonths.length} future billing periods) will be charged on subsequent cycles and are not included in the publish amount.${cappedNote}`;
}

type LabelOption = { label: string; value: string };

const SHIFT_PER_PAGE_OPTIONS = [5, 10, 25, 50] as const;
const DEFAULT_SHIFT_PER_PAGE = 10;

function getAvailableWalletBalanceCents(): number | null {
  const wallet = useWalletStore.getState().wallet;
  const balanceCents = Number(wallet?.available_balance);
  return Number.isFinite(balanceCents) ? balanceCents : null;
}

export function JobReview({
  mode,
  payload,
  onSubmit,
  formId,
  onActionStateChange,
}: JobReviewProps) {
  const router = useRouter();
  const departments = useMetadataStore((s) => s.departments);
  const jobTitles = useMetadataStore((s) => s.jobTitles);
  const jobTypeOptions = useMetadataStore((s) => s.jobTypeOptions);
  const provinceOptions = useMetadataStore((s) => s.provinceOptions);
  const loadMetadata = useMetadataStore((s) => s.loadAll);
  const refreshWallet = useWalletStore((s) => s.refreshWallet);

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successJobId, setSuccessJobId] = useState("");
  const [feePreview, setFeePreview] =
    useState<JobFeePreviewResponse["data"] | null>(null);
  const [feeLoading, setFeeLoading] = useState(false);
  const [feeError, setFeeError] = useState<string | null>(null);
  const [shiftPage, setShiftPage] = useState(1);
  const [shiftPerPage, setShiftPerPage] = useState(DEFAULT_SHIFT_PER_PAGE);

  const isUrgent = mode === "urgent";
  const isFullTime = payload.job_type === "full_time";
  const isRotationalShift = payload.staffing_type === "rotational";

  useEffect(() => {
    void loadMetadata();
  }, [loadMetadata]);

  const allJobTitleOptions = useMemo(() => {
    const byValue = new Map<string, LabelOption>();

    [...jobTitles, ...departments.flatMap((department) => department.jobTitles ?? [])].forEach(
      (option) => {
        byValue.set(option.value, option);
      },
    );

    return Array.from(byValue.values());
  }, [departments, jobTitles]);

  const displayJobTitle = getMetadataLabel(
    allJobTitleOptions,
    payload.job_title,
  );
  const displayDepartment = getMetadataLabel(
    departments,
    payload.department,
  );
  const displayProvince = getMetadataLabel(
    provinceOptions,
    payload.province,
  );
  const displayJobType = getMetadataLabel(jobTypeOptions, payload.job_type);

  /** Stable string key so fee preview only refetches when request data actually changes. */
  const feePreviewRequestKey = useMemo(() => {
    if (isFullTime) return null;

    if (mode === "normal") {
      const body = buildNormalJobFeePreviewPayload(payload);
      return body ? `normal:${JSON.stringify(body)}` : null;
    }

    const instantBody = buildInstantJobFeePreviewPayload(payload);
    return instantBody ? `instant:${JSON.stringify(instantBody)}` : null;
  }, [isFullTime, mode, payload]);

  useEffect(() => {
    if (!feePreviewRequestKey) return;

    let cancelled = false;
    setFeeLoading(true);
    setFeeError(null);

    const requestBody:
      | NormalJobFeePreviewPayload
      | InstantJobFeePreviewPayload
      | LegacyJobFeePreviewPayload = feePreviewRequestKey.startsWith("normal:")
      ? (JSON.parse(
          feePreviewRequestKey.slice("normal:".length),
        ) as NormalJobFeePreviewPayload)
      : feePreviewRequestKey.startsWith("instant:")
        ? (JSON.parse(
            feePreviewRequestKey.slice("instant:".length),
          ) as InstantJobFeePreviewPayload)
        : (JSON.parse(
            feePreviewRequestKey.slice("legacy:".length),
          ) as LegacyJobFeePreviewPayload);

    getJobFeePreview(requestBody)
      .then((data) => {
        if (!cancelled) setFeePreview(data);
      })
      .catch(() => {
        if (!cancelled) {
          setFeeError(
            "Could not load cost estimate. Please go back and try again.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setFeeLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [feePreviewRequestKey]);

  const requiredCandidates =
    feePreview?.no_of_hires ?? payload.no_of_hires_required ?? 1;

  const instantPreviewCost = useMemo(
    () =>
      isUrgent
        ? buildInstantPreviewCostSummary(
            feePreview as InstantJobFeePreviewData | null,
            payload.no_of_hires_required ?? 1,
          )
        : null,
    [isUrgent, feePreview, payload.no_of_hires_required],
  );

  const previewCost = useMemo(
    () =>
      isUrgent
        ? null
        : buildNormalPreviewCostSummary(
            feePreview as NormalJobFeePreviewData | null,
            payload.no_of_hires_required ?? 1,
          ),
    [isUrgent, feePreview, payload.no_of_hires_required],
  );

  const hourlyRateCents =
    previewCost?.hourlyRateCents ??
    instantPreviewCost?.hourlyRateCents ??
    payload.pay_per_hour_cents ??
    0;
  const hourlyRate = hourlyRateCents / 100;
  const hoursPerCandidate =
    instantPreviewCost?.hoursPerShift ??
    previewCost?.monthlyPayments[0]?.totalWorkingHours ??
    0;
  const costPerShiftCents =
    instantPreviewCost?.costPerShiftCents ?? previewCost?.costPerShiftCents ?? 0;
  const costPerShift = costPerShiftCents / 100;
  const totalFeeCents = isFullTime
    ? 0
    : (instantPreviewCost?.dueNowCents ?? previewCost?.dueNowCents ?? 0);
  const subtotalCents =
    instantPreviewCost?.subtotalCents ?? previewCost?.subtotalCents ?? 0;
  const taxComponents =
    instantPreviewCost?.taxComponents ?? previewCost?.taxComponents ?? [];
  const firstMonthPayment = previewCost?.monthlyPayments[0];
  const useApiShiftTable = isUrgent
    ? hasInstantPreviewShifts(feePreview)
    : hasNormalPreviewShifts(feePreview);

  const isSubmitDisabled =
    isProcessing || (!isFullTime && (feeLoading || !!feeError || !feePreview));

  useEffect(() => {
    onActionStateChange?.({ isProcessing, isSubmitDisabled });
  }, [isProcessing, isSubmitDisabled, onActionStateChange]);

  const handlePublishJob = async () => {
    if (isProcessing) return;

    if (!isFullTime && !feePreview) {
      setError("Cost estimate not loaded. Please wait or go back and retry.");
      return;
    }

    if (!isFullTime) {
      const shiftError = validateShiftDuration(
        payload.check_in_time,
        payload.check_out_time,
      );
      if (shiftError) {
        setError(shiftError);
        return;
      }
    }

    setIsProcessing(true);
    setError(null);

    try {
      const requiredCents = totalFeeCents;

      if (!isFullTime && (!Number.isFinite(requiredCents) || requiredCents <= 0)) {
        setError("Invalid cost estimate. Please go back and try again.");
        return;
      }

      if (requiredCents > 0) {
        await refreshWallet();

        const { hasError } = useWalletStore.getState();
        const availableBalanceCents = getAvailableWalletBalanceCents();

        if (hasError || availableBalanceCents === null) {
          setError("Could not verify wallet balance. Please try again.");
          return;
        }

        if (availableBalanceCents < requiredCents) {
          const shortfallCents = requiredCents - availableBalanceCents;
          setError(
            `Insufficient wallet balance. Add ${formatCurrency(
              shortfallCents,
            )} to publish this job.`,
          );
          toast.error(
            "Insufficient wallet balance. Redirecting to top-up...",
            {
              autoClose: 2000,
              onClose: () => redirectToTopup(router),
            },
          );
          return;
        }
      }

      let finalPayload: RecruiterJobCreateBody;

      if (mode === "normal") {
        const normalBody = buildNormalJobCreatePayload(payload);
        if (!normalBody) {
          setError(
            "Scheduling data is incomplete. Go back to Scheduling Setup and try again.",
          );
          setIsProcessing(false);
          return;
        }
        finalPayload = { ...normalBody, status: "OPEN" as JobStatus };
      } else {
        const instantBody = buildInstantJobCreatePayload(payload);
        if (!instantBody) {
          setError(
            "Shift times are incomplete. Go back to Basic Info and try again.",
          );
          setIsProcessing(false);
          return;
        }
        finalPayload = { ...instantBody, status: "OPEN" as JobStatus };
      }

      const res = await onSubmit(finalPayload);

      if (res?.success) {
        await refreshWallet();
        setSuccessJobId(res.jobId ?? "");
        setShowSuccess(true);
      } else {
        const msg = res?.message ?? "";
        if (isInsufficientBalanceError(msg)) {
          toast.error(
            "Insufficient wallet balance. Redirecting to top-up...",
            {
              autoClose: 2000,
              onClose: () => redirectToTopup(router),
            },
          );
          return;
        }
        setError(msg || "Failed to create job. Please try again.");
      }
    } catch (err) {
      const axiosMsg =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "";
      if (isInsufficientBalanceError(axiosMsg)) {
        toast.error(
          "Insufficient wallet balance. Redirecting to top-up...",
          {
            autoClose: 2000,
            onClose: () => redirectToTopup(router),
          },
        );
        return;
      }
      setError(
        axiosMsg ||
          (err instanceof Error
            ? err.message
            : "Failed to create job. Please try again."),
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const shifts = useMemo((): ShiftPreviewRow[] => {
    if (useApiShiftTable && feePreview?.preview_shifts) {
      return mapPreviewShiftsToRows(feePreview.preview_shifts);
    }
    return buildShiftRows(payload);
  }, [useApiShiftTable, feePreview?.preview_shifts, payload]);

  const shiftHeaders = useMemo(() => {
    const headers = ["Start Date", "End Date", "Day"];
    if (useApiShiftTable) {
      headers.push("Shift");
      if (!isUrgent) {
        headers.push("Team");
      }
    }
    headers.push(
      "Check-In Time",
      "Check-Out Time",
      "Total Working Hours",
    );
    if (useApiShiftTable) headers.push("Workers");
    return headers;
  }, [useApiShiftTable, isUrgent]);

  const totalShiftPages = Math.max(1, Math.ceil(shifts.length / shiftPerPage));
  const currentShiftPage = Math.min(shiftPage, totalShiftPages);

  const paginatedShifts = useMemo(() => {
    const start = (currentShiftPage - 1) * shiftPerPage;
    return shifts.slice(start, start + shiftPerPage);
  }, [shifts, currentShiftPage, shiftPerPage]);

  const startDateSpans = useMemo(
    () =>
      computeConsecutiveCellSpans(
        paginatedShifts,
        (row) => row.startDate,
      ),
    [paginatedShifts],
  );

  const endDateSpans = useMemo(
    () =>
      computeConsecutiveCellSpans(paginatedShifts, (row) => row.endDate),
    [paginatedShifts],
  );

  const daySpans = useMemo(
    () => computeConsecutiveCellSpans(paginatedShifts, (row) => row.day),
    [paginatedShifts],
  );

  const teamSpans = useMemo(
    () =>
      useApiShiftTable && !isUrgent
        ? computeConsecutiveCellSpans(paginatedShifts, (row) => row.team)
        : [],
    [paginatedShifts, useApiShiftTable, isUrgent],
  );

  useEffect(() => {
    setShiftPage(1);
  }, [shifts.length, shiftPerPage, isUrgent]);

  const location = [payload.city, displayProvince].filter(Boolean).join(", ");
  const summaryTitle = "Job Summary";
  const tableTitle = "Job Details";

  const jobDateRangeLabel = useMemo(() => {
    const start = parsePayloadDate(payload.start_date);
    const end = parsePayloadDate(payload.end_date);
    if (!start || !end) return null;
    return `${formatDisplayDate(start)} – ${formatDisplayDate(end)}`;
  }, [payload.start_date, payload.end_date]);

  const previewDaysNote = useMemo(() => {
    const previewWindow = feePreview?.preview_window;
    if (!previewWindow) return null;

    const isCapped =
      previewWindow.was_capped === true ||
      previewWindow.capped_to_one_month === true;

    if (!isCapped) return null;

    const maxDays = previewWindow.max_preview_days ?? 15;
    return `Showing first ${maxDays} days of shifts below.`;
  }, [feePreview?.preview_window]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handlePublishJob();
  };

  return (
    <>
      <form id={formId} onSubmit={handleSubmit} className="contents" noValidate>
        <div className="w-full mx-auto space-y-6">
          {/* Job Summary card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {summaryTitle}
              </h2>

              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                    isUrgent
                      ? "bg-red-50 text-red-600 border-red-200"
                      : "bg-emerald-50 text-emerald-600 border-emerald-200"
                  }`}
                >
                  {isUrgent ? "Urgent" : "Regular"}
                </span>

                {!isUrgent && (
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                      isRotationalShift
                        ? "bg-orange-50 text-orange-600 border-orange-200"
                        : "bg-blue-50 text-blue-600 border-blue-200"
                    }`}
                  >
                    {isRotationalShift
                      ? "Rotational Shifts"
                      : "Standard Shifts"}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="font-semibold text-gray-900 text-base">
                {displayJobTitle}
              </span>
              {payload.department && (
                <span className="bg-orange-50 text-orange-600 text-xs font-medium px-3 py-1 rounded-full border border-orange-100">
                  {displayDepartment}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
              {location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {location}
                </span>
              )}
              {/* {payload.contact_email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  {payload.contact_email}
                </span>
              )} */}
              {payload.direct_number && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" />
                  {payload.direct_number}
                </span>
              )}
              {payload.job_type && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {displayJobType}{" "}
                  {payload.shift_duration_type === "8_hrs"
                    ? "(8 hrs Job)"
                    : ""}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <strong className="text-gray-800">
                  {requiredCandidates}
                </strong>
                <span className="ml-1">Staff Required</span>
              </span>
            </div>
          </div>

          {/* Job Details table */}
          {!isFullTime && shifts.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="mb-4">
                <h3 className="text-base font-semibold text-gray-900">
                  {tableTitle}
                </h3>
                {jobDateRangeLabel && (
                  <p className="mt-1 text-sm text-gray-600">
                    {jobDateRangeLabel}
                  </p>
                )}
                {previewDaysNote && (
                  <p className="mt-0.5 text-xs text-gray-400">
                    {previewDaysNote}
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-orange-100 overflow-hidden">
                <DataTable
                  headers={shiftHeaders}
                  minWidthClassName="min-w-[800px]"
                  headerRowClassName="bg-orange-50 border-b border-orange-100"
                  tableClassName="text-gray-700"
                >
                  {paginatedShifts.map((row, rowIndex) => (
                    <tr
                      key={row.id}
                      className="border-b border-gray-100 last:border-b-0 text-gray-700"
                    >
                      {startDateSpans[rowIndex] != null && (
                        <td
                          rowSpan={startDateSpans[rowIndex] ?? 1}
                          className={MERGED_TABLE_CELL_CLASS}
                        >
                          {row.startDate}
                        </td>
                      )}
                      {endDateSpans[rowIndex] != null && (
                        <td
                          rowSpan={endDateSpans[rowIndex] ?? 1}
                          className={MERGED_TABLE_CELL_CLASS}
                        >
                          {row.endDate}
                        </td>
                      )}
                      {daySpans[rowIndex] != null && (
                        <td
                          rowSpan={daySpans[rowIndex] ?? 1}
                          className={MERGED_TABLE_CELL_CLASS}
                        >
                          {row.day}
                        </td>
                      )}
                      {useApiShiftTable && (
                        <td className="px-4 py-3 whitespace-nowrap">
                          {row.shiftName}
                        </td>
                      )}
                      {useApiShiftTable && !isUrgent && teamSpans[rowIndex] != null && (
                        <td
                          rowSpan={teamSpans[rowIndex] ?? 1}
                          className={MERGED_TABLE_CELL_CLASS}
                        >
                          {row.team}
                        </td>
                      )}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {row.checkIn}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {row.checkOut}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {row.totalWorkingHours}
                      </td>
                      {useApiShiftTable && (
                        <td className="px-4 py-3 whitespace-nowrap">
                          {row.workers}
                        </td>
                      )}
                    </tr>
                  ))}
                </DataTable>

                <PaginationFooter
                  page={currentShiftPage}
                  totalItems={shifts.length}
                  perPage={shiftPerPage}
                  onPageChange={setShiftPage}
                  itemLabel={useApiShiftTable ? "shifts" : "days"}
                  perPageOptions={[...SHIFT_PER_PAGE_OPTIONS]}
                  onPerPageChange={(nextPerPage) => {
                    setShiftPerPage(nextPerPage);
                    setShiftPage(1);
                  }}
                  className="flex items-center justify-between px-4 py-3 mt-0 bg-orange-50/40 border-t border-orange-100"
                />
              </div>
            </div>
          )}

          {/* Cost Breakdown */}
          {!isFullTime && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  Cost Breakdown
                </h3>
              </div>

              {feeLoading && (
                <p className="px-6 pb-4 text-sm text-gray-500 animate-pulse">
                  Loading cost estimate...
                </p>
              )}
              {feeError && (
                <p className="px-6 pb-4 text-sm text-red-600">{feeError}</p>
              )}

              {!feeLoading && !feeError && (
                <>
                  <div className="divide-y divide-gray-100 px-6">
                    <div className="flex justify-between py-3 text-sm">
                      <span className="text-gray-700 font-medium flex items-center gap-1.5">
                        Hourly Rate
                        <span
                          className="w-4 h-4 rounded-full border border-gray-300 text-gray-400 text-[10px] flex items-center justify-center cursor-help"
                          title="Hourly pay rate for this role"
                        >
                          i
                        </span>
                      </span>
                      <span className="font-medium text-gray-900">
                        $
                        {hourlyRate.toLocaleString("en-CA", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>

                    {instantPreviewCost ? (
                      <>
                        <div className="flex justify-between py-3 text-sm">
                          <span className="text-gray-700 font-medium">
                            Workable hours per shift
                          </span>
                          <span className="font-medium text-gray-900">
                            {instantPreviewCost.hoursLabel ||
                              `${instantPreviewCost.hoursPerShift} hrs`}
                          </span>
                        </div>

                        <div className="flex justify-between py-3 text-sm">
                          <span className="text-gray-700 font-medium">
                            Cost per candidate per shift
                          </span>
                          <span className="font-medium text-gray-900">
                            {formatCurrency(instantPreviewCost.costPerShiftCents)}
                          </span>
                        </div>

                        <div className="flex justify-between py-3 text-sm">
                          <span className="text-gray-700 font-medium">
                            Staff required
                          </span>
                          <span className="font-medium text-gray-900">
                            x {instantPreviewCost.hires}
                          </span>
                        </div>

                        {instantPreviewCost.shiftCount > 1 && (
                          <div className="flex justify-between py-3 text-sm">
                            <span className="text-gray-700 font-medium">
                              Shifts in preview
                            </span>
                            <span className="font-medium text-gray-900">
                              {instantPreviewCost.shiftCount}
                            </span>
                          </div>
                        )}

                        <PaymentBreakdownTable
                          showShiftMetrics={false}
                          columns={[
                            {
                              id: "instant-total",
                              title: "Upfront total",
                              subtotalCents: instantPreviewCost.subtotalCents,
                              taxComponents: instantPreviewCost.taxComponents,
                              totalCents: instantPreviewCost.dueNowCents,
                            },
                          ]}
                        />
                      </>
                    ) : previewCost?.hasMonthlyBreakdown ? (
                      <>
                        <div className="flex justify-between py-3 text-sm">
                          <span className="text-gray-700 font-medium">
                            Cost per shift
                          </span>
                          <span className="font-medium text-gray-900">
                            $
                            {costPerShift.toLocaleString("en-CA", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>

                        <div className="flex justify-between py-3 text-sm">
                          <span className="text-gray-700 font-medium">
                            Workers required per shift
                          </span>
                          <span className="font-medium text-gray-900">
                            x {previewCost.hires}
                          </span>
                        </div>

                        <div className="py-3">
                          {previewCost.monthlyPayments.length > 1 && (
                            <p className="mb-2 text-xs text-gray-500">
                              Billing schedule — {previewCost.monthlyPayments.length}{" "}
                              month{previewCost.monthlyPayments.length === 1 ? "" : "s"}
                              {previewCost.maxMonths > previewCost.monthlyPayments.length
                                ? ` (job may bill up to ${previewCost.maxMonths})`
                                : previewCost.monthlyPayments.length >= previewCost.maxMonths
                                  ? ` (capped at ${previewCost.maxMonths} months from start)`
                                  : ""}
                            </p>
                          )}
                          <PaymentBreakdownTable
                            columns={toPaymentBreakdownColumns(
                              previewCost.monthlyPayments,
                            )}
                          />
                        </div>

                        {previewCost.oneCyclePayment && (
                          <div className="border-t border-gray-100 pt-3">
                            <p className="pb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                              Rotation cycle
                            </p>
                            <PaymentBreakdownTable
                              columns={[
                                {
                                  id: "rotation-cycle",
                                  title: previewCost.oneCyclePayment.label,
                                  shiftCount: previewCost.oneCyclePayment.shiftCount,
                                  totalWorkingHours: previewCost.oneCyclePayment.hours,
                                  subtotalCents:
                                    previewCost.oneCyclePayment.subtotalCents,
                                  taxComponents:
                                    previewCost.oneCyclePayment.taxComponents,
                                  totalCents: previewCost.oneCyclePayment.totalCents,
                                },
                              ]}
                            />
                          </div>
                        )}
                      </>
                    ) : previewCost?.isRotationalPreview ? (
                      <>
                        <div className="flex justify-between py-3 text-sm">
                          <span className="text-gray-700 font-medium">
                            Cost per shift
                          </span>
                          <span className="font-medium text-gray-900">
                            $
                            {costPerShift.toLocaleString("en-CA", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>

                        <div className="flex justify-between py-3 text-sm">
                          <span className="text-gray-700 font-medium">
                            Workers required per shift
                          </span>
                          <span className="font-medium text-gray-900">
                            x {previewCost.hires}
                          </span>
                        </div>

                        {previewCost.oneCyclePayment && (
                          <div className="py-1">
                            <PaymentBreakdownTable
                              columns={[
                                {
                                  id: "rotational-cycle",
                                  title: previewCost.oneCyclePayment.label,
                                  shiftCount: previewCost.oneCyclePayment.shiftCount,
                                  totalWorkingHours: previewCost.oneCyclePayment.hours,
                                  subtotalCents:
                                    previewCost.oneCyclePayment.subtotalCents,
                                  taxComponents:
                                    previewCost.oneCyclePayment.taxComponents,
                                  totalCents: previewCost.oneCyclePayment.totalCents,
                                },
                              ]}
                            />
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between py-3 text-sm">
                          <span className="text-gray-700 font-medium">
                            Workable Hours per Candidate per Day
                          </span>
                          <span className="font-medium text-gray-900">
                            {hoursPerCandidate} hrs
                          </span>
                        </div>

                        <div className="flex justify-between py-3 text-sm">
                          <span className="text-gray-700 font-medium">
                            Cost per Candidate per Day
                          </span>
                          <span className="font-medium text-gray-900">
                            $
                            {costPerShift.toLocaleString("en-CA", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>

                        <div className="flex justify-between py-3 text-sm">
                          <span className="text-gray-700 font-medium">
                            Required Candidates per Day
                          </span>
                          <span className="font-medium text-gray-900">
                            x {requiredCandidates}
                          </span>
                        </div>

                        <div className="flex justify-between py-3 text-sm">
                          <span className="text-gray-700 font-medium">
                            Total Cost per Required Candidates per Day
                          </span>
                          <span className="font-medium text-gray-900">
                            {formatCurrency(
                              Math.round(costPerShift * requiredCandidates * 100),
                            )}
                          </span>
                        </div>

                        <div className="py-1">
                          <PaymentBreakdownTable
                            columns={[
                              {
                                id: "standard-period",
                                title: "Billing period",
                                shiftCount: previewCost?.monthlyPayments[0]?.shiftCount,
                                totalWorkingHours: hoursPerCandidate,
                                subtotalCents,
                                taxComponents,
                                totalCents: totalFeeCents,
                              },
                            ]}
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex justify-between items-center bg-orange-50 px-6 py-4 mt-1">
                    <div>
                      <span className="font-bold text-gray-900 block">
                        {instantPreviewCost
                          ? "Total payable (incl. tax)"
                          : previewCost?.hasMonthlyBreakdown
                            ? "Amount due now (incl. tax)"
                            : "Recurring monthly payable (incl. tax)"}
                      </span>
                      {firstMonthPayment?.periodLabel && (
                        <span className="text-xs text-gray-600 mt-0.5 block">
                          {firstMonthPayment.periodLabel}
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-gray-900 text-xl">
                      {formatCurrency(totalFeeCents)}
                    </span>
                  </div>
                  {previewCost && previewCost.monthlyPayments.length > 1 && (
                    <p className="px-6 pb-4 text-xs text-gray-500 bg-orange-50/40">
                      {formatUpcomingMonthsNote(
                        previewCost.monthlyPayments,
                        previewCost.maxMonths,
                      )}
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Bottom actions – your steps footer / Pay & Publish lives outside this component */}
        </div>
      </form>

      <SuccessModal
        visible={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          router.push("/jobs");
        }}
        title="New Job Post Created"
        message={`${payload.job_title} - Job ID: ${successJobId} is now live and ready for applicants.`}
        buttonText="Go to Dashboard"
      />
    </>
  );
}