"use client";

import { useState } from "react";
import { ArrowLeft, Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  onResetForm?: () => void;
  resetLabel?: string;
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
  onResetForm,
  resetLabel = "Start over",
}: CreateJobProgressHeaderProps) {
  const clampedStep = Math.min(Math.max(currentStep, 1), steps.length);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const handleConfirmReset = () => {
    setResetDialogOpen(false);
    onResetForm?.();
  };

  return (
    <div className="space-y-4">
      {(showBackButton || onResetForm) && (
        <div className="flex items-center justify-between gap-3">
          {showBackButton ? (
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
          ) : (
            <span />
          )}

          {onResetForm && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setResetDialogOpen(true)}
              className="inline-flex h-auto items-center gap-2 px-0 py-0 text-sm font-semibold text-gray-700 hover:text-gray-900"
            >
              {resetLabel}
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm">
                <RotateCcw className="h-4 w-4" />
              </span>
            </Button>
          )}
        </div>
      )}

      {onResetForm && (
        <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Start over?</DialogTitle>
              <DialogDescription>
                This clears the job form and returns you to the first step.
                Details you have entered so far will not be saved.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <button
                type="button"
                onClick={() => setResetDialogOpen(false)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="rounded-lg bg-[#F4781B] px-3 py-2 text-sm font-semibold text-white hover:bg-orange-600"
              >
                Start over
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
        <div className="mb-5 flex flex-col gap-1">
          <h1 className="text-lg font-bold text-gray-900 sm:text-xl">
            {title || "Create Job Post"}
          </h1>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center">
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
                    "flex min-w-0 flex-1 items-center",
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
                        "flex h-8 w-8 items-center justify-center rounded-md border text-xs font-bold transition-colors sm:h-9 sm:w-9",
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
                      {isComplete ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        stepNumber
                      )}
                    </button>
                    <button
                      type="button"
                      disabled={isStepDisabled}
                      onClick={() => onStepClick?.(stepNumber)}
                      className={cn(
                        "hidden max-w-32 text-center text-xs font-medium transition-colors sm:block",
                        isCurrent || isComplete
                          ? "text-gray-900"
                          : "text-gray-400",
                        !isStepDisabled &&
                          "cursor-pointer hover:text-[#F4781B]",
                        isStepDisabled && "cursor-default",
                      )}
                    >
                      <span className="block">
                        Step {stepNumber}
                      </span>
                      <span className="block">{label}</span>
                    </button>
                  </div>

                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "mx-2 h-[2px] min-w-[32px] flex-1 rounded-full sm:mx-3",
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
    </div>
  );
}