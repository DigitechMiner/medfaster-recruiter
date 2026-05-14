"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import SuccessModal from "@/components/modal";
import { useGenerateQuestions } from "@/hooks/useGenerateQuestions";
import { useJobsStore } from "@/stores/jobs-store";
import type { JobCreatePayload } from "@/types";
import { CreateJobListSection } from "./create-job-list-section";
import {
  BUTTON_LABELS,
  MAX_AI_QUESTIONS,
  PAGE_TITLES,
  SUCCESS_MESSAGES,
} from "./constants";
import type { AIQuestion } from "../helper/types";

const uid = () => crypto.randomUUID();

interface QuestionFormProps {
  pendingPayload?: JobCreatePayload | null;
  questions: AIQuestion[];
  onQuestionsChange: (questions: AIQuestion[]) => void;
  onBack?: () => void;
  onNext?: (payload: JobCreatePayload) => void;
}

export function QuestionForm({
  pendingPayload,
  questions,
  onQuestionsChange,
  onBack,
  onNext,
}: QuestionFormProps) {
  const router = useRouter();
  const createJob = useJobsStore((s) => s.createJob);
  const setHasJobs = useJobsStore((s) => s.setHasJobs);

  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    loading: aiLoading,
    error: aiError,
    generate,
    reset: resetAI,
  } = useGenerateQuestions();

  const handleRephrase = async () => {
    if (!pendingPayload?.job_title) {
      toast.error("Job title is required to generate questions.");
      return;
    }
    resetAI();

    const generated = await generate({
      title: pendingPayload.job_title,
      department: pendingPayload.department ?? "",
      specialization: pendingPayload.specializations?.[0] ?? undefined,
      count: Math.max(questions.length, 5),
    });

    if (generated.length === 0) return;

    onQuestionsChange(
      generated
        .slice(0, MAX_AI_QUESTIONS)
        .map((text) => ({ id: uid(), text })),
    );
  };

  const handleQuestionsListChange = (items: string[]) => {
    onQuestionsChange(
      items
        .slice(0, MAX_AI_QUESTIONS)
        .map((text, index) => ({ id: questions[index]?.id ?? uid(), text })),
    );
  };

  const handleMaxQuestionsReached = () => {
    toast.error("Maximum 10 questions allowed");
  };

  const buildFinalPayload = (withStatusOpen: boolean): JobCreatePayload => ({
    ...(pendingPayload ?? {}),
    job_title: pendingPayload?.job_title ?? "",
    job_type: pendingPayload?.job_type ?? "casual",
    job_urgency: pendingPayload?.job_urgency ?? "normal",
    responsibilities: pendingPayload?.responsibilities ?? [],
    required_skills: pendingPayload?.required_skills ?? [],
    questions: questions.map((q) => q.text).filter(Boolean),
    status: withStatusOpen ? "OPEN" : "DRAFT",
    ai_interview: true,
  });

  const handleCreate = () => {
    const payload = buildFinalPayload(true);
    if (onNext) {
      onNext(payload);
    } else {
      setIsSubmitting(true);
      setError(null);
      createJob(payload)
        .then((res) => {
          if (res.success) setShowSuccess(true);
          else setError(res.message || "Failed to create job");
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

      {aiError && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm flex items-center justify-between">
          <span>{aiError}</span>
          <button onClick={handleRephrase} className="underline font-medium ml-3">
            Try Again
          </button>
        </div>
      )}

      <div className="space-y-3 sm:space-y-4 w-full overflow-x-hidden">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 min-w-0">
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base sm:text-lg font-bold text-gray-900">
                {PAGE_TITLES.GENERATE_WITH_AI ?? "Create Interview Questions"}
              </h2>
            </div>

            <CreateJobListSection
              title="Write Your Questions Here"
              items={questions.map((question) => question.text)}
              onChange={handleQuestionsListChange}
              placeholder="Type your question here..."
              maxItems={MAX_AI_QUESTIONS}
              onMaxItemsReached={handleMaxQuestionsReached}
              counterText={`${questions.length} / ${MAX_AI_QUESTIONS} questions`}
              itemLabel={(index) => `Questions ${index + 1} )`}
              headerActions={
                <>
                  <button
                    type="button"
                    onClick={handleRephrase}
                    disabled={aiLoading}
                    className="flex items-center gap-1.5 text-[#F4781B] text-sm font-semibold italic hover:opacity-75 transition-opacity disabled:opacity-50"
                  >
                    {aiLoading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Sparkles size={14} />
                    )}
                    Rephrase Questions with KeReaeva&apos;s AI
                  </button>
                  <span className="text-gray-400 text-sm">or</span>
                </>
              }
            />
          </div>

          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <Button
              type="button"
              variant="ghost"
              onClick={onBack}
              disabled={isSubmitting}
              className="flex items-center gap-2 border border-gray-200 text-gray-700 text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>

            <Button
              type="button"
              onClick={handleCreate}
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-[#F4781B] hover:bg-[#e06a10] text-white text-sm font-semibold px-7 py-2.5 rounded-xl disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Creating...
                </>
              ) : (
                <>
                  {onNext ? "Preview Job" : BUTTON_LABELS.CREATE}{" "}
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </>
              )}
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
