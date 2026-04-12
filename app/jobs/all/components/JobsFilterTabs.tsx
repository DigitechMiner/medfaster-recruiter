'use client';
import React from 'react';

export const FILTER_TABS = [
  'All',
  'Urgent Shift Openings',
  'Regular Job Openings',
  'Active Jobs & Shifts',
  'Upcoming Jobs & Shifts',
  'Closed Jobs & Shifts',
  'Completed Jobs & Shifts',
] as const;

export type FilterTab = (typeof FILTER_TABS)[number];

interface Props {
  active: FilterTab;
  onChange: (tab: FilterTab) => void;
}

export const JobsFilterTabs: React.FC<Props> = ({ active, onChange }) => (
  <>
    {FILTER_TABS.map((tab) => (
      <button
        key={tab}
        onClick={() => onChange(tab)}
        className={`whitespace-nowrap px-3 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
          active === tab
            ? 'border-[#F4781B] text-[#F4781B]'
            : 'border-transparent text-gray-500 hover:text-gray-700'
        }`}
      >
        {tab}
      </button>
    ))}
  </>
);