"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { MetricRow } from "./CandidateDetailComponents";
import { CandidateHero } from "./candidate-hero";
import { CalendarCard } from "@/components/card/calendar-card";
import SuccessModal from "@/components/modal";
import { StatusType } from "@/Interface/job.types";
import { Check } from "lucide-react";
import ScoreCard from "@/components/card/scorecard";
import { Button } from "@/components/ui/button";
import {
  createRecruiterInterviewRequest,
  fetchRecruiterInterviewRequests,
} from "@/app/jobs/services/interviewApi";
import { CandidateDetailsResponse } from "@/stores/api/recruiter-job-api";
import { STATIC_CANDIDATE, STATIC_PERFORMANCE } from "../constants/staticData";

// ─────────────────────────────────────────────────────────────────────────────
// Static fallback data
// ─────────────────────────────────────────────────────────────────────────────

const STATIC_EDUCATION_FULL = [
  { id: "ed1", school: "Canadian Red Cross University", degree: "Master Degree", field: "MD",    period: "Jan 2025 - Dec 2023" },
  { id: "ed2", school: "Canadian Special School",      degree: "Bachelor",       field: "B.Sc.", period: "Jan 2023 - Dec 2020" },
  { id: "ed3", school: "Canadian Special School",      degree: "Diploma",        field: "B.Sc.", period: "Dec 2020 - Feb 2017" },
];

const STATIC_LICENSING = [
  { id: "lic1", exam: "NCLEX-PN (Exam)", score: 235, cleared: "2023" },
];

const STATIC_REGISTRATION = [
  { id: "reg1", type: "Provisional Nursing Body Registered", body: "College of Nurses of Ontario", number: "ONT-12345", expiry: "Dec 2026" },
];

const STATIC_PERSONAL_DOCS = [
  { id: "pd1", title: "Passport" },
  { id: "pd2", title: "PR Card" },
  { id: "pd3", title: "Valid Work Permit" },
  { id: "pd4", title: "Criminal Record Check" },
];

const STATIC_LICENSE_DOCS = [
  { id: "ld1", title: "LPN License" },
  { id: "ld2", title: "First Aid Certificate" },
  { id: "ld3", title: "Professional Liability Certificate" },
  { id: "ld4", title: "Flu Vaccination Certificate" },
  { id: "ld5", title: "Covid Vaccination Certificate" },
  { id: "ld6", title: "TB Screeing Certificate" },
];

const STATIC_WORK_EXPERIENCE = [
  {
    id: "we1",
    company: "Medfasterrr",
    logo: "/svg/hospital-iconn.svg",
    title: "Assistant of audiology",
    type: "Full Time",
    start: "Jan 2025",
    end: "Present",
    desc: "Lorem ipsum dolor sit amet consectetur. Augue dolor enim imperdiet placerat vulputate proin leo. Ipsum est nisl pulvinar libero. Quam elementum neque amet odio. In est sit varius cursus vitae velit nec. Pellentesque egestas eu sit amet accumsan lectus. Tincidunt faucibus aenean orci euismod dui. Massa eu mattis turpis pellentesque neque volutpat nunc. Etiam consequat egestas nibh quam et et varius. Dolor eu massa ipsum mollis. Integer urna est amet vestibulum et nunc nibh. Et neque nisl aenean amet. Tellus dictum diam eget amet.",
  },
  {
    id: "we2",
    company: "Medfasterrr",
    logo: "/svg/hospital-iconn.svg",
    title: "Assistant of audiology",
    type: "Full Time",
    start: "Jan 2024",
    end: "Jan 2025",
    desc: "Lorem ipsum dolor sit amet consectetur. Augue dolor enim imperdiet placerat vulputate proin leo. Ipsum est nisl pulvinar libero. Quam elementum neque amet odio. In est sit varius cursus vitae velit nec. Pellentesque egestas eu sit amet accumsan lectus. Tincidunt faucibus aenean orci euismod dui. Massa eu mattis turpis pellentesque neque volutpat nunc.",
  },
  {
    id: "we3",
    company: "Medfasterrr",
    logo: "/svg/hospital-iconn.svg",
    title: "Assistant of audiology",
    type: "Full Time",
    start: "Jan 2023",
    end: "Jan 2024",
    desc: "Lorem ipsum dolor sit amet consectetur. Augue dolor enim imperdiet placerat vulputate proin leo. Ipsum est nisl pulvinar libero. Quam elementum neque amet odio. In est sit varius cursus vitae velit nec.",
  },
];

