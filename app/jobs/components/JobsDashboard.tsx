'use client';

import React, { useEffect, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { JobsAllPage } from '@/app/jobs/all/components/JobsAllPage';
import { useJobsStore } from '@/stores/jobs-store';

const BriefcaseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F4781B" strokeWidth="2">
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
  </svg>
);

const PeopleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F4781B" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const TrashIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F4781B" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
);

const LayersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F4781B" strokeWidth="2">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

interface StatCounts {
  regular: number;
  urgent:  number;
  noShow:  number;
  active:  number;
}

export const JobsDashboard: React.FC = () => {
  const [counts, setCounts] = useState<StatCounts>({
    regular: 0,
    urgent:  0,
    noShow:  0,
    active:  0,
  });

  useEffect(() => {
    let cancelled = false;
    const store = useJobsStore.getState();

    Promise.allSettled([
      store.getJobsSilent({ joburgency: 'normal',  limit: 1 }),
      store.getJobsSilent({ joburgency: 'instant', limit: 1 }),
      store.getJobsSilent({ status: 'CLOSED',      limit: 1 }),
      store.getJobsSilent({ status: 'OPEN',        limit: 1 }),
    ]).then(([regular, urgent, closed, active]) => {
      if (cancelled) return;
      setCounts({
        regular: regular.status === 'fulfilled' && regular.value.success ? regular.value.data.pagination.total : 0,
        urgent:  urgent.status  === 'fulfilled' && urgent.value.success  ? urgent.value.data.pagination.total  : 0,
        noShow:  closed.status  === 'fulfilled' && closed.value.success  ? closed.value.data.pagination.total  : 0,
        active:  active.status  === 'fulfilled' && active.value.success  ? active.value.data.pagination.total  : 0,
      });
    });

    return () => { cancelled = true; };
  }, []); // runs once on mount

  const statCards = [
    { label: 'Regular Job Openings',  value: counts.regular, change: '-0.10%', up: false, icon: <BriefcaseIcon />, isFirst: true,  valueColor: 'text-gray-900' },
    { label: 'Urgent Shift Openings', value: counts.urgent,  change: '+1.10%', up: true,  icon: <PeopleIcon />,   isFirst: false, valueColor: 'text-gray-900' },
    { label: 'No-Show Alerts',        value: counts.noShow,  change: '+2.10%', up: false, icon: <TrashIcon />,    isFirst: false, valueColor: 'text-red-500'  },
    { label: 'Active Jobs & Shifts',  value: counts.active,  change: '+2.10%', up: true,  icon: <LayersIcon />,   isFirst: false, valueColor: 'text-gray-900' },
  ];

  return (
    <div className="flex flex-col gap-6">

      {/* Top Bar */}
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-gray-900 whitespace-nowrap">Jobs</h1>

        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-orange-200"
          />
        </div>

        <div className="relative">
          <select className="appearance-none border border-gray-200 rounded-lg pl-4 pr-9 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-orange-200 cursor-pointer font-medium">
            <option>This Month</option>
            <option>This Week</option>
            <option>Today</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`bg-white rounded-2xl p-5 border-2 ${
              card.isFirst ? 'border-[#F4781B]' : 'border-transparent'
            }`}
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500 font-medium">{card.label}</p>
              <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                {card.icon}
              </div>
            </div>
            <p className={`text-4xl font-bold mb-4 ${card.valueColor}`}>
              {card.value}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Since last week</span>
              <span className={`text-xs font-semibold flex items-center gap-0.5 ${card.up ? 'text-green-500' : 'text-red-500'}`}>
                {card.change}
                <span className="text-sm">{card.up ? '↑' : '↓'}</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Jobs table — fully self-contained */}
      <JobsAllPage />

    </div>
  );
};