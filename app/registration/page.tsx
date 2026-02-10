// app/profile-setup/page.tsx (or wherever your form lives)
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Mail, ChevronLeft } from "lucide-react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
type FormValues = typeof allDefaultValues[number];

export default function SmartFormPage() {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const updateProfile = useAuthStore((state) => state.updateProfile);

  const methods = useForm<FormValues>({
    resolver: zodResolver(schemas[step]),
    defaultValues: allDefaultValues[step],
    mode: "onChange",
  });

  const resetForm = useCallback(() => {
    methods.reset(allDefaultValues[step]);
  }, [step, methods]);

  useEffect(() => {
    resetForm();
  }, [resetForm]);

  const goToNextStep = async () => {
    const isValid = await methods.trigger();
    if (isValid && step < steps.length - 1) {
      setStep(step + 1);
    }
  };

  const goToPrevStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const isValid = await methods.trigger();
    if (!isValid) return;

    setIsSubmitting(true);

    try {
      // Get all form data from all steps
      const formValues = methods.getValues();
      console.log("Form Values:", formValues);

      // Build FormData for API submission
      const formData = new FormData(e.currentTarget);

      // Log FormData contents for debugging
      console.log("FormData contents:");
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(key, "=>", value.name, value.size, "bytes");
        } else {
          console.log(key, "=>", value);
        }
      }

      // Submit to backend with file uploads
      const result = await updateProfile(formData);

      if (result.ok) {
        toast.success("Profile updated successfully!");
        console.log("Uploaded files:", {
          profile_photo: result.data.profile.organization_photo_url,
          documents: result.data.documents,
        });
        
        // Redirect to jobs page
        router.push("/jobs");
      } else {
        toast.error(result.message || "Failed to update profile");
        
        // Show validation errors if any
        if (result.errors && result.errors.length > 0) {
          result.errors.forEach((error) => {
            toast.error(`${error.field}: ${error.message}`);
          });
        }
      }
    }catch (error: unknown) {
  console.error("Submission error:", error);
  const errorMessage = error instanceof Error 
    ? error.message 
    : "Failed to submit form";
  toast.error(errorMessage);
} finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return <OrganizationDetailsStep />;
      case 1:
        return <ContactInformationStep />;
      case 2:
        return <ComplianceVerificationStep />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#F8FAFC]">
      <Sidebar step={step} onStepChange={setStep} />
      <main className="flex-1 flex flex-col lg:h-screen lg:overflow-hidden">
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pb-0 md:pb-6 bg-[#F8FAFC] lg:bg-white">
          <div className="bg-white">
            {/* step navigation */}
            <div className="hidden lg:block px-0 sm:px-0 lg:px-8 pt-4 sm:pt-6 pb-4 flex-shrink-0">
              <StepNavigation
                currentStep={step}
                totalSteps={steps.length}
                onPrev={goToPrevStep}
                onNext={goToNextStep}
              />
            </div>

            {/* forms */}
            <FormProvider {...methods}>
              <form
                className="bg-white p-4 sm:p-6 lg:p-8 rounded-xl border border-gray-200"
                onSubmit={step < steps.length - 1 ? (e) => { e.preventDefault(); goToNextStep(); } : onSubmit}
                encType="multipart/form-data"
                noValidate
              >
                {/* Mobile/Tablet Back Button */}
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
      {/* Mobile/Tablet footer email display*/}
      <div className="lg:hidden w-full py-3 px-4 flex items-center justify-center gap-2 text-gray-500 text-xs bg-[#F8FAFC]">
        <Mail className="w-4 h-4" />
        <a href="mailto:help@medfaster.com" className="truncate">help@medfaster.com</a>
      </div>
    </div>
  );
}
