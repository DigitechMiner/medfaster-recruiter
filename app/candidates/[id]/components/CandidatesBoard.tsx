'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal, LayoutGrid, List } from 'lucide-react';
import { CandidateColumn } from './CandidateColumn';
import { useCandidatesList } from '@/hooks/useCandidate';
import { CandidateListItem } from '@/stores/api/recruiter-job-api';

// Map API status groups to board columns
const COLUMNS = [
  {
    title: 'AI-Recommendations',
    accentColor: 'orange' as const,
    dotColor: 'bg-yellow-400',
    actionType: 'shortlist' as const,
    interview: 'JOB' as const,
  },
  {
    title: 'Instant Hires',
    accentColor: 'neutral' as const,
    dotColor: 'bg-orange-700',
    actionType: 'hire' as const,
    interview: 'SELF' as const,
  },
  {
    title: 'Currently Available',
    accentColor: 'green' as const,
    dotColor: 'bg-green-500',
    actionType: 'schedule' as const,
    interview: undefined,
  },
  {
    title: 'Nearby Professionals',
    accentColor: 'red' as const,
    dotColor: 'bg-red-500',
    actionType: 'invite' as const,
    interview: undefined,
  },
];

export const CandidatesBoard = () => {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');

  // Fetch all candidates — columns are visual groupings on the frontend
  const { data, isLoading, error } = useCandidatesList({ page: 1, limit: 20 });

  const candidates: CandidateListItem[] = data?.candidates ?? [];

  // Split into 4 groups by index for the board columns
  // Replace this logic with real filters once the API supports it
  const chunkSize = Math.ceil(candidates.length / 4);
  const columnCandidates = COLUMNS.map((_, i) =>
    candidates.slice(i * chunkSize, (i + 1) * chunkSize)
  );

  // Filter by search client-side
  const filtered = columnCandidates.map((group) =>
    group.filter((c) =>
      search
        ? `${c.first_name} ${c.last_name} ${c.specialty}`
            .toLowerCase()
            .includes(search.toLowerCase())
        : true
    )
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Search + Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm">
          <Search size={16} className="text-gray-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidates..."
            className="w-full text-sm text-gray-700 outline-none placeholder:text-gray-400"
          />
        </div>
        <button className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
          <SlidersHorizontal size={16} className="text-gray-500" />
          Filter
        </button>
        <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <button
            onClick={() => setView('grid')}
            className={`p-2.5 ${view === 'grid' ? 'bg-orange-50 text-orange-500' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => setView('list')}
            className={`p-2.5 ${view === 'list' ? 'bg-orange-50 text-orange-500' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Loading / Error states */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border-2 border-gray-100 p-4 space-y-3 animate-pulse">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="h-24 bg-gray-100 rounded-xl" />
              ))}
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="text-center py-12 text-red-400 text-sm">{error}</div>
      )}

      {/* 4-Column Board */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {COLUMNS.map((col, i) => (
            <CandidateColumn
              key={col.title}
              title={col.title}
              count={filtered[i]?.length ?? 0}
              accentColor={col.accentColor}
              dotColor={col.dotColor}
              candidates={filtered[i] ?? []}
              actionType={col.actionType}
            />
          ))}
        </div>
      )}
    </div>
  );
};
