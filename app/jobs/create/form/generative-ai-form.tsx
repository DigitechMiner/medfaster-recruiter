"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuestionsTopic } from "../components/questions-topic";
import { TopActionBar } from "@/components/custom/top-action-bar";
import SuccessModal from "@/components/modal";
import { DEFAULT_TOPICS, Topic } from "../../constants/form";
import { PAGE_TITLES, BUTTON_LABELS, SUCCESS_MESSAGES } from "../../constants/messages";
import { useJobsStore } from "@/lib/store/jobs-store";

interface Props {
  onBack?: () => void;
  onCreate?: (topics: Topic[]) => void;
}

export function GenerateAIForm({ onBack, onCreate }: Props) {
  const router = useRouter();
  const setHasJobs = useJobsStore((state) => state.setHasJobs);
  const [topics, setTopics] = useState<Topic[]>(DEFAULT_TOPICS);

  const [showSuccess, setShowSuccess] = useState(false);

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

  const handleSave = () => {
    console.log("Save & continue clicked", topics);
    setShowSuccess(true);
  };

  const handleCreate = () => {
    if (onCreate) onCreate(topics);
    console.log("Create clicked", topics);
    setShowSuccess(true);
  };

  const handleSuccessDone = () => {
    setShowSuccess(false);
    // Set flag to show dashboard instead of empty state
    setHasJobs(true);
    router.push("/jobs");
  };

  return (
    <>
    <div className="space-y-3 sm:space-y-4">
      <TopActionBar
        title={PAGE_TITLES.CREATE_JOB}
        onPreview={() => onBack && onBack()}
        onPrimary={handleSave}
        primaryLabel={BUTTON_LABELS.SAVE_AND_CONTINUE}
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
            className="w-full sm:w-auto bg-white border-[#D9D9E0] border-2 hover:bg-gray-50 text-gray-600 px-4 sm:px-6 h-10 text-sm order-2 sm:order-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {BUTTON_LABELS.BACK}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={handleCreate}
            className="w-full sm:w-auto bg-[#F4781B] hover:bg-orange-600 text-white px-4 sm:px-6 h-10 shadow-sm text-sm order-1 sm:order-2"
          >
            {BUTTON_LABELS.CREATE}
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


