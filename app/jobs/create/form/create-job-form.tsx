"use client";

import { useState } from "react";
import { useJobsStore } from "@/stores/jobs-store";
import type { JobCreatePayload, JobFormData } from "@/Interface/job.types";
import { DEFAULT_JOB_FORM_DATA } from "../../constants/form";
import { BUTTON_LABELS } from "../../constants/messages";
import { JobForm } from "../../components/JobForm";
import {
  convertJobTitleToBackend,
  convertJobTypeToBackend,
  convertSpecializationToBackend,
} from "@/utils/constant/metadata";

interface Props {
  urgencyMode: "normal" | "instant";
  onNext?: () => void;
  onBack?: () => void;
}

export function CreateJobForm({ urgencyMode, onNext, onBack }: Props) {
  const createJob = useJobsStore((state) => state.createJob);

  const [formData, setFormData] = useState<JobFormData>({
    ...DEFAULT_JOB_FORM_DATA,
    urgency: urgencyMode,
    aiInterview: "Yes",
    status: "DRAFT",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateFormData = (updates: Partial<JobFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const convertToBackendFormat = (data: JobFormData): JobCreatePayload => {
    const isNormalJob = urgencyMode === "normal";

    const payload: Partial<JobCreatePayload> = {
      // ✅ Use converter — sends "registered_nurse" not "Registered Nurse"
      job_title:  convertJobTitleToBackend(data.jobTitle),

      department: data.department || null,

      // ✅ Use converter — sends "full_time" not "Full Time"
      job_type:   convertJobTypeToBackend(data.jobType),

      // Location
      street:      data.streetAddress || null,
      postal_code: data.postalCode    || null,
      province:    data.province      || null,
      city:        data.city          || null,

      // Pay range
      pay_range_min: data.payRange[0] || null,
      pay_range_max: data.payRange[1],

      // ✅ Already correct — urgencyMode comes in as "normal"/"instant"
      job_urgency: urgencyMode,

      // Interview settings
      in_person_interview: data.inPersonInterview === "Yes",
      physical_interview:  data.physicalInterview  === "Yes",

      description: data.description || null,
      questions:   null,
      status:      data.status || "DRAFT",
      no_of_hires: data.numberOfHires ? parseInt(data.numberOfHires) : null,
    };

    if (isNormalJob) {
      if (data.experience) {
        payload.years_of_experience = data.experience;
      }

      if (data.qualification?.length > 0) {
        payload.qualifications = data.qualification.filter((q) => q.trim() !== "");
      }

      if (data.specialization?.length > 0) {
        // ✅ Use converter — sends "geriatric_care" not "Geriatric Care"
        payload.specializations = data.specialization
          .filter((s) => s.trim() !== "")
          .map(convertSpecializationToBackend);
      }

      payload.ai_interview = data.aiInterview === "Yes";
    } else {
      if (data.fromDate) payload.start_date = data.fromDate.toISOString();
      if (data.tillDate) payload.end_date   = data.tillDate.toISOString();
      payload.check_in_time  = data.fromTime || null;
      payload.check_out_time = data.toTime   || null;
    }

    return payload as JobCreatePayload;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const backendData = convertToBackendFormat(formData);
      console.log("📤 Sending to backend:", JSON.stringify(backendData, null, 2));

      const response = await createJob(backendData);

      if (response.success) {
        sessionStorage.setItem("createdJobId", response.data.job.id);
        if (onNext) onNext();
      } else {
        setError(response.message || "Failed to create job");
      }
    } catch (err) {
      const error = err as Error;
      console.error("Error creating job:", error);
      setError(error.message || "An error occurred while creating the job");
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
        formData={formData}
        updateFormData={updateFormData}
        onSubmit={handleSubmit}
        onBack={onBack}
        onPreview={() => console.log("Preview:", formData)}
        showBackButton={!!onBack}
        showNextButton={!isSubmitting}
        nextLabel={isSubmitting ? "Creating..." : BUTTON_LABELS.NEXT}
      />
    </>
  );
}
