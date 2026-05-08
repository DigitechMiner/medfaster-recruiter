'use client';

import { useEffect, useState, type MouseEvent, type ReactNode } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  ArrowRight,
  Briefcase,
  BriefcaseBusiness,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  Download,
  Eye,
  Filter,
  LayoutGrid,
  Layers,
  List,
  MapPin,
  Plus,
  Search,
  Star,
  Upload,
  UserCheck,
  Users,
  X,
  Zap,
} from 'lucide-react';
import type { ActionType } from '@/Interface/recruiter.types';
import type { CandidateCardVM, InHouseAcceptedRowVM } from '@/Interface/view-models';
import ScoreCard from '@/components/card/scorecard';
import { BaseCard, CardHeader, CardIdentity, CardStats } from '@/components/candidate/BaseCard';
import { ColumnShell } from '@/components/candidate/ColumnShell';
import { ViewHeader } from '@/components/candidate/ViewHeader';
import { renderCandidateCards } from '@/components/candidate/renderers';
import { AppLayout } from '@/components/global/app-layout';
import { useCandidateCards } from '@/hooks/useCandidateCards';
import { useInHouseCandidates } from '@/hooks/useInHouseCandidates';
import { useCandidateSummary, useInviteCandidate } from '@/hooks/useRecruiterData';
import { DataTable } from '@/components/table/DataTable';
import { PaginationFooter } from '@/components/table/PaginationFooter';
import { TableTabs } from '@/components/table/TableTabs';

type KpiView = 'none' | 'candidatesPool' | 'hired' | 'inHouse' | 'active';
type AccentColor = 'orange' | 'green' | 'red' | 'neutral';
type InHouseTab = 'accepted' | 'invited';

type StaffEntry = { name: string; email: string };
type EntryError = { name?: string; email?: string };
type LocalInvite = { id: string; full_name: string; email: string; invited_at: string };

const PAGE_LIMIT = 10;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
const TD = 'text-[13px] text-gray-700 py-3.5 px-4 border-t border-gray-100';

const COLUMNS = [
  { title: "Keraeva's AI-Recommendations", accentColor: 'orange' as const, dotColor: 'bg-[#F59E0B]', actionType: 'shortlist' as const, leftTags: ['Online'], rightTags: [] },
  { title: 'Instant Hires', accentColor: 'neutral' as const, dotColor: 'bg-[#92400E]', actionType: 'hire' as const, leftTags: ['Online'], rightTags: [] },
  { title: 'Currently Available', accentColor: 'green' as const, dotColor: 'bg-green-500', actionType: 'schedule' as const, leftTags: ['Online'], rightTags: [] },
  { title: 'Nearby Professionals', accentColor: 'red' as const, dotColor: 'bg-red-500', actionType: 'invite' as const, leftTags: ['Online'], rightTags: [] },
];

const colStyles: Record<AccentColor, { wrapper: string; headerBg: string; dot: string; viewAll: string }> = {
  orange: { wrapper: 'border-[#F4A300] bg-[#FFF9F0]', headerBg: 'bg-[#FFF9F0]', dot: 'bg-[#F59E0B]', viewAll: 'text-[#F4A300]' },
  neutral: { wrapper: 'border-[#92400E] bg-[#FFF5EE]', headerBg: 'bg-[#FFF5EE]', dot: 'bg-[#92400E]', viewAll: 'text-[#92400E]' },
  green: { wrapper: 'border-[#22C55E] bg-[#F0FFF8]', headerBg: 'bg-[#F0FFF8]', dot: 'bg-[#22C55E]', viewAll: 'text-[#16A34A]' },
  red: { wrapper: 'border-[#EF4444] bg-[#FFF5F5]', headerBg: 'bg-[#FFF5F5]', dot: 'bg-[#EF4444]', viewAll: 'text-[#EF4444]' },
};

function JobTypePill({ type }: { type: string }) {
  return type === 'Urgent'
    ? <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-600 border border-orange-200">{type}</span>
    : <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-green-100 text-green-600 border border-green-200">{type}</span>;
}

function StatusPill({ status }: { status: string }) {
  const s = status === 'Active' ? 'bg-[#079455] text-white' : status === 'Completed' ? 'bg-[#FEDF89] text-[#4E1D09]' : status === 'Upcoming' ? 'bg-[#C36016] text-white' : 'bg-gray-100 text-gray-500';
  return <span className={`inline-flex items-center text-[11px] font-semibold px-3 py-1 rounded-full ${s}`}>{status}</span>;
}

function CandidateTypePill({ type }: { type: string }) {
  return type === 'In-House'
    ? <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-600 border border-sky-200">{type}</span>
    : <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200">{type}</span>;
}

function MetricCard({ icon, title, value, change, isPositive, onClick, isActive }: { icon: ReactNode; title: string; value: string | number; change: string; isPositive: boolean; onClick?: () => void; isActive?: boolean }) {
  return (
    <div onClick={onClick} className={`bg-white rounded-xl p-4 border shadow-sm flex flex-col gap-2 transition-all ${onClick ? 'cursor-pointer hover:shadow-md hover:border-orange-200' : ''} ${isActive ? 'border-orange-400 ring-2 ring-orange-100' : 'border-gray-100'}`}>
      <div className="flex items-center justify-between"><span className="text-xs text-gray-500 font-medium">{title}</span><span className="text-orange-400">{icon}</span></div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <div className="flex items-center justify-between"><span className="text-xs text-gray-400">Since last week</span><span className={`text-xs font-semibold ${isPositive ? 'text-green-500' : 'text-red-400'}`}>{change} {isPositive ? '↑' : '↓'}</span></div>
    </div>
  );
}

function MainViewHeader({ view, setView }: { view: 'grid' | 'list'; setView: (view: 'grid' | 'list') => void }) {
  return <ViewHeader wrapperClassName="flex items-center gap-3" filterButtonClassName="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap" toggleWrapperClassName="flex bg-white border border-gray-200 rounded-xl overflow-hidden" gridButtonClassName={`p-2.5 transition-colors ${view === 'grid' ? 'bg-orange-50 text-[#F4781B]' : 'text-gray-400 hover:bg-gray-50'}`} listButtonClassName={`p-2.5 transition-colors ${view === 'list' ? 'bg-orange-50 text-[#F4781B]' : 'text-gray-400 hover:bg-gray-50'}`} filterSize={16} gridSize={16} listSize={16} onGrid={() => setView('grid')} onList={() => setView('list')} />;
}

