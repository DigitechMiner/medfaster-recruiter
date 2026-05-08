"use client";

import ScoreCard from "@/components/card/scorecard";
import { TableTabs } from "@/components/table/TableTabs";
import { useCandidateDocumentUrl } from "@/hooks/useApplicationActions";
import type { CandidateDetailVM, ScoreRound } from "@/Interface/view-models";
import {
  BriefcaseBusiness,
  CheckCircle2,
  Eye,
  Star,
  XCircle,
} from "lucide-react";

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
  "Conversational Round": [
    { key: "engagement", label: "Engagement", max: 25 },
    { key: "adaptability", label: "Adaptability", max: 25 },
    { key: "responsiveness", label: "Responsiveness", max: 25 },
    { key: "clarity_of_thought", label: "Clarity of Thought", max: 25 },
  ],
  "Behavioral Round": [
    { key: "empathy", label: "Empathy", max: 25 },
    { key: "ethical_reasoning", label: "Ethical Reasoning", max: 25 },
    { key: "stress_management", label: "Stress Management", max: 25 },
    { key: "team_collaboration", label: "Team Collaboration", max: 25 },
  ],
  "Communication analysis": [
    { key: "confidence", label: "Confidence", max: 25 },
    { key: "articulation", label: "Articulation", max: 25 },
    { key: "active_listening", label: "Active Listening", max: 25 },
    { key: "structure_of_answers", label: "Structure of Answers", max: 25 },
  ],
  "Accuracy of answers": [
    { key: "medical_accuracy", label: "Medical Accuracy", max: 25 },
    { key: "clinical_reasoning", label: "Clinical Reasoning", max: 25 },
    {
      key: "evidence_based_decision",
      label: "Evidence Based Decision",
      max: 25,
    },
    {
      key: "patient_safety_awareness",
      label: "Patient Safety Awareness",
      max: 25,
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
        <ScoreCard score={round.score} maxScore={100} category={title} />
      </div>

      {/* Metric bars */}
      <div className="flex flex-col gap-3">
        {metrics.map(({ key, label, max }) => {
          const raw = Number((round as Record<string, unknown>)[key] ?? 0);
          const percent = Math.round((raw / max) * 100);
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
export function GeneralScoreTab({
  candidate,
}: {
  candidate: CandidateDetailVM;
}) {
  const {
    overall_score,
    interview_summary_block,
    conversational_round,
    behavioral_round,
    communication_analysis,
    accuracy_of_answers,
  } = candidate.general_score;

  const hasAnyRound =
    conversational_round ||
    behavioral_round ||
    communication_analysis ||
    accuracy_of_answers;

  if (!hasAnyRound && overall_score === null) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
        <p className="text-sm">No interview record available.</p>
      </div>
    );
  }

  const rounds: { title: string; data: ScoreRound }[] = [
    { title: "Conversational Round", data: conversational_round },
    { title: "Behavioral Round", data: behavioral_round },
    { title: "Communication analysis", data: communication_analysis },
    { title: "Accuracy of answers", data: accuracy_of_answers },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* ── Top Summary Section ── */}
      {interview_summary_block && (
        <div className="border border-gray-200 rounded-2xl p-5 flex flex-col gap-4">
          {/* Recommendation badge — top right */}
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-semibold text-gray-900">
              Interview Summary
            </h3>
            {interview_summary_block.recommendation && (
              <RecommendationBadge
                value={interview_summary_block.recommendation}
              />
            )}
          </div>

          {/* Summary text */}
          {interview_summary_block.interview_summary && (
            <p className="text-sm text-gray-500 leading-relaxed">
              {interview_summary_block.interview_summary}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
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

            {/* Risk Flags */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Risk Flags
              </p>
              <ul className="flex flex-col gap-2">
                {[
                  {
                    key: "communication_red_flag",
                    label: "Communication Red Flag",
                  },
                  {
                    key: "unsafe_decision_detected",
                    label: "Unsafe Decision Detected",
                  },
                  {
                    key: "critical_safety_violation",
                    label: "Critical Safety Violation",
                  },
                ].map(({ key, label }) => {
                  const flagged =
                    interview_summary_block.risk_flags[
                      key as keyof typeof interview_summary_block.risk_flags
                    ];
                  return (
                    <li key={key} className="flex items-center gap-2 text-sm">
                      {flagged ? (
                        <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                      )}
                      <span
                        className={
                          flagged ? "text-red-600 font-medium" : "text-gray-500"
                        }
                      >
                        {label}
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
  const isRecommended =
    value.toLowerCase().includes("recommended") &&
    !value.toLowerCase().includes("not");

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
        isRecommended
          ? "bg-emerald-100 text-emerald-700"
          : "bg-red-100 text-red-600"
      }`}
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
