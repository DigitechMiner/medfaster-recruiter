"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/global/app-layout";
import { useJobsStore } from "@/stores/jobs-store";
import type { JobCreatePayload } from "@/types";
import { CreateJobLoadingFallback } from "../components/loading";
import { CreateJobProgressHeader } from "../components/progressBar";
import { JobReview } from "../components/preview";
import { NormalJobForm } from "../form/normal-job-form";
import { QuestionForm } from "../form/question-form";
import type { AIQuestion } from "../helper/types";

const uid = () => crypto.randomUUID();
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

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [pendingPayload, setPendingPayload] = useState<JobCreatePayload | null>(
    null,
  );
  const [wantsInterview, setWantsInterview] = useState(true);
  const [aiQuestions, setAiQuestions] =
    useState<AIQuestion[]>(makeDefaultQuestions);

  const steps = wantsInterview
    ? NORMAL_JOB_STEPS
    : NORMAL_JOB_STEPS_WITHOUT_INTERVIEW;
  const currentProgressStep =
    !wantsInterview && step === 4 ? 3 : step;

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

  return (
    <AppLayout>
      <div className="py-2 md:py-4 lg:py-6 overflow-x-hidden w-full space-y-4">
        <CreateJobProgressHeader
          title="Create Normal Job"
          steps={steps}
          currentStep={currentProgressStep}
          onBack={handleBackToJobs}
          backLabel="Back to Job"
        />

        {step === 1 && (
          <NormalJobForm
            urgencyMode="normal"
            formStep="basic"
            onStepNext={() => setStep(2)}
            onBack={handleBack}
          />
        )}

        {step === 2 && (
          <NormalJobForm
            urgencyMode="normal"
            formStep="description"
            onNext={(payload, hasInterview) => {
              setPendingPayload(payload);
              setWantsInterview(hasInterview);
              setStep(hasInterview ? 3 : 4);
            }}
            onBack={handleBack}
          />
        )}

        {step === 3 && (
          <QuestionForm
            pendingPayload={pendingPayload!}
            questions={aiQuestions}
            onQuestionsChange={setAiQuestions}
            onBack={handleBack}
            onNext={(updatedPayload) => {
              setPendingPayload(updatedPayload);
              setStep(4);
            }}
          />
        )}

        {step === 4 && pendingPayload && (
          <JobReview
            mode="normal"
            payload={pendingPayload}
            onBack={handleBack}
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
        )}
      </div>
    </AppLayout>
  );
}