function JobTable({ jobs, showCandidateType = false, headerBg = 'bg-orange-50/60' }: { jobs: CandidateCardVM[]; showCandidateType?: boolean; headerBg?: string }) {
  const baseHeaders = ['Candidate Name', 'Department', 'Designation', 'Experience', 'Status'];
  const headers = showCandidateType ? ['Candidate Name', 'Candidate Type', ...baseHeaders.slice(1)] : baseHeaders;
  return (
    <DataTable
      headers={headers}
      minWidthClassName="min-w-full"
      tableClassName="text-left"
      headerRowClassName={headerBg}
      wrapperClassName="overflow-x-auto rounded-xl border border-gray-100"
    >
      {jobs.length === 0 ? <tr><td colSpan={headers.length} className="py-8 text-center text-xs text-gray-400">No records found</td></tr> : jobs.map((c) => (
        <tr key={c.id} className="border-b border-gray-100 hover:bg-orange-50/30 transition-colors cursor-pointer">
          <td className="py-3 px-4 text-sm font-medium text-gray-900 whitespace-nowrap">{c.full_name}</td>
          {showCandidateType && <td className="py-3 px-4"><CandidateTypePill type={c.work_eligibility ?? '—'} /></td>}
          <td className="py-3 px-4 text-xs text-gray-600">{c.department || '—'}</td>
          <td className="py-3 px-4 text-xs text-gray-600">{c.designation || '—'}</td>
          <td className="py-3 px-4 text-xs text-gray-600">{c.experience || '—'}</td>
          <td className="py-3 px-4"><StatusPill status={c.application_status} /></td>
        </tr>
      ))}
    </DataTable>
  );
}

