"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Bot,
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  MessageSquareText,
  XCircle,
} from "lucide-react";
import ScoreCard from "@/components/card/scorecard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getInterviewById } from "@/features/jobs";
import type {
  AiInterviewResultPayload,
  AiInterviewRoundBreakdown,
  AiInterviewScoreBreakdown,
} from "@/features/candidates/types";
import type { InterviewDetailsResponse } from "@/features/jobs/types";
import { formatLabel } from "../shared/job-detail-helpers";

type InterviewResultDetailsModalProps = {
  open: boolean;
  interviewId: string | null;
  /** Result from the applications list (shown while details load / as fallback). */
  initialResult?: AiInterviewResultPayload | null;
  candidateName?: string | null;
  candidateProfileImageUrl?: string | null;
  jobTitle?: string | null;
  overallScore?: number | null;
  onClose: () => void;
};

const BREAKDOWN_LABELS: {
  key: keyof AiInterviewScoreBreakdown;
  label: string;
}[] = [
  { key: "conversational_intelligence", label: "Conversational Intelligence" },
  { key: "behavioral_professionalism", label: "Behavioral Professionalism" },
  { key: "communication_clarity", label: "Communication Clarity" },
  { key: "clinical_competency", label: "Clinical Competency" },
];

function RecommendationBadge({ value }: { value: string }) {
  const normalized = value.toLowerCase();
  const isNotRecommended = normalized.includes("not recommended");
  const needsCoaching =
    !isNotRecommended && normalized.includes("coaching");
  const isRecommended =
    !isNotRecommended && normalized.includes("recommended");

  const className = isNotRecommended
    ? "bg-red-100 text-red-600"
    : needsCoaching
      ? "bg-[#FFF4E5] text-[#B54708]"
      : isRecommended
        ? "bg-emerald-100 text-emerald-700"
        : "bg-gray-100 text-gray-600";

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${className}`}
    >
      {value}
    </span>
  );
}

function RoundBreakdown({
  title,
  round,
}: {
  title: string;
  round: AiInterviewRoundBreakdown;
}) {
  const entries = Object.entries(round.sub_metrics ?? {});

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
        <span className="text-sm font-bold tabular-nums text-gray-900">
          {Math.round(round.score)}
        </span>
      </div>
      {entries.length > 0 ? (
        <div className="flex flex-col gap-2.5">
          {entries.map(([key, raw]) => {
            const value = Number(raw) || 0;
            const percent = Math.min(100, Math.round(value));
            return (
              <div key={key}>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-xs text-gray-500">
                    {formatLabel(key)}
                  </span>
                  <span className="text-xs font-semibold tabular-nums text-gray-800">
                    {percent}%
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full ${
                      percent < 50 ? "bg-red-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function resolveResult(
  details: InterviewDetailsResponse | null,
  initialResult?: AiInterviewResultPayload | null,
): AiInterviewResultPayload | null {
  return (
    details?.result ??
    details?.interview_result ??
    initialResult ??
    null
  );
}

function pickString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function formatInterviewDuration(seconds: number | null | undefined): string | null {
  if (seconds == null || !Number.isFinite(seconds) || seconds < 0) return null;
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs.toString().padStart(2, "0")}s`;
}

function formatInterviewDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString("en-CA", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

type NormalizedTranscript = {
  role: "ai" | "candidate";
  text: string;
  sequence: number;
};

/**
 * API transcript turns are `{ ai: "..." }` or `{ candidate: "..." }`.
 * Also accepts legacy `{ role, text|content }` shapes.
 */
function normalizeTranscriptEntry(
  entry: unknown,
  index: number,
): NormalizedTranscript | null {
  if (!entry || typeof entry !== "object") {
    if (typeof entry === "string" && entry.trim()) {
      return { role: "ai", text: entry.trim(), sequence: index };
    }
    return null;
  }

  const raw = entry as Record<string, unknown>;

  const aiText = pickString(raw.ai, raw.assistant, raw.interviewer);
  if (aiText) {
    return { role: "ai", text: aiText, sequence: index };
  }

  const candidateText = pickString(raw.candidate, raw.user);
  if (candidateText) {
    return { role: "candidate", text: candidateText, sequence: index };
  }

  const text = pickString(
    raw.text,
    raw.content,
    raw.message,
    raw.body,
    raw.utterance,
  );
  if (!text) return null;

  const roleRaw = pickString(raw.role, raw.speaker, raw.sender).toLowerCase();
  const isCandidate =
    roleRaw === "candidate" ||
    roleRaw === "user" ||
    roleRaw.includes("candidate");

  return {
    role: isCandidate ? "candidate" : "ai",
    text,
    sequence:
      typeof raw.sequence === "number"
        ? raw.sequence
        : typeof raw.index === "number"
          ? raw.index
          : index,
  };
}

function resolveTranscripts(
  details: InterviewDetailsResponse | null,
): NormalizedTranscript[] {
  if (!details) return [];

  const rawList = details.transcript ?? details.transcripts ?? [];
  if (!Array.isArray(rawList)) return [];

  return rawList
    .map((entry, index) => normalizeTranscriptEntry(entry, index))
    .filter((entry): entry is NormalizedTranscript => entry != null);
}

function resolveOverallScore(
  details: InterviewDetailsResponse | null,
  result: AiInterviewResultPayload | null,
  fallback?: number | null,
): number | null {
  if (details?.overall_score != null) return details.overall_score;
  if (result?.overall_score != null) return result.overall_score;
  if (fallback != null) return fallback;
  return null;
}

export function InterviewResultDetailsModal({
  open,
  interviewId,
  initialResult = null,
  candidateName,
  candidateProfileImageUrl,
  jobTitle,
  overallScore,
  onClose,
}: InterviewResultDetailsModalProps) {
  const [details, setDetails] = useState<InterviewDetailsResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !interviewId) {
      setDetails(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getInterviewById(interviewId)
      .then((data) => {
        if (!cancelled) setDetails(data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          (err as { response?: { data?: { message?: string } }; message?: string })
            ?.response?.data?.message ??
          (err as { message?: string })?.message ??
          "Unable to load interview details.";
        setError(message);
        setDetails(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, interviewId]);

  const result = resolveResult(details, initialResult);
  const score = resolveOverallScore(details, result, overallScore);
  const transcripts = resolveTranscripts(details);
  const interview = details?.interview;
  const displayCandidate =
    details?.candidate?.full_name ||
    [details?.candidate?.first_name, details?.candidate?.last_name]
      .filter(Boolean)
      .join(" ") ||
    candidateName ||
    null;
  const displayCandidateImage =
    details?.candidate?.profile_image_url || candidateProfileImageUrl || null;
  const candidateInitials = (displayCandidate || "C")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const displayJob = details?.job?.job_title || jobTitle || null;
  const recommendation = result?.recommendation ?? null;
  const strengths = result?.strengths ?? [];
  const areasToImprove = result?.areas_to_improve ?? [];
  const summary = result?.interview_summary ?? null;
  const riskFlags = result?.risk_flags;
  const breakdown = result?.score_breakdown;
  const durationLabel = formatInterviewDuration(interview?.duration_sec);
  const endedLabel = formatInterviewDate(interview?.ended_at);
  const statusLabel = interview?.status
    ? formatLabel(String(interview.status))
    : null;
  const typeLabel = interview?.interview_type
    ? formatLabel(String(interview.interview_type))
    : null;
  const terminationLabel = interview?.termination_reason
    ? formatLabel(String(interview.termination_reason))
    : null;

  const hasResultContent = Boolean(
    result || score != null || transcripts.length > 0 || interview,
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <DialogContent className="flex max-h-[92vh] w-[min(96vw,72rem)] max-w-[min(96vw,72rem)] sm:max-w-[min(96vw,72rem)] flex-col gap-0 overflow-hidden rounded-2xl p-0">
        <DialogHeader className="shrink-0 border-b border-gray-100 px-5 py-4 pr-12 text-left sm:px-6">
          <DialogTitle className="text-base font-semibold text-gray-900">
            Interview result
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            {[displayCandidate, displayJob].filter(Boolean).join(" · ") ||
              "AI interview evaluation for this application."}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
          {isLoading && !hasResultContent ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading interview details…
            </div>
          ) : error && !hasResultContent ? (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-6 text-center text-sm text-red-700">
              {error}
            </div>
          ) : !hasResultContent ? (
            <div className="py-16 text-center text-sm text-gray-400">
              No interview result available.
            </div>
          ) : (
            <div className="flex w-full min-w-0 flex-col gap-4">
              {error ? (
                <div className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  {error} Showing evaluation from the applications list.
                </div>
              ) : null}

              <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 p-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 flex-col gap-2.5">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Overall score
                  </h3>
                  {(typeLabel || statusLabel || durationLabel || endedLabel) && (
                    <div className="flex flex-wrap items-center gap-2">
                      {typeLabel ? (
                        <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-gray-700">
                          {typeLabel}
                        </span>
                      ) : null}
                      {statusLabel ? (
                        <span className="inline-flex items-center rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-amber-800">
                          {statusLabel}
                        </span>
                      ) : null}
                      {durationLabel ? (
                        <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
                          <Clock className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                          <span className="font-medium text-gray-700">
                            {durationLabel}
                          </span>
                        </span>
                      ) : null}
                      {endedLabel ? (
                        <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
                          <Calendar className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                          <span className="font-medium text-gray-700">
                            {endedLabel}
                          </span>
                        </span>
                      ) : null}
                    </div>
                  )}
                  {terminationLabel ? (
                    <p className="text-xs text-gray-500">
                      Ended reason:{" "}
                      <span className="font-medium text-gray-700">
                        {terminationLabel}
                      </span>
                    </p>
                  ) : null}
                  {recommendation ? (
                    <RecommendationBadge value={recommendation} />
                  ) : null}
                  {isLoading ? (
                    <p className="inline-flex items-center gap-1.5 text-xs text-gray-400">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Refreshing full details…
                    </p>
                  ) : null}
                </div>
                {score != null ? (
                  <ScoreCard
                    score={score}
                    maxScore={100}
                    category="Overall"
                  />
                ) : null}
              </div>

              {summary ? (
                <div className="rounded-2xl border border-gray-200 p-4">
                  <h3 className="mb-2 text-sm font-semibold text-gray-900">
                    Summary
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-600">
                    {summary}
                  </p>
                </div>
              ) : null}

              {(strengths.length > 0 || areasToImprove.length > 0) && (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {strengths.length > 0 ? (
                    <div className="rounded-xl bg-emerald-50 p-4">
                      <p className="mb-2 text-sm font-semibold text-emerald-700">
                        Strengths
                      </p>
                      <ul className="flex flex-col gap-1.5">
                        {strengths.map((item) => (
                          <li
                            key={item}
                            className="flex items-start gap-2 text-sm text-emerald-800"
                          >
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {areasToImprove.length > 0 ? (
                    <div className="rounded-xl bg-amber-50 p-4">
                      <p className="mb-2 text-sm font-semibold text-amber-700">
                        Areas to improve
                      </p>
                      <ul className="flex flex-col gap-1.5">
                        {areasToImprove.map((item) => (
                          <li
                            key={item}
                            className="flex items-start gap-2 text-sm text-amber-800"
                          >
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              )}

              {riskFlags ? (
                <div className="rounded-2xl border border-gray-200 p-4">
                  <h3 className="mb-3 text-sm font-semibold text-gray-900">
                    Risk flags
                  </h3>
                  <ul className="flex flex-col gap-2">
                    {(
                      [
                        {
                          key: "communication_red_flag" as const,
                          label: "Communication red flag",
                        },
                        {
                          key: "unsafe_decision_detected" as const,
                          label: "Unsafe decision detected",
                        },
                        {
                          key: "critical_safety_violation" as const,
                          label: "Critical safety violation",
                        },
                      ] as const
                    ).map(({ key, label }) => {
                      const flagged = Boolean(riskFlags[key]);
                      return (
                        <li
                          key={key}
                          className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
                        >
                          <span className="flex min-w-0 items-center gap-2 text-sm text-gray-700">
                            {flagged ? (
                              <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                            )}
                            <span className="truncate">{label}</span>
                          </span>
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                              flagged
                                ? "bg-red-100 text-red-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {flagged ? "Flagged" : "Clear"}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : null}

              {breakdown ? (
                <div className="flex w-full min-w-0 flex-col gap-3">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Score breakdown
                  </h3>
                  <div className="grid w-full grid-cols-1 gap-3 lg:grid-cols-2">
                    {BREAKDOWN_LABELS.map(({ key, label }) => {
                      const round = breakdown[key];
                      if (!round) return null;
                      return (
                        <RoundBreakdown
                          key={key}
                          title={label}
                          round={round}
                        />
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {transcripts.length > 0 ? (
                <div className="w-full min-w-0 rounded-2xl border border-gray-200 p-4">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <MessageSquareText className="h-4 w-4 text-gray-400" />
                    Transcript
                  </h3>
                  <div className="flex max-h-[28rem] w-full min-w-0 flex-col gap-3 overflow-y-auto bg-[#F7F8FA] p-3 sm:p-4 rounded-xl pr-1">
                    {transcripts.map((entry, index) => {
                      const isCandidate = entry.role === "candidate";
                      return (
                        <div
                          key={`${entry.role}-${entry.sequence}-${index}`}
                          className={`flex w-full min-w-0 items-end gap-2 ${
                            isCandidate ? "justify-end" : "justify-start"
                          }`}
                        >
                          {!isCandidate ? (
                            <div
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 text-white shadow-sm"
                              aria-hidden
                            >
                              <Bot className="h-4 w-4" />
                            </div>
                          ) : null}

                          <div
                            className={`max-w-[78%] min-w-0 rounded-2xl px-3.5 py-2.5 shadow-sm ${
                              isCandidate
                                ? "rounded-br-md bg-[#F4781B] text-white"
                                : "rounded-bl-md bg-white text-gray-800 ring-1 ring-gray-100"
                            }`}
                          >
                            <p
                              className={`mb-1 text-[10px] font-semibold uppercase tracking-wide ${
                                isCandidate
                                  ? "text-orange-100"
                                  : "text-gray-400"
                              }`}
                            >
                              {isCandidate ? "Candidate" : "AI Interviewer"}
                            </p>
                            <p className="break-words text-sm leading-relaxed whitespace-pre-wrap">
                              {entry.text}
                            </p>
                          </div>

                          {isCandidate ? (
                            <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-orange-100 ring-1 ring-orange-200">
                              {displayCandidateImage ? (
                                <Image
                                  src={displayCandidateImage}
                                  alt={displayCandidate || "Candidate"}
                                  width={32}
                                  height={32}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-[#F4781B]">
                                  {candidateInitials}
                                </div>
                              )}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
