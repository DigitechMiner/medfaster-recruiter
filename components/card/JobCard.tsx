'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { BriefcaseBusiness, Clock, MapPin, User } from 'lucide-react';
import { getTimeAgo } from '@/utils/getTimePeriod';
import { getMetadataLabel } from '@/utils/constant/metadata';
import { getBackendImageUrl } from '@/stores/api/api-client';
import { useAuthStore } from '@/stores/authStore';
import { useMetadataStore } from '@/stores/metadataStore';
import type { JobListItem } from '@/types';
import { getJobShiftDisplayLines } from '@/app/jobs/components/helper';

const gridBadgeVariantMap: Record<string, string> = {
  Regular: 'bg-[#D1FAE5] text-[#059669]',
  Urgent: 'bg-[#FEE9D6] text-[#F4781B]',
  Required: 'bg-[#D1FAE5] text-[#059669]',
  'Not Required': 'bg-[#FEF9C3] text-[#D97706]',
  'Not Needed': 'bg-[#FEE9D6] text-[#F4781B]',
  OPEN: 'bg-[#DBEAFE] text-[#2563EB]',
  Open: 'bg-[#DBEAFE] text-[#2563EB]',
  DRAFT: 'bg-[#F3F4F6] text-[#6B7280]',
  Draft: 'bg-[#F3F4F6] text-[#6B7280]',
  PAUSED: 'bg-[#FEF9C3] text-[#D97706]',
  Active: 'bg-[#D1FAE5] text-[#059669]',
  Completed: 'bg-[#FEF9C3] text-[#D97706]',
  Upcoming: 'bg-[#7C2D12] text-white',
  CLOSED: 'bg-[#FEE2E2] text-[#DC2626]',
  Closed: 'bg-[#FEE2E2] text-[#DC2626]',
};

const gridBadgeDisplayMap: Record<string, string> = {
  OPEN: 'Open',
  CLOSED: 'Closed',
  DRAFT: 'Draft',
  PAUSED: 'Paused',
};

function getGridInterviewBadge(job: JobListItem): { label: string; cls: string } {
  if (job.job_urgency === 'INSTANT') {
    return { label: 'No Interview Needed', cls: 'bg-[#FEE4E2] text-[#912018]' };
  }

  if (job.ai_interview) {
    return { label: 'AI Interview', cls: 'bg-[#D1FAE5] text-[#059669]' };
  }

  return { label: 'No Interview Required', cls: 'bg-[#FEF9C3] text-[#854D0E]' };
}

const GridJobStatusBadge: React.FC<{ label: string }> = ({ label }) => {
  const cls = gridBadgeVariantMap[label] ?? 'bg-[#F3F4F6] text-[#6B7280]';
  const display = gridBadgeDisplayMap[label] ?? label;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${cls}`}
    >
      {display}
    </span>
  );
};

interface JobListingCardProps {
  job: {
    id: string;
    job_title: string;
    years_of_experience: string | null;
    department: string | null;
    job_type: string | null;
    job_urgency?: 'instant' | 'normal' | null;       // ✅ added
    specializations: string[] | null;
    specialization_labels?: string[] | null;          // ✅ added — backend sends these
    qualifications: string[] | null;
    city?: string | null;                             // ✅ added
    province?: string | null;                         // ✅ added
    pay_range_min?: string | number | null;           // ✅ added
    pay_range_max?: string | number | null;           // ✅ added
    created_at: string;
    updated_at: string;
    application_count?: number;
  };
}

export const JobCard: React.FC<{ job: JobListItem }> = ({ job }) => {
  const router = useRouter();
  const profile = useAuthStore((state) => state.recruiterProfile);
  const jobTypeOptions = useMetadataStore((state) => state.jobTypeOptions);
  const logoUrl = profile?.organization_photo_url
    ? getBackendImageUrl(profile.organization_photo_url)
    : null;
  const orgName = profile?.organization_name ?? 'ORG';

  const urgency = job.job_urgency === 'INSTANT' ? 'Urgent' : 'Regular';
  const location = job.city || null;
  const jobType = job.job_type ? getMetadataLabel(jobTypeOptions, job.job_type) : null;
  const interview = getGridInterviewBadge(job);
  const shiftLines = getJobShiftDisplayLines(job);

  const metaParts = [
    job.years_of_experience
      ? {
          icon: <BriefcaseBusiness size={12} color="orange" />,
          text: `${job.years_of_experience} yrs`,
        }
      : null,
    job.department
      ? {
          icon: <BriefcaseBusiness size={12} color="orange" />,
          text: job.department,
        }
      : null,
    jobType ? { icon: <Clock size={12} color="orange" />, text: jobType } : null,
  ].filter(Boolean) as { icon: React.ReactNode; text: string }[];

  return (
    <div
      className="bg-white rounded-2xl p-4 flex flex-col gap-3"
      style={{ border: '1px solid #E5E7EB' }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400 font-medium tracking-wide">
          Job ID: {job.id.slice(0, 8).toUpperCase()}
        </span>
        <div className="flex items-center gap-1.5">
          <GridJobStatusBadge label={urgency} />
          <GridJobStatusBadge label={job.status} />
        </div>
      </div>

      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={orgName}
              width={48}
              height={48}
              className="object-contain w-full h-full"
            />
          ) : (
            <span className="text-[10px] font-extrabold text-[#F4781B] uppercase text-center leading-tight px-1">
              {orgName.slice(0, 6)}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-gray-900 text-[15px] leading-snug truncate">
            {job.job_title}
          </h3>
          {metaParts.length > 0 && (
            <div className="flex items-center gap-1.5 mt-1 text-xs flex-wrap">
              {metaParts.map((part, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span className="text-gray-300">|</span>}
                  <span className="flex items-center gap-1 text-gray-400">
                    {part.icon}
                    <span className="text-gray-500">{part.text}</span>
                  </span>
                </React.Fragment>
              ))}
            </div>
          )}
          {shiftLines.length > 0 && (
            <div className="flex flex-col gap-1 mt-2">
              {shiftLines.map((line, index) => (
                <span
                  key={`${job.id}-shift-${index}`}
                  className="flex items-center gap-1 text-xs text-gray-500"
                >
                  <Clock size={12} className="text-[#F4781B] flex-shrink-0" />
                  <span className="leading-snug">{line}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1 text-xs text-gray-500">
          <MapPin size={13} className="text-[#F4781B] flex-shrink-0" />
          {location ?? '-'}
        </span>
        <span
          className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${interview.cls}`}
        >
          <User size={11} />
          {interview.label}
        </span>
      </div>

      <button
        onClick={() => router.push(`/jobs/${job.id}`)}
        className="w-full py-2.5 rounded-lg text-sm font-semibold text-[#492408] transition-colors hover:bg-[#FEE8D6]"
        style={{
          border: '1px solid #492408',
          backgroundColor: '#FEF1E8',
        }}
      >
        View Job Details
      </button>
    </div>
  );
};

