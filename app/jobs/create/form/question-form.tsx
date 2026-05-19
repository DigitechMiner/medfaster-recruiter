"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "react-toastify";
import SuccessModal from "@/components/modal";
import { generateInterviewQuestions } from "@/features/jobs";
import { useJobsStore } from "@/stores/jobs-store";
import type { JobCreatePayload } from "@/types";
import { CreateJobListSection } from "../components/listSection";
import {
  MAX_AI_QUESTIONS,
  MIN_AI_QUESTIONS,
  SUCCESS_MESSAGES,
} from "../normal/constant";

const uid = () => crypto.randomUUID();

export interface AIQuestion {
  id: string;
  text: string;
}

interface QuestionFormProps {
  pendingPayload?: JobCreatePayload | null;
  questions: AIQuestion[];
  onQuestionsChange: (questions: AIQuestion[]) => void;
  onNext?: (payload: JobCreatePayload) => void;
  formId?: string;
  autoSubmitToken?: number;
  onValidationBlocked?: () => void;
}

export function QuestionForm({
  pendingPayload,
  questions,
  onQuestionsChange,
  onNext,
  formId,
  autoSubmitToken,
  onValidationBlocked,
}: QuestionFormProps) {
  const router = useRouter();
  const createJob = useJobsStore((s) => s.createJob);
  const setHasJobs = useJobsStore((s) => s.setHasJobs);
  const formSnapshot = useJobsStore((s) => s.formSnapshot);

  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [questionError, setQuestionError] = useState<string | null>(null);
  const lastAutoSubmitTokenRef = useRef<number | undefined>(undefined);

  const handleRephrase = async () => {
  // Prefer job title from pendingPayload, but fall back to snapshot
  const title =
    pendingPayload?.job_title || formSnapshot?.job_title || "";
  const department =
    pendingPayload?.department ?? formSnapshot?.department ?? "";
  const specialization =
    pendingPayload?.specializations?.[0] ??
    formSnapshot?.specializations?.[0] ??
    undefined;

  if (!title.trim()) {
    toast.error("Job title is required to generate questions.");
    return;
  }

  setAiLoading(true);
  setAiError(null);

  let generated: string[];
  try {
    generated = await generateInterviewQuestions({
      title,
      department,
      specialization,
      count: Math.max(questions.length, 5),
    });
  } catch (err) {
    setAiError(
      err instanceof Error ? err.message : "Failed to generate questions",
    );
    return;
  } finally {
    setAiLoading(false);
  }

  if (generated.length === 0) return;

  onQuestionsChange(
    generated
      .slice(0, MAX_AI_QUESTIONS)
      .map((text) => ({ id: uid(), text })),
  );
};

  const handleQuestionsListChange = (items: string[]) => {
    const nextItems =
      items.length === 0 || items.every((item) => item.trim().length === 0)
        ? [""]
        : items.slice(0, MAX_AI_QUESTIONS);

    if (
      nextItems.filter((item) => item.trim().length > 0).length >=
      MIN_AI_QUESTIONS
    ) {
      setQuestionError(null);
    }

    onQuestionsChange(
      nextItems.map((text, index) => ({
        id: questions[index]?.id ?? uid(),
        text,
      })),
    );
  };

  const handleMaxQuestionsReached = () => {
    toast.error("Maximum 10 questions allowed");
  };

  const getValidQuestionTexts = () =>
    questions
      .map((question) => question.text.trim())
      .filter((text) => text.length > 0);

  const validateQuestions = () => {
    const validQuestions = getValidQuestionTexts();

    if (validQuestions.length < MIN_AI_QUESTIONS) {
      const message = `Please add at least ${MIN_AI_QUESTIONS} questions.`;
      setQuestionError(message);
      toast.error(message);
      onValidationBlocked?.();
      return null;
    }

    setQuestionError(null);
    return validQuestions;
  };

  const buildFinalPayload = (
    withStatusOpen: boolean,
    validQuestions: string[],
  ): JobCreatePayload => ({
    ...(pendingPayload ?? {}),
    job_title: pendingPayload?.job_title ?? "",
    job_type: pendingPayload?.job_type ?? "casual",
    job_urgency: pendingPayload?.job_urgency ?? "normal",
    responsibilities: pendingPayload?.responsibilities ?? [],
    required_skills: pendingPayload?.required_skills ?? [],
    questions: validQuestions,
    status: withStatusOpen ? "OPEN" : "DRAFT",
    ai_interview: true,
  });

  const handleCreate = () => {
    if (isSubmitting) return;

    const validQuestions = validateQuestions();
    if (!validQuestions) return;

    const payload = buildFinalPayload(true, validQuestions);
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
        .catch((err) =>
          setError((err as Error).message || "An error occurred"),
        )
        .finally(() => setIsSubmitting(false));
    }
  };

  const handleSuccessDone = () => {
    setShowSuccess(false);
    setHasJobs(true);
    router.push("/jobs");
  };

  const questionItems = questions.map((question) => question.text);
  const visibleQuestionItems =
    questionItems.length === 0 ||
    questionItems.every((item) => item.trim().length === 0)
      ? [""]
      : questionItems;

  useEffect(() => {
    if (
      autoSubmitToken === undefined ||
      lastAutoSubmitTokenRef.current === autoSubmitToken
    ) {
      return;
    }

    lastAutoSubmitTokenRef.current = autoSubmitToken;
    handleCreate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSubmitToken]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleCreate();
  };

  return (
    <>
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      {aiError && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <span>{aiError}</span>
          <button
            type="button"
            onClick={handleRephrase}
            className="ml-3 font-medium underline"
          >
            Try Again
          </button>
        </div>
      )}

      <form
        id={formId}
        onSubmit={handleSubmit}
        className="contents"
        noValidate
      >
        <div className="w-full space-y-3 overflow-x-hidden sm:space-y-4">
          <div className="min-w-0">
            <CreateJobListSection
              title="AI Interview Sample Questionnaire"
              items={visibleQuestionItems}
              onChange={handleQuestionsListChange}
              placeholder="Type your question here..."
              maxItems={MAX_AI_QUESTIONS}
              onMaxItemsReached={handleMaxQuestionsReached}
              counterText={`${visibleQuestionItems.length} / ${MAX_AI_QUESTIONS} questions`}
              error={questionError ?? undefined}
              headerActions={
                <>
                  <button
                    type="button"
                    onClick={handleRephrase}
                    disabled={aiLoading}
                    className="flex items-center gap-1.5 text-sm font-semibold italic text-[#F4781B] transition-opacity hover:opacity-75 disabled:opacity-50"
                  >
                    {aiLoading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Sparkles size={14} />
                    )}
                    Rephrase Questions with KeReaeva&apos;s AI
                  </button>
                  <span className="text-sm text-gray-400">or</span>
                </>
              }
            />
          </div>
        </div>
      </form>

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