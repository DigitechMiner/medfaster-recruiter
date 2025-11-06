"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrev: () => void;
  onNext: () => void;
}

export default function StepNavigation({
  currentStep,
  totalSteps,
  onPrev,
  onNext,
}: StepNavigationProps) {
  return (
    <div className="flex justify-end gap-5 mb-4 sm:mb-6">
      <Button
        type="button"
        variant="ghost"
        className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={onPrev}
        disabled={currentStep === 0}
      >
        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={1.5} />
      </Button>
      <Button
        type="button"
        variant="ghost"
        className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={onNext}
        disabled={currentStep === totalSteps - 1}
      >
        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={1.5} />
      </Button>
    </div>
  );
}

