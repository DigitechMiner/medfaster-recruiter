"use client";

import { Suspense, useCallback, useMemo, useState } from "react";
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
import { MIN_AI_QUESTIONS } from "./constant";
import {
  buildTeamLabels,
  clampTeamCount,
  formatCandidateWeeklyHoursViolations,
  getCandidateWeeklyHoursViolations,
  getDefaultTeamCount,
} from "./scheduling-utils";
import { formatDateForBackend } from "../form/utils";
import type { ShiftDurationType, ShiftType, StaffingType } from "@/types";
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

/** Merges live scheduling snapshot into the description-step payload for review/preview. */
function mergeSnapshotIntoJobPayload(
  base: JobCreatePayload,
  snapshot: JobFormSnapshot | null,
): JobCreatePayload {
  if (!snapshot) return base;

  const toBackendDateString = (
    value?: Date | string,
  ): string | undefined => {
    if (!value) return undefined;
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return undefined;
    return formatDateForBackend(date);
  };

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
    start_date:
      toBackendDateString(snapshot.start_date) ?? base.start_date,
    end_date: toBackendDateString(snapshot.end_date) ?? base.end_date,
    check_in_time: mergedCheckIn,
    check_out_time: mergedCheckOut,
    morning_shift_start: snapshot.morning_shift_start ?? base.morning_shift_start,
    morning_shift_end: snapshot.morning_shift_end ?? base.morning_shift_end,
    evening_shift_start:
      snapshot.evening_shift_start ?? base.evening_shift_start,
    evening_shift_end: snapshot.evening_shift_end ?? base.evening_shift_end,
    night_shift_start: snapshot.night_shift_start ?? base.night_shift_start,
    night_shift_end: snapshot.night_shift_end ?? base.night_shift_end,
    break_duration_minutes:
      snapshot.break_duration_minutes ?? base.break_duration_minutes,
    employment_type: snapshot.employment_type ?? base.employment_type,
    job_period_option: snapshot.job_period_option ?? base.job_period_option,
    staffing_type: snapshot.staffing_type ?? base.staffing_type,
    shift_duration_type:
      snapshot.shift_duration_type ?? base.shift_duration_type,
    selected_shift_types:
      snapshot.selected_shift_types ?? base.selected_shift_types,
    job_duration_per_day:
      snapshot.job_duration_per_day ?? base.job_duration_per_day,
    cycle_start_day: snapshot.cycle_start_day ?? base.cycle_start_day,
    number_of_teams: snapshot.number_of_teams
      ? parseInt(String(snapshot.number_of_teams), 10)
      : base.number_of_teams,
    shift_schedule_details:
      snapshot.shift_schedule_details ?? base.shift_schedule_details,
    schedule_template:
      snapshot.schedule_template ?? base.schedule_template,
    pay_per_hour_cents:
      snapshot.backend_pay_rate != null
        ? Math.round(snapshot.backend_pay_rate * 100)
        : base.pay_per_hour_cents,
  };
}

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
  const [descriptionLoading, setDescriptionLoading] = useState(false);

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
    formSnapshot?.ai_interview === undefined ||
    formSnapshot.ai_interview === true;

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
    setWantsInterview(hasInterview);

    if (hasInterview) {
      const validQuestions = aiQuestions
        .map((question) => question.text.trim())
        .filter((text) => text.length > 0);

      if (validQuestions.length < MIN_AI_QUESTIONS) {
        toast.error(
          `Please add at least ${MIN_AI_QUESTIONS} AI interview questions.`,
        );
        return;
      }

      setPendingPayload({
        ...payload,
        questions: validQuestions,
        ai_interview: true,
      });
    } else {
      setPendingPayload({
        ...payload,
        questions: null,
        ai_interview: false,
      });
    }

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

  const reviewPayload = useMemo(() => {
    if (!pendingPayload) return null;
    return mergeSnapshotIntoJobPayload(pendingPayload, formSnapshot);
  }, [pendingPayload, formSnapshot]);

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
                  const snapshot = useJobsStore.getState().formSnapshot;
                  if (!snapshot) return;

                  const selectedShifts =
                    (snapshot.selected_shift_types as ShiftType[]) ?? [];
                  const shiftDuration =
                    (snapshot.shift_duration_type as ShiftDurationType) ??
                    "8_hrs";
                  const staffingType =
                    (snapshot.staffing_type as StaffingType) ?? "standard";
                  const teamCount = clampTeamCount(
                    Number(snapshot.number_of_teams) ||
                      getDefaultTeamCount(staffingType),
                    staffingType,
                  );
                  const teamLabels = buildTeamLabels(teamCount);
                  const weeklyError = formatCandidateWeeklyHoursViolations(
                    getCandidateWeeklyHoursViolations({
                      scheduleTemplate: snapshot.schedule_template,
                      teamLabels,
                      selectedShifts,
                      shiftScheduleDetails: snapshot.shift_schedule_details,
                      shiftDuration,
                    }),
                  );

                  if (weeklyError) {
                    toast.error(weeklyError);
                    return;
                  }

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
                nextForm={NORMAL_DESCRIPTION_FORM_ID}
                nextDisabled={descriptionLoading}
              />
            }
          >
            {/* Description part: always visible */}
            <NormalJobForm
              urgencyMode="normal"
              formStep="description"
              formId={NORMAL_DESCRIPTION_FORM_ID}
              autoSubmitToken={progressValidationToken}
              onValidationBlocked={resetProgressValidation}
              onNext={handleDescriptionNext}
              onDescriptionLoadingChange={setDescriptionLoading}
            />

            {/* AI questions part: only when AI interview is enabled */}
            {descriptionWantsInterview && wantsInterview && (
              <div className="mt-8">
                <QuestionForm
                  pendingPayload={pendingPayload ?? undefined}
                  questions={aiQuestions}
                  onQuestionsChange={setAiQuestions}
                  formId={NORMAL_QUESTIONS_FORM_ID}
                  onValidationBlocked={resetProgressValidation}
                />
              </div>
            )}
          </CreateJobStepCard>
        )}

        {/* Step 4: Review, Pay & Publish */}
        {step === 4 && !pendingPayload && (
          <CreateJobStepCard
            title="Review, Pay & Publish"
            footer={
              <CreateJobStepActions
                onBack={handleBack}
                nextLabel="Publish Job"
                showBack
                nextDisabled
              />
            }
          >
            <p className="text-sm text-gray-600">
              Complete the description step first, then continue to review and
              publish.
            </p>
          </CreateJobStepCard>
        )}

        {step === 4 && reviewPayload && (
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
            <JobReview
              mode="normal"
              payload={reviewPayload}
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