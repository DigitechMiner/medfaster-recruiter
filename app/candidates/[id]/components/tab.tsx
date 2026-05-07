"use client";

import { useCandidateDocumentUrl } from "@/hooks/useApplicationActions";
import type { CandidateDetailVM } from "@/Interface/view-models";

export const CANDIDATE_DETAIL_TABS = [
  "General score",
  "Qualifications",
  "Documentations",
  "Job Experience",
  "Work History",
  "Reviews & Ratings",
] as const;

export type CandidateDetailTab = (typeof CANDIDATE_DETAIL_TABS)[number];

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
      <div className="border-b border-gray-200 overflow-x-auto bg-[#FCFCFD]">
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
      <div className="p-4 sm:p-5">
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
      return <GeneralScoreTab />;
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

export function GeneralScoreTab() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
      <p className="text-sm">Interview score data is not yet available from the API.</p>
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
      if (url) window.open(url, "_blank");
    } catch {
      return;
    }
  };

  return (
    <div className="space-y-5">
      <div className="border border-gray-200 rounded-xl p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-5">Personal Documents</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
          {candidate.documents.personal.map((doc) => (
            <button
              key={doc.document_id}
              onClick={() => handleViewDoc(candidate.id, doc.document_id)}
              className="text-left"
            >
              <DocThumbnail title={doc.title} name={fullName} />
            </button>
          ))}
        </div>
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
          {candidate.kpis.total_work_experience}
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
            <p className="text-sm text-gray-500">
              {exp.description ||
                "No additional description is available for this experience entry."}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ComplaintsTab() {
  return (
    <div className="rounded-xl border border-gray-200 p-5">
      <p className="text-sm text-gray-400">
        No complaints or grievances are available for this candidate.
      </p>
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

function DocThumbnail({ title, name }: { title: string; name: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-800">{title}</p>
        <span className="text-[#F4781B] text-xs font-semibold hover:underline">
          View
        </span>
      </div>
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-red-700 px-3 py-2">
          <p className="text-white text-xs font-bold leading-tight">{name}</p>
          <p className="text-red-200 text-[9px]">Licensed Practical Nurse</p>
        </div>
        <div className="bg-white px-3 py-3 space-y-1.5">
          {[100, 90, 95, 80, 85, 90, 75, 85, 80, 60].map((w, i) => (
            <div
              key={i}
              className="h-1 rounded"
              style={{
                width: `${w}%`,
                backgroundColor: i % 3 === 0 ? "#e5e7eb" : "#f3f4f6",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
