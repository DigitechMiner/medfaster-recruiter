"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useJobsStore, type JobFormSnapshot } from "@/stores/jobs-store";
import { useMetadataStore } from "@/stores/metadataStore";
import type {
  JobCreatePayload,
  JobFormData,
  JobType,
  EmploymentType,
  JobPeriodOption,
  StaffingType,
  ShiftDurationType,
  ShiftType,
} from "@/types";
import {
  convertProvinceToJobBackend,
  getMetadataValue,
} from "@/utils/constant/metadata";
import {
  filterValidationErrorsForStep,
  toFormFieldErrors,
  validateJobPayload,
  type CreateFormStep,
  type JobFormFieldErrors,
} from "../validation";
import { DEFAULT_JOB_FORM_DATA } from "./constant";
import {
  buildNextFormSnapshot,
  clearErrorsForUpdatedFields,
  dateFromSnapshot,
  formatDateForBackend,
  fromSnapshot,
  normalizeStringArray,
} from "../form/utils";
import { DescriptionForm } from "../form/description-form";
import { NormalBasicStep } from "./normal-basic-step";

const EXPERIENCE_MIN = 0;
const EXPERIENCE_MAX = 20;

type JobTypeOption = { label: string; value: string };

const getExperienceYearsValue = (experience?: string): number => {
  const rawValue = experience?.split("-")[0] ?? "";
  const parsed = Number.parseInt(rawValue, 10);

  if (!Number.isFinite(parsed)) return EXPERIENCE_MIN;

  return Math.min(EXPERIENCE_MAX, Math.max(EXPERIENCE_MIN, parsed));
};

const getJobTypeValue = (
  jobType: string,
  jobTypeOptions: readonly JobTypeOption[],
): JobType => {
  return (getMetadataValue(jobTypeOptions, jobType) ?? "casual") as JobType;
};

interface NormalJobFormProps {
  urgencyMode: "normal" | "instant";
  onNext?: (payload: JobCreatePayload, wantsInterview: boolean) => void;
  onStepNext?: () => void;
  formStep?: CreateFormStep;
  formId?: string;
  autoSubmitToken?: number;
  onValidationBlocked?: () => void;
}

