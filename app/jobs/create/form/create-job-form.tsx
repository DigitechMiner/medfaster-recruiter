"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import type { JobCreatePayload, JobFormData } from "@/Interface/recruiter.types";
import type { JobFormSnapshot } from "@/stores/jobs-store";
import { useJobsStore } from "@/stores/jobs-store";
import { DEFAULT_JOB_FORM_DATA } from "../../constants/form";
import { JobForm } from "../../components/JobForm";
import { validateJobPayload, toFormFieldErrors } from "../../utils/validate-job-payload";
import metadata, {
  convertJobTypeToBackend,
  convertSpecializationToBackend,
  convertExperienceToBackend,
  convertProvinceToJobBackend,
  convertJobTitleToBackend,
} from "@/utils/constant/metadata";

interface Props {
  urgencyMode: "normal" | "instant";
  onNext?: (payload: JobCreatePayload, wantsInterview: boolean) => void;
  onBack?: () => void;
}

const formatDateForBackend = (date?: Date): string | undefined => {
  if (!date) return undefined;
  const year  = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day   = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function fromSnapshot<K extends keyof JobFormSnapshot & keyof JobFormData>(
  snapshot: JobFormSnapshot | null,
  key: K,
  fallback: JobFormData[K]
): JobFormData[K] {
  if (!snapshot) return fallback;
  const val = snapshot[key];
  return val !== undefined ? (val as JobFormData[K]) : fallback;
}

function buildInitialFormData(
  urgencyMode: "normal" | "instant",
  snapshot: JobFormSnapshot | null
): JobFormData {
  return {
    ...DEFAULT_JOB_FORM_DATA,
    urgency:           urgencyMode,
    aiInterview:       fromSnapshot(snapshot, "aiInterview",       true),
    inPersonInterview: fromSnapshot(snapshot, "inPersonInterview", "Yes"),
    fromTime:          fromSnapshot(snapshot, "fromTime",          "07:30"),
    toTime:            fromSnapshot(snapshot, "toTime",            "11:30"),
    jobTitle:          fromSnapshot(snapshot, "jobTitle",          DEFAULT_JOB_FORM_DATA.jobTitle),
    department:        fromSnapshot(snapshot, "department",        DEFAULT_JOB_FORM_DATA.department),
    jobType:           fromSnapshot(snapshot, "jobType",           DEFAULT_JOB_FORM_DATA.jobType),
    streetAddress:     fromSnapshot(snapshot, "streetAddress",     DEFAULT_JOB_FORM_DATA.streetAddress),
    postalCode:        fromSnapshot(snapshot, "postalCode",        DEFAULT_JOB_FORM_DATA.postalCode),
    province:          fromSnapshot(snapshot, "province",          DEFAULT_JOB_FORM_DATA.province),
    city:              fromSnapshot(snapshot, "city",              DEFAULT_JOB_FORM_DATA.city),
    payRange: (() => {
      const snapshotVal = snapshot?.payRange;
      if (typeof snapshotVal === "number" && snapshotVal > 0) return snapshotVal;
      if (Array.isArray(snapshotVal) && (snapshotVal as number[])[1] > 0) return (snapshotVal as number[])[1];
      return DEFAULT_JOB_FORM_DATA.payRange;
    })(),
    numberOfHires:     fromSnapshot(snapshot, "numberOfHires",     DEFAULT_JOB_FORM_DATA.numberOfHires),
    description:       fromSnapshot(snapshot, "description",       DEFAULT_JOB_FORM_DATA.description),
    qualification:     fromSnapshot(snapshot, "qualification",     DEFAULT_JOB_FORM_DATA.qualification),
    specialization:    fromSnapshot(snapshot, "specialization",    DEFAULT_JOB_FORM_DATA.specialization),
    experience:        fromSnapshot(snapshot, "experience",        DEFAULT_JOB_FORM_DATA.experience),
    responsibilities:  fromSnapshot(snapshot, "responsibilities",  DEFAULT_JOB_FORM_DATA.responsibilities),
    required_skills:   fromSnapshot(snapshot, "required_skills",   DEFAULT_JOB_FORM_DATA.required_skills),
    experienceList:    fromSnapshot(snapshot, "experienceList",    DEFAULT_JOB_FORM_DATA.experienceList),
    workingConditions: fromSnapshot(snapshot, "workingConditions", DEFAULT_JOB_FORM_DATA.workingConditions),
    whyJoin:           fromSnapshot(snapshot, "whyJoin",           DEFAULT_JOB_FORM_DATA.whyJoin),
    questions:         fromSnapshot(snapshot, "questions",         DEFAULT_JOB_FORM_DATA.questions),
    fromDate: snapshot?.fromDate ? new Date(snapshot.fromDate) : DEFAULT_JOB_FORM_DATA.fromDate,
    tillDate: snapshot?.tillDate ? new Date(snapshot.tillDate) : DEFAULT_JOB_FORM_DATA.tillDate,
  };
}

export function CreateJobForm({ urgencyMode, onNext, onBack }: Props) {
  const setFormSnapshot = useJobsStore((s) => s.setFormSnapshot);
  const formSnapshot    = useJobsStore((s) => s.formSnapshot);

  const [formData, setFormData] = useState<JobFormData>(() =>
    buildInitialFormData(urgencyMode, formSnapshot)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  // ✅ Field-level validation errors — passed to JobBasicInfo for inline display
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof JobFormData, string>>>({});

  const updateFormData = (updates: Partial<JobFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));

    // ✅ Clear field errors for updated fields as user corrects them
    if (Object.keys(updates).some((k) => k in fieldErrors)) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        Object.keys(updates).forEach((k) => delete next[k as keyof JobFormData]);
        return next;
      });
    }

    const currentSnapshot = useJobsStore.getState().formSnapshot;
    const nextSnapshot: JobFormSnapshot = {
      ...(currentSnapshot ?? {}),
      ...updates,
      fromDate: updates.fromDate instanceof Date
        ? updates.fromDate.toISOString()
        : (updates.fromDate !== undefined ? (updates.fromDate as string) : currentSnapshot?.fromDate),
      tillDate: updates.tillDate instanceof Date
        ? updates.tillDate.toISOString()
        : (updates.tillDate !== undefined ? (updates.tillDate as string) : currentSnapshot?.tillDate),
    } as JobFormSnapshot;

    setFormSnapshot(nextSnapshot);
  };

  const convertToBackendFormat = (data: JobFormData): JobCreatePayload => {
    const isNormalJob    = urgencyMode === "normal";
    const wantsInterview = data.inPersonInterview === "Yes";

    const normalJobFields: Partial<JobCreatePayload> = isNormalJob
      ? {
          years_of_experience: convertExperienceToBackend(data.experience) ?? undefined,
          qualifications: data.qualification?.filter((q) => q?.trim()).length
            ? data.qualification.filter((q) => q?.trim())
            : undefined,
          specializations: data.specialization
            ?.filter((s) => s?.trim())
            .map(convertSpecializationToBackend)
            .filter((s) => Object.values(metadata.specialization_mapping).includes(s)) ?? [],
          ai_interview: wantsInterview ? (data.aiInterview === true) : false,
          questions: wantsInterview ? (data.questions?.filter(Boolean) ?? []) : null,
        }
      : {
          years_of_experience: undefined,
          qualifications:      [],
          specializations:     [],
          ai_interview:        false,
          questions:           null,
        };

    const raw: Record<string, unknown> = {
      job_title:   convertJobTitleToBackend(data.jobTitle ?? ""),
      department:  data.department || undefined,
      status:      "OPEN",
      job_type:    isNormalJob
                     ? convertJobTypeToBackend(data.jobType) as "casual" | "part_time" | "full_time"
                     : "casual",
      street:      data.streetAddress || undefined,
      postal_code: data.postalCode    || undefined,
      province:    convertProvinceToJobBackend(data.province) || undefined,
      city:        data.city          || undefined,
      pay_per_hour_cents: (() => {
        const isFullTime = data.jobType === "Full Time" || data.jobType === "full_time";
        const isPartTime = data.jobType === "Part Time" || data.jobType === "part_time";
        const dollars = typeof data.payRange === "number" ? data.payRange
          : Array.isArray(data.payRange) ? (data.payRange as number[])[1] ?? 0
          : 0;
        if (isFullTime || isPartTime) {
          return dollars > 0 ? Math.round(dollars * 100) : undefined;
        }
        return undefined;
      })(),
      job_urgency:          urgencyMode,
      description:          data.description || undefined,
      no_of_hires_required: data.numberOfHires ? parseInt(data.numberOfHires, 10) : 1,
      start_date:           formatDateForBackend(data.fromDate),
      end_date:             data.jobType === "full_time" || data.jobType === "Full Time"
                              ? undefined
                              : formatDateForBackend(data.tillDate),
      check_in_time:      data.fromTime || undefined,
      check_out_time:     data.toTime   || undefined,
      responsibilities:   data.responsibilities?.filter(Boolean)  ?? [],
      required_skills:    data.required_skills?.filter(Boolean)   ?? [],
      experience:         data.experienceList?.filter(Boolean)     ?? [],
      working_conditions: data.workingConditions?.filter(Boolean)  ?? [],
      why_join:           data.whyJoin?.filter(Boolean)            ?? [],
      ...normalJobFields,
    };

    return Object.fromEntries(
      Object.entries(raw).filter(([, v]) => v !== undefined)
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

    // ── Run shared validator (mirrors backend `validateCreateJob`) ──────────
    const validationErrors = validateJobPayload(backendData);
    if (validationErrors.length > 0) {
      const allMessages = validationErrors.map((v) => v.message);
      setFieldErrors(toFormFieldErrors(validationErrors));
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

  return (
    <>
      <JobForm
        mode="create"
        title={urgencyMode === "instant" ? "Create Instant Job Post" : "Create Regular Job Post"}
        formData={formData}
        updateFormData={updateFormData}
        onSubmit={handleSubmit}
        onBack={onBack}
        showBackButton={!!onBack}
        isSubmitting={isSubmitting}
        fieldErrors={fieldErrors}  // ✅ passed down for inline error display
        nextLabel={
          isSubmitting
            ? "Processing..."
            : formData.inPersonInterview === "Yes"
            ? "Next"
            : "Create Job Post"
        }
      />
    </>
  );
}