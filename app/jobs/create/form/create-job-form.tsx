"use client";

import { useState } from "react";
import type { JobCreatePayload, JobFormData } from "@/Interface/recruiter.types";
import type { JobFormSnapshot } from "@/stores/jobs-store";
import { useJobsStore } from "@/stores/jobs-store";
import { DEFAULT_JOB_FORM_DATA } from "../../constants/form";
import { BUTTON_LABELS } from "../../constants/messages";
import { JobForm } from "../../components/JobForm";
import metadata, {
  convertJobTypeToBackend,
  convertSpecializationToBackend,
  convertExperienceToBackend,
  convertProvinceToJobBackend,
  convertJobTitleToBackend,
} from "@/utils/constant/metadata";

interface Props {
  urgencyMode: "normal" | "instant";
  onNext?: (payload: JobCreatePayload) => void;
  onBack?: () => void;
}

const formatDateForBackend = (date?: Date): string | undefined => {
  if (!date) return undefined;
  const year  = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day   = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// ✅ K must exist in BOTH types — prevents indexing errors from snapshot-only fields
function fromSnapshot<K extends keyof JobFormSnapshot & keyof JobFormData>(
  snapshot: JobFormSnapshot | null,
  key: K,
  fallback: JobFormData[K]
): JobFormData[K] {
  if (!snapshot) return fallback;
  const val = snapshot[key];
  return val !== undefined ? (val as JobFormData[K]) : fallback;
}

// ✅ Pure function — reads snapshot, no side effects, safe inside useState initializer
function buildInitialFormData(
  urgencyMode: "normal" | "instant",
  snapshot: JobFormSnapshot | null
): JobFormData {
  return {
    ...DEFAULT_JOB_FORM_DATA,
    urgency:           urgencyMode,
    aiInterview:       fromSnapshot(snapshot, 'aiInterview',       true),
    inPersonInterview: fromSnapshot(snapshot, 'inPersonInterview', "Yes"),
    fromTime:          fromSnapshot(snapshot, 'fromTime',          "07:30"),
    toTime:            fromSnapshot(snapshot, 'toTime',            "11:30"),
    jobTitle:          fromSnapshot(snapshot, 'jobTitle',          DEFAULT_JOB_FORM_DATA.jobTitle),
    department:        fromSnapshot(snapshot, 'department',        DEFAULT_JOB_FORM_DATA.department),
    jobType:           fromSnapshot(snapshot, 'jobType',           DEFAULT_JOB_FORM_DATA.jobType),
    streetAddress:     fromSnapshot(snapshot, 'streetAddress',     DEFAULT_JOB_FORM_DATA.streetAddress),
    postalCode:        fromSnapshot(snapshot, 'postalCode',        DEFAULT_JOB_FORM_DATA.postalCode),
    province:          fromSnapshot(snapshot, 'province',          DEFAULT_JOB_FORM_DATA.province),
    city:              fromSnapshot(snapshot, 'city',              DEFAULT_JOB_FORM_DATA.city),
    payRange:          fromSnapshot(snapshot, 'payRange',          DEFAULT_JOB_FORM_DATA.payRange),
    numberOfHires:     fromSnapshot(snapshot, 'numberOfHires',     DEFAULT_JOB_FORM_DATA.numberOfHires),
    description:       fromSnapshot(snapshot, 'description',       DEFAULT_JOB_FORM_DATA.description),
    qualification:     fromSnapshot(snapshot, 'qualification',     DEFAULT_JOB_FORM_DATA.qualification),
    specialization:    fromSnapshot(snapshot, 'specialization',    DEFAULT_JOB_FORM_DATA.specialization),
    experience:        fromSnapshot(snapshot, 'experience',        DEFAULT_JOB_FORM_DATA.experience),
    responsibilities:  fromSnapshot(snapshot, 'responsibilities',  DEFAULT_JOB_FORM_DATA.responsibilities),
    required_skills:   fromSnapshot(snapshot, 'required_skills',   DEFAULT_JOB_FORM_DATA.required_skills),
    experienceList:    fromSnapshot(snapshot, 'experienceList',    DEFAULT_JOB_FORM_DATA.experienceList),
    workingConditions: fromSnapshot(snapshot, 'workingConditions', DEFAULT_JOB_FORM_DATA.workingConditions),
    whyJoin:           fromSnapshot(snapshot, 'whyJoin',           DEFAULT_JOB_FORM_DATA.whyJoin),
    questions:         fromSnapshot(snapshot, 'questions',         DEFAULT_JOB_FORM_DATA.questions),
    // ✅ Deserialize ISO strings back to Date
    fromDate: snapshot?.fromDate
      ? new Date(snapshot.fromDate)
      : DEFAULT_JOB_FORM_DATA.fromDate,
    tillDate: snapshot?.tillDate
      ? new Date(snapshot.tillDate)
      : DEFAULT_JOB_FORM_DATA.tillDate,
  };
}

export function CreateJobForm({ urgencyMode, onNext, onBack }: Props) {
  const setFormSnapshot = useJobsStore((s) => s.setFormSnapshot);
  const formSnapshot    = useJobsStore((s) => s.formSnapshot);

  // ✅ Pure initializer — no store writes during render
  const [formData, setFormData] = useState<JobFormData>(() =>
    buildInitialFormData(urgencyMode, formSnapshot)
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError]               = useState<string | null>(null);

  const updateFormData = (updates: Partial<JobFormData>) => {
    // ✅ Step 1: pure React state update — no side effects inside updater
    setFormData((prev) => ({ ...prev, ...updates }));

    // ✅ Step 2: sync snapshot to Zustand imperatively — outside React's render cycle
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
    const isNormalJob = urgencyMode === "normal";

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
          ai_interview: data.aiInterview === true,
          questions:    data.questions?.filter(Boolean) ?? [],
        }
      : {
          years_of_experience: undefined,
          qualifications:      [],
          specializations:     [],
          ai_interview:        false,
          questions:           [],
        };

    const raw: Record<string, unknown> = {
      job_title:            convertJobTitleToBackend(data.jobTitle ?? ""),
      department:           data.department || undefined,
      status:               "OPEN",
      job_type:             isNormalJob
                              ? convertJobTypeToBackend(data.jobType) as "casual" | "part_time" | "full_time"
                              : "casual",
      street:               data.streetAddress  || undefined,
      postal_code:          data.postalCode     || undefined,
      province:             convertProvinceToJobBackend(data.province) || undefined,
      city:                 data.city           || undefined,
      pay_per_hour_cents:   Array.isArray(data.payRange) ? data.payRange[1] : 0,
      job_urgency:          urgencyMode,
      description:          data.description   || undefined,
      no_of_hires_required: data.numberOfHires ? parseInt(data.numberOfHires, 10) : 1,
      start_date:           formatDateForBackend(data.fromDate),
      end_date:             data.jobType === "full_time" ? undefined : formatDateForBackend(data.tillDate),
      check_in_time:        data.fromTime      || undefined,
      check_out_time:       data.toTime        || undefined,
      responsibilities:     data.responsibilities?.filter(Boolean)  ?? [],
      required_skills:      data.required_skills?.filter(Boolean)   ?? [],
      experience:           data.experienceList?.filter(Boolean)     ?? [],
      working_conditions:   data.workingConditions?.filter(Boolean)  ?? [],
      why_join:             data.whyJoin?.filter(Boolean)            ?? [],
      ...normalJobFields,
    };

    return Object.fromEntries(
      Object.entries(raw).filter(([, v]) => v !== null && v !== undefined)
    ) as unknown as JobCreatePayload;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (urgencyMode === "normal") {
      const validQuals = formData.qualification?.filter((q) => q?.trim()) ?? [];
      const validSpecs = formData.specialization?.filter((s) => s?.trim()) ?? [];

      if (validQuals.length === 0) {
        setError("Please add at least one qualification");
        return;
      }
      if (validSpecs.length === 0) {
        setError("Please add at least one specialization");
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const backendData = convertToBackendFormat(formData);
      console.log("📦 payload to send:", JSON.stringify(backendData, null, 2));
      if (onNext) onNext(backendData);
    } catch (err) {
      const error = err as Error;
      setError(error.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}
      <JobForm
        mode="create"
        title={urgencyMode === "instant" ? "Create Instant Job Post" : "Create Regular Job Post"}
        formData={formData}
        updateFormData={updateFormData}
        onSubmit={handleSubmit}
        onBack={onBack}
        showBackButton={!!onBack}
        showNextButton={!isSubmitting}
        nextLabel={isSubmitting ? "Creating..." : BUTTON_LABELS.NEXT}
      />
    </>
  );
}