const STATIC_WORK_HISTORY = [
  { id: "wh1", jobTitle: "Candidate Behavior", recruiterTitle: "KRV-JB-8821", rating: 4, jobType: "Regular", date: "Jan 29, 2024" },
  { id: "wh2", jobTitle: "Payment Issue",       recruiterTitle: "KRV-JB-8765", rating: 4, jobType: "Urgent",  date: "Jan 15, 2024" },
];

const STATIC_REVIEWS = [
  { id: "rv1", company: "Candian Medical", code: "KRV_RCT-8901", rating: 5, text: "Excellent service, very punctual and safe driving.", date: "February 2, 2024" },
  { id: "rv2", company: "Medical Canada",  code: "KRV_RCT-8902", rating: 4, text: "Good ride, but vehicle could be cleaner.",           date: "February 1, 2024" },
  { id: "rv3", company: "Candian Medical", code: "KRV_RCT-8901", rating: 5, text: "Excellent service, very punctual and safe driving.", date: "February 2, 2024" },
  { id: "rv4", company: "Medical Canada",  code: "KRV_RCT-8902", rating: 4, text: "Good ride, but vehicle could be cleaner.",           date: "February 1, 2024" },
];

const STATIC_GRIEVANCES = [
  {
    id: "gr1", ticketId: "GRV-456", category: "Candidate Behavior", relatedJob: "KRV-JB-8821",
    priority: "High",   priorityColor: "bg-red-100 text-red-600",
    status: "Resolved", statusColor: "bg-green-100 text-green-700",
    sla: "Met",         slaColor: "bg-green-100 text-green-700",
    date: "Jan 29, 2024",
    resolution: "Candidate Counselled And Warned. Fare Refunded To Passenger.",
  },
  {
    id: "gr2", ticketId: "GRV-389", category: "Payment Issue", relatedJob: "KRV-JB-8765",
    priority: "Medium", priorityColor: "bg-yellow-100 text-yellow-700",
    status: "Closed",   statusColor: "bg-green-100 text-green-700",
    sla: "Met",         slaColor: "bg-green-100 text-green-700",
    date: "Jan 15, 2024",
    resolution: "Payment Gateway Issue Resolved. Amount Refunded.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Tab definitions
// ─────────────────────────────────────────────────────────────────────────────

const TABS = [
  "General score",
  "Qualifications",
  "Documentations",
  "Job Experience",
  "Work History",
  "Reviews & Ratings",
  "Complaints & Grievances",
] as const;
type Tab = typeof TABS[number];

// ─────────────────────────────────────────────────────────────────────────────
// Small shared components
// ─────────────────────────────────────────────────────────────────────────────

/** Reusable star row */
const StarRow = ({ rating, max = 5 }: { rating: number; max?: number }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: max }).map((_, i) => (
      <svg
        key={i}
        className={`w-3.5 h-3.5 ${i < rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`}
        viewBox="0 0 24 24"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ))}
  </div>
);

