"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuestionsTopic } from "../components/questions-topic";
import { TopActionBar } from "@/components/custom/top-action-bar";
import SuccessModal from "@/components/modal";
import { recruiterService } from "@/services/recruiterService";
import { DEFAULT_TOPICS, Topic } from "../../constants/form";
import { PAGE_TITLES, BUTTON_LABELS, SUCCESS_MESSAGES } from "../../constants/messages";
import { useJobsStore } from "@/stores/jobs-store";

interface Props {
  onBack?: () => void;
  onCreate?: (topics: Topic[]) => void;
}

export function GenerateAIForm({ onBack, onCreate }: Props) {
  const router = useRouter();
  const setHasJobs = useJobsStore((state) => state.setHasJobs);
  const [topics, setTopics] = useState<Topic[]>(DEFAULT_TOPICS);
  const [jobId, setJobId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get job ID from sessionStorage (created in step 1)
  useEffect(() => {
    const storedJobId = sessionStorage.getItem('createdJobId');
    if (storedJobId) {
      setJobId(storedJobId);
    }
  }, []);

  const addQuestion = (topicId: string) => {
    setTopics((prevTopics) =>
      prevTopics.map((topic) =>
        topic.id === topicId
          ? {
              ...topic,
              questions: [
                ...topic.questions,
                {
                  id: `${topicId}-${topic.questions.length + 1}`,
                  text: "",
                },
              ],
            }
          : topic
      )
    );
  };

  const removeQuestion = (topicId: string, questionId: string) => {
    setTopics((prevTopics) =>
      prevTopics.map((topic) =>
        topic.id === topicId
          ? {
              ...topic,
              questions: topic.questions.filter((q) => q.id !== questionId),
            }
          : topic
      )
    );
  };

  const updateQuestion = (topicId: string, questionId: string, text: string) => {
    setTopics((prevTopics) =>
      prevTopics.map((topic) =>
        topic.id === topicId
          ? {
              ...topic,
              questions: topic.questions.map((q) =>
                q.id === questionId ? { ...q, text } : q
              ),
            }
          : topic
      )
    );
  };

  // Convert topics to backend questions format
  const convertQuestionsToBackendFormat = (topics: Topic[]): Record<string, { title: string; questions: string[] }> => {
  const questionsObject: Record<string, { title: string; questions: string[] }> = {};
  
  topics.forEach((topic) => {
    questionsObject[topic.id] = {
      title: topic.title,
      questions: topic.questions.map(q => q.text).filter(text => text.trim() !== ''),
    };
  });
  
  return questionsObject;
};

  const handleSave = async () => {
    if (!jobId) {
      setError("Job ID not found. Please go back and create the job first.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const questionsData = convertQuestionsToBackendFormat(topics);
      
      // Update job with questions and change status to published
      const response = await recruiterService.updateJob(jobId, {
        questions: questionsData,
        status: 'published', // Publish the job
      });

      if (response.success) {
        setShowSuccess(true);
        // Clear stored job ID
        sessionStorage.removeItem('createdJobId');
      } else {
        setError(response.message || "Failed to update job with questions");
      }
    } catch (err) {
  const error = err as Error;
  console.error("Error updating job:", error);
  setError(error.message || "An error occurred while saving questions");
} finally {
      setIsSubmitting(false);
    }
  };

  const handleCreate = async () => {
    if (onCreate) onCreate(topics);
    await handleSave();
  };

  const handleSuccessDone = () => {
    setShowSuccess(false);
    // Set flag to show dashboard instead of empty state
    setHasJobs(true);
    router.push("/jobs");
  };

  return (
    <>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}
      <div className="space-y-3 sm:space-y-4">
        <TopActionBar
          title={PAGE_TITLES.CREATE_JOB}
          onPreview={() => onBack && onBack()}
          onPrimary={handleSave}
          primaryLabel={isSubmitting ? "Saving..." : BUTTON_LABELS.SAVE_AND_CONTINUE}
        />

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 sm:p-6 lg:p-8">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-6 sm:mb-8">
              {PAGE_TITLES.GENERATE_WITH_AI}
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              {topics.map((topic) => (
                <QuestionsTopic
                  key={topic.id}
                  topic={topic}
                  onAddQuestion={() => addQuestion(topic.id)}
                  onRemoveQuestion={(questionId) =>
                    removeQuestion(topic.id, questionId)
                  }
                  onUpdateQuestion={(questionId, text) =>
                    updateQuestion(topic.id, questionId, text)
                  }
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center sm:justify-end items-stretch sm:items-center gap-2 sm:gap-3 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 rounded-b-lg">
            <Button
              type="button"
              variant="ghost"
              onClick={onBack}
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-white border-[#D9D9E0] border-2 hover:bg-gray-50 text-gray-600 px-4 sm:px-6 h-10 text-sm order-2 sm:order-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {BUTTON_LABELS.BACK}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={handleCreate}
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-[#F4781B] hover:bg-orange-600 text-white px-4 sm:px-6 h-10 shadow-sm text-sm order-1 sm:order-2"
            >
              {isSubmitting ? "Creating..." : BUTTON_LABELS.CREATE}
            </Button>
          </div>
        </div>
      </div>
      <SuccessModal
        visible={showSuccess}
        onClose={handleSuccessDone}
        title={SUCCESS_MESSAGES.JOB_CREATED.title}
        message={SUCCESS_MESSAGES.JOB_CREATED.message}
        buttonText={SUCCESS_MESSAGES.JOB_CREATED.buttonText}
      />
    </>
  );
}
