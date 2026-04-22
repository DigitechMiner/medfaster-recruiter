"use client";

import { useState } from "react";
import type { JobCreatePayload, JobFormData } from "@/Interface/job.types";
import { DEFAULT_JOB_FORM_DATA } from "../../constants/form";
import { BUTTON_LABELS } from "../../constants/messages";
import { JobForm } from "../../components/JobForm";
import metadata, {
  convertJobTitleToBackend,
  convertJobTypeToBackend,
  convertSpecializationToBackend,
  convertQualificationToBackend,
  convertExperienceToBackend,
  convertProvinceToJobBackend,
} from "@/utils/constant/metadata";

interface Props {
  urgencyMode: "normal" | "instant";
  onNext?: (payload: JobCreatePayload) => void;  // ← changed: passes payload, not jobId
  onBack?: () => void;
}

const formatDateForBackend = (date?: Date): string | null => {
  if (!date) return null;
  const year  = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day   = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function CreateJobForm({ urgencyMode, onNext, onBack }: Props) {
  const [formData, setFormData] = useState<JobFormData>({
    ...DEFAULT_JOB_FORM_DATA,
    urgency:           urgencyMode,
    aiInterview:       "Yes",
    inPersonInterview: "Yes",
    status:            "DRAFT",
    fromTime:          "07:30",
    toTime:            "07:30",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError]               = useState<string | null>(null);

  const updateFormData = (updates: Partial<JobFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

 const convertToBackendFormat = (data: JobFormData): JobCreatePayload => {
  const isNormalJob = urgencyMode === 'normal';

  // ── Optional fields built separately ───────────────────
  const normalJobFields: Partial<JobCreatePayload> = isNormalJob
    ? {
        years_of_experience: convertExperienceToBackend(data.experience) ?? null,
        qualifications: data.qualification
          ?.filter((q) => q?.trim())
          .map(convertQualificationToBackend)
          .filter((q) => Object.values(metadata.qualification_mapping).includes(q)) ?? null,
        specializations: data.specialization
          ?.filter((s) => s?.trim())
          .map(convertSpecializationToBackend)
          .filter((s) => Object.values(metadata.specialization_mapping).includes(s)) ?? null,
        ai_interview: false,
        questions:    null,
      }
    : {
        years_of_experience: null,
        qualifications:      [],
        specializations:     [],
        ai_interview:        false,
        questions:           null,
      };

  // ── Required + optional base fields ────────────────────
  return {
    job_title:   convertJobTitleToBackend(data.jobTitle),
    status:      'DRAFT',
    department:  data.department  || null,
job_type: isNormalJob
  ? convertJobTypeToBackend(data.jobType) as 'casual' | 'part_time' | 'full_time'
  : 'casual',
    street:      data.streetAddress || null,
    postal_code: data.postalCode    || null,
    province:    convertProvinceToJobBackend(data.province) as string | null,
    city:        data.city          || null,
    pay_per_hour_cents:   data.payRange[0] ? Math.round(data.payRange[0] * 100) : null,
    job_urgency:          urgencyMode,
    description:          data.description || null,
    no_of_hires_required: data.numberOfHires ? parseInt(data.numberOfHires) : undefined,
    start_date:           formatDateForBackend(data.fromDate),
    end_date:             formatDateForBackend(data.tillDate),
    check_in_time:        data.fromTime || null,
    check_out_time:       data.toTime   || null,
    ...normalJobFields,
  };
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
        setError(`Invalid qualification(s): ${invalidQuals.join(", ")}. Please select from the dropdown.`);
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const backendData = convertToBackendFormat(formData);
      // ✅ No API call here — just pass payload up to page.tsx
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