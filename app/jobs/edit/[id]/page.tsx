"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/global/app-layout";
import { JobForm, JobFormData } from "../../components/JobForm";
import {
  DEFAULT_JOB_FORM_DATA,
  DEFAULT_TOPICS,
  Topic,
} from "../../constants/form";
import SuccessModal from "@/components/modal";

import { useQuestions } from "@/hooks/useQuestions";
import { useJobsStore } from "@/stores/jobs-store";
import type {
  JobBackendResponse,
  JobUpdatePayload,
} from "@/Interface/job.types";
import metadata from "@/utils/constant/metadata";
import {
  convertToFrontendValue,
  convertToBackendValue,
} from "@/utils/constant/jobTypes";
import { useJob, useJobId } from "@/hooks/useJobData";

const JOB_TITLES = metadata.job_title;
const DEPARTMENTS = metadata.department;
const EXPERIENCES = metadata.experience;

export default function EditJobPage() {
  const router = useRouter();
  const jobId = useJobId();
  const { job, isLoading, error } = useJob(jobId);
  const updateJob = useJobsStore((state) => state.updateJob);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] =
    useState<JobFormData>(DEFAULT_JOB_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { topics, setTopics, addQuestion, removeQuestion, updateQuestion } =
    useQuestions(DEFAULT_TOPICS);

  // Helper function to find matching dropdown value or return first option as fallback
  const findMatchingDropdownValue = (
    value: string | null,
    options: string[]
  ): string => {
    if (!value) return options[0] || "";
    // Try exact match first
    if (options.includes(value)) return value;
    // Try case-insensitive match
    const lowerValue = value.toLowerCase();
    const match = options.find((opt) => opt.toLowerCase() === lowerValue);
    if (match) return match;
    // Return first option as fallback
    return options[0] || "";
  };

  // Convert backend job data to frontend form data
const convertBackendToFormData = useCallback(
  (job: JobBackendResponse): JobFormData => {
    const jobType = convertToFrontendValue(job.job_type);

    const jobTitle = findMatchingDropdownValue(job.job_title, JOB_TITLES);
    const department = findMatchingDropdownValue(job.department, DEPARTMENTS);
    const experience = findMatchingDropdownValue(job.years_of_experience, EXPERIENCES);

    return {
      jobTitle,
      department,
      jobType,
      location: job.location || "",
      payRange: [
        job.pay_range_min || 0,
        job.pay_range_max || 0,
      ] as [number, number],
      experience,
      qualification: job.qualifications || [],
      specialization: job.specializations || [],
      urgency: job.job_urgency || "normal",
      inPersonInterview: job.in_person_interview ? "Yes" : "No",
      physicalInterview: job.physical_interview ? "Yes" : "No",
      aiInterview: job.ai_interview ? "Yes" : "No",
      description: job.description || "",
      status: job.status || 'DRAFT',
      
      // Location details
      streetAddress: job.street || undefined,
      postalCode: job.postal_code || undefined,
      province: job.province || undefined,
      city: job.city || undefined,
      country: undefined, // Not in backend
      
      // Date and time fields
      fromDate: job.start_date ? new Date(job.start_date) : undefined,
      tillDate: job.end_date ? new Date(job.end_date) : undefined,
      fromTime: job.check_in_time || undefined,
      toTime: job.check_out_time || undefined,
      
      // Other fields
      numberOfHires: job.no_of_hires?.toString() || undefined,
    };
  },
  []
);
  // Convert backend questions to topics format
  const convertQuestionsToTopics = (
    questions: Record<string, { title: string; questions: string[] }> | null
  ): Topic[] => {
    if (!questions) return DEFAULT_TOPICS;

    return Object.entries(questions).map(([topicId, topicData], index) => {
      return {
        id: topicId || String(index + 1),
        title: topicData.title || `Questions Topic ${index + 1}`,
        questions: topicData.questions.map((q, qIndex) => ({
          id: `${topicId}-${qIndex + 1}`,
          text: q,
        })),
      };
    });
  };

  // Populate form when job loads
  useEffect(() => {
    if (job) {
      setFormData(convertBackendToFormData(job));
      if (job.questions) {
        const convertedTopics = convertQuestionsToTopics(job.questions);
        setTopics(convertedTopics);
      }
    }
  }, [job, setTopics, convertBackendToFormData]);

  const updateFormData = (updates: Partial<JobFormData>) => {
    setFormData((prev: JobFormData) => ({ ...prev, ...updates }));
  };

  // Convert frontend format to backend format
const convertToBackendFormat = (
  data: JobFormData,
  questionsData: Record<string, { title: string; questions: string[] }>
): JobUpdatePayload => {
  const jobType = convertToBackendValue(data.jobType);
  const isNormalJob = data.urgency === 'normal';

  console.log('🔍 CONVERSION START:', {
    urgency: data.urgency,
    isNormalJob,
    qualification: data.qualification,
    specialization: data.specialization,
  });

  // Build the base payload
  const payload: Record<string, any> = {
    job_title: data.jobTitle,
    department: data.department || null,
    job_type: jobType,
    street: data.streetAddress || null,
    postal_code: data.postalCode || null,
    province: data.province || null,
    city: data.city || null,
    pay_range_min: data.payRange[0] || null,
    pay_range_max: data.payRange[1] || null,
    job_urgency: data.urgency,
    in_person_interview: data.inPersonInterview === "Yes",
    physical_interview: data.physicalInterview === "Yes",
    description: data.description || null,
    questions: questionsData,
    status: data.status,
  };

  // Add number of hires if provided
  if (data.numberOfHires && data.numberOfHires.trim() !== '') {
    const parsed = parseInt(data.numberOfHires);
    if (!isNaN(parsed)) {
      payload.no_of_hires = parsed;
    }
  }

  if (isNormalJob) {
    console.log('📝 Processing NORMAL job');
    
    // Years of experience
    if (data.experience && data.experience.trim() !== '') {
      payload.years_of_experience = data.experience;
    }

    // Qualifications - filter and only add if has valid items
    if (Array.isArray(data.qualification)) {
      const validQualifications = data.qualification.filter(
        q => q && typeof q === 'string' && q.trim() !== ''
      );
      
      if (validQualifications.length > 0) {
        payload.qualifications = validQualifications;
        console.log('✅ Added qualifications:', validQualifications);
      } else {
        console.log('⚠️ No valid qualifications, field will be omitted');
      }
    }

    // Specializations - filter and only add if has valid items
    if (Array.isArray(data.specialization)) {
      const validSpecializations = data.specialization.filter(
        s => s && typeof s === 'string' && s.trim() !== ''
      );
      
      if (validSpecializations.length > 0) {
        payload.specializations = validSpecializations;
        console.log('✅ Added specializations:', validSpecializations);
      } else {
        console.log('⚠️ No valid specializations, field will be omitted');
      }
    }

    // AI interview - required for normal jobs
    payload.ai_interview = data.aiInterview === "Yes";

  } else {
    console.log('⚡ Processing INSTANT job');
    
    // Instant job fields
    if (data.fromDate) {
      payload.start_date = data.fromDate.toISOString();
    }
    if (data.tillDate) {
      payload.end_date = data.tillDate.toISOString();
    }
    if (data.fromTime) {
      payload.check_in_time = data.fromTime;
    }
    if (data.toTime) {
      payload.check_out_time = data.toTime;
    }
  }

  console.log('📤 FINAL PAYLOAD:', JSON.stringify(payload, null, 2));
  console.log('📋 Has qualifications?', 'qualifications' in payload);
  console.log('📋 Has specializations?', 'specializations' in payload);

  return payload as JobUpdatePayload;
};


  // Convert topics to backend questions format
  const convertTopicsToBackendFormat = (
    topics: Topic[]
  ): Record<string, { title: string; questions: string[] }> => {
    const questionsObject: Record<
      string,
      { title: string; questions: string[] }
    > = {};

    topics.forEach((topic) => {
      questionsObject[topic.id] = {
        title: topic.title,
        questions: topic.questions
          .map((q) => q.text)
          .filter((text) => text.trim() !== ""),
      };
    });

    return questionsObject;
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!jobId) {
    setSubmitError("Job ID not found");
    return;
  }

  // Validate normal job requirements
  if (formData.urgency === 'normal') {
    const validQualifications = formData.qualification?.filter(q => q && q.trim() !== '') || [];
    const validSpecializations = formData.specialization?.filter(s => s && s.trim() !== '') || [];
    
    if (validQualifications.length === 0) {
      setSubmitError("Please add at least one qualification for normal jobs");
      return;
    }
    
    if (validSpecializations.length === 0) {
      setSubmitError("Please add at least one specialization for normal jobs");
      return;
    }
  }

  setIsSubmitting(true);
  setSubmitError(null);

  try {
    const questionsData = convertTopicsToBackendFormat(topics);
    const backendData = convertToBackendFormat(formData, questionsData);
    const response = await updateJob(jobId, backendData);

    if (response.success) {
      setShowSuccessModal(true);
    } else {
      setSubmitError(response.message || "Failed to update job");
    }
  } catch (err) {
    const error = err as Error;
    console.error("Error updating job:", error);
    setSubmitError(
      error.message || "An error occurred while updating the job"
    );
  } finally {
    setIsSubmitting(false);
  }
};


  const handleCancel = () => {
    router.push(`/jobs/${jobId}`);
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    router.push(`/jobs/${jobId}`);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </AppLayout>
    );
  }

  if (error || !job) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <p className="text-red-600">{error || "Job not found"}</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {submitError}
        </div>
      )}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Edit Job post
        </h1>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={handleCancel}
            disabled={isSubmitting}
            className="flex-1 sm:flex-none px-8 py-2 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 bg-white font-medium text-sm rounded-sm disabled:opacity-50"
          >
            Preview
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 sm:flex-none px-2 py-2 bg-[#F4781B] hover:bg-orange-600 text-white font-medium text-sm rounded-sm disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save & continue"}
          </button>
        </div>
      </div>

      <JobForm
        mode="edit"
        formData={formData}
        updateFormData={updateFormData}
        topics={topics}
        onAddQuestion={addQuestion}
        onRemoveQuestion={removeQuestion}
        onUpdateQuestion={updateQuestion}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        showInterviewQuestions={true}
        showBackButton={true}
        submitLabel={isSubmitting ? "Saving..." : "Save"}
      />

      <SuccessModal
        visible={showSuccessModal}
        onClose={handleSuccessClose}
        title="Job updated successfully"
        message={`${job.job_title} - Job ID: ${jobId} is now live and ready for applicants.`}
        buttonText="Done"
      />
    </AppLayout>
  );
}
