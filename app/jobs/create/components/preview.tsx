"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Clock, MapPin, Phone, RefreshCw, Users } from "lucide-react";
import { toast } from "react-toastify";
import SuccessModal from "@/components/modal";
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
  formatDurationMinutes,
  formatPreviewDateLabel,
  formatPreviewTime12h,
  hasNormalPreviewShifts,
  mapPreviewShiftsToRows,
  resolveGrossDurationMinutes,
  resolveShiftPreviewPayParts,
  resolveTeamInitial,
  type ShiftPreviewPayContext,
  type ShiftPreviewRow,
} from "../normal/map-preview-response";
import { PreviewShiftTable } from "./preview-shift-table";
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
  ShiftType,
} from "@/types";
import { parseClockTimeToMinutes, parseLocalDate, shiftSpansMidnight } from "../validation/helpers";
import { INSTANT_JOB_MIN_DURATION_HOURS, SHIFT_MAX_HOURS } from "../validation/constants";
import { validatePayloadShiftDurations } from "../validation/shift-duration";
import { getMetadataLabel } from "@/utils/constant/metadata";
import {
  calculateTotalCandidatesRequired,
  getTeamForTemplateDay,
} from "../normal/scheduling-utils";
import { cn } from "@/lib/utils";

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

function buildJobCreatedSuccessMessage(
  jobTitle: string,
  payload: JobCreatePayload,
): string {
  const lines = [`${jobTitle} is now live and ready for applicants.`];

  const start = parsePayloadDate(payload.start_date);
  const end = parsePayloadDate(payload.end_date);

  if (start && end) {
    lines.push(`${formatDisplayDate(start)} – ${formatDisplayDate(end)}`);
  } else if (start) {
    lines.push(`Starts ${formatDisplayDate(start)}`);
  }

  const { checkIn, checkOut } = resolveShiftTimes(payload);
  const formattedCheckIn = formatTime(checkIn);
  const formattedCheckOut = formatTime(checkOut);

  if (formattedCheckIn !== "-" && formattedCheckOut !== "-") {
    lines.push(`${formattedCheckIn} – ${formattedCheckOut}`);
  } else if (formattedCheckIn !== "-") {
    lines.push(`Starts at ${formattedCheckIn}`);
  } else if (formattedCheckOut !== "-") {
    lines.push(`Ends at ${formattedCheckOut}`);
  }

  return lines.join("\n\n");
}

/** Matches schedule template in normal-scheduling-step. */
function getTeamForDay(payload: JobCreatePayload, dayIndex: number): string {
  return getTeamForTemplateDay(payload.schedule_template, dayIndex);
}

function resolveRequiredHires(
  payload: JobCreatePayload,
  feePreviewHires?: number,
): number {
  const selectedShifts = (payload.selected_shift_types ?? []) as ShiftType[];
  if (selectedShifts.length > 0 && payload.shift_schedule_details) {
    const teamCount = Number(payload.number_of_teams) || 1;
    const computed = calculateTotalCandidatesRequired(
      selectedShifts,
      payload.shift_schedule_details,
      teamCount,
    );
    if (computed > 0) return computed;
  }

  if (
    typeof payload.no_of_hires_required === "number" &&
    payload.no_of_hires_required > 0
  ) {
    return payload.no_of_hires_required;
  }

  if (feePreviewHires && feePreviewHires > 0) return feePreviewHires;
  return 1;
}

