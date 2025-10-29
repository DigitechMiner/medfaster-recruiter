"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface FormData {
  urgency: string;
  inPersonInterview: string;
  physicalInterview: string;
}

interface JobInterviewSettingsProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
}

export function JobInterviewSettings({
  formData,
  updateFormData,
}: JobInterviewSettingsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
      {/* Urgency */}
      <div className="space-y-2 sm:space-y-3">
        <Label className="text-sm font-medium text-gray-700">
          Urgency <span className="text-red-500">*</span>
        </Label>
        <RadioGroup
          value={formData.urgency}
          onValueChange={(value) => updateFormData({ urgency: value })}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="High"
              id="high"
              className="border-orange-500 text-white data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
            />
            <Label htmlFor="high" className="font-normal cursor-pointer text-gray-700 text-sm">
              High
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="Low"
              id="low"
              className="border-orange-500 text-white data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
            />
            <Label htmlFor="low" className="font-normal cursor-pointer text-gray-700 text-sm">
              Low
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="Medium"
              id="medium"
              className="border-orange-500 text-white data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
            />
            <Label htmlFor="medium" className="font-normal cursor-pointer text-gray-700 text-sm">
              Medium
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* In Person Interview */}
      <div className="space-y-2 sm:space-y-3">
        <Label className="text-sm font-medium text-gray-700">
          In Person Interview <span className="text-red-500">*</span>
        </Label>
        <RadioGroup
          value={formData.inPersonInterview}
          onValueChange={(value) =>
            updateFormData({ inPersonInterview: value })
          }
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="Yes"
              id="in-person-yes"
              className="border-orange-500 text-white data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
            />
            <Label htmlFor="in-person-yes" className="font-normal cursor-pointer text-gray-700 text-sm">
              Yes
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="No"
              id="in-person-no"
              className="border-orange-500 text-white data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
            />
            <Label htmlFor="in-person-no" className="font-normal cursor-pointer text-gray-700 text-sm">
              No
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Physical Interview */}
      <div className="space-y-2 sm:space-y-3">
        <Label className="text-sm font-medium text-gray-700">
          Physical Interview <span className="text-red-500">*</span>
        </Label>
        <RadioGroup
          value={formData.physicalInterview}
          onValueChange={(value) =>
            updateFormData({ physicalInterview: value })
          }
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="Yes"
              id="physical-yes"
              className="border-orange-500 text-white data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
            />
            <Label htmlFor="physical-yes" className="font-normal cursor-pointer text-gray-700 text-sm">
              Yes
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="No"
              id="physical-no"
              className="border-orange-500 text-white data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
            />
            <Label htmlFor="physical-no" className="font-normal cursor-pointer text-gray-700 text-sm">
              No
            </Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}
