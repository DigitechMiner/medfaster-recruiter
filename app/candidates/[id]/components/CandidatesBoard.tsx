'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal, LayoutGrid, List, MapPin, Briefcase, Star, Zap, Calendar } from 'lucide-react';
import { BriefcaseBusiness, Users, UserCheck, Layers } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { CandidateColumn } from './CandidateColumn';
import { useCandidatesList } from '@/hooks/useCandidate';
import { CandidateListItem } from '@/stores/api/recruiter-job-api';

const COLUMNS = [
  {
    title: 'AI-Recommendations',
    accentColor: 'orange' as const,
    dotColor: 'bg-[#F59E0B]',
    actionType: 'shortlist' as const,
    leftTags:  ['Last Seen Yesterday', 'Active 5 min ago', 'Active 7 min ago', 'Online'],
    rightTags: ['High Demand', 'Available For Night Shift', 'Most Hired', 'Best Choice'],
  },
  {
    title: 'Instant Hires',
    accentColor: 'neutral' as const,
    dotColor: 'bg-[#92400E]',
    actionType: 'hire' as const,
    leftTags:  ['Active 5 min ago', 'Online', 'Last Seen Yesterday', 'Last Seen a Week Before'],
    rightTags: ['Available Today', 'Available for Weekends', 'Available Immediately', 'Available on Wednesdays'],
  },
  {
    title: 'Currently Available',
    accentColor: 'green' as const,
    dotColor: 'bg-green-500',
    actionType: 'schedule' as const,
    leftTags:  ['Online', 'Online', 'Online', 'Active 15 min ago'],
    rightTags: ['Available on Wed & Fri', 'Available Immediately', 'Available Now', 'Available Today'],
  },
  {
    title: 'Nearby Professionals',
    accentColor: 'red' as const,
    dotColor: 'bg-red-500',
    actionType: 'invite' as const,
    leftTags:  ['Not Active Since 15 Days', 'Last Seen Yesterday', 'Active 5 min ago', 'Online'],
    rightTags: ['Most Prefered', 'Most Reviewed', 'Available For Night Shift', 'Available For Night Shift'],
  },
];

// ── Metric Card ────────────────────────────────────────────────
const MetricCard = ({ icon, title, value, change, isPositive }: {
  icon: React.ReactNode; title: string; value: string | number;
  change: string; isPositive: boolean;
}) => (
  <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex flex-col gap-2">
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-500 font-medium">{title}</span>
      <span className="text-orange-400">{icon}</span>
    </div>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-400">Since last week</span>
      <span className={`text-xs font-semibold ${isPositive ? 'text-green-500' : 'text-red-400'}`}>
        {change} {isPositive ? '↑' : '↓'}
      </span>
    </div>
  </div>
);

// ── List Row ───────────────────────────────────────────────────
const CandidateListRow = ({ c, actionType }: { c: CandidateListItem; actionType: string }) => {
  const router = useRouter();
  const name  = c.full_name || `${c.first_name} ${c.last_name ?? ''}`.trim();
  const role  = c.specialty?.[0] ?? c.medical_industry ?? 'Healthcare Professional';
  const score = c.highest_job_interview_score ?? c.highest_interview_score ?? 0;
  const isGreen  = score >= 80;
  const isOrange = score >= 60 && score < 80;
  const scoreColor = isGreen ? 'text-green-600' : isOrange ? 'text-orange-500' : 'text-red-500';

  return (
    <div
      onClick={() => router.push(`/candidates/${c.id}`)}
      className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 bg-white hover:border-orange-200 hover:shadow-sm transition-all cursor-pointer"
    >
      {/* Avatar */}
      <div className="w-10 h-10 rounded-xl overflow-hidden bg-orange-50 shrink-0">
        <Image src={c.profile_image_url || '/svg/Photo.svg'} alt={name} width={40} height={40} className="object-cover w-full h-full" />
      </div>

      {/* Name + role */}
      <div className="w-44 shrink-0">
        <p className="text-sm font-bold text-gray-900 truncate">{name}</p>
        <p className="text-[11px] text-orange-500 truncate">{role}</p>
      </div>

      {/* Skills */}
      <div className="flex-1 min-w-0 hidden md:block">
        <p className="text-[11px] text-gray-500 truncate">
          {c.specialty?.slice(0, 2).join(' | ') ?? 'General Medicine'}
        </p>
      </div>

      {/* Stats */}
      <div className="items-center gap-3 text-[11px] text-gray-500 shrink-0 hidden lg:flex">
        <span className="flex items-center gap-1"><Briefcase size={10} /> 5+ yrs</span>
        <span className="flex items-center gap-1"><MapPin size={10} className="text-green-500" />{c.city ?? '—'}</span>
        <span className="flex items-center gap-1"><Star size={10} className="text-yellow-400 fill-yellow-400" />4.8/5</span>
      </div>

      {/* Score */}
      {score > 0 && (
        <span className={`text-sm font-bold shrink-0 w-16 text-right ${scoreColor}`}>{score}/100</span>
      )}

      {/* Action */}
      <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
        {actionType === 'hire' && (
          <button className="flex items-center gap-1 border border-green-400 text-green-600 hover:bg-green-50 text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors">
            <Zap size={11} className="fill-green-500 text-green-500" /> Hire
          </button>
        )}
        {actionType === 'schedule' && (
          <button className="border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-medium px-3 py-1.5 rounded-xl transition-colors">
            Schedule
          </button>
        )}
        {actionType === 'invite' && (
          <button className="flex items-center gap-1 border border-orange-200 text-orange-500 hover:bg-orange-50 text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors">
            <Calendar size={11} /> Invite
          </button>
        )}
        {actionType === 'shortlist' && (
          <button className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors">
            Shortlist
          </button>
        )}
      </div>
    </div>
  );
};