function buildShiftRows(
  payload: JobCreatePayload,
  payContext?: ShiftPreviewPayContext,
): ShiftPreviewRow[] {
  const start = parsePayloadDate(payload.start_date);
  const end = parsePayloadDate(payload.end_date);
  if (!start || !end || start > end) return [];

  const { checkIn, checkOut } = resolveShiftTimes(payload);
  const overnight = shiftSpansMidnight(checkIn, checkOut);
  const grossMinutes = resolveGrossDurationMinutes(checkIn, checkOut);
  const breakMinutes =
    grossMinutes != null
      ? grossMinutes > 8 * 60 + 30
        ? 90
        : 45
      : null;
  const payableMinutes =
    grossMinutes != null && breakMinutes != null
      ? Math.max(0, grossMinutes - breakMinutes)
      : null;
  const rows: ShiftPreviewRow[] = [];
  const cursor = new Date(start);
  let day = 1;

  while (cursor <= end) {
    const rowStart = new Date(cursor);
    const rowEnd = new Date(cursor);
    if (overnight) {
      rowEnd.setDate(rowEnd.getDate() + 1);
    }

    const startIso = `${rowStart.getFullYear()}-${String(rowStart.getMonth() + 1).padStart(2, "0")}-${String(rowStart.getDate()).padStart(2, "0")}`;
    const endIso = `${rowEnd.getFullYear()}-${String(rowEnd.getMonth() + 1).padStart(2, "0")}-${String(rowEnd.getDate()).padStart(2, "0")}`;
    const weekday = rowStart.toLocaleDateString("en-GB", { weekday: "long" });
    const workers = resolveRequiredHires(payload);
    const payParts =
      payContext && payableMinutes != null
        ? resolveShiftPreviewPayParts(payableMinutes, workers, payContext)
        : null;
    const team = getTeamForDay(payload, day - 1);
    const startMinutes = parseClockTimeToMinutes(checkIn ?? "") ?? 0;
    const endMinutes = parseClockTimeToMinutes(checkOut ?? "") ?? 0;

    rows.push({
      id: `legacy-day-${day}`,
      shiftType: "DAY",
      shiftLabel: "Shift",
      rotationDay: `${weekday} · Day ${day}`,
      team,
      teamInitial: resolveTeamInitial(team),
      startDateLabel: formatPreviewDateLabel(startIso),
      startTimeLabel: formatPreviewTime12h(checkIn),
      endDateLabel: formatPreviewDateLabel(endIso),
      endTimeLabel: formatPreviewTime12h(checkOut),
      timelineStartMinutes: startMinutes,
      timelineEndMinutes: endMinutes,
      spansMidnight: overnight,
      grossDurationLabel:
        grossMinutes != null ? formatDurationMinutes(grossMinutes) : "-",
      breakMinutes,
      payableLabel:
        payableMinutes != null ? formatDurationMinutes(payableMinutes) : "-",
      paySubtotalCents: payParts?.subtotalCents ?? null,
      payTaxCents: payParts?.taxCents ?? null,
      payTotalCents: payParts?.totalCents ?? null,
      payTaxComponents: payParts?.taxComponents ?? [],
      workers,
    });

    cursor.setDate(cursor.getDate() + 1);
    day++;
  }

  return rows;
}

