"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppLayout } from "@/components/global/app-layout";
import { JobForm, JobFormData } from "../../components/JobForm";
import {
  DEFAULT_JOB_FORM_DATA,
  DEFAULT_TOPICS,
} from "../../constants/form";
import SuccessModal from "@/components/modal";
import { useJobId, useJob } from "../../hooks/useJobData";
import { useQuestions } from "../../hooks/useQuestions";

export default function EditJobPage() {
  const router = useRouter();
  const jobId = useJobId();
  const { job, isLoading, error } = useJob(jobId);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState<JobFormData>(DEFAULT_JOB_FORM_DATA);
  const { topics, addQuestion, removeQuestion, updateQuestion } = useQuestions(DEFAULT_TOPICS);

  const updateFormData = (updates: Partial<JobFormData>) => {
    setFormData((prev: JobFormData) => ({ ...prev, ...updates }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Replace with actual API call when backend is ready
    // await JobService.updateJob(jobId, { formData, topics });
    setShowSuccessModal(true);
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Edit Job post
        </h1>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={handleCancel}
            className="flex-1 sm:flex-none px-8 py-2 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 bg-white font-medium text-sm rounded-sm"
          >
            Preview
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 sm:flex-none px-2 py-2 bg-[#F4781B] hover:bg-orange-600 text-white font-medium text-sm rounded-sm"
          >
            Save & continue
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
          submitLabel="Save"
        />

      <SuccessModal
        visible={showSuccessModal}
        onClose={handleSuccessClose}
        title="Job updated successfully"
        message={`${job.title} - Job ID: ${jobId} is now live and ready for applicants.`}
        buttonText="Done"
      />
    </AppLayout>
  );
}
