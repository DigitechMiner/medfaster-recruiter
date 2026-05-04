'use client';

import Image                from "next/image";
import { DocThumbnail, StarRow } from "./shared";
import type { CandidateDetailVM } from "@/Interface/view-models";
import type { Tab } from "./data";
import { useCandidateDocumentUrl } from "@/hooks/useApplicationActions";

export function CandidateDetailTabsContent({
  activeTab,
  candidate,
  fullName,
}: {
  activeTab: Tab;
  candidate: CandidateDetailVM;
  fullName:  string;
}) {
  const { fetchUrl } = useCandidateDocumentUrl();

  const handleViewDoc = async (candidateId: string, documentId: string) => {
    const url = await fetchUrl(candidateId, documentId);
    window.open(url, "_blank");
  };

  // ── Data straight from API — no static fallbacks ─────────────────────────
  const educations   = candidate.qualifications;
  const personalDocs = candidate.documents.personal;
  const licenseDocs  = candidate.documents.licenses_certificates;
  const workExps     = candidate.work_experiences;
  const workHistory  = candidate.work_history;
  const reviews      = candidate.ratings.reviews;

  const displayScore = candidate.general_score.avg_rating_score ?? candidate.ratings.average_score ?? 0;
  const displayTotal = candidate.ratings.total_reviews;
  const displayDist  = candidate.ratings.star_distribution;

  return (
    <>
      {/* ── General Score ─────────────────────────────────────────────────── */}
      {activeTab === "General score" && (
        <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
          <p className="text-sm">Interview score data is not yet available from the API.</p>
          <p className="text-xs mt-1 text-gray-300">This section will populate once the backend exposes evaluation endpoints.</p>
        </div>
      )}

      {/* ── Qualifications ────────────────────────────────────────────────── */}
      {activeTab === "Qualifications" && (
        <div className="space-y-5">
          <div className="border border-gray-200 rounded-xl p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-5">Education</h2>
            {educations.length === 0 ? (
              <p className="text-sm text-gray-400">No education records found.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {educations.map((edu) => (
                  <div key={edu.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
                        <Image src="/svg/hospital-iconn.svg" alt="school" width={28} height={28} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                          {edu.institution ?? "—"}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {edu.degree}
                          {edu.field && <span className="text-gray-400"> · {edu.field}</span>}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {edu.start_year ?? "—"} – {edu.end_year ?? "Present"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Licensing & Registration — no API endpoint yet */}
          <div className="border border-gray-200 rounded-xl p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-2">Licensing Exam</h2>
            <p className="text-sm text-gray-400">Not available — endpoint not yet exposed by backend.</p>
          </div>
          <div className="border border-gray-200 rounded-xl p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-2">Registration</h2>
            <p className="text-sm text-gray-400">Not available — endpoint not yet exposed by backend.</p>
          </div>
        </div>
      )}

      {/* ── Documentations ────────────────────────────────────────────────── */}
      {activeTab === "Documentations" && (
        <div className="space-y-5">
          <div className="border border-gray-200 rounded-xl p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-5">Personal Documents</h2>
            {personalDocs.length === 0 ? (
              <p className="text-sm text-gray-400">No personal documents on record.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                {personalDocs.map((doc) => (
                  <div key={doc.document_id} onClick={() => handleViewDoc(candidate.id, doc.document_id)}>
                    <DocThumbnail title={doc.title} name={fullName} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border border-gray-200 rounded-xl p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-5">Licenses &amp; Certificates</h2>
            {licenseDocs.length === 0 ? (
              <p className="text-sm text-gray-400">No license documents on record.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                {licenseDocs.map((doc) => (
                  <div key={doc.document_id} onClick={() => handleViewDoc(candidate.id, doc.document_id)}>
                    <DocThumbnail title={doc.title} name={fullName} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Job Experience ────────────────────────────────────────────────── */}
      {activeTab === "Job Experience" && (
        <div className="border border-gray-200 rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-gray-900">Work Experience</h3>
            <span className="text-[#F4781B] text-sm font-semibold">
              {candidate.kpis.total_work_experience || "—"}
            </span>
          </div>
          {workExps.length === 0 ? (
            <p className="text-sm text-gray-400">No work experience on record.</p>
          ) : (
            <div className="space-y-5">
              {workExps.map((exp, i) => (
                <div key={exp.id} className={`pb-5 ${i < workExps.length - 1 ? "border-b border-gray-100" : ""}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-red-100 flex-shrink-0 flex items-center justify-center">
                        <Image src="/svg/hospital-iconn.svg" alt={exp.organization} width={20} height={20} />
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{exp.organization}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {exp.role}
                      {exp.job_type && <span className="text-gray-400"> · {exp.job_type}</span>}
                    </span>
                    <span className="text-xs text-gray-500">
                      {exp.start_date} – {exp.is_current ? "Present" : (exp.end_date ?? "—")}
                    </span>
                  </div>
                  {exp.description && (
                    <p className="text-xs text-gray-600 leading-relaxed mt-2">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Work History ──────────────────────────────────────────────────── */}
      {activeTab === "Work History" && (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {["Job Title", "Organization", "Status", "Job Type", "Completed Date"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-gray-600 text-xs whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {workHistory.length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center text-xs text-gray-400">No work history on record.</td></tr>
              ) : workHistory.map((row) => (
                <tr key={row.application_id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3.5 text-gray-800 text-sm">{row.job_title}</td>
                  <td className="px-4 py-3.5 text-gray-600 text-sm">{row.organization}</td>
                  <td className="px-4 py-3.5 text-gray-600 text-sm">{row.status}</td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium
                      ${row.job_type === "Regular" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                      {row.job_type}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-gray-600 text-sm">{row.completed_date ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Reviews & Ratings ─────────────────────────────────────────────── */}
      {activeTab === "Reviews & Ratings" && (
        <div className="space-y-5">
          {displayTotal === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">No reviews yet.</p>
          ) : (
            <>
              <div className="border border-gray-200 rounded-xl p-5 flex flex-col sm:flex-row gap-6 items-start">
                <div className="text-center sm:text-left flex-shrink-0">
                  <p className="text-5xl font-bold text-gray-900">{displayScore.toFixed(1)}</p>
                  <div className="flex justify-center sm:justify-start gap-0.5 mt-1 mb-1">
                    <StarRow rating={Math.round(displayScore)} />
                  </div>
                  <p className="text-xs text-gray-500">{displayTotal} reviews</p>
                </div>
                <div className="flex-1 w-full space-y-1.5">
                  {displayDist.map((row) => (
                    <div key={row.stars} className="flex items-center gap-2 text-xs text-gray-600">
                      <span className="w-3 text-right">{row.stars}</span>
                      <svg className="w-3 h-3 fill-yellow-400 text-yellow-400" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-400 rounded-full" style={{ width: `${row.percentage}%` }} />
                      </div>
                      <span className="w-3">{row.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {reviews.map((r) => (
                  <div key={r.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-[#F4781B] text-sm">{r.organization ?? "—"}</p>
                        <p className="text-xs text-gray-400">{r.recruiter_title ?? "—"}</p>
                      </div>
                      <StarRow rating={r.rating} />
                    </div>
                    {r.comment && <p className="text-xs text-gray-700 mb-2">{r.comment}</p>}
                    <p className="text-xs text-gray-400">{r.created_at}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Complaints & Grievances — no endpoint yet ─────────────────────── */}
      {activeTab === "Complaints & Grievances" && (
        <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
          <p className="text-sm">No grievances endpoint available yet.</p>
          <p className="text-xs mt-1 text-gray-300">This section will populate once the backend exposes a disputes/grievances API.</p>
        </div>
      )}
    </>
  );
}