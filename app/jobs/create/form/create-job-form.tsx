// app/jobs/create/form/create-job-form.tsx
"use client";

import { useState } from "react";
import { useJobsStore } from "@/stores/jobs-store";
import type { JobCreatePayload, JobFormData } from "@/Interface/job.types";
import { DEFAULT_JOB_FORM_DATA } from "../../constants/form";
import { BUTTON_LABELS } from "../../constants/messages";
import { JobForm } from "../../components/JobForm";

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
    aiInterview: "Yes", // Add default value
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateFormData = (updates: Partial<JobFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  // app/jobs/create/form/create-job-form.tsx
const convertToBackendFormat = (data: JobFormData): JobCreatePayload => {
  let jobType = data.jobType.toLowerCase().replace(/\s+/g, "");
  if (jobType === "fulltime") jobType = "fulltime";
  else if (jobType === "parttime") jobType = "parttime";
  else if (jobType === "freelancer") jobType = "freelancer";
  else if (jobType === "casual") jobType = "casual";

  return {
    job_title: data.jobTitle,
    department: data.department || null,
    job_type: jobType,
    location: data.location || null,
    pay_range_min: data.payRange[0] || null,
    pay_range_max: data.payRange[1] || null,
    years_of_experience: data.experience || null,
    qualifications: data.qualification.length > 0 ? data.qualification : null,
    specializations: data.specialization.length > 0 ? data.specialization : null,
    job_urgency: urgencyMode,
    ai_interview: data.aiInterview === "Yes", // REQUIRED - must be boolean
    in_person_interview: data.inPersonInterview === "Yes",
    physical_interview: data.physicalInterview === "Yes",
    description: data.description || null,
    questions: null,
    status: "DRAFT",
  };
};


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const backendData = convertToBackendFormat(formData);
      console.log("📤 Sending to backend:", backendData); // Debug log
      
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

  const handlePreview = () => {
    console.log("Preview job:", formData);
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
        onPreview={handlePreview}
        showBackButton={!!onBack}
        showNextButton={!isSubmitting}
        nextLabel={isSubmitting ? "Creating..." : BUTTON_LABELS.NEXT}
      />
    </>
  );
}
