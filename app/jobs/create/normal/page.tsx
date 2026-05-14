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
import { NormalJobForm } from "./normal-job-form";
import { QuestionForm, type AIQuestion } from "../form/question-form";

const uid = () => crypto.randomUUID();
const NORMAL_BASIC_FORM_ID = "normal-job-basic-form";
const NORMAL_DESCRIPTION_FORM_ID = "normal-job-description-form";
const NORMAL_QUESTIONS_FORM_ID = "normal-job-questions-form";
const NORMAL_REVIEW_FORM_ID = "normal-job-review-form";
const NORMAL_JOB_STEPS = [
  "Basic Info",
  "Job Description",
  "Questions",
  "Review",
] as const;
const NORMAL_JOB_STEPS_WITHOUT_INTERVIEW = [
  "Basic Info",
  "Job Description",
  "Review",
] as const;

const makeDefaultQuestions = (): AIQuestion[] =>
  Array.from({ length: 5 }, () => ({ id: uid(), text: "" }));

export default function CreateJobPage() {
  return (
    <Suspense fallback={<CreateJobLoadingFallback />}>
      <NormalJobStepForm />
    </Suspense>
  );
}

function NormalJobStepForm() {
  const router = useRouter();
  const createJob = useJobsStore((s) => s.createJob);
  const setHasJobs = useJobsStore((s) => s.setHasJobs);
  const clearDraft = useJobsStore((s) => s.clearDraft);
  const formSnapshot = useJobsStore((s) => s.formSnapshot);

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [pendingPayload, setPendingPayload] = useState<JobCreatePayload | null>(
    null,
  );
  const [wantsInterview, setWantsInterview] = useState(true);
  const [aiQuestions, setAiQuestions] =
    useState<AIQuestion[]>(makeDefaultQuestions);
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

  const steps = wantsInterview
    ? NORMAL_JOB_STEPS
    : NORMAL_JOB_STEPS_WITHOUT_INTERVIEW;
  const currentProgressStep =
    !wantsInterview && step === 4 ? 3 : step;
  const descriptionWantsInterview =
    formSnapshot?.inPersonInterview === undefined ||
    formSnapshot.inPersonInterview === "Yes" ||
    formSnapshot.inPersonInterview === true;

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

    if (step === 3) {
      setStep(2);
      return;
    }

    setStep(wantsInterview ? 3 : 2);
  };

  const resetProgressValidation = () => {
    setPendingProgressStep(null);
    setProgressValidationToken(undefined);
  };

  const navigateToProgressStep = (targetStep: number) => {
    if (!wantsInterview && targetStep === 3) {
      setStep(4);
      return;
    }

    if (targetStep >= 1 && targetStep <= 4) {
      setStep(targetStep as 1 | 2 | 3 | 4);
    }
  };

  const handleProgressStepClick = (targetStep: number) => {
    if (targetStep <= currentProgressStep) {
      resetProgressValidation();
      navigateToProgressStep(targetStep);
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

  const handleDescriptionNext = (
    payload: JobCreatePayload,
    hasInterview: boolean,
  ) => {
    const targetProgressStep = pendingProgressStep;

    setPendingPayload(payload);
    setWantsInterview(hasInterview);

    if (targetProgressStep) {
      const finalTarget = Math.min(
        targetProgressStep,
        hasInterview ? NORMAL_JOB_STEPS.length : NORMAL_JOB_STEPS_WITHOUT_INTERVIEW.length,
      );

      if (hasInterview && finalTarget > 3) {
        setStep(3);
        return;
      }

      resetProgressValidation();
      setStep(!hasInterview && finalTarget === 3 ? 4 : (finalTarget as 1 | 2 | 3 | 4));
      return;
    }

    resetProgressValidation();
    setStep(hasInterview ? 3 : 4);
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
      <div className="py-2 md:py-4 lg:py-6 overflow-x-hidden w-full space-y-4">
        <CreateJobProgressHeader
          title=""
          steps={steps}
          currentStep={currentProgressStep}
          onBack={handleBackToJobs}
          onStepClick={handleProgressStepClick}
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
                nextForm={NORMAL_BASIC_FORM_ID}
              />
            }
          >
            <NormalJobForm
              urgencyMode="normal"
              formStep="basic"
              formId={NORMAL_BASIC_FORM_ID}
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
                nextLabel={
                  descriptionWantsInterview ? "Next: Questions" : "Preview Job"
                }
                nextType="submit"
                nextForm={NORMAL_DESCRIPTION_FORM_ID}
              />
            }
          >
            <NormalJobForm
              urgencyMode="normal"
              formStep="description"
              formId={NORMAL_DESCRIPTION_FORM_ID}
              onNext={handleDescriptionNext}
              autoSubmitToken={progressValidationToken}
              onValidationBlocked={resetProgressValidation}
            />
          </CreateJobStepCard>
        )}

        {step === 3 && (
          <CreateJobStepCard
            title="Questions"
            footer={
              <CreateJobStepActions
                onBack={handleBack}
                nextLabel="Preview Job"
                nextType="submit"
                nextForm={NORMAL_QUESTIONS_FORM_ID}
              />
            }
          >
            <QuestionForm
              pendingPayload={pendingPayload!}
              questions={aiQuestions}
              onQuestionsChange={setAiQuestions}
              formId={NORMAL_QUESTIONS_FORM_ID}
              autoSubmitToken={progressValidationToken}
              onValidationBlocked={resetProgressValidation}
              onNext={(updatedPayload) => {
                setPendingPayload(updatedPayload);
                resetProgressValidation();
                setStep(4);
              }}
            />
          </CreateJobStepCard>
        )}

        {step === 4 && pendingPayload && (
          <CreateJobStepCard
            title="Review"
            footer={
              <CreateJobStepActions
                onBack={handleBack}
                nextLabel="Publish Job"
                nextType="submit"
                nextForm={NORMAL_REVIEW_FORM_ID}
                nextLoading={reviewActionState.isProcessing}
                nextDisabled={reviewActionState.isSubmitDisabled}
              />
            }
          >
            <JobReview
              mode="normal"
              payload={pendingPayload}
              formId={NORMAL_REVIEW_FORM_ID}
              onActionStateChange={handleReviewActionStateChange}
              onSubmit={async (finalPayload) => {
                try {
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
                } catch (err) {
                  console.log(err);
                  return {
                    success: false,
                    message:
                      (err as Error).message ?? "Failed. Please try again.",
                  };
                }
              }}
            />
          </CreateJobStepCard>
        )}
      </div>
    </AppLayout>
  );
}
