"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { getJobFees } from "@/features/jobs";
import {
  cacheJobPayRate,
  canFetchJobFees,
  getCachedPayRateCents,
  parseJobFeesYears,
  shouldSyncPlatformPayRate,
} from "./use-platform-pay-rate";
import { useMetadataStore } from "@/stores/metadataStore";
import type {
  EmploymentType,
  JobFormData,
  Province,
  StaffingType,
} from "@/types";
import { getMetadataLabel } from "@/utils/constant/metadata";
import {
  JobFormField,
  JobFormInput,
  JobFormSelect,
} from "../components/form-field";
import type { JobFormFieldErrors } from "../validation";

const EXPERIENCE_MIN = 0;
const EXPERIENCE_MAX = 20;

const getExperienceYearsValue = (experience?: string): number => {
  const rawValue = experience?.split("-")[0] ?? "";
  const parsed = Number.parseInt(rawValue, 10);
  if (!Number.isFinite(parsed)) return EXPERIENCE_MIN;
  return Math.min(EXPERIENCE_MAX, Math.max(EXPERIENCE_MIN, parsed));
};

interface NormalBasicStepProps {
  formData: JobFormData;
  updateFormData: (updates: Partial<JobFormData>) => void;
  fieldErrors?: JobFormFieldErrors;
}