function LeftPill({ text }: { text: string }) {
  const isOnline = text.toLowerCase() === 'online';
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2.5 py-1 rounded-full border ${isOnline ? 'border-green-400 text-green-600 bg-green-50' : 'border-[#F4781B] text-[#F4781B] bg-orange-50'}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isOnline ? 'bg-green-500' : 'bg-[#F4781B]'}`} />
      {text}
    </span>
  );
}

function RightPill({ text }: { text: string }) {
  const t = text.toLowerCase();
  if (t.includes('most') || t.includes('best choice')) return <span className="inline-flex items-center text-[10px] font-semibold px-2.5 py-1 rounded-full bg-[#12B76A] text-white">{text}</span>;
  if (t.includes('night shift')) return <span className="inline-flex items-center text-[10px] font-semibold px-2.5 py-1 rounded-full bg-gray-900 text-white">{text}</span>;
  if (t.includes('high demand')) return <span className="inline-flex items-center text-[10px] font-semibold px-1 py-0.5 rounded-full border border-red-500 text-red-500 bg-red-50 tracking-tight">{text}</span>;
  return <span className="inline-flex items-center text-[10px] font-semibold px-2.5 py-1 rounded-full border border-[#F4781B] text-[#F4781B] bg-orange-50">{text}</span>;
}

function Verified() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="#3b82f6" className="shrink-0 inline-block ml-0.5">
      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function ActionButtons({ actionType, score, onOpenModal }: { actionType: ActionType; score: number; onOpenModal: () => void }) {
  const open = (e: MouseEvent) => { e.stopPropagation(); onOpenModal(); };
  if (actionType === 'hire') return <button onClick={open} className="w-full flex items-center justify-center gap-1.5 bg-green-50 border border-green-400 text-green-600 text-xs font-semibold py-2 rounded-xl hover:bg-green-100 transition-colors"><Zap size={12} fill="#16a34a" stroke="#16a34a" /> Hire Instantly</button>;
  if (actionType === 'schedule') return score >= 80 ? (
    <div className="flex gap-2">
      <button onClick={open} className="flex-1 border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-medium py-2 rounded-xl transition-colors">Schedule Interview</button>
      <button onClick={open} className="flex-1 border border-[#F4781B] text-[#F4781B] hover:bg-orange-50 text-xs font-semibold py-2 rounded-xl transition-colors">Direct Hire</button>
    </div>
  ) : <button onClick={open} className="w-full border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-medium py-2 rounded-xl transition-colors">Schedule Interview</button>;
  if (actionType === 'invite') return <button onClick={open} className="w-full flex items-center justify-center gap-1.5 border border-[#F4781B] text-[#F4781B] hover:bg-orange-50 text-xs font-semibold py-2 rounded-xl transition-colors"><Calendar size={11} /> Invite For a Job</button>;
  return score >= 75 ? (
    <div className="flex gap-2">
      <button onClick={open} className="flex-1 bg-[#F4781B] hover:bg-[#e06a10] text-white text-xs font-semibold py-2 rounded-xl transition-colors">Shortlist</button>
      <button onClick={open} className="flex-1 border border-[#F4781B] text-[#F4781B] hover:bg-orange-50 text-xs font-semibold py-2 rounded-xl transition-colors bg-orange-50/50">Direct Hire</button>
    </div>
  ) : <button onClick={open} className="w-full bg-[#F4781B] hover:bg-[#e06a10] text-white text-xs font-semibold py-2 rounded-xl transition-colors">Shortlist</button>;
}

function BoardCandidateCard({ c, actionType, leftTag, rightTag }: { c: CandidateCardVM; actionType: ActionType; leftTag?: string; rightTag?: string }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  void showModal;
  const score = c.interview_score ?? 0;
  const hasScore = c.interview_score !== null;
  const pillLeft = leftTag ?? (c.is_online ? 'Online' : c.work_eligibility ?? 'Active');
  const pillRight = rightTag ?? null;
  return (
    <BaseCard onClick={() => router.push(c.href)} className="flex flex-col gap-2 p-3 rounded-xl border border-gray-200 bg-white hover:border-orange-300 hover:shadow-sm transition-all cursor-pointer">
      <CardHeader className="flex items-center justify-between gap-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap"><LeftPill text={pillLeft} /></div>
        {pillRight && <RightPill text={pillRight} />}
      </CardHeader>
      <CardIdentity className="flex items-start gap-2">
        <div className="w-10 h-10 rounded-xl overflow-hidden bg-orange-50 shrink-0 border border-gray-100">
          {c.profile_image_url ? <Image src={c.profile_image_url} alt={c.full_name} width={40} height={40} className="object-cover w-full h-full" /> : <div className="w-full h-full flex items-center justify-center text-sm font-bold text-[#F4781B]">{c.initials}</div>}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 leading-tight">{c.full_name}<Verified /></p>
          <p className="text-[11px] text-[#F4781B] font-medium mt-0.5">{c.designation}</p>
          <p className="text-[10px] text-gray-500 mt-0.5">Dept: <span className="text-gray-600">{c.department}</span></p>
        </div>
        {hasScore ? <ScoreCard category="good" score={score} maxScore={100} /> : <ScoreCard category="none" score={0} maxScore={100} noBackground />}
      </CardIdentity>
      <CardStats className="flex items-center gap-2 text-[10px] text-gray-500 flex-wrap">
        <span className="flex items-center gap-1"><Briefcase size={10} className="text-gray-400" /> {c.experience}</span>
        <span className="text-gray-300">|</span>
        <span className="flex items-center gap-0.5"><MapPin size={9} className="text-green-500" /> {c.distance}</span>
        <span className="text-gray-300">|</span>
        <span className="flex items-center gap-0.5"><Star size={9} className="fill-yellow-400 text-yellow-400" /> {c.rating ? `${c.rating}/5` : 'N/A'}</span>
      </CardStats>
      <div onClick={(e) => e.stopPropagation()}>
        <ActionButtons actionType={actionType} score={score} onOpenModal={() => setShowModal(true)} />
      </div>
    </BaseCard>
  );
}

function PoolListRow({ c, actionType }: { c: CandidateCardVM; actionType: ActionType }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  void showModal;
  const score = c.interview_score ?? 0;
  return (
    <tr onClick={() => router.push(c.href)} className="border-b border-gray-100 hover:bg-orange-50/40 cursor-pointer transition-colors">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl overflow-hidden bg-orange-50 shrink-0 border border-gray-100">
            <Image src={c.profile_image_url || '/svg/Photo.svg'} alt={c.full_name} width={36} height={36} className="object-cover w-full h-full" />
          </div>
          <div><p className="text-sm font-bold text-gray-900">{c.full_name}</p><p className="text-[11px] text-[#F4781B]">{c.designation}</p></div>
        </div>
      </td>
      <td className="py-3 px-4 text-xs text-gray-600">{c.department}</td>
      <td className="py-3 px-4 text-xs text-gray-600">{c.designation}</td>
      <td className="py-3 px-4 text-xs text-gray-600">{c.experience}</td>
      <td className="py-3 px-4"><span className="flex items-center gap-1 text-xs text-gray-500"><MapPin size={11} className="text-green-500" /> {c.distance}</span></td>
      <td className="py-3 px-4 text-xs font-semibold text-gray-800">{score > 0 ? `${score}/100` : '—'}</td>
      <td className="py-3 px-4"><span className="flex items-center gap-1 text-xs text-yellow-600"><Star size={11} className="fill-yellow-400 text-yellow-400" />{c.rating ? `${c.rating}/5` : '—'}</span></td>
      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
        <button onClick={() => setShowModal(true)} className={actionType === 'hire' ? 'flex items-center gap-1 border border-green-400 text-green-600 hover:bg-green-50 text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors' : actionType === 'schedule' ? 'border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-medium px-3 py-1.5 rounded-xl transition-colors' : actionType === 'invite' ? 'flex items-center gap-1 border border-orange-200 text-[#F4781B] hover:bg-orange-50 text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors' : 'bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors'}>
          {actionType === 'hire' && <><Zap size={11} className="fill-green-500 text-green-500" /> Hire Instantly</>}
          {actionType === 'schedule' && 'Schedule a Interview'}
          {actionType === 'invite' && <><Calendar size={11} /> Invite For a Job</>}
          {actionType === 'shortlist' && 'Shortlist'}
        </button>
      </td>
    </tr>
  );
}

function CandidateColumn({ title, count, accentColor, candidates, actionType, leftTags, rightTags, isLoading = false, onViewAll, hideHeader, hideViewAll, search = '' }: { title: string; count: number; accentColor: AccentColor; candidates: CandidateCardVM[]; actionType: ActionType; leftTags?: string[]; rightTags?: string[]; isLoading?: boolean; onViewAll?: () => void; hideHeader?: boolean; hideViewAll?: boolean; search?: string }) {
  const s = colStyles[accentColor];
  const filtered = search ? candidates.filter((c) => `${c.full_name} ${c.designation ?? ''} ${c.department ?? ''}`.toLowerCase().includes(search.toLowerCase())) : candidates;
  return (
    <ColumnShell
      containerClassName={`rounded-2xl border-2 ${s.wrapper} flex flex-col overflow-hidden`}
      header={!hideHeader ? (
        <div className={`${s.headerBg} px-4 py-3.5 flex items-center justify-center gap-2`}>
          <span className={`w-2.5 h-2.5 rounded-full ${s.dot} shrink-0`} />
          <h2 className="text-sm font-bold text-gray-900">{title}</h2>
          <span className="text-xs font-medium text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-full">{count}</span>
        </div>
      ) : undefined}
      content={<div className="flex flex-col gap-3 p-3">{isLoading ? [...Array(3)].map((_, i) => <div key={`skeleton-${i}`} className="h-40 bg-gray-100 rounded-xl animate-pulse" />) : filtered.length === 0 ? <div className="text-center py-8 text-xs text-gray-400">No candidates</div> : renderCandidateCards(filtered, (c, i) => <BoardCandidateCard key={c.id} c={c} actionType={actionType} leftTag={leftTags?.[i % (leftTags?.length ?? 1)]} rightTag={rightTags?.[i % (rightTags?.length ?? 1)]} />)}</div>}
      footer={!hideViewAll ? <div className="px-4 pb-4 pt-1"><button onClick={onViewAll} className={`block w-full text-xs font-semibold text-center ${s.viewAll} hover:underline`}>View all</button></div> : undefined}
    />
  );
}

function HiredCandidateCard({ c, leftTag, rightTag }: { c: CandidateCardVM; leftTag?: string; rightTag?: string }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  void showModal;
  const isAssigned = (leftTag ?? 'Assigned').toLowerCase().includes('assigned');
  return (
    <BaseCard onClick={() => router.push(c.href)} className="flex flex-col gap-2 p-3 rounded-xl border border-gray-200 bg-white hover:border-orange-300 hover:shadow-sm transition-all cursor-pointer">
      <CardHeader className="flex items-center justify-between gap-1">
        {isAssigned ? <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-300"><span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Assigned</span> : <span className="inline-flex items-center gap-1 text-[10px] font-light px-2 py-0.5 rounded-full bg-[#079455] text-white border">Active</span>}
        {rightTag && <JobTypePill type={rightTag} />}
      </CardHeader>
      <CardIdentity className="flex items-start gap-2">
        <div className="w-10 h-10 rounded-xl overflow-hidden bg-orange-50 shrink-0 border border-gray-100">
          {c.profile_image_url ? <Image src={c.profile_image_url} alt={c.full_name} width={40} height={40} className="object-cover w-full h-full" /> : <div className="w-full h-full flex items-center justify-center text-sm font-bold text-[#F4781B]">{c.initials}</div>}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 leading-tight">{c.full_name}</p>
          <p className="text-[11px] text-[#F4781B] font-medium mt-0.5">{c.designation}</p>
          <CardStats className="flex items-center gap-2 text-[10px] text-gray-500 flex-wrap mt-1">
            <span className="flex items-center gap-1"><Briefcase size={10} className="text-gray-400" /> {c.experience}</span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-0.5"><MapPin size={9} className="text-green-500" /> {c.distance}</span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-0.5"><Star size={9} className="fill-yellow-400 text-yellow-400" /> {c.rating ? `${c.rating}/5` : 'N/A'}</span>
          </CardStats>
        </div>
        {c.interview_score !== null && <ScoreCard category="good" score={c.interview_score} maxScore={100} />}
      </CardIdentity>
      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
        <button className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-medium py-1 rounded-md transition-colors flex items-center justify-center gap-1"><Download size={11} /> Export Profile</button>
        <button onClick={() => setShowModal(true)} className="flex-1 bg-[#F4781B] hover:bg-[#e06a10] text-white text-sm font-light py-1 rounded-md transition-colors flex items-center justify-center">Direct Hire</button>
      </div>
    </BaseCard>
  );
}

function HiredCandidatesSection({ search = '' }: { search?: string }) {
  const [page, setPage] = useState(1);
  const [localView, setLocalView] = useState<'grid' | 'list'>('list');
  useEffect(() => { setPage(1); }, [search]);
  const { cards, total, isLoading } = useCandidateCards({ status: 'HIRE', page, limit: PAGE_LIMIT, ...(search ? { search } : {}) });
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0" /><h3 className="text-sm font-bold text-gray-900">Hired Candidates</h3><span className="text-xs text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-full">{total}</span></div>
        <ViewHeader wrapperClassName="flex items-center gap-2" filterButtonClassName="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors" toggleWrapperClassName="flex bg-white border border-gray-200 rounded-xl overflow-hidden" gridButtonClassName={`p-2 transition-colors ${localView === 'grid' ? 'bg-orange-50 text-[#F4781B]' : 'text-gray-400 hover:bg-gray-50'}`} listButtonClassName={`p-2 transition-colors ${localView === 'list' ? 'bg-orange-50 text-[#F4781B]' : 'text-gray-400 hover:bg-gray-50'}`} filterSize={13} gridSize={14} listSize={14} rightSlot={null} onGrid={() => { setLocalView('grid'); setPage(1); }} onList={() => { setLocalView('list'); setPage(1); }} />
      </div>
      {isLoading ? <div className="h-32 bg-gray-100 rounded-xl animate-pulse" /> : localView === 'list' ? (
        <div className="rounded-xl border border-gray-100 overflow-hidden">
          <JobTable jobs={cards} headerBg="bg-orange-50/60" />
          <PaginationFooter totalItems={total} page={page} perPage={PAGE_LIMIT} onPageChange={setPage} itemLabel="candidates" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {cards.length === 0 ? <p className="text-sm text-gray-400 col-span-full text-center py-8">No hired candidates found.</p> : cards.map((c) => <HiredCandidateCard key={c.id} c={c} />)}
          </div>
          <PaginationFooter totalItems={total} page={page} perPage={PAGE_LIMIT} onPageChange={setPage} itemLabel="candidates" />
        </>
      )}
    </div>
  );
}

function ActiveCandidatesSection() {
  const [page, setPage] = useState(1);
  const { cards, total, isLoading } = useCandidateCards({ status: 'INTERVIEWING', page, limit: PAGE_LIMIT });
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
        <h3 className="text-sm font-bold text-gray-900">Active Candidates</h3>
        <span className="text-xs text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-full">{total}</span>
      </div>
      {isLoading ? <div className="h-32 bg-gray-100 rounded-xl animate-pulse" /> : (
        <div className="rounded-xl border border-gray-100 overflow-hidden">
          <JobTable jobs={cards} showCandidateType headerBg="bg-blue-50/40" />
          <PaginationFooter totalItems={total} page={page} perPage={PAGE_LIMIT} onPageChange={setPage} itemLabel="candidates" />
        </div>
      )}
    </div>
  );
}

function validateEntries(entries: StaffEntry[]): EntryError[] {
  return entries.map((e) => {
    const errors: EntryError = {};
    if (!e.name.trim()) errors.name = 'Name is required';
    if (!e.email.trim()) errors.email = 'Email is required';
    else if (!EMAIL_REGEX.test(e.email.trim())) errors.email = 'Enter a valid email address';
    return errors;
  });
}

function hasErrors(errors: EntryError[]): boolean {
  return errors.some((e) => e.name || e.email);
}

function AddInHouseModal({ onClose, onSuccess, onPartialFail, candidateId, jobId }: { onClose: () => void; onSuccess: (count: number, entries: StaffEntry[]) => void; onPartialFail?: (failedEmails: string[]) => void; candidateId: string; jobId: string }) {
  const [entries, setEntries] = useState<StaffEntry[]>([{ name: '', email: '' }]);
  const [errors, setErrors] = useState<EntryError[]>([{}]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { invite } = useInviteCandidate();
  const updateEntry = (i: number, field: keyof StaffEntry, val: string) => {
    setEntries((prev) => prev.map((e, idx) => (idx === i ? { ...e, [field]: val } : e)));
    setErrors((prev) => prev.map((err, idx) => (idx === i ? { ...err, [field]: undefined } : err)));
  };
  const addRow = () => { setEntries((prev) => [...prev, { name: '', email: '' }]); setErrors((prev) => [...prev, {}]); };
  const removeRow = (i: number) => { if (entries.length === 1) return; setEntries((prev) => prev.filter((_, idx) => idx !== i)); setErrors((prev) => prev.filter((_, idx) => idx !== i)); };
  const handleSend = async () => {
    setSubmitError(null);
    const validated = validateEntries(entries);
    if (hasErrors(validated)) { setErrors(validated); return; }
    const filled = entries.filter((e) => e.name.trim() && e.email.trim());
    setIsSubmitting(true);
    try {
      if (candidateId && jobId) {
        const res = await invite({ candidate_id: candidateId, job_id: jobId });
        if (!res.success) { onPartialFail?.(filled.map((e) => e.email)); return; }
      }
      onSuccess(filled.length, filled);
    } catch {
      setSubmitError('Failed to send invitation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors"><ChevronLeft size={18} /></button>
            <h2 className="text-[15px] font-bold text-gray-900">Add In-House Staff</h2>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 text-[12px] font-medium px-3.5 py-2 rounded-xl transition-colors"><Upload size={13} /> Bulk Upload</button>
            <button onClick={addRow} className="flex items-center gap-1.5 bg-[#F4781B] hover:bg-[#e06a10] text-white text-[12px] font-semibold px-3.5 py-2 rounded-xl transition-colors"><Plus size={13} /> Add More</button>
          </div>
        </div>
        <div className="grid grid-cols-[1fr_1fr_auto] gap-4 mb-2 px-1">
          <span className="text-[12px] text-gray-500 font-medium">Full Name</span><span className="text-[12px] text-gray-500 font-medium">Email Id</span><span className="w-6" />
        </div>
        <div className="flex flex-col gap-3 max-h-72 overflow-y-auto pr-1">
          {entries.map((entry, i) => (
            <div key={`entry-${i}`} className="grid grid-cols-[1fr_1fr_auto] gap-4 items-start">
              <div className="flex flex-col gap-1">
                <input value={entry.name} onChange={(e) => updateEntry(i, 'name', e.target.value)} placeholder="Ajay Shah" className={`border rounded-xl px-3.5 py-2.5 text-[13px] text-gray-800 outline-none transition-colors ${errors[i]?.name ? 'border-red-400 focus:border-red-400 bg-red-50/30' : 'border-gray-200 focus:border-[#F4781B]'}`} />
                {errors[i]?.name && <span className="flex items-center gap-1 text-[11px] text-red-500"><AlertCircle size={11} /> {errors[i].name}</span>}
              </div>
              <div className="flex flex-col gap-1">
                <input value={entry.email} onChange={(e) => updateEntry(i, 'email', e.target.value)} placeholder="staff@hospital.com" className={`border rounded-xl px-3.5 py-2.5 text-[13px] text-gray-800 outline-none transition-colors ${errors[i]?.email ? 'border-red-400 focus:border-red-400 bg-red-50/30' : 'border-gray-200 focus:border-[#F4781B]'}`} />
                {errors[i]?.email && <span className="flex items-center gap-1 text-[11px] text-red-500"><AlertCircle size={11} /> {errors[i].email}</span>}
              </div>
              <button onClick={() => removeRow(i)} disabled={entries.length === 1} className={`mt-2.5 transition-colors ${entries.length === 1 ? 'text-gray-200 cursor-not-allowed' : 'text-gray-400 hover:text-red-400'}`}><X size={16} /></button>
            </div>
          ))}
        </div>
        {submitError && <p className="mt-3 text-[11px] text-red-500 text-center flex items-center justify-center gap-1"><AlertCircle size={12} /> {submitError}</p>}
        <div className="flex items-center justify-between mt-6">
          <p className="text-[12px] text-gray-400">{entries.length} staff member{entries.length > 1 ? 's' : ''} to be invited</p>
          <button onClick={handleSend} disabled={isSubmitting} className="flex items-center gap-2 bg-[#F4781B] hover:bg-[#e06a10] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[13px] font-semibold px-5 py-2.5 rounded-xl transition-colors">{isSubmitting ? 'Sending…' : 'Send Invitation'} {!isSubmitting && <ArrowRight size={14} />}</button>
        </div>
      </div>
    </div>
  );
}

function SuccessModal({ count, onDone }: { count: number; onDone: () => void }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"><div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 px-8 pt-10 pb-8 flex flex-col items-center gap-5 text-center"><div className="relative flex items-center justify-center w-24 h-24"><div className="absolute inset-0 rounded-full bg-green-100 opacity-50" /><div className="absolute inset-3 rounded-full bg-green-100" /><div className="relative w-14 h-14 rounded-full bg-white border-2 border-green-400 flex items-center justify-center"><CheckCircle2 size={28} className="text-green-500" strokeWidth={1.8} /></div></div><div className="space-y-1.5"><p className="text-[17px] font-bold text-gray-900 leading-snug">Invitations Sent to {count} Candidate{count !== 1 ? 's' : ''}!</p><p className="text-[13px] text-gray-400">You will be notified once they are enrolled</p></div><button onClick={onDone} className="w-full bg-[#F4781B] hover:bg-[#e06a10] text-white text-[15px] font-semibold py-3.5 rounded-xl transition-colors">Done</button></div></div>;
}

function PartialFailModal({ failedEmails, onClose }: { failedEmails: string[]; onClose: () => void }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"><div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 px-8 pt-10 pb-8 flex flex-col items-center gap-5 text-center"><div className="relative flex items-center justify-center w-24 h-24"><div className="absolute inset-0 rounded-full bg-red-100 opacity-50" /><div className="absolute inset-3 rounded-full bg-red-100" /><div className="relative w-14 h-14 rounded-full bg-white border-2 border-red-400 flex items-center justify-center"><AlertCircle size={28} className="text-red-500" strokeWidth={1.8} /></div></div><div className="space-y-3"><p className="text-[17px] font-bold text-gray-900 leading-snug">Invitation Not Sent to {failedEmails.length} Candidate{failedEmails.length !== 1 ? 's' : ''}!</p><ul className="space-y-1.5">{failedEmails.map((email, i) => <li key={`${email}-${i}`} className="flex items-center gap-2 justify-center text-[14px] text-gray-400"><span className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />{email}</li>)}</ul></div><button onClick={onClose} className="w-full bg-[#F4781B] hover:bg-[#e06a10] text-white text-[15px] font-semibold py-3.5 rounded-xl transition-colors">OK</button></div></div>;
}

function EmptyState({ message, sub }: { message: string; sub: string }) {
  return <div className="flex flex-col items-center justify-center py-24 gap-4"><div className="relative w-36 h-36"><Image src="/svg/empty-job.svg" alt={message} fill sizes="144px" className="object-contain" /></div><div className="text-center"><p className="text-[15px] font-bold text-gray-800">{message}</p><p className="text-[13px] text-gray-400 mt-1 max-w-xs">{sub}</p></div></div>;
}

function SkeletonRows({ cols }: { cols: number }) {
  return <>{[1, 2, 3].map((i) => <tr key={`skeleton-row-${i}`} className="animate-pulse">{Array.from({ length: cols }).map((_, j) => <td key={`skeleton-col-${i}-${j}`} className={TD}><div className="h-3.5 bg-gray-100 rounded w-3/4" /></td>)}</tr>)}</>;
}

function AcceptedTable({ rows, total, page, isLoading, onPageChange }: { rows: InHouseAcceptedRowVM[]; total: number; page: number; isLoading: boolean; onPageChange: (p: number) => void }) {
  if (!isLoading && rows.length === 0) return <EmptyState message="No Invitations Accepted Yet" sub="Once a candidate accepts your in-house request on the KeRaeva app, they will appear here." />;
  return (
    <>
      <DataTable headers={['Candidate Name', 'Location', 'Joined', 'Action']} minWidthClassName="min-w-full" headerRowClassName="bg-orange-50/60">
        {isLoading ? <SkeletonRows cols={4} /> : rows.map((c) => <tr key={c.candidate_id} className="hover:bg-gray-50/60 transition-colors"><td className={TD}><div className="flex items-center gap-2.5">{c.profile_image_url ? <Image src={c.profile_image_url} alt={c.full_name} width={30} height={30} className="rounded-full object-cover flex-shrink-0" /> : <div className="w-[30px] h-[30px] rounded-full bg-orange-100 text-orange-500 text-[11px] font-bold flex items-center justify-center flex-shrink-0">{c.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}</div>}<span>{c.full_name}</span></div></td><td className={TD}><span className="text-gray-500">{c.location}</span></td><td className={TD}>{new Date(c.joined_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td><td className={`${TD} text-center`}><button className="text-blue-400 hover:text-blue-600 transition-colors"><Eye size={18} /></button></td></tr>)}
      </DataTable>
      {!isLoading && total > PAGE_LIMIT && <PaginationFooter totalItems={total} page={page} perPage={PAGE_LIMIT} onPageChange={onPageChange} itemLabel="candidates" />}
    </>
  );
}

function InvitedTable({ rows, page, onPageChange }: { rows: LocalInvite[]; page: number; onPageChange: (p: number) => void }) {
  if (rows.length === 0) return <EmptyState message="No Invitations Sent Yet" sub="Invite your in-house staff to get started." />;
  const paged = rows.slice((page - 1) * PAGE_LIMIT, page * PAGE_LIMIT);
  return (
    <>
      <DataTable headers={['Candidate Name', 'Email', 'Status', 'Invited On']} minWidthClassName="min-w-full" headerRowClassName="bg-orange-50/60">
        {paged.map((c) => <tr key={c.id} className="hover:bg-gray-50/60 transition-colors"><td className={TD}>{c.full_name}</td><td className={TD}>{c.email || '—'}</td><td className={TD}><span className="text-[12px] font-medium px-2.5 py-1 rounded-full bg-orange-50 text-orange-500">Invitation Sent</span></td><td className={TD}>{c.invited_at}</td></tr>)}
      </DataTable>
      {rows.length > PAGE_LIMIT && <PaginationFooter totalItems={rows.length} page={page} perPage={PAGE_LIMIT} onPageChange={onPageChange} itemLabel="candidates" />}
    </>
  );
}

function InHouseCandidatesSection({ candidateId = '', jobId = '', openModalOnMount = false, onModalMounted }: { candidateId?: string; jobId?: string; openModalOnMount?: boolean; onModalMounted?: () => void }) {
  const [activeTab, setActiveTab] = useState<InHouseTab>('accepted');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailModal, setShowFailModal] = useState(false);
  const [inviteCount, setInviteCount] = useState(0);
  const [failedEmails, setFailedEmails] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [acceptedPage, setAcceptedPage] = useState(1);
  const [invitedPage, setInvitedPage] = useState(1);
  const [localInvites, setLocalInvites] = useState<LocalInvite[]>([]);
  const { rows: acceptedRows, total: acceptedTotal, isLoading } = useInHouseCandidates();
  const handleSuccess = (count: number, entries: StaffEntry[]) => {
    const now = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const newInvites: LocalInvite[] = entries.map((e, i) => ({ id: `local-${Date.now()}-${i}`, full_name: e.name.trim(), email: e.email.trim(), invited_at: now }));
    setLocalInvites((prev) => [...newInvites, ...prev]);
    setInviteCount(count);
    setShowAddModal(false);
    setInvitedPage(1);
    setActiveTab('invited');
    setShowSuccessModal(true);
  };
  const handlePartialFail = (emails: string[]) => { setFailedEmails(emails); setShowAddModal(false); setShowFailModal(true); };
  useEffect(() => { if (openModalOnMount) { setShowAddModal(true); onModalMounted?.(); } }, [openModalOnMount, onModalMounted]);
  return (
    <>
      {showAddModal && <AddInHouseModal onClose={() => setShowAddModal(false)} onSuccess={handleSuccess} onPartialFail={handlePartialFail} candidateId={candidateId} jobId={jobId} />}
      {showSuccessModal && <SuccessModal count={inviteCount} onDone={() => setShowSuccessModal(false)} />}
      {showFailModal && <PartialFailModal failedEmails={failedEmails} onClose={() => setShowFailModal(false)} />}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-1 border-b border-gray-100 overflow-visible">
          <TableTabs
            tabs={[
              { key: 'accepted' as const, label: 'Accepted' },
              {
                key: 'invited' as const,
                label: (
                  <>
                    Invited
                    {localInvites.length > 0 && (
                      <span className="ml-1.5 text-[10px] bg-[#F4781B] text-white font-bold px-1.5 py-0.5 rounded-full">
                        {localInvites.length}
                      </span>
                    )}
                  </>
                ),
              },
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            className=""
            wrapperClassName="flex"
            tabClassName="relative px-5 py-4 text-sm font-medium transition-colors whitespace-nowrap"
            activeTabClassName="text-[#F4781B]"
            inactiveTabClassName="text-gray-400 hover:text-gray-600"
            activeIndicatorClassName="absolute bottom-0 left-0 right-0 h-[2px] bg-[#F4781B] rounded-t-full"
          />
          <div className="flex items-center gap-2 pr-2">
            <button className="flex items-center gap-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 text-[12px] font-medium px-3.5 py-2 rounded-xl transition-colors"><Filter size={13} /> Filter</button>
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
              <button onClick={() => setViewMode('grid')} className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-gray-100 text-gray-700' : 'text-gray-400 hover:bg-gray-50'}`}><LayoutGrid size={15} /></button>
              <button onClick={() => setViewMode('list')} className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-gray-100 text-gray-700' : 'text-gray-400 hover:bg-gray-50'}`}><List size={15} /></button>
            </div>
            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 bg-[#F4781B] hover:bg-[#e06a10] text-white text-[12px] font-semibold px-3.5 py-2 rounded-xl transition-colors"><Plus size={13} /> Add Staff</button>
          </div>
        </div>
        {activeTab === 'accepted' && <AcceptedTable rows={acceptedRows} total={acceptedTotal} page={acceptedPage} isLoading={isLoading} onPageChange={setAcceptedPage} />}
        {activeTab === 'invited' && <InvitedTable rows={localInvites} page={invitedPage} onPageChange={setInvitedPage} />}
      </div>
    </>
  );
}