function buildInitialFormData(
  urgencyMode: "normal" | "instant",
  snapshot: JobFormSnapshot | null,
  jobTypeOptions: readonly JobTypeOption[],
): JobFormData {
  // Defaults for new enums
  const defaultEmploymentType: EmploymentType = "temporary";
  const defaultJobPeriod: JobPeriodOption = "3_months";
  const defaultStaffingType: StaffingType = "standard";
  const defaultShiftDuration: ShiftDurationType = "8_hrs";

  return {
    ...DEFAULT_JOB_FORM_DATA,
    job_urgency: urgencyMode,
    ai_interview: fromSnapshot(snapshot, "ai_interview", true),
    inPersonInterview: fromSnapshot(snapshot, "inPersonInterview", "Yes"),
    check_in_time: fromSnapshot(
      snapshot,
      "check_in_time",
      DEFAULT_JOB_FORM_DATA.check_in_time,
    ),
    check_out_time: fromSnapshot(
      snapshot,
      "check_out_time",
      DEFAULT_JOB_FORM_DATA.check_out_time,
    ),
    job_title: fromSnapshot(
      snapshot,
      "job_title",
      DEFAULT_JOB_FORM_DATA.job_title,
    ),
    department: fromSnapshot(
      snapshot,
      "department",
      DEFAULT_JOB_FORM_DATA.department,
    ),
    job_type: getJobTypeValue(
      fromSnapshot(snapshot, "job_type", DEFAULT_JOB_FORM_DATA.job_type),
      jobTypeOptions,
    ),
    street: fromSnapshot(
      snapshot,
      "street",
      DEFAULT_JOB_FORM_DATA.street,
    ),
    postal_code: fromSnapshot(
      snapshot,
      "postal_code",
      DEFAULT_JOB_FORM_DATA.postal_code,
    ),
    province: fromSnapshot(
      snapshot,
      "province",
      DEFAULT_JOB_FORM_DATA.province,
    ),
    city: fromSnapshot(snapshot, "city", DEFAULT_JOB_FORM_DATA.city),
    no_of_hires_required: fromSnapshot(
      snapshot,
      "no_of_hires_required",
      DEFAULT_JOB_FORM_DATA.no_of_hires_required,
    ),
    description: fromSnapshot(
      snapshot,
      "description",
      DEFAULT_JOB_FORM_DATA.description,
    ),
    qualifications: normalizeStringArray(
      fromSnapshot(
        snapshot,
        "qualifications",
        DEFAULT_JOB_FORM_DATA.qualifications,
      ),
    ),
    specializations: normalizeStringArray(
      fromSnapshot(
        snapshot,
        "specializations",
        DEFAULT_JOB_FORM_DATA.specializations,
      ),
    ),
    years_of_experience: fromSnapshot(
      snapshot,
      "years_of_experience",
      DEFAULT_JOB_FORM_DATA.years_of_experience,
    ),
    responsibilities: normalizeStringArray(
      fromSnapshot(
        snapshot,
        "responsibilities",
        DEFAULT_JOB_FORM_DATA.responsibilities,
      ),
    ),
    required_skills: normalizeStringArray(
      fromSnapshot(
        snapshot,
        "required_skills",
        DEFAULT_JOB_FORM_DATA.required_skills,
      ),
    ),
    experience: normalizeStringArray(
      fromSnapshot(snapshot, "experience", DEFAULT_JOB_FORM_DATA.experience),
    ),
    working_conditions: normalizeStringArray(
      fromSnapshot(
        snapshot,
        "working_conditions",
        DEFAULT_JOB_FORM_DATA.working_conditions,
      ),
    ),
    why_join: normalizeStringArray(
      fromSnapshot(snapshot, "why_join", DEFAULT_JOB_FORM_DATA.why_join),
    ),
    questions: normalizeStringArray(
      fromSnapshot(snapshot, "questions", DEFAULT_JOB_FORM_DATA.questions),
    ),
    start_date:
      dateFromSnapshot(snapshot, "start_date") ??
      DEFAULT_JOB_FORM_DATA.start_date,
    end_date:
      dateFromSnapshot(snapshot, "end_date") ?? DEFAULT_JOB_FORM_DATA.end_date,

    // NEW ENUM-BASED FIELDS
    employment_type: fromSnapshot(
      snapshot,
      "employment_type",
      defaultEmploymentType,
    ) as EmploymentType,
    job_period_option: fromSnapshot(
      snapshot,
      "job_period_option",
      defaultJobPeriod,
    ) as JobPeriodOption,
    staffing_type: fromSnapshot(
      snapshot,
      "staffing_type",
      defaultStaffingType,
    ) as StaffingType,
    shift_duration_type: fromSnapshot(
      snapshot,
      "shift_duration_type",
      defaultShiftDuration,
    ) as ShiftDurationType,
    selected_shift_types:
      normalizeStringArray(
        fromSnapshot(
          snapshot,
          "selected_shift_types",
          DEFAULT_JOB_FORM_DATA.selected_shift_types ?? [],
        ),
      ) as ShiftType[],
  };
}

