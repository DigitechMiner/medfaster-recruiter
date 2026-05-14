"use client";

import { Suspense, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/global/app-layout";
import { useJobsStore } from "@/stores/jobs-store";
import type { JobCreatePayload } from "@/types";
import { CreateJobLoadingFallback } from "../components/loading";
import { CreateJobProgressHeader } from "../components/progressBar";
import { JobReview, type JobReviewActionState } from "../components/preview";
import { CreateJobStepActions, CreateJobStepCard } from "../components/step-shell";
import { InstantJobForm } from "./instant-job-form";

const INSTANT_BASIC_FORM_ID = "instant-job-basic-form";
const INSTANT_DESCRIPTION_FORM_ID = "instant-job-description-form";
const INSTANT_REVIEW_FORM_ID = "instant-job-review-form";
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
  const [pendingProgressStep, setPendingProgressStep] = useState<number | null>(
    null,
  );
  const [progressValidationToken, setProgressValidationToken] =
    useState<number>();
  const [reviewActionState, setReviewActionState] =
    useState<JobReviewActionState>({
      isProcessing: false,
      isSubmitDisabled: false,
    });

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

  const resetProgressValidation = () => {
    setPendingProgressStep(null);
    setProgressValidationToken(undefined);
  };

  const handleProgressStepClick = (targetStep: number) => {
    if (targetStep <= step) {
      resetProgressValidation();
      setStep(targetStep as 1 | 2 | 3);
      return;
    }

    setPendingProgressStep(targetStep);
    setProgressValidationToken((token) => (token ?? 0) + 1);
  };

  const handleBasicStepNext = () => {
    if (pendingProgressStep && pendingProgressStep > 2) {
      setStep(2);
      return;
    }

    resetProgressValidation();
    setStep(2);
  };

  const handleDescriptionNext = (payload: JobCreatePayload) => {
    const targetProgressStep = pendingProgressStep;

    setPendingPayload(payload);
    resetProgressValidation();

    if (targetProgressStep) {
      setStep(Math.min(targetProgressStep, INSTANT_JOB_STEPS.length) as 1 | 2 | 3);
      return;
    }

    setStep(3);
  };

  const canNavigateToProgressStep = (targetStep: number) => {
    if (targetStep >= 1 && targetStep <= 3) {
      return true;
    }

    return false;
  };

  const handleReviewActionStateChange = useCallback(
    (nextState: JobReviewActionState) => {
      setReviewActionState((prevState) =>
        prevState.isProcessing === nextState.isProcessing &&
        prevState.isSubmitDisabled === nextState.isSubmitDisabled
          ? prevState
          : nextState,
      );
    },
    [],
  );

  return (
    <AppLayout>
      <div className="py-2 md:py-4 lg:py-6 space-y-4">
        <CreateJobProgressHeader
          title="Create Instant Job"
          steps={INSTANT_JOB_STEPS}
          currentStep={step}
          onBack={handleBackToJobs}
          onStepClick={handleProgressStepClick}
          canNavigateToStep={canNavigateToProgressStep}
          backLabel="Back to Job"
        />

        {step === 1 && (
          <CreateJobStepCard
            title="Basic Info"
            footer={
              <CreateJobStepActions
                onBack={handleBack}
                nextLabel="Next"
                nextType="submit"
                nextForm={INSTANT_BASIC_FORM_ID}
              />
            }
          >
            <InstantJobForm
              urgencyMode="instant"
              formStep="basic"
              formId={INSTANT_BASIC_FORM_ID}
              onStepNext={handleBasicStepNext}
              autoSubmitToken={progressValidationToken}
              onValidationBlocked={resetProgressValidation}
            />
          </CreateJobStepCard>
        )}

        {step === 2 && (
          <CreateJobStepCard
            title="Job Description"
            footer={
              <CreateJobStepActions
                onBack={handleBack}
                nextLabel="Preview Job"
                nextType="submit"
                nextForm={INSTANT_DESCRIPTION_FORM_ID}
              />
            }
          >
            <InstantJobForm
              urgencyMode="instant"
              formStep="description"
              formId={INSTANT_DESCRIPTION_FORM_ID}
              onNext={handleDescriptionNext}
              autoSubmitToken={progressValidationToken}
              onValidationBlocked={resetProgressValidation}
            />
          </CreateJobStepCard>
        )}

        {step === 3 && pendingPayload && (
          <CreateJobStepCard
            title="Review"
            footer={
              <CreateJobStepActions
                onBack={handleBack}
                nextLabel="Publish Job"
                nextType="submit"
                nextForm={INSTANT_REVIEW_FORM_ID}
                nextLoading={reviewActionState.isProcessing}
                nextDisabled={reviewActionState.isSubmitDisabled}
              />
            }
          >
            <JobReview
              mode="urgent"
              payload={pendingPayload}
              formId={INSTANT_REVIEW_FORM_ID}
              onActionStateChange={handleReviewActionStateChange}
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
          </CreateJobStepCard>
        )}
      </div>
    </AppLayout>
  );
}