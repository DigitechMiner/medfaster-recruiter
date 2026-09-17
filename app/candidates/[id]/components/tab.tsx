"use client";

import ScoreCard from "@/components/card/scorecard";
import { TableTabs } from "@/components/table/TableTabs";
import { useCandidateDocumentUrl } from "@/hooks/useApplicationActions";
import type { CandidateDetailVM, ScoreRound } from "@/types/view-models";
import {
  BriefcaseBusiness,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  Star,
  XCircle,
} from "lucide-react";
import { toLabel } from "./helpers";

export const CANDIDATE_DETAIL_TABS = [
  "General score",
  "Qualifications",
  "Documentations",
  "Job Experience",
  "Work History",
  "Reviews & Ratings",
] as const;

export type CandidateDetailTab = (typeof CANDIDATE_DETAIL_TABS)[number];

const formatEducationDate = (value: string | null) => {
  if (!value) return null;
  const trimmedValue = value.trim();
  if (!trimmedValue) return null;

  const monthYearMatch = trimmedValue.match(/^(\d{1,2})\/(\d{4})$/);
  if (monthYearMatch) {
    const month = Number(monthYearMatch[1]);
    const year = Number(monthYearMatch[2]);
    if (month >= 1 && month <= 12) {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        year: "numeric",
      }).format(new Date(year, month - 1, 1));
    }
  }

  const parsedDate = Date.parse(trimmedValue);
  if (!Number.isNaN(parsedDate) && trimmedValue.includes("-")) {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      year: "numeric",
    }).format(new Date(parsedDate));
  }

  return trimmedValue;
};

const getEducationDateRange = (
  startYear: string | null,
  endYear: string | null,
) => {
  const start = formatEducationDate(startYear);
  const end = formatEducationDate(endYear);

  if (start && end) return `${start} - ${end}`;
  if (start) return `${start} - Present`;
  if (end) return `Until ${end}`;
  return "Dates not available";
};

const getCompactExperienceLabel = (months: number | null) => {
  if (months === null) return null;
  const years = Math.floor(months / 12);
  if (years === 0) return `${months}+ months`;
  return `${years}+ ${years === 1 ? "year" : "years"}`;
};

type CandidateDetailTabsProps = {
  activeTab: CandidateDetailTab;
  candidate: CandidateDetailVM;
  fullName: string;
  onTabChange: (tab: CandidateDetailTab) => void;
};

export function CandidateDetailTabs({
  activeTab,
  candidate,
  fullName,
  onTabChange,
}: CandidateDetailTabsProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="border-b border-gray-200 bg-[#FCFCFD]">
        <TableTabs
          tabs={CANDIDATE_DETAIL_TABS.map((tab) => ({ key: tab, label: tab }))}
          activeTab={activeTab}
          onTabChange={onTabChange}
          className="bg-[#FCFCFD]"
          wrapperClassName="flex"
          tabClassName="relative px-5 py-4 text-sm font-medium transition-colors whitespace-nowrap"
          activeTabClassName="text-[#F4781B]"
          inactiveTabClassName="text-gray-400 hover:text-gray-600"
          activeIndicatorClassName="absolute bottom-0 left-0 right-0 h-[2px] bg-[#F4781B] rounded-t-full"
        />
      </div>
      <div className="p-4 sm:p-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <CandidateDetailTabPanel
          activeTab={activeTab}
          candidate={candidate}
          fullName={fullName}
        />
      </div>
    </div>
  );
}

function CandidateDetailTabPanel({
  activeTab,
  candidate,
  fullName,
}: {
  activeTab: CandidateDetailTab;
  candidate: CandidateDetailVM;
  fullName: string;
}) {
  switch (activeTab) {
    case "General score":
      return <GeneralScoreTab candidate={candidate} />;
    case "Qualifications":
      return <QualificationsTab candidate={candidate} />;
    case "Documentations":
      return <DocumentationsTab candidate={candidate} fullName={fullName} />;
    case "Job Experience":
      return <JobExperienceTab candidate={candidate} />;
    case "Work History":
      return <WorkHistoryTab candidate={candidate} />;
    case "Reviews & Ratings":
      return <ReviewsRatingsTab candidate={candidate} />;
  }
}
const ROUND_METRICS: Record<
  string,
  { key: string; label: string; max: number }[]
