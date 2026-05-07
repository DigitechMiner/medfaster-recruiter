"use client";

import Image from "next/image";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  Calendar,
  Clock3,
  Mail,
  Phone,
  MapPin,
  CircleCheck,
  CircleOff,
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

function toExperienceLabel(months?: number | null): string {
  if (months == null) return "—";
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (years === 0) return `${remainingMonths} Months`;
  if (remainingMonths === 0) return `${years} Years`;
  return `${years} Years ${remainingMonths} Months`;
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
  const role = toLabel(candidate.job_title);
  const isOnline = true;
  const contactEmail = candidate.user?.email ?? candidate.email;
  const contactPhone = candidate.user?.phone ?? candidate.phone_number;
  const email = contactEmail ? `${contactEmail.slice(0, 2)}************` : "Not available";
  const phone = contactPhone ? `${contactPhone.slice(0, 3)}********` : "Not available";
  const jobType = toLabel(candidate.job_type);
  const specs = candidate.specializations?.slice(0, 5) ?? [];
  const pathname = usePathname();
  const breadcrumbs = useMemo(() => getRouteBreadcrumb(pathname), [pathname]);

  return (
    <div className="rounded-2xl border border-[#e5e7eb] bg-white p-4 md:p-5">
      <div className="mb-4 flex items-center justify-between">
        <BreadcrumbNav breadcrumbs={breadcrumbs} />
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            isOnline ? "bg-[#E7F8EE] text-[#0A9B59]" : "bg-gray-100 text-gray-500"
          }`}
        >
          {isOnline ? "Online" : "Offline"} <span className="ml-1 inline-block h-2 w-2 rounded-full bg-current" />
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
            <span className="inline-flex rounded-md bg-[#F3F4F6] px-2 py-1 text-xs text-[#525866]">
              {role}
            </span>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-[#6B7280]">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-[#F4781B]" /> {location}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-[#F4781B]" /> {email}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-4 w-4 text-[#F4781B]" /> {phone}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="h-4 w-4 text-[#F4781B]" /> {jobType}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-[#F4781B] font-medium">Work Eligibility :</span>
              <span className="ml-2 rounded-md bg-[#F3F4F6] px-2 py-1 text-xs text-[#525866]">
                {toLabel(candidate.work_eligibility)}
              </span>
            </div>
            {specs.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
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
        <div className="flex items-start gap-2">
          <button
            onClick={onExport}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-[#3B414F]"
          >
            <Download size={14} /> Interview Response
          </button>
          <button
            onClick={() => onPrimaryAction?.("hire")}
            className="inline-flex items-center gap-2 rounded-lg bg-[#11A75C] px-4 py-2 text-sm font-semibold text-white"
          >
            <CircleCheck size={14} /> Hire
          </button>
          <button
            onClick={() => onPrimaryAction?.("shortlist")}
            className="inline-flex items-center gap-2 rounded-lg bg-[#EF4444] px-4 py-2 text-sm font-semibold text-white"
          >
            <CircleOff size={14} /> Reject
          </button>
        </div>
      </div>
    </div>
  );
}

export function CandidateBasicInfo({ candidate }: { candidate: CandidateDetailProfile }) {
  const staticExperienceMonths = (candidate as CandidateDetailProfile & {
    static_experience_months?: number | null;
  }).static_experience_months;
  const totalWorkExperience = toExperienceLabel(
    staticExperienceMonths ?? candidate.experience_in_months
  );
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
