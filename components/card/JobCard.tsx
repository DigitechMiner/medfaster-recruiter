'use client';

import React from 'react';
import Image from 'next/image';
import { JobListingCardProps } from '@/Interface/job.types';

export const JobListingCard: React.FC<JobListingCardProps> = ({ job }) => (
  <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm hover:shadow-md transition-all relative cursor-pointer hover:border-orange-400 hover:border-2 active:border-orange-400 active:border-2">
    {/* Radio Button with Bottom-Left Border Only */}
    <div className="absolute top-0 right-0 border-b-2 border-l-2 border-gray-300 rounded-bl p-1">
      <label htmlFor={`job-${job.id}`} className="cursor-pointer block">
        <input 
          type="radio" 
          className="peer hidden" 
          id={`job-${job.id}`}
          name="job-selection"
        />
        {/* Orange Circle Inside */}
        <div className="w-4 h-4 rounded-full border-2 border-orange-500 flex items-center justify-center peer-checked:bg-orange-500">
          {/* Inner white dot when checked */}
          <div className="w-1.5 h-1.5 rounded-full bg-white opacity-0 peer-checked:opacity-100"></div>
        </div>
      </label>
    </div>
    
    <h3 className="font-bold text-gray-900 text-xl mb-3">{job.title}</h3>
    <div className="flex items-center text-sm text-gray-600 mb-3">
      <Image src="/svg/Briefcase.svg" alt="briefcase" width={16} height={16} className="mr-1" />
      <span>{job.experience} | {job.specializations[0] || 'General'} | {job.position}</span>
    </div>
    <p className="text-sm text-gray-600 mb-2">
      <span className="text-orange-500 font-semibold">Spec :</span>{' '}
      <span>{job.specializations.join(' | ')}</span>
    </p>
    <p className="text-sm text-gray-600 mb-3">
      <span className="text-orange-500 font-semibold">Qualif :</span>{' '}
      <span>{job.specializations.join(' | ')}</span>
    </p>
    <div className="border-t border-gray-200 pt-3 mt-3">
      <div className="flex items-center justify-between text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <Image src="/svg/Time.svg" alt="time" width={16} height={16} />
          <span>{job.postedDaysAgo} min ago</span>
        </div>
        <div className="flex items-center gap-1">
          <Image src="/svg/People.svg" alt="people" width={16} height={16} />
          <span>{job.applicantCount} applied</span>
        </div>
      </div>
    </div>
  </div>
);

