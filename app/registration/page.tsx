"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
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
import type { OrgDetailsType, ContactType, ComplianceType } from "./const"


type FormValues = typeof allDefaultValues[number];


export default function SmartFormPage() {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const updateProfile = useAuthStore((state) => state.updateProfile);

  const allStepData = useRef<Record<number, Partial<FormValues>>>({});

  const methods = useForm<FormValues>({
    defaultValues: allDefaultValues[0],
    mode: "onChange",
  });

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

  const goToNextStep = async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) return;

    allStepData.current[step] = methods.getValues();

    if (step < steps.length - 1) {
      const nextStep = step + 1;
      const savedData = allStepData.current[nextStep];
      if (savedData) {
        methods.reset(savedData);
      } else {
        methods.reset(allDefaultValues[nextStep]);
      }
      setStep(nextStep);
    }
  };

  const goToPrevStep = () => {
    if (step <= 0) return;

    allStepData.current[step] = methods.getValues();

    const prevStep = step - 1;
    const savedData = allStepData.current[prevStep];
    if (savedData) {
      methods.reset(savedData);
    } else {
      methods.reset(allDefaultValues[prevStep]);
    }

    setStep(prevStep);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const isValid = await validateCurrentStep();
    if (!isValid) return;

    allStepData.current[step] = methods.getValues();
    setIsSubmitting(true);

    try {
      const s0 = allStepData.current[0] as OrgDetailsType;
      const s1 = allStepData.current[1] as ContactType;
      const s2 = allStepData.current[2] as ComplianceType;

      const formData = new FormData();

      // ── Step 0: Organization Details ──────────────────────────
      if (s0?.organization_photo instanceof File)
        formData.append("organization_photo", s0.organization_photo);
      if (s0?.orgName)        formData.append("organization_name", s0.orgName);
      if (s0?.orgType)        formData.append("organization_type", s0.orgType);
      if (s0?.email)          formData.append("official_email_address", s0.email);
      if (s0?.contactNumber) formData.append("contact_number", s0.contactNumber);
      if (s0?.website)        formData.append("organization_website", s0.website);
      if (s0?.businessNumber) formData.append("canadian_business_number", s0.businessNumber);
      if (s0?.address)        formData.append("street_address", s0.address);
      if (s0?.postalCode)     formData.append("postal_code", s0.postalCode);
      if (s0?.city)           formData.append("city", s0.city);
      if (s0?.province)       formData.append("province", s0.province);
      if (s0?.country)        formData.append("country", s0.country);

      // ── Step 1: Contact Information ───────────────────────────
      if (s1?.contactName)  formData.append("contact_person_name", s1.contactName);
      if (s1?.designation)  formData.append("contact_person_designation", s1.designation);
      if (s1?.contactEmail) formData.append("contact_person_email", s1.contactEmail);
      
      if (s1?.primaryContact) {
  formData.append("primary_contact_person", s1.primaryContact);
  formData.append("contact_person_phone", s1.primaryContact);   
}

      // ── Step 2: Compliance Documents ──────────────────────────
      if (s2?.operatingLicense instanceof File)
        formData.append("operating_license", s2.operatingLicense);
      if (s2?.accreditationCertificate instanceof File)
        formData.append("accreditation_certificate", s2.accreditationCertificate);
      if (s2?.provincialLicense instanceof File)
        formData.append("provincial_health_license", s2.provincialLicense);
      if (s2?.canadaCertificate instanceof File)
        formData.append("accreditation_canada_certificate", s2.canadaCertificate);

      // Debug log
      console.log("📤 Submitting FormData:");
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(key, "=>", value.name, value.size, "bytes");
        } else {
          console.log(key, "=>", value);
        }
      }

      const result = await updateProfile(formData);

      if (result.ok) {
        toast.success("Profile updated successfully!");
        router.push("/");
      } else {
        toast.error(result.message || "Failed to update profile");
        if (result.errors && result.errors.length > 0) {
          result.errors.forEach((error: { field: string; message: string }) => {
            toast.error(`${error.field}: ${error.message}`);
          });
        }
      }
    } catch (error: unknown) {
      console.error("Submission error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to submit form");
    } finally {
      setIsSubmitting(false);
    }
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
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#F8FAFC]">
      <Sidebar step={step} onStepChange={setStep} />
      <main className="flex-1 flex flex-col lg:h-screen lg:overflow-hidden">
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pb-0 md:pb-6 bg-[#F8FAFC] lg:bg-white">
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

                <h2 className="font-bold text-lg sm:text-xl mb-4 sm:mb-6">{steps[step]}</h2>
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
      </main>

      <div className="lg:hidden w-full py-3 px-4 flex items-center justify-center gap-2 text-gray-500 text-xs bg-[#F8FAFC]">
        <Mail className="w-4 h-4" />
        <a href="mailto:help@KeRaeva.com" className="truncate">help@KeRaeva.com</a>
      </div>
    </div>
  );
}