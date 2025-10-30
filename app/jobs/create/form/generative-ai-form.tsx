"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuestionsTopic } from "../components/questions-topic";
import { TopActionBar } from "@/components/custom/top-action-bar";
import SuccessModal from "../components/job-success-modal";

interface Question {
  id: string;
  text: string;
}

interface Topic {
  id: string;
  title: string;
  questions: Question[];
}

interface Props {
  onBack?: () => void;
  onCreate?: (topics: Topic[]) => void;
}

export function GenerateAIForm({ onBack, onCreate }: Props) {
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>([
    {
      id: "1",
      title: "Questions Topic 1",
      questions: [
        { id: "1-1", text: "Lorem ipsum dolor sit amet consectetuer Non commodo tellus non enim sit?" },
        { id: "1-2", text: "Lorem ipsum dolor sit amet consectetuer Non commodo tellus non enim sit?" },
        { id: "1-3", text: "Lorem ipsum dolor sit amet consectetuer Non commodo tellus non enim sit?" },
        { id: "1-4", text: "Lorem ipsum dolor sit amet consectetuer Non commodo tellus non enim sit?" },
      ],
    },
    {
      id: "2",
      title: "Questions Topic 2",
      questions: [
        { id: "2-1", text: "Lorem ipsum dolor sit amet consectetuer Non commodo tellus non enim sit?" },
        { id: "2-2", text: "Lorem ipsum dolor sit amet consectetuer Non commodo tellus non enim sit?" },
        { id: "2-3", text: "Lorem ipsum dolor sit amet consectetuer Non commodo tellus non enim sit?" },
      ],
    },
    {
      id: "3",
      title: "Questions Topic 3",
      questions: [
        { id: "3-1", text: "Lorem ipsum dolor sit amet consectetuer Non commodo tellus non enim sit?" },
        { id: "3-2", text: "Lorem ipsum dolor sit amet consectetuer Non commodo tellus non enim sit?" },
        { id: "3-3", text: "Lorem ipsum dolor sit amet consectetuer Non commodo tellus non enim sit?" },
        { id: "3-4", text: "Lorem ipsum dolor sit amet consectetuer Non commodo tellus non enim sit?" },
      ],
    },
    {
      id: "4",
      title: "Questions Topic 4",
      questions: [
        { id: "4-1", text: "Lorem ipsum dolor sit amet consectetuer Non commodo tellus non enim sit?" },
        { id: "4-2", text: "Lorem ipsum dolor sit amet consectetuer Non commodo" },
      ],
    },
  ]);

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

  const handlePreview = () => {
    console.log("Preview clicked");
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
    router.push("/jobs");
  };

  return (
    <>
    <div className="space-y-3 sm:space-y-4">
      <TopActionBar
        title="Create Job post"
        onPreview={() => onBack && onBack()}
        onPrimary={handleSave}
        primaryLabel="Save & continue"
      />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 sm:p-6 lg:p-8">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-6 sm:mb-8">
            generate with AI
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
            Back
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={handleCreate}
            className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white px-4 sm:px-6 h-10 shadow-sm text-sm order-1 sm:order-2"
          >
            Create
          </Button>
        </div>
      </div>
    </div>
    <SuccessModal
      visible={showSuccess}
      onClose={handleSuccessDone}
      title="Job created successfully"
      message="Your job post has been created."
      buttonText="Done"
    />
    </>
  );
}


