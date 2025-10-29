"use client";

import { useState, useEffect } from "react";
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

export default function SmartFormPage() {
  const [step, setStep] = useState(0);

  const methods = useForm({
    resolver: zodResolver(schemas[step]) as any,
    defaultValues: allDefaultValues[step] as any,
    mode: "onChange",
  });

  useEffect(() => {
    methods.reset(allDefaultValues[step] as any);
  }, [step]); // Removed methods from dependency to avoid infinite loops

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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = await methods.trigger();
    if (isValid) {
      const data = methods.getValues();
      console.log("Form Data:", data);
      alert(JSON.stringify(data, null, 2));
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
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#F8FAFC] ">
      <Sidebar step={step} onStepChange={setStep} />
      <main className="flex-1 flex flex-col lg:h-screen lg:overflow-hidden ">
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
                    className="bg-[#F4781B] hover:bg-[#d5650e] text-white px-4 sm:px-6 py-2 rounded-lg w-full sm:w-auto"
                  >
                    {step === steps.length - 1 ? "Submit" : "Save & continue"}
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
