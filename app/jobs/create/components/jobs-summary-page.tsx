"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, MapPin, Mail, Phone, Clock, Users, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import SuccessModal from "@/components/modal";
import { getWallet, initiateWalletTopup } from "@/stores/api/recruiter-wallet-api";
import type { JobCreatePayload } from "@/Interface/job.types";

interface JobSummaryPageProps {
  mode: "regular" | "urgent";
  payload: JobCreatePayload;
  onBack: () => void;
  onSubmit: (payload: JobCreatePayload) => Promise<{
    success: boolean;
    message?: string;
    jobId?: string;
  }>;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-CA", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function formatTime(timeStr?: string | null): string {
  if (!timeStr) return "—";
  // expects "HH:MM:SS" or "HH:MM"
  const [h, m] = timeStr.split(":");
  const date = new Date();
  date.setHours(Number(h), Number(m));
  return date.toLocaleTimeString("en-CA", { hour: "2-digit", minute: "2-digit" });
}

function diffHours(checkIn?: string | null, checkOut?: string | null): number {
  if (!checkIn || !checkOut) return 0;
  const [h1, m1] = checkIn.split(":").map(Number);
  const [h2, m2] = checkOut.split(":").map(Number);
  const mins = (h2 * 60 + m2) - (h1 * 60 + m1);
  return Math.abs(mins) / 60;
}

