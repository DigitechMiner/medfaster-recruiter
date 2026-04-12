'use client';

import React, { useEffect, useRef, useState } from 'react';
import { LayoutGrid, List } from 'lucide-react';
import { useJobsStore } from '@/stores/jobs-store';
import { JobsFilterTabs } from './JobsFilterTabs';
import type { FilterTab } from './JobsFilterTabs';
import { JobsListView } from './JobsListView';
import { JobsGridView } from './JobsGridView';
import { JobsPagination } from './JobsPagination';
import { filterDummyJobs } from './dummyJobs';
import type { JobsListResponse } from '@/Interface/job.types';

type JobListItem = JobsListResponse['data']['jobs'][0];

type TabFilter = {
  joburgency?: 'instant' | 'normal';
  status?: 'DRAFT' | 'OPEN' | 'PAUSED' | 'CLOSED';
};

const TAB_FILTER: Record<FilterTab, TabFilter> = {
  'All':                     {},
  'Urgent Shift Openings':   { joburgency: 'instant' },
  'Regular Job Openings':    { joburgency: 'normal'  },
  'Active Jobs & Shifts':    { status: 'OPEN'        },
  'Upcoming Jobs & Shifts':  { status: 'DRAFT'       },
  'Closed Jobs & Shifts':    { status: 'CLOSED'      },
  'Completed Jobs & Shifts': { status: 'PAUSED'      },
};

// Toggle this to true to force dummy data for demo/investor mode
const USE_DUMMY_DATA = false;

export const JobsAllPage: React.FC = () => {
  const getJobs   = useJobsStore((s) => s.getJobs);
  const isLoading = useJobsStore((s) => s.isLoading);

  const [jobs,       setJobs]       = useState<JobListItem[]>([]);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [tab,        setTab]        = useState<FilterTab>('All');
  const [view,       setView]       = useState<'list' | 'grid'>('list');
  const [page,       setPage]       = useState(1);
  const [limit,      setLimit]      = useState(10);
  const [usingDummy, setUsingDummy] = useState(false);

  const getJobsRef = useRef(getJobs);
  getJobsRef.current = getJobs;

  useEffect(() => {
    let cancelled = false;
    const filters = TAB_FILTER[tab];

    if (USE_DUMMY_DATA) {
      // Pure dummy mode — no API call
      const result = filterDummyJobs({ ...filters, page, limit });
      setJobs(result.jobs);
      setTotal(result.total);
      setTotalPages(result.totalPages);
      setUsingDummy(true);
      return;
    }

    getJobsRef.current({ page, limit, ...filters })
      .then((res) => {
        if (cancelled) return;
        if (res.success) {
          setJobs(res.data.jobs);
          setTotal(res.data.pagination.total);
          setTotalPages(res.data.pagination.totalPages);
          setUsingDummy(false);
        }
      })
      .catch(() => {
        if (cancelled) return;
        // API failed — fall back to dummy data silently
        const result = filterDummyJobs({ ...filters, page, limit });
        setJobs(result.jobs);
        setTotal(result.total);
        setTotalPages(result.totalPages);
        setUsingDummy(true);
      });

    return () => { cancelled = true; };
  }, [tab, page, limit]);

  const handleTabChange = (t: FilterTab) => {
    if (t === tab) return;
    setTab(t);
    setPage(1);
  };

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
    >
      {/* Tab row + view toggle */}
      <div className="flex items-center justify-between px-6 pt-2 border-b border-gray-100">
        <div className="flex items-center overflow-x-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
          <JobsFilterTabs active={tab} onChange={handleTabChange} />
        </div>
        <div className="flex items-center gap-3">
          {/* Demo badge */}
          {usingDummy && (
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
              Demo Data
            </span>
          )}
          {/* Grid / List toggle */}
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setView('grid')}
              title="Grid view"
              className={`p-2 transition-colors ${view === 'grid' ? 'bg-gray-100 text-gray-700' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <LayoutGrid size={17} />
            </button>
            <button
              onClick={() => setView('list')}
              title="List view"
              className={`p-2 transition-colors ${view === 'list' ? 'bg-gray-100 text-gray-700' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <List size={17} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-4 min-h-[300px]">
        {isLoading && !usingDummy ? (
          <div className="flex items-center justify-center py-20 text-sm text-gray-400">
            Loading...
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <span className="text-4xl">📋</span>
            <p className="text-sm font-medium text-gray-500">No data available</p>
            <p className="text-xs text-gray-400">There are no jobs matching this filter.</p>
          </div>
        ) : view === 'list' ? (
          <JobsListView jobs={jobs} />
        ) : (
          <JobsGridView jobs={jobs} />
        )}
      </div>

      {/* Pagination */}
      {(!isLoading || usingDummy) && jobs.length > 0 && (
        <div className="bg-[#FEF3E9] px-6 py-3">
          <JobsPagination
            page={page}
            totalPages={totalPages}
            total={total}
            limit={limit}
            onPage={setPage}
            onLimit={(l) => { setLimit(l); setPage(1); }}
          />
        </div>
      )}
    </div>
  );
};