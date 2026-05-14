"use client";

import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CreateJobProgressHeaderProps {
  title: string;
  steps: readonly string[];
  currentStep: number;
  onBack: () => void;
  onStepClick?: (step: number) => void;
  canNavigateToStep?: (step: number) => boolean;
  backLabel?: string;
  showBackButton?: boolean;
}

export function CreateJobProgressHeader({
  title,
  steps,
  currentStep,
  onBack,
  onStepClick,
  canNavigateToStep,
  backLabel = "Back",
  showBackButton = true,
}: CreateJobProgressHeaderProps) {
  const clampedStep = Math.min(Math.max(currentStep, 1), steps.length);

  return (
    <div className="space-y-4">
      {showBackButton && (
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          className="inline-flex h-auto items-center gap-2 px-0 py-0 text-sm font-semibold text-gray-700 hover:text-gray-900"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm">
            <ArrowLeft className="h-4 w-4" />
          </span>
          {backLabel}
        </Button>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex flex-col gap-1 sm:mb-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#F4781B]">
            Step {clampedStep} of {steps.length}
          </p>
          <h1 className="text-lg font-bold text-gray-900 sm:text-xl">{title}</h1>
        </div>

        <div className="flex items-start">
          {steps.map((label, index) => {
            const stepNumber = index + 1;
            const isComplete = stepNumber < clampedStep;
            const isCurrent = stepNumber === clampedStep;
            const isStepDisabled =
              !onStepClick || canNavigateToStep?.(stepNumber) === false;

            return (
              <div
                key={label}
                className={cn(
                  "flex min-w-0 flex-1 items-start",
                  index === steps.length - 1 && "flex-none",
                )}
              >
                <div className="flex min-w-0 flex-col items-center gap-2">
                  <button
                    type="button"
                    aria-current={isCurrent ? "step" : undefined}
                    disabled={isStepDisabled}
                    onClick={() => onStepClick?.(stepNumber)}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold transition-colors",
                      isComplete &&
                        "border-[#F4781B] bg-[#F4781B] text-white",
                      isCurrent &&
                        "border-[#F4781B] bg-orange-50 text-[#F4781B]",
                      !isComplete &&
                        !isCurrent &&
                        "border-gray-200 bg-gray-50 text-gray-400",
                      !isStepDisabled &&
                        "cursor-pointer hover:border-[#F4781B] hover:text-[#F4781B]",
                      isStepDisabled && "cursor-default",
                    )}
                  >
                    {isComplete ? <Check className="h-4 w-4" /> : stepNumber}
                  </button>
                  <button
                    type="button"
                    disabled={isStepDisabled}
                    onClick={() => onStepClick?.(stepNumber)}
                    className={cn(
                      "hidden max-w-28 text-center text-xs font-medium transition-colors sm:block",
                      isCurrent || isComplete
                        ? "text-gray-900"
                        : "text-gray-400",
                      !isStepDisabled && "cursor-pointer hover:text-[#F4781B]",
                      isStepDisabled && "cursor-default",
                    )}
                  >
                    {label}
                  </button>
                </div>

                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "mx-2 mt-4 h-0.5 min-w-6 flex-1 rounded-full sm:mx-3",
                      isComplete ? "bg-[#F4781B]" : "bg-gray-200",
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
