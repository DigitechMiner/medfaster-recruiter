'use client'
import { useMemo, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/global/app-layout";
import { InstantReplacementForm } from "../create/form/instant-replacement-form";
import { JobSummaryPage } from "../create/components/jobs-summary-page";
import { useJobsStore } from "@/stores/jobs-store";
import type { JobCreatePayload } from "@/Interface/job.types";

function InstantReplacementContent() {
  const router = useRouter();
  const createJob = useJobsStore((s) => s.createJob);
  const setHasJobs = useJobsStore((s) => s.setHasJobs);

  const [step, setStep] = useState<1 | 2>(1);
  const [pendingPayload, setPendingPayload] = useState<JobCreatePayload | null>(null);

  return (
    <AppLayout>
      <div className="py-2 md:py-4 lg:py-6">
        {step === 1 && (
          <InstantReplacementForm
            urgencyMode="instant"
            onNext={(payload) => { setPendingPayload(payload); setStep(2); }}
            onBack={() => router.push("/jobs")}
          />
        )}
        {step === 2 && pendingPayload && (
  <JobSummaryPage
    mode="urgent"
    payload={pendingPayload}
    onBack={() => setStep(1)}
    onSubmit={async (finalPayload) => {
      const res = await createJob(finalPayload);
      if (res.success) setHasJobs(true);
      return { success: res.success, message: res.message, jobId: res.data?.id };
    }}
  />
)}
      </div>
    </AppLayout>
  );
}

export default function InstantReplacementPage() {
  return (
    <Suspense fallback={<AppLayout><div className="flex items-center justify-center min-h-[400px]"><p className="text-gray-600">Loading...</p></div></AppLayout>}>
      <InstantReplacementContent />
    </Suspense>
  );
}