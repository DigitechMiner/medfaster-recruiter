"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, MapPin, Phone, Clock, Users, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import SuccessModal from "@/components/modal";
import { toast } from "react-toastify";
import type { JobCreatePayload, JobFeePreviewResponse, JobStatus } from "@/Interface/recruiter.types";
import { useWalletStore } from "@/stores/walletStore";
import { getJobFeePreview } from "@/stores/api/recruiter-job-api";
import { JobDescriptionModal, useJobDescriptionModal } from "@/app/jobs/[id]/components/JobDescriptionModal";
import { EditInterviewQuestionsModal } from "@/app/jobs/[id]/components/EditInterviewQuestionsModal";

interface JobSummaryPageProps {
  mode:     "normal" | "urgent";
  payload:  JobCreatePayload;
  onBack:   () => void;
  onSubmit: (payload: JobCreatePayload, feeCents: number) => Promise<{
    success:  boolean;
    message?: string;
    jobId?:   string;
  }>;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatTime(timeStr?: string | null): string {
  if (!timeStr) return "—";
  const [h, m] = timeStr.split(":");
  const date = new Date();
  date.setHours(Number(h), Number(m));
  return date.toLocaleTimeString("en-CA", { hour: "2-digit", minute: "2-digit" });
}

function diffHours(checkIn?: string | null, checkOut?: string | null): number {
  if (!checkIn || !checkOut) return 0;
  const [h1, m1] = checkIn.split(":").map(Number);
  const [h2, m2] = checkOut.split(":").map(Number);
  return Math.abs((h2 * 60 + m2) - (h1 * 60 + m1)) / 60;
}

function buildShiftRows(payload: JobCreatePayload) {
  if (!payload.start_date || !payload.end_date) return [];
  const start  = new Date(payload.start_date + "T00:00:00");
  const end    = new Date(payload.end_date   + "T00:00:00");
  const rows   = [];
  const cursor = new Date(start);
  let day = 1;
  while (cursor <= end) {
    rows.push({
      day:       `Day ${day}`,
      startDate: cursor.toLocaleDateString("en-CA", { day: "numeric", month: "long", year: "numeric" }),
      endDate:   cursor.toLocaleDateString("en-CA", { day: "numeric", month: "long", year: "numeric" }),
      timing:    `${formatTime(payload.check_in_time)} to ${formatTime(payload.check_out_time)}`,
      duration:  `${diffHours(payload.check_in_time, payload.check_out_time)} hrs`,
    });
    cursor.setDate(cursor.getDate() + 1);
    day++;
  }
  return rows;
}

function validateShiftDuration(checkIn?: string | null, checkOut?: string | null): string | null {
  if (!checkIn || !checkOut) return null;
  const [h1, m1] = checkIn.split(":").map(Number);
  const [h2, m2] = checkOut.split(":").map(Number);
  let diffMins = (h2 * 60 + m2) - (h1 * 60 + m1);
  if (diffMins < 0) diffMins += 24 * 60;
  const hours = diffMins / 60;
  if (hours < 4)  return "Shift duration must be at least 4 hours. Please go back and adjust the shift times.";
  if (hours > 12) return "Shift duration cannot exceed 12 hours. Please go back and adjust the shift times.";
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

function redirectToTopup(
  payload: JobCreatePayload,
  mode: string,
  router: ReturnType<typeof useRouter>
) {
  try {
    sessionStorage.setItem("pending_job_payload", JSON.stringify(payload));
    sessionStorage.setItem("pending_job_mode", mode);
  } catch {
    // sessionStorage unavailable (SSR/private browsing) — proceed anyway
  }
  router.push("/wallet/topup");
}

// ── Component ─────────────────────────────────────────────────────────────────
export function JobSummaryPage({ mode, payload, onBack, onSubmit }: JobSummaryPageProps) {
  const router        = useRouter();
  const refreshWallet = useWalletStore((s) => s.refreshWallet);

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [showSuccess, setShowSuccess]   = useState(false);
  const [successJobId, setSuccessJobId] = useState("");
  const [feePreview, setFeePreview]     = useState<JobFeePreviewResponse["data"] | null>(null);
  const [feeLoading, setFeeLoading]     = useState(false);
  const [feeError, setFeeError]         = useState<string | null>(null);

  const jobDescModal                      = useJobDescriptionModal();
  const [showQuestions, setShowQuestions] = useState(false);

  // ── Derived flags ─────────────────────────────────────────────────────────
  const isUrgent   = mode === "urgent";
  const isFullTime = payload.job_type === "full_time";

  const wantsInterview = !isUrgent && (
    payload.ai_interview === true ||
    (Array.isArray(payload.interview_questions) && payload.interview_questions.length > 0) ||
    (Array.isArray(payload.questions) && (payload.questions as string[]).length > 0)
  );

  // ── Fee preview (skipped for full time) ───────────────────────────────────
  useEffect(() => {
    if (isFullTime) return;
    if (
      !payload.job_title     ||
      !payload.start_date    ||
      !payload.end_date      ||
      !payload.check_in_time ||
      !payload.check_out_time
    ) return;

    setFeeLoading(true);
    setFeeError(null);

    getJobFeePreview({
      job_title:            payload.job_title,
      no_of_hires_required: payload.no_of_hires_required ?? 1,
      start_date:           payload.start_date,
      end_date:             payload.end_date,
      check_in_time:        payload.check_in_time,
      check_out_time:       payload.check_out_time,
    })
      .then(setFeePreview)
      .catch(() => setFeeError("Could not load cost estimate. Please go back and try again."))
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

  // ── Cost calc ─────────────────────────────────────────────────────────────
  const hourlyRate         = (payload.pay_per_hour_cents ?? 0) / 100;
  const hoursPerCandidate  = feePreview?.total_working_hours ?? 0;
  const costPerCandidate   = hourlyRate * hoursPerCandidate;
  const requiredCandidates = payload.no_of_hires_required ?? 1;
  const totalPayable       = costPerCandidate * requiredCandidates;

  // ── Submit ────────────────────────────────────────────────────────────────
  const handlePayAndHire = async () => {
    if (isProcessing) return;

    if (!isFullTime && !feePreview) {
      setError("Cost estimate not loaded. Please wait or go back and retry.");
      return;
    }

    if (!isFullTime) {
      const shiftError = validateShiftDuration(payload.check_in_time, payload.check_out_time);
      if (shiftError) { setError(shiftError); return; }
    }

    setIsProcessing(true);
    setError(null);

    try {
      const requiredCents = isFullTime ? 0 : Math.round(totalPayable * 100);

      if (!isFullTime && (isNaN(requiredCents) || requiredCents <= 0)) {
        setError("Invalid cost estimate. Please go back and try again.");
        return;
      }

      const finalPayload = { ...payload, status: "OPEN" as JobStatus };
      const res          = await onSubmit(finalPayload, requiredCents);

      if (res?.success) {
        await refreshWallet();
        setSuccessJobId(res.jobId ?? "");
        setShowSuccess(true);
      } else {
        const msg = res?.message ?? "";
        if (isInsufficientBalanceError(msg)) {
          toast.error("Insufficient wallet balance. Redirecting to top-up...", {
            autoClose: 2000,
            onClose: () => redirectToTopup(payload, mode, router),
          });
          return;
        }
        setError(msg || "Failed to create job. Please try again.");
      }
    } catch (err) {
      const axiosMsg =
        (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message ?? "";
      if (isInsufficientBalanceError(axiosMsg)) {
        toast.error("Insufficient wallet balance. Redirecting to top-up...", {
          autoClose: 2000,
          onClose: () => redirectToTopup(payload, mode, router),
        });
        return;
      }
      setError(axiosMsg || (err instanceof Error ? err.message : "Failed to create job. Please try again."));
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Derived labels ────────────────────────────────────────────────────────
  const pageTitle    = isUrgent ? "Request Immediate Staff" : "Create Job Post";
  const summaryTitle = isUrgent ? "Shift Summary"           : "Job Summary";
  const tableTitle   = isUrgent ? "Shift Details"           : "Job Details";
  const shifts       = buildShiftRows(payload);
  const location     = [payload.city, payload.province].filter(Boolean).join(", ");

  return (
    <>
      <div className="space-y-4 w-full max-w-3xl mx-auto px-4 py-4 bg-white rounded-xl">

        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xl text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> {pageTitle}
        </button>

        {/* ── Summary Card ── */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
          <div className="flex items-start justify-between">
            <h2 className="text-lg font-bold text-gray-900">{summaryTitle}</h2>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
              isUrgent
                ? "bg-orange-50 text-orange-600 border-orange-200"
                : "bg-green-50 text-green-600 border-green-200"
            }`}>
              {isUrgent ? "Urgent" : "Normal"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold text-gray-900 text-base">{payload.job_title}</span>
            {payload.department && (
              <span className="bg-orange-50 text-orange-600 text-xs font-medium px-3 py-1 rounded-full border border-orange-100">
                {payload.department}
              </span>
            )}

            <div className="ml-auto flex gap-2">
              <button
                onClick={jobDescModal.open}
                className="flex items-center gap-1.5 text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 hover:bg-gray-50"
              >
                <FileText className="w-3.5 h-3.5" />
                {isUrgent ? "Shift Description" : "Job Description"}
              </button>

              {wantsInterview && (
                <button
                  onClick={() => setShowQuestions(true)}
                  className="flex items-center gap-1.5 text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 hover:bg-gray-50"
                >
                  <Users className="w-3.5 h-3.5" /> Interview Questions
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
            {location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />{location}
              </span>
            )}
            {payload.direct_number && (
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" />{payload.direct_number}
              </span>
            )}
            {payload.job_type && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />{payload.job_type}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <strong className="text-gray-800">{requiredCandidates}</strong>&nbsp;Staff Required
            </span>
          </div>
        </div>

        {/* ── Shift Details Table (hidden for full time) ── */}
        {!isFullTime && shifts.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4">{tableTitle}</h3>
            <div className="overflow-x-auto rounded-lg border border-gray-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-orange-50 text-gray-700 font-medium text-left">
                    {["Shift Day", "Shift Start Date", "Shift End Date", "Shift Timing", "Shift Duration"].map((h) => (
                      <th key={h} className="px-4 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {shifts.map((row, i) => (
                    <tr key={i} className="border-t border-gray-100 text-gray-700">
                      <td className="px-4 py-3">{row.day}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{row.startDate}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{row.endDate}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{row.timing}</td>
                      <td className="px-4 py-3">{row.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Cost Breakdown (hidden for full time) ── */}
        {!isFullTime && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6">
              <h3 className="text-base font-bold text-gray-900 mb-4">Cost Breakdown</h3>
            </div>

            {feeLoading && (
              <p className="px-6 pb-4 text-sm text-gray-500 animate-pulse">Loading cost estimate...</p>
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
                        ?
                      </span>
                    </span>
                    <span className="font-medium text-gray-900">
                      ${hourlyRate.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between py-3 text-sm">
                    <span className="text-gray-700 font-medium">Hours per Candidate</span>
                    <span className="font-medium text-gray-900">{hoursPerCandidate} hrs</span>
                  </div>
                  <div className="flex justify-between py-3 text-sm">
                    <span className="text-gray-700 font-medium">Cost per Candidate</span>
                    <span className="font-medium text-gray-900">
                      ${costPerCandidate.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between py-3 text-sm">
                    <span className="text-gray-700 font-medium">Required Candidates</span>
                    <span className="font-medium text-gray-900">x {requiredCandidates}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center bg-orange-50 px-6 py-4 mt-1">
                  <span className="font-bold text-gray-900">Total Payable</span>
                  <span className="font-bold text-gray-900 text-xl">
                    ${totalPayable.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </>
            )}
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* ── Footer ── */}
        <div className="flex items-center justify-between pt-2 pb-8">
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <Button
            type="button"
            onClick={handlePayAndHire}
            disabled={
              isProcessing ||
              (!isFullTime && (feeLoading || !!feeError || !feePreview))
            }
            className="flex items-center gap-2 bg-[#f47b20] hover:bg-[#d5650e] text-white px-6 disabled:opacity-60"
          >
            {isProcessing
              ? "Processing..."
              : isFullTime
              ? "Create Job Post"
              : "Pay & Start Hiring"
            }
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* ── Modals ── */}
      <JobDescriptionModal
        isOpen={jobDescModal.isOpen}
        onClose={jobDescModal.close}
        job={payload}
        onUpdate={(desc) => console.log("Description updated:", desc)}
      />

      {wantsInterview && (
        <EditInterviewQuestionsModal
          isOpen={showQuestions}
          onClose={() => setShowQuestions(false)}
          initialQuestions={payload.interview_questions ?? []}
          onSave={async (questions) => {
            payload.interview_questions = questions;
            setShowQuestions(false);
          }}
        />
      )}

      <SuccessModal
        visible={showSuccess}
        onClose={() => { setShowSuccess(false); router.push("/jobs"); }}
        title="New Job Post Created"
        message={`${payload.job_title} – Job ID: ${successJobId} is now live and ready for applicants.`}
        buttonText="Go to Dashboard"
      />
    </>
  );
}