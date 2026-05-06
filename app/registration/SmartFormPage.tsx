"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, ChevronLeft } from "lucide-react";
import { useForm, FormProvider } from "react-hook-form";
import { Button } from "@/components/ui/button";
import Sidebar from "./components/sidebar";
import { steps, allDefaultValues, schemas } from "./const";
import { StepNavigation } from "./components";
import {
  OrganizationDetailsStep,
  ContactInformationStep,
  ComplianceVerificationStep,
} from "./form";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "react-toastify";
import { ZodIssue } from "zod";
import type { OrgDetailsType, ContactType, ComplianceType } from "./const";
import { Suspense } from "react";
import LoginModal from "@/components/global/otpModal";

type FormValues = (typeof allDefaultValues)[number];

// ─────────────────────────────────────────────────────────────────────────────

function SmartFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const step = Math.min(
    Math.max(Number(searchParams.get("step") ?? 0), 0),
    steps.length - 1
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingStepSubmission, setPendingStepSubmission] = useState<0 | 1 | 2 | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const registerStep   = useAuthStore((s) => s.registerStep);
  const recruiterProfile = useAuthStore((s) => s.recruiterProfile);

  const allStepData = useRef<Record<number, Partial<FormValues>>>({});

  const methods = useForm<FormValues>({
    defaultValues: allDefaultValues[0],
    mode: "onChange",
  });

  const goToStep = useCallback(
    (newStep: number) => router.push(`?step=${newStep}`, { scroll: false }),
    [router]
  );

  const restoreStep = useCallback(
    (stepIndex: number) => {
      const data = allStepData.current[stepIndex] ?? allDefaultValues[stepIndex];
      Object.entries(data).forEach(([key, value]) => {
        methods.setValue(key as keyof FormValues, value as FormValues[keyof FormValues], {
          shouldDirty: false,
        });
      });
    },
    [methods]
  );

  const saveAndGoToStep = useCallback(
    (newStep: number) => {
      allStepData.current[step] = methods.getValues();
      restoreStep(newStep);
      goToStep(newStep);
    },
    [step, methods, restoreStep, goToStep]
  );

  const validateCurrentStep = async (): Promise<boolean> => {
    const values = methods.getValues();
    const result = schemas[step].safeParse(values);

    if (!result.success) {
      result.error.issues.forEach((err: ZodIssue) => {
        const field = err.path[0] as string;
        if (field) {
          methods.setError(field as keyof FormValues, {
            type: "manual",
            message: err.message,
          });
        }
      });
      return false;
    }

    methods.clearErrors();
    return true;
  };

  const submitAndProceedCurrentStep = async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) return;
    allStepData.current[step] = methods.getValues();
    const currentStep = step as 0 | 1 | 2;

    if (!recruiterProfile) {
      setPendingStepSubmission(currentStep);
      setShowLoginModal(true);
      return;
    }

    const result = await submitCurrentStep(currentStep);
    if (!result.ok) {
      goToStep(currentStep);
      return;
    }

    if (currentStep < steps.length - 1) {
      saveAndGoToStep(currentStep + 1);
      return;
    }

    toast.success("Profile registered successfully!");
    router.push("/");
  };

  const goToPrevStep = () => {
    if (step <= 0) return;
    saveAndGoToStep(step - 1);
  };

  const handleSidebarStepChange = async (newStep: number) => {
    if (newStep < step) {
      saveAndGoToStep(newStep);
      return;
    }

    const allPreviousCompleted = Array.from({ length: newStep }, (_, i) => i).every((i) =>
      completedSteps.has(i)
    );

    if (!allPreviousCompleted) {
      toast.warning("Please complete the current step before proceeding.");
      return;
    }

    saveAndGoToStep(newStep);
  };

  const buildStepPayload = (stepIndex: 0 | 1 | 2): FormData => {
    if (stepIndex === 0) {
      const s0 = allStepData.current[0] as OrgDetailsType;
      const step1 = new FormData();
      step1.append("organization_name", s0.orgName ?? "");
      step1.append("registered_business_name", s0.registeredBusinessName ?? "");
      step1.append("organization_type", s0.orgType ?? "");
      step1.append("official_email_address", s0.email ?? "");
      step1.append("contact_number", s0.contactNumber ?? "");
      step1.append("canadian_business_number", s0.businessNumber ?? "");
      step1.append("gst_no", s0.gstNo ?? "");
      step1.append("street_address", s0.address ?? "");
      step1.append("postal_code", s0.postalCode ?? "");
      step1.append("province", s0.province ?? "");
      step1.append("city", s0.city ?? "");
      step1.append("country", s0.country ?? "");
      if (s0?.website) step1.append("organization_website", s0.website);
      if (s0?.organization_photo instanceof File) {
        step1.append("organization_photo", s0.organization_photo);
      }
      return step1;
    }

    if (stepIndex === 1) {
      const s1 = allStepData.current[1] as ContactType;
      const step2 = new FormData();
      step2.append("contact_person_name", s1.contactName ?? "");
      step2.append("contact_person_designation", s1.designation ?? "");
      step2.append("contact_person_email", s1.contactEmail ?? "");
      step2.append("contact_person_phone", s1.primaryContact ?? "");
      return step2;
    }

    const s2 = allStepData.current[2] as ComplianceType;
    const step3 = new FormData();
    if (s2?.business_registration_certificate instanceof File) {
      step3.append("business_registration_certificate", s2.business_registration_certificate);
    }
    if (s2?.operating_license instanceof File) {
      step3.append("operating_license", s2.operating_license);
    }
    if (s2?.certificate instanceof File) {
      step3.append("certificate", s2.certificate);
    }
    return step3;
  };

  const submitCurrentStep = async (
    stepIndex: 0 | 1 | 2
  ): Promise<{ ok: boolean }> => {
    setIsSubmitting(true);
    try {
      const payload = buildStepPayload(stepIndex);

      if (stepIndex === 2 && !payload.has("business_registration_certificate")) {
        toast.error("Business Registration Certificate is required.");
        return { ok: false };
      }

      const apiStep = (stepIndex + 1) as 1 | 2 | 3;
      const response = await registerStep(payload, apiStep);
      if (!response.ok) {
        toast.error(response.message || `Step ${apiStep} failed`);
        return { ok: false };
      }

      setCompletedSteps((prev) => new Set(prev).add(stepIndex));
      return { ok: true };
    } catch {
      toast.error("Failed to submit form");
      return { ok: false };
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await submitAndProceedCurrentStep();
  };

  const renderStepContent = () => {
    switch (step) {
      case 0: return <OrganizationDetailsStep />;
      case 1: return <ContactInformationStep />;
      case 2: return <ComplianceVerificationStep />;
      default: return null;
    }
  };

  return (
    <>
      <LoginModal
        isOpen={showLoginModal}
        forceOpen={true}
        onClose={() => setShowLoginModal(false)}
        onSuccess={async () => {
          setShowLoginModal(false);
          const stepToSubmit = pendingStepSubmission ?? (step as 0 | 1 | 2);
          setPendingStepSubmission(null);

          const result = await submitCurrentStep(stepToSubmit);
          if (!result.ok) {
            goToStep(stepToSubmit);
            return;
          }

          if (stepToSubmit < steps.length - 1) {
            saveAndGoToStep(stepToSubmit + 1);
            return;
          }

          toast.success("Profile registered successfully!");
          router.push("/");
        }}
      />

      <div className="fixed inset-0 flex flex-col lg:flex-row bg-[#F8FAFC]">
        <Sidebar
          step={step}
          completedSteps={completedSteps}
          onStepChange={handleSidebarStepChange}
        />

        <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Only scroll container */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pb-6 bg-[#F8FAFC] lg:bg-white">
            <div className="bg-white">
              <div className="hidden lg:block px-0 sm:px-0 lg:px-8 pt-4 sm:pt-6 pb-4 flex-shrink-0">
                <StepNavigation
                  currentStep={step}
                  totalSteps={steps.length}
                  onPrev={goToPrevStep}
                  onNext={submitAndProceedCurrentStep}
                />
              </div>

              <FormProvider {...methods}>
                <form
                  className="bg-white p-4 sm:p-6 lg:p-8 rounded-xl border border-gray-200"
                  onSubmit={onSubmit}
                  encType="multipart/form-data"
                  noValidate
                >
                  {step > 0 && (
                    <div className="lg:hidden mb-4">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={goToPrevStep}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 p-0 h-auto hover:bg-transparent"
                        disabled={isSubmitting}
                      >
                        <ChevronLeft className="w-5 h-5" />
                        <span className="text-sm font-medium">Back</span>
                      </Button>
                    </div>
                  )}

                  <h2 className="font-bold text-lg sm:text-xl mb-4 sm:mb-6">
                    {steps[step]}
                  </h2>

                  {renderStepContent()}

                  <div className="flex mt-6 sm:mt-8 justify-end">
                    <Button
                      type="submit"
                      className="bg-[#F4781B] hover:bg-[#d5650e] text-white px-4 sm:px-6 py-2 rounded-lg w-full sm:w-auto disabled:opacity-50"
                      disabled={isSubmitting}
                    >
                      {isSubmitting
                        ? "Uploading..."
                        : step === steps.length - 1
                          ? "Submit"
                          : "Save & continue"}
                    </Button>
                  </div>
                </form>
              </FormProvider>
            </div>
          </div>

          {/* Footer — pinned, never scrolls */}
          <div className="lg:hidden w-full py-3 px-4 flex items-center justify-center gap-2 text-gray-500 text-xs bg-[#F8FAFC] flex-shrink-0">
            <Mail className="w-4 h-4" />
            <a href="mailto:help@KeRaeva.com" className="truncate">
              help@KeRaeva.com
            </a>
          </div>
        </main>
      </div>
    </>
  );
}

export default function SmartFormPage() {
  return (
    <Suspense fallback={null}>
      <SmartFormInner />
    </Suspense>
  );
}