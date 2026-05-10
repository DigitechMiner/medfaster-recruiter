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
import { useEffect, useState } from "react";
import { axiosInstance } from "@/stores/api/api-client";
import { ENDPOINTS } from "@/stores/api/api-endpoints";
import metadata from "@/utils/constant/metadata";
import type { JobFormData } from "@/types";

const EXPERIENCE_MIN  = 0;
const EXPERIENCE_MAX  = 20;
const PAY_MIN         = 0;
const QUALIFICATIONS  = metadata.qualification;
const SPECIALIZATIONS = metadata.specialization;

interface JobRequirementsProps {
  formData: JobFormData;
  updateFormData: (updates: Partial<JobFormData>) => void;
}

export function JobRequirements({ formData, updateFormData }: JobRequirementsProps) {
  const isFullTime = formData.jobType === "Full Time" || formData.jobType === "full_time";
  const isPartTime = formData.jobType === "Part Time" || formData.jobType === "part_time";

  const experienceValue = formData.experience
    ? parseInt(formData.experience.split("-")[0]) || 4
    : 4;


  // ── Part-time: fetch rate from backend ────────────────────────────────────
  const [backendRate, setBackendRate]       = useState<number | null>(null);
  const [rateLoading, setRateLoading]       = useState(false);
  const [rateError, setRateError]           = useState<string | null>(null);

  useEffect(() => {
    if (!isPartTime || !formData.jobTitle) {
      setBackendRate(null);
      setRateError(null);
      return;
    }

    setRateLoading(true);
    setRateError(null);

    axiosInstance
      .get(ENDPOINTS.JOBS_FEES(formData.jobTitle))
      .then((res) => {
        // API returns dollars — store as dollars, convert to cents in convertToBackendFormat
        const dollars: number =
          res.data?.data?.recruiter_pay_per_hour ??
          res.data?.recruiter_pay_per_hour ??
          0;
        setBackendRate(dollars);
        // ✅ Sync into formData so convertToBackendFormat picks it up
        updateFormData({ payRange: dollars });
      })
      .catch(() => setRateError("Could not load pay rate for this role"))
      .finally(() => setRateLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.jobTitle, isPartTime]);

  // ── Tag helpers ───────────────────────────────────────────────────────────
  const removeTag = (field: "qualification" | "specialization", tagToRemove: string) => {
    updateFormData({
      [field]: (formData[field] ?? []).filter((tag) => tag !== tagToRemove),
    });
  };

  const handleQualificationSelect = (value: string) => {
    if (value && !(formData.qualification ?? []).includes(value)) {
      updateFormData({ qualification: [...(formData.qualification ?? []), value] });
    }
  };

  const handleSpecializationSelect = (value: string) => {
    if (value && !formData.specialization.includes(value)) {
      updateFormData({ specialization: [...formData.specialization, value] });
    }
  };

  return (
    <div className="space-y-6 mb-6">

      {/* Pay Rate & Years of Experience */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Fixed Hourly Pay per Hire */}
<div className="space-y-3">
  <Label className="text-sm font-medium text-gray-700">
    Fixed Hourly Pay per Hire
  </Label>

  {/* ── Part Time: backend rate (read-only) ── */}
  {isPartTime && (
    <div className="pt-2">
      {rateLoading && (
        <p className="text-sm text-gray-400 animate-pulse">Fetching pay rate...</p>
      )}
      {rateError && (
        <p className="text-sm text-red-500">{rateError}</p>
      )}
      {!rateLoading && !rateError && (
        <div className="flex items-center gap-3">
          <span className="bg-gray-100 px-4 py-2 rounded-md text-sm font-semibold text-gray-800">
            {backendRate !== null ? `$${backendRate}/hr` : "—"}
          </span>
          <span className="text-xs text-gray-400 italic">
            Rate managed by platform
          </span>
        </div>
      )}
    </div>
  )}

  {/* ── Full Time: descriptive message instead of slider ── */}
  {isFullTime && (
    <div className="flex items-start gap-3 px-4 py-3 bg-orange-50 border border-orange-200 rounded-lg mt-1">
  
      <div>
        <p className="text-xs text-orange-400 mt-0.5">
          Full-time compensation is agreed between recruiter and candidate 
        </p>
      </div>
    </div>
  )}

  {/* ── Neither selected yet ── */}
  {!isPartTime && !isFullTime && (
    <p className="text-sm text-gray-400 pt-2 italic">
      Select a job type to configure pay rate
    </p>
  )}
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

        {/* Qualification */}
        <div className="space-y-3">
          <Label htmlFor="qualification" className="text-sm font-medium text-gray-700">
            Additional Qualification
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
                const alreadyAdded = (formData.qualification ?? []).includes(qual);
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
            {(formData.qualification ?? []).length > 0 ? (
              (formData.qualification ?? []).map((tag) => (
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

        {/* Specialization */}
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