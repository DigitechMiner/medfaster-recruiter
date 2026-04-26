'use client';

import React, { useEffect, useRef, useState } from 'react';
import { LayoutGrid, List } from 'lucide-react';
import { useJobsStore } from '@/stores/jobs-store';
import { JobsFilterTabs } from './JobsFilterTabs';
import type { FilterTab } from './JobsFilterTabs';
import { JobsListView } from './JobsListView';
import { JobsGridView } from './JobsGridView';
import { JobsPagination } from './JobsPagination';
import type { JobsListResponse } from '@/Interface/job.types';
import type { GetJobsParams } from '@/stores/api/recruiter-job-api';
import type { JobListItem } from '@/Interface/job.types';

type TabFilter = {
  job_urgency?: 'instant' | 'normal';
  status?: 'DRAFT' | 'OPEN' | 'PAUSED' | 'CLOSED' | 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
};

const TAB_FILTER: Record<FilterTab, TabFilter> = {
  'All':                     {},
  'Urgent Shift Openings':   { job_urgency: 'instant'  },
  'Regular Job Openings':    { job_urgency: 'normal'   },
  'Active Jobs & Shifts':    { status: 'OPEN'          },
  'Upcoming Jobs & Shifts':  { status: 'UPCOMING'      },
  'Closed Jobs & Shifts':    { status: 'CLOSED'        },
  'Completed Jobs & Shifts': { status: 'COMPLETED'     },
};

interface JobsAllPageProps {
  filterStatus?:  'DRAFT' | 'OPEN' | 'PAUSED' | 'CLOSED' | 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
  filterUrgency?: 'instant' | 'normal';
  search?:        string;
}

export const JobsAllPage: React.FC<JobsAllPageProps> = ({
  filterStatus,
  filterUrgency,
  search = '',
}) => {
  const getJobs   = useJobsStore((s) => s.getJobs);
  const isLoading = useJobsStore((s) => s.isLoading);

  const [jobs,       setJobs]       = useState<JobListItem[]>([]);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [error,      setError]      = useState<string | null>(null);
  const [tab,        setTab]        = useState<FilterTab>('All');
  const [view,       setView]       = useState<'list' | 'grid'>('list');
  const [page,       setPage]       = useState(1);
  const [limit,      setLimit]      = useState(10);

  const getJobsRef = useRef<(params?: GetJobsParams) => Promise<JobsListResponse>>(getJobs);
  getJobsRef.current = getJobs;

  // ── Sync tab when parent filter changes ───────────────────────────────────
  useEffect(() => {
  if (!filterStatus && !filterUrgency) return;
  const matchingTab = (Object.keys(TAB_FILTER) as FilterTab[]).find((key) => {
    const f = TAB_FILTER[key];
    if (filterStatus  && f.status      === filterStatus)  return true;
    if (filterUrgency && f.job_urgency === filterUrgency) return true;
    return false;
  });
  if (matchingTab && matchingTab !== tab) {
    setTab(matchingTab);
    setPage(1);
  }
}, [filterStatus, filterUrgency, tab]); // ✅ add tab

  // ── Reset to All when parent filter is cleared ────────────────────────────
  useEffect(() => {
    if (!filterStatus && !filterUrgency && tab !== 'All') {
      setTab('All');
      setPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, filterUrgency]);

  // ── Main data fetch ───────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setError(null);

    const mergedFilters: TabFilter = {
      ...TAB_FILTER[tab],
      ...(filterStatus  ? { status:      filterStatus  } : {}),
      ...(filterUrgency ? { job_urgency: filterUrgency } : {}),
    };

    getJobsRef.current({ page, limit, ...mergedFilters })
      .then((res) => {
        if (cancelled) return;
        if (res.success) {
          const filtered = search.trim()
            ? res.data.jobs.filter((j) =>
                j.job_title?.toLowerCase().includes(search.toLowerCase())
              )
            : res.data.jobs;
          setJobs(filtered);
          setTotal(res.data.pagination.total);
          setTotalPages(res.data.pagination.totalPages);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message ?? 'Failed to load jobs');
      });

    return () => { cancelled = true; };
  }, [tab, page, limit, filterStatus, filterUrgency, search]);

  useEffect(() => {
  if (jobs.length > 0) {
    console.log('🔍 Full job object:', JSON.stringify(jobs[0], null, 2));
  }
}, [jobs]);

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
        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
          <button onClick={() => setView('grid')} title="Grid view"
            className={`p-2 transition-colors ${view === 'grid' ? 'bg-gray-100 text-gray-700' : 'text-gray-400 hover:text-gray-600'}`}>
            <LayoutGrid size={17} />
          </button>
          <button onClick={() => setView('list')} title="List view"
            className={`p-2 transition-colors ${view === 'list' ? 'bg-gray-100 text-gray-700' : 'text-gray-400 hover:text-gray-600'}`}>
            <List size={17} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-4 min-h-[300px]">
        {isLoading ? (
          <div className="flex flex-col gap-3 py-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <span className="text-4xl">⚠️</span>
            <p className="text-sm font-medium text-gray-500">Failed to load jobs</p>
            <p className="text-xs text-gray-400">{error}</p>
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
      {!isLoading && jobs.length > 0 && (
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