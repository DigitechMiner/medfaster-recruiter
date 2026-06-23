"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useJobsStore, type JobFormSnapshot } from "@/stores/jobs-store";
import { useMetadataStore } from "@/stores/metadataStore";
import type {
  JobCreatePayload,
  JobFormData,
  JobType,
  JobUrgency,
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
import { getExperienceYearsValue } from "../validation/helpers";

type JobTypeOption = { label: string; value: string };

const toJobUrgency = (mode: "normal" | "instant"): JobUrgency =>
  mode === "instant" ? "INSTANT" : "NORMAL";

const getJobTypeValue = (
  jobType: string,
  jobTypeOptions: readonly JobTypeOption[],
): JobType => {
  return (getMetadataValue(jobTypeOptions, jobType) ?? "casual") as JobType;
};

function resolveAiInterviewFromSnapshot(
  snapshot: JobFormSnapshot | null,
): boolean {
  if (snapshot?.ai_interview !== undefined && snapshot?.ai_interview !== null) {
    return snapshot.ai_interview === true;
  }

  const legacyInterview = (
    snapshot as { inPersonInterview?: string | boolean } | null
  )?.inPersonInterview;

  if (legacyInterview === "No" || legacyInterview === false) {
    return false;
  }

  return true;
}

interface NormalJobFormProps {
  urgencyMode: "normal" | "instant";
  onNext?: (payload: JobCreatePayload, wantsInterview: boolean) => void;
  onStepNext?: () => void;
  formStep?: CreateFormStep;
  formId?: string;
  autoSubmitToken?: number;
  onValidationBlocked?: () => void;
  onDescriptionLoadingChange?: (loading: boolean) => void;
}

function buildInitialFormData(
  urgencyMode: "normal" | "instant",
  snapshot: JobFormSnapshot | null,
  jobTypeOptions: readonly JobTypeOption[],
): JobFormData {
  // Defaults for new enums
  const defaultEmploymentType: EmploymentType = "temporary";
  const defaultJobPeriod: JobPeriodOption = "custom_end_date";
  const defaultStaffingType: StaffingType = "standard";
  const defaultShiftDuration: ShiftDurationType = "8_hrs";

  return {
    ...DEFAULT_JOB_FORM_DATA,
    job_urgency: toJobUrgency(urgencyMode),
    ai_interview: resolveAiInterviewFromSnapshot(snapshot),
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
    job_duration_per_day: fromSnapshot(
      snapshot,
      "job_duration_per_day",
      DEFAULT_JOB_FORM_DATA.job_duration_per_day,
    ) as JobFormData["job_duration_per_day"],
    cycle_start_day: fromSnapshot(
      snapshot,
      "cycle_start_day",
      DEFAULT_JOB_FORM_DATA.cycle_start_day,
    ) as JobFormData["cycle_start_day"],
    number_of_teams: fromSnapshot(
      snapshot,
      "number_of_teams",
      DEFAULT_JOB_FORM_DATA.number_of_teams,
    ),
    shift_schedule_details: fromSnapshot(
      snapshot,
      "shift_schedule_details",
      DEFAULT_JOB_FORM_DATA.shift_schedule_details ?? {},
    ),
    schedule_template: fromSnapshot(
      snapshot,
      "schedule_template",
      DEFAULT_JOB_FORM_DATA.schedule_template ?? [],
    ),
    backend_pay_rate: fromSnapshot(
      snapshot,
      "backend_pay_rate",
      DEFAULT_JOB_FORM_DATA.backend_pay_rate,
    ),
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
  onDescriptionLoadingChange,
}: NormalJobFormProps) {
  const setFormSnapshot = useJobsStore((s) => s.setFormSnapshot);
  const formSnapshot = useJobsStore((s) => s.formSnapshot);
  const jobTypeOptions = useMetadataStore((state) => state.jobTypeOptions);

  const [formData, setFormData] = useState<JobFormData>(() =>
    buildInitialFormData(urgencyMode, formSnapshot, jobTypeOptions),
  );
  const formDataRef = useRef(formData);
  formDataRef.current = formData;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<JobFormFieldErrors>({});
  const lastAutoSubmitTokenRef = useRef<number | undefined>(undefined);

  const updateFormData = useCallback((updates: Partial<JobFormData>) => {
    const prev = formDataRef.current;
    const hasChange = (Object.keys(updates) as (keyof JobFormData)[]).some(
      (key) => prev[key] !== updates[key],
    );
    if (!hasChange) return;

    const next = { ...prev, ...updates };
    formDataRef.current = next;
    setFormData(next);

    const currentSnapshot = useJobsStore.getState().formSnapshot;
    clearErrorsForUpdatedFields(updates, setFieldErrors);
    setFormSnapshot(buildNextFormSnapshot(currentSnapshot, updates));
  }, [setFormSnapshot]);

  const convertToBackendFormat = (data: JobFormData): JobCreatePayload => {
    const isNormalJob = urgencyMode === "normal";
    const wantsInterview = data.ai_interview === true;
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
          ai_interview: wantsInterview,
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
      job_urgency: toJobUrgency(urgencyMode),
      description: data.description || undefined,
      no_of_hires_required: data.no_of_hires_required
        ? parseInt(data.no_of_hires_required, 10)
        : 1,
      start_date: formatDateForBackend(data.start_date),
      end_date: isFullTime ? undefined : formatDateForBackend(data.end_date),
      check_in_time:
        data.morning_shift_start ||
        data.check_in_time ||
        undefined,
      check_out_time:
        data.morning_shift_end || data.check_out_time || undefined,
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
      job_duration_per_day: data.job_duration_per_day,
      cycle_start_day: data.cycle_start_day,
      number_of_teams: data.number_of_teams
        ? parseInt(String(data.number_of_teams), 10)
        : undefined,
      shift_schedule_details: data.shift_schedule_details,
      schedule_template: data.schedule_template,
      break_duration_minutes: data.shift_schedule_details?.morning
        ?.break_duration_minutes,
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
        ignoreQuestions: formData.ai_interview === true,
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
      if (onNext) onNext(backendData, formData.ai_interview === true);
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
          onLoadingChange={onDescriptionLoadingChange}
        />
      )}
    </form>
  );
}