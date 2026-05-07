"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { ChevronLeft } from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import {
  allDefaultValues,
  ComplianceVerificationStep,
  ContactInformationStep,
  OrganizationDetailsStep,
  schemas,
  steps,
  type ComplianceType,
  type ContactType,
  type OrgDetailsType,
  type RegistrationFormValues,
  validateStepSchema,
} from "@/components/forms";
import { useAuthStore } from "@/stores/authStore";
import { RegistrationLayout, Sidebar, StepNavigation } from "./layout";

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const step = Math.min(
    Math.max(Number(searchParams.get("step") ?? 0), 0),
    steps.length - 1
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const registerStep = useAuthStore((s) => s.registerStep);
  const recruiterProfile = useAuthStore((s) => s.recruiterProfile);

  const allStepData = useRef<Record<number, Partial<RegistrationFormValues>>>({});
  const methods = useForm<RegistrationFormValues>({
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
        methods.setValue(
          key as keyof RegistrationFormValues,
          value as RegistrationFormValues[keyof RegistrationFormValues],
          { shouldDirty: false }
        );
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

  const validateCurrentStep = () =>
    validateStepSchema(methods, schemas[step], methods.getValues());

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
      if (s0.website) step1.append("organization_website", s0.website);
      if (s0.organization_photo instanceof File) {
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
    if (s2.business_registration_certificate instanceof File) {
      step3.append("business_registration_certificate", s2.business_registration_certificate);
    }
    if (s2.operating_license instanceof File) {
      step3.append("operating_license", s2.operating_license);
    }
    if (s2.certificate instanceof File) {
      step3.append("certificate", s2.certificate);
    }
    return step3;
  };

  const submitCurrentStep = async (stepIndex: 0 | 1 | 2): Promise<{ ok: boolean }> => {
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

  const submitAndProceedCurrentStep = async () => {
    if (!validateCurrentStep()) return;
    allStepData.current[step] = methods.getValues();
    const currentStep = step as 0 | 1 | 2;

    if (!recruiterProfile) {
      router.push("/auth");
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

  const handleSidebarStepChange = (newStep: number) => {
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

  return (
    <RegistrationLayout
      sidebar={
        <Sidebar
          step={step}
          completedSteps={completedSteps}
          onStepChange={handleSidebarStepChange}
        />
      }
    >
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
            onSubmit={(e) => {
              e.preventDefault();
              void submitAndProceedCurrentStep();
            }}
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

            <h2 className="font-bold text-lg sm:text-xl mb-4 sm:mb-6">{steps[step]}</h2>

            {step === 0 && <OrganizationDetailsStep />}
            {step === 1 && <ContactInformationStep />}
            {step === 2 && <ComplianceVerificationStep />}

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
    </RegistrationLayout>
  );
}

