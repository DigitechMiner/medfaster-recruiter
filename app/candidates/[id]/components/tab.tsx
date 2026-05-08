"use client";

import { useCandidateDocumentUrl } from "@/hooks/useApplicationActions";
import type { CandidateDetailVM } from "@/Interface/view-models";
import { CheckCircle2, Eye, XCircle } from "lucide-react";

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
      return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(
        new Date(year, month - 1, 1)
      );
    }
  }

  const parsedDate = Date.parse(trimmedValue);
  if (!Number.isNaN(parsedDate) && trimmedValue.includes("-")) {
    return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(
      new Date(parsedDate)
    );
  }

  return trimmedValue;
};

const getEducationDateRange = (startYear: string | null, endYear: string | null) => {
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
      <div className="border-b border-gray-200 overflow-x-auto bg-[#FCFCFD] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex min-w-max">
          {CANDIDATE_DETAIL_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`px-4 sm:px-5 py-3 text-xs sm:text-sm font-medium whitespace-nowrap border-b-2 ${
                activeTab === tab
                  ? "border-orange-500 text-[#F4781B]"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
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

export function GeneralScoreTab({ candidate }: { candidate: CandidateDetailVM }) {
  const interviewScore = candidate.general_score.overall_score;

  if (interviewScore === null) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
        <p className="text-sm">No interview record available.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-xs uppercase tracking-wide text-gray-500">Interview Score</p>
      <p className="text-4xl font-bold text-gray-900 mt-2">{interviewScore}</p>
    </div>
  );
}

export function QualificationsTab({ candidate }: { candidate: CandidateDetailVM }) {
  return (
    <div className="space-y-5">
      <div className="border border-gray-200 rounded-xl p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-5">Education</h2>
        {candidate.qualifications.length === 0 ? (
          <p className="text-sm text-gray-400">No education records found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {candidate.qualifications.map((edu) => (
              <div key={edu.id} className="border border-gray-200 rounded-xl p-4">
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

  const allDocuments = [...candidate.documents.personal, ...candidate.documents.licenses_certificates];

  return (
    <div className="space-y-5">
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 pt-5 pb-3">
          <h2 className="text-base font-semibold text-gray-900">Documents</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-[#FCFCFD]">
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Title</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Verified</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">View</th>
            </tr>
          </thead>
          <tbody>
            {allDocuments.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-sm text-gray-400">
                  No documents found.
                </td>
              </tr>
            ) : (
              allDocuments.map((doc) => (
                <tr key={doc.document_id} className="border-b border-gray-100 last:border-b-0">
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
                      onClick={() => handleViewDoc(candidate.id, doc.document_id)}
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

export function JobExperienceTab({ candidate }: { candidate: CandidateDetailVM }) {
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
        <h3 className="text-[28px] font-semibold leading-none text-[#242833]">Work Experience</h3>
        <span className="text-2xl font-semibold text-[#F4781B]">
          {getCompactExperienceLabel(candidate.kpis.total_work_experience_months) ??
            candidate.kpis.total_work_experience}
        </span>
      </div>
      <div className="space-y-0 px-4 sm:px-5">
        {candidate.work_experiences.map((exp) => (
          <div key={exp.id} className="border-b border-gray-100 py-4 last:border-b-0">
            <div className="mb-2 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">{exp.organization}</p>
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

export function WorkHistoryTab({ candidate }: { candidate: CandidateDetailVM }) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <tbody>
          {candidate.work_history.map((row) => (
            <tr key={row.application_id} className="border-b border-gray-100">
              <td className="px-4 py-3.5 text-gray-800 text-sm">{row.job_title}</td>
              <td className="px-4 py-3.5 text-gray-600 text-sm">{row.organization}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ReviewsRatingsTab({ candidate }: { candidate: CandidateDetailVM }) {
  const displayScore =
    candidate.general_score.avg_rating_score ?? candidate.ratings.average_score ?? 0;

  return (
    <div className="space-y-5">
      <div className="border border-gray-200 rounded-xl p-5">
        <p className="text-5xl font-bold text-gray-900">{displayScore.toFixed(1)}</p>
        <p className="text-xs text-gray-500">{candidate.ratings.total_reviews} reviews</p>
      </div>
    </div>
  );
}

