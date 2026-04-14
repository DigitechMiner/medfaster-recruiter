"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { CandidateDetailsResponse } from "@/stores/api/recruiter-job-api";

interface CandidateHeroProps {
  candidate: CandidateDetailsResponse;
  onBack: () => void;
}

export const CandidateHero: React.FC<CandidateHeroProps> = ({ candidate, onBack }) => {
  const isHired = (candidate as any).is_hired === true;

  const fullName = candidate.full_name || `${candidate.first_name} ${candidate.last_name ?? ""}`.trim();

  const location = candidate.city && candidate.state
    ? `${candidate.city}, ${candidate.state}`
    : candidate.preferred_location || "N/A";

  const skillsArray: string[] = useMemo(() => {
    if (!candidate.skill) return [];
    try {
      return typeof candidate.skill === "string"
        ? JSON.parse(candidate.skill)
        : Array.isArray(candidate.skill)
        ? candidate.skill
        : [];
    } catch { return []; }
  }, [candidate.skill]);

  // Role tags shown under the name — from skills or fallback
  const roleTags: string[] = useMemo(() => {
    const raw = (candidate as any).specialty ?? skillsArray;
    return Array.isArray(raw) && raw.length > 0
      ? raw.slice(0, 3)
      : ["Licensed Practical Nurse"];
  }, [skillsArray, candidate]);

  // Specializations row — try every possible API field
  const specializations: string[] = useMemo(() => {
    const raw =
      (candidate as any).specializations ??
      (candidate as any).specialty ??
      null;

    if (Array.isArray(raw) && raw.length > 0) return raw;

    const single = (candidate as any).medical_industry;
    if (single) return [single];

    return ["Long-Term Care", "Home Care", "Rehabilitation", "Palliative Care", "Clinics"];
  }, [candidate]);

  const currentCompany = candidate.work_experiences?.[0]?.company || "KeRaeva";
  const currentRole    = candidate.work_experiences?.[0]?.title   || "Licensed Practical Nurse";

  return (
    <div className="flex flex-col gap-0">

      {/* ── Hero Card ── */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

        {/* Row 1: Breadcrumb + Online badge — INSIDE the card */}
        <div className="flex items-center justify-between px-6 pt-5 pb-0">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <button
              onClick={onBack}
              className="hover:text-gray-800 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            </button>
            <span>Jobs</span>
            <span className="text-gray-300">/</span>
            <span>Job_Id</span>
            <span className="text-gray-300">/</span>
            <span className="text-orange-500 font-semibold">Candidate_Id</span>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 border border-green-300 text-green-600 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Online
          </span>
        </div>

        {/* Row 2: Photo + Info + Action buttons */}
        <div className="px-6 pt-4 pb-0">
          <div className="flex flex-col sm:flex-row gap-5">

            {/* Profile photo */}
            <div className="w-28 h-32 sm:w-32 sm:h-36 rounded-xl overflow-hidden bg-orange-50 flex-shrink-0">
              <Image
                src={candidate.profile_image_url || "/svg/Photo.svg"}
                alt={fullName}
                width={128}
                height={144}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info block */}
            <div className="flex-1 min-w-0">

              {/* Name + role tags + action buttons */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{fullName}</h1>
                  <div className="flex flex-wrap gap-2">
                    {roleTags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full border border-gray-300 text-gray-700 text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors whitespace-nowrap">
                    <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    Interview Response
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                    </svg>
                    Hire
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <circle cx="12" cy="12" r="10" />
                      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                    </svg>
                    Reject
                  </button>
                </div>
              </div>

              {/* Contact info — email/phone masked until hired */}
              <div className="flex flex-wrap items-center divide-x divide-gray-200 text-sm text-gray-600 mb-2">
                <div className="flex items-center gap-1.5 pr-4">
                  <svg className="w-4 h-4 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {location}
                </div>
                <div className="flex items-center gap-1.5 px-4">
                  <svg className="w-4 h-4 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <rect x={2} y={4} width={20} height={16} rx={2} />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  {isHired ? (candidate.email || "N/A") : "• • • • • • • • • • • •"}
                </div>
                <div className="flex items-center gap-1.5 px-4">
                  <svg className="w-4 h-4 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.11 12 19.79 19.79 0 0 1 1.04 3.4 2 2 0 0 1 3 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  {isHired ? (candidate.phone_number || "N/A") : "• • • • • • • • • • • • • • •"}
                </div>
                <div className="flex items-center gap-1.5 pl-4">
                  <svg className="w-4 h-4 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {candidate.job_type || "Part Time"}
                </div>
              </div>

              {/* Work Eligibility */}
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-orange-500">Work Eligibility :</span>
                <span className="px-3 py-0.5 rounded-full border border-gray-300 text-gray-700 text-xs font-medium">
                  {candidate.work_eligibility || "Canadian Citizen"}
                </span>
              </div>

            </div>
          </div>
        </div>

        {/* Row 3: Specializations — separated by top border */}
        <div className="px-6 py-4 mt-3 border-t border-gray-100">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-orange-500 whitespace-nowrap">
              Specializations :
            </span>
            {specializations.map((s, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-full border border-gray-300 text-gray-700 text-xs font-medium"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* ── 5 KPI Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-4">

        <KpiCard
          label="Attendance Accuracy"
          value="89%"
          sub="On Time"
          icon={
            <svg className="w-5 h-5 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x={3} y={4} width={18} height={18} rx={2} ry={2} />
              <line x1={16} y1={2} x2={16} y2={6} />
              <line x1={8} y1={2} x2={8} y2={6} />
              <line x1={3} y1={10} x2={21} y2={10} />
            </svg>
          }
        />

        <KpiCard
          label="Total Work Experience"
          value={`${candidate.work_experiences?.length ?? 5}+Years`}
          icon={
            <svg className="w-5 h-5 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x={2} y={7} width={20} height={14} rx={2} ry={2} />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          }
        />

        <KpiCard
          label="Current role"
          value={currentRole}
          icon={
            <svg className="w-5 h-5 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
        />

        <KpiCard
          label="Current Organization"
          value={currentCompany}
          icon={
            <svg className="w-5 h-5 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          }
        />

        <KpiCard
          label="Preferred Location"
          value={candidate.preferred_location || location}
          icon={
            <svg className="w-5 h-5 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          }
        />

      </div>
    </div>
  );
};

// ── KPI Card ───────────────────────────────────────────────────
const KpiCard = ({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
}) => (
  <div className="bg-white border border-gray-200 rounded-2xl px-4 py-4 flex flex-col gap-1">
    <div className="flex items-start justify-between mb-1">
      <span className="text-xs text-gray-500 font-medium leading-tight max-w-[70%]">{label}</span>
      <div className="w-8 h-8 flex-shrink-0 rounded-lg bg-orange-50 flex items-center justify-center">
        {icon}
      </div>
    </div>
    <p className="text-base font-bold text-gray-900 leading-tight">{value}</p>
    {sub && <p className="text-xs text-gray-500">{sub}</p>}
  </div>
);