export function NormalJobForm({
  urgencyMode,
  onNext,
  onStepNext,
  formStep = "description",
  formId,
  autoSubmitToken,
  onValidationBlocked,
}: NormalJobFormProps) {
  const setFormSnapshot = useJobsStore((s) => s.setFormSnapshot);
  const formSnapshot = useJobsStore((s) => s.formSnapshot);
  const jobTypeOptions = useMetadataStore((state) => state.jobTypeOptions);

  const [formData, setFormData] = useState<JobFormData>(() =>
    buildInitialFormData(urgencyMode, formSnapshot, jobTypeOptions),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<JobFormFieldErrors>({});
  const lastAutoSubmitTokenRef = useRef<number | undefined>(undefined);

  const updateFormData = (updates: Partial<JobFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));

    const currentSnapshot = useJobsStore.getState().formSnapshot;
    clearErrorsForUpdatedFields(updates, setFieldErrors);
    setFormSnapshot(buildNextFormSnapshot(currentSnapshot, updates));
  };

  const convertToBackendFormat = (data: JobFormData): JobCreatePayload => {
    const isNormalJob = urgencyMode === "normal";
    const wantsInterview = data.inPersonInterview === "Yes";
    const yearsOfExperience = String(
      getExperienceYearsValue(data.years_of_experience),
    );

    const normalJobFields: Partial<JobCreatePayload> = isNormalJob
      ? {
          years_of_experience: yearsOfExperience,
          qualifications: normalizeStringArray(data.qualifications).filter(
            (q) => q?.trim(),
          ).length
            ? normalizeStringArray(data.qualifications).filter((q) => q?.trim())
            : undefined,
          specializations: normalizeStringArray(data.specializations).filter(
            (s) => s?.trim(),
          ),
          ai_interview: wantsInterview ? data.ai_interview === true : false,
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

    const jobType = getJobTypeValue(data.job_type, jobTypeOptions);
    const isFullTime = jobType === "full_time";

    const raw: Record<string, unknown> = {
      job_title: data.job_title || "",
      department: data.department || undefined,
      status: "OPEN",
      job_type: isNormalJob ? jobType : "casual",
      street: data.street || undefined,
      postal_code: data.postal_code || undefined,
      province: convertProvinceToJobBackend(data.province) || undefined,
      city: data.city || undefined,
      job_urgency: urgencyMode,
      description: data.description || undefined,
      no_of_hires_required: data.no_of_hires_required
        ? parseInt(data.no_of_hires_required, 10)
        : 1,
      start_date: formatDateForBackend(data.start_date),
      end_date: isFullTime ? undefined : formatDateForBackend(data.end_date),
      check_in_time: data.check_in_time || undefined,
      check_out_time: data.check_out_time || undefined,
      responsibilities: normalizeStringArray(data.responsibilities).filter(
        Boolean,
      ),
      required_skills: normalizeStringArray(data.required_skills).filter(
        Boolean,
      ),
      experience: normalizeStringArray(data.experience).filter(Boolean),
      working_conditions: normalizeStringArray(
        data.working_conditions,
      ).filter(Boolean),
      why_join: normalizeStringArray(data.why_join).filter(Boolean),
      ...normalJobFields,

      // NEW ENUM FIELDS INTO PAYLOAD
      employment_type: data.employment_type,
      job_period_option: data.job_period_option,
      staffing_type: data.staffing_type,
      shift_duration_type: data.shift_duration_type,
      selected_shift_types: data.selected_shift_types,
    };

    return Object.fromEntries(
      Object.entries(raw).filter(([, value]) => value !== undefined),
    ) as unknown as JobCreatePayload;
  };

  const submitForm = async () => {
    if (isSubmitting) return;

    let backendData: JobCreatePayload;
    try {
      backendData = convertToBackendFormat(formData);
    } catch (err) {
      toast.error((err as Error).message || "Could not build job payload.");
      onValidationBlocked?.();
      return;
    }

    const validationErrors = validateJobPayload(backendData);

    // For Step 1 (basic), ignore fields that belong to later steps
    let filteredErrors = validationErrors;
    if (formStep === "basic") {
      const ignoreForBasic = new Set([
        "start_date",
        "end_date",
        "check_in_time",
        "check_out_time",
        "description",
        "responsibilities",
        "required_skills",
        "questions",
      ]);
      filteredErrors = validationErrors.filter(
        (err) => !ignoreForBasic.has(err.field),
      );
    }

    const scopedValidationErrors = filterValidationErrorsForStep(
      filteredErrors,
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
      onValidationBlocked?.();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitForm();
  };

  useEffect(() => {
    if (
      autoSubmitToken === undefined ||
      lastAutoSubmitTokenRef.current === autoSubmitToken
    ) {
      return;
    }

    lastAutoSubmitTokenRef.current = autoSubmitToken;
    void submitForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSubmitToken]);

  return (
    <form id={formId} onSubmit={handleSubmit} noValidate className="contents">
      {formStep === "basic" ? (
        <NormalBasicStep
          formData={formData}
          updateFormData={updateFormData}
          fieldErrors={fieldErrors}
        />
      ) : (
        <DescriptionForm
          formData={formData}
          updateFormData={updateFormData}
          fieldErrors={fieldErrors}
          hideExperienceList
        />
      )}
    </form>
  );
}