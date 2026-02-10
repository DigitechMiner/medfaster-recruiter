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
    aiInterview: "Yes",
    status: 'DRAFT', // Add default status
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateFormData = (updates: Partial<JobFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const convertToBackendFormat = (data: JobFormData): JobCreatePayload => {
    let jobType = data.jobType.toLowerCase().replace(/\s+/g, "");
    if (jobType === "fulltime") jobType = "fulltime";
    else if (jobType === "parttime") jobType = "parttime";
    else if (jobType === "freelancer") jobType = "freelancer";
    else if (jobType === "casual") jobType = "casual";

    const isNormalJob = urgencyMode === 'normal';
    
    // Build base payload
    const payload: Partial<JobCreatePayload> = {
      job_title: data.jobTitle,
      department: data.department || null,
      job_type: jobType,
      location: data.location || null,
      
      // Location details
      street: data.streetAddress || null,
      postal_code: data.postalCode || null,
      province: data.province || null,
      city: data.city || null,
      
      // Pay range
      pay_range_min: data.payRange[0] || null,
      pay_range_max: data.payRange[1] || null,
      
      // Job urgency
      job_urgency: urgencyMode,
      
      // Interview settings
      in_person_interview: data.inPersonInterview === "Yes",
      physical_interview: data.physicalInterview === "Yes",
      
      // Other fields
      description: data.description || null,
      questions: null,
      status: data.status || 'DRAFT',
      no_of_hires: data.numberOfHires ? parseInt(data.numberOfHires) : null,
    };

    // Add fields specific to job urgency type
    if (isNormalJob) {
      // Normal job fields - only add if they exist
      if (data.experience) {
        payload.years_of_experience = data.experience;
      }
      
      // Only add qualifications if array has items
      if (data.qualification && data.qualification.length > 0) {
        const validQualifications = data.qualification.filter(q => q.trim() !== '');
        if (validQualifications.length > 0) {
          payload.qualifications = validQualifications;
        }
      }
      
      // Only add specializations if array has items
      if (data.specialization && data.specialization.length > 0) {
        const validSpecializations = data.specialization.filter(s => s.trim() !== '');
        if (validSpecializations.length > 0) {
          payload.specializations = validSpecializations;
        }
      }
      
      // AI interview is required for normal jobs
      payload.ai_interview = data.aiInterview === "Yes";
    } else {
      // Instant job fields - required for instant jobs
      if (data.fromDate) {
        payload.start_date = data.fromDate.toISOString();
      }
      if (data.tillDate) {
        payload.end_date = data.tillDate.toISOString();
      }
      payload.check_in_time = data.fromTime || null;
      payload.check_out_time = data.toTime || null;
    }

    return payload as JobCreatePayload;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const backendData = convertToBackendFormat(formData);
      
      // Debug logs
      console.log("📤 Sending to backend:", JSON.stringify(backendData, null, 2));
      console.log("Job urgency:", backendData.job_urgency);
      console.log("Qualifications:", backendData.qualifications);
      console.log("Specializations:", backendData.specializations);
      
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
