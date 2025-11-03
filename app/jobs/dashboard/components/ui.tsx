'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { DetailedJobCardProps, ScoreBoxProps, JobListingCardProps, JobCardProps, StatusSectionProps, StatusTableProps, BadgeColor, Job, StatusType } from '../types/job.types';

// ============ DETAIL CARD ============
export const DetailedJobCard: React.FC<DetailedJobCardProps> = ({ job, status, onClose }) => {
  const statusColors: Record<string, string> = { applied: 'text-blue-600', shortlisted: 'text-orange-600', interviewing: 'text-red-600', hired: 'text-green-600' };
  const statusColor = statusColors[status] || 'text-gray-600';

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800">{job.doctorName} Details</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-sm cursor-pointer">✕ Close</button>
      </div>
      <div className="space-y-2">
        {[{ label: 'Name', value: job.doctorName, extra: `${job.experience} yrs` }, { label: 'Company', value: job.currentCompany ?? 'Canada Health', extra: job.position }, { label: 'Status', value: status.charAt(0).toUpperCase() + status.slice(1), extra: 'View Details' }].map((row, i) => (
          <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-100">
            <div className="w-1 h-1 bg-gray-300 rounded-full flex-shrink-0"></div>
            <span className="text-xs text-gray-500 min-w-[60px]">{row.label}</span>
            <span className={`text-sm font-medium flex-1 ${row.label === 'Status' ? statusColor : 'text-gray-800'}`}>{row.value}</span>
            <span className={`text-xs ${row.label === 'Status' ? statusColor : 'text-gray-500'} cursor-pointer hover:underline`}>{row.extra}</span>
          </div>
        ))}
        <div className="flex items-center gap-3 py-2">
          <div className="w-1 h-1 bg-gray-300 rounded-full flex-shrink-0"></div>
          <span className="text-xs text-gray-500 min-w-[60px]">Score</span>
          <div className="flex items-center gap-2 flex-1">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center"><div className="w-2 h-2 bg-green-500 rounded-full"></div></div>
            <span className="text-sm font-bold text-green-800">{job.score}</span>
            <span className="text-xs text-gray-500">/100</span>
          </div>
          <span className="text-xs text-gray-500 flex-shrink-0">Action</span>
        </div>
      </div>
    </div>
  );
};

// ============ SCORE BOX ============
export const ScoreBox: React.FC<ScoreBoxProps> = ({ score }) => (
  <div className="bg-white border border-green-400 rounded-md p-1.5 flex-shrink-0">
    <div className="flex items-center gap-1">
      <Image src="/svg/Progress.svg" alt="progress" width={16} height={16} />
      <span className="text-xs font-semibold text-green-800">{score}/100</span>
    </div>
    <div className="text-xs text-green-600">Score</div>
  </div>
);


export const JobListingCard: React.FC<JobListingCardProps> = ({ job }) => (
  <div className="bg-white border-2 border-orange-200 rounded-lg p-4 hover:shadow-md transition relative cursor-pointer hover:border-orange-400">
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
    
    <h3 className="font-semibold text-gray-800 text-xl mb-3">{job.title}</h3>
    <div className="flex items-center gap-1 text-xs text-gray-600 mb-3">
      <Image src="/svg/Briefcase.svg" alt="briefcase" width={16} height={16} />
      <span>{job.experience} | {job.position}</span>
    </div>
    <p className="text-xs text-orange-600 mb-2 line-clamp-1">Spec : {job.specializations.join(' · ')}</p>
    <p className="text-xs text-orange-600 font-medium mb-3 line-clamp-1">Qualif : {job.specializations.join(' · ')}</p>
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
);


// ============ JOB ACTION MODAL ============
interface JobActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'success' | 'confirm';
  title: string;
  message: string;
  svgIcon: React.ReactNode;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
  primaryButtonColor?: 'orange' | 'red' | 'green';
}

