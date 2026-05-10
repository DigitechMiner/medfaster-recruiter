'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { JobsAllPage } from '@/app/jobs/all/components/JobsAllPage';
import { MetricCard } from '@/components/ui/metric-card';
import { cn } from '@/lib/utils';
import { useJobsStore } from '@/stores/jobs-store';

type JobFilter = {
  status?:      'DRAFT' | 'OPEN' | 'PAUSED' | 'CLOSED' | 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
  job_urgency?: 'instant' | 'normal';  // ← renamed
  label: string;
};

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
  const router = useRouter();
  const [counts, setCounts] = useState<StatCounts>({
    regular: 0, urgent: 0, noShow: 0, active: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<JobFilter | null>(null);

  useEffect(() => {
    let cancelled = false;
    const store = useJobsStore.getState();

    Promise.allSettled([
      store.getJobsSilent({ job_urgency: 'normal',  limit: 1 }),
      store.getJobsSilent({ job_urgency: 'instant', limit: 1 }),
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
      setStatsLoading(false);
    });

    return () => { cancelled = true; };
  }, []);

  // ── Filter definitions — clicking a card sets this filter ─────────────────
  const FILTERS: Record<string, JobFilter> = {
    regular: { job_urgency: 'normal',  label: 'Regular Job Openings'  },
    urgent:  { job_urgency: 'instant', label: 'Urgent Shift Openings' },
    noShow:  { status: 'CLOSED',      label: 'Closed Jobs'           },
    active:  { status: 'OPEN',        label: 'Active Jobs & Shifts'  },
  };

  const handleCardClick = (key: keyof typeof FILTERS) => {
    const filter = FILTERS[key];
    setActiveFilter((prev) =>
      prev?.label === filter.label ? null : filter  // toggle off if same card
    );
  };

  const statCards = [
    { key: 'regular' as const, label: 'Regular Job Openings',  value: counts.regular, icon: <BriefcaseIcon /> },
    { key: 'urgent'  as const, label: 'Urgent Shift Openings', value: counts.urgent,  icon: <PeopleIcon /> },
    { key: 'noShow'  as const, label: 'No-Show Alerts',        value: counts.noShow,  icon: <TrashIcon /> },
    { key: 'active'  as const, label: 'Active Jobs & Shifts',  value: counts.active,  icon: <LayersIcon /> },
  ];

  return (
    <div className="flex flex-col gap-4">

      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold leading-8 text-gray-900">Jobs</h1>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/jobs/instant-replacement')}
            className="inline-flex h-8 items-center justify-center gap-1.5 px-3 rounded-lg border border-[#F4781B] text-[#F4781B] text-sm font-semibold bg-white hover:bg-orange-50 transition-colors"
          >
            <span className="text-sm leading-none font-bold">+</span>
            <span>Instant Job</span>
          </button>
          <button
            type="button"
            onClick={() => router.push('/jobs/create')}
            className="inline-flex h-8 items-center justify-center gap-1.5 px-3 rounded-lg bg-[#F4781B] text-white text-sm font-semibold hover:bg-[#e06a10] transition-colors"
          >
            <span className="text-sm leading-none font-bold">+</span>
            <span>Normal Job</span>
          </button>
        </div>
      </div>

      {/* Active filter pill */}
      {activeFilter && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Filtering by:</span>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-[#F4781B] bg-orange-50 border border-orange-200 px-3 py-1 rounded-full">
            {activeFilter.label}
            <button
              onClick={() => setActiveFilter(null)}
              className="text-orange-400 hover:text-orange-600 ml-1 leading-none"
            >
              ×
            </button>
          </span>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const isActive = activeFilter?.label === card.label;
          return (
            <div
              key={card.label}
              role="button"
              tabIndex={0}
              onClick={() => handleCardClick(card.key)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCardClick(card.key);
                }
              }}
              className={cn(
                'rounded-xl cursor-pointer transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#F4781B] focus-visible:ring-offset-2',
                isActive
                  ? 'ring-2 ring-[#F4781B] shadow-md'
                  : 'hover:ring-2 hover:ring-orange-200',
              )}
              style={
                isActive
                  ? { boxShadow: '0 4px 12px rgba(244,120,27,0.15)' }
                  : undefined
              }
            >
              <MetricCard
                icon={card.icon}
                title={card.label}
                value={card.value}
                loading={statsLoading}
                className="border-0 shadow-sm h-full"
              />
            </div>
          );
        })}
      </div>

      {/* Jobs table — receives active filter + search */}
      <JobsAllPage
        filterStatus={activeFilter?.status}
        filterUrgency={activeFilter?.job_urgency}
      />
    </div>
  );
};