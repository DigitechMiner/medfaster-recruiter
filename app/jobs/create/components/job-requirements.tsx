"use client";

import { useState } from "react";
import { X, Search } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import metadata from "@/utils/constant/metadata";
import type { JobFormData } from "@/Interface/job.types"; // ADD THIS IMPORT

const PAY_RANGE_MIN = metadata.pay_range.min;
const PAY_RANGE_MAX = metadata.pay_range.max;
const PAY_RANGE_STEP = metadata.pay_range.step;
const EXPERIENCE_MIN = 0;
const EXPERIENCE_MAX = 20;

interface JobRequirementsProps {
  formData: JobFormData; // CHANGE from FormData to JobFormData
  updateFormData: (updates: Partial<JobFormData>) => void; // CHANGE from FormData to JobFormData
}

export function JobRequirements({
  formData,
  updateFormData,
}: JobRequirementsProps) {
  const [qualificationInput, setQualificationInput] = useState("");
  const [specializationInput, setSpecializationInput] = useState("");

  // Parse experience value for slider
  const experienceValue = formData.experience
    ? parseInt(formData.experience.split("-")[0]) || 4
    : 4;

  const addTag = (field: "qualification" | "specialization", value: string) => {
    if (value.trim() && !formData[field].includes(value.trim())) {
      console.log(`➕ Adding ${field}:`, value.trim());
      console.log(`📋 Current ${field}:`, formData[field]);
      
      updateFormData({
        [field]: [...formData[field], value.trim()],
      });
      
      console.log(`✅ Updated ${field}:`, [...formData[field], value.trim()]);
    }
  };

  const removeTag = (
    field: "qualification" | "specialization",
    tagToRemove: string
  ) => {
    console.log(`➖ Removing ${field}:`, tagToRemove);
    
    updateFormData({
      [field]: formData[field].filter((tag) => tag !== tagToRemove),
    });
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    field: "qualification" | "specialization",
    inputValue: string,
    setInputValue: (value: string) => void
  ) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      addTag(field, inputValue);
      setInputValue("");
    }
  };

  // Add debug info
  console.log('🔍 JobRequirements render:', {
    qualifications: formData.qualification,
    qualificationsLength: formData.qualification?.length,
    specializations: formData.specialization,
    specializationsLength: formData.specialization?.length,
  });

  return (
    <div className="space-y-6 mb-6">
      {/* Pay Range & Years of Experience */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pay Range */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">Pay Range</Label>
          <div className="space-y-4 pt-2">
            <div className="flex justify-between text-sm text-gray-600 font-medium">
              <span>$ {formData.payRange[0].toLocaleString()}</span>
              <span>$ {formData.payRange[1].toLocaleString()}</span>
            </div>
            <Slider
              min={PAY_RANGE_MIN}
              max={PAY_RANGE_MAX}
              step={PAY_RANGE_STEP}
              value={formData.payRange}
              onValueChange={(value) =>
                updateFormData({ payRange: value as [number, number] })
              }
              className="w-full"
            />
          </div>
        </div>

        {/* Years of Experience */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">
            Years of Experience <span className="text-red-500">*</span>
          </Label>
          <div className="space-y-4 pt-2">
            <div className="flex justify-between text-sm text-gray-600 font-medium">
              <span>{experienceValue} Years</span>
              <span>10 Years</span>
            </div>
            <Slider
              min={EXPERIENCE_MIN}
              max={EXPERIENCE_MAX}
              step={1}
              value={[experienceValue]}
              onValueChange={(value) =>
                updateFormData({ experience: `${value[0]}-${10}` })
              }
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Additional Qualification & Specialization */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Additional Qualification */}
        <div className="space-y-3">
          <Label htmlFor="qualification" className="text-sm font-medium text-gray-700">
            Additional Qualification <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="qualification"
              type="text"
              value={qualificationInput}
              onChange={(e) => setQualificationInput(e.target.value)}
              onKeyDown={(e) =>
                handleKeyDown(
                  e,
                  "qualification",
                  qualificationInput,
                  setQualificationInput
                )
              }
              placeholder="Type and press Enter to add"
              className="pl-10 h-11 border-[#F4781B] focus:ring-[#F4781B]"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.qualification && formData.qualification.length > 0 ? (
              formData.qualification.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1.5 text-sm rounded-md"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag("qualification", tag)}
                    className="ml-2 hover:text-gray-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))
            ) : (
              <p className="text-xs text-gray-500">No qualifications added yet. Press Enter to add.</p>
            )}
          </div>
        </div>

        {/* Specialization */}
        <div className="space-y-3">
          <Label htmlFor="specialization" className="text-sm font-medium text-gray-700">
            Specialization <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="specialization"
              type="text"
              value={specializationInput}
              onChange={(e) => setSpecializationInput(e.target.value)}
              onKeyDown={(e) =>
                handleKeyDown(
                  e,
                  "specialization",
                  specializationInput,
                  setSpecializationInput
                )
              }
              placeholder="Type and press Enter to add"
              className="pl-10 h-11"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.specialization && formData.specialization.length > 0 ? (
              formData.specialization.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1.5 text-sm rounded-md"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag("specialization", tag)}
                    className="ml-2 hover:text-gray-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))
            ) : (
              <p className="text-xs text-gray-500">No specializations added yet. Press Enter to add.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
