"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import metadata from "@/utils/constant/metadata";

const EXPERIENCES = metadata.experience;
const PAY_RANGE_MIN = metadata.pay_range.min;
const PAY_RANGE_MAX = metadata.pay_range.max;
const PAY_RANGE_STEP = metadata.pay_range.step;

interface FormData {
  payRange: [number, number];
  experience: string;
  qualification: string[];
  specialization: string[];
}

interface JobRequirementsProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
}

export function JobRequirements({
  formData,
  updateFormData,
}: JobRequirementsProps) {
  const [qualificationInput, setQualificationInput] = useState("");
  const [specializationInput, setSpecializationInput] = useState("");

  const addTag = (field: "qualification" | "specialization", value: string) => {
    if (value.trim() && !formData[field].includes(value.trim())) {
      updateFormData({
        [field]: [...formData[field], value.trim()],
      });
    }
  };

  const removeTag = (
    field: "qualification" | "specialization",
    tagToRemove: string
  ) => {
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

  return (
    <div className="space-y-6 sm:space-y-8 mb-6 sm:mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        <div className="space-y-2 sm:space-y-3">
          <Label className="text-sm font-medium text-gray-700">Pay Range</Label>
          <div className="space-y-4 pt-2">
            <div className="flex justify-between text-xs sm:text-sm text-gray-600 font-medium">
              <span>$ {formData.payRange[0]}</span>
              <span>$ {formData.payRange[1]}</span>
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

        <div className="space-y-2 sm:space-y-3">
          <Label
            htmlFor="experience"
            className="text-sm font-medium text-gray-700"
          >
            Years of Experience <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.experience}
            onValueChange={(value) => updateFormData({ experience: value })}
          >
            <SelectTrigger id="experience" className="w-full h-10 sm:h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EXPERIENCES.map((exp) => (
                <SelectItem key={exp} value={exp}>
                  {exp}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        <div className="space-y-2 sm:space-y-3">
          <Label
            htmlFor="qualification"
            className="text-sm font-medium text-gray-700"
          >
            Qualification <span className="text-red-500">*</span>
          </Label>
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
            placeholder="Neurol"
            className="border-[#F4781B] focus:ring-[#F4781B] h-10 sm:h-11"
          />
          <div className="flex flex-wrap gap-2 pt-1">
            {formData.qualification.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag("qualification", tag)}
                  className="ml-1 sm:ml-2 hover:text-gray-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2 sm:space-y-3">
          <Label
            htmlFor="specialization"
            className="text-sm font-medium text-gray-700"
          >
            Specialization
          </Label>
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
            placeholder="Neurol"
            className="h-10 sm:h-11"
          />
          <div className="flex flex-wrap gap-2 pt-1">
            {formData.specialization.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag("specialization", tag)}
                  className="ml-1 sm:ml-2 hover:text-gray-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