> = {
  "Conversational Intelligence": [
    { key: "engagement", label: "Engagement", max: 100 },
    { key: "adaptability", label: "Adaptability", max: 100 },
    { key: "responsiveness", label: "Responsiveness", max: 100 },
    { key: "clarity_of_thought", label: "Clarity of Thought", max: 100 },
  ],
  "Behavioral Professionalism": [
    { key: "empathy", label: "Empathy", max: 100 },
    { key: "ethical_reasoning", label: "Ethical Reasoning", max: 100 },
    { key: "stress_management", label: "Stress Management", max: 100 },
    { key: "team_collaboration", label: "Team Collaboration", max: 100 },
  ],
  "Communication Clarity": [
    { key: "confidence", label: "Confidence", max: 100 },
    { key: "articulation", label: "Articulation", max: 100 },
    { key: "active_listening", label: "Active Listening", max: 100 },
    { key: "structure_of_answers", label: "Structure of Answers", max: 100 },
  ],
  "Clinical Competency": [
    { key: "medical_accuracy", label: "Medical Accuracy", max: 100 },
    { key: "clinical_reasoning", label: "Clinical Reasoning", max: 100 },
    {
      key: "evidence_based_decision",
      label: "Evidence Based Decision",
      max: 100,
    },
    {
      key: "patient_safety_awareness",
      label: "Patient Safety Awareness",
      max: 100,
    },
  ],
};

