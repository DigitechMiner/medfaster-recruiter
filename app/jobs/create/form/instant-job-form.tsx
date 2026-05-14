"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarIcon, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SuccessModal } from "@/components/modal";
import { axiosInstance } from "@/stores/api/api-client";
import { ENDPOINTS } from "@/stores/api/api-endpoints";
import { useJobsStore, type JobFormSnapshot } from "@/stores/jobs-store";
import { useMetadataStore } from "@/stores/metadataStore";
import type { InstantJobFormData, JobCreatePayload, Province } from "@/types";
import {
  toFormFieldErrors,
  validateJobPayload,
} from "../helper/validatePayload";
import { DEFAULT_INSTANT_FORM } from "./constants";
import type { CreateFormStep } from "../helper/types";
import { DateRangePicker } from "../helper/date-picker";
import { CustomTimePicker } from "../helper/time-picker";
import {
  buildNextFormSnapshot,
  clearErrorsForUpdatedFields,
  dateFromSnapshot,
  filterValidationErrorsForStep,
  formatDateForBackend,
  fromSnapshot,
  type JobFormFieldErrors,
} from "../helper/utils";
import { DescriptionForm } from "./description-form";

const DEFAULT_NEIGHBOURHOOD_TYPES = [
  { value: "independent_living", label: "Independent Living" },
  { value: "assisted_living", label: "Assisted Living" },
  { value: "dementia_or_memory_care", label: "Dementia / Memory Care" },
  { value: "complex_dementia_care", label: "Complex Dementia Care" },
  { value: "adult_mental_health", label: "Adult Mental Health" },
];

const CDSW_NEIGHBOURHOOD_TYPES = [
  {
    value: "group_home_community_residential",
    label: "Group Home / Community Residential Home",
  },
  {
    value: "intermediate_care_developmental_disabilities",
    label:
      "Intermediate Care / Community Care Facility for Developmental Disabilities",
  },
  {
    value: "supported_independent_living",
    label: "Supported Independent Living (SIL)",
  },
  {
    value: "board_and_care_adult_foster",
    label: "Board-and-Care / Adult Foster Care Homes",
  },
  {
    value: "specialized_nursing_homes_disabilities",
    label: "Specialized Nursing Homes / Skilled Nursing for Disabilities",
  },
  {
    value: "rehabilitation_stepdown_residential",
    label: "Rehabilitation and Step-down Residential Care Programs",
  },
];

interface InstantJobFormProps {
  urgencyMode: "instant";
  onNext?: (payload: JobCreatePayload) => void;
  onStepNext?: () => void;
  onBack?: () => void;
  formStep?: CreateFormStep;
}

function buildInitialInstantForm(
  snapshot: JobFormSnapshot | null,
): InstantJobFormData {
  return {
    ...DEFAULT_INSTANT_FORM,
    jobTitle: fromSnapshot(snapshot, "jobTitle", DEFAULT_INSTANT_FORM.jobTitle),
    department: fromSnapshot(
      snapshot,
      "department",
      DEFAULT_INSTANT_FORM.department,
    ),
    description: fromSnapshot(
      snapshot,
      "description",
      DEFAULT_INSTANT_FORM.description,
    ),
    numberOfHires: fromSnapshot(
      snapshot,
      "numberOfHires",
      DEFAULT_INSTANT_FORM.numberOfHires,
    ),
    fromTime: fromSnapshot(snapshot, "fromTime", DEFAULT_INSTANT_FORM.fromTime),
    toTime: fromSnapshot(snapshot, "toTime", DEFAULT_INSTANT_FORM.toTime),
    streetAddress: fromSnapshot(
      snapshot,
      "streetAddress",
      DEFAULT_INSTANT_FORM.streetAddress,
    ),
    postalCode: fromSnapshot(
      snapshot,
      "postalCode",
      DEFAULT_INSTANT_FORM.postalCode,
    ),
    province: fromSnapshot(
      snapshot,
      "province",
      DEFAULT_INSTANT_FORM.province as Province,
    ),
    city: fromSnapshot(snapshot, "city", DEFAULT_INSTANT_FORM.city),
    neighborhoodName: fromSnapshot(
      snapshot,
      "neighborhoodName",
      DEFAULT_INSTANT_FORM.neighborhoodName,
    ),
    neighborhoodType: fromSnapshot(
      snapshot,
      "neighborhoodType",
      DEFAULT_INSTANT_FORM.neighborhoodType,
    ),
    directNumber: fromSnapshot(
      snapshot,
      "directNumber",
      DEFAULT_INSTANT_FORM.directNumber,
    ),
    responsibilities: fromSnapshot(
      snapshot,
      "responsibilities",
      DEFAULT_INSTANT_FORM.responsibilities,
    ),
    required_skills: fromSnapshot(
      snapshot,
      "required_skills",
      DEFAULT_INSTANT_FORM.required_skills,
    ),
    workingConditions: fromSnapshot(
      snapshot,
      "workingConditions",
      DEFAULT_INSTANT_FORM.workingConditions,
    ),
    whyJoin: fromSnapshot(snapshot, "whyJoin", DEFAULT_INSTANT_FORM.whyJoin),
    fromDate: dateFromSnapshot(snapshot, "fromDate"),
    tillDate: dateFromSnapshot(snapshot, "tillDate"),
  };
}

