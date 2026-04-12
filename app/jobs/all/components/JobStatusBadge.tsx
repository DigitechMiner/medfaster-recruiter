'use client';
import React from 'react';

const variantMap: Record<string, string> = {
  // Job type
  Regular:        'bg-[#D1FAE5] text-[#059669]',
  Urgent:         'bg-[#FEE9D6] text-[#F4781B]',

  // AI Interview
  Required:       'bg-[#D1FAE5] text-[#059669]',
  'Not Required': 'bg-[#FEF9C3] text-[#D97706]',
  'Not Needed':   'bg-[#FEE9D6] text-[#F4781B]',

  // Job status
  OPEN:       'bg-[#DBEAFE] text-[#2563EB]',
  Open:       'bg-[#DBEAFE] text-[#2563EB]',
  DRAFT:      'bg-[#F3F4F6] text-[#6B7280]',
  Draft:      'bg-[#F3F4F6] text-[#6B7280]',
  PAUSED:     'bg-[#FEF9C3] text-[#D97706]',
  Active:     'bg-[#D1FAE5] text-[#059669]',
  Completed:  'bg-[#FEF9C3] text-[#D97706]',
  Upcoming:   'bg-[#7C2D12] text-white',
  CLOSED:     'bg-[#FEE2E2] text-[#DC2626]',
  Closed:     'bg-[#FEE2E2] text-[#DC2626]',
};

const displayMap: Record<string, string> = {
  OPEN: 'Open', CLOSED: 'Closed', DRAFT: 'Draft', PAUSED: 'Paused',
};

export const JobStatusBadge: React.FC<{ label: string }> = ({ label }) => {
  const cls     = variantMap[label] ?? 'bg-[#F3F4F6] text-[#6B7280]';
  const display = displayMap[label] ?? label;
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${cls}`}>
      {display}
    </span>
  );
};