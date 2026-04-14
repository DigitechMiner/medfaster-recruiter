"use client";

import { X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import metadata from "@/utils/constant/metadata";
import type { JobFormData } from "@/Interface/job.types";

const EXPERIENCE_MIN = 0;
const EXPERIENCE_MAX = 20;
const QUALIFICATIONS  = metadata.qualification;   // ✅ from metadata
const SPECIALIZATIONS = metadata.specialization;

interface JobRequirementsProps {
  formData: JobFormData;
  updateFormData: (updates: Partial<JobFormData>) => void;
}

export function JobRequirements({ formData, updateFormData }: JobRequirementsProps) {
  const experienceValue = formData.experience
    ? parseInt(formData.experience.split("-")[0]) || 4
    : 4;

  const removeTag = (
    field: "qualification" | "specialization",
    tagToRemove: string
  ) => {
    updateFormData({
      [field]: formData[field].filter((tag) => tag !== tagToRemove),
    });
  };

  // ✅ Add qualification from dropdown — prevent duplicates
  const handleQualificationSelect = (value: string) => {
    if (value && !formData.qualification.includes(value)) {
      updateFormData({
        qualification: [...formData.qualification, value],
      });
    }
  };

  // Add specialization from dropdown — prevent duplicates
  const handleSpecializationSelect = (value: string) => {
    if (value && !formData.specialization.includes(value)) {
      updateFormData({
        specialization: [...formData.specialization, value],
      });
    }
  };

  return (
    <div className="space-y-6 mb-6">
      {/* Pay Range & Years of Experience */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pay Range */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">
            Fixed Hourly Pay per Hire
          </Label>
          <div className="space-y-4 pt-2">
            <div className="flex justify-center text-sm text-gray-600 font-medium">
              <span className="bg-gray-100 px-3 py-1 rounded-md">
                 ${formData.payRange[0]}
              </span>
            </div>
            <Slider
              min={0}
              max={100}
              step={1}
              value={[formData.payRange[0]]}
              onValueChange={(value) =>
                updateFormData({ payRange: [value[0], value[0]] as [number, number] })
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
            </div>
            <Slider
              min={EXPERIENCE_MIN}
              max={EXPERIENCE_MAX}
              step={1}
              value={[experienceValue]}
              onValueChange={(value) =>
                updateFormData({ experience: `${value[0]}-${value[0] + 1}` })
              }
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Qualification & Specialization */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* ✅ Qualification — now a dropdown like specialization */}
        <div className="space-y-3">
          <Label htmlFor="qualification" className="text-sm font-medium text-gray-700">
            Additional Qualification <span className="text-red-500">*</span>
          </Label>

          <Select value="" onValueChange={handleQualificationSelect}>
            <SelectTrigger
              id="qualification"
              className="h-11 border-[#F4781B] focus:ring-[#F4781B] w-full"
            >
              <div className="flex items-center gap-2 text-gray-500">
                <span className="text-sm">Select qualification</span>
              </div>
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {QUALIFICATIONS.map((qual) => {
                const alreadyAdded = formData.qualification.includes(qual);
                return (
                  <SelectItem
                    key={qual}
                    value={qual}
                    disabled={alreadyAdded}
                    className={alreadyAdded ? "opacity-40 cursor-not-allowed" : ""}
                  >
                    {qual}
                    {alreadyAdded && (
                      <span className="ml-2 text-xs text-gray-400">✓ Added</span>
                    )}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

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
              <p className="text-xs text-gray-500">
                No qualifications added yet. Select from the dropdown.
              </p>
            )}
          </div>
        </div>

        {/* Specialization — dropdown from metadata (unchanged) */}
        <div className="space-y-3">
          <Label htmlFor="specialization" className="text-sm font-medium text-gray-700">
            Specialization <span className="text-red-500">*</span>
          </Label>

          <Select value="" onValueChange={handleSpecializationSelect}>
            <SelectTrigger
              id="specialization"
              className="h-11 border-[#F4781B] focus:ring-[#F4781B] w-full"
            >
              <div className="flex items-center gap-2 text-gray-500">
                <span className="text-sm">Select specialization</span>
              </div>
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {SPECIALIZATIONS.map((spec) => {
                const alreadyAdded = formData.specialization.includes(spec);
                return (
                  <SelectItem
                    key={spec}
                    value={spec}
                    disabled={alreadyAdded}
                    className={alreadyAdded ? "opacity-40 cursor-not-allowed" : ""}
                  >
                    {spec}
                    {alreadyAdded && (
                      <span className="ml-2 text-xs text-gray-400">✓ Added</span>
                    )}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          <div className="flex flex-wrap gap-2">
            {formData.specialization && formData.specialization.length > 0 ? (
              formData.specialization.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="border px-3 py-1.5 text-sm rounded-md"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag("specialization", tag)}
                    className="ml-2 hover:text-orange-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))
            ) : (
              <p className="text-xs text-gray-500">
                No specializations added yet. Select from the dropdown.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}