export const JobListingCard: React.FC<JobListingCardProps> = ({ job }) => {
  const timeAgo = getTimeAgo(job.created_at);
  const jobTypeOptions = useMetadataStore((state) => state.jobTypeOptions);
  const specializationOptions = useMetadataStore((state) => state.specializations);

  const specializationDisplay =
    job.specialization_labels && job.specialization_labels.length > 0
      ? job.specialization_labels
      : (job.specializations ?? []).map((specialization) =>
          getMetadataLabel(specializationOptions, specialization),
        );

  const qualificationDisplay = job.qualifications ?? [];

  const jobTypeDisplay =
    job.job_urgency === 'instant'
      ? 'Instant Replacement'
      : job.job_type
        ? getMetadataLabel(jobTypeOptions, job.job_type)
        : 'Not specified';

  // ✅ Location — show if backend returns it (after backend fix)
  const locationDisplay =
    job.city && job.province
      ? `${job.city}, ${job.province}`
      : job.city || null;

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm hover:shadow-md transition-all relative cursor-pointer hover:border-orange-400 hover:border-2 active:border-orange-400 active:border-2">
      {/* Radio selector */}
      <div className="absolute top-0 right-0 border-b-2 border-l-2 border-gray-300 rounded-bl p-1">
        <label htmlFor={`job-${job.id}`} className="cursor-pointer block">
          <input
            type="radio"
            className="peer hidden"
            id={`job-${job.id}`}
            name="job-selection"
          />
          <div className="w-4 h-4 rounded-full border-2 border-orange-500 flex items-center justify-center peer-checked:bg-orange-500">
            <div className="w-1.5 h-1.5 rounded-full bg-white opacity-0 peer-checked:opacity-100"></div>
          </div>
        </label>
      </div>

      <h3 className="font-bold text-gray-900 text-xl mb-3">{job.job_title}</h3>

      <div className="flex items-center text-sm text-gray-600 mb-3">
  <Image src="/svg/Briefcase.svg" alt="briefcase" width={16} height={16} className="mr-1" />
  <span>
    {/* ✅ instant jobs don't have experience */}
    {job.job_urgency === 'instant'
      ? jobTypeDisplay
      : `${job.years_of_experience || 'Not specified'} | ${specializationDisplay[0] || 'General'} | ${jobTypeDisplay}`
    }
  </span>
</div>

      <p className="text-sm text-gray-600 mb-2">
        <span className="text-[#F4781B] font-semibold">Spec : </span>
        <span>{specializationDisplay.join(' | ') || 'N/A'}</span>
      </p>

      <p className="text-sm text-gray-600 mb-2">
        <span className="text-[#F4781B] font-semibold">Qualif : </span>
        <span>{qualificationDisplay.join(' | ') || 'N/A'}</span>
      </p>

      {/* ✅ Location — shows once backend fix is done */}
      {locationDisplay && (
        <p className="text-sm text-gray-600 mb-3">
          <span className="text-[#F4781B] font-semibold">Location : </span>
          <span>{locationDisplay}</span>
        </p>
      )}

      <div className="border-t border-gray-200 pt-3 mt-3">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <Image src="/svg/Time.svg" alt="time" width={16} height={16} />
            <span>{timeAgo}</span>
          </div>
          <div className="flex items-center gap-1">
            <Image src="/svg/People.svg" alt="people" width={16} height={16} />
            <span>{job.application_count || 0} applied</span>
          </div>
        </div>
      </div>
    </div>
  );
};