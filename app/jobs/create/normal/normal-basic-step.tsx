"use client";

import { useEffect, useState } from "react";
import { CalendarIcon, Clock, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { axiosInstance } from "@/stores/api/api-client";
import { ENDPOINTS } from "@/stores/api/api-endpoints";
import { useJobsStore, type JobFormSnapshot } from "@/stores/jobs-store";
import { useMetadataStore } from "@/stores/metadataStore";
import type { JobFormData, Province } from "@/types";
import { getMetadataLabel } from "@/utils/constant/metadata";
import { DateRangePicker } from "../components/date-picker";
import {
  JobFormField,
  JobFormInput,
  JobFormPickerButton,
  JobFormSelect,
} from "../components/form-field";
import { CustomTimePicker } from "../components/time-picker";
import {
  isBlockedNumberOfHiresKey,
  MIN_NUMBER_OF_HIRES,
  normalizeNumberOfHiresInput,
} from "../form/utils";
import type { JobFormFieldErrors } from "../validation";

const EXPERIENCE_MIN = 0;
const EXPERIENCE_MAX = 20;

const getExperienceYearsValue = (experience?: string): number => {
  const rawValue = experience?.split("-")[0] ?? "";
  const parsed = Number.parseInt(rawValue, 10);

  if (!Number.isFinite(parsed)) return EXPERIENCE_MIN;

  return Math.min(EXPERIENCE_MAX, Math.max(EXPERIENCE_MIN, parsed));
};

const getCachedPayRateCents = (jobTitle: string): number | null => {
  const snapshot = useJobsStore.getState().formSnapshot;
  const cachedPayRate = snapshot?.cachedPayRate;

  if (
    cachedPayRate?.jobTitle === jobTitle &&
    typeof cachedPayRate.cents === "number"
  ) {
    return cachedPayRate.cents;
  }

  return null;
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
  } = useMetadataStore();
  const isFullTime = formData.job_type === "full_time";
  const isPartTime = formData.job_type === "part_time";
  const departmentJobTitles = jobTitlesForDepartment(formData.department ?? "");
  const normalJobTypeOptions = jobTypeOptions.filter(
    ({ value }) => value === "part_time" || value === "full_time",
  );
  const experienceValue = getExperienceYearsValue(formData.years_of_experience);
  const getSpecializationLabel = (value: string) =>
    getMetadataLabel(specializations, value);

  const today = new Date();

  const [showCalendar, setShowCalendar] = useState(false);
  const [showFromTimePicker, setShowFromTimePicker] = useState(false);
  const [showToTimePicker, setShowToTimePicker] = useState(false);
  const [qualificationDraft, setQualificationDraft] = useState("");
  const [backendRate, setBackendRate] = useState<number | null>(() => {
    const cachedRateCents = getCachedPayRateCents(formData.job_title);
    return cachedRateCents === null ? null : cachedRateCents / 100;
  });
  const [rateLoading, setRateLoading] = useState(false);
  const [rateError, setRateError] = useState<string | null>(null);

  useEffect(() => {
    if (!isPartTime || !formData.job_title) {
      setBackendRate(null);
      setRateError(null);
      setRateLoading(false);
      return;
    }

    const cachedRateCents = getCachedPayRateCents(formData.job_title);
    if (cachedRateCents !== null) {
      setBackendRate(cachedRateCents / 100);
      setRateError(null);
      setRateLoading(false);
      return;
    }

    let didCancel = false;

    setRateLoading(true);
    setRateError(null);

    axiosInstance
      .get(ENDPOINTS.JOBS_FEES(formData.job_title))
      .then((res) => {
        if (didCancel) return;

        const dollars = Number(
          res.data?.data?.recruiter_pay_per_hour ??
            res.data?.recruiter_pay_per_hour ??
            0,
        );
        const cents = Math.round(dollars * 100);

        setBackendRate(cents / 100);

        const currentSnapshot = useJobsStore.getState().formSnapshot;
        useJobsStore.getState().setFormSnapshot({
          ...(currentSnapshot ?? {}),
          cachedPayRate: {
            jobTitle: formData.job_title,
            cents,
          },
        } as JobFormSnapshot);
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
  }, [formData.job_title, isPartTime]);

  const formatDate = (date?: Date | string) => {
    if (!date) return "MM/DD/YYYY";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "MM/DD/YYYY";
    return dateObj.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  const formatTimeDisplay = (time?: string, placeholder = "Select time") => {
    if (!time) return placeholder;
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const period = hour >= 12 ? "pm" : "am";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
  };

  const handleDepartmentChange = (value: string) => {
    updateFormData({ department: value, job_title: "" });
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
      updateFormData({ specializations: [...formData.specializations, value] });
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          triggerClassName="w-full border-[#F4781B] focus:ring-[#F4781B] h-11"
          required
          error={fieldErrors.department}
        />

        <JobFormSelect
          id="job-title"
          label="Job Title"
          value={formData.job_title}
          onValueChange={(value) => updateFormData({ job_title: value })}
          options={departmentJobTitles.map(({ uuid, label, value }, index) => ({
            key: `${uuid}-${value}-${index}`,
            label,
            value,
          }))}
          placeholder={loading ? "Loading..." : "Select"}
          disabled={!formData.department || loading}
          triggerClassName="w-full border-[#F4781B] focus:ring-[#F4781B] h-11"
          required
          error={fieldErrors.job_title}
        />

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
                  className="font-normal cursor-pointer text-sm text-gray-700"
                >
                  {value === "full_time" ? "Full-Time" : label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </JobFormField>

        <JobFormField label="Do you admire to have Interview?" required>
          <RadioGroup
            value={
              formData.inPersonInterview === true
                ? "Yes"
                : formData.inPersonInterview === false
                  ? "No"
                  : (formData.inPersonInterview as string | undefined)
            }
            onValueChange={(value) =>
              updateFormData({ inPersonInterview: value })
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
                  className="font-normal cursor-pointer text-sm text-gray-700"
                >
                  {opt}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </JobFormField>

        <JobFormPickerButton
          id="job-start-date"
          label="Job Start Date"
          displayValue={formatDate(formData.start_date)}
          icon={
            <CalendarIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
          }
          onClick={() => setShowCalendar(true)}
          required
          error={fieldErrors.start_date}
        />

        <JobFormPickerButton
          id="job-end-date"
          label={isFullTime ? "Job End Date (Optional)" : "Job End Date"}
          displayValue={formatDate(formData.end_date)}
          icon={
            <CalendarIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
          }
          onClick={() => setShowCalendar(true)}
          required={!isFullTime}
          error={fieldErrors.end_date}
        />

        <JobFormPickerButton
          id="job-check-in-time"
          label="Job Check-In Time"
          displayValue={formatTimeDisplay(
            formData.check_in_time,
            "Select start time",
          )}
          icon={<Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />}
          onClick={() => setShowFromTimePicker(true)}
          required
          error={fieldErrors.check_in_time}
        />

        <JobFormPickerButton
          id="job-check-out-time"
          label="Job Check-Out Time"
          displayValue={formatTimeDisplay(
            formData.check_out_time,
            "Select end time",
          )}
          icon={<Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />}
          onClick={() => setShowToTimePicker(true)}
          required
          error={fieldErrors.check_out_time}
        />

        <JobFormInput
          id="no-of-hires"
          label="Requirements For This Position"
          type="number"
          min={MIN_NUMBER_OF_HIRES}
          step={1}
          value={formData.no_of_hires_required || ""}
          onKeyDown={(e) => {
            if (isBlockedNumberOfHiresKey(e.key)) {
              e.preventDefault();
            }
          }}
          onChange={(e) =>
            updateFormData({
              no_of_hires_required: normalizeNumberOfHiresInput(e.target.value),
            })
          }
          placeholder="1"
          required
          error={fieldErrors.no_of_hires_required}
        />

        <JobFormField label="Fixed Hourly Pay per Hire" className="space-y-3">
          {isPartTime && (
            <div className="pt-2">
              {rateLoading && (
                <p className="text-sm text-gray-400 animate-pulse">
                  Fetching pay rate...
                </p>
              )}
              {rateError && <p className="text-sm text-red-500">{rateError}</p>}
              {!rateLoading && !rateError && (
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-11 items-center bg-gray-100 px-4 rounded-md text-sm font-semibold text-gray-800">
                    {backendRate !== null ? `$${backendRate}/hr` : "-"}
                  </span>
                  <span className="text-xs text-gray-400 italic">
                    Rate managed by platform
                  </span>
                </div>
              )}
            </div>
          )}

          {isFullTime && (
            <div className="flex items-start gap-3 px-4 py-3 bg-orange-50 border border-orange-200 rounded-lg mt-1">
              <div>
                <p className="text-xs text-orange-400 mt-0.5">
                  Full-time compensation is agreed between recruiter and
                  candidate
                </p>
              </div>
            </div>
          )}

          {!isPartTime && !isFullTime && (
            <p className="text-sm text-gray-400 pt-2 italic">
              Select a job type to configure pay rate
            </p>
          )}
        </JobFormField>

        <JobFormField
          id="qualification"
          label="Additional Qualification"
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
              placeholder="Enter qualification"
              className="h-11 pr-20"
            />
            <Button
              type="button"
              onClick={handleQualificationAdd}
              className="absolute right-0 top-0 h-full px-4 rounded-none rounded-r-md bg-[#F4781B] hover:bg-orange-600 text-white"
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
                  className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1.5 text-sm rounded-md"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag("qualifications", tag)}
                    className="ml-2 hover:text-gray-900"
                  >
                    <X className="w-3 h-3" />
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

        <JobFormSelect
          id="specialization"
          label="Specialization"
          value=""
          onValueChange={handleSpecializationSelect}
          options={specializations.map(({ uuid, label, value }, index) => {
            const alreadyAdded = formData.specializations.includes(value);

            return {
              key: `${uuid}-${value}-${index}`,
              label,
              value,
              disabled: alreadyAdded,
              className: alreadyAdded ? "opacity-40 cursor-not-allowed" : "",
              suffix: alreadyAdded ? (
                <span className="ml-2 text-xs text-gray-400">Added</span>
              ) : undefined,
            };
          })}
          contentClassName="max-h-60"
          triggerClassName="h-11 border-[#F4781B] focus:ring-[#F4781B] w-full"
          triggerContent={
            <div className="flex items-center gap-2 text-gray-500">
              <span className="text-sm">Select specialization</span>
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
                  className="border px-3 py-1.5 text-sm rounded-md"
                >
                  {getSpecializationLabel(tag)}
                  <button
                    type="button"
                    onClick={() => removeTag("specializations", tag)}
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
        </JobFormSelect>

        <JobFormField
          label="Years of Experience"
          required
          error={fieldErrors.years_of_experience}
          className="space-y-3"
        >
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
                updateFormData({ years_of_experience: String(value[0]) })
              }
              className="w-full"
            />
          </div>
        </JobFormField>

        <JobFormInput
          id="street-address"
          label="Street Address"
          type="text"
          value={formData.street || ""}
          onChange={(e) => updateFormData({ street: e.target.value })}
          placeholder="1234 Maple Street"
          error={fieldErrors.street}
        />

        <JobFormInput
          id="city"
          label="City"
          type="text"
          value={formData.city || ""}
          onChange={(e) => updateFormData({ city: e.target.value })}
          placeholder="Toronto"
          required
          error={fieldErrors.city}
        />

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
          triggerClassName="h-11 border-[#F4781B]"
          error={fieldErrors.province}
        />

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

      {showCalendar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <DateRangePicker
            fromDate={formData.start_date}
            tillDate={formData.end_date}
            minDate={today}
            onChange={(from, till) =>
              updateFormData({ start_date: from, end_date: till })
            }
            onCancel={() => setShowCalendar(false)}
            onSchedule={() => setShowCalendar(false)}
          />
        </div>
      )}

      {showFromTimePicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <CustomTimePicker
            selectedTime={formData.check_in_time}
            onSelect={(time) => updateFormData({ check_in_time: time })}
            onCancel={() => setShowFromTimePicker(false)}
            onSelectTime={() => setShowFromTimePicker(false)}
          />
        </div>
      )}

      {showToTimePicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <CustomTimePicker
            selectedTime={formData.check_out_time}
            onSelect={(time) => updateFormData({ check_out_time: time })}
            onCancel={() => setShowToTimePicker(false)}
            onSelectTime={() => setShowToTimePicker(false)}
          />
        </div>
      )}
    </>
  );
}