export function InstantJobForm({
  onBack,
  onNext,
  onStepNext,
  formStep = "description",
}: InstantJobFormProps) {
  const router = useRouter();
  const createJob = useJobsStore((state) => state.createJob);
  const setFormSnapshot = useJobsStore((s) => s.setFormSnapshot);
  const formSnapshot = useJobsStore((s) => s.formSnapshot);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [fieldErrors, setFieldErrors] =
    useState<JobFormFieldErrors<InstantJobFormData>>({});

  const [payRateCents, setPayRateCents] = useState<number | null>(
    (formSnapshot?.cachedPayRateCents as number) ?? null,
  );
  const [payRateLoading, setPayRateLoading] = useState(false);
  const [payRateError, setPayRateError] = useState<string | null>(null);

  const [formData, setFormData] = useState<InstantJobFormData>(() =>
    buildInitialInstantForm(formSnapshot),
  );

  useEffect(() => {
    if (!formData.jobTitle) {
      setPayRateCents(null);
      setPayRateError(null);
      return;
    }

    setPayRateLoading(true);
    setPayRateError(null);

    axiosInstance
      .get(ENDPOINTS.JOBS_FEES(formData.jobTitle))
      .then((res) => {
        const dollars: number =
          res.data?.data?.recruiter_pay_per_hour ??
          res.data?.recruiter_pay_per_hour ??
          0;

        const cents = Math.round(dollars * 100);

        setPayRateCents(cents);

        const currentSnapshot = useJobsStore.getState().formSnapshot;
        setFormSnapshot({
          ...(currentSnapshot ?? {}),
          cachedPayRateCents: cents,
        } as JobFormSnapshot);
      })
      .catch(() => setPayRateError("Could not load pay rate for this role"))
      .finally(() => setPayRateLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.jobTitle]);

  const updateFormData = (updates: Partial<InstantJobFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));

    const currentSnapshot = useJobsStore.getState().formSnapshot;
    clearErrorsForUpdatedFields(updates, setFieldErrors);
    setFormSnapshot(buildNextFormSnapshot(currentSnapshot, updates));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const jobTitleLabel = (formData.jobTitle ?? "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

    const backendData: JobCreatePayload = {
      job_title: formData.jobTitle ?? "",
      status: "DRAFT",
      job_type: "casual",
      job_urgency: "instant",
      department: formData.department || undefined,
      street: formData.streetAddress || undefined,
      postal_code: formData.postalCode || undefined,
      province: formData.province || undefined,
      city: formData.city || undefined,
      neighborhood_name: formData.neighborhoodName || undefined,
      neighborhood_type: formData.neighborhoodType || undefined,
      direct_number: formData.directNumber || undefined,
      pay_per_hour_cents: payRateCents ?? 0,
      years_of_experience: undefined,
      qualifications: undefined,
      specializations: undefined,
      ai_interview: false,
      questions: undefined,
      description: formData.description || undefined,
      no_of_hires_required: formData.numberOfHires
        ? parseInt(formData.numberOfHires)
        : undefined,
      start_date: formatDateForBackend(formData.fromDate),
      end_date: formatDateForBackend(formData.tillDate),
      check_in_time: formData.fromTime || undefined,
      check_out_time: formData.toTime || undefined,
      responsibilities: formData.responsibilities?.filter(Boolean).length
        ? formData.responsibilities.filter(Boolean)
        : [`Provide ${jobTitleLabel} duties as assigned`],
      required_skills: formData.required_skills?.filter(Boolean).length
        ? formData.required_skills.filter(Boolean)
        : [`Valid ${jobTitleLabel} license or certification`],
      experience: formData.experienceList?.filter(Boolean).length
        ? formData.experienceList.filter(Boolean)
        : ["Relevant clinical experience required"],
      working_conditions: formData.workingConditions?.filter(Boolean).length
        ? formData.workingConditions.filter(Boolean)
        : ["Standard healthcare facility environment"],
      why_join: formData.whyJoin?.filter(Boolean).length
        ? formData.whyJoin.filter(Boolean)
        : ["Competitive hourly pay"],
    };

    const validationErrors = validateJobPayload(backendData);
    const scopedValidationErrors = filterValidationErrorsForStep(
      validationErrors,
      formStep,
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

    if (onNext) {
      setIsSubmitting(false);
      onNext(backendData);
      return;
    }

    try {
      const response = await createJob(backendData);
      if (response.success) {
        sessionStorage.setItem("createdJobId", response.data.id);
        setShowSuccessModal(true);
      } else {
        toast.error(response.message || "Failed to create instant replacement");
      }
    } catch (err) {
      toast.error((err as Error).message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SuccessModal
        visible={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.push("/jobs");
        }}
        title="Job Posted!"
        message="Your instant job post has been created successfully."
        buttonText="Done"
      />

      <div className="space-y-3 sm:space-y-4">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="bg-white rounded-lg shadow-sm border border-gray-200"
        >
          <div className="p-4 sm:p-6 lg:p-8">
            {formStep === "basic" ? (
              <>
                <InstantJobBasicInfo
                  formData={formData}
                  updateFormData={updateFormData}
                  fieldErrors={fieldErrors}
                />
                <InstantJobDetails
                  formData={formData}
                  updateFormData={updateFormData}
                  fieldErrors={fieldErrors}
                  payRateCents={payRateCents}
                  payRateLoading={payRateLoading}
                  payRateError={payRateError}
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
                  {formStep === "basic" ? "Next" : "Preview Job"}
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}

interface InstantStepFieldsProps {
  formData: InstantJobFormData;
  updateFormData: (updates: Partial<InstantJobFormData>) => void;
  fieldErrors?: JobFormFieldErrors<InstantJobFormData>;
}

function InstantJobBasicInfo({
  formData,
  updateFormData,
  fieldErrors = {},
}: InstantStepFieldsProps) {
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
              Job Role <span className="text-red-500">*</span>
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
              Shift Start Date <span className="text-red-500">*</span>
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
              Shift End Date <span className="text-red-500">*</span>
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
              Shift Check-In Time <span className="text-red-500">*</span>
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
              Shift Check-Out Time <span className="text-red-500">*</span>
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

interface InstantJobDetailsProps extends InstantStepFieldsProps {
  payRateCents?: number | null;
  payRateLoading?: boolean;
  payRateError?: string | null;
}

function InstantJobDetails({
  formData,
  updateFormData,
  fieldErrors = {},
  payRateCents = null,
  payRateLoading = false,
  payRateError = null,
}: InstantJobDetailsProps) {
  const { jobTitles, jobTitlesForDepartment, provinceOptions } =
    useMetadataStore();

  const deptTitles = jobTitlesForDepartment(formData.department ?? "");
  const allTitles = deptTitles.length ? deptTitles : jobTitles;
  const selectedTitleLabel =
    allTitles.find((t) => t.value === formData.jobTitle)?.label ?? "";

  const isCDSW =
    selectedTitleLabel
      .toLowerCase()
      .includes("community disability support worker") ||
    selectedTitleLabel.toUpperCase().includes("CDSW");

  const neighbourhoodTypes = isCDSW
    ? CDSW_NEIGHBOURHOOD_TYPES
    : DEFAULT_NEIGHBOURHOOD_TYPES;

  const currentTypeValid = neighbourhoodTypes.some(
    (t) => t.value === formData.neighborhoodType,
  );

  useEffect(() => {
    if (formData.neighborhoodType && !currentTypeValid) {
      updateFormData({ neighborhoodType: "" });
    }
  }, [currentTypeValid, formData.neighborhoodType, updateFormData]);

  const payRateDisplay =
    payRateCents !== null ? `$${(payRateCents / 100).toFixed(2)} / hr` : "-";

  return (
    <div className="space-y-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label
            htmlFor="no-of-hires"
            className="text-sm font-medium text-gray-700"
          >
            Requirements For This Position{" "}
            <span className="text-red-500">*</span>
          </Label>
          <Input
            id="no-of-hires"
            type="number"
            value={formData.numberOfHires || ""}
            onChange={(e) => updateFormData({ numberOfHires: e.target.value })}
            placeholder="5"
            className="h-11"
            required
          />
          {fieldErrors.numberOfHires && (
            <p className="text-xs text-red-600">{fieldErrors.numberOfHires}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="hourly-pay"
            className="text-sm font-medium text-gray-700"
          >
            Hourly Pay per Hire
          </Label>
          <div
            id="hourly-pay"
            className="h-11 flex items-center px-3 border border-gray-200 rounded-md bg-gray-50 text-gray-500 text-sm select-none"
          >
            {payRateLoading && (
              <span className="animate-pulse text-gray-400">Loading...</span>
            )}
            {payRateError && (
              <span className="text-red-500 text-xs">{payRateError}</span>
            )}
            {!payRateLoading && !payRateError && (
              <span
                className={
                  payRateCents !== null
                    ? "font-semibold text-gray-800"
                    : "text-gray-400"
                }
              >
                {formData.jobTitle
                  ? payRateDisplay
                  : "Select a job title first"}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label
            htmlFor="neighborhood-name"
            className="text-sm font-medium text-gray-700"
          >
            Name of Neighborhood
          </Label>
          <Input
            id="neighborhood-name"
            type="text"
            value={formData.neighborhoodName || ""}
            onChange={(e) =>
              updateFormData({ neighborhoodName: e.target.value })
            }
            placeholder="Enter Neighbourhood Name"
            className="h-11"
          />
          {fieldErrors.neighborhoodName && (
            <p className="text-xs text-red-600">
              {fieldErrors.neighborhoodName}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="neighborhood-type"
            className="text-sm font-medium text-gray-700"
          >
            Type of Neighbourhood
            {isCDSW && (
              <span className="ml-2 text-[10px] font-semibold text-[#F4781B] bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded">
                CDSW
              </span>
            )}
          </Label>
          <Select
            value={formData.neighborhoodType || ""}
            onValueChange={(value) =>
              updateFormData({ neighborhoodType: value })
            }
          >
            <SelectTrigger id="neighborhood-type" className="h-11">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {neighbourhoodTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldErrors.neighborhoodType && (
            <p className="text-xs text-red-600">
              {fieldErrors.neighborhoodType}
            </p>
          )}
        </div>
      </div>

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
            <p className="text-xs text-red-600">{fieldErrors.streetAddress}</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label
            htmlFor="province"
            className="text-sm font-medium text-gray-700"
          >
            Province <span className="text-red-500">*</span>
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
              {provinceOptions.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        <div className="space-y-2">
          <Label
            htmlFor="direct-number"
            className="text-sm font-medium text-gray-700"
          >
            Direct Number <span className="text-red-500">*</span>
          </Label>
          <Input
            id="direct-number"
            type="tel"
            value={formData.directNumber || ""}
            onChange={(e) => updateFormData({ directNumber: e.target.value })}
            placeholder="123-456-7890"
            className="h-11"
            required
          />
          {fieldErrors.directNumber && (
            <p className="text-xs text-red-600">{fieldErrors.directNumber}</p>
          )}
        </div>
      </div>
    </div>
  );
}
