'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { DetailedJobCardProps, JobCardProps, StatusSectionProps, StatusTableProps, Job, StatusType } from '@/Interface/job.types';
import { STATUS_COLORS, STATUS_SECTION_COLORS, STATUS_TABLE_COLORS, PRIMARY_BUTTON_COLOR_CLASSES } from '../constants/ui';
import { MODAL_DEFAULTS } from '../constants/messages';
import ScoreCard from '@/components/card/scorecard';

// ============ TOOLTIP COMPONENT ============
interface TooltipProps {
  children: React.ReactNode;
  content: string;
}

const Tooltip: React.FC<TooltipProps> = ({ children, content }) => {
  return (
    <div className="relative group flex-1">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-white border border-gray-300 text-gray-900 text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap pointer-events-none z-10 shadow-lg">
        {content}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-white"></div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-300"></div>
      </div>
    </div>
  );
};

// ============ DETAIL CARD ============
export const DetailedJobCard: React.FC<DetailedJobCardProps> = ({ job, status, onClose }) => {
  const statusColor = STATUS_COLORS[status] || 'text-gray-600';

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

export const JobActionModal: React.FC<JobActionModalProps> = ({ isOpen, onClose, title, message, svgIcon, primaryButtonText = MODAL_DEFAULTS.PRIMARY_BUTTON_TEXT, secondaryButtonText = MODAL_DEFAULTS.SECONDARY_BUTTON_TEXT, onPrimaryClick, onSecondaryClick, primaryButtonColor = MODAL_DEFAULTS.PRIMARY_BUTTON_COLOR }) => {
  if (!isOpen) return null;
  const primaryColorClasses = PRIMARY_BUTTON_COLOR_CLASSES[primaryButtonColor];
  
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
interface StatusSectionPropsExtended extends StatusSectionProps {
  onCandidateClick?: (job: Job, status: StatusType) => void;
}

export const StatusSection: React.FC<StatusSectionPropsExtended> = ({ status, title, count, jobs, badgeColor, onJobView, onCandidateClick }) => {
  const c = STATUS_SECTION_COLORS[badgeColor];
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
const JobCardComponent: React.FC<JobCardProps> = ({ job, status, badgeColor: _badgeColor, index: _index, onView: _onView }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Button configurations based on status matching the screenshot
  const renderButtons = () => {
    switch (status) {
      case 'applied':
        return (
          <>
            <Tooltip content="On Site / Virtual Interview">
              <button
                onClick={(e) => e.stopPropagation()}
                className="w-full text-xs px-3 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Schedule
              </button>
            </Tooltip>
            <button
              onClick={(e) => e.stopPropagation()}
              className="flex-1 text-xs px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium transition-colors"
            >
              Shortlist
            </button>
          </>
        );
      
      case 'shortlisted':
        return (
          <>
            <button
              disabled
              className="text-xs px-3 py-2 bg-orange-100 text-orange-700 rounded-lg font-medium cursor-default"
            >
              Shortlisted
            </button>
            <Tooltip content="On Site / Virtual Interview">
              <button
                onClick={(e) => e.stopPropagation()}
                className="w-full text-xs px-3 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Schedule
              </button>
            </Tooltip>
            <button
              onClick={(e) => e.stopPropagation()}
              className="flex-1 text-xs px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium transition-colors"
            >
              Hire
            </button>
          </>
        );
      
      case 'interviewing':
        return (
          <>
            <button
              disabled
              className="flex-1 text-xs px-3 py-2 bg-red-100 text-red-700 rounded-lg font-medium cursor-default"
            >
              Interviewing
            </button>
            <button
              onClick={(e) => e.stopPropagation()}
              className="flex-1 text-xs px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium transition-colors"
            >
              Hire
            </button>
          </>
        );
      
      case 'hired':
        return (
          <button
            disabled
            className="w-full text-xs px-3 py-2 bg-green-100 text-green-700 rounded-lg font-medium cursor-default"
          >
            Hired
          </button>
        );
      
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-800 text-sm truncate">{job.doctorName}</h3>
          <p className="text-xs text-gray-600 truncate">{job.experience}+ yrs | {job.position}</p>
        </div>
        <ScoreCard category="Overall Score" score={job.score} maxScore={100} />
      </div>
      
      <p className="text-xs text-gray-500 mb-3 line-clamp-1 flex items-center gap-1">
        <Image src="/svg/Briefcase.svg" alt="briefcase" width={14} height={14} />
        <span>{job.experience}+ yrs | Part-Time</span>
      </p>
      
      <p className="text-xs text-gray-500 mb-3 line-clamp-1 flex items-center gap-1">
        <span className="text-orange-600 font-medium">Spec :</span>
        <span>{job.specialization.join(' | ')}</span>
      </p>
      
      <div className="flex gap-2">
        {renderButtons()}
      </div>
      
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <DetailedJobCard job={job} status={status} onClose={() => setIsExpanded(false)} />
        </div>
      )}
    </div>
  );
};

// ============ STATUS TABLE ============
export const StatusTable: React.FC<StatusTableProps> = ({ title, count, jobs, badgeColor }) => {
  const c = STATUS_TABLE_COLORS[badgeColor];
  
  // Determine action button based on badgeColor/status
  const getActionButton = () => {
    switch (badgeColor) {
      case 'blue': // Applied
        return { text: 'Shortlist', show: true };
      case 'orange': // Shortlisted
        return { text: 'Hire', show: true };
      case 'red': // Interviewing
        return { text: 'Hire', show: true };
      case 'green': // Hired
        return { text: '', show: false };
      default:
        return { text: 'Hire', show: true };
    }
  };

  const actionButton = getActionButton();
  
  return (
    <div className={`rounded-lg border ${c.border} overflow-hidden mb-6`}>
      {/* Header */}
      <div className={`flex items-center gap-2 px-3 sm:px-4 py-2 ${c.bg} border-b ${c.border}`}>
        <div className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
        <span className="font-semibold text-sm sm:text-base">{title}</span>
        <span className={`${c.text} text-xs sm:text-sm`}>{count}</span>
      </div>

      <div className="px-2 sm:px-3 py-3">
        <div className="rounded-lg overflow-hidden border border-gray-200">
          {/* Desktop Table Header - Hidden on mobile */}
          <div className="hidden lg:grid grid-cols-12 text-[12px] text-gray-500 bg-gray-50 px-3 py-2">
            <div className="col-span-4">Candidate Name</div>
            <div className="col-span-2">Work Experience</div>
            <div className="col-span-2">Current Company</div>
            <div className="col-span-2">Job Type</div>
            <div className="col-span-1 text-right">Overall Score</div>
            {actionButton.show && <div className="col-span-1 text-right">Action</div>}
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-100">
            {jobs.map((j) => (
              <div key={j.id}>
                {/* Desktop View */}
                <div className="hidden lg:grid grid-cols-12 items-center px-3 py-3 text-sm bg-white">
                  <div className="col-span-4 flex items-center gap-3">
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" />
                      </svg>
                    </button>
                    <div className="w-8 h-8 rounded-full bg-gray-200" />
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-800">{j.doctorName}</span>
                      <span className="text-[11px] text-gray-500">Spec: {j.specialization.join(' | ')}</span>
                    </div>
                  </div>
                  <div className="col-span-2 text-gray-700">{j.experience}+ yrs</div>
                  <div className="col-span-2 text-gray-700">{j.currentCompany ?? '—'}</div>
                  <div className="col-span-2 text-gray-700">{j.position}</div>
                  <div className="col-span-1 text-right text-gray-800">{j.score}/100</div>
                  {actionButton.show && (
                    <div className="col-span-1 flex justify-end">
                      <button className="text-orange-600 hover:text-orange-700 underline text-sm">
                        {actionButton.text}
                      </button>
                    </div>
                  )}
                </div>

                {/* Mobile/Tablet View */}
                <div className="lg:hidden bg-white p-4 space-y-3">
                  {/* Header with name and action */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <button className="p-1 hover:bg-gray-100 rounded flex-shrink-0">
                        <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" />
                        </svg>
                      </button>
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-200 flex-shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium text-gray-800 text-sm sm:text-base truncate">{j.doctorName}</span>
                        <span className="text-[11px] sm:text-xs text-gray-500 line-clamp-1">Spec: {j.specialization.join(' | ')}</span>
                      </div>
                    </div>
                    {actionButton.show && (
                      <button className="text-orange-600 hover:text-orange-700 underline text-sm flex-shrink-0">
                        {actionButton.text}
                      </button>
                    )}
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-gray-500 text-xs mb-1">Experience</div>
                      <div className="text-gray-800 font-medium">{j.experience}+ yrs</div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs mb-1">Score</div>
                      <div className="text-gray-800 font-medium">{j.score}/100</div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs mb-1">Current Company</div>
                      <div className="text-gray-800 truncate">{j.currentCompany ?? '—'}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs mb-1">Job Type</div>
                      <div className="text-gray-800">{j.position}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className={`h-2 ${c.rowTint}`}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

