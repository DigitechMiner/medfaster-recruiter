"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Mail, MapPin, Phone, Users } from "lucide-react";
import { toast } from "react-toastify";
import SuccessModal from "@/components/modal";
import { getJobFeePreview } from "@/features/jobs";
import { useMetadataStore } from "@/stores/metadataStore";
import { useWalletStore } from "@/stores/walletStore";
import type {
  JobCreatePayload,
  JobFeePreviewResponse,
  JobStatus,
} from "@/types";
import { getMetadataLabel } from "@/utils/constant/metadata";

interface JobReviewProps {
  mode: "normal" | "urgent";
  payload: JobCreatePayload;
  onSubmit: (
    payload: JobCreatePayload,
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

function diffHours(checkIn?: string | null, checkOut?: string | null): number {
  if (!checkIn || !checkOut) return 0;
  const [h1, m1] = checkIn.split(":").map(Number);
  const [h2, m2] = checkOut.split(":").map(Number);
  return Math.abs(h2 * 60 + m2 - (h1 * 60 + m1)) / 60;
}

// Dummy: in your real app this should be the rotational template output.
// For now: Team A for every day; you can wire real data later.
function getRotationalTeamForDay(_index: number): string {
  return "Team A";
}

// Dummy: from your scheduling step, probably "8 hrs" / "12 hrs" etc.
function getShiftDurationLabel(payload: JobCreatePayload): string {
  if (payload.shift_duration_type === "12_hrs") return "12 hrs";
  return "8 hrs";
}

function buildShiftRows(payload: JobCreatePayload) {
  if (!payload.start_date || !payload.end_date) return [];
  const start = new Date(payload.start_date + "T00:00:00");
  const end = new Date(payload.end_date + "T00:00:00");
  const rows = [];
  const cursor = new Date(start);
  let day = 1;

  while (cursor <= end) {
    rows.push({
      day: `Day ${day}`,
      startDate: cursor.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      rotationalTeam: getRotationalTeamForDay(day - 1),
      eachShiftDuration: getShiftDurationLabel(payload),
      timing: `${formatTime(payload.check_in_time)} to ${formatTime(
        payload.check_out_time,
      )}`,
      duration: `${diffHours(payload.check_in_time, payload.check_out_time)} hrs`,
    });
    cursor.setDate(cursor.getDate() + 1);
    day++;
  }

  return rows;
}

function validateShiftDuration(
  checkIn?: string | null,
  checkOut?: string | null,
): string | null {
  if (!checkIn || !checkOut) return null;
  const [h1, m1] = checkIn.split(":").map(Number);
  const [h2, m2] = checkOut.split(":").map(Number);
  let diffMins = h2 * 60 + m2 - (h1 * 60 + m1);
  if (diffMins < 0) diffMins += 24 * 60;
  const hours = diffMins / 60;

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

type LabelOption = { label: string; value: string };

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

  useEffect(() => {
    if (isFullTime) return;
    if (
      !payload.job_title ||
      !payload.start_date ||
      !payload.end_date ||
      !payload.check_in_time ||
      !payload.check_out_time
    ) {
      return;
    }

    setFeeLoading(true);
    setFeeError(null);

    getJobFeePreview({
      job_title: payload.job_title,
      no_of_hires_required: payload.no_of_hires_required ?? 1,
      start_date: payload.start_date,
      end_date: payload.end_date,
      check_in_time: payload.check_in_time,
      check_out_time: payload.check_out_time,
    })
      .then(setFeePreview)
      .catch(() =>
        setFeeError("Could not load cost estimate. Please go back and try again."),
      )
      .finally(() => setFeeLoading(false));
  }, [
    isFullTime,
    payload.job_title,
    payload.no_of_hires_required,
    payload.start_date,
    payload.end_date,
    payload.check_in_time,
    payload.check_out_time,
  ]);

  const hourlyRateCents =
    feePreview?.recruiter_pay_per_hour_cents ??
    payload.pay_per_hour_cents ??
    0;
  const hourlyRate = hourlyRateCents / 100;
  const hoursPerCandidate = feePreview?.total_working_hours ?? 0;
  const requiredCandidates = payload.no_of_hires_required ?? 1;
  const costPerCandidateCents =
    feePreview?.per_candidate_shift_recruiter_pay_cents ??
    Math.round(hourlyRate * hoursPerCandidate * 100);
  const costPerCandidate = costPerCandidateCents / 100;
  const totalFeeCents = isFullTime
    ? 0
    : (feePreview?.total_recruiter_pay_cents ??
      costPerCandidateCents * requiredCandidates);
  const totalPayable = totalFeeCents / 100;

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

      const finalPayload = { ...payload, status: "OPEN" as JobStatus };
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

  const shifts = buildShiftRows(payload);
  const location = [payload.city, displayProvince].filter(Boolean).join(", ");
  const summaryTitle = "Job Summary";
  const tableTitle = "Job Details";

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handlePublishJob();
  };
console.log("JobReview payload", {
  job_type: payload.job_type,
  start_date: payload.start_date,
  end_date: payload.end_date,
  check_in_time: payload.check_in_time,
  check_out_time: payload.check_out_time,
  shiftsLen: shifts.length,
});
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

                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                    isRotationalShift
                      ? "bg-orange-50 text-orange-600 border-orange-200"
                      : "bg-blue-50 text-blue-600 border-blue-200"
                  }`}
                >
                  {isRotationalShift ? "Rotational Shifts" : "Standard Shifts"}
                </span>
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
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                {tableTitle}
              </h3>

              <div className="overflow-x-auto rounded-xl border border-orange-100">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-orange-50 text-gray-700 font-medium text-left">
                      <th className="px-4 py-3 whitespace-nowrap">Shift Day</th>
                      <th className="px-4 py-3 whitespace-nowrap">
                        Shift Start Date
                      </th>
                      <th className="px-4 py-3 whitespace-nowrap">
                        Rotational Team
                      </th>
                      <th className="px-4 py-3 whitespace-nowrap">
                        Each Shift Duration
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {shifts.map((row, i) => (
                      <tr
                        key={i}
                        className="border-t border-gray-100 text-gray-700"
                      >
                        <td className="px-4 py-3">{row.day}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {row.startDate}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {row.rotationalTeam}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {row.eachShiftDuration}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination stub to look like Figma; wire real pagination later */}
              <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="w-7 h-7 flex items-center justify-center rounded-md bg-orange-500 text-white font-semibold"
                  >
                    1
                  </button>
                  <button
                    type="button"
                    className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 bg-white"
                  >
                    2
                  </button>
                  <span>3 … 50 51 52</span>
                  <button
                    type="button"
                    className="ml-2 px-3 h-7 rounded-md border border-gray-200 bg-white"
                  >
                    Next
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <span>Showing 1 of 52 weeks</span>
                  <button
                    type="button"
                    className="px-3 h-7 rounded-md border border-gray-200 bg-white"
                  >
                    10 per page ▾
                  </button>
                </div>
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
                        {costPerCandidate.toLocaleString("en-CA", {
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
                        $
                        {(costPerCandidate * requiredCandidates).toLocaleString(
                          "en-CA",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          },
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-orange-50 px-6 py-4 mt-1">
                    <span className="font-bold text-gray-900">
                      Recurring Monthly Payable
                    </span>
                    <span className="font-bold text-gray-900 text-xl">
                      $
                      {totalPayable.toLocaleString("en-CA", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
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