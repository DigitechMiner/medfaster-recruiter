"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobBasicInfo } from "../create/components/job-basic-info";
import { JobRequirements } from "../create/components/job-requirements";
import { JobDescription } from "../create/components/job-description";
import { QuestionsTopic } from "../create/components/questions-topic";

import { Topic } from "../constants/form";
import { PAGE_TITLES, BUTTON_LABELS } from "../constants/messages";
import { LocationFields } from "../create/components/location-fields";
import type { JobFormData } from "@/Interface/job.types";

interface JobFormProps {
  mode: "create" | "edit";
  formData: JobFormData; // This now uses the imported type
  updateFormData: (updates: Partial<JobFormData>) => void;
  topics?: Topic[];
  onAddQuestion?: (topicId: string) => void;
  onRemoveQuestion?: (topicId: string, questionId: string) => void;
  onUpdateQuestion?: (topicId: string, questionId: string, text: string) => void;
  onSubmit?: (e: React.FormEvent) => void;
  onBack?: () => void;
  onCancel?: () => void;
  onPreview?: () => void;
  title?: string;
  showInterviewQuestions?: boolean;
  showBackButton?: boolean;
  showNextButton?: boolean;
  submitLabel?: string;
  backLabel?: string;
  nextLabel?: string;
  wrapperClassName?: string;
  customSections?: React.ReactNode;
  hideRequirements?: boolean;
  hideInterviewSettings?: boolean;
}

export function JobForm({
  mode,
  formData,
  updateFormData,
  topics = [],
  onAddQuestion,
  onRemoveQuestion,
  onUpdateQuestion,
  onSubmit,
  onCancel,
  title,
  showInterviewQuestions = false,
  showBackButton = false,
  showNextButton = false,
  submitLabel,
  wrapperClassName,
  customSections,
  hideRequirements = false,
}: JobFormProps) {
  const isEditMode = mode === "edit";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };


  const formTitle = title || (isEditMode ? "Edit job details" : PAGE_TITLES.GENERATE_WITH_AI);

  return (
    <div className={wrapperClassName || "space-y-3 sm:space-y-4"}>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-sm border border-gray-200"
      >
        <div className="p-4 sm:p-6 lg:p-8 ">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-6 sm:mb-8">
            {formTitle}
          </h2>

          <JobBasicInfo formData={formData} updateFormData={updateFormData} />

          {customSections}

          {!hideRequirements && (
            <JobRequirements
              formData={formData}
              updateFormData={updateFormData}
            />
          )}
          {formData.urgency !== "instant" && (
          <LocationFields
            formData={formData}
            updateFormData={updateFormData}
          />
            )}

          <JobDescription
            formData={formData}
            updateFormData={updateFormData}
          />

          {showInterviewQuestions && topics.length > 0 && (
            <>
              <div className="my-8" />
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-6">
                  Interview Questions
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                  {topics.map((topic) => (
                    <QuestionsTopic
                      key={topic.id}
                      topic={topic}
                      onAddQuestion={() => onAddQuestion?.(topic.id)}
                      onRemoveQuestion={(questionId) =>
                        onRemoveQuestion?.(topic.id, questionId)
                      }
                      onUpdateQuestion={(questionId, text) =>
                        onUpdateQuestion?.(topic.id, questionId, text)
                      }
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {(showBackButton || showNextButton || onSubmit || onCancel) && (
          <div className={`flex flex-col sm:flex-row justify-center sm:justify-end items-stretch sm:items-center gap-2 sm:gap-3 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 ${isEditMode ? "border-t border-gray-200" : ""}`}>
            {showNextButton && (
              <Button
                type="submit"
                variant="ghost"
                className="w-full sm:w-auto bg-[#F4781B] hover:bg-orange-600 text-white px-4 sm:px-6 h-10 shadow-sm text-sm order-1 sm:order-2"
              >
                Submit Request
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
            
          </div>
        )}
        {!showNextButton && (onSubmit || onCancel) && (
              <Button
                type={onSubmit ? "submit" : "button"}
                onClick={onSubmit ? undefined : onCancel}
                className="w-full sm:w-auto bg-[#F4781B] hover:bg-orange-600 text-white px-4 sm:px-6 h-10 shadow-sm text-sm rounded-lg order-1 sm:order-2"
              >
                {submitLabel || (isEditMode ? "Save" : BUTTON_LABELS.SAVE_AND_CONTINUE)}
              </Button>
            )}
      </form>
    </div>
  );
}

// Export the type for other files that might import from here
export type { JobFormData };
