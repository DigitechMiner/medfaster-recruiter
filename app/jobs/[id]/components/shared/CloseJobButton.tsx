"use client";

import { useMemo, useState } from "react";
import { XCircle } from "lucide-react";
import type { JobDetailSummaryData } from "@/types";
import { canShowCloseJobButton } from "@/features/jobs/job-close-eligibility";
import { CloseJobModal } from "./CloseJobModal";

type CloseJobButtonProps = {
  jobId: string;
  summary: JobDetailSummaryData;
  onClosed: () => void;
};

export const CLOSE_JOB_ACTION_SLOT_CLASS =
  "flex h-9 w-[7.25rem] shrink-0 items-center justify-end";

export function CloseJobButton({ jobId, summary, onClosed }: CloseJobButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const canClose = useMemo(() => canShowCloseJobButton(summary), [summary]);

  return (
    <>
      <div className={CLOSE_JOB_ACTION_SLOT_CLASS}>
        {canClose ? (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 text-xs font-semibold text-red-700 transition-colors hover:border-red-300 hover:bg-red-50 whitespace-nowrap"
          >
            <XCircle size={14} />
            Close job
          </button>
        ) : null}
      </div>

      {canClose ? (
        <CloseJobModal
          jobId={jobId}
          jobTitle={summary.title}
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={() => onClosed()}
        />
      ) : null}
    </>
  );
}