function CandidatesPoolSection({ view, search = '', activeListTab, setActiveListTab, expandedColumn, setExpandedColumn, activeKpi, setActiveKpi }: { view: 'grid' | 'list'; search?: string; activeListTab: number; setActiveListTab: (value: number) => void; expandedColumn: string | null; setExpandedColumn: (value: string | null) => void; activeKpi: KpiView; setActiveKpi: (value: KpiView) => void }) {
  const [pages, setPages] = useState<number[]>([1, 1, 1, 1]);
  const setPage = (colIdx: number, p: number) => setPages((prev) => prev.map((v, i) => (i === colIdx ? p : v)));
  const [activePaginatedCol, setActivePaginatedCol] = useState(0);
  const colData = [
    useCandidateCards({ status: 'APPLIED', page: pages[0], limit: PAGE_LIMIT }),
    useCandidateCards({ status: 'SHORTLISTED', page: pages[1], limit: PAGE_LIMIT }),
    useCandidateCards({ status: 'INTERVIEWING', page: pages[2], limit: PAGE_LIMIT }),
    useCandidateCards({ status: 'HIRE', page: pages[3], limit: PAGE_LIMIT }),
  ];
  const filteredColData = colData.map(({ cards, total, isLoading }) => ({ cards: search ? cards.filter((c) => `${c.full_name} ${c.designation} ${c.department}`.toLowerCase().includes(search.toLowerCase())) : cards, total, isLoading }));
  if (view === 'list') {
    const col = COLUMNS[activeListTab];
    const { cards: rows, total, isLoading } = filteredColData[activeListTab];
    return (
      <div className="flex flex-col gap-0">
        <TableTabs
          tabs={COLUMNS.map((column, index) => ({
            key: String(index),
            label: (
              <>
                {column.title}
                <span className="ml-1.5 text-[10px] text-gray-400">
                  ({colData[index].total})
                </span>
              </>
            ),
          }))}
          activeTab={String(activeListTab)}
          onTabChange={(tab) => {
            const nextIndex = Number(tab);
            setActiveListTab(nextIndex);
            setPage(nextIndex, 1);
          }}
          className="border-b border-gray-100 mb-4"
          wrapperClassName="flex items-center gap-0"
          tabClassName="relative px-5 py-4 text-sm font-medium transition-colors whitespace-nowrap"
          activeTabClassName="text-[#F4781B]"
          inactiveTabClassName="text-gray-400 hover:text-gray-600"
          activeIndicatorClassName="absolute bottom-0 left-0 right-0 h-[2px] bg-[#F4781B] rounded-t-full"
        />
        {isLoading ? <div className="h-32 bg-gray-100 rounded-xl animate-pulse" /> : (
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <DataTable headers={['Candidate Name', 'Department', 'Designation', 'Experience', 'Distance', 'General Scoring', 'Rating', 'Action']} minWidthClassName="min-w-full" tableClassName="text-left" headerRowClassName="bg-orange-50/60">
              {rows.length === 0 ? <tr><td colSpan={8} className="py-8 text-center text-xs text-gray-400">No candidates</td></tr> : rows.map((c, j) => <PoolListRow key={c.id ?? j} c={c} actionType={col.actionType} />)}
            </DataTable>
            <PaginationFooter totalItems={total} page={pages[activeListTab]} perPage={PAGE_LIMIT} onPageChange={(p) => setPage(activeListTab, p)} itemLabel="candidates" />
          </div>
        )}
      </div>
    );
  }
  if (expandedColumn) {
    const colIdx = COLUMNS.findIndex((c) => c.title === expandedColumn);
    const col = COLUMNS[colIdx];
    const { cards: rows, total, isLoading } = filteredColData[colIdx];
    const s = colStyles[col.accentColor];
    return (
      <div className={`rounded-2xl border-2 ${s.wrapper} p-4`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
            <h3 className="text-sm font-bold text-gray-900">{col.title}</h3>
            <span className="text-xs text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-full">{total}</span>
          </div>
          <button onClick={() => setExpandedColumn(null)} className={`text-xs font-semibold ${s.viewAll} hover:underline`}>View Less</button>
        </div>
        {isLoading ? <div className="h-32 bg-gray-100 rounded-xl animate-pulse" /> : <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {rows.map((c, i) => (
              <CandidateColumn key={`${col.title}-${i}`} title={col.title} count={1} accentColor={col.accentColor} candidates={[c]} actionType={col.actionType} leftTags={[col.leftTags?.[i % (col.leftTags?.length ?? 1)] ?? '']} rightTags={[col.rightTags?.[i % (col.rightTags?.length ?? 1)] ?? '']} hideHeader hideViewAll />
            ))}
          </div>
          <PaginationFooter totalItems={total} page={pages[colIdx]} perPage={PAGE_LIMIT} onPageChange={(p) => setPage(colIdx, p)} itemLabel="candidates" />
        </>}
      </div>
    );
  }
  return (
    <>
      {(activeKpi === 'candidatesPool' || activeKpi === 'none') && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
            {COLUMNS.map((col, i) => {
              const { cards, total, isLoading } = filteredColData[i];
              return (
                <CandidateColumn
                  key={col.title}
                  title={col.title}
                  count={total}
                  accentColor={col.accentColor}
                  candidates={cards}
                  actionType={col.actionType}
                  leftTags={col.leftTags}
                  rightTags={col.rightTags}
                  isLoading={isLoading}
                  onViewAll={() => { setActivePaginatedCol(i); if (activeKpi === 'none') setActiveKpi('candidatesPool'); setExpandedColumn(col.title); }}
                />
              );
            })}
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-1.5">
              {COLUMNS.map((col, i) => (
                <button key={col.title} onClick={() => setActivePaginatedCol(i)} className={`text-xs px-3 py-1 rounded-full border transition-colors ${activePaginatedCol === i ? 'bg-orange-50 border-orange-300 text-[#F4781B] font-semibold' : 'border-gray-200 text-gray-400 hover:text-gray-600'}`}>{col.title}</button>
              ))}
            </div>
            <PaginationFooter totalItems={filteredColData[activePaginatedCol].total} page={pages[activePaginatedCol]} perPage={PAGE_LIMIT} onPageChange={(p) => setPage(activePaginatedCol, p)} itemLabel="candidates" />
          </div>
        </div>
      )}
    </>
  );
}

