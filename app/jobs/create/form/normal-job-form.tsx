"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarIcon, Clock, X } from "lucide-react";
import { toast } from "react-toastify";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { axiosInstance } from "@/stores/api/api-client";
import { ENDPOINTS } from "@/stores/api/api-endpoints";
import { useJobsStore, type JobFormSnapshot } from "@/stores/jobs-store";
import { useMetadataStore } from "@/stores/metadataStore";
import type { JobCreatePayload, JobFormData, Province } from "@/types";
import metadata, {
  convertExperienceToBackend,
  convertJobTitleToBackend,
  convertJobTypeToBackend,
  convertProvinceToJobBackend,
  convertSpecializationToBackend,
} from "@/utils/constant/metadata";
import { validateJobPayload, toFormFieldErrors } from "../helper/validatePayload";
import { DEFAULT_JOB_FORM_DATA } from "./constants";
import type { CreateFormStep } from "../helper/types";
import { CustomTimePicker } from "../helper/time-picker";
import {
  buildNextFormSnapshot,
  clearErrorsForUpdatedFields,
  dateFromSnapshot,
  filterValidationErrorsForStep,
  formatDateForBackend,
  fromSnapshot,
  payRangeFromSnapshot,
  type JobFormFieldErrors,
} from "../helper/utils";
import { DateRangePicker } from "../helper/date-picker";
import { DescriptionForm } from "./description-form";

const EXPERIENCE_MIN = 0;
const EXPERIENCE_MAX = 20;
const QUALIFICATIONS = metadata.qualification;
const SPECIALIZATIONS = metadata.specialization;

const VALID_SPECIALIZATION_VALUES = new Set<string>(
  Object.values(metadata.specialization_mapping),
);

interface NormalJobFormProps {
  urgencyMode: "normal" | "instant";
  onNext?: (payload: JobCreatePayload, wantsInterview: boolean) => void;
  onStepNext?: () => void;
  onBack?: () => void;
  formStep?: CreateFormStep;
}

function buildInitialFormData(
  urgencyMode: "normal" | "instant",
  snapshot: JobFormSnapshot | null,
): JobFormData {
  return {
    ...DEFAULT_JOB_FORM_DATA,
    urgency: urgencyMode,
    aiInterview: fromSnapshot(snapshot, "aiInterview", true),
    inPersonInterview: fromSnapshot(snapshot, "inPersonInterview", "Yes"),
    fromTime: fromSnapshot(snapshot, "fromTime", DEFAULT_JOB_FORM_DATA.fromTime),
    toTime: fromSnapshot(snapshot, "toTime", DEFAULT_JOB_FORM_DATA.toTime),
    jobTitle: fromSnapshot(
      snapshot,
      "jobTitle",
      DEFAULT_JOB_FORM_DATA.jobTitle,
    ),
    department: fromSnapshot(
      snapshot,
      "department",
      DEFAULT_JOB_FORM_DATA.department,
    ),
    jobType: fromSnapshot(snapshot, "jobType", DEFAULT_JOB_FORM_DATA.jobType),
    streetAddress: fromSnapshot(
      snapshot,
      "streetAddress",
      DEFAULT_JOB_FORM_DATA.streetAddress,
    ),
    postalCode: fromSnapshot(
      snapshot,
      "postalCode",
      DEFAULT_JOB_FORM_DATA.postalCode,
    ),
    province: fromSnapshot(
      snapshot,
      "province",
      DEFAULT_JOB_FORM_DATA.province,
    ),
    city: fromSnapshot(snapshot, "city", DEFAULT_JOB_FORM_DATA.city),
    payRange: payRangeFromSnapshot(snapshot, DEFAULT_JOB_FORM_DATA.payRange as number),
    numberOfHires: fromSnapshot(
      snapshot,
      "numberOfHires",
      DEFAULT_JOB_FORM_DATA.numberOfHires,
    ),
    description: fromSnapshot(
      snapshot,
      "description",
      DEFAULT_JOB_FORM_DATA.description,
    ),
    qualification: fromSnapshot(
      snapshot,
      "qualification",
      DEFAULT_JOB_FORM_DATA.qualification,
    ),
    specialization: fromSnapshot(
      snapshot,
      "specialization",
      DEFAULT_JOB_FORM_DATA.specialization,
    ),
    experience: fromSnapshot(
      snapshot,
      "experience",
      DEFAULT_JOB_FORM_DATA.experience,
    ),
    responsibilities: fromSnapshot(
      snapshot,
      "responsibilities",
      DEFAULT_JOB_FORM_DATA.responsibilities,
    ),
    required_skills: fromSnapshot(
      snapshot,
      "required_skills",
      DEFAULT_JOB_FORM_DATA.required_skills,
    ),
    experienceList: fromSnapshot(
      snapshot,
      "experienceList",
      DEFAULT_JOB_FORM_DATA.experienceList,
    ),
    workingConditions: fromSnapshot(
      snapshot,
      "workingConditions",
      DEFAULT_JOB_FORM_DATA.workingConditions,
    ),
    whyJoin: fromSnapshot(snapshot, "whyJoin", DEFAULT_JOB_FORM_DATA.whyJoin),
    questions: fromSnapshot(
      snapshot,
      "questions",
      DEFAULT_JOB_FORM_DATA.questions,
    ),
    fromDate:
      dateFromSnapshot(snapshot, "fromDate") ?? DEFAULT_JOB_FORM_DATA.fromDate,
    tillDate:
      dateFromSnapshot(snapshot, "tillDate") ?? DEFAULT_JOB_FORM_DATA.tillDate,
  };
}

