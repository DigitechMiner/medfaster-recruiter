"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface JobBasicInfoProps {
  formData: any;
  updateFormData: (updates: any) => void;
}

const jobTitles = [
  "Nurse",
  "Orthopaedics",
  "Dermatology",
  "Neurology",
  "Cardiology",
  "Pediatrics",
];

const departments = [
  "Cardiology",
  "Neurology",
  "Orthopaedics",
  "Dermatology",
  "Pediatrics",
  "Emergency",
];

export function JobBasicInfo({ formData, updateFormData }: JobBasicInfoProps) {
  return (
    <div className="space-y-4 sm:space-y-6 mb-4 sm:mb-6">
      {/* Job Title and Department - Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="space-y-2">
          <Label htmlFor="job-title" className="text-sm">
            Job Title <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.jobTitle}
            onValueChange={(value) => updateFormData({ jobTitle: value })}
          >
            <SelectTrigger
              id="job-title"
              className="w-full border-orange-500 focus:ring-orange-500 h-10 sm:h-11"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {jobTitles.map((title) => (
                <SelectItem key={title} value={title}>
                  {title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="department" className="text-sm">
            Department <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.department}
            onValueChange={(value) => updateFormData({ department: value })}
          >
            <SelectTrigger id="department" className="w-full h-10 sm:h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Job Type and Location - Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="space-y-2">
          <Label className="text-sm">
            Job Type <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            value={formData.jobType}
            onValueChange={(value) => updateFormData({ jobType: value })}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="Part Time"
                id="part-time"
                className="border-orange-500 text-white data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
              />
              <Label htmlFor="part-time" className="font-normal cursor-pointer text-sm">
                Part Time
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="Full Time"
                id="full-time"
                className="border-orange-500 text-white data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
              />
              <Label htmlFor="full-time" className="font-normal cursor-pointer text-sm">
                Full Time
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="Freelancer"
                id="freelancer"
                className="border-orange-500 text-white data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
              />
              <Label htmlFor="freelancer" className="font-normal cursor-pointer text-sm">
                Freelancer
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location" className="text-sm">
            Location <span className="text-red-500">*</span>
          </Label>
          <Input
            id="location"
            type="text"
            value={formData.location}
            onChange={(e) => updateFormData({ location: e.target.value })}
            placeholder="Enter location"
            className="h-10 sm:h-11"
          />
        </div>
      </div>
    </div>
  );
}
