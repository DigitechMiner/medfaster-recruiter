"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuestionsTopic } from "../components/questions-topic";
import SuccessModal from "@/components/modal";
import { useJobsStore } from "@/stores/jobs-store";
import { DEFAULT_TOPICS, Topic } from "../../constants/form";
import { PAGE_TITLES, BUTTON_LABELS, SUCCESS_MESSAGES } from "../../constants/messages";
import type { JobCreatePayload, JobUpdatePayload } from "@/Interface/job.types";

interface Props {
  pendingPayload?: JobCreatePayload | null;
  onBack?: () => void;
  onNext?: (payload: JobCreatePayload) => void; // ← goes to summary
}

export function GenerateAIForm({ pendingPayload, onBack, onNext }: Props) { // ✅ destructure onNext
  const router     = useRouter();
  const createJob  = useJobsStore((state) => state.createJob);
  const setHasJobs = useJobsStore((state) => state.setHasJobs);

  const [topics, setTopics]             = useState<Topic[]>(DEFAULT_TOPICS);
  const [showSuccess, setShowSuccess]   = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError]               = useState<string | null>(null);

  const addQuestion = (topicId: string) => {
    setTopics((prev) =>
      prev.map((topic) =>
        topic.id === topicId
          ? { ...topic, questions: [...topic.questions, { id: `${topicId}-${topic.questions.length + 1}`, text: "" }] }
          : topic
      )
    );
  };

  const removeQuestion = (topicId: string, questionId: string) => {
    setTopics((prev) =>
      prev.map((topic) =>
        topic.id === topicId
          ? { ...topic, questions: topic.questions.filter((q) => q.id !== questionId) }
          : topic
      )
    );
  };

  const updateQuestion = (topicId: string, questionId: string, text: string) => {
    setTopics((prev) =>
      prev.map((topic) =>
        topic.id === topicId
          ? { ...topic, questions: topic.questions.map((q) => (q.id === questionId ? { ...q, text } : q)) }
          : topic
      )
    );
  };

  const convertQuestionsToBackendFormat = (topics: Topic[]): string[] =>
    topics
      .flatMap((topic) => topic.questions.map((q) => q.text))
      .filter((text) => text.trim() !== "");

  const buildFinalPayload = (withStatusOpen: boolean): JobCreatePayload => ({
  ...(pendingPayload ?? {}),
  job_title:        pendingPayload?.job_title        ?? "",
  job_type:         pendingPayload?.job_type         ?? "casual",
  job_urgency:      pendingPayload?.job_urgency      ?? "normal",
  responsibilities: pendingPayload?.responsibilities ?? [],   // ← ADD
  required_skills:  pendingPayload?.required_skills  ?? [],   // ← ADD (same issue)
  questions:        convertQuestionsToBackendFormat(topics),
  status:           withStatusOpen ? "OPEN" : "DRAFT",
  ai_interview:     true,
});
  // ── Create / go to summary (primary CTA) ─────────────────────────────────
  const handleCreate = () => {
    const payload = buildFinalPayload(true);
    console.log("📤 Proceeding to summary:", JSON.stringify(payload, null, 2));

    if (onNext) {
      // ✅ Summary page flow — pass payload up, don't submit here
      onNext(payload);
    } else {
      // Fallback — direct submit (keeps old behaviour if onNext not provided)
      setIsSubmitting(true);
      setError(null);
      createJob(payload)
        .then((response) => {
          if (response.success) setShowSuccess(true);
          else setError(response.message || "Failed to create job");
        })
        .catch((err) => setError((err as Error).message || "An error occurred"))
        .finally(() => setIsSubmitting(false));
    }
  };

  const handleSuccessDone = () => {
    setShowSuccess(false);
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
      <div className="space-y-3 sm:space-y-4 w-full overflow-x-hidden">

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-w-0">
          <div className="p-4 sm:p-6 lg:p-8">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-6 sm:mb-8">
              {PAGE_TITLES.GENERATE_WITH_AI}
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 min-w-0">
              {topics.map((topic) => (
                <QuestionsTopic
                  key={topic.id}
                  topic={topic}
                  onAddQuestion={() => addQuestion(topic.id)}
                  onRemoveQuestion={(questionId) => removeQuestion(topic.id, questionId)}
                  onUpdateQuestion={(questionId, text) => updateQuestion(topic.id, questionId, text)}
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
              onClick={handleCreate} // ✅ goes to summary if onNext provided
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