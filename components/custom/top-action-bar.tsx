import React from "react";
import { Button } from "@/components/ui/button";

interface TopActionBarProps {
  title: string;
  onPreview?: () => void;
  onPrimary: () => void;
  primaryLabel?: string;
}

export function TopActionBar({
  title,
  onPreview,
  onPrimary,
  primaryLabel = "Save & continue",
}: TopActionBarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0">
      <h1 className="text-lg sm:text-xl font-semibold text-gray-900 order-2 sm:order-1">
        {title}
      </h1>
      <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 order-1 sm:order-2">
        {onPreview && (
          <Button
            type="button"
            variant="ghost"
            onClick={onPreview}
            className="w-full sm:w-auto bg-white border-gray-300 border-2 hover:bg-gray-50 text-gray-700 px-4 sm:px-6 h-10 text-sm"
          >
            Preview
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          onClick={onPrimary}
          className="w-full sm:w-auto bg-[#F4781B] hover:bg-orange-600 text-white px-4 sm:px-6 h-10 shadow-sm text-sm"
        >
          {primaryLabel}
        </Button>
      </div>
    </div>
  );
}


