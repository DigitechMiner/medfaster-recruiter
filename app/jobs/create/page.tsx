'use client';

import { useState, Suspense } from "react";
import { useRouter }           from "next/navigation";
import { AppLayout }           from "@/components/global/app-layout";
import { CreateJobForm }       from "./form/create-job-form";
import { GenerateAIForm }      from "./form/generative-ai-form";
import { JobSummaryPage }      from "./components/jobs-summary-page";
import { useJobsStore }        from "@/stores/jobs-store";
import { axiosInstance }       from "@/stores/api/api-client";
import { ENDPOINTS }           from "@/stores/api/api-endpoints";
import type { JobCreatePayload } from "@/Interface/recruiter.types";


// ── Lifted AI question type ───────────────────────────────────────────────────
export interface AIQuestion {
  id:   string;
  text: string;
}


const uid = () => crypto.randomUUID();

const makeDefaultQuestions = (): AIQuestion[] =>
  Array.from({ length: 5 }, () => ({ id: uid(), text: "" }));


function CreateJobContent() {
  const router     = useRouter();
  const createJob  = useJobsStore((s) => s.createJob);
  const setHasJobs = useJobsStore((s) => s.setHasJobs);
  const clearDraft = useJobsStore((s) => s.clearDraft);

  // step 1 = job form, step 2 = AI questions, step 3 = summary
  const [step, setStep]                    = useState<1 | 2 | 3>(1);
  const [pendingPayload, setPendingPayload] = useState<JobCreatePayload | null>(null);
  const [wantsInterview, setWantsInterview] = useState(true);

  // ✅ Lifted AI questions state — survives step navigation
  const [aiQuestions, setAiQuestions] = useState<AIQuestion[]>(makeDefaultQuestions);

  return (
    <AppLayout>
      <div className="py-2 md:py-4 lg:py-6 overflow-x-hidden w-full">

        {step === 1 && (
          <CreateJobForm
            urgencyMode="normal"
            onNext={(payload, hasInterview) => {
              setPendingPayload(payload);
              setWantsInterview(hasInterview);
              setStep(hasInterview ? 2 : 3);
            }}
            onBack={() => router.push("/jobs")}
          />
        )}

        {step === 2 && (
          <GenerateAIForm
            pendingPayload={pendingPayload!}
            questions={aiQuestions}
            onQuestionsChange={setAiQuestions}
            onBack={() => setStep(1)}
            onNext={(updatedPayload) => {
              setPendingPayload(updatedPayload);
              setStep(3);
            }}
          />
        )}

        {step === 3 && pendingPayload && (
          <JobSummaryPage
            mode="normal"
            payload={pendingPayload}
            onBack={() => setStep(wantsInterview ? 2 : 1)}
            onSubmit={async (finalPayload, feeCents) => {
  try {
    // ✅ Skip wallet charge entirely for full time jobs (feeCents === 0)
    if (feeCents > 0) {
      const payRes = await axiosInstance.post(ENDPOINTS.WALLET_PAY, {
        amount: feeCents / 100,
      });
      console.log("✅ WALLET_PAY response:", payRes.data);
    }

    const res = await createJob(finalPayload);
    if (res.success) {
      setHasJobs(true);
      clearDraft();
    }
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