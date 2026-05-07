"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button }                from "@/components/ui/button";
import { JobBasicInfo }          from "../create/components/job-basic-info";
import { JobRequirements }       from "../create/components/job-requirements";
import { JobDescription }        from "../create/components/job-description";
import { QuestionsTopic }        from "../create/components/questions-topic";
import { LocationFields }        from "../create/components/location-fields";

import { Topic }                 from "../constants/form";
import { PAGE_TITLES, BUTTON_LABELS } from "../constants/messages";
import type { JobFormData }      from "@/Interface/recruiter.types";

// ── Props ─────────────────────────────────────────────────────────────────────
interface JobFormProps {
  mode:             "create" | "edit";
  formData:         JobFormData;
  updateFormData:   (updates: Partial<JobFormData>) => void;
  topics?:          Topic[];
  onAddQuestion?:   (topicId: string) => void;
  onRemoveQuestion?:(topicId: string, questionId: string) => void;
  onUpdateQuestion?:(topicId: string, questionId: string, text: string) => void;
  onSubmit?:        (e: React.FormEvent) => void;
  onBack?:          () => void;
  onCancel?:        () => void;
  onPreview?:       () => void;
  title?:           string;
  showInterviewQuestions?: boolean;
  showBackButton?:  boolean;
  showNextButton?:  boolean;
  submitLabel?:     string;
  backLabel?:       string;
  // ✅ nextLabel is now driven by parent — "Next" or "Create Job Post"
  nextLabel?:       string;
  // ✅ NEW: disables button + shows spinner while async work runs
  isSubmitting?:    boolean;
  wrapperClassName?:string;
  customSections?:  React.ReactNode;
  hideRequirements?:boolean;
  hideInterviewSettings?: boolean;
  fieldErrors?: Partial<Record<keyof JobFormData, string>>;
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
  onBack,
  onCancel,
  title,
  showInterviewQuestions = false,
  showBackButton  = false,
  showNextButton  = false,
  submitLabel,
  backLabel,
  nextLabel,
  isSubmitting    = false,
  wrapperClassName,
  customSections,
  hideRequirements = false,
  fieldErrors = {},
}: JobFormProps) {
  const isEditMode = mode === "edit";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) onSubmit(e);
  };

  const formTitle = title || (isEditMode ? "Edit job details" : PAGE_TITLES.GENERATE_WITH_AI);

  // ── Derive button label ────────────────────────────────────────────────────
  // Priority: explicit nextLabel prop → submitLabel → mode default
  // Parent (CreateJobForm) passes:
  //   "Next"           when inPersonInterview === "Yes"  → proceeds to AI form
  //   "Create Job Post" when inPersonInterview !== "Yes" → proceeds to summary
  const resolvedButtonLabel =
    nextLabel ??
    submitLabel ??
    (isEditMode ? "Save Changes" : BUTTON_LABELS.SAVE_AND_CONTINUE);

  // ── Show/hide the AI interview section based on inPersonInterview ──────────
  // inPersonInterview is typed as string | boolean | undefined in JobFormData
  const wantsInterview =
    formData.inPersonInterview === "Yes" ||
    formData.inPersonInterview === true;

  return (
    <div className={wrapperClassName || "space-y-3 sm:space-y-4"}>
      <form
        onSubmit={handleSubmit}
        noValidate
        className="bg-white rounded-lg shadow-sm border border-gray-200"
      >
        {/* ── Form body ── */}
        <div className="p-4 sm:p-6 lg:p-8">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-6 sm:mb-8">
            {formTitle}
          </h2>

          {/* Basic info — includes the "Do you admire to have interview?" toggle */}
          <JobBasicInfo
            formData={formData}
            updateFormData={updateFormData}
            fieldErrors={fieldErrors}
          />

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
              fieldErrors={fieldErrors}
            />
          )}

          <JobDescription
            formData={formData}
            updateFormData={updateFormData}
            fieldErrors={fieldErrors}
          />

          {/* ── AI Interview Questions ──────────────────────────────────────
              Only rendered when:
              1. The parent explicitly passes showInterviewQuestions=true AND
                 topics are provided  (edit mode / generative AI form), OR
              2. inPersonInterview is "Yes" / true AND topics exist
                 (create mode — recruiter opted in to interview)
          ─────────────────────────────────────────────────────────────────── */}
          {((showInterviewQuestions && topics.length > 0) ||
            (wantsInterview && topics.length > 0)) && (
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

        {/* ── Footer: Back + Submit/Next ─────────────────────────────────── */}
        {(showBackButton || showNextButton || onSubmit || onCancel) && (
          <div
            className={`
              flex flex-col sm:flex-row
              ${showBackButton ? "justify-between" : "justify-end"}
              items-stretch sm:items-center
              gap-2 sm:gap-3
              px-4 sm:px-6 lg:px-8 py-4 sm:py-6
              ${isEditMode ? "border-t border-gray-200" : ""}
            `}
          >
            {/* Back / Cancel */}
            {showBackButton && onBack && (
              <Button
                type="button"
                variant="ghost"
                onClick={onBack}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-4 sm:px-6 h-10 text-sm order-2 sm:order-1 border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {backLabel ?? "Back"}
              </Button>
            )}

            {!showBackButton && onCancel && (
              <Button
                type="button"
                variant="ghost"
                onClick={onCancel}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-4 sm:px-6 h-10 text-sm order-2 sm:order-1 border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </Button>
            )}

            {/* Primary action — Next OR Create Job Post OR Save */}
            {(showNextButton || onSubmit) && (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="
                  w-full sm:w-auto
                  bg-[#F4781B] hover:bg-orange-600
                  disabled:opacity-60 disabled:cursor-not-allowed
                  text-white px-4 sm:px-6 h-10 shadow-sm text-sm
                  order-1 sm:order-2
                "
              >
                {isSubmitting ? (
                  // Spinner during async submission
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {resolvedButtonLabel}
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            )}
          </div>
        )}
      </form>
    </div>
  );
}

// Re-export type so existing imports from this file still work
export type { JobFormData };