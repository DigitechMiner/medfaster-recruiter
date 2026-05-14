"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/global/app-layout";
import { useJobsStore } from "@/stores/jobs-store";
import type { JobCreatePayload } from "@/types";
import { CreateJobLoadingFallback } from "../components/loading";
import { CreateJobProgressHeader } from "../components/progressBar";
import { JobReview } from "../components/preview";
import { InstantJobForm } from "../form/instant-job-form";

const INSTANT_JOB_STEPS = ["Basic Info", "Job Description", "Review"] as const;

export default function InstantReplacementPage() {
  return (
    <Suspense fallback={<CreateJobLoadingFallback />}>
      <InstantJobStepForm />
    </Suspense>
  );
}

function InstantJobStepForm() {
  const router = useRouter();
  const createJob = useJobsStore((s) => s.createJob);
  const setHasJobs = useJobsStore((s) => s.setHasJobs);
  const clearDraft = useJobsStore((s) => s.clearDraft);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [pendingPayload, setPendingPayload] =
    useState<JobCreatePayload | null>(null);

  const handleBackToJobs = () => {
    clearDraft();
    router.push("/jobs");
  };

  const handleBack = () => {
    if (step === 1) {
      handleBackToJobs();
      return;
    }

    if (step === 2) {
      setStep(1);
      return;
    }

    setStep(2);
  };

  return (
    <AppLayout>
      <div className="py-2 md:py-4 lg:py-6 space-y-4">
        <CreateJobProgressHeader
          title="Create Instant Job"
          steps={INSTANT_JOB_STEPS}
          currentStep={step}
          onBack={handleBackToJobs}
          backLabel="Back to Job"
        />

        {step === 1 && (
          <InstantJobForm
            urgencyMode="instant"
            formStep="basic"
            onStepNext={() => setStep(2)}
            onBack={handleBack}
          />
        )}

        {step === 2 && (
          <InstantJobForm
            urgencyMode="instant"
            formStep="description"
            onNext={(payload) => {
              setPendingPayload(payload);
              setStep(3);
            }}
            onBack={handleBack}
          />
        )}

        {step === 3 && pendingPayload && (
          <JobReview
            mode="urgent"
            payload={pendingPayload}
            onBack={handleBack}
            onSubmit={async (finalPayload) => {
              const res = await createJob(finalPayload);
              if (res.success) {
                setHasJobs(true);
                clearDraft();
              }
              return {
                success: res.success,
                message: res.message,
                jobId: res.data?.id,
              };
            }}
          />
        )}
      </div>
    </AppLayout>
  );
}