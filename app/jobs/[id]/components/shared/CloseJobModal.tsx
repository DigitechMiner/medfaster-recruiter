"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { closeRecruiterJob } from "@/features/jobs";
import type { JobCloseSummary } from "@/types";

const NOTE_MAX_LENGTH = 1000;

type CloseJobModalProps = {
  jobId: string;
  jobTitle: string;
  open: boolean;
  onClose: () => void;
  onSuccess: (closeSummary: JobCloseSummary) => void;
};

function formatRefundAmount(cents: string): string {
  const value = Number(cents);
  if (!Number.isFinite(value)) return cents;
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(value / 100);
}

export function CloseJobModal({
  jobId,
  jobTitle,
  open,
  onClose,
  onSuccess,
}: CloseJobModalProps) {
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setNote("");
      setSubmitError(null);
    }
  }, [open]);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const trimmedNote = note.trim();
      const response = await closeRecruiterJob(
        jobId,
        trimmedNote ? { recruiter_close_note: trimmedNote } : undefined,
      );

      const { close_summary: closeSummary } = response.data;
      const refundLine =
        closeSummary.refunded && closeSummary.refund_amount_cents
          ? ` Refund: ${formatRefundAmount(closeSummary.refund_amount_cents)}.`
          : "";

      toast.success(
        `${response.message || "Job closed successfully."}${refundLine}`,
      );

      onSuccess(closeSummary);
      onClose();
    } catch (error) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setSubmitError(
        err?.response?.data?.message ??
          err?.message ??
          "Failed to close job. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !isSubmitting) onClose();
      }}
    >
      <DialogContent className="gap-4 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Close job</DialogTitle>
          <DialogDescription>
            Close <span className="font-medium text-gray-900">{jobTitle}</span>?
            Upcoming shifts will be cancelled and affected candidates will be
            notified.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <p>
              Hired or accepted candidates do not block closing. Any remaining
              escrow may be refunded according to platform rules.
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="recruiter-close-note"
            className="text-xs font-medium text-gray-500"
          >
            Note for your records (optional)
          </label>
          <textarea
            id="recruiter-close-note"
            value={note}
            onChange={(event) => setNote(event.target.value.slice(0, NOTE_MAX_LENGTH))}
            rows={3}
            placeholder="e.g. Position filled through another channel"
            disabled={isSubmitting}
            className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#F4781B] focus:outline-none focus:ring-2 focus:ring-orange-100 disabled:opacity-60"
          />
          <p className="text-right text-xs text-gray-400">
            {note.length}/{NOTE_MAX_LENGTH}
          </p>
        </div>

        {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}

        <DialogFooter className="gap-2 sm:gap-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Close job
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
