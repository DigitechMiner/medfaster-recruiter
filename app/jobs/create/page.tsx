'use client'
import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/global/app-layout";
import { CreateJobForm } from "./form/create-job-form";
import { GenerateAIForm } from "./form/generative-ai-form";
import type { JobCreatePayload } from "@/Interface/job.types";

function CreateJobContent() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [pendingPayload, setPendingPayload] = useState<JobCreatePayload | null>(null);

  return (
    <AppLayout>
      <div className="py-2 md:py-4 lg:py-6 overflow-x-hidden w-full">
        {step === 1 ? (
          <CreateJobForm
            urgencyMode="normal"
            onNext={(payload: JobCreatePayload) => {
              setPendingPayload(payload);
              setStep(2);
            }}
            onBack={() => router.push("/jobs")}
          />
        ) : (
          <GenerateAIForm
            pendingPayload={pendingPayload!}
            onBack={() => setStep(1)}
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
        <div className="py-2 md:py-4 lg:py-6 overflow-x-hidden w-full">
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </AppLayout>
    }>
      <CreateJobContent />
    </Suspense>
  );
}