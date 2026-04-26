"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { ArrowLeft, FileText, Zap, Calendar, UserCheck } from "lucide-react";
import type { CandidateDetailProfile } from '@/Interface/recruiter.types'; // ✅ flat type

type CandidateWithExtras = CandidateDetailProfile & {
  is_hired?: boolean;
  is_ai_recommended?: boolean;
  is_instant_hire?: boolean;
  is_currently_available?: boolean;
};

type ActionConfig = {
  showAiBadge: boolean;
  showShortlist: boolean;
  primaryLabel: string;
  primaryVariant: "orange" | "green" | "outline" | "orangeOutline";
  primaryIcon?: "zap" | "calendar" | "user";
  actionType: "shortlist" | "hire" | "schedule" | "invite";
};

interface CandidateHeroProps {
  candidate: CandidateDetailProfile; // ✅ was CandidateDetailsResponse
  onBack: () => void;
  onExport?: () => void;
  onShortlist?: () => void;
  onPrimaryAction?: (actionType: ActionConfig["actionType"]) => void;
}

const getActionConfig = (candidate: CandidateWithExtras): ActionConfig => {
  if (candidate.is_ai_recommended) {
    return { showAiBadge: true, showShortlist: true, primaryLabel: "Direct Hire", primaryVariant: "orange", actionType: "hire" };
  }
  if (candidate.is_instant_hire) {
    return { showAiBadge: false, showShortlist: false, primaryLabel: "Hire Instantly", primaryVariant: "green", primaryIcon: "zap", actionType: "hire" };
  }
  if (candidate.is_currently_available) {
    return { showAiBadge: false, showShortlist: false, primaryLabel: "Schedule A Interview", primaryVariant: "outline", primaryIcon: "user", actionType: "schedule" };
  }
  return { showAiBadge: false, showShortlist: false, primaryLabel: "Invite For a Job", primaryVariant: "orangeOutline", primaryIcon: "calendar", actionType: "invite" };
};

