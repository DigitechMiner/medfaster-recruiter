'use client';

import React from 'react';
import Image from 'next/image';
import { getTimeAgo } from '@/utils/getTimePeriod';
import {
  convertJobTypeToFrontend,
  convertQualificationToFrontend,
  convertSpecializationToFrontend,
} from '@/utils/constant/metadata';

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

export const JobListingCard: React.FC<JobListingCardProps> = ({ job }) => {
  const timeAgo = getTimeAgo(job.created_at);

  const specializationDisplay =
    job.specialization_labels && job.specialization_labels.length > 0
      ? job.specialization_labels
      : (job.specializations ?? []).map(convertSpecializationToFrontend);

  const qualificationDisplay = (job.qualifications ?? []).map(convertQualificationToFrontend);

  const jobTypeDisplay =
    job.job_urgency === 'instant'
      ? 'Instant Replacement'
      : convertJobTypeToFrontend(job.job_type);

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