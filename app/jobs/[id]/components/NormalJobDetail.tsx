"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutGrid, List, FileText, Users, Filter } from "lucide-react";
import type { JobBackendResponse } from "@/Interface/job.types";
import { JobDescriptionModal, useJobDescriptionModal } from "./JobDescriptionModal";
import { EditInterviewQuestionsModal } from "./EditInterviewQuestionsModal";
import ScoreCard from "@/components/card/scorecard";
import Image from "next/image";

// ── Types ──────────────────────────────────────────────────────
interface Props {
  job:        JobBackendResponse;
  jobId:      string;
  onCloseJob: () => void;
}

type TabKey = 'applied' | 'shortlisted' | 'ai_interviewing' | 'interviewed' | 'hired';
interface Tab { key: TabKey; label: string; aiOnly?: boolean; }

const TABS: Tab[] = [
  { key: 'applied',         label: 'Applied Candidates'                       },
  { key: 'shortlisted',     label: 'Shortlisted Candidates'                   },
  { key: 'ai_interviewing', label: 'AI-Interviewing Candidates', aiOnly: true },
  { key: 'interviewed',     label: 'Interviewed Candidates'                   },
  { key: 'hired',           label: 'Hired Candidates'                         },
];

const DUMMY_CANDIDATES = [
  { id: '1', name: 'Michael Liam', department: 'Nursing',    role: 'Registered Nurse',         exp: '5 to 7 Years', rating: 4.8, score: 40, distance: '25km', online: true,  avatar: '/icon/card-doctor.svg' },
  { id: '2', name: 'Michael Liam', department: 'Disability', role: 'Licensed Practical Nurse', exp: '5 to 7 Years', rating: 4.8, score: 72, distance: '12km', online: true,  avatar: '/icon/card-doctor.svg' },
  { id: '3', name: 'Michael Liam', department: 'Nursing',    role: 'Licensed Practical Nurse', exp: '5 to 7 Years', rating: 4.8, score: 55, distance: '8km',  online: false, avatar: '/icon/card-doctor.svg' },
  { id: '4', name: 'Sarah Johnson', department: 'Nursing',   role: 'Registered Nurse',         exp: '3 to 5 Years', rating: 4.5, score: 63, distance: '15km', online: true,  avatar: '/icon/card-doctor.svg' },
  { id: '5', name: 'David Kim',    department: 'Disability', role: 'Support Worker',           exp: '2 to 4 Years', rating: 4.2, score: 48, distance: '30km', online: false, avatar: '/icon/card-doctor.svg' },
  { id: '6', name: 'Emma Clarke',  department: 'Nursing',    role: 'Registered Nurse',         exp: '7 to 10 Years',rating: 4.9, score: 88, distance: '5km',  online: true,  avatar: '/icon/card-doctor.svg' },
];

type Candidate = typeof DUMMY_CANDIDATES[0];

