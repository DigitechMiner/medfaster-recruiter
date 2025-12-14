"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useJobsStore } from "@/stores/jobs-store";
import type { JobCreatePayload, JobFormData } from "@/Interface/job.types";
import { DEFAULT_JOB_FORM_DATA } from "../../constants/form";
import { BUTTON_LABELS } from "../../constants/messages";
import { JobForm } from "../../components/JobForm";

interface Props {
  onNext?: () => void;
  onBack?: () => void;
}

export function CreateJobForm({ onNext, onBack }: Props) {
  const router = useRouter();
  const createJob = useJobsStore((state) => state.createJob);
  const [formData, setFormData] = useState<JobFormData>(DEFAULT_JOB_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateFormData = (updates: Partial<JobFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  // Convert frontend format to backend format
  const convertToBackendFormat = (data: JobFormData): JobCreatePayload => {
    // Map job type: "Part Time" -> "parttime", "Full Time" -> "fulltime", "Freelancer" -> "freelancer"
    let jobType = data.jobType.toLowerCase().replace(/\s+/g, '');
    if (jobType === 'fulltime') jobType = 'fulltime';
    else if (jobType === 'parttime') jobType = 'parttime';
    else if (jobType === 'freelancer') jobType = 'freelancer';

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
      urgency: data.urgency.toLowerCase(), // "High" -> "high"
      in_person_interview: data.inPersonInterview === "Yes",
      physical_interview: data.physicalInterview === "Yes",
      description: data.description || null,
      questions: null, // Will be added in step 2
      status: 'draft', // Default to draft
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const backendData = convertToBackendFormat(formData);
      const response = await createJob(backendData);

      if (response.success) {
        // Store job ID for step 2 (questions)
        sessionStorage.setItem('createdJobId', response.data.job.id);
        
        // Go to step 2 (AI questions)
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
    // TODO: Implement preview functionality
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