function RoundCard({ title, round }: { title: string; round: ScoreRound }) {
  if (!round) return null;
  const metrics = ROUND_METRICS[title] ?? [];

  return (
    <div className="border border-gray-200 rounded-2xl p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {round.score !== null ? (
          <ScoreCard score={round.score} maxScore={100} category={title} />
        ) : null}
      </div>

      {/* Metric bars */}
      <div className="flex flex-col gap-3">
        {metrics.map(({ key, label, max }) => {
          const raw = Number((round as Record<string, unknown>)[key] ?? 0);
          const percent = Math.min(100, Math.round((raw / max) * 100));
          const isLow = percent < 50;
          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-500">{label}</span>
                <span className="text-sm font-bold text-gray-900">
                  {percent}%
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    isLow ? "bg-red-500" : "bg-emerald-500"
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatInterviewDuration(seconds: number | null): string | null {
  if (seconds == null || !Number.isFinite(seconds) || seconds < 0) return null;
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs.toString().padStart(2, "0")}s`;
}

function formatInterviewDate(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-CA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function GeneralScoreTab({
  candidate,
}: {
  candidate: CandidateDetailVM;
}) {
  const {
    overall_score,
    max_self_interview_score,
    interview_summary_block,
    conversational_round,
    behavioral_round,
    communication_analysis,
    accuracy_of_answers,
    interview_created_at,
    interview_type,
    interview_status,
    interview_duration_sec,
    interview_context,
  } = candidate.general_score;

  const hasAnyRound =
    conversational_round ||
    behavioral_round ||
    communication_analysis ||
    accuracy_of_answers;

  if (
    !hasAnyRound &&
    overall_score === null &&
    !interview_context &&
    !interview_summary_block
  ) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
        <p className="text-sm">No interview record available.</p>
      </div>
    );
  }

  const rounds: { title: string; data: ScoreRound }[] = [
    { title: "Conversational Intelligence", data: conversational_round },
    { title: "Behavioral Professionalism", data: behavioral_round },
    { title: "Communication Clarity", data: communication_analysis },
    { title: "Clinical Competency", data: accuracy_of_answers },
  ];

  const durationLabel = formatInterviewDuration(interview_duration_sec);
  const createdLabel = formatInterviewDate(interview_created_at);
  const typeLabel = interview_type
    ? interview_type.replace(/_/g, " ").toUpperCase()
    : null;
  const statusLabel = interview_status
    ? interview_status.replace(/_/g, " ").toUpperCase()
    : null;
  const hasInterviewMeta = Boolean(
    typeLabel || statusLabel || durationLabel || createdLabel,
  );

  const showOverallHeader =
    overall_score !== null ||
    max_self_interview_score !== null ||
    hasInterviewMeta ||
    Boolean(interview_summary_block?.recommendation);

  const contextJobTitles =
    interview_context?.job_titles?.length
      ? interview_context.job_titles
      : interview_context?.job_title
        ? [interview_context.job_title]
        : [];

  const contextFields = interview_context
    ? (
        [
          {
            label: "Candidate",
            value: interview_context.candidate_name,
          },
          {
            label: "Department",
            value: interview_context.department
              ? toLabel(interview_context.department)
              : null,
          },
          {
            label: "Education",
            value: interview_context.education,
          },
          {
            label: "Experience",
            value:
              interview_context.year_of_experience != null
                ? `${interview_context.year_of_experience}+ ${
                    interview_context.year_of_experience === 1 ? "year" : "years"
                  }`
                : null,
          },
          {
            label: "Interview type",
            value: interview_context.interview_type
              ? toLabel(interview_context.interview_type)
              : null,
          },
        ] as { label: string; value: string | null }[]
      ).filter((field) => Boolean(field.value))
    : [];

  return (
    <div className="flex flex-col gap-5">
      {/* ── Overall score header ── */}
      {showOverallHeader && (
        <div className="border border-gray-200 rounded-2xl p-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-3 min-w-0">
            <h3 className="text-base font-semibold text-gray-900">
              Overall AI Interview Score
            </h3>

            {hasInterviewMeta && (
              <div className="flex flex-wrap items-center gap-2">
                {typeLabel && (
                  <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-gray-700">
                    {typeLabel}
                  </span>
                )}
                {statusLabel && (
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide ${
                      statusLabel === "COMPLETED"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        : "bg-gray-50 text-gray-700 border border-gray-200"
                    }`}
                  >
                    {statusLabel}
                  </span>
                )}
                {(durationLabel || createdLabel) &&
                  (typeLabel || statusLabel) && (
                    <span
                      className="hidden sm:inline-block h-4 w-px bg-gray-200 mx-0.5"
                      aria-hidden
                    />
                  )}
                {durationLabel && (
                  <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
                    <Clock className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    <span>
                      <span className="text-gray-400">Duration</span>{" "}
                      <span className="font-medium text-gray-700">
                        {durationLabel}
                      </span>
                    </span>
                  </span>
                )}
                {createdLabel && (
                  <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
                    <Calendar className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    <span>
                      <span className="text-gray-400">Completed</span>{" "}
                      <span className="font-medium text-gray-700">
                        {createdLabel}
                      </span>
                    </span>
                  </span>
                )}
              </div>
            )}

            {interview_summary_block?.recommendation && (
              <div>
                <RecommendationBadge
                  value={interview_summary_block.recommendation}
                />
              </div>
            )}
          </div>
          {(overall_score !== null ||
            (max_self_interview_score !== null &&
              max_self_interview_score !== overall_score)) && (
            <div className="flex items-center gap-3 shrink-0">
              {overall_score !== null && (
                <ScoreCard
                  score={overall_score}
                  maxScore={100}
                  category="Overall"
                />
              )}
              {max_self_interview_score !== null &&
                max_self_interview_score !== overall_score && (
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Max self score</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {max_self_interview_score}/100
                    </p>
                  </div>
                )}
            </div>
          )}
        </div>
      )}

      {/* ── Interview context ── */}
      {interview_context &&
        (contextFields.length > 0 ||
          contextJobTitles.length > 0 ||
          interview_context.specializations.length > 0) && (
          <div className="border border-gray-200 rounded-2xl p-5 flex flex-col gap-4">
            <h3 className="text-base font-semibold text-gray-900">
              Interview Context
            </h3>

            {contextFields.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {contextFields.map(({ label, value }) => (
                  <div
                    key={label}
                    className="rounded-xl bg-gray-50 px-3.5 py-3"
                  >
                    <p className="text-xs text-gray-500 mb-1">{label}</p>
                    <p className="text-sm font-medium text-gray-900 break-words">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {contextJobTitles.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Job titles
                </p>
                <div className="flex flex-wrap gap-2">
                  {contextJobTitles.map((title) => (
                    <span
                      key={title}
                      className="rounded-md bg-[#F3F4F6] px-2.5 py-1 text-xs text-[#525866]"
                    >
                      {toLabel(title)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {interview_context.specializations.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Specializations
                </p>
                <div className="flex flex-wrap gap-2">
                  {interview_context.specializations.map((spec) => (
                    <span
                      key={spec}
                      className="rounded-md bg-[#F3F4F6] px-2.5 py-1 text-xs text-[#525866]"
                    >
                      {toLabel(spec)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      {/* ── Top Summary Section ── */}
      {interview_summary_block && (
        <div className="border border-gray-200 rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-semibold text-gray-900">
              Interview Summary
            </h3>
            {interview_summary_block.recommendation &&
              overall_score === null && (
                <RecommendationBadge
                  value={interview_summary_block.recommendation}
                />
              )}
          </div>

          {interview_summary_block.interview_summary && (
            <p className="text-sm text-gray-500 leading-relaxed">
              {interview_summary_block.interview_summary}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {interview_summary_block.strengths.length > 0 && (
              <div className="bg-emerald-50 rounded-xl p-4">
                <p className="text-sm font-semibold text-emerald-700 flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white flex-shrink-0">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path
                        d="M2 5l2.5 2.5L8 3"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  Strengths
                </p>
                <ul className="flex flex-col gap-1">
                  {interview_summary_block.strengths.map((s, i) => (
                    <li
                      key={i}
                      className="text-sm text-emerald-800 flex items-start gap-2"
                    >
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {interview_summary_block.areas_to_improve.length > 0 && (
              <div className="bg-amber-50 rounded-xl p-4">
                <p className="text-sm font-semibold text-amber-700 mb-2">
                  Areas to Improve
                </p>
                <ul className="flex flex-col gap-1">
                  {interview_summary_block.areas_to_improve.map((item, i) => (
                    <li
                      key={i}
                      className="text-sm text-amber-800 flex items-start gap-2"
                    >
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div
              className={`rounded-xl p-4 ${
                Object.values(interview_summary_block.risk_flags).some(Boolean)
                  ? "bg-red-50"
                  : "bg-gray-50"
              }`}
            >
              <p className="text-sm font-semibold text-gray-700 mb-3">
                Risk Flags
              </p>
              <ul className="flex flex-col gap-2.5">
                {[
                  {
                    key: "communication_red_flag" as const,
                    label: "Communication Red Flag",
                  },
                  {
                    key: "unsafe_decision_detected" as const,
                    label: "Unsafe Decision Detected",
                  },
                  {
                    key: "critical_safety_violation" as const,
                    label: "Critical Safety Violation",
                  },
                ].map(({ key, label }) => {
                  const flagged = Boolean(
                    interview_summary_block.risk_flags?.[key],
                  );
                  return (
                    <li
                      key={key}
                      className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2.5 border border-gray-100"
                    >
                      <span className="flex items-center gap-2 text-sm text-gray-700 min-w-0">
                        {flagged ? (
                          <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                        )}
                        <span className="truncate">{label}</span>
                      </span>
                      <span
                        className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          flagged
                            ? "bg-red-100 text-red-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {flagged ? "True" : "False"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ── 4 Round Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rounds.map(({ title, data }) =>
          data ? <RoundCard key={title} title={title} round={data} /> : null,
        )}
      </div>
    </div>
  );
}

// Recommendation badge component
function RecommendationBadge({ value }: { value: string }) {
  const normalized = value.toLowerCase();
  const isNotRecommended = normalized.includes("not recommended");
  const needsCoaching =
    !isNotRecommended && normalized.includes("coaching");
  const isRecommended = !isNotRecommended && normalized.includes("recommended");

  const className = isNotRecommended
    ? "bg-red-100 text-red-600"
    : needsCoaching
      ? "bg-[#FFF4E5] text-[#B54708]"
      : isRecommended
        ? "bg-emerald-100 text-emerald-700"
        : "bg-gray-100 text-gray-600";

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${className}`}
    >
      {value}
    </span>
  );
}

export function QualificationsTab({
  candidate,
}: {
  candidate: CandidateDetailVM;
}) {
  return (
    <div className="space-y-5">
      <div className="border border-gray-200 rounded-xl p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-5">
          Education
        </h2>
        {candidate.qualifications.length === 0 ? (
          <p className="text-sm text-gray-400">No education records found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {candidate.qualifications.map((edu) => (
              <div
                key={edu.id}
                className="border border-gray-200 rounded-xl p-4"
              >
                <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                  {edu.institution ?? "—"}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">{edu.degree}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {getEducationDateRange(edu.start_year, edu.end_year)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function DocumentationsTab({
  candidate,
  fullName,
}: {
  candidate: CandidateDetailVM;
  fullName: string;
}) {
  const { fetchUrl } = useCandidateDocumentUrl();

  const handleViewDoc = async (candidateId: string, documentId: string) => {
    try {
      const url = await fetchUrl(candidateId, documentId);
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      return;
    }
  };

  const allDocuments = [
    ...candidate.documents.personal,
    ...candidate.documents.licenses_certificates,
  ];

  return (
    <div className="space-y-5">
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 pt-5 pb-3">
          <h2 className="text-base font-semibold text-gray-900">Documents</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-[#FCFCFD]">
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Title
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Verified
              </th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">
                View
              </th>
            </tr>
          </thead>
          <tbody>
            {allDocuments.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-6 text-center text-sm text-gray-400"
                >
                  No documents found.
                </td>
              </tr>
            ) : (
              allDocuments.map((doc) => (
                <tr
                  key={doc.document_id}
                  className="border-b border-gray-100 last:border-b-0"
                >
                  <td className="px-4 py-3.5 text-gray-800">{doc.title}</td>
                  <td className="px-4 py-3.5">
                    <span
                      className="inline-flex items-center"
                      title={doc.verified ? "Verified" : "Not verified"}
                      aria-label={doc.verified ? "Verified" : "Not verified"}
                    >
                      {doc.verified ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-rose-500" />
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <button
                      onClick={() =>
                        handleViewDoc(candidate.id, doc.document_id)
                      }
                      className="inline-flex items-center justify-center text-[#F4781B] hover:text-[#da6510] transition-colors"
                      aria-label={`View ${doc.title} for ${fullName}`}
                      title="View document"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function JobExperienceTab({
  candidate,
}: {
  candidate: CandidateDetailVM;
}) {
  if (candidate.work_experiences.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 p-5 text-sm text-gray-400">
        No work experience records found.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 sm:px-5">
        <h3 className="text-[28px] font-semibold leading-none text-[#242833]">
          Work Experience
        </h3>
        <span className="text-2xl font-semibold text-[#F4781B]">
          {getCompactExperienceLabel(
            candidate.kpis.total_work_experience_months,
          ) ?? candidate.kpis.total_work_experience}
        </span>
      </div>
      <div className="space-y-0 px-4 sm:px-5">
        {candidate.work_experiences.map((exp) => (
          <div
            key={exp.id}
            className="border-b border-gray-100 py-4 last:border-b-0"
          >
            <div className="mb-2 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {exp.organization}
                </p>
                <p className="text-xs text-gray-600">
                  {exp.role} {exp.job_type ? `• ${exp.job_type}` : ""}
                </p>
              </div>
              <p className="text-xs font-medium text-[#3B414F] whitespace-nowrap">
                {exp.start_date} - {exp.end_date ?? "Present"}
              </p>
            </div>
            {exp.description ? (
              <p className="text-sm text-gray-500">{exp.description}</p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
// ── Reusable Empty State ──────────────────────────────────────────────────────
function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center mb-3 text-gray-400">
        {icon}
      </div>
      <p className="text-sm font-semibold text-gray-700 mb-1">{title}</p>
      <p className="text-xs text-gray-400 max-w-[200px] leading-relaxed">
        {description}
      </p>
    </div>
  );
}

// ── WorkHistoryTab ────────────────────────────────────────────────────────────
export function WorkHistoryTab({
  candidate,
}: {
  candidate: CandidateDetailVM;
}) {
  const hasHistory = candidate.work_history?.length > 0;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {hasHistory ? (
        <table className="w-full text-sm">
          <tbody>
            {candidate.work_history.map((row) => (
              <tr
                key={row.application_id}
                className="border-b border-gray-100 last:border-b-0"
              >
                <td className="px-4 py-3.5 text-gray-800 text-sm font-medium">
                  {row.job_title}
                </td>
                <td className="px-4 py-3.5 text-gray-500 text-sm">
                  {row.organization}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <EmptyState
          icon={<BriefcaseBusiness className="w-5 h-5" />}
          title="No work history yet"
          description="Past assignments and jobs will appear here once completed."
        />
      )}
    </div>
  );
}

// ── ReviewsRatingsTab ─────────────────────────────────────────────────────────
export function ReviewsRatingsTab({
  candidate,
}: {
  candidate: CandidateDetailVM;
}) {
  const displayScore =
    candidate.general_score?.avg_rating_score ??
    candidate.ratings?.average_score ??
    0;
  const totalReviews = candidate.ratings?.total_reviews ?? 0;
  const hasReviews = totalReviews > 0;

  return (
    <div className="space-y-5">
      <div className="border border-gray-200 rounded-xl p-5">
        {hasReviews ? (
          <>
            <p className="text-5xl font-bold text-gray-900">
              {displayScore.toFixed(1)}
            </p>
            <p className="text-xs text-gray-500 mt-1">{totalReviews} reviews</p>
          </>
        ) : (
          <EmptyState
            icon={<Star className="w-5 h-5" />}
            title="No reviews yet"
            description="Ratings from completed shifts will show up here."
          />
        )}
      </div>
    </div>
  );
}
