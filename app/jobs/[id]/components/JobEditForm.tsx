"use client";

import React from "react";
import SuccessModal from "@/components/modal";
import { Topic } from "../../constants/form";
import { JobForm, JobFormData } from "../../components/JobForm";
import { AppLayout } from "@/components/global/app-layout";

interface JobEditFormProps {
  formData: JobFormData;
  topics: Topic[];
  updateFormData: (updates: Partial<JobFormData>) => void;
  addQuestion: (topicId: string) => void;
  removeQuestion: (topicId: string, questionId: string) => void;
  updateQuestion: (topicId: string, questionId: string, text: string) => void;
  onCancel: () => void;
  onSave: () => void;
  showSuccessModal: boolean;
  onSuccessClose: () => void;
}

export const JobEditForm: React.FC<JobEditFormProps> = ({
  formData,
  topics,
  updateFormData,
  addQuestion,
  removeQuestion,
  updateQuestion,
  onCancel,
  onSave,
  showSuccessModal,
  onSuccessClose,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppLayout padding="none">
      <div className="w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Edit Job post
          </h1>
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={onCancel}
              className="flex-1 sm:flex-none px-4 py-2 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 bg-white font-medium text-sm rounded"
            >
              Preview
            </button>
            <button
              onClick={onSave}
              className="flex-1 sm:flex-none px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm rounded"
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
          onCancel={onCancel}
          showInterviewQuestions={true}
          showBackButton={true}
          submitLabel="Save"
        />
      </div>
      <SuccessModal
        visible={showSuccessModal}
        onClose={onSuccessClose}
        title="Job updated successfully"
        message="Your job post has been updated."
        buttonText="Done"
      />
      </AppLayout>
    </div>
    
  );
};

