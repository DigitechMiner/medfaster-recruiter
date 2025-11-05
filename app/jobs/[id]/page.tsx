"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Modal from "@/components/modal";
import {
  DEFAULT_JOB_FORM_DATA,
  DEFAULT_TOPICS,
} from "../constants/form";
import { JobFormData } from "../components/JobForm";
import { JobDetailHeader } from "./components/JobDetailHeader";
import { JobDetailSections } from "./components/JobDetailSections";
import { JobEditForm } from "./components/JobEditForm";
import { AppLayout } from "@/components/global/app-layout";
import { useJobId, useJob, useJobDetails } from "../hooks/useJobData";
import { useQuestions } from "../hooks/useQuestions";

export default function JobDetailPageRoute() {
  const router = useRouter();
  const jobId = useJobId();
  const { job, isLoading: isLoadingJob, error: jobError } = useJob(jobId);
  const { jobDetails, isLoading: isLoadingDetails, error: detailsError } = useJobDetails(jobId);
  const [isEditing, setIsEditing] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [formData, setFormData] = useState<JobFormData>(DEFAULT_JOB_FORM_DATA);
  const { topics, addQuestion, removeQuestion, updateQuestion } = useQuestions(DEFAULT_TOPICS);

  // Redirect if job not found
  if (!isLoadingJob && !isLoadingDetails && !job && jobId) {
    router.push("/jobs");
    return null;
  }

  const handleBack = () => {
    router.push("/jobs");
  };

  const updateFormData = (updates: Partial<JobFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleCloseJobClick = () => {
    setShowCloseModal(true);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
  };

  const handleSave = () => {
    // TODO: Replace with actual API call when backend is ready
    // await JobService.updateJob(jobId, { formData, topics });
    setShowSuccessModal(true);
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    setIsEditing(false);
  };

  if (isLoadingJob || isLoadingDetails) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </AppLayout>
    );
  }

  if (jobError || detailsError || !job || !jobDetails) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <p className="text-red-600">
            {jobError || detailsError || "Job not found"}
          </p>
        </div>
      </AppLayout>
    );
  }

  // Show Edit Form
  if (isEditing) {
    return (
      <JobEditForm
        formData={formData}
        topics={topics}
        updateFormData={updateFormData}
        addQuestion={addQuestion}
        removeQuestion={removeQuestion}
        updateQuestion={updateQuestion}
        onCancel={handleEditCancel}
        onSave={handleSave}
        showSuccessModal={showSuccessModal}
        onSuccessClose={handleSuccessClose}
      />
    );
  }

  // Show Job Detail
  return (
    <AppLayout>

      <JobDetailHeader
        onBack={handleBack}
        onCloseJob={handleCloseJobClick}
        applicantCount={job.applicantCount}
      />
      <div className="p-4 sm:p-6 lg:p-8 bg-white rounded-lg border border-gray-200">
        <JobDetailSections job={job} jobDetails={jobDetails} />
      </div>
      <Modal
        visible={showCloseModal}
        onClose={() => setShowCloseModal(false)}
        variant="confirmation"
        title="Are you sure want to close this job?"
        message=""
        primaryButtonText="Yes"
        secondaryButtonText="No"
        onConfirm={() => {
          // TODO: Replace with actual API call when backend is ready
          // await JobService.deleteJob(jobId);
          setShowCloseModal(false);
          router.push("/jobs");
        }}
        onCancel={() => setShowCloseModal(false)}
      />
      <Modal
        visible={showSuccessModal}
        onClose={handleSuccessClose}
        title="Job updated successfully"
        message="Your job post has been updated."
        buttonText="Done"
      />
    </AppLayout>
  );
}