export const CandidateHero: React.FC<CandidateHeroProps> = ({
  candidate, onBack, onExport, onShortlist, onPrimaryAction,
}) => {
  const c = candidate as CandidateWithExtras;
  const isHired = c.is_hired === true;
  const actionConfig = getActionConfig(c);

  const fullName = candidate.full_name || `${candidate.first_name} ${candidate.last_name ?? ""}`.trim();

  const location =
    candidate.city && candidate.state
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

  const roleTags: string[] = useMemo(() => {
    const rawSpecialty = c.specialty;
    const raw: string[] = Array.isArray(rawSpecialty) ? rawSpecialty : rawSpecialty ? [rawSpecialty] : skillsArray;
    return Array.isArray(raw) && raw.length > 0 ? raw.slice(0, 3) : ["Licensed Practical Nurse"];
  }, [skillsArray, c]);

  const specializations: string[] = useMemo(() => {
    const raw = c.specializations ?? c.specialty ?? null;
    if (Array.isArray(raw) && raw.length > 0) return raw;
    if (c.medical_industry) return [c.medical_industry];
    return ["Long-Term Care", "Home Care", "Rehabilitation", "Palliative Care", "Clinics"];
  }, [c]);

  const currentCompany = candidate.work_experiences?.[0]?.company || "KeRaeva";
  const currentRole    = candidate.work_experiences?.[0]?.title || "Licensed Practical Nurse";

  return (
    <div className="flex flex-col gap-0">
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-5 pb-0">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <button onClick={onBack} className="hover:text-gray-800 transition-colors" aria-label="Go back">
              <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            </button>
            <span>Candidates</span>
            <span className="text-gray-300">/</span>
            <span className="text-[#F4781B] font-semibold">Candidate_Id</span>
          </div>
          <div className="flex items-center gap-2">
            {actionConfig.showAiBadge && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-[#F4781B] text-[#F4781B] text-xs font-medium">
                <span className="text-[10px]">✦</span> KeRaeva&apos;s AI Recommended
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 border border-green-300 text-green-600 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Online
            </span>
          </div>
        </div>

        <div className="px-6 pt-4 pb-0">
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            <div className="w-28 h-32 sm:w-32 sm:h-36 rounded-xl overflow-hidden bg-orange-50 flex-shrink-0">
              <Image
                src={candidate.profile_image_url || "/svg/Photo.svg"}
                alt={fullName} width={128} height={144}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{fullName}</h1>

                <div className="flex flex-wrap gap-2 mb-4">
                  {roleTags.map((tag, i) => (
                    <span key={i} className="px-3 py-1 rounded-full border border-gray-300 text-gray-700 text-xs font-medium">{tag}</span>
                  ))}
                </div>

                <div className="flex flex-wrap items-center divide-x divide-gray-200 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-1.5 pr-4">
                    <svg className="w-4 h-4 text-[#F4781B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {location}
                  </div>
                  <div className="flex items-center gap-1.5 px-4">
                    <svg className="w-4 h-4 text-[#F4781B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <rect x={2} y={4} width={20} height={16} rx={2} />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                    {isHired ? candidate.email || "N/A" : "• • • • • • • • • • • •"}
                  </div>
                  <div className="flex items-center gap-1.5 pl-4">
                    <svg className="w-4 h-4 text-[#F4781B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.11 12 19.79 19.79 0 0 1 1.04 3.4 2 2 0 0 1 3 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    {isHired ? candidate.phone_number || "N/A" : "• • • • • • • • • • • • • • •"}
                  </div>
                  <div className="flex items-center gap-1.5 pl-4">
                    <svg className="w-4 h-4 text-[#F4781B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {candidate.job_type || "Part Time"}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#F4781B]">Work Eligibility :</span>
                  <span className="px-3 py-0.5 rounded-full border border-gray-300 text-gray-700 text-xs font-medium">
                    {candidate.work_eligibility || "Canadian Citizen"}
                  </span>
                </div>
              </div>

              <ActionButtons config={actionConfig} onExport={onExport} onShortlist={onShortlist} onPrimaryAction={onPrimaryAction} />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 mt-3 border-t border-gray-100">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-[#F4781B] whitespace-nowrap">Specializations :</span>
            {specializations.map((s, i) => (
              <span key={i} className="px-3 py-1 rounded-full border border-gray-300 text-gray-700 text-xs font-medium">{s}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-4">
        <KpiCard label="Attendance Accuracy" value="89%" sub="On Time" />
        <KpiCard label="Total Work Experience" value={`${candidate.work_experiences?.length ?? 5}+Years`} />
        <KpiCard label="Current Role" value={currentRole} />
        <KpiCard label="Current Organization" value={currentCompany} />
        <KpiCard label="Preferred Location" value={candidate.preferred_location || location} />
      </div>
    </div>
  );
};

const ActionButtons = ({
  config, onExport, onShortlist, onPrimaryAction,
}: {
  config: ActionConfig;
  onExport?: () => void;
  onShortlist?: () => void;
  onPrimaryAction?: (actionType: ActionConfig["actionType"]) => void;
}) => {
  const primaryClassMap = {
    orange:       "bg-[#F4781B] hover:bg-[#e06a10] text-white border border-[#F4781B]",
    green:        "bg-green-50 hover:bg-green-100 text-green-600 border border-green-400",
    outline:      "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300",
    orangeOutline:"bg-white hover:bg-orange-50 text-[#F4781B] border border-[#F4781B]",
  };

  return (
    <div className="flex flex-col sm:items-end gap-2 flex-shrink-0 w-full sm:w-auto">
      <div className="flex flex-wrap justify-start sm:justify-end gap-2">
        <button onClick={onExport} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors whitespace-nowrap">
          <FileText size={15} className="text-gray-500" /> Export Profile
        </button>
        {config.showShortlist && (
          <button onClick={onShortlist} className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors whitespace-nowrap">
            Shortlist
          </button>
        )}
        <button
          onClick={() => onPrimaryAction?.(config.actionType)}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap ${primaryClassMap[config.primaryVariant]}`}
        >
          {config.primaryIcon === "zap"      && <Zap size={14} className="fill-current" />}
          {config.primaryIcon === "calendar" && <Calendar size={14} />}
          {config.primaryIcon === "user"     && <UserCheck size={14} />}
          {config.primaryLabel}
        </button>
      </div>
    </div>
  );
};

const KpiCard = ({ label, value, sub }: { label: string; value: string; sub?: string }) => (
  <div className="bg-white border border-gray-200 rounded-2xl px-4 py-4 flex flex-col gap-1">
    <div className="flex items-start justify-between mb-1">
      <span className="text-xs text-gray-500 font-medium leading-tight max-w-[70%]">{label}</span>
      <div className="w-8 h-8 flex-shrink-0 rounded-lg bg-orange-50" />
    </div>
    <p className="text-base font-bold text-gray-900 leading-tight">{value}</p>
    {sub && <p className="text-xs text-gray-500">{sub}</p>}
  </div>
);