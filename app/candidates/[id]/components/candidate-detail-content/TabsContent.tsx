"use client";

import Image from "next/image";
import { CandidateDetailsResponse } from "@/stores/api/recruiter-job-api";
import { STATIC_PERFORMANCE } from "../../constants/staticData";
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

      {activeTab === "Qualifications" && (
        <div className="space-y-5">
          <div className="border border-gray-200 rounded-xl p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-5">Education</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(candidate.educations?.length ? candidate.educations : STATIC_EDUCATION_FULL).map((edu: EducationItem) => (
                <div key={edu.id} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
                      <Image src="/svg/hospital-iconn.svg" alt="school" width={28} height={28} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm leading-tight">{edu.school}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {edu.degree} <span className="text-gray-400">{edu.field}</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {edu.period || `${edu.start_year ?? edu.start_date ?? ""} - ${edu.end_year ?? edu.end_date ?? ""}`}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-5">Licensing Exam</h2>
            <div className="flex flex-wrap gap-4">
              {STATIC_LICENSING.map((l) => (
                <div key={l.id} className="border border-gray-200 rounded-xl p-4 min-w-[200px]">
                  <p className="font-semibold text-gray-900 text-sm mb-1">{l.exam}</p>
                  <p className="text-xs text-gray-500">Score - {l.score}</p>
                  <p className="text-xs text-gray-500">Cleared - {l.cleared}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-5">Registration</h2>
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
                <p className="text-xs text-gray-400">Expiry - {r.expiry}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "Documentations" && (
        <div className="space-y-5">
          <div className="border border-gray-200 rounded-xl p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-5">Personal Documents</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              {STATIC_PERSONAL_DOCS.map((doc) => (
                <DocThumbnail key={doc.id} title={doc.title} name={fullName} />
              ))}
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-5">Licenses &amp; Certificates</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              {STATIC_LICENSE_DOCS.map((doc) => (
                <DocThumbnail key={doc.id} title={doc.title} name={fullName} />
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "Job Experience" && (
        <div className="border border-gray-200 rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-gray-900">Work Experience</h3>
            <span className="text-[#F4781B] text-sm font-semibold">5+ Years</span>
          </div>
          <div className="space-y-5">
            {STATIC_WORK_EXPERIENCE.map((exp, i) => (
              <div key={exp.id} className={`pb-5 ${i < STATIC_WORK_EXPERIENCE.length - 1 ? "border-b border-gray-100" : ""}`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-red-100 flex-shrink-0 flex items-center justify-center">
                      <Image src={exp.logo} alt={exp.company} width={20} height={20} />
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{exp.company}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {exp.title} <span className="text-gray-400">{exp.type}</span>
                  </span>
                  <span className="text-xs text-gray-500">{exp.start} - {exp.end}</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed mt-2">{exp.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "Work History" && (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {["Job Title", "Recruiter Title", "Review & Rating", "Job Type", "Completed Date"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-gray-600 text-xs whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {STATIC_WORK_HISTORY.map((row) => (
                <tr key={row.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3.5 text-gray-800 text-sm">{row.jobTitle}</td>
                  <td className="px-4 py-3.5 text-gray-600 text-sm">{row.recruiterTitle}</td>
                  <td className="px-4 py-3.5"><StarRow rating={row.rating} /></td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${row.jobType === "Regular" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                      {row.jobType}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-gray-600 text-sm">{row.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "Reviews & Ratings" && (
        <div className="space-y-5">
          <div className="border border-gray-200 rounded-xl p-5 flex flex-col sm:flex-row gap-6 items-start">
            <div className="text-center sm:text-left flex-shrink-0">
              <p className="text-5xl font-bold text-gray-900">4.8</p>
              <div className="flex justify-center sm:justify-start gap-0.5 mt-1 mb-1">
                <StarRow rating={4} />
              </div>
              <p className="text-xs text-gray-500">4 reviews</p>
            </div>
            <div className="flex-1 w-full space-y-1.5">
              {[
                { star: 5, count: 3 },
                { star: 4, count: 1 },
                { star: 3, count: 0 },
                { star: 2, count: 0 },
                { star: 1, count: 0 },
              ].map((row) => (
                <div key={row.star} className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="w-3 text-right">{row.star}</span>
                  <svg className="w-3 h-3 fill-yellow-400 text-yellow-400" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-400 rounded-full" style={{ width: row.count > 0 ? `${(row.count / 4) * 100}%` : "0%" }} />
                  </div>
                  <span className="w-3">{row.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {STATIC_REVIEWS.map((r) => (
              <div key={r.id} className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-[#F4781B] text-sm">{r.company}</p>
                    <p className="text-xs text-gray-400">{r.code}</p>
                  </div>
                  <StarRow rating={r.rating} />
                </div>
                <p className="text-xs text-gray-700 mb-2">{r.text}</p>
                <p className="text-xs text-gray-400">{r.date}</p>
              </div>
            ))}
          </div>
        </div>
      )}

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
                    <td className="px-4 py-3.5"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${row.priorityColor}`}>{row.priority}</span></td>
                    <td className="px-4 py-3.5"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${row.statusColor}`}>{row.status}</span></td>
                    <td className="px-4 py-3.5"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${row.slaColor}`}>{row.sla}</span></td>
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
                  <p className="text-xs font-semibold text-gray-500 mb-1">{row.ticketId} - {row.category}</p>
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