function CandidatesBoard({ triggerAddModal, onAddModalConsumed }: { triggerAddModal?: boolean; onAddModalConsumed?: () => void }) {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [activeKpi, setActiveKpi] = useState<KpiView>('none');
  const [expandedColumn, setExpandedColumn] = useState<string | null>(null);
  const [activeListTab, setActiveListTab] = useState(0);
  const [openInHouseModal, setOpenInHouseModal] = useState(false);
  const { summary, isLoading } = useCandidateSummary();
  useEffect(() => {
    if (triggerAddModal) {
      setActiveKpi('inHouse');
      setOpenInHouseModal(true);
      onAddModalConsumed?.();
    }
  }, [triggerAddModal, onAddModalConsumed]);
  const hiredCount = summary?.UNIQUE_HIRED_CANDIDATES != null ? String(summary.UNIQUE_HIRED_CANDIDATES) : '—';
  const inHouseCount = summary?.IN_HOUSE_CANDIDATES != null ? String(summary.IN_HOUSE_CANDIDATES) : '—';
  const activeCount = summary?.ACTIVE_HIRED_CANDIDATES != null ? String(summary.ACTIVE_HIRED_CANDIDATES) : '—';
  const poolCount = summary?.AVAILABLE_CANDIDATES_WITHIN_30KM != null ? String(summary.AVAILABLE_CANDIDATES_WITHIN_30KM) : '—';
  const toggleKpi = (kpi: KpiView) => {
    setActiveKpi((prev) => (prev === kpi ? 'none' : kpi));
    setExpandedColumn(null);
  };
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
        <MetricCard icon={<BriefcaseBusiness size={18} />} title="Hired Candidates" value={isLoading ? '...' : hiredCount} change="-0.10%" isPositive={false} onClick={() => toggleKpi('hired')} isActive={activeKpi === 'hired'} />
        <MetricCard icon={<Users size={18} />} title="In-House Candidates" value={isLoading ? '...' : inHouseCount} change="+1.10%" isPositive onClick={() => toggleKpi('inHouse')} isActive={activeKpi === 'inHouse'} />
        <MetricCard icon={<UserCheck size={18} />} title="Active Candidates" value={isLoading ? '...' : activeCount} change="+1.10%" isPositive onClick={() => toggleKpi('active')} isActive={activeKpi === 'active'} />
        <MetricCard icon={<Layers size={18} />} title="Candidates Pool" value={isLoading ? '...' : poolCount} change="+2.10%" isPositive={false} onClick={() => toggleKpi('candidatesPool')} isActive={activeKpi === 'candidatesPool'} />
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-4">
        {(activeKpi === 'none' || activeKpi === 'candidatesPool') && (
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
              <Search size={16} className="text-gray-400 shrink-0" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Advance Candidate Search" className="w-full text-sm text-gray-700 outline-none bg-transparent placeholder:text-gray-400" />
            </div>
            <MainViewHeader view={view} setView={setView} />
          </div>
        )}
        {(activeKpi === 'none' || activeKpi === 'candidatesPool') && (
          <CandidatesPoolSection
            view={view}
            search={search}
            activeListTab={activeListTab}
            setActiveListTab={setActiveListTab}
            expandedColumn={expandedColumn}
            setExpandedColumn={setExpandedColumn}
            activeKpi={activeKpi}
            setActiveKpi={setActiveKpi}
          />
        )}
        {activeKpi === 'hired' && <HiredCandidatesSection />}
        {activeKpi === 'inHouse' && <InHouseCandidatesSection openModalOnMount={openInHouseModal} onModalMounted={() => setOpenInHouseModal(false)} />}
        {activeKpi === 'active' && <ActiveCandidatesSection />}
      </div>
    </div>
  );
}

export default function CandidatesPage() {
  const [triggerAddModal, setTriggerAddModal] = useState(false);
  return (
    <AppLayout padding="sm">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
        <button onClick={() => setTriggerAddModal(true)} className="flex items-center gap-2 bg-[#F4781B] hover:bg-[#e06a10] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">
          + Add My In-House Staff
        </button>
      </div>
      <CandidatesBoard triggerAddModal={triggerAddModal} onAddModalConsumed={() => setTriggerAddModal(false)} />
    </AppLayout>
  );
}