'use client'
import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/global/app-layout";
import { CreateJobForm } from "./form/create-job-form";
import { GenerateAIForm } from "./form/generative-ai-form";
import { JobSummaryPage } from "./components/jobs-summary-page";
import { useJobsStore } from "@/stores/jobs-store";
import { axiosInstance } from "@/stores/api/api-client";
import { ENDPOINTS } from "@/stores/api/api-endpoints";
import type { JobCreatePayload } from "@/Interface/job.types";


function CreateJobContent() {
  const router = useRouter();
  const createJob = useJobsStore((s) => s.createJob);
  const setHasJobs = useJobsStore((s) => s.setHasJobs);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [pendingPayload, setPendingPayload] = useState<JobCreatePayload | null>(null);

  return (
    <AppLayout>
      <div className="py-2 md:py-4 lg:py-6 overflow-x-hidden w-full">
        {step === 1 && (
          <CreateJobForm
            urgencyMode="normal"
            onNext={(payload) => { setPendingPayload(payload); setStep(2); }}
            onBack={() => router.push("/jobs")}
          />
        )}
        {step === 2 && (
          <GenerateAIForm
            pendingPayload={pendingPayload!}
            onBack={() => setStep(1)}
            onNext={(updatedPayload) => { setPendingPayload(updatedPayload); setStep(3); }}
          />
        )}
        {step === 3 && pendingPayload && (
          <JobSummaryPage
            mode="normal"
            payload={pendingPayload}
            onBack={() => setStep(2)}
           onSubmit={async (finalPayload, feeCents) => {
  try {
    console.log("💳 feeCents received:", feeCents);
    console.log("💳 amount being sent:", feeCents / 100);

    const payRes = await axiosInstance.post(ENDPOINTS.WALLET_PAY, {
      amount: feeCents / 100,
    });

    console.log("✅ WALLET_PAY response:", payRes.data);

    const res = await createJob(finalPayload);
    if (res.success) setHasJobs(true);
    return { success: res.success, message: res.message, jobId: res.data?.id };

  } catch (err) {
    console.error("❌ onSubmit error:", err);
    return {
      success: false,
      message: (err as Error).message ?? "Failed. Please try again.",
    };
  }
}}
          />
        )}
      </div>
    </AppLayout>
  );
}

export default function CreateJobPage() {
  return (
    <Suspense fallback={
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-gray-600">Loading...</p>
        </div>
      </AppLayout>
    }>
      <CreateJobContent />
    </Suspense>
  );
}