// ── Board ──────────────────────────────────────────────────────
export const CandidatesBoard = () => {
  const [view, setView]     = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');

  const { data, isLoading, error } = useCandidatesList({ page: 1, limit: 20 });
  const candidates: CandidateListItem[] = data?.candidates ?? [];

  const chunkSize = Math.ceil(candidates.length / 4) || 1;
  const columnCandidates = COLUMNS.map((_, i) =>
    candidates.slice(i * chunkSize, (i + 1) * chunkSize)
  );

  const filtered = columnCandidates.map((group) =>
    group.filter((c) =>
      search
        ? `${c.first_name} ${c.last_name} ${c.specialty}`.toLowerCase().includes(search.toLowerCase())
        : true
    )
  );

  return (
    <div className="flex flex-col gap-5">

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
        <MetricCard icon={<BriefcaseBusiness size={18} />} title="Hired Candidates"    value={250}   change="-0.10%" isPositive={false} />
        <MetricCard icon={<Users size={18} />}              title="In-House Candidates" value={124}   change="+1.10%" isPositive={true}  />
        <MetricCard icon={<UserCheck size={18} />}          title="Active Candidates"   value={30}    change="+1.10%" isPositive={true}  />
        <MetricCard icon={<Layers size={18} />}             title="Candidates Pool"     value="16k+"  change="+2.10%" isPositive={false} />
      </div>

      {/* ── Search + Controls ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
            <Search size={16} className="text-gray-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Advance Candidate Search"
              className="w-full text-sm text-gray-700 outline-none bg-transparent placeholder:text-gray-400"
            />
          </div>
          <button className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap">
            <SlidersHorizontal size={16} className="text-gray-500" /> Filter
          </button>
          <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setView('grid')}
              className={`p-2.5 transition-colors ${view === 'grid' ? 'bg-orange-50 text-orange-500' : 'text-gray-400 hover:bg-gray-50'}`}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2.5 transition-colors ${view === 'list' ? 'bg-orange-50 text-orange-500' : 'text-gray-400 hover:bg-gray-50'}`}
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border-2 border-gray-100 p-4 space-y-3 animate-pulse">
                {[...Array(3)].map((_, j) => <div key={j} className="h-24 bg-gray-100 rounded-xl" />)}
              </div>
            ))}
          </div>
        )}

        {error && <div className="text-center py-12 text-red-400 text-sm">{error}</div>}

        {/* ── Kanban view ── */}
        {!isLoading && !error && view === 'grid' && (
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
                leftTags={col.leftTags}
                rightTags={col.rightTags}
              />
            ))}
          </div>
        )}

        {/* ── List view ── */}
        {!isLoading && !error && view === 'list' && (
          <div className="flex flex-col gap-6">
            {COLUMNS.map((col, i) => (
              <div key={col.title}>
                {/* Section header */}
                <div className="flex items-center gap-2 mb-3">
                  <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
                  <h3 className="text-sm font-bold text-gray-800">{col.title}</h3>
                  <span className="text-xs text-gray-400">({filtered[i]?.length ?? 0})</span>
                </div>
                {filtered[i]?.length === 0 ? (
                  <p className="text-xs text-gray-400 pl-5">No candidates</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {filtered[i].map((c, j) => (
                      <CandidateListRow key={c.id ?? j} c={c} actionType={col.actionType} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};