export function NormalJobForm({
  urgencyMode,
  onNext,
  onStepNext,
  onBack,
  formStep = "description",
}: NormalJobFormProps) {
  const setFormSnapshot = useJobsStore((s) => s.setFormSnapshot);
  const formSnapshot = useJobsStore((s) => s.formSnapshot);

  const [formData, setFormData] = useState<JobFormData>(() =>
    buildInitialFormData(urgencyMode, formSnapshot),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<JobFormFieldErrors>({});

  const updateFormData = (updates: Partial<JobFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));

    const currentSnapshot = useJobsStore.getState().formSnapshot;
    clearErrorsForUpdatedFields(updates, setFieldErrors);
    setFormSnapshot(buildNextFormSnapshot(currentSnapshot, updates));
  };

  const convertToBackendFormat = (data: JobFormData): JobCreatePayload => {
    const isNormalJob = urgencyMode === "normal";
    const wantsInterview = data.inPersonInterview === "Yes";

    const normalJobFields: Partial<JobCreatePayload> = isNormalJob
      ? {
          years_of_experience:
            convertExperienceToBackend(data.experience) ?? undefined,
          qualifications: data.qualification?.filter((q) => q?.trim()).length
            ? data.qualification.filter((q) => q?.trim())
            : undefined,
          specializations:
            data.specialization
              ?.filter((s) => s?.trim())
              .map(convertSpecializationToBackend)
              .filter((s): s is string =>
                VALID_SPECIALIZATION_VALUES.has(s),
              ) ?? [],
          ai_interview: wantsInterview ? data.aiInterview === true : false,
          questions: wantsInterview
            ? (data.questions?.filter(Boolean) ?? [])
            : null,
        }
      : {
          years_of_experience: undefined,
          qualifications: [],
          specializations: [],
          ai_interview: false,
          questions: null,
        };

    const raw: Record<string, unknown> = {
      job_title: data.jobTitle ? convertJobTitleToBackend(data.jobTitle) : "",
      department: data.department || undefined,
      status: "OPEN",
      job_type: isNormalJob
        ? (convertJobTypeToBackend(data.jobType) as
            | "casual"
            | "part_time"
            | "full_time")
        : "casual",
      street: data.streetAddress || undefined,
      postal_code: data.postalCode || undefined,
      province: convertProvinceToJobBackend(data.province) || undefined,
      city: data.city || undefined,
      pay_per_hour_cents: (() => {
        const isFullTime =
          data.jobType === "Full Time" || data.jobType === "full_time";
        const isPartTime =
          data.jobType === "Part Time" || data.jobType === "part_time";
        const dollars =
          typeof data.payRange === "number"
            ? data.payRange
            : Array.isArray(data.payRange)
              ? (data.payRange as number[])[1] ?? 0
              : 0;

        if (isFullTime || isPartTime) {
          return dollars > 0 ? Math.round(dollars * 100) : undefined;
        }
        return undefined;
      })(),
      job_urgency: urgencyMode,
      description: data.description || undefined,
      no_of_hires_required: data.numberOfHires
        ? parseInt(data.numberOfHires, 10)
        : 1,
      start_date: formatDateForBackend(data.fromDate),
      end_date:
        data.jobType === "full_time" || data.jobType === "Full Time"
          ? undefined
          : formatDateForBackend(data.tillDate),
      check_in_time: data.fromTime || undefined,
      check_out_time: data.toTime || undefined,
      responsibilities: data.responsibilities?.filter(Boolean) ?? [],
      required_skills: data.required_skills?.filter(Boolean) ?? [],
      experience: data.experienceList?.filter(Boolean) ?? [],
      working_conditions: data.workingConditions?.filter(Boolean) ?? [],
      why_join: data.whyJoin?.filter(Boolean) ?? [],
      ...normalJobFields,
    };

    return Object.fromEntries(
      Object.entries(raw).filter(([, value]) => value !== undefined),
    ) as unknown as JobCreatePayload;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let backendData: JobCreatePayload;
    try {
      backendData = convertToBackendFormat(formData);
    } catch (err) {
      toast.error((err as Error).message || "Could not build job payload.");
      return;
    }

    const validationErrors = validateJobPayload(backendData);
    const scopedValidationErrors = filterValidationErrorsForStep(
      validationErrors,
      formStep,
      {
        ignoreQuestions:
          formData.inPersonInterview === "Yes" ||
          formData.inPersonInterview === true,
      },
    );

    if (formStep === "basic" && scopedValidationErrors.length === 0) {
      setFieldErrors({});
      onStepNext?.();
      return;
    }

    if (scopedValidationErrors.length > 0) {
      const allMessages = scopedValidationErrors.map((v) => v.message);
      setFieldErrors(toFormFieldErrors(scopedValidationErrors));
      toast.error(
        allMessages.length === 1
          ? allMessages[0]
          : `Please fix ${allMessages.length} issues below.`,
      );
      return;
    }
    setFieldErrors({});

    setIsSubmitting(true);

    try {
      if (onNext) onNext(backendData, formData.inPersonInterview === "Yes");
    } catch (err) {
      toast.error((err as Error).message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const title =
    formStep === "basic"
      ? "Step 1 of 2: Basic Info"
      : "Step 2 of 2: Job Description";
  const nextLabel = isSubmitting
    ? "Processing..."
    : formStep === "basic"
      ? "Next"
      : formData.inPersonInterview === "Yes"
        ? "Next: Questions"
        : "Preview Job";

  return (
    <div className="space-y-3 sm:space-y-4">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="bg-white rounded-lg shadow-sm border border-gray-200"
      >
        <div className="p-4 sm:p-6 lg:p-8">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-6 sm:mb-8">
            {title}
          </h2>

          {formStep === "basic" ? (
            <>
              <NormalJobBasicInfo
                formData={formData}
                updateFormData={updateFormData}
                fieldErrors={fieldErrors}
              />
              <NormalJobRequirements
                formData={formData}
                updateFormData={updateFormData}
              />
              <NormalLocationFields
                formData={formData}
                updateFormData={updateFormData}
                fieldErrors={fieldErrors}
              />
            </>
          ) : (
            <DescriptionForm
              formData={formData}
              updateFormData={updateFormData}
              fieldErrors={fieldErrors}
              hideExperienceList
            />
          )}
        </div>

        <div
          className={`
            flex flex-col sm:flex-row
            ${formStep !== "basic" && onBack ? "justify-between" : "justify-end"}
            items-stretch sm:items-center
            gap-2 sm:gap-3
            px-4 sm:px-6 lg:px-8 py-4 sm:py-6
          `}
        >
          {formStep !== "basic" && onBack && (
            <Button
              type="button"
              variant="ghost"
              onClick={onBack}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-4 sm:px-6 h-10 text-sm order-2 sm:order-1 border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="
              w-full sm:w-auto
              bg-[#F4781B] hover:bg-orange-600
              disabled:opacity-60 disabled:cursor-not-allowed
              text-white px-4 sm:px-6 h-10 shadow-sm text-sm
              order-1 sm:order-2
            "
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                {nextLabel}
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

interface NormalStepFieldsProps {
  formData: JobFormData;
  updateFormData: (updates: Partial<JobFormData>) => void;
  fieldErrors?: JobFormFieldErrors;
}

function NormalJobBasicInfo({
  formData,
  updateFormData,
  fieldErrors = {},
}: NormalStepFieldsProps) {
  const isFullTime =
    formData.jobType === "Full Time" || formData.jobType === "full_time";

  const { departments, jobTitlesForDepartment, loading } = useMetadataStore();
  const jobTitles = jobTitlesForDepartment(formData.department ?? "");

  const today = new Date();

  const [showCalendar, setShowCalendar] = useState(false);
  const [showFromTimePicker, setShowFromTimePicker] = useState(false);
  const [showToTimePicker, setShowToTimePicker] = useState(false);

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

  const formatTimeDisplay = (time?: string) => {
    if (!time) return "7:30 am";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const period = hour >= 12 ? "pm" : "am";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
  };

  const handleDepartmentChange = (value: string) => {
    updateFormData({ department: value, jobTitle: "" });
  };

  return (
    <>
      <div className="space-y-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label
              htmlFor="department"
              className="text-sm font-medium text-gray-700"
            >
              Department <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.department}
              onValueChange={handleDepartmentChange}
            >
              <SelectTrigger
                id="department"
                className="w-full border-[#F4781B] focus:ring-[#F4781B] h-11"
              >
                <SelectValue placeholder={loading ? "Loading..." : "Select"} />
              </SelectTrigger>
              <SelectContent>
                {departments.map(({ uuid, label, value }, index) => (
                  <SelectItem key={`${uuid}-${value}-${index}`} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.department && (
              <p className="text-xs text-red-600">{fieldErrors.department}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Job Title <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.jobTitle}
              onValueChange={(value) => updateFormData({ jobTitle: value })}
              disabled={!formData.department || loading}
            >
              <SelectTrigger
                id="job-title"
                className="w-full border-[#F4781B] focus:ring-[#F4781B] h-11"
              >
                <SelectValue placeholder={loading ? "Loading..." : "Select"} />
              </SelectTrigger>
              <SelectContent>
                {jobTitles.map(({ uuid, label, value }, index) => (
                  <SelectItem key={`${uuid}-${value}-${index}`} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.jobTitle && (
              <p className="text-xs text-red-600">{fieldErrors.jobTitle}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Requirements For This Position{" "}
              <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              value={formData.numberOfHires || ""}
              onChange={(e) =>
                updateFormData({ numberOfHires: e.target.value })
              }
              placeholder="5"
              className="h-11"
              required
            />
            {fieldErrors.numberOfHires && (
              <p className="text-xs text-red-600">
                {fieldErrors.numberOfHires}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Job Type <span className="text-red-500">*</span>
              </Label>
              <RadioGroup
                value={formData.jobType}
                onValueChange={(value) => updateFormData({ jobType: value })}
                className="flex gap-4 pt-2"
              >
                {["Part Time", "Full Time"].map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={type}
                      id={type.toLowerCase().replace(" ", "-")}
                      className="border-[#F4781B] text-white data-[state=checked]:bg-[#F4781B] data-[state=checked]:border-[#F4781B]"
                    />
                    <Label
                      htmlFor={type.toLowerCase().replace(" ", "-")}
                      className="font-normal cursor-pointer text-sm text-gray-700"
                    >
                      {type === "Full Time" ? "Full-Time" : type}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              {fieldErrors.jobType && (
                <p className="text-xs text-red-600">{fieldErrors.jobType}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Do you admire to have Interview?{" "}
                <span className="text-red-500">*</span>
              </Label>
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
                className="flex gap-4 pt-2"
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
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Job Start Date <span className="text-red-500">*</span>
            </Label>
            <button
              type="button"
              onClick={() => setShowCalendar(true)}
              className="w-full flex items-center justify-between px-3 py-2.5 border border-gray-300 rounded-md text-sm h-11 hover:bg-gray-50 bg-white text-left"
            >
              <span className="text-gray-600">
                {formatDate(formData.fromDate)}
              </span>
              <CalendarIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
            </button>
            {fieldErrors.fromDate && (
              <p className="text-xs text-red-600">{fieldErrors.fromDate}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              {isFullTime ? "Job End Date (Optional)" : "Job End Date"}{" "}
              {!isFullTime && <span className="text-red-500">*</span>}
            </Label>
            <button
              type="button"
              onClick={() => setShowCalendar(true)}
              className="w-full flex items-center justify-between px-3 py-2.5 border border-gray-300 rounded-md text-sm h-11 hover:bg-gray-50 bg-white text-left"
            >
              <span className="text-gray-600">
                {formatDate(formData.tillDate)}
              </span>
              <CalendarIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
            </button>
            {fieldErrors.tillDate && (
              <p className="text-xs text-red-600">{fieldErrors.tillDate}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Job Check-In Time <span className="text-red-500">*</span>
            </Label>
            <button
              type="button"
              onClick={() => setShowFromTimePicker(true)}
              className="w-full flex items-center justify-between px-3 py-2.5 border border-gray-300 rounded-md text-sm h-11 hover:bg-gray-50 bg-white text-left"
            >
              <span className="text-gray-600">
                {formatTimeDisplay(formData.fromTime)}
              </span>
              <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
            </button>
            {fieldErrors.fromTime && (
              <p className="text-xs text-red-600">{fieldErrors.fromTime}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Job Check-Out Time <span className="text-red-500">*</span>
            </Label>
            <button
              type="button"
              onClick={() => setShowToTimePicker(true)}
              className="w-full flex items-center justify-between px-3 py-2.5 border border-gray-300 rounded-md text-sm h-11 hover:bg-gray-50 bg-white text-left"
            >
              <span className="text-gray-600">
                {formatTimeDisplay(formData.toTime)}
              </span>
              <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
            </button>
            {fieldErrors.toTime && (
              <p className="text-xs text-red-600">{fieldErrors.toTime}</p>
            )}
          </div>
        </div>
      </div>

      {showCalendar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <DateRangePicker
            fromDate={formData.fromDate}
            tillDate={formData.tillDate}
            minDate={today}
            onChange={(from, till) =>
              updateFormData({ fromDate: from, tillDate: till })
            }
            onCancel={() => setShowCalendar(false)}
            onSchedule={() => setShowCalendar(false)}
          />
        </div>
      )}

      {showFromTimePicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <CustomTimePicker
            selectedTime={formData.fromTime}
            onSelect={(time) => updateFormData({ fromTime: time })}
            onCancel={() => setShowFromTimePicker(false)}
            onSelectTime={() => setShowFromTimePicker(false)}
          />
        </div>
      )}

      {showToTimePicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <CustomTimePicker
            selectedTime={formData.toTime}
            onSelect={(time) => updateFormData({ toTime: time })}
            onCancel={() => setShowToTimePicker(false)}
            onSelectTime={() => setShowToTimePicker(false)}
          />
        </div>
      )}
    </>
  );
}

function NormalJobRequirements({
  formData,
  updateFormData,
}: Pick<NormalStepFieldsProps, "formData" | "updateFormData">) {
  const isFullTime =
    formData.jobType === "Full Time" || formData.jobType === "full_time";
  const isPartTime =
    formData.jobType === "Part Time" || formData.jobType === "part_time";

  const experienceValue = formData.experience
    ? parseInt(formData.experience.split("-")[0]) || 4
    : 4;

  const [backendRate, setBackendRate] = useState<number | null>(null);
  const [rateLoading, setRateLoading] = useState(false);
  const [rateError, setRateError] = useState<string | null>(null);

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
        const dollars: number =
          res.data?.data?.recruiter_pay_per_hour ??
          res.data?.recruiter_pay_per_hour ??
          0;
        setBackendRate(dollars);
        updateFormData({ payRange: dollars });
      })
      .catch(() => setRateError("Could not load pay rate for this role"))
      .finally(() => setRateLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.jobTitle, isPartTime]);

  const removeTag = (
    field: "qualification" | "specialization",
    tagToRemove: string,
  ) => {
    updateFormData({
      [field]: (formData[field] ?? []).filter((tag) => tag !== tagToRemove),
    });
  };

  const handleQualificationSelect = (value: string) => {
    if (value && !(formData.qualification ?? []).includes(value)) {
      updateFormData({
        qualification: [...(formData.qualification ?? []), value],
      });
    }
  };

  const handleSpecializationSelect = (value: string) => {
    if (value && !formData.specialization.includes(value)) {
      updateFormData({ specialization: [...formData.specialization, value] });
    }
  };

  return (
    <div className="space-y-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">
            Fixed Hourly Pay per Hire
          </Label>

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
        </div>

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label
            htmlFor="qualification"
            className="text-sm font-medium text-gray-700"
          >
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
                const alreadyAdded = (formData.qualification ?? []).includes(
                  qual,
                );
                return (
                  <SelectItem
                    key={qual}
                    value={qual}
                    disabled={alreadyAdded}
                    className={
                      alreadyAdded ? "opacity-40 cursor-not-allowed" : ""
                    }
                  >
                    {qual}
                    {alreadyAdded && (
                      <span className="ml-2 text-xs text-gray-400">
                        Added
                      </span>
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

        <div className="space-y-3">
          <Label
            htmlFor="specialization"
            className="text-sm font-medium text-gray-700"
          >
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
                    className={
                      alreadyAdded ? "opacity-40 cursor-not-allowed" : ""
                    }
                  >
                    {spec}
                    {alreadyAdded && (
                      <span className="ml-2 text-xs text-gray-400">
                        Added
                      </span>
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

function NormalLocationFields({
  formData,
  updateFormData,
  fieldErrors = {},
}: NormalStepFieldsProps) {
  const provinceOptions = useMetadataStore((state) => state.provinceOptions);

  return (
    <div className="space-y-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label
            htmlFor="street-address"
            className="text-sm font-medium text-gray-700"
          >
            Street Address
          </Label>
          <Input
            id="street-address"
            type="text"
            value={formData.streetAddress || ""}
            onChange={(e) => updateFormData({ streetAddress: e.target.value })}
            placeholder="1234 Maple Street"
            className="h-11"
          />
          {fieldErrors.streetAddress && (
            <p className="text-xs text-red-600">
              {fieldErrors.streetAddress}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="city" className="text-sm font-medium text-gray-700">
            City <span className="text-red-500">*</span>
          </Label>
          <Input
            id="city"
            type="text"
            value={formData.city || ""}
            onChange={(e) => updateFormData({ city: e.target.value })}
            placeholder="Toronto"
            className="h-11"
            required
          />
          {fieldErrors.city && (
            <p className="text-xs text-red-600">{fieldErrors.city}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label
            htmlFor="province"
            className="text-sm font-medium text-gray-700"
          >
            Province
          </Label>
          <Select
            value={formData.province || ""}
            onValueChange={(value) =>
              updateFormData({ province: value as Province })
            }
          >
            <SelectTrigger id="province" className="h-11 border-[#F4781B]">
              <SelectValue placeholder="Select Province" />
            </SelectTrigger>
            <SelectContent>
              {provinceOptions.map((province) => (
                <SelectItem key={province.value} value={province.value}>
                  {province.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldErrors.province && (
            <p className="text-xs text-red-600">{fieldErrors.province}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="country"
            className="text-sm font-medium text-gray-700"
          >
            Country <span className="text-red-500">*</span>
          </Label>
          <Input
            id="country"
            type="text"
            value={formData.country || "Canada"}
            disabled
            className="h-11 bg-gray-50 text-gray-500"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="postal-code"
            className="text-sm font-medium text-gray-700"
          >
            Postal Code <span className="text-red-500">*</span>
          </Label>
          <Input
            id="postal-code"
            type="text"
            value={formData.postalCode || ""}
            onChange={(e) => updateFormData({ postalCode: e.target.value })}
            placeholder="M5H 2N2"
            className="h-11"
            required
          />
          {fieldErrors.postalCode && (
            <p className="text-xs text-red-600">{fieldErrors.postalCode}</p>
          )}
        </div>
      </div>
    </div>
  );
}