/** Document thumbnail card — red header + content lines */
const DocThumbnail = ({ title, name }: { title: string; name: string }) => (
  <div>
    <div className="flex items-center justify-between mb-2">
      <p className="text-sm font-medium text-gray-800">{title}</p>
      <button className="text-orange-500 text-xs font-semibold hover:underline">View</button>
    </div>
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Red header */}
      <div className="bg-red-700 px-3 py-2">
        <p className="text-white text-xs font-bold leading-tight">{name}</p>
        <p className="text-red-200 text-[9px]">Licensed Practical Nurse</p>
      </div>
      {/* Document body lines */}
      <div className="bg-white px-3 py-3 space-y-1.5">
        <div className="flex gap-3 mb-2">
          <div className="flex-1 space-y-1">
            {[100, 80, 60].map((w, i) => (
              <div key={i} className="h-1.5 bg-gray-200 rounded" style={{ width: `${w}%` }} />
            ))}
          </div>
          <div className="w-14 space-y-1">
            {[100, 80, 60, 80, 60].map((w, i) => (
              <div key={i} className="h-1.5 bg-gray-200 rounded" style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
        {[100, 90, 95, 80, 85, 90, 75, 85, 80, 60].map((w, i) => (
          <div key={i} className="h-1 rounded" style={{ width: `${w}%`, backgroundColor: i % 3 === 0 ? "#e5e7eb" : "#f3f4f6" }} />
        ))}
        <div className="pt-1 border-t border-gray-100 space-y-1">
          <div className="h-1.5 bg-gray-200 rounded w-2/5" />
          <div className="h-1 bg-gray-100 rounded w-full" />
          <div className="h-1 bg-gray-100 rounded w-4/5" />
        </div>
      </div>
    </div>
  </div>
);

/** Performance/score card used in General Score tab */
const PerformanceCard = ({
  title,
  score,
  metrics,
  strength,
}: {
  title: string;
  score: number;
  metrics: { label: string; value: number }[];
  strength: string;
}) => (
  <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6">
    <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      <ScoreCard category={title} score={score} maxScore={100} />
    </div>
    <div className="space-y-3 mb-5">
      {metrics.map((m, i) => (
        <MetricRow key={i} label={m.label} value={m.value} />
      ))}
    </div>
    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
      <div className="flex gap-2">
        <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
        <div>
          <p className="text-xs font-semibold text-green-900 mb-0.5">Strengths</p>
          <p className="text-xs text-green-800">{strength}</p>
        </div>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

interface CandidateDetailContentProps {
  candidate: CandidateDetailsResponse;
  status: StatusType;
  onBack: () => void;
  candidateId: string;
  jobApplicationId?: string;
}

export const CandidateDetailContent: React.FC<CandidateDetailContentProps> = ({
  candidate,
  status,
  onBack,
  candidateId,
  jobApplicationId,
}) => {
  const [activeTab, setActiveTab]                   = useState<Tab>("General score");
  const [isCalendarOpen, setIsCalendarOpen]         = useState(false);
  const [isSuccessOpen, setIsSuccessOpen]           = useState(false);
  const [scheduledDate, setScheduledDate]           = useState("");
  const [isSending, setIsSending]                   = useState(false);
  const [hasExistingRequest, setHasExistingRequest] = useState(false);
  const [isCheckingRequest, setIsCheckingRequest]   = useState(true);

  const fullName = candidate.full_name || `${candidate.first_name} ${candidate.last_name ?? ""}`.trim();

  // Check for an existing interview request on mount
  useEffect(() => {
    const check = async () => {
      if (!candidateId || !jobApplicationId) {
        setIsCheckingRequest(false);
        return;
      }
      try {
        const response = await fetchRecruiterInterviewRequests(undefined, 1, 100);
        setHasExistingRequest(
          !!response.interviewRequests?.find(
            (r: any) =>
              r.candidate_id === candidateId &&
              r.job_application_id === jobApplicationId
          )
        );
      } catch {
        // silently ignore
      } finally {
        setIsCheckingRequest(false);
      }
    };
    check();
  }, [candidateId, jobApplicationId]);

  const handleSendInterviewRequest = async () => {
    if (!candidateId || !jobApplicationId || hasExistingRequest) return;
    setIsSending(true);
    try {
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + 7);
      await createRecruiterInterviewRequest({
        candidate_id: candidateId,
        job_application_id: jobApplicationId,
        message:
          "You have been shortlisted for an interview. Please accept and book a suitable slot.",
        valid_until: validUntil.toISOString(),
      });
      setHasExistingRequest(true);
      setIsSuccessOpen(true);
    } catch (error: unknown) {
      let msg = "Failed to send interview request.";
      if (error && typeof error === "object" && "message" in error) {
        msg = (error as { message: string }).message;
      }
      if (msg.includes("already exists")) setHasExistingRequest(true);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      {/* ── Hero card (breadcrumb inside) + 5 KPI cards ── */}
      <div className="mb-5">
        <CandidateHero candidate={candidate} onBack={onBack} />
      </div>

      {/* ── Tabbed section ── */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">

        {/* Tab bar */}
        <div className="border-b border-gray-200 overflow-x-auto">
          <div className="flex min-w-max">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 sm:px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === tab
                    ? "border-orange-500 text-orange-500"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab content ── */}
        <div className="p-5 sm:p-6">

          {/* ───────────── General Score ───────────── */}
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

          {/* ───────────── Qualifications ───────────── */}
          {activeTab === "Qualifications" && (
            <div className="space-y-5">

              {/* Education */}
              <div className="border border-gray-200 rounded-xl p-5">
                <h2 className="text-base font-semibold text-gray-900 mb-5">Education</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(candidate.educations?.length
                    ? candidate.educations
                    : STATIC_EDUCATION_FULL
                  ).map((edu: any) => (
                    <div key={edu.id} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
                          <Image
                            src="/svg/hospital-iconn.svg"
                            alt="school"
                            width={28}
                            height={28}
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                            {edu.school}
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {edu.degree}{" "}
                            <span className="text-gray-400">{edu.field}</span>
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {edu.period ||
                              `${edu.start_year ?? edu.start_date ?? ""} - ${edu.end_year ?? edu.end_date ?? ""}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Licensing Exam */}
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

              {/* Registration */}
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

          {/* ───────────── Documentations ───────────── */}
          {activeTab === "Documentations" && (
            <div className="space-y-5">

              {/* Personal Documents */}
              <div className="border border-gray-200 rounded-xl p-5">
                <h2 className="text-base font-semibold text-gray-900 mb-5">Personal Documents</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                  {STATIC_PERSONAL_DOCS.map((doc) => (
                    <DocThumbnail key={doc.id} title={doc.title} name={fullName} />
                  ))}
                </div>
              </div>

              {/* Licenses & Certificates */}
              <div className="border border-gray-200 rounded-xl p-5">
                <h2 className="text-base font-semibold text-gray-900 mb-5">
                  Licenses &amp; Certificates
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                  {STATIC_LICENSE_DOCS.map((doc) => (
                    <DocThumbnail key={doc.id} title={doc.title} name={fullName} />
                  ))}
                </div>
              </div>

            </div>
          )}

         {/* ── TAB 4: Job Experience ── */}
          {activeTab === "Job Experience" && (
            <div className="border border-gray-200 rounded-xl p-4 sm:p-5">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-semibold text-gray-900">Work Experience</h3>
                <span className="text-orange-500 text-sm font-semibold">5+ Years</span>
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

          {/* ───────────── Work History ───────────── */}
          {activeTab === "Work History" && (
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {["Job Title", "Recruiter Title", "Review & Rating", "Job Type", "Completed Date"].map(
                      (h) => (
                        <th
                          key={h}
                          className="text-left px-4 py-3 font-medium text-gray-600 text-xs whitespace-nowrap"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {STATIC_WORK_HISTORY.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3.5 text-gray-800 text-sm">{row.jobTitle}</td>
                      <td className="px-4 py-3.5 text-gray-600 text-sm">{row.recruiterTitle}</td>
                      <td className="px-4 py-3.5">
                        <StarRow rating={row.rating} />
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            row.jobType === "Regular"
                              ? "bg-green-100 text-green-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
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

          {/* ───────────── Reviews & Ratings ───────────── */}
          {activeTab === "Reviews & Ratings" && (
            <div className="space-y-5">

              {/* Summary block */}
              <div className="border border-gray-200 rounded-xl p-5 flex flex-col sm:flex-row gap-6 items-start">
                {/* Overall score */}
                <div className="text-center sm:text-left flex-shrink-0">
                  <p className="text-5xl font-bold text-gray-900">4.8</p>
                  <div className="flex justify-center sm:justify-start gap-0.5 mt-1 mb-1">
                    <StarRow rating={4} />
                  </div>
                  <p className="text-xs text-gray-500">4 reviews</p>
                </div>
                {/* Distribution bars */}
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
                        <div
                          className="h-full bg-orange-400 rounded-full"
                          style={{ width: row.count > 0 ? `${(row.count / 4) * 100}%` : "0%" }}
                        />
                      </div>
                      <span className="w-3">{row.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {STATIC_REVIEWS.map((r) => (
                  <div key={r.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-orange-500 text-sm">{r.company}</p>
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

          {/* ───────────── Complaints & Grievances ───────────── */}
          {activeTab === "Complaints & Grievances" && (
            <div className="space-y-5">

              {/* Table */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      {[
                        "Ticket ID",
                        "Category",
                        "Related Job",
                        "Priority",
                        "Status",
                        "SLA",
                        "Filed Date",
                      ].map((h) => (
                        <th
                          key={h}
                          className="text-left px-4 py-3 font-medium text-gray-600 text-xs whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {STATIC_GRIEVANCES.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                      >
                        <td className="px-4 py-3.5 text-gray-800 text-sm font-medium">
                          {row.ticketId}
                        </td>
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

              {/* Resolution Details */}
              <div className="border border-gray-200 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Resolution Details</h3>
                <div className="space-y-3">
                  {STATIC_GRIEVANCES.map((row) => (
                    <div key={row.id} className="bg-orange-50 border border-orange-100 rounded-lg p-4">
                      <p className="text-xs font-semibold text-gray-500 mb-1">
                        {row.ticketId} - {row.category}
                      </p>
                      <p className="text-sm text-orange-700">{row.resolution}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* ── Modals ── */}
      <CalendarCard
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        onSchedule={(date) => {
          setScheduledDate(date);
          setIsCalendarOpen(false);
          setIsSuccessOpen(true);
        }}
      />
      <SuccessModal
        visible={isSuccessOpen}
        onClose={() => {
          setIsSuccessOpen(false);
          setScheduledDate("");
        }}
        title="Success"
        message={
          scheduledDate
            ? `Interview Scheduled on ${scheduledDate}`
            : "Interview request sent successfully!"
        }
        buttonText="Done"
      />
    </>
  );
};