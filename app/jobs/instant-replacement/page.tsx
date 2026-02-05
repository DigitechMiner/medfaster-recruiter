// app/jobs/instant-replacement/page.tsx
'use client'
import { useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppLayout } from "@/components/global/app-layout";

import { GenerateAIForm } from "../create/form/generative-ai-form"; // Reuse AI form
import { InstantReplacementForm } from "../create/form/instant-replacement-form";

function InstantReplacementContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const step = useMemo(() => {
    const value = Number(searchParams.get("step") ?? "1");
    return value === 2 ? 2 : 1;
  }, [searchParams]);

  const goToStep = (nextStep: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("step", String(nextStep));
    router.replace(`/jobs/instant-replacement?${params.toString()}`);
  };

  return (
    <AppLayout>
      <div className="py-2 md:py-4 lg:py-6">
        {step === 1 ? (
          <InstantReplacementForm 
            urgencyMode="instant" // 👈 Always "instant"
            onNext={() => goToStep(2)} 
          />
        ) : (
          <GenerateAIForm onBack={() => goToStep(1)} />
        )}
      </div>
    </AppLayout>
  );
}

export default function InstantReplacementPage() {
  return (
    <Suspense fallback={
      <AppLayout>
        <div className="py-2 md:py-4 lg:py-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </AppLayout>
    }>
      <InstantReplacementContent />
    </Suspense>
  );
}
