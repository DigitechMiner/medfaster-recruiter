"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CreateJobStepCardProps {
  title?: ReactNode;
  children: ReactNode;
  footer: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function CreateJobStepCard({
  title,
  children,
  footer,
  className,
  contentClassName,
}: CreateJobStepCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden",
        className,
      )}
    >
      <div className={cn("p-4 sm:p-6 lg:p-8", contentClassName)}>
        {title && (
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-6 sm:mb-8">
            {title}
          </h2>
        )}
        {children}
      </div>

      <div className="border-t border-gray-100 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {footer}
      </div>
    </div>
  );
}

interface CreateJobStepActionsProps {
  nextLabel: ReactNode;
  backLabel?: ReactNode;
  onBack?: () => void;
  nextType?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
  nextForm?: string;
  onNext?: () => void;
  nextDisabled?: boolean;
  nextLoading?: boolean;
  loadingLabel?: ReactNode;
  showBack?: boolean;
  className?: string;
}

export function CreateJobStepActions({
  nextLabel,
  backLabel = "Back",
  onBack,
  nextType = "button",
  nextForm,
  onNext,
  nextDisabled,
  nextLoading,
  loadingLabel = "Processing...",
  showBack = true,
  className,
}: CreateJobStepActionsProps) {
  const canShowBack = showBack && Boolean(onBack);

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3",
        canShowBack ? "justify-between" : "justify-end",
        className,
      )}
    >
      {canShowBack && (
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          disabled={nextLoading}
          className="w-full sm:w-auto px-4 sm:px-6 h-10 text-sm order-2 sm:order-1 border-gray-300 text-gray-600 hover:bg-gray-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {backLabel}
        </Button>
      )}

      <Button
        type={nextType}
        form={nextForm}
        onClick={onNext}
        disabled={nextDisabled || nextLoading}
        className="w-full sm:w-auto bg-[#F4781B] hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white px-4 sm:px-6 h-10 shadow-sm text-sm order-1 sm:order-2 !rounded-md"
      >
        {nextLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            {loadingLabel}
          </span>
        ) : (
          <span className="flex items-center gap-2">
            {nextLabel}
            <ArrowRight className="w-4 h-4" />
          </span>
        )}
      </Button>
    </div>
  );
}
