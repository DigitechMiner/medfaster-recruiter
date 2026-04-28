"use client";

import Image from "next/image";
import {
  STATIC_EDUCATION_FULL,
  STATIC_LICENSING,
  STATIC_REGISTRATION,
  STATIC_PERSONAL_DOCS,
  STATIC_LICENSE_DOCS,
  STATIC_WORK_EXPERIENCE,
  STATIC_WORK_HISTORY,
  STATIC_REVIEWS,
  STATIC_GRIEVANCES,
  Tab,
} from "./data";
import { DocThumbnail, PerformanceCard, StarRow } from "./shared";
import type { CandidateDetailVM } from "@/Interface/view-models";
import { STATIC_PERFORMANCE } from "../../constants/staticData";

export function CandidateDetailTabsContent({
  activeTab,
  candidate,
  fullName,
}: {
  activeTab: Tab;
  candidate: CandidateDetailVM;
  fullName:  string;
}) {

  // ── API-first, static fallbacks ─────────────────────────────────
  const educations   = candidate.qualifications.length                        > 0 ? candidate.qualifications                    : STATIC_EDUCATION_FULL;
  const personalDocs = candidate.documents.personal.length                    > 0 ? candidate.documents.personal                : STATIC_PERSONAL_DOCS;
  const licenseDocs  = candidate.documents.licenses_certificates.length       > 0 ? candidate.documents.licenses_certificates   : STATIC_LICENSE_DOCS;
  const workExps     = candidate.work_experiences.length                      > 0 ? candidate.work_experiences                  : STATIC_WORK_EXPERIENCE;
  const workHistory  = candidate.work_history.length                          > 0 ? candidate.work_history                      : STATIC_WORK_HISTORY;
  const reviews      = candidate.ratings.reviews.length                       > 0 ? candidate.ratings.reviews                   : STATIC_REVIEWS;

  // ── Ratings summary ─────────────────────────────────────────────
  // general_score.avg_rating_score is from API; fall back to ratings block
  const displayScore = candidate.general_score.avg_rating_score
                       ?? (candidate.ratings.total_reviews > 0 ? candidate.ratings.average_score : 4.8);
  const displayTotal = candidate.ratings.total_reviews > 0 ? candidate.ratings.total_reviews : 4;
  const displayDist  = candidate.ratings.star_distribution.length > 0
    ? candidate.ratings.star_distribution
    : [
        { stars: 5 as const, count: 3, percentage: 75 },
        { stars: 4 as const, count: 1, percentage: 25 },
        { stars: 3 as const, count: 0, percentage: 0  },
        { stars: 2 as const, count: 0, percentage: 0  },
        { stars: 1 as const, count: 0, percentage: 0  },
      ];

  // ── General score rounds — always null from API, always static ──
  // conversational_round / behavioral_round / communication_analysis
  // / accuracy_of_answers are typed `null` in CandidateDetailVM
  // → STATIC_PERFORMANCE is the permanent source until backend adds them

  return (
    <>
      {/* ── General Score ────────────────────────────────────────── */}
      {activeTab === "General score" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <PerformanceCard
              title="Conversational Round"
              score={STATIC_PERFORMANCE.conversational.score}
              metrics={STATIC_PERFORMANCE.conversational.metrics}
              strength={STATIC_PERFORMANCE.conversational.strength}
            />
            <PerformanceCard
              title="Behavioral Round"
              score={STATIC_PERFORMANCE.behavioral.score}
              metrics={STATIC_PERFORMANCE.behavioral.metrics}
              strength={STATIC_PERFORMANCE.behavioral.strength}
            />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <PerformanceCard
              title="Communication Analysis"
              score={STATIC_PERFORMANCE.communication.score}
              metrics={STATIC_PERFORMANCE.communication.metrics}
              strength={STATIC_PERFORMANCE.communication.strength}
            />
            <PerformanceCard
              title="Accuracy of Answers"
              score={STATIC_PERFORMANCE.accuracy.score}
              metrics={STATIC_PERFORMANCE.accuracy.metrics}
              strength={STATIC_PERFORMANCE.accuracy.strength}
            />
          </div>
        </div>
      )}

      {/* ── Qualifications ───────────────────────────────────────── */}
      {activeTab === "Qualifications" && (
        <div className="space-y-5">

          {/* Education — QualificationVM */}
          <div className="border border-gray-200 rounded-xl p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-5">Education</h2>
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
          </div>

          {/* Licensing — static until API exposes it */}
          <div className="border border-gray-200 rounded-xl p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-5">Licensing Exam</h2>
            <div className="flex flex-wrap gap-4">
              {STATIC_LICENSING.map((l) => (
                <div key={l.id} className="border border-gray-200 rounded-xl p-4 min-w-[200px]">
                  <p className="font-semibold text-gray-900 text-sm mb-1">{l.exam}</p>
                  <p className="text-xs text-gray-500">Score — {l.score}</p>
                  <p className="text-xs text-gray-500">Cleared — {l.cleared}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Registration — static until API exposes it */}
          <div className="border border-gray-200 rounded-xl p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-5">Registration</h2>
            <div className="flex flex-wrap gap-4">
              {STATIC_REGISTRATION.map((r) => (
                <div key={r.id} className="border border-gray-200 rounded-xl p-4 inline-block min-w-[260px]">
                  <div className="flex items-start justify-between gap-4 mb-1">
                    <p className="font-semibold text-gray-900 text-sm">{r.type}</p>
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <p className="text-xs text-gray-500">{r.body}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{r.number}</p>
                  <p className="text-xs text-gray-400">Expiry — {r.expiry}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Documentations ───────────────────────────────────────── */}
      {activeTab === "Documentations" && (
        <div className="space-y-5">
          {/* DocumentVM: document_id, title, document_type, category, file_url, signed_url */}
          <div className="border border-gray-200 rounded-xl p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-5">Personal Documents</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              {personalDocs.map((doc) => (
                <DocThumbnail
                  key={doc.document_id}
                  title={doc.title}
                  name={fullName}
                />
              ))}
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-5">Licenses &amp; Certificates</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              {licenseDocs.map((doc) => (
                <DocThumbnail
                  key={doc.document_id}
                  title={doc.title}
                  name={fullName}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Job Experience ───────────────────────────────────────── */}
      {activeTab === "Job Experience" && (
        <div className="border border-gray-200 rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-gray-900">Work Experience</h3>
            {/* kpis.total_work_experience — "4 yrs 2 mos" from API */}
            <span className="text-[#F4781B] text-sm font-semibold">
              {candidate.kpis.total_work_experience || "—"}
            </span>
          </div>
          <div className="space-y-5">
            {/* WorkExperienceVM: id, organization, role, job_type, start_date,
                end_date, is_current, description, org_photo (always null) */}
            {workExps.map((exp, i) => (
              <div
                key={exp.id}
                className={`pb-5 ${i < workExps.length - 1 ? "border-b border-gray-100" : ""}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-red-100 flex-shrink-0 flex items-center justify-center">
                      {/* org_photo is always null — permanent fallback icon */}
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
        </div>
      )}

      {/* ── Work History ─────────────────────────────────────────── */}
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
              {/* WorkHistoryEntryVM: application_id, job_title, organization,
                  job_type, completed_date, status */}
              {workHistory.map((row) => (
                <tr key={row.application_id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3.5 text-gray-800 text-sm">{row.job_title}</td>
                  <td className="px-4 py-3.5 text-gray-600 text-sm">{row.organization}</td>
                  <td className="px-4 py-3.5 text-gray-600 text-sm">{row.status}</td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium
                      ${row.job_type === "Regular"
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                      }`}
                    >
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

      {/* ── Reviews & Ratings ────────────────────────────────────── */}
      {activeTab === "Reviews & Ratings" && (
        <div className="space-y-5">
          {/* RatingsBlockVM: average_score, total_reviews, star_distribution, reviews */}
          <div className="border border-gray-200 rounded-xl p-5 flex flex-col sm:flex-row gap-6 items-start">
            <div className="text-center sm:text-left flex-shrink-0">
              <p className="text-5xl font-bold text-gray-900">{displayScore.toFixed(1)}</p>
              <div className="flex justify-center sm:justify-start gap-0.5 mt-1 mb-1">
                <StarRow rating={Math.round(displayScore)} />
              </div>
              <p className="text-xs text-gray-500">{displayTotal} reviews</p>
            </div>
            <div className="flex-1 w-full space-y-1.5">
              {/* StarDistributionVM: stars, count, percentage */}
              {displayDist.map((row) => (
                <div key={row.stars} className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="w-3 text-right">{row.stars}</span>
                  <svg className="w-3 h-3 fill-yellow-400 text-yellow-400" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-400 rounded-full"
                      style={{ width: `${row.percentage}%` }}
                    />
                  </div>
                  <span className="w-3">{row.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* ReviewVM: id, rating, comment, job_title, organization,
                recruiter_title, created_at */}
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
        </div>
      )}

      {/* ── Complaints & Grievances ──────────────────────────────── */}
      {/* No VM yet — static only until backend exposes grievances endpoint */}
      {activeTab === "Complaints & Grievances" && (
        <div className="space-y-5">
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {["Ticket ID", "Category", "Related Job", "Priority", "Status", "SLA", "Filed Date"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-gray-600 text-xs whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {STATIC_GRIEVANCES.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3.5 text-gray-800 text-sm font-medium">{row.ticketId}</td>
                    <td className="px-4 py-3.5 text-gray-600 text-sm">{row.category}</td>
                    <td className="px-4 py-3.5 text-gray-600 text-sm">{row.relatedJob}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${row.priorityColor}`}>
                        {row.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${row.statusColor}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${row.slaColor}`}>
                        {row.sla}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 text-sm">{row.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border border-gray-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Resolution Details</h3>
            <div className="space-y-3">
              {STATIC_GRIEVANCES.map((row) => (
                <div key={row.id} className="bg-orange-50 border border-orange-100 rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-500 mb-1">{row.ticketId} — {row.category}</p>
                  <p className="text-sm text-orange-700">{row.resolution}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}