function validateShiftDuration(
  payload: JobCreatePayload,
  isInstant: boolean,
): string | null {
  return validatePayloadShiftDurations(payload, {
    minHours: isInstant ? INSTANT_JOB_MIN_DURATION_HOURS : 4,
    maxHours: SHIFT_MAX_HOURS,
  });
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
  const [feePreview, setFeePreview] =
    useState<JobFeePreviewResponse["data"] | null>(null);
  const [feeLoading, setFeeLoading] = useState(false);
  const [feeError, setFeeError] = useState<string | null>(null);
  const [feeRefreshNonce, setFeeRefreshNonce] = useState(0);
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
    if (mode === "normal") {
      const body = buildNormalJobFeePreviewPayload(payload);
      return body ? `normal:${JSON.stringify(body)}` : null;
    }

    const instantBody = buildInstantJobFeePreviewPayload(payload);
    return instantBody ? `instant:${JSON.stringify(instantBody)}` : null;
  }, [mode, payload]);

  const canRefreshFeePreview = Boolean(feePreviewRequestKey);

  const refreshFeePreview = useCallback(() => {
    if (!feePreviewRequestKey) return;
    setFeeRefreshNonce((nonce) => nonce + 1);
  }, [feePreviewRequestKey]);

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
          setFeeError("Could not load cost estimate.");
        }
      })
      .finally(() => {
        if (!cancelled) setFeeLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [feePreviewRequestKey, feeRefreshNonce]);

  const requiredCandidates = useMemo(
    () => resolveRequiredHires(payload, feePreview?.no_of_hires),
    [payload, feePreview?.no_of_hires],
  );

  const instantPreviewCost = useMemo(
    () =>
      isUrgent
        ? buildInstantPreviewCostSummary(
            feePreview as InstantJobFeePreviewData | null,
            requiredCandidates,
          )
        : null,
    [isUrgent, feePreview, requiredCandidates],
  );

  const previewCost = useMemo(
    () =>
      isUrgent
        ? null
        : buildNormalPreviewCostSummary(
            feePreview as NormalJobFeePreviewData | null,
            requiredCandidates,
          ),
    [isUrgent, feePreview, requiredCandidates],
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
  const totalFeeCents =
    instantPreviewCost?.dueNowCents ?? previewCost?.dueNowCents ?? 0;
  const subtotalCents =
    instantPreviewCost?.subtotalCents ?? previewCost?.subtotalCents ?? 0;
  const taxComponents = useMemo(
    () => instantPreviewCost?.taxComponents ?? previewCost?.taxComponents ?? [],
    [instantPreviewCost?.taxComponents, previewCost?.taxComponents],
  );
  const firstMonthPayment = previewCost?.monthlyPayments[0];
  const useApiShiftTable = isUrgent
    ? hasInstantPreviewShifts(feePreview)
    : hasNormalPreviewShifts(feePreview);

  const shiftPayContext = useMemo<ShiftPreviewPayContext | undefined>(() => {
    if (hourlyRateCents <= 0) return undefined;
    return { hourlyRateCents, taxComponents };
  }, [hourlyRateCents, taxComponents]);

  const previewShiftTemplates = useMemo(() => {
    if (isUrgent) {
      return buildInstantJobFeePreviewPayload(payload)?.shift_templates;
    }
    return buildNormalJobFeePreviewPayload(payload)?.shift_templates;
  }, [isUrgent, payload]);

  const shifts = useMemo((): ShiftPreviewRow[] => {
    if (useApiShiftTable && feePreview?.preview_shifts) {
      return mapPreviewShiftsToRows(
        feePreview.preview_shifts,
        previewShiftTemplates,
        shiftPayContext,
      );
    }
    return buildShiftRows(payload, shiftPayContext);
  }, [
    useApiShiftTable,
    feePreview?.preview_shifts,
    previewShiftTemplates,
    shiftPayContext,
    payload,
  ]);

  const totalShiftPages = Math.max(1, Math.ceil(shifts.length / shiftPerPage));
  const currentShiftPage = Math.min(shiftPage, totalShiftPages);

  const paginatedShifts = useMemo(() => {
    const start = (currentShiftPage - 1) * shiftPerPage;
    return shifts.slice(start, start + shiftPerPage);
  }, [shifts, currentShiftPage, shiftPerPage]);

  useEffect(() => {
    setShiftPage(1);
  }, [shifts.length, shiftPerPage, isUrgent]);

  const isSubmitDisabled =
    isProcessing || feeLoading || !!feeError || !feePreview;

  useEffect(() => {
    onActionStateChange?.({ isProcessing, isSubmitDisabled });
  }, [isProcessing, isSubmitDisabled, onActionStateChange]);

  const handlePublishJob = async () => {
    if (isProcessing) return;

    if (!feePreview) {
      setError("Cost estimate not loaded. Please wait or refresh and try again.");
      return;
    }

    if (!isFullTime) {
      const shiftError = validateShiftDuration(payload, isUrgent);
      if (shiftError) {
        setError(shiftError);
        return;
      }
    }

    setIsProcessing(true);
    setError(null);

    try {
      const requiredCents = totalFeeCents;

      if (!Number.isFinite(requiredCents) || requiredCents < 0) {
        setError("Invalid cost estimate. Please refresh and try again.");
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

  const location = [payload.city, displayProvince].filter(Boolean).join(", ");
  const summaryTitle = "Job Summary";
  const tableTitle = "Job Details";

  const jobDateRangeLabel = useMemo(() => {
    const start = parsePayloadDate(payload.start_date);
    const end = parsePayloadDate(payload.end_date);
    if (!start || !end) return null;
    return `${formatDisplayDate(start)} – ${formatDisplayDate(end)}`;
  }, [payload.start_date, payload.end_date]);

  const successMessage = useMemo(
    () => buildJobCreatedSuccessMessage(displayJobTitle, payload),
    [displayJobTitle, payload],
  );

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
          {shifts.length > 0 && (
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
                {hourlyRateCents > 0 && (
                  <p className="mt-1 text-sm text-gray-600">
                    Hourly rate{" "}
                    <span className="font-semibold text-gray-900">
                      $
                      {hourlyRate.toLocaleString("en-CA", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                      /hr
                    </span>
                    {taxComponents.length > 0 ? (
                      <span className="text-gray-400">
                        {" "}
                        · Tax shown per shift below
                      </span>
                    ) : null}
                  </p>
                )}
                {previewDaysNote && (
                  <p className="mt-0.5 text-xs text-gray-400">
                    {previewDaysNote}
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-orange-100 overflow-hidden">
                <PreviewShiftTable
                  rows={paginatedShifts}
                  showTeam={useApiShiftTable && !isUrgent}
                  showPay={Boolean(shiftPayContext)}
                  formatCurrency={formatCurrency}
                />

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
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-start justify-between gap-4 p-6 pb-2">
                <h3 className="text-base font-semibold text-gray-900">
                  Cost Breakdown
                </h3>
                {canRefreshFeePreview && (
                  <button
                    type="button"
                    onClick={refreshFeePreview}
                    disabled={feeLoading}
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-gray-600 transition-colors",
                      "hover:bg-gray-100 hover:text-gray-900",
                      "disabled:cursor-not-allowed disabled:opacity-50",
                      feeError && "text-[#F4781B] hover:text-[#d96814]",
                    )}
                    aria-label="Refresh cost estimate"
                  >
                    <RefreshCw
                      className={cn("h-3.5 w-3.5", feeLoading && "animate-spin")}
                    />
                    Refresh
                  </button>
                )}
              </div>

              {feeLoading && (
                <p className="px-6 pb-4 text-sm text-gray-500 animate-pulse">
                  Loading cost estimate...
                </p>
              )}
              {feeError && (
                <p className="flex items-center gap-1.5 px-6 pb-4 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {feeError}
                </p>
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
        message={successMessage}
        buttonText="Go to Dashboard"
      />
    </>
  );
}