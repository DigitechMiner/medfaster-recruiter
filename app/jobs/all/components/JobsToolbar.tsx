'use client';
import React from 'react';
import { Search, LayoutGrid, List } from 'lucide-react';

interface Props {
  search: string;
  onSearch: (v: string) => void;
  view: 'grid' | 'list';
  onView: (v: 'grid' | 'list') => void;
}

export const JobsToolbar: React.FC<Props> = ({ search, onSearch, view, onView }) => (
  <div className="flex items-center gap-3">
    {/* Search */}
    <div className="relative flex-1 max-w-xl">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Search"
        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 bg-white"
      />
    </div>

    {/* View toggle */}
    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => onView('grid')}
        className={`p-2.5 transition-colors ${view === 'grid' ? 'bg-gray-100 text-gray-700' : 'text-gray-400 hover:text-gray-600'}`}
        title="Grid view"
      >
        <LayoutGrid size={18} />
      </button>
      <button
        onClick={() => onView('list')}
        className={`p-2.5 transition-colors ${view === 'list' ? 'bg-gray-100 text-gray-700' : 'text-gray-400 hover:text-gray-600'}`}
        title="List view"
      >
        <List size={18} />
      </button>
    </div>
  </div>
);