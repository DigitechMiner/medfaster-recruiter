"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import SuccessModal from "@/components/modal";
import { useJobsStore } from "@/stores/jobs-store";
import {
  PAGE_TITLES,
  BUTTON_LABELS,
  SUCCESS_MESSAGES,
} from "../../constants/messages";
import type { JobCreatePayload } from "@/types";
import { useGenerateQuestions } from "@/hooks/useGenerateQuestions";
import { toast } from "react-toastify";
import type { AIQuestion } from "../page";

const MAX_QUESTIONS = 10;

const uid = () => crypto.randomUUID();

interface Props {
  pendingPayload?: JobCreatePayload | null;
  // ✅ Lifted state from parent — survives navigation
  questions: AIQuestion[];
  onQuestionsChange: (q: AIQuestion[]) => void;
  onBack?: () => void;
  onNext?: (payload: JobCreatePayload) => void;
}

export function GenerateAIForm({
  pendingPayload,
  questions,
  onQuestionsChange,
  onBack,
  onNext,
}: Props) {
  const router = useRouter();
  const createJob = useJobsStore((s) => s.createJob);
  const setHasJobs = useJobsStore((s) => s.setHasJobs);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    loading: aiLoading,
    error: aiError,
    generate,
    reset: resetAI,
  } = useGenerateQuestions();

  const atLimit = questions.length >= MAX_QUESTIONS;

  // ── AI: Generate / Rephrase ───────────────────────────────────────────────
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
      count: Math.max(questions.length, 5), // ✅ ask for as many as current slots
    });

    if (generated.length === 0) return;

    // ✅ Just replace everything — no merging, no slicing logic
    onQuestionsChange(
      generated.slice(0, MAX_QUESTIONS).map((text) => ({ id: uid(), text })),
    );
  };

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const handleAdd = () => {
    if (atLimit) {
      toast.error("Maximum 10 questions allowed");
      return;
    }
    onQuestionsChange([...questions, { id: uid(), text: "" }]);
  };

  const handleDelete = (id: string) =>
    onQuestionsChange(questions.filter((q) => q.id !== id));

  const handleChange = (id: string, text: string) =>
    onQuestionsChange(questions.map((q) => (q.id === id ? { ...q, text } : q)));

  // ── Build final payload ───────────────────────────────────────────────────
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

  // ── Submit ────────────────────────────────────────────────────────────────
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

  // ── Render ────────────────────────────────────────────────────────────────
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
          <button
            onClick={handleRephrase}
            className="underline font-medium ml-3"
          >
            Try Again
          </button>
        </div>
      )}

      <div className="space-y-3 sm:space-y-4 w-full overflow-x-hidden">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 min-w-0">
          <div className="px-6 pt-6 pb-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base sm:text-lg font-bold text-gray-900">
                {PAGE_TITLES.GENERATE_WITH_AI ?? "Create Interview Questions"}
              </h2>
            </div>

            {/* Sub-header */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-900">
                Write Your Questions Here
              </span>
              <div className="flex items-center gap-3">
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

                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={atLimit}
                  title={
                    atLimit ? "Maximum 10 questions allowed" : "Add a question"
                  }
                  className="flex items-center gap-2 bg-[#F4781B] hover:bg-[#e06a10] text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span className="text-lg leading-none">+</span>
                  Add More
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-400 mb-3 text-right">
              {questions.length} / {MAX_QUESTIONS} questions
            </p>

            {/* Question list */}
            <div className="flex flex-col gap-5">
              {questions.map((q, idx) => (
                <div key={q.id} className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-900 whitespace-nowrap w-28 flex-shrink-0">
                    Questions {idx + 1} )
                  </span>

                  {editingId === q.id ? (
                    <input
                      autoFocus
                      type="text"
                      value={q.text}
                      onChange={(e) => handleChange(q.id, e.target.value)}
                      onBlur={() => setEditingId(null)}
                      onKeyDown={(e) => e.key === "Enter" && setEditingId(null)}
                      className="flex-1 px-4 py-3 text-sm text-gray-900 border border-[#F4781B] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F4781B]/30"
                      placeholder="Type your question here..."
                    />
                  ) : (
                    <div
                      className="flex-1 px-4 py-3 text-sm text-gray-400 bg-gray-50 border border-gray-200 rounded-xl cursor-text select-none"
                      onClick={() => setEditingId(q.id)}
                    >
                      {q.text ||
                        "Lorem ipsum dolor sit amet consectetur Non commodo tellus non enim sit?"}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setEditingId(q.id)}
                    className="flex-shrink-0 text-green-500 hover:text-green-600 transition-colors"
                    title="Edit"
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(q.id)}
                    className="flex-shrink-0 text-red-400 hover:text-red-500 transition-colors"
                    title="Delete"
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
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
                  {BUTTON_LABELS.CREATE}{" "}
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
