// app/jobs/create/components/job-interview-settings.tsx
"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { JobFormData } from "@/Interface/job.types";

interface JobInterviewSettingsProps {
  formData: JobFormData;
  updateFormData: (updates: Partial<JobFormData>) => void;
}

export function JobInterviewSettings({
  formData,
  updateFormData,
}: JobInterviewSettingsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
      {/* Turn on AI interview */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-700">
          Turn on AI interview <span className="text-red-500">*</span>
        </Label>
        <RadioGroup
          value={formData.aiInterview || "Yes"}
          onValueChange={(value) => updateFormData({ aiInterview: value })}
          className="flex gap-4 pt-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="Yes"
              id="ai-yes"
              className="border-[#F4781B] text-white data-[state=checked]:bg-[#F4781B] data-[state=checked]:border-[#F4781B]"
            />
            <Label htmlFor="ai-yes" className="font-normal cursor-pointer text-gray-700 text-sm">
              Yes
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="No"
              id="ai-no"
              className="border-[#F4781B] text-white data-[state=checked]:bg-[#F4781B] data-[state=checked]:border-[#F4781B]"
            />
            <Label htmlFor="ai-no" className="font-normal cursor-pointer text-gray-700 text-sm">
              No
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Empty spacer */}
      <div className="hidden sm:block"></div>
    </div>
  );
}
