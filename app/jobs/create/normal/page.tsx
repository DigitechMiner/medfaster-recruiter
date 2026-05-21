"use client";

import { Suspense, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/global/app-layout";
import { JobFormSnapshot, useJobsStore } from "@/stores/jobs-store";
import type { JobCreatePayload, JobFormData } from "@/types";
import { CreateJobLoadingFallback } from "../components/loading";
import { CreateJobProgressHeader } from "../components/progressBar";
import {
  JobReview,
  type JobReviewActionState,
} from "../components/preview";
import {
  CreateJobStepActions,
  CreateJobStepCard,
} from "../components/step-shell";
import { NormalJobForm } from "./normal-job-form";
import {
  QuestionForm,
  type AIQuestion,
} from "../form/question-form";
import { NormalSchedulingStep } from "./normal-scheduling-step";
import { toast } from "react-toastify";

const uid = () => crypto.randomUUID();

const NORMAL_BASIC_FORM_ID = "normal-job-basic-form";
const NORMAL_DESCRIPTION_FORM_ID = "normal-job-description-form";
const NORMAL_QUESTIONS_FORM_ID = "normal-job-questions-form";
const NORMAL_REVIEW_FORM_ID = "normal-job-review-form";

const NORMAL_JOB_STEPS = [
  "Job Basics",
  "Scheduling Setup",
  "Description",
  "Review, Pay & Publish",
] as const;

/**
 * When AI interview is disabled, we still show 4 steps visually (to match Figma),
 * but internally we will skip the questions content and jump from Description to Review.
 */
const NORMAL_JOB_STEPS_WITHOUT_INTERVIEW = NORMAL_JOB_STEPS;

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
  const [pendingPayload, setPendingPayload] =
    useState<JobCreatePayload | null>(null);
  const [wantsInterview, setWantsInterview] = useState(true);
  const [aiQuestions, setAiQuestions] =
    useState<AIQuestion[]>(makeDefaultQuestions);
  const [pendingProgressStep, setPendingProgressStep] =
    useState<number | null>(null);
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

  /**
   * Visually, the progress header always shows 4 steps.
   * Logically, when AI interview is disabled, we skip the questions content,
   * but still keep Step 3 labeled "Description" and Step 4 as "Review, Pay & Publish".
   */
  const currentProgressStep = step;

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

    // step === 4
    if (wantsInterview) {
      setStep(3);
    } else {
      setStep(3); // Description is always step 3 now
    }
  };

  const resetProgressValidation = () => {
    setPendingProgressStep(null);
    setProgressValidationToken(undefined);
  };

  const navigateToProgressStep = (targetStep: number) => {
    if (targetStep >= 1 && targetStep <= 4) {
      setStep(targetStep as 1 | 2 | 3 | 4);
    }
  };

  const handleProgressStepClick = (targetStep: number) => {
    // Allow navigating back freely
    if (targetStep <= currentProgressStep) {
      resetProgressValidation();
      navigateToProgressStep(targetStep);
      return;
    }

    // For forward navigation, trigger validation of current form
    setPendingProgressStep(targetStep);
    setProgressValidationToken((token) => (token ?? 0) + 1);
  };

  const handleBasicStepNext = () => {
    if (pendingProgressStep && pendingProgressStep > 2) {
      setStep(2); // go to Scheduling Setup
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

    // store description/basic payload as-is
    setPendingPayload(payload);
    setWantsInterview(hasInterview);

    if (hasInterview) {
      // When AI interview is enabled, Step 3 content includes questions.
      if (targetProgressStep && targetProgressStep > 3) {
        resetProgressValidation();
        setStep(4);
        return;
      }

      resetProgressValidation();
      setStep(3);
      return;
    }

    // No AI interview: skip questions section and go to Review
    resetProgressValidation();
    setStep(4);
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

  // Merge all steps (basics + scheduling + description) into one JobCreatePayload
 const buildFinalPayload = (base: JobCreatePayload): JobCreatePayload => {
  const snapshot = useJobsStore.getState()
    .formSnapshot as JobFormData | undefined;
  if (!snapshot) return base;

  const toDateString = (value?: Date): string | undefined => {
    if (!value) return undefined;
    // API expects MM/DD/YYYY
    const mm = String(value.getMonth() + 1).padStart(2, "0");
    const dd = String(value.getDate()).padStart(2, "0");
    const yyyy = value.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  };

  // Prefer explicit shift fields from scheduling; fall back to generic ones,
  // and finally to what was already in base.
  const mergedCheckIn =
    snapshot.morning_shift_start ??
    snapshot.check_in_time ??
    base.check_in_time;

  const mergedCheckOut =
    snapshot.morning_shift_end ??
    snapshot.check_out_time ??
    base.check_out_time;

  return {
    ...base,
    // Dates from scheduling step, converted to MM/DD/YYYY strings
    start_date: toDateString(snapshot.start_date) ?? base.start_date,
    end_date: toDateString(snapshot.end_date) ?? base.end_date,

    // Shift times
    check_in_time: mergedCheckIn,
    check_out_time: mergedCheckOut,

    // New scheduling/scope fields
    employment_type: snapshot.employment_type ?? base.employment_type,
    job_period_option: snapshot.job_period_option ?? base.job_period_option,
    staffing_type: snapshot.staffing_type ?? base.staffing_type,
    shift_duration_type:
      snapshot.shift_duration_type ?? base.shift_duration_type,
    selected_shift_types:
      snapshot.selected_shift_types ?? base.selected_shift_types,
  };
};

  return (
    <AppLayout>
      <div className="w-full space-y-4 overflow-x-hidden py-2 md:py-4 lg:py-6">
        <CreateJobProgressHeader
          title="Create Job Post"
          steps={steps}
          currentStep={currentProgressStep}
          onBack={handleBackToJobs}
          onStepClick={handleProgressStepClick}
          backLabel="Back to Jobs"
        />

        {/* Step 1: Job Basics */}
        {step === 1 && (
          <CreateJobStepCard
            title="Job Basics"
            footer={
              <CreateJobStepActions
                onBack={handleBack}
                nextLabel="Next: Scheduling Setup"
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

        {/* Step 2: Scheduling Setup */}
        {step === 2 && (
          <CreateJobStepCard
            title="Scheduling Setup"
            footer={
              <CreateJobStepActions
                onBack={handleBack}
                nextLabel="Next: Description"
                nextType="button"
                onNext={() => {
                  // no extra validation here; dates and scheduling details
                  // will be validated when Step 3 or final submit runs
                  resetProgressValidation();
                  setStep(3);
                }}
              />
            }
          >
            {useJobsStore.getState().formSnapshot && (
              <NormalSchedulingStep
                formData={
                  useJobsStore.getState()
                    .formSnapshot as unknown as JobFormData
                }
                updateFormData={(updates) => {
                  const current =
                    useJobsStore.getState().formSnapshot ?? {};
                  const nextSnapshot = {
                    ...current,
                    ...updates,
                  } as JobFormSnapshot;
                  useJobsStore.getState().setFormSnapshot(nextSnapshot);
                }}
              />
            )}
          </CreateJobStepCard>
        )}

        {/* Step 3: Description (+ AI questions when enabled) */}
        {step === 3 && (
          <CreateJobStepCard
            title="Description"
            footer={
              <CreateJobStepActions
                onBack={handleBack}
                nextLabel="Next: Review, Pay & Publish"
                nextType="submit"
                nextForm={
                  wantsInterview
                    ? NORMAL_QUESTIONS_FORM_ID
                    : NORMAL_DESCRIPTION_FORM_ID
                }
              />
            }
          >
            {/* Description part: always visible */}
            <NormalJobForm
              urgencyMode="normal"
              formStep="description"
              formId={NORMAL_DESCRIPTION_FORM_ID}
              autoSubmitToken={undefined}
              onValidationBlocked={resetProgressValidation}
              onNext={(payload, hasInterview) => {
                // store latest description/basic payload
                setPendingPayload(payload);
                setWantsInterview(hasInterview);
              }}
            />

            {/* AI questions part: only when AI interview is enabled */}
            {descriptionWantsInterview && wantsInterview && (
              <div className="mt-8">
                <QuestionForm
                  pendingPayload={pendingPayload ?? undefined}
                  questions={aiQuestions}
                  onQuestionsChange={setAiQuestions}
                  formId={NORMAL_QUESTIONS_FORM_ID}
                  autoSubmitToken={progressValidationToken}
                  onValidationBlocked={resetProgressValidation}
                  onNext={(updatedPayload) => {
                    // QuestionForm has validated questions and built final payload
                    setPendingPayload(updatedPayload);
                    resetProgressValidation();
                    setStep(4);
                  }}
                />
              </div>
            )}

            {/* When AI interview is off, clicking Next should move directly to review */}
            {!descriptionWantsInterview || !wantsInterview ? (
              <form
                id={NORMAL_DESCRIPTION_FORM_ID}
                className="hidden"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (pendingPayload) {
                    resetProgressValidation();
                    setStep(4);
                  } else {
                    toast.error(
                      "Please complete the description section first.",
                    );
                  }
                }}
              />
            ) : null}
          </CreateJobStepCard>
        )}

        {/* Step 4: Review, Pay & Publish */}
        {step === 4 && pendingPayload && (
          <CreateJobStepCard
            title="Review, Pay & Publish"
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
            {(() => {
              const finalPayload = buildFinalPayload(pendingPayload);

              return (
                <JobReview
                  mode="normal"
                  payload={finalPayload}
                  formId={NORMAL_REVIEW_FORM_ID}
                  onActionStateChange={handleReviewActionStateChange}
                  onSubmit={async (apiPayload) => {
                    try {
                      const res = await createJob(apiPayload);
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
                          (err as Error).message ??
                          "Failed. Please try again.",
                      };
                    }
                  }}
                />
              );
            })()}
          </CreateJobStepCard>
        )}
      </div>
    </AppLayout>
  );
}