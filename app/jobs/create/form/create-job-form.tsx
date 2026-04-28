"use client";

import { useState } from "react";
import type { JobCreatePayload, JobFormData } from "@/Interface/recruiter.types";
import { DEFAULT_JOB_FORM_DATA } from "../../constants/form";
import { BUTTON_LABELS } from "../../constants/messages";
import { JobForm } from "../../components/JobForm";
import metadata, {
  convertJobTypeToBackend,
  convertSpecializationToBackend,
  convertQualificationToBackend,
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

export function CreateJobForm({ urgencyMode, onNext, onBack }: Props) {
  const [formData, setFormData] = useState<JobFormData>({
    ...DEFAULT_JOB_FORM_DATA,
    urgency:           urgencyMode,
    aiInterview:       true,
    inPersonInterview: "Yes",
    fromTime:          "07:30",
    toTime:            "11:30",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError]               = useState<string | null>(null);

  const updateFormData = (updates: Partial<JobFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const convertToBackendFormat = (data: JobFormData): JobCreatePayload => {
    const isNormalJob = urgencyMode === "normal";

    const normalJobFields: Partial<JobCreatePayload> = isNormalJob
      ? {
          years_of_experience: convertExperienceToBackend(data.experience) ?? undefined,
          qualifications: data.qualification
            ?.filter((q) => q?.trim())
            .map(convertQualificationToBackend)
            .filter((q) => Object.values(metadata.qualification_mapping).includes(q)) ?? [],
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
      job_title:  convertJobTitleToBackend(data.jobTitle ?? ""),  // ← WRAP THIS
  department: data.department || undefined,
      status:               "OPEN",
      job_type:             isNormalJob
                              ? convertJobTypeToBackend(data.jobType) as "casual" | "part_time" | "full_time"
                              : "casual",
      street:               data.streetAddress       || undefined,
      postal_code:          data.postalCode          || undefined,
      province:             convertProvinceToJobBackend(data.province) || undefined,
      city:                 data.city                || undefined,

      // ✅ Only send if actually set — never send null to backend
      ...(Array.isArray(data.payRange) && data.payRange[0]
  ? { pay_per_hour_cents: Math.round(Number(data.payRange[0]) * 100) }
  : {}),

      job_urgency:          urgencyMode,
      description:          data.description         || undefined,
      no_of_hires_required: data.numberOfHires ? parseInt(data.numberOfHires, 10) : 1,

      start_date:    formatDateForBackend(data.fromDate),
      // ✅ full_time jobs have no end_date
      end_date:      data.jobType === "full_time" ? undefined : formatDateForBackend(data.tillDate),
      check_in_time: data.fromTime || undefined,
      check_out_time: data.toTime  || undefined,

      responsibilities:   data.responsibilities?.filter(Boolean) ?? [],
      required_skills:    data.required_skills?.filter(Boolean)  ?? [],
      experience:         data.experienceList?.filter(Boolean)    ?? [],
      working_conditions: data.workingConditions?.filter(Boolean) ?? [],
      why_join:        data.whyJoin?.filter(Boolean)         ?? [],

      ...normalJobFields,
    };

    // ✅ Strip all undefined/null before sending — prevents backend crashes
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

      const invalidQuals = validQuals.filter(
        (q) => !Object.keys(metadata.qualification_mapping).includes(q)
      );
      if (invalidQuals.length > 0) {
        setError(
          `Invalid qualification(s): ${invalidQuals.join(", ")}. Please select from the dropdown.`
        );
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