// ─────────────────────────────────────────────────────────────────────────────
// ── Main Component ────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
export const NormalJobDetail: React.FC<Props> = ({ job }) => {
  const router = useRouter()
  const modal  = useJobDescriptionModal();
  const hasAI  = job.normalJob?.ai_interview === true;

  const [view,       setView]       = useState<'list' | 'kanban'>('list');
  const [activeTab,  setActiveTab]  = useState<TabKey>('applied');
  const [showQModal, setShowQModal] = useState(false);

  const visibleTabs = TABS.filter(t => !t.aiOnly || hasAI);
  const hasSpecs    = job.normalJob?.specializations && job.normalJob.specializations.length > 0;
  const hasQuals    = job.normalJob?.qualifications  && job.normalJob.qualifications.length  > 0;

  const infoItems = [
    [job.city, job.province].filter(Boolean).join(', ') ? {
      icon: <LocIcon />,
      text: `${[job.city, job.province].filter(Boolean).join(', ')}, Canada`,
    } : null,
    { icon: <MailIcon />,   text: 'noahliamdoc@gmail.com' },
    { icon: <PhoneIcon />,  text: '+1 123 1231 213' },
    { icon: <ClockIcon />,  text: job.job_type ?? 'Part Time' },
    {
      icon: <DollarIcon />,
      node: <span><strong className="text-gray-900 font-bold">${job.pay_range_max ?? job.pay_range_min ?? '—'}</strong>/hr</span>,
      text: null,
    },
  ].filter(Boolean) as { icon: React.ReactNode; text: string | null; node?: React.ReactNode }[];

  const statCards = [
    { label: 'Total Requirements',  value: job.no_of_hires ?? 'N/A',                   sub: 'None Hired',           icon: <LayersIcon /> },
    { label: 'Experience Required', value: job.normalJob?.years_of_experience ?? 'N/A', sub: null,                   icon: <TimerIcon />  },
    { label: 'Job Start Date',      value: 'N/A',                                       sub: 'Starts in 7 Days',     icon: <CalIcon />    },
    { label: 'Job Timings',         value: 'N/A',                                       sub: 'Total 12 Hours Shift', icon: <ClockIcon />  },
  ];

  return (
    <div className="flex flex-col gap-4">

      {/* ── Header Card ───────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 px-6 py-4">

        {/* Breadcrumb + status */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-sm">
            <button onClick={() => router.push('/jobs')} className="p-1 -ml-1 hover:bg-gray-100 rounded">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
              </svg>
            </button>
            <span className="text-gray-700 font-semibold cursor-pointer hover:text-gray-900" onClick={() => router.push('/jobs')}>Jobs</span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-500">Job_id</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-4 py-1.5 rounded-full text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200">Open</span>
            <span className="px-4 py-1.5 rounded-full text-sm font-medium text-green-600 bg-green-50 border border-green-200">Regular</span>
          </div>
        </div>

        {/* Title + action buttons */}
        <div className="flex items-start justify-between gap-4 mb-2.5">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-extrabold text-gray-900">{job.job_title}</h1>
            {job.department && (
              <span className="px-3 py-1 rounded-full text-sm text-gray-600 border border-gray-300 bg-white">
                {job.department} Department
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={modal.open}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 hover:bg-gray-50 whitespace-nowrap"
            >
              <FileText size={15} className="text-gray-500" />
              Job Description
            </button>
            {hasAI && (
              <button
                onClick={() => setShowQModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 hover:bg-gray-50 whitespace-nowrap"
              >
                <Users size={15} className="text-gray-500" />
                Interview Questions
              </button>
            )}
          </div>
        </div>

        {/* Info pipe row */}
        <div className="flex flex-wrap items-center gap-y-1 text-sm text-gray-600 pb-3">
          {infoItems.map((item, i) => (
            <React.Fragment key={i}>
              <span className="flex items-center gap-1.5">{item.icon}{item.node ?? item.text}</span>
              {i < infoItems.length - 1 && <span className="mx-3 text-gray-300">|</span>}
            </React.Fragment>
          ))}
        </div>

        <div className="h-px bg-gray-100 mb-3" />

        {/* Specializations */}
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-sm font-semibold text-[#F4781B]">Required Specialization :</span>
          {hasSpecs
            ? job.normalJob!.specializations!.map((s, i) => (
                <span key={i} className="px-3 py-1 rounded-full text-xs text-gray-700 bg-white border border-gray-200">{String(s)}</span>
              ))
            : <span className="text-sm text-gray-400">N/A</span>}
        </div>

        {/* Qualifications */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-[#F4781B]">Required Qualification :</span>
          {hasQuals
            ? job.normalJob!.qualifications!.map((q, i) => (
                <span key={i} className="px-3 py-1 rounded-full text-xs text-gray-700 bg-white border border-gray-200">{q}</span>
              ))
            : <span className="text-sm text-gray-400">N/A</span>}
        </div>
      </div>

      {/* ── 4 Stat Cards ──────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl px-5 py-4 border border-gray-200 flex flex-col gap-1.5 relative">
            <div className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
              {card.icon}
            </div>
            <p className="text-xs text-gray-500 pr-10">{card.label}</p>
            <p className="text-2xl font-extrabold text-gray-900 leading-tight">{card.value}</p>
            {card.sub && <p className="text-xs text-gray-400">{card.sub}</p>}
          </div>
        ))}
      </div>

      {/* ── Candidates Section ─────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {view === 'list' ? (
          <>
            {/* Tab bar + view toggle */}
            <div className="flex items-center justify-between px-5 pt-4 border-b border-gray-100">
              <div className="flex items-center overflow-x-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
                {visibleTabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
                      ${activeTab === tab.key ? 'border-[#F4781B] text-[#F4781B]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                  >
                    {tab.key === 'ai_interviewing' && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill={activeTab === tab.key ? '#F4781B' : '#9ca3af'}>
                        <path d="M12 2l1.09 3.26L16 6l-2.91.74L12 10l-1.09-3.26L8 6l2.91-.74L12 2zm6 10l.73 2.18L21 15l-2.27.82L18 18l-.73-2.18L15 15l2.27-.82L18 12zm-12 0l.73 2.18L9 15l-2.27.82L6 18l-.73-2.18L3 15l2.27-.82L6 12z"/>
                      </svg>
                    )}
                    {tab.label}
                  </button>
                ))}
              </div>
              <ViewToggle view={view} onChange={setView} />
            </div>

            {/* Table */}
            <div className="p-5">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <CandidatesTable tab={activeTab} candidates={DUMMY_CANDIDATES} />
              </div>
            </div>

            {/* Pagination — bottom of list section */}
            <TablePagination />
          </>
        ) : (
          <>
            {/* Kanban controls row */}
            <div className="flex items-center justify-end gap-2 px-5 pt-4 pb-3 border-b border-gray-100">
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
                <Filter size={14} />
                Filter
              </button>
              <ViewToggle view={view} onChange={setView} />
            </div>

            {/* Kanban body — columns + pagination rendered inside */}
            <KanbanSection hasAI={hasAI} />
          </>
        )}
      </div>

      {/* ── Modals ─────────────────────────────────────────── */}
      <JobDescriptionModal
        isOpen={modal.isOpen}
        onClose={modal.close}
        job={job}
        onUpdate={(desc) => console.log('Saved:', desc)}
      />
      <EditInterviewQuestionsModal
        isOpen={showQModal}
        onClose={() => setShowQModal(false)}
        initialQuestions={
          job.normalJob?.questions
            ? Object.values(job.normalJob.questions as Record<string, { questions: string[] }>)
                .flatMap((t) => t.questions ?? [])
            : []
        }
        onSave={async (qs) => { console.log('Saved questions:', qs); }}
      />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ── View Toggle ───────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
function ViewToggle({ view, onChange }: { view: 'list' | 'kanban'; onChange: (v: 'list' | 'kanban') => void }) {
  return (
    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden flex-shrink-0">
      <button
        onClick={() => onChange('kanban')}
        title="Kanban view"
        className={`p-1.5 transition-colors ${view === 'kanban' ? 'bg-gray-100 text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}
      >
        <LayoutGrid size={16} />
      </button>
      <button
        onClick={() => onChange('list')}
        title="List view"
        className={`p-1.5 transition-colors ${view === 'list' ? 'bg-gray-100 text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}
      >
        <List size={16} />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ── Candidates Table ──────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
function CandidatesTable({ tab, candidates }: { tab: TabKey; candidates: Candidate[] }) {
  if (candidates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <div className="w-20 h-20 opacity-50">
          <svg viewBox="0 0 96 96" fill="none">
            <rect x="20" y="16" width="56" height="68" rx="6" fill="#e5e7eb"/>
            <rect x="32" y="8" width="32" height="16" rx="4" fill="#d1d5db"/>
            <line x1="32" y1="44" x2="64" y2="44" stroke="#9ca3af" strokeWidth="3" strokeLinecap="round"/>
            <line x1="32" y1="56" x2="56" y2="56" stroke="#9ca3af" strokeWidth="3" strokeLinecap="round"/>
          </svg>
        </div>
        <p className="text-sm font-semibold text-gray-700">No Candidates Yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#FEF3E9]">
            {['Candidate Name', 'Department', 'Job Title', 'Experience', 'Rating', 'Actions'].map((h) => (
              <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-600 whitespace-nowrap first:rounded-l-lg last:rounded-r-lg">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {candidates.map((c) => (
            <tr key={c.id} className="border-b border-gray-50 hover:bg-orange-50/20 transition-colors">
              <td className="px-4 py-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-100 overflow-hidden flex-shrink-0">
                    <Image src={c.avatar} alt={c.name} fill className="object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-gray-900">{c.name}</span>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="#22c55e">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                    <span className={`text-xs font-medium ${c.online ? 'text-green-500' : 'text-gray-400'}`}>
                      {c.online ? '● Online' : '○ Offline'}
                    </span>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3.5 text-gray-600">{c.department}</td>
              <td className="px-4 py-3.5 text-gray-600">{c.role}</td>
              <td className="px-4 py-3.5 text-gray-600">{c.exp}</td>
              <td className="px-4 py-3.5">
                <span className="flex items-center gap-1 text-gray-700">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  {c.rating}/5
                </span>
              </td>
              <td className="px-4 py-3.5">
                <TableActionButtons tab={tab} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Table Action Buttons per tab ──────────────────────────────
function TableActionButtons({ tab }: { tab: TabKey }) {
  switch (tab) {
    case 'applied':
      return (
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-700 hover:bg-gray-50 font-medium">Shortlist</button>
          <button className="px-3 py-1.5 rounded-lg bg-[#F4781B] text-white text-xs font-semibold hover:bg-[#e06a10]">Direct Hire</button>
        </div>
      );
    case 'shortlisted':
      return (
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-lg border border-red-300 text-red-500 text-xs hover:bg-red-50 font-medium">Remove</button>
          <button className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-700 hover:bg-gray-50 font-medium">Request Interview</button>
        </div>
      );
    case 'ai_interviewing':
      return (
        <button className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600">Abort Interview</button>
      );
    case 'interviewed':
      return (
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-lg border border-red-300 text-red-500 text-xs hover:bg-red-50 font-medium">Reject</button>
          <button className="px-3 py-1.5 rounded-lg bg-[#F4781B] text-white text-xs font-semibold hover:bg-[#e06a10]">Hire Now</button>
        </div>
      );
    case 'hired':
      return (
        <button className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-[#F4781B] font-semibold hover:bg-orange-50">View Schedule</button>
      );
    default:
      return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ── Table Pagination ──────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
function TablePagination() {
  const [page, setPage] = useState(1);
  const totalPages = 10;
  const total = 26;
  const limit = 10;

  const pages: (number | '...')[] =
    totalPages <= 7
      ? Array.from({ length: totalPages }, (_, i) => i + 1)
      : [1, 2, 3, '...', totalPages - 2, totalPages - 1, totalPages];

  return (
    <div className="bg-[#FEF3E9] px-5 py-3 flex items-center justify-between flex-wrap gap-3">
      <button
        onClick={() => setPage((p) => Math.max(1, p - 1))}
        disabled={page === 1}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        Previous
      </button>

      <div className="flex items-center gap-1">
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`e-${i}`} className="px-2 text-gray-400 text-sm">...</span>
          ) : (
            <button
              key={p}
              onClick={() => setPage(p as number)}
              className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                page === p ? 'bg-[#F4781B] text-white' : 'text-gray-500 hover:bg-white'
              }`}
            >
              {p}
            </button>
          )
        )}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">
          Showing <strong>{(page - 1) * limit + 1}–{Math.min(page * limit, total)}</strong> of <strong>{total}</strong> Candidates
        </span>
        <select className="border border-gray-200 rounded-lg px-2 py-1 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-200">
          <option>10 per page</option>
          <option>25 per page</option>
          <option>50 per page</option>
        </select>
      </div>

      <button
        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        disabled={page === totalPages}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Next
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ── Kanban Section (columns + bottom pagination) ──────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
const KANBAN_COLS = [
  { key: 'applied',         label: 'Applied',         count: 40, dotColor: 'bg-blue-500',         border: 'border-blue-200',         bg: 'bg-blue-50/50',         textColor: 'text-blue-600',         aiOnly: false },
  { key: 'shortlisted',     label: 'Shortlisted',     count: 20, dotColor: 'bg-orange-400',       border: 'border-orange-200',       bg: 'bg-orange-50/50',       textColor: 'text-orange-500',       aiOnly: false },
  { key: 'ai_interviewing', label: 'AI-Interviewing', count: 5,  dotColor: 'bg-red-400',          border: 'border-red-200',          bg: 'bg-red-50/40',          textColor: 'text-red-500',          aiOnly: true  },
  { key: 'interviewed',     label: 'Interviewed',     count: 6,  dotColor: 'bg-amber-700',        border: 'border-amber-200',        bg: 'bg-amber-50/40',        textColor: 'text-amber-800',        aiOnly: false },
  { key: 'hired',           label: 'Hired',           count: 2,  dotColor: 'bg-green-500',        border: 'border-green-200',        bg: 'bg-green-50/50',        textColor: 'text-green-600',        aiOnly: false },
] as const;

function KanbanSection({ hasAI }: { hasAI: boolean }) {
  const [expanded,  setExpanded]  = useState<string | null>(null);
  const [kanbanPage, setKanbanPage] = useState(1);
  const visibleCols = KANBAN_COLS.filter(c => !c.aiOnly || hasAI);
  const totalKanbanPages = 5;

  const kanbanPages: (number | '...')[] =
    totalKanbanPages <= 7
      ? Array.from({ length: totalKanbanPages }, (_, i) => i + 1)
      : [1, 2, 3, '...', totalKanbanPages];

  return (
    <div className="flex flex-col">
      {/* Scrollable columns area */}
      <div className="px-4 pt-3 pb-2 overflow-x-auto">
        <div className="flex gap-4 min-w-max">
          {visibleCols.map((col) => {
            const isExpanded = expanded === col.key;
            // When expanded: show 6 cards in a 3-col grid inside the same column width
            // When collapsed: show 3 cards stacked
            const shownCandidates = DUMMY_CANDIDATES.slice(0, isExpanded ? 6 : 3);

            return (
              <div
                key={col.key}
                className={`rounded-2xl border-2 p-3 flex flex-col gap-3 transition-all duration-300
                  ${col.border} ${col.bg}
                  ${isExpanded ? 'w-[1200px]' : 'w-[420px]'}`}
              >
                {/* Column header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {col.key === 'ai_interviewing' ? (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="#ef4444">
                        <path d="M12 2l1.09 3.26L16 6l-2.91.74L12 10l-1.09-3.26L8 6l2.91-.74L12 2zm6 10l.73 2.18L21 15l-2.27.82L18 18l-.73-2.18L15 15l2.27-.82L18 12zm-12 0l.73 2.18L9 15l-2.27.82L6 18l-.73-2.18L3 15l2.27-.82L6 12z"/>
                      </svg>
                    ) : (
                      <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
                    )}
                    <span className={`text-sm font-bold ${col.textColor}`}>{col.label}</span>
                    <span className="text-sm text-gray-400 font-medium">{col.count}</span>
                  </div>
                  <button
                    onClick={() => setExpanded(isExpanded ? null : col.key)}
                    className={`text-xs font-semibold ${col.textColor} hover:underline`}
                  >
                    {isExpanded ? 'View Less' : 'View all'}
                  </button>
                </div>

                {/* Cards — 3-col grid when expanded, single col when collapsed */}
                <div className={`grid gap-3 ${isExpanded ? 'grid-cols-3' : 'grid-cols-1'}`}>
                  {shownCandidates.map((c) => (
                    <KanbanCard key={c.id} candidate={c} colKey={col.key as TabKey} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination — bottom of entire kanban section, outside columns */}
      <div className="bg-[#FEF3E9] px-5 py-3 flex items-center justify-between flex-wrap gap-3 mt-2">
        <button
          onClick={() => setKanbanPage((p) => Math.max(1, p - 1))}
          disabled={kanbanPage === 1}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          Previous
        </button>

        <div className="flex items-center gap-1">
          {kanbanPages.map((p, i) =>
            p === '...' ? (
              <span key={`ke-${i}`} className="px-2 text-gray-400 text-sm">...</span>
            ) : (
              <button
                key={p}
                onClick={() => setKanbanPage(p as number)}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                  kanbanPage === p ? 'bg-[#F4781B] text-white' : 'text-gray-500 hover:bg-white'
                }`}
              >
                {p}
              </button>
            )
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            Showing <strong>{(kanbanPage - 1) * 10 + 1}–{Math.min(kanbanPage * 10, 73)}</strong> of <strong>73</strong> Candidates
          </span>
          <select className="border border-gray-200 rounded-lg px-2 py-1 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-200">
            <option>10 per page</option>
            <option>25 per page</option>
          </select>
        </div>

        <button
          onClick={() => setKanbanPage((p) => Math.min(totalKanbanPages, p + 1))}
          disabled={kanbanPage === totalKanbanPages}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </div>
  );
}
function KanbanActionButtons({ tab }: { tab: TabKey }) {
  switch (tab) {
    case 'applied':
      return (
        <div className="flex gap-2">
          <button className="flex-1 py-2 rounded-xl border border-gray-200 text-xs text-gray-700 hover:bg-gray-50 font-medium">Shortlist</button>
          <button className="flex-1 py-2 rounded-xl bg-[#F4781B] text-white text-xs font-semibold hover:bg-[#e06a10]">Direct Hire</button>
        </div>
      );
    case 'shortlisted':
      return (
        <div className="flex gap-2">
          <button className="flex-1 py-2 rounded-xl border border-red-300 text-red-500 text-xs hover:bg-red-50 font-medium">Remove</button>
          <button className="flex-1 py-2 rounded-xl border border-gray-200 text-xs text-gray-700 hover:bg-gray-50 font-medium">Request Interview</button>
        </div>
      );
    case 'ai_interviewing':
      return (
        <button className="w-full py-2 rounded-xl bg-red-500 text-white text-xs font-semibold hover:bg-red-600">Abort Interview</button>
      );
    case 'interviewed':
      return (
        <div className="flex gap-2">
          <button className="flex-1 py-2 rounded-xl border border-red-300 text-red-500 text-xs hover:bg-red-50 font-medium">Reject</button>
          <button className="flex-1 py-2 rounded-xl bg-[#F4781B] text-white text-xs font-semibold hover:bg-[#e06a10]">Hire Now</button>
        </div>
      );
    case 'hired':
      return (
        <button className="w-full py-2 rounded-xl border border-gray-200 text-xs text-[#F4781B] font-semibold hover:bg-orange-50">View Schedule</button>
      );
    default:
      return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ── Kanban Card ───────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
function KanbanCard({ candidate: c, colKey }: { candidate: Candidate; colKey: TabKey }) {
  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 p-3 flex flex-col gap-2.5"
      style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}
    >
      {/* Row 1: Online badge + ScoreCard */}
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
          <span className={`w-1.5 h-1.5 rounded-full ${c.online ? 'bg-green-500' : 'bg-gray-400'}`} />
          {c.online ? 'Online' : 'Offline'}
        </span>
        <ScoreCard score={c.score} maxScore={100} category="good" />
      </div>

      {/* Row 2: Avatar + Name + Role */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-orange-50 flex-shrink-0 overflow-hidden border border-orange-100">
          <Image src={c.avatar} alt={c.name} fill className="object-cover" />
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold text-gray-900 leading-tight">{c.name}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#22c55e">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <span className="text-xs font-medium text-[#F4781B]">{c.role}</span>
          {/* ✅ Stats moved here — sits directly under role, no awkward gap */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
            <span className="flex items-center gap-0.5">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
              {c.exp}
            </span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-0.5">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              {c.distance}
            </span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-0.5">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="#fbbf24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              {c.rating}/5
            </span>
          </div>
        </div>
      </div>

      {/* Row 3: Action buttons — full width, equal split */}
      <KanbanActionButtons tab={colKey} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ── Inline SVG Icon Helpers ───────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
function LocIcon()    { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#F4781B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>; }
function MailIcon()   { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#F4781B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>; }
function PhoneIcon()  { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#F4781B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.17h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>; }
function ClockIcon()  { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#F4781B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }
function DollarIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#F4781B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>; }
function LayersIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F4781B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>; }
function TimerIcon()  { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F4781B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }
function CalIcon()    { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F4781B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>; }