export function NormalBasicStep({
  formData,
  updateFormData,
  fieldErrors = {},
}: NormalBasicStepProps) {
  const {
    departments,
    jobTitlesForDepartment,
    jobTypeOptions,
    loading,
    provinceOptions,
    specializations,
    specializationsForJobTitle,
  } = useMetadataStore();

  const availableSpecializations = useMemo(
    () => specializationsForJobTitle(formData.job_title ?? ""),
    [formData.job_title, specializationsForJobTitle, specializations],
  );
  const hasJobTitle = Boolean(formData.job_title);
  const hasSpecializationOptions = availableSpecializations.length > 0;
  const specializationEmptyMessage = "No specialization for this role";

  // const isFullTime = formData.job_type === "full_time";
  const shouldSyncPayRate = shouldSyncPlatformPayRate(formData.job_type);
  const departmentJobTitles = jobTitlesForDepartment(formData.department ?? "");
  const normalJobTypeOptions = jobTypeOptions.filter(
    ({ value }) => value === "part_time" || value === "full_time",
  );
  const experienceValue = getExperienceYearsValue(
    formData.years_of_experience,
  );
  const getSpecializationLabel = (value: string) =>
    getMetadataLabel(specializations, value);

  const [qualificationDraft, setQualificationDraft] = useState("");
  const [backendRate, setBackendRate] = useState<number | null>(() => {
    const years = parseJobFeesYears(formData.years_of_experience);
    if (!canFetchJobFees(formData.job_title, formData.years_of_experience) || years === null) {
      return null;
    }
    const cachedRateCents = getCachedPayRateCents(formData.job_title, "normal", years);
    return cachedRateCents === null ? null : cachedRateCents / 100;
  });
  const [rateLoading, setRateLoading] = useState(false);
  const [rateError, setRateError] = useState<string | null>(null);

  useEffect(() => {
    if (!shouldSyncPayRate || !canFetchJobFees(formData.job_title, formData.years_of_experience)) {
      setBackendRate(null);
      setRateError(null);
      setRateLoading(false);
      if (formData.backend_pay_rate !== undefined) {
        updateFormData({ backend_pay_rate: undefined });
      }
      return;
    }

    const experienceYears = parseJobFeesYears(formData.years_of_experience) as number;
    const cachedRateCents = getCachedPayRateCents(
      formData.job_title,
      "normal",
      experienceYears,
    );
    if (cachedRateCents !== null) {
      const dollars = cachedRateCents / 100;
      setBackendRate(dollars);
      setRateError(null);
      setRateLoading(false);
      if (formData.backend_pay_rate !== dollars) {
        updateFormData({ backend_pay_rate: dollars });
      }
      return;
    }

    let didCancel = false;
    setRateLoading(true);
    setRateError(null);

    getJobFees(formData.job_title, {
      feeType: "normal",
      yearsOfExperience: experienceYears,
    })
      .then((data) => {
        if (didCancel) return;
        const dollars = Number(data.recruiter_pay_per_hour ?? 0);
        const cents = Math.round(dollars * 100);
        const rateDollars = cents / 100;
        setBackendRate(rateDollars);
        updateFormData({ backend_pay_rate: rateDollars });
        cacheJobPayRate(formData.job_title, "normal", cents, experienceYears);
      })
      .catch(() => {
        if (!didCancel) {
          setRateError("Could not load pay rate for this role");
        }
      })
      .finally(() => {
        if (!didCancel) {
          setRateLoading(false);
        }
      });

    return () => {
      didCancel = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- updateFormData is unstable; guarded above
  }, [formData.job_title, formData.years_of_experience, shouldSyncPayRate]);

  const handleDepartmentChange = (value: string) => {
    updateFormData({
      department: value,
      job_title: "",
      backend_pay_rate: undefined,
      specializations: [],
    });
  };

  const handleJobTitleChange = (value: string) => {
    const nextSpecializations = specializationsForJobTitle(value);
    const allowedValues = new Set(nextSpecializations.map((spec) => spec.value));
    const keptSpecializations = (formData.specializations ?? []).filter((spec) =>
      allowedValues.has(spec),
    );

    updateFormData({
      job_title: value,
      backend_pay_rate: undefined,
      specializations: keptSpecializations,
    });
  };

  const removeTag = (
    field: "qualifications" | "specializations",
    tagToRemove: string,
  ) => {
    updateFormData({
      [field]: (formData[field] ?? []).filter((tag) => tag !== tagToRemove),
    });
  };

  const handleQualificationAdd = () => {
    const value = qualificationDraft.trim();
    if (!value) return;

    const alreadyAdded = (formData.qualifications ?? []).some(
      (qualification) => qualification.toLowerCase() === value.toLowerCase(),
    );
    if (!alreadyAdded) {
      updateFormData({
        qualifications: [...(formData.qualifications ?? []), value],
      });
    }
    setQualificationDraft("");
  };

  const handleSpecializationSelect = (value: string) => {
    if (value && !formData.specializations.includes(value)) {
      updateFormData({
        specializations: [...formData.specializations, value],
      });
    }
  };

  const employmentType: EmploymentType =
    (formData.employment_type as EmploymentType) ?? "temporary";

  const staffingType: StaffingType =
    (formData.staffing_type as StaffingType) ?? "standard";

  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
     
        {/* Department */}
        <JobFormSelect
          id="department"
          label="Department"
          value={formData.department}
          onValueChange={handleDepartmentChange}
          options={departments.map(({ uuid, label, value }, index) => ({
            key: `${uuid}-${value}-${index}`,
            label,
            value,
          }))}
          placeholder={loading ? "Loading..." : "Select"}
          triggerClassName="h-11 w-full"
          required
          error={fieldErrors.department}
        />

        {/* Job Title */}
        <JobFormSelect
          id="job-title"
          label="Job Title"
          value={formData.job_title}
          onValueChange={handleJobTitleChange}
          options={departmentJobTitles.map(
            ({ uuid, label, value }, index) => ({
              key: `${uuid}-${value}-${index}`,
              label,
              value,
            }),
          )}
          placeholder={loading ? "Loading..." : "Select"}
          disabled={!formData.department || loading}
          triggerClassName="h-11 w-full"
          required
          error={fieldErrors.job_title}
        />

           {/* Employment Type */}
           <JobFormField
          label="Employment Type"
          required
          error={fieldErrors.employment_type}
        >
          <RadioGroup
            value={employmentType}
            onValueChange={(value) =>
              updateFormData({ employment_type: value as EmploymentType })
            }
            className="flex flex-wrap gap-4 pt-2"
          >
            {[
              { label: "Permanent", value: "permanent" },
              { label: "Temporary", value: "temporary" },
            ].map((opt) => (
              <div key={opt.value} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={opt.value}
                  id={`employment-${opt.value}`}
                  className="border-[#F4781B] text-white data-[state=checked]:bg-[#F4781B] data-[state=checked]:border-[#F4781B]"
                />
                <Label
                  htmlFor={`employment-${opt.value}`}
                  className="cursor-pointer text-sm font-normal text-gray-700"
                >
                  {opt.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </JobFormField>


        {/* Job Type */}
        <JobFormField label="Job Type" required error={fieldErrors.job_type}>
          <RadioGroup
            value={formData.job_type}
            onValueChange={(value) => updateFormData({ job_type: value })}
            className="flex flex-wrap gap-4 pt-2"
          >
            {normalJobTypeOptions.map(({ label, value }) => (
              <div key={value} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={value}
                  id={`job-type-${value}`}
                  className="border-[#F4781B] text-white data-[state=checked]:bg-[#F4781B] data-[state=checked]:border-[#F4781B]"
                />
                <Label
                  htmlFor={`job-type-${value}`}
                  className="cursor-pointer text-sm font-normal text-gray-700"
                >
                  {value === "full_time" ? "Full-Time" : label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </JobFormField>

        {/* Staffing Type */}
        <JobFormField
          label="Staffing Type"
          required
          error={fieldErrors.staffing_type}
        >
          <RadioGroup
            value={staffingType}
            onValueChange={(value) =>
              updateFormData({ staffing_type: value as StaffingType })
            }
            className="flex flex-wrap gap-4 pt-2"
          >
            {[
              { label: "Standard", value: "standard" },
              { label: "Rotational", value: "rotational" },
            ].map((opt) => (
              <div key={opt.value} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={opt.value}
                  id={`staffing-${opt.value}`}
                  className="border-[#F4781B] text-white data-[state=checked]:bg-[#F4781B] data-[state=checked]:border-[#F4781B]"
                />
                <Label
                  htmlFor={`staffing-${opt.value}`}
                  className="cursor-pointer text-sm font-normal text-gray-700"
                >
                  {opt.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </JobFormField>

        {/* Job AI-Interview */}
        <JobFormField label="Job AI-Interview" required>
          <RadioGroup
            value={formData.ai_interview === true ? "Yes" : "No"}
            onValueChange={(value) =>
              updateFormData({ ai_interview: value === "Yes" })
            }
            className="flex flex-wrap gap-4 pt-2"
          >
            {["Yes", "No"].map((opt) => (
              <div key={opt} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={opt}
                  id={`interview-${opt.toLowerCase()}`}
                  className="border-[#F4781B] text-white data-[state=checked]:bg-[#F4781B] data-[state=checked]:border-[#F4781B]"
                />
                <Label
                  htmlFor={`interview-${opt.toLowerCase()}`}
                  className="cursor-pointer text-sm font-normal text-gray-700"
                >
                  {opt}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </JobFormField>

        {/* Required Qualification */}
        <JobFormField
          id="qualification"
          label="Required Qualification"
          required
          error={fieldErrors.qualifications}
          className="space-y-3"
        >
          <div className="relative">
            <Input
              id="qualification"
              value={qualificationDraft}
              onChange={(event) => setQualificationDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleQualificationAdd();
                }
              }}
              placeholder="Search or add qualification"
              className="h-11 pr-20"
            />
            <Button
              type="button"
              onClick={handleQualificationAdd}
              className="absolute right-0 top-0 h-full rounded-none rounded-r-md bg-[#F4781B] px-4 text-white hover:bg-orange-600"
            >
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(formData.qualifications ?? []).length > 0 ? (
              (formData.qualifications ?? []).map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag("qualifications", tag)}
                    className="ml-2 hover:text-gray-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            ) : (
              <p className="text-xs text-gray-500">
                No qualifications added yet. Type one and click Add.
              </p>
            )}
          </div>
        </JobFormField>

        {/* Required Specialization */}
        <JobFormSelect
          id="specialization"
          label="Required Specialization"
          value=""
          onValueChange={handleSpecializationSelect}
          options={availableSpecializations.map(({ uuid, label, value }, index) => {
            const alreadyAdded = formData.specializations.includes(value);
            return {
              key: `${uuid}-${value}-${index}`,
              label,
              value,
              disabled: alreadyAdded,
              className: alreadyAdded ? "cursor-not-allowed opacity-40" : "",
              suffix: alreadyAdded ? (
                <span className="ml-2 text-xs text-gray-400">Added</span>
              ) : undefined,
            };
          })}
          contentClassName="max-h-60"
          triggerClassName="h-11 w-full"
          disabled={!hasJobTitle || loading}
          emptyOptionsMessage={specializationEmptyMessage}
          triggerContent={
            <div className="flex items-center gap-2 text-gray-500">
              <span className="text-sm">
                {!hasJobTitle
                  ? "Select a job title first"
                  : !hasSpecializationOptions
                    ? specializationEmptyMessage
                    : "Select specialization"}
              </span>
            </div>
          }
          required
          error={fieldErrors.specializations}
          fieldClassName="space-y-3"
        >
          <div className="flex flex-wrap gap-2">
            {formData.specializations && formData.specializations.length > 0 ? (
              formData.specializations.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="rounded-md border px-3 py-1.5 text-sm"
                >
                  {getSpecializationLabel(tag)}
                  <button
                    type="button"
                    onClick={() => removeTag("specializations", tag)}
                    className="ml-2 hover:text-orange-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            ) : (
              <p className="text-xs text-gray-500">
                {!hasJobTitle
                  ? "Select a job title to see available specializations."
                  : !hasSpecializationOptions
                    ? specializationEmptyMessage
                    : "No specializations added yet. Select from the dropdown."}
              </p>
            )}
          </div>
        </JobFormSelect>

        {/* Required Years of Experience */}
        <JobFormField
          label="Required Years of Experience"
          required
          error={fieldErrors.years_of_experience}
          className="space-y-3"
        >
          <div className="space-y-4 pt-2">
            <div className="flex justify-between text-sm font-medium text-gray-600">
              <span>{experienceValue} Years</span>
            </div>
            <Slider
              min={EXPERIENCE_MIN}
              max={EXPERIENCE_MAX}
              step={1}
              value={[experienceValue]}
              onValueChange={(value) =>
                updateFormData({
                  years_of_experience: String(value[0]),
                  backend_pay_rate: undefined,
                })
              }
              className="w-full"
            />
          </div>
        </JobFormField>

        {/* Street Address */}
        <JobFormInput
          id="street-address"
          label="Street Address"
          type="text"
          value={formData.street || ""}
          onChange={(e) => updateFormData({ street: e.target.value })}
          placeholder="1234 Maple Street"
          error={fieldErrors.street}
        />

          {/* City */}
          <JobFormInput
          id="city"
          label="City"
          type="text"
          value={formData.city || ""}
          onChange={(e) => updateFormData({ city: e.target.value })}
          placeholder="Ontario"
          required
          error={fieldErrors.city}
        />

        {/* Province */}
        <JobFormSelect
          id="province"
          label="Province"
          value={formData.province || ""}
          onValueChange={(value) =>
            updateFormData({ province: value as Province })
          }
          options={provinceOptions.map((province) => ({
            label: province.label,
            value: province.value,
          }))}
          placeholder="Select Province"
          triggerClassName="h-11"
          error={fieldErrors.province}
        />

        {/* Postal Code */}
        <JobFormInput
          id="postal-code"
          label="Postal Code"
          type="text"
          value={formData.postal_code || ""}
          onChange={(e) => updateFormData({ postal_code: e.target.value })}
          placeholder="M5H 2N2"
          required
          error={fieldErrors.postal_code}
        />

        {/* Country */}
        <JobFormInput
          id="country"
          label="Country"
          type="text"
          value={formData.country || "Canada"}
          disabled
          className="h-11 bg-gray-50 text-gray-500"
          required
        />

        
      </div>

      {/* Optional: backend rate info (not shown in Figma, but kept for later use) */}
      {shouldSyncPayRate && (
        <div className="mt-4">
          {rateLoading && (
            <p className="animate-pulse text-xs text-gray-400">
              Fetching pay rate...
            </p>
          )}
          {rateError && (
            <p className="text-xs text-red-500">{rateError}</p>
          )}
          {!rateLoading && !rateError && backendRate !== null && (
            <p className="text-xs text-gray-400">
              Suggested hourly rate from platform: ${backendRate}/hr
            </p>
          )}
        </div>
      )}
    </>
  );
}