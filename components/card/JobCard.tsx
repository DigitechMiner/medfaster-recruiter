'use client';

import React from 'react';
import { MapPin } from 'lucide-react';
import { resolveCanadianProvinceLabel, resolveCanadianCityLabel, useMetadataStore } from '@/stores/metadataStore';
import type { JobListItem } from '@/types';
import {
  formatDateRangeShort,
  formatJobDisplayId,
  formatJobTitleDisplay,
  formatListingStatus,
  formatLocationCityProvince,
  getFilledPositions,
  getJobShiftTypeLabels,
  getListingStatusBadgeClass,
  getRequiredPositions,
  getShiftTypeBadgeClass,
} from '@/app/jobs/components/helper';

function SkeletonLine({ className = "h-4 w-full" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-gray-100 ${className}`} />;
}

export function JobCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 flex flex-col gap-3 border border-gray-200">
      <SkeletonLine className="h-5 w-3/4" />

      <div className="flex items-start gap-1.5">
        <SkeletonLine className="h-3.5 w-3.5 shrink-0 mt-0.5 rounded-full" />
        <SkeletonLine className="h-4 flex-1 max-w-[160px]" />
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        <SkeletonLine className="h-4 w-24" />
        <SkeletonLine className="h-4 w-28" />
        <SkeletonLine className="h-4 w-20" />
        <SkeletonLine className="col-span-2 h-4 w-40" />
      </div>

      <SkeletonLine className="h-4 w-36" />

      <div className="flex gap-2 mt-1">
        <SkeletonLine className="h-10 flex-1 rounded-lg" />
        <SkeletonLine className="h-10 flex-1 rounded-lg" />
      </div>
    </div>
  );
}

export const JobCard: React.FC<{
  job: JobListItem;
  onPreview?: (job: JobListItem) => void;
  onViewDetails?: (job: JobListItem) => void;
}> = ({ job, onPreview, onViewDetails }) => {
  const provinceOptions = useMetadataStore((state) => state.provinceOptions);
  const provinceLabel = resolveCanadianProvinceLabel(provinceOptions, job.province);
  const cityLabel = resolveCanadianCityLabel(provinceOptions, job.province, job.city);
  const location = formatLocationCityProvince(job, provinceLabel, cityLabel);
  const listingStatus = formatListingStatus(job);
  const statusClass = getListingStatusBadgeClass(listingStatus);
  const hiresRequired = getRequiredPositions(job);
  const hiresFilled = getFilledPositions(job);
  const shiftLabels = getJobShiftTypeLabels(job);
  const dateRange = formatDateRangeShort(job);
  const jobDisplayId = formatJobDisplayId(job.id);

  return (
    <div
      className="bg-white rounded-2xl p-4 flex flex-col gap-3 border border-gray-200"
    >
      {jobDisplayId ? (
        <p
          className="break-all font-mono text-[11px] font-semibold tracking-wide text-[#F4781B]"
          title={job.id}
        >
          {jobDisplayId}
        </p>
      ) : null}
      <h3 className="font-bold text-gray-900 text-[15px] leading-snug">
        {formatJobTitleDisplay(job.job_title)}
      </h3>

      <p className="flex items-start gap-1.5 text-sm text-gray-600">
        <MapPin size={14} className="text-[#F4781B] flex-shrink-0 mt-0.5" />
        <span>{location}</span>
      </p>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <div>
          <span className="text-gray-500">Status: </span>
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusClass}`}>
            {listingStatus}
          </span>
        </div>
        <div>
          <span className="text-gray-500">Applications: </span>
          <span className="font-medium text-gray-800">{job.application_count}</span>
        </div>
        <div>
          <span className="text-gray-500">Hires: </span>
          <span className="font-medium text-gray-800">{hiresFilled}</span>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600">{hiresRequired}</span>
        </div>
      </div>

      {(dateRange || shiftLabels.length > 0) && (
        <div className="flex flex-wrap items-center gap-2">
          {dateRange ? <p className="text-sm text-gray-600">{dateRange}</p> : null}
          {shiftLabels.map((label) => (
            <span
              key={`${job.id}-schedule-${label}`}
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${getShiftTypeBadgeClass(label)}`}
            >
              {label}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2 mt-1">
        <button
          type="button"
          onClick={() => onPreview?.(job)}
          className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-[#492408] transition-colors hover:bg-[#FEE8D6] border border-[#492408] bg-[#FEF1E8]"
        >
          Preview
        </button>
        <button
          type="button"
          onClick={() => onViewDetails?.(job)}
          className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#F4781B] hover:bg-[#e06a10] transition-colors"
        >
          Details
        </button>
      </div>
    </div>
  );
};