function buildShiftRows(payload: JobCreatePayload) {
  if (!payload.start_date || !payload.end_date) return [];
  const start = new Date(payload.start_date);
  const end   = new Date(payload.end_date);
  const rows  = [];
  const cursor = new Date(start);
  let day = 1;

  while (cursor <= end) {
    const next = new Date(cursor);
    next.setDate(next.getDate() + 1);
    rows.push({
      day:       `Day ${day}`,
      startDate: cursor.toLocaleDateString("en-CA", { day: "numeric", month: "long", year: "numeric" }),
      endDate:   next.toLocaleDateString("en-CA", { day: "numeric", month: "long", year: "numeric" }),
      timing:    `${formatTime(payload.check_in_time)} to ${formatTime(payload.check_out_time)}`,
      duration:  `${diffHours(payload.check_in_time, payload.check_out_time)} hrs`,
    });
    cursor.setDate(cursor.getDate() + 1);
    day++;
  }
  return rows;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function JobSummaryPage({ mode, payload, onBack, onSubmit }: JobSummaryPageProps) {
  const router = useRouter();

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [showSuccess, setShowSuccess]   = useState(false);
  const [successJobId, setSuccessJobId] = useState("");

  // ── Cost Breakdown ── derived from actual API fields
  // pay_range_min is hourly rate in dollars (or use pay_per_hour_cents if available)
  const hourlyRate         = Number(payload.pay_range_min ?? 0);
  const shiftHours         = diffHours(payload.check_in_time, payload.check_out_time);
  const totalDays          = (() => {
    if (!payload.start_date || !payload.end_date) return 1;
    const diff = new Date(payload.end_date).getTime() - new Date(payload.start_date).getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
  })();
  const hoursPerCandidate  = shiftHours * totalDays;
  const requiredCandidates = payload.no_of_hires ?? 1;
  const costPerCandidate   = hourlyRate * hoursPerCandidate;
  const totalPayable       = costPerCandidate * requiredCandidates;

  const shifts = buildShiftRows(payload);

  const location = [payload.city, payload.province].filter(Boolean).join(", ");

  // ── Payment Logic ─────────────────────────────────────────────────────────
  const handlePayAndHire = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setError(null);

    try {
      const wallet      = await getWallet();
      const available   = Number(wallet.available_balance); // cents
      const totalCents  = totalPayable * 100;

      if (available >= totalCents) {
        // ✅ Priority 1 — wallet has enough → submit directly
        const res = await onSubmit({ ...payload, status: "OPEN" });
        if (res.success) {
          setSuccessJobId(res.jobId ?? "");
          setShowSuccess(true);
        } else {
          setError(res.message || "Failed to create job");
        }
      } else {
        // ✅ Priority 2 — top up the deficit via Stripe, then submit after redirect
        const topupAmount = Math.ceil((totalCents - available) / 100);
        const { client_secret, topup_id } = await initiateWalletTopup(topupAmount);

        sessionStorage.setItem("pending_job_payload", JSON.stringify({ ...payload, status: "OPEN" }));
        sessionStorage.setItem("pending_job_mode", mode);

        router.push(
          `/wallet/topup/confirm?secret=${client_secret}&topup_id=${topup_id}&amount=${topupAmount}&redirect=/jobs/payment-complete`
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const isUrgent     = mode === "urgent";
  const pageTitle    = isUrgent ? "Request Immediate Staff" : "Create Job Post";
  const summaryTitle = isUrgent ? "Shift Summary"           : "Job Summary";
  const tableTitle   = isUrgent ? "Shift Details"           : "Job Details";

  return (
    <>
      <div className="space-y-4 w-full max-w-3xl mx-auto px-4 py-4 bg-white rounded-xl">

        {/* ── Back nav ── */}
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
              {isUrgent ? "Urgent" : "Regular"}
            </span>
          </div>

          {/* Role + department */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold text-gray-900 text-base">{payload.job_title}</span>
            {payload.department && (
              <span className="bg-orange-50 text-orange-600 text-xs font-medium px-3 py-1 rounded-full border border-orange-100">
                {payload.department}
              </span>
            )}
            <div className="ml-auto flex gap-2">
              <button className="flex items-center gap-1.5 text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 hover:bg-gray-50">
                <FileText className="w-3.5 h-3.5" />
                {isUrgent ? "Shift Description" : "Job Description"}
              </button>
              {!isUrgent && (
                <button className="flex items-center gap-1.5 text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 hover:bg-gray-50">
                  <Users className="w-3.5 h-3.5" /> Interview Questions
                </button>
              )}
            </div>
          </div>

          {/* Meta row */}
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

        {/* ── Shift / Job Details Table ── */}
        {shifts.length > 0 && (
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

        {/* ── Cost Breakdown ── */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4">Cost Breakdown</h3>
          </div>
          <div className="divide-y divide-gray-100 px-6">
            <div className="flex justify-between py-3 text-sm">
              <span className="text-gray-700 font-medium flex items-center gap-1.5">
                Hourly Rate
                <span
                  className="w-4 h-4 rounded-full border border-gray-300 text-gray-400 text-[10px] flex items-center justify-center cursor-help"
                  title="Hourly pay rate for this role"
                >?</span>
              </span>
              <span className="font-medium text-gray-900">$ {hourlyRate.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-3 text-sm">
              <span className="text-gray-700 font-medium">Hours per Candidate</span>
              <span className="font-medium text-gray-900">{hoursPerCandidate} hrs</span>
            </div>
            <div className="flex justify-between py-3 text-sm">
              <span className="text-gray-700 font-medium">Cost per Candidate</span>
              <span className="font-medium text-gray-900">$ {costPerCandidate.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-3 text-sm">
              <span className="text-gray-700 font-medium">Required Candidates</span>
              <span className="font-medium text-gray-900">x {requiredCandidates}</span>
            </div>
          </div>
          {/* Total — sits flush at bottom inside the card */}
          <div className="flex justify-between items-center bg-orange-50 px-6 py-4 mt-1">
            <span className="font-bold text-gray-900">Total Payable</span>
            <span className="font-bold text-gray-900 text-xl">
              $ {totalPayable.toLocaleString()}
            </span>
          </div>
        </div>

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
            disabled={isProcessing}
            className="flex items-center gap-2 bg-[#f47b20] hover:bg-[#d5650e] text-white px-6 disabled:opacity-60"
          >
            {isProcessing ? "Processing..." : "Pay & Start Hiring"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

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