export const JobActionModal: React.FC<JobActionModalProps> = ({ isOpen, onClose, title, message, svgIcon, primaryButtonText = 'Done', secondaryButtonText = 'No', onPrimaryClick, onSecondaryClick, primaryButtonColor = 'orange' }) => {
  if (!isOpen) return null;
  const primaryColorClasses = primaryButtonColor === 'orange' ? 'bg-orange-500 hover:bg-orange-600' : primaryButtonColor === 'green' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600';
  
  return (
    <>
      <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8 max-w-sm w-full text-center shadow-lg">
          <div className="mb-4 flex justify-center">{svgIcon}</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">{title}</h2>
          {message && <p className="text-sm text-gray-600 mb-6">{message}</p>}
          <div className="flex gap-3">
            {secondaryButtonText && (<button onClick={onSecondaryClick || onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors">{secondaryButtonText}</button>)}
            <button onClick={onPrimaryClick || onClose} className={`flex-1 px-4 py-2 ${primaryColorClasses} text-white rounded-lg font-medium text-sm transition-colors`}>{primaryButtonText}</button>
          </div>
        </div>
      </div>
    </>
  );
};

// ============ STATUS SECTION ============
const statusSectionColors: Record<BadgeColor, { border: string; bg: string; dot: string; text: string }> = {
  blue: { border: 'border-blue-200', bg: 'bg-blue-50', dot: 'bg-blue-500', text: 'text-blue-600' },
  orange: { border: 'border-orange-200', bg: 'bg-orange-50', dot: 'bg-orange-500', text: 'text-orange-600' },
  red: { border: 'border-red-200', bg: 'bg-red-50', dot: 'bg-red-500', text: 'text-red-600' },
  green: { border: 'border-green-200', bg: 'bg-green-50', dot: 'bg-green-500', text: 'text-green-600' },
};

interface StatusSectionPropsExtended extends StatusSectionProps {
  onCandidateClick?: (job: Job, status: StatusType) => void;
}

export const StatusSection: React.FC<StatusSectionPropsExtended> = ({ status, title, count, jobs, badgeColor, onJobView, onCandidateClick }) => {
  const c = statusSectionColors[badgeColor];
  return (
    <section>
      <div className={`rounded-lg p-4 border-2 ${c.border} ${c.bg}`}>
        <div className="flex items-center gap-2 mb-4"><div className={`w-3 h-3 rounded-full ${c.dot}`} /><h2 className="text-lg font-semibold">{title} <span className={c.text}>{count}</span></h2></div>
        <div className="space-y-3">
          {jobs.map((job: Job, index: number) => (
            <div 
              key={job.id} 
              onClick={() => onCandidateClick?.(job, status)}
              className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            >
              <JobCardComponent job={job} status={status} badgeColor={badgeColor} index={index} onView={onJobView} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============ JOB CARD (Internal) ============
const JobCardComponent: React.FC<JobCardProps> = ({ job, status, badgeColor, index, onView }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const statusConfig = { applied: { textColor: 'text-blue-600', statusLabel: 'Applied' }, shortlisted: { textColor: 'text-orange-600', statusLabel: 'Shortlisted' }, interviewing: { textColor: 'text-red-600', statusLabel: 'Interviewing' }, hired: { textColor: 'text-green-600', statusLabel: 'Hired' } };
  const config = statusConfig[status];
  const buttonConfigs = {
    applied: [{ label: 'Schedule', style: 'text-gray-700 bg-gray-100 rounded border border-gray-300 hover:bg-gray-200' }, { label: 'Hire', style: 'bg-orange-500 text-white rounded hover:bg-orange-600' }],
    shortlisted: [{ label: 'Shortlisted', style: 'bg-[#FEF1E8] text-[#F4781B] rounded' }, { label: 'Schedule', style: 'bg-white text-black rounded hover:bg-orange-600 border' }, { label: 'Hire', style: 'bg-orange-500 text-white rounded hover:bg-orange-600' }],
    interviewing: [{ label: 'Interviewing', style: 'text-red-600 rounded border border-red-300 bg-red-50 hover:bg-red-100' }, { label: 'Hire', style: 'bg-orange-500 text-white rounded hover:bg-orange-600' }],
    hired: [{ label: 'Hired', style: 'bg-green-100 text-green-700 rounded border border-green-200' }]
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0"><h3 className="font-semibold text-gray-800 text-sm truncate">{job.doctorName}</h3><p className="text-xs text-gray-600 truncate">{job.experience} yrs {job.position}</p></div>
        <ScoreBox score={job.score} />
      </div>
      <p className="text-xs text-gray-500 mb-3 line-clamp-1 flex items-center gap-1">
        <Image src="/svg/Briefcase.svg" alt="briefcase" width={14} height={14} />
        <span>{job.experience} yrs {job.position}</span>
      </p>
      <p className="text-xs text-gray-500 mb-3 line-clamp-1 flex items-center gap-1">
        <span className="text-orange-600 font-medium">Spec :</span>
        <span>{job.specialization.join(' · ')}</span>
      </p>
      <div className="flex gap-2">{buttonConfigs[status].map((btn, i) => (<button key={i} onClick={(e) => e.stopPropagation()} className={`text-xs px-3 py-1.5 transition flex-1 ${btn.style}`}>{btn.label}</button>))}</div>
      {isExpanded && (<div className="mt-3 pt-3 border-t border-gray-100"><DetailedJobCard job={job} status={status} onClose={() => setIsExpanded(false)} /></div>)}
    </div>
  );
};

// ============ STATUS TABLE ============
const statusTableColors: Record<BadgeColor, { border: string; bg: string; dot: string; text: string; rowTint: string }> = {
  blue: { border: 'border-blue-200', bg: 'bg-blue-50', dot: 'bg-blue-500', text: 'text-blue-600', rowTint: 'bg-blue-50/40' },
  orange: { border: 'border-orange-200', bg: 'bg-orange-50', dot: 'bg-orange-500', text: 'text-orange-600', rowTint: 'bg-orange-50/40' },
  red: { border: 'border-red-200', bg: 'bg-red-50', dot: 'bg-red-500', text: 'text-red-600', rowTint: 'bg-red-50/40' },
  green: { border: 'border-green-200', bg: 'bg-green-50', dot: 'bg-green-500', text: 'text-green-600', rowTint: 'bg-green-50/40' },
};

export const StatusTable: React.FC<StatusTableProps> = ({ title, count, jobs, badgeColor }) => {
  const c = statusTableColors[badgeColor];
  return (
    <div className={`rounded-lg border ${c.border} overflow-hidden mb-6`}>
      <div className={`flex items-center gap-2 px-4 py-2 ${c.bg} border-b ${c.border}`}><div className={`w-2.5 h-2.5 rounded-full ${c.dot}`} /><span className="font-semibold">{title}</span><span className={`${c.text} text-sm`}>{count}</span></div>
      <div className="px-3 py-3">
        <div className="rounded-lg overflow-hidden border border-gray-200">
          <div className="grid grid-cols-12 text-[12px] text-gray-500 bg-gray-50 px-3 py-2"><div className="col-span-4">Candidate Name</div><div className="col-span-2">Work Experience</div><div className="col-span-2">Current Company</div><div className="col-span-2">Job Type</div><div className="col-span-1 text-right">Overall Score</div><div className="col-span-1 text-right">Action</div></div>
          <div className="divide-y divide-gray-100">
            {jobs.map((j) => (
              <div key={j.id} className="grid grid-cols-12 items-center px-3 py-3 text-sm bg-white">
                <div className="col-span-4 flex items-center gap-3">
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" />
                    </svg>
                  </button>
                  <div className="w-8 h-8 rounded-full bg-gray-200" />
                  <div className="flex flex-col"><span className="font-medium text-gray-800">{j.doctorName}</span><span className="text-[11px] text-gray-500">Spec: {j.specialization.join(' | ')}</span></div>
                </div>
                <div className="col-span-2 text-gray-700">{j.experience}+ yrs</div>
                <div className="col-span-2 text-gray-700">{j.currentCompany ?? '—'}</div>
                <div className="col-span-2 text-gray-700">{j.position}</div>
                <div className="col-span-1 text-right text-gray-800">{j.score}/100</div>
                <div className="col-span-1"><div className="flex justify-end"><button className="text-orange-600 hover:text-orange-700 underline text-sm">Hire</button></div></div>
              </div>
            ))}
            <div className={`h-2 ${c.rowTint}`}></div>
          </div>
        </div>
      </div>
    </div>
  );
};
