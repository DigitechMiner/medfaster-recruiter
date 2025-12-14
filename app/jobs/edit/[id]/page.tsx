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
import { useJobId, useJob } from "../../hooks/useJobData";
import { useQuestions } from "../../hooks/useQuestions";
import { recruiterService } from "@/services/recruiterService";
import type { JobBackendResponse, JobUpdatePayload } from "@/Interface/job.types";
import { JOB_TITLES, DEPARTMENTS, EXPERIENCES } from "../../constants/form";
import { convertToFrontendValue, convertToBackendValue } from "@/constants/jobTypes";

export default function EditJobPage() {
  const router = useRouter();
  const jobId = useJobId();
  const { job, isLoading, error } = useJob(jobId);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState<JobFormData>(DEFAULT_JOB_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { topics, setTopics, addQuestion, removeQuestion, updateQuestion } = useQuestions(DEFAULT_TOPICS);

  // Helper function to find matching dropdown value or return first option as fallback
  const findMatchingDropdownValue = (value: string | null, options: string[]): string => {
    if (!value) return options[0] || "";
    // Try exact match first
    if (options.includes(value)) return value;
    // Try case-insensitive match
    const lowerValue = value.toLowerCase();
    const match = options.find(opt => opt.toLowerCase() === lowerValue);
    if (match) return match;
    // Return first option as fallback
    return options[0] || "";
  };

  // Convert backend job data to frontend form data
  const convertBackendToFormData = useCallback((job: JobBackendResponse): JobFormData => {
    // Convert job_type from backend value to frontend display value
    const jobType = convertToFrontendValue(job.job_type);

    // Map urgency: backend uses lowercase, frontend uses capitalized
    let urgency = "High";
    if (job.urgency) {
      const urgencyLower = job.urgency.toLowerCase();
      if (urgencyLower === 'high') urgency = "High";
      else if (urgencyLower === 'medium') urgency = "Medium";
      else if (urgencyLower === 'low') urgency = "Low";
    }

    // Map job title to dropdown options
    const jobTitle = findMatchingDropdownValue(job.job_title, JOB_TITLES);
    
    // Map department to dropdown options
    const department = findMatchingDropdownValue(job.department, DEPARTMENTS);
    
    // Map experience to dropdown options
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
      urgency,
      inPersonInterview: job.in_person_interview ? "Yes" : "No",
      physicalInterview: job.physical_interview ? "Yes" : "No",
      description: job.description || "",
    };
  }, []);

  // Convert backend questions to topics format
  const convertQuestionsToTopics = (questions: Record<string, { title: string; questions: string[] }> | null): Topic[] => {
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
  const convertToBackendFormat = (data: JobFormData, questionsData: Record<string, { title: string; questions: string[] }>): JobUpdatePayload => {
    // Convert frontend job type value to backend value
    const jobType = convertToBackendValue(data.jobType);

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
      urgency: data.urgency.toLowerCase(),
      in_person_interview: data.inPersonInterview === "Yes",
      physical_interview: data.physicalInterview === "Yes",
      description: data.description || null,
      questions: questionsData,
    };
  };

  // Convert topics to backend questions format
  const convertTopicsToBackendFormat = (topics: Topic[]): Record<string, { title: string; questions: string[] }> => {
    const questionsObject: Record<string, { title: string; questions: string[] }> = {};
    
    topics.forEach((topic) => {
      questionsObject[topic.id] = {
        title: topic.title,
        questions: topic.questions.map(q => q.text).filter(text => text.trim() !== ''),
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

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const questionsData = convertTopicsToBackendFormat(topics);
      const backendData = convertToBackendFormat(formData, questionsData);
      const response = await recruiterService.updateJob(jobId, backendData);

      if (response.success) {
        setShowSuccessModal(true);
      } else {
        setSubmitError(response.message || "Failed to update job");
      }
    } catch (err) {
      const error = err as Error;
      console.error("Error updating job:", error);
      setSubmitError(error.message || "An error occurred while updating the job");
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
