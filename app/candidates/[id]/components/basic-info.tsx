"use client";

import Image from "next/image";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  Clock3,
  Mail,
  Phone,
  MapPin,
  Download,
  Building2,
  Layers,
} from "lucide-react";
import type { ComponentType } from "react";
import type { ActionType, CandidateDetailProfile } from "@/Interface/recruiter.types";
import {
  BreadcrumbNav,
  getRouteBreadcrumb,
} from "@/components/ui/breadcrumb-nav";

type BasicInfoItem = {
  key: string;
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
};

function toLabel(raw?: string | null): string {
  if (!raw) return "—";
  return raw.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function toCompactExperienceLabel(months?: number | null): string {
  if (months == null) return "—";
  const years = Math.floor(months / 12);
  if (years === 0) return `${months}+ months`;
  return `${years}+ ${years === 1 ? "year" : "years"}`;
}

export function CandidateHero({
  candidate,
  onExport,
  onPrimaryAction,
}: {
  candidate: CandidateDetailProfile;
  onExport?: () => void;
  onPrimaryAction?: (actionType: ActionType) => void;
}) {
  const fullName =
    candidate.full_name || `${candidate.first_name} ${candidate.last_name ?? ""}`.trim();
  const location =
    candidate.city && candidate.state
      ? `${candidate.city}, ${candidate.state}`
      : candidate.preferred_location || "N/A";
  const roleTags =
    candidate.job_titles && candidate.job_titles.length > 0
      ? candidate.job_titles.map((title) => toLabel(title))
      : [toLabel(candidate.job_title)];
  const isOnline = Boolean(candidate.is_active);
  const email = "************";
  const phone = "************";
  const jobTypes = (
    Array.isArray(candidate.job_type) ? candidate.job_type : [candidate.job_type]
  )
    .filter((jobType): jobType is string => Boolean(jobType))
    .map((jobType) => toLabel(jobType));
  const specs = candidate.specializations?.slice(0, 5) ?? [];
  const pathname = usePathname();
  const breadcrumbs = useMemo(() => getRouteBreadcrumb(pathname), [pathname]);

  return (
    <div className="rounded-2xl border border-[#e5e7eb] bg-white p-4 md:p-5">
      <div className="mb-4 flex items-center justify-between gap-2 min-w-0">
  <div className="min-w-0 flex-1 overflow-hidden">
    <BreadcrumbNav breadcrumbs={breadcrumbs} />
  </div>
  <span
    className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
      isOnline ? "bg-[#E7F8EE] text-[#0A9B59]" : "bg-gray-100 text-gray-500"
    }`}
  >
    {isOnline ? "Online" : "Offline"}{" "}
    <span className="ml-1 inline-block h-2 w-2 rounded-full bg-current" />
  </span>
</div>
      <div className="flex flex-col justify-between gap-4 lg:flex-row">
        <div className="flex flex-1 gap-4">
          <div className="h-24 w-24 overflow-hidden rounded-lg bg-orange-50">
            <Image
              src={candidate.profile_image_url || "/svg/Photo.svg"}
              alt={fullName}
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-2">
            <h1 className="text-[34px] leading-none font-semibold text-[#242833]">{fullName}</h1>
            <div className="flex flex-wrap items-center gap-2">
              {roleTags.map((role, index) => (
                <span
                  key={`${role}-${index}`}
                  className="inline-flex rounded-md bg-[#F3F4F6] px-2 py-1 text-xs text-[#525866]"
                >
                  {role}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-y-2 text-sm text-[#6B7280] sm:grid-cols-2">
              <span className="inline-flex items-center gap-1.5 sm:pr-4 sm:border-r sm:border-gray-200">
                <MapPin className="h-4 w-4 text-[#F4781B]" /> {location}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-[#F4781B]" /> {email}
              </span>
              <span className="inline-flex items-center gap-1.5 sm:pr-4 sm:border-r sm:border-gray-200">
                <Phone className="h-4 w-4 text-[#F4781B]" /> {phone}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="h-4 w-4 text-[#F4781B]" />
                <span className="inline-flex flex-wrap items-center gap-1.5">
                  {(jobTypes.length > 0 ? jobTypes : ["—"]).map((jobType, index) => (
                    <span
                      key={`${jobType}-${index}`}
                      className="inline-flex rounded-md bg-[#F3F4F6] px-2 py-1 text-xs text-[#525866]"
                    >
                      {jobType}
                    </span>
                  ))}
                </span>
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-start gap-2">
  <button
    onClick={onExport}
    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-[#3B414F] whitespace-nowrap"
  >
    <Download size={14} /> Export Profile
  </button>
  <button
    onClick={() => onPrimaryAction?.("shortlist")}
    className="inline-flex items-center gap-2 rounded-lg border border-[#F3B378] bg-[#FFF7F1] px-4 py-2 text-sm font-semibold text-[#C87521] whitespace-nowrap"
  >
    <Briefcase size={14} /> Invite For a Job
  </button>
</div>
      </div>
      <div className="mt-4 border-t border-gray-200 pt-4 space-y-3">
        <div className="text-sm">
          <span className="text-[#F4781B] font-medium">Work Eligibility :</span>
          <span className="ml-2 rounded-md bg-[#F3F4F6] px-2 py-1 text-xs text-[#525866]">
            {toLabel(candidate.work_eligibility)}
          </span>
        </div>
        {specs.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-[#F4781B]">Specializations :</span>
            {specs.map((spec) => (
              <span
                key={spec}
                className="rounded-md bg-[#F3F4F6] px-2 py-1 text-xs text-[#525866]"
              >
                {toLabel(spec)}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function CandidateBasicInfo({ candidate }: { candidate: CandidateDetailProfile }) {
  const totalWorkExperienceMonths =
    candidate.static_experience_months ?? candidate.experience_in_months;
  const totalWorkExperience = toCompactExperienceLabel(totalWorkExperienceMonths);
  const currentRole = candidate.work_experiences?.find((exp) => exp.is_current)?.title;
  const currentCompany = candidate.work_experiences?.find((exp) => exp.is_current)?.company;
  const preferredLocation =
    candidate.city && candidate.state ? `${candidate.city}, ${candidate.state}` : "N/A";
  const infoItems: BasicInfoItem[] = [
    {
      key: "experience",
      label: "Total Work Experience",
      value: totalWorkExperience,
      icon: Briefcase,
    },
    {
      key: "current-role",
      label: "Current role",
      value: toLabel(currentRole),
      icon: Layers,
    },
    {
      key: "current-company",
      label: "Current Company",
      value: currentCompany || "N/A",
      icon: Building2,
    },
    {
      key: "location",
      label: "Preferred Location",
      value: preferredLocation,
      icon: MapPin,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {infoItems.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.key} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <span className="text-xs text-gray-500">{item.label}</span>
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#FFF4EC]">
                <Icon className="h-4 w-4 text-[#F4781B]" />
              </span>
            </div>
            <p className="text-lg font-semibold text-[#242833] break-words">{item.value || "—"}</p>
          </div>
        );
      })}
    </div>
  );
}
