'use client';
import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/global/app-layout";
import SuccessModal from "@/components/modal";
import { useJobsStore } from "@/stores/jobs-store";
import type { JobCreatePayload } from "@/Interface/recruiter.types";

function PaymentCompleteContent() {
  const router = useRouter();
  const createJob = useJobsStore((s) => s.createJob);
  const setHasJobs = useJobsStore((s) => s.setHasJobs);

  const [showSuccess, setShowSuccess] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [jobId, setJobId] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("pending_job_payload");
    if (!raw) { router.replace("/jobs"); return; }

    const payload: JobCreatePayload = JSON.parse(raw);
    setJobTitle(payload.job_title ?? "");

    createJob(payload).then((res) => {
      if (res.success) {
        sessionStorage.removeItem("pending_job_payload");
        sessionStorage.removeItem("pending_job_mode");
        setJobId(res.data?.id ?? "");
        setHasJobs(true);
        setShowSuccess(true);
      } else {
        setError(res.message || "Failed to create job after payment");
      }
    });
  }, []); // eslint-disable-line

  if (error) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="bg-white rounded-xl p-6 shadow text-center max-w-sm">
            <p className="font-semibold text-gray-800 mb-2">Job submission failed</p>
            <p className="text-sm text-gray-500">{error}</p>
            <p className="text-xs text-gray-400 mt-2">Your payment was collected. Please contact support.</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-400 text-sm animate-pulse">Finalizing your job post...</p>
      </div>
      <SuccessModal
        visible={showSuccess}
        onClose={() => { setShowSuccess(false); router.push("/jobs"); }}
        title="New Job Post Created"
        message={`${jobTitle} – Job ID: ${jobId} is now live and ready for applicants.`}
        buttonText="Go to Dashboard"
      />
    </AppLayout>
  );
}

export default function PaymentCompletePage() {
  return (
    <Suspense fallback={<AppLayout><div className="flex items-center justify-center min-h-[400px]"><p className="text-gray-600">Loading...</p></div></AppLayout>}>
      <PaymentCompleteContent />
    </Suspense>
  );
}