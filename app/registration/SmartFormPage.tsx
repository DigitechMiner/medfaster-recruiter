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
// Province camelCase map (API requires camelCase, UI stores snake_case or abbrev)
// ─────────────────────────────────────────────────────────────────────────────
const PROVINCE_MAP: Record<string, string> = {
  alberta:                    "alberta",
  AB:                         "alberta",
  britishcolumbia:            "britishColumbia",
  british_columbia:           "britishColumbia",
  BC:                         "britishColumbia",
  manitoba:                   "manitoba",
  MB:                         "manitoba",
  newbrunswick:               "newBrunswick",
  new_brunswick:              "newBrunswick",
  NB:                         "newBrunswick",
  newfoundlandandlabrador:    "newfoundlandAndLabrador",
  newfoundland_and_labrador:  "newfoundlandAndLabrador",
  NL:                         "newfoundlandAndLabrador",
  novascotia:                 "novaScotia",
  nova_scotia:                "novaScotia",
  NS:                         "novaScotia",
  northwestterritories:       "northwestTerritories",
  northwest_territories:      "northwestTerritories",
  NT:                         "northwestTerritories",
  nunavut:                    "nunavut",
  NU:                         "nunavut",
  ontario:                    "ontario",
  ON:                         "ontario",
  princeedwardisland:         "princeEdwardIsland",
  prince_edward_island:       "princeEdwardIsland",
  PE:                         "princeEdwardIsland",
  quebec:                     "quebec",
  QC:                         "quebec",
  saskatchewan:               "saskatchewan",
  SK:                         "saskatchewan",
  yukon:                      "yukon",
  YT:                         "yukon",
};

function toApiProvince(value: string): string {
  if (!value) return value;
  return (
    PROVINCE_MAP[value] ??
    PROVINCE_MAP[value.toLowerCase().replace(/\s/g, "")] ??
    value
  );
}

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
    setCompletedSteps((prev) => new Set(prev).add(step));
    return true;
  };

  const goToNextStep = async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) return;
    if (step < steps.length - 1) saveAndGoToStep(step + 1);
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

  // ── Core submission ────────────────────────────────────────────────────────
  const submitForm = async () => {
    setIsSubmitting(true);
    try {
      const s0 = allStepData.current[0] as OrgDetailsType;
      const s1 = allStepData.current[1] as ContactType;
      const s2 = allStepData.current[2] as ComplianceType;

      // ── STEP 1: org & address + optional photo ──────────────────────────
      const step1 = new FormData();

      // Required text fields
      step1.append("organization_name",           s0.orgName ?? "");
      step1.append("registered_business_name",    s0.registeredBusinessName ?? "");
      step1.append("organization_type",           s0.orgType ?? "");
      step1.append("official_email_address",      s0.email ?? "");
      step1.append("contact_number",              s0.contactNumber ?? "");
      step1.append("canadian_business_number",    s0.businessNumber ?? "");
      step1.append("gst_no",                      s0.gstNo ?? "");
      step1.append("street_address",              s0.address ?? "");
      step1.append("postal_code",                 s0.postalCode ?? "");
      step1.append("province",                    toApiProvince(s0.province ?? ""));
      step1.append("city",                        s0.city ?? "");
      step1.append("country",                     s0.country ?? "");

      // Optional text fields
      if (s0?.website) step1.append("organization_website", s0.website);

      // Optional file — ONLY organization_photo allowed at step 1
      if (s0?.organization_photo instanceof File)
        step1.append("organization_photo", s0.organization_photo);

      const r1 = await registerStep(step1, 1);
      if (!r1.ok) {
        toast.error(r1.message || "Step 1 failed");
        goToStep(0); // send user back to fix errors
        return;
      }

      // ── STEP 2: contact person — NO files allowed ───────────────────────
      const step2 = new FormData();

      step2.append("contact_person_name",        s1.contactName ?? "");
      step2.append("contact_person_designation", s1.designation ?? "");
      step2.append("contact_person_email",       s1.contactEmail ?? "");
      step2.append("contact_person_phone",       s1.primaryContact ?? "");

      const r2 = await registerStep(step2, 2);
      if (!r2.ok) {
        toast.error(r2.message || "Step 2 failed");
        goToStep(1);
        return;
      }

      // ── STEP 3: documents ONLY — no text fields allowed ─────────────────
      // Required: business_registration_certificate
      // Optional: operating_license, certificate
      const step3 = new FormData();

      if (s2?.business_registration_certificate instanceof File)
        step3.append("business_registration_certificate", s2.business_registration_certificate);
      if (s2?.operating_license instanceof File)
        step3.append("operating_license", s2.operating_license);
      if (s2?.certificate instanceof File)
        step3.append("certificate", s2.certificate);

      // Guard: business_registration_certificate is required at step 3
      if (!step3.has("business_registration_certificate")) {
        toast.error("Business Registration Certificate is required.");
        goToStep(2);
        return;
      }

      const r3 = await registerStep(step3, 3);
      if (!r3.ok) {
        toast.error(r3.message || "Step 3 failed");
        goToStep(2);
        return;
      }

      // ── All 3 steps done ────────────────────────────────────────────────
      toast.success("Profile registered successfully!");
      router.push("/");
    } catch (error: unknown) {
      console.error("Submission error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to submit form"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const isValid = await validateCurrentStep();
    if (!isValid) return;

    // Save current step data before submitting
    allStepData.current[step] = methods.getValues();

    // If not logged in, show OTP modal first, then submit after auth
    if (!recruiterProfile) {
      setShowLoginModal(true);
      return;
    }

    await submitForm();
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
          await submitForm();
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
                  onNext={goToNextStep}
                />
              </div>

              <FormProvider {...methods}>
                <form
                  className="bg-white p-4 sm:p-6 lg:p-8 rounded-xl border border-gray-200"
                  onSubmit={
                    step < steps.length - 1
                      ? (e) => { e.preventDefault(); goToNextStep(); }
                      : onSubmit
                  }
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