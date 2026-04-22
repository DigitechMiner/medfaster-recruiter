"use client";

import Image from "next/image";
import { CandidateDetailsResponse } from "@/stores/api/recruiter-job-api";
import { DocThumbnail, PerformanceCard} from "./shared";
import type { Tab } from "./data";

type EducationItem = {
  id: string;
  school: string;
  degree?: string;
  field?: string;
  period?: string;
  start_year?: string;
  start_date?: string;
  end_year?: string;
  end_date?: string;
};

const EmptyState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-2 border border-gray-200 rounded-xl">
    <span className="text-3xl">📭</span>
    <p className="text-sm font-medium text-gray-500">{message}</p>
    <p className="text-xs text-gray-400">No data available yet.</p>
  </div>
);

export function CandidateDetailTabsContent({
  activeTab,
  candidate,
  fullName,
}: {
  activeTab: Tab;
  candidate: CandidateDetailsResponse;
  fullName: string;
}) {
  return (
    <>
      {/* ── General Score ──────────────────────────────────────────────── */}
      {activeTab === "General score" && (
        <div className="space-y-5">
          {candidate.ai_interview_score != null ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <PerformanceCard
                title="AI Interview Score"
                score={candidate.ai_interview_score}
                metrics={[]}
                strength={candidate.ai_interview_summary ?? undefined}
              />
            </div>
          ) : (
            <EmptyState message="No interview score available" />
          )}
        </div>
      )}

      {/* ── Qualifications ─────────────────────────────────────────────── */}
      {activeTab === "Qualifications" && (
        <div className="space-y-5">
          {/* Education — from API */}
          <div className="border border-gray-200 rounded-xl p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-5">Education</h2>
            {candidate.educations?.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {candidate.educations.map((edu: EducationItem) => (
                  <div key={edu.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                        <Image src="/svg/hospital-iconn.svg" alt="school" width={28} height={28} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm leading-tight">{edu.school}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {edu.degree} <span className="text-gray-400">{edu.field}</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {edu.period || `${edu.start_year ?? edu.start_date ?? ""} – ${edu.end_year ?? edu.end_date ?? ""}`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No education records on file.</p>
            )}
          </div>

          {/* Licensing — no API endpoint yet */}
          <div className="border border-gray-200 rounded-xl p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-3">Licensing Exam</h2>
            <p className="text-sm text-gray-400">No licensing exam records on file.</p>
          </div>

          {/* Registration — no API endpoint yet */}
          <div className="border border-gray-200 rounded-xl p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-3">Registration</h2>
            <p className="text-sm text-gray-400">No registration records on file.</p>
          </div>
        </div>
      )}

      {/* ── Documentations ─────────────────────────────────────────────── */}
      {activeTab === "Documentations" && (
        <div className="space-y-5">
          {candidate.documents?.length ? (
            <>
              {/* Personal Documents */}
              {candidate.documents.filter(d =>
                ['passport', 'id', 'driver_license', 'sin'].includes(d.document_type?.toLowerCase())
              ).length > 0 && (
                <div className="border border-gray-200 rounded-xl p-5">
                  <h2 className="text-base font-semibold text-gray-900 mb-5">Personal Documents</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                    {candidate.documents
                      .filter(d => ['passport', 'id', 'driver_license', 'sin'].includes(d.document_type?.toLowerCase()))
                      .map((doc) => (
                        <DocThumbnail key={doc.id} title={doc.title} name={fullName} />
                      ))}
                  </div>
                </div>
              )}

              {/* Licenses & Certificates */}
              {candidate.documents.filter(d =>
                !['passport', 'id', 'driver_license', 'sin'].includes(d.document_type?.toLowerCase())
              ).length > 0 && (
                <div className="border border-gray-200 rounded-xl p-5">
                  <h2 className="text-base font-semibold text-gray-900 mb-5">Licenses &amp; Certificates</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                    {candidate.documents
                      .filter(d => !['passport', 'id', 'driver_license', 'sin'].includes(d.document_type?.toLowerCase()))
                      .map((doc) => (
                        <DocThumbnail key={doc.id} title={doc.title} name={fullName} />
                      ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <EmptyState message="No documents uploaded" />
          )}
        </div>
      )}

      {/* ── Job Experience ─────────────────────────────────────────────── */}
      {activeTab === "Job Experience" && (
        <div className="border border-gray-200 rounded-xl p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-5">Work Experience</h3>
          {candidate.work_experiences?.length ? (
            <div className="space-y-5">
              {candidate.work_experiences.map((exp, i) => (
                <div
                  key={exp.id}
                  className={`pb-5 ${i < candidate.work_experiences.length - 1 ? "border-b border-gray-100" : ""}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                    <span className="text-sm font-semibold text-gray-900">{exp.company}</span>
                    <span className="text-xs text-gray-500">{exp.title}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No work experience records on file.</p>
          )}
        </div>
      )}

      {/* ── Work History — no API endpoint yet ────────────────────────── */}
      {activeTab === "Work History" && (
        <EmptyState message="Work history not available yet" />
      )}

      {/* ── Reviews & Ratings — no API endpoint yet ───────────────────── */}
      {activeTab === "Reviews & Ratings" && (
        <EmptyState message="No reviews yet" />
      )}

      {/* ── Complaints & Grievances — no API endpoint yet ─────────────── */}
      {activeTab === "Complaints & Grievances" && (
        <EmptyState message="No complaints or grievances on file" />
      )}
    </>
  );
}