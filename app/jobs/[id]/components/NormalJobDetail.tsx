"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutGrid, List, FileText, Users, Filter } from "lucide-react";
import type { JobBackendResponse } from "@/Interface/job.types";
import { JobDescriptionModal, useJobDescriptionModal } from "./JobDescriptionModal";
import { EditInterviewQuestionsModal } from "./EditInterviewQuestionsModal";
import ScoreCard from "@/components/card/scorecard";
import Image from "next/image";
import { useCandidatesList } from "@/hooks/useCandidate";
import type { CandidateListItem } from "@/stores/api/recruiter-job-api";
import {
  convertJobTypeToFrontend,
  convertProvinceToFrontend,
  convertSpecializationToFrontend,
  convertQualificationToFrontend,
  convertExperienceToFrontend,
  provinces,
} from "@/utils/constant/metadata";

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

// ── Map CandidateListItem → display shape ──────────────────────
interface Candidate {
  id:         string;
  name:       string;
  department: string;
  role:       string;
  exp:        string;
  rating:     number;
  score:      number;
  distance:   string;
  online:     boolean;
  avatar:     string;
}

function toCandidate(c: CandidateListItem): Candidate {
  const specialty = c.specialty?.[0]
    ?.replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase())
    ?? c.medical_industry?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    ?? "Healthcare Professional";

  return {
    id:         c.id,
    name:       c.full_name || `${c.first_name} ${c.last_name ?? ""}`.trim(),
    department: c.medical_industry?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) ?? "—",
    role:       specialty,
    exp:        "—",
    rating:     Number(c.completion_percentage ?? 0) / 20,
    score:      c.highest_job_interview_score ?? c.highest_interview_score ?? 0,
    distance:   [c.city, c.state].filter(Boolean).join(", ") || "N/A",
    online:     false,
    avatar:     c.profile_image_url ?? "/icon/card-doctor.svg",
  };
}

// ── Date/time helpers ──────────────────────────────────────────
function formatTime(t?: string | null) {
  if (!t) return null;
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'pm' : 'am'}`;
}
function calcShiftHours(ci?: string | null, co?: string | null) {
  if (!ci || !co) return '';
  const [ih, im] = ci.split(':').map(Number);
  const [oh, om] = co.split(':').map(Number);
  let mins = oh * 60 + om - (ih * 60 + im);
  if (mins < 0) mins += 1440;
  const h = Math.floor(mins / 60), r = mins % 60;
  return r > 0 ? `Total ${h}h ${r}m Shift` : `Total ${h} Hours Shift`;
}
function formatJobDate(d?: string | null) {
  if (!d) return 'N/A';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}
function getCountdown(dateStr?: string | null) {
  if (!dateStr) return '';
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) return 'Already Started';
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `Starts in ${days} Day${days > 1 ? 's' : ''}`;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `Starts in ${h}:${String(m).padStart(2, '0')}:00 hrs`;
}

// ─────────────────────────────────────────────────────────────────────────────
// ── Main Component ────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
export const NormalJobDetail: React.FC<Props> = ({ job, jobId, onCloseJob }) => {
  const router  = useRouter();
  const modal   = useJobDescriptionModal();
  const hasAI   = job.normalJob?.ai_interview === true;

  const [view,        setView]        = useState<'list' | 'kanban'>('list');
  const [activeTab,   setActiveTab]   = useState<TabKey>('applied');
  const [showQModal,  setShowQModal]  = useState(false);
  const [page,        setPage]        = useState(1);
  const [limit,       setLimit]       = useState(10);

  const { data, isLoading } = useCandidatesList({
    page,
    limit,
    job_id: jobId,
    ...(activeTab !== 'applied' && { candidate_status: activeTab }),
  });

  const candidates  = (data?.candidates ?? []).map(toCandidate);
  const totalCount  = data?.pagination?.total ?? 0;
  const totalPages  = Math.max(1, Math.ceil(totalCount / limit));

  const visibleTabs = TABS.filter(t => !t.aiOnly || hasAI);
  const hasSpecs    = job.normalJob?.specializations && job.normalJob.specializations.length > 0;
  const hasQuals    = job.normalJob?.qualifications  && job.normalJob.qualifications.length  > 0;

  // ── Province → display label ─────────────────────────────────
  const provinceSnake = convertProvinceToFrontend(job.province);
  const provinceLabel = provinces.find(p => p.value === provinceSnake)?.label
    ?? job.province ?? '';
  const location = [job.city, provinceLabel].filter(Boolean).join(', ');

  // ── Info row ─────────────────────────────────────────────────
  const infoItems = [
    location ? {
      icon: <LocIcon />,
      text: `${location}, Canada`,
    } : null,
    {
      icon: <ClockIcon />,
      text: convertJobTypeToFrontend(job.job_type),
    },
    {
      icon: <DollarIcon />,
      node: (
        <span>
          <strong className="text-gray-900 font-bold">
            ${job.pay_per_hour_cents ? (job.pay_per_hour_cents / 100).toFixed(2) : '—'}
          </strong>/hr
        </span>
      ),
      text: null,
    },
  ].filter(Boolean) as { icon: React.ReactNode; text: string | null; node?: React.ReactNode }[];

  // ── Stat cards ───────────────────────────────────────────────
  const normalJob = job.normalJob;
  const startDate = job.start_date     ?? null;
const checkIn   = job.check_in_time  ?? null;
const checkOut  = job.check_out_time ?? null;
const statCards = [
    {
      label: 'Total Requirements',
      value: job.no_of_hires_required ?? 'N/A',
      sub:   totalCount > 0 ? `${totalCount} Candidates Applied` : 'None Applied',
      icon:  <LayersIcon />,
    },
    {
      label: 'Experience Required',
      value: convertExperienceToFrontend(normalJob?.years_of_experience) || 'N/A',
      sub:   null,
      icon:  <TimerIcon />,
    },
    {
      label: 'Job Start Date',
      value: formatJobDate(startDate),
      sub:   getCountdown(startDate),
      icon:  <CalIcon />,
    },
    {
      label: 'Job Timings',
      value: checkIn && checkOut
        ? `${formatTime(checkIn)} to ${formatTime(checkOut)}`
        : 'N/A',
      sub:   calcShiftHours(checkIn, checkOut) || null,
      icon:  <ClockIcon />,
    },
  ];

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-4">

      {/* ── Header Card ── */}
      <div className="bg-white rounded-2xl border border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-sm">
            <button onClick={() => router.push('/jobs')} className="p-1 -ml-1 hover:bg-gray-100 rounded">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
              </svg>
            </button>
            <span className="text-gray-700 font-semibold cursor-pointer hover:text-gray-900" onClick={() => router.push('/jobs')}>Jobs</span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-500">{jobId}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-4 py-1.5 rounded-full text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200">
              {job.status.charAt(0) + job.status.slice(1).toLowerCase()}
            </span>
            <span className="px-4 py-1.5 rounded-full text-sm font-medium text-green-600 bg-green-50 border border-green-200">Regular</span>
          </div>
        </div>

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

        <div className="flex flex-wrap items-center gap-y-1 text-sm text-gray-600 pb-3">
          {infoItems.map((item, i) => (
            <React.Fragment key={i}>
              <span className="flex items-center gap-1.5">{item.icon}{item.node ?? item.text}</span>
              {i < infoItems.length - 1 && <span className="mx-3 text-gray-300">|</span>}
            </React.Fragment>
          ))}
        </div>

        <div className="h-px bg-gray-100 mb-3" />

        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-sm font-semibold text-[#F4781B]">Required Specialization :</span>
          {hasSpecs
            ? job.normalJob!.specializations!.map((s, i) => (
                <span key={i} className="px-3 py-1 rounded-full text-xs text-gray-700 bg-white border border-gray-200">
                  {convertSpecializationToFrontend(String(s))}
                </span>
              ))
            : <span className="text-sm text-gray-400">N/A</span>}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-[#F4781B]">Required Qualification :</span>
          {hasQuals
            ? job.normalJob!.qualifications!.map((q, i) => (
                <span key={i} className="px-3 py-1 rounded-full text-xs text-gray-700 bg-white border border-gray-200">
                  {convertQualificationToFrontend(q)}
                </span>
              ))
            : <span className="text-sm text-gray-400">N/A</span>}
        </div>
      </div>

      {/* ── 4 Stat Cards ── */}
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

      {/* ── Candidates Section ── */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {view === 'list' ? (
          <>
            <div className="flex items-center justify-between px-5 pt-4 border-b border-gray-100">
              <div className="flex items-center overflow-x-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
                {visibleTabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => handleTabChange(tab.key)}
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

            <div className="p-5">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <CandidatesTable
                  tab={activeTab}
                  candidates={candidates}
                  isLoading={isLoading}
                />
              </div>
            </div>

            <TablePagination
              page={page}
              totalPages={totalPages}
              total={totalCount}
              limit={limit}
              onPageChange={setPage}
              onLimitChange={(l) => { setLimit(l); setPage(1); }}
            />
          </>
        ) : (
          <>
            <div className="flex items-center justify-end gap-2 px-5 pt-4 pb-3 border-b border-gray-100">
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
                <Filter size={14} />
                Filter
              </button>
              <ViewToggle view={view} onChange={setView} />
            </div>
            <KanbanSection hasAI={hasAI} jobId={jobId} />
          </>
        )}
      </div>

      {/* ── Bottom Actions ── */}
      <div className="flex items-center justify-end gap-3 pb-4">
        <button onClick={onCloseJob} className="px-6 py-2 border border-red-500 text-red-500 rounded-lg text-sm hover:bg-red-50 font-medium">
          Close This Job
        </button>
        <button onClick={() => router.push(`/jobs/edit/${jobId}`)} className="px-6 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 font-medium">
          Edit Job
        </button>
      </div>

      {/* ── Modals ── */}
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
      <button onClick={() => onChange('kanban')} title="Kanban view"
        className={`p-1.5 transition-colors ${view === 'kanban' ? 'bg-gray-100 text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}>
        <LayoutGrid size={16} />
      </button>
      <button onClick={() => onChange('list')} title="List view"
        className={`p-1.5 transition-colors ${view === 'list' ? 'bg-gray-100 text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}>
        <List size={16} />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ── Candidates Table ──────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
function CandidatesTable({
  tab, candidates, isLoading
}: { tab: TabKey; candidates: Candidate[]; isLoading: boolean }) {

  if (isLoading) {
    return (
      <div className="p-4 flex flex-col gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

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
        <p className="text-xs text-gray-400">No candidates in this stage</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#FEF3E9]">
            {['Candidate Name', 'Department', 'Job Title', 'Experience', 'Rating', 'Actions'].map((h) => (
              <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-600 whitespace-nowrap first:rounded-l-lg last:rounded-r-lg">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {candidates.map((c) => (
            <tr key={c.id} className="border-b border-gray-50 hover:bg-orange-50/20 transition-colors">
              <td className="px-4 py-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="relative w-9 h-9 rounded-xl bg-orange-50 border border-orange-100 overflow-hidden flex-shrink-0">
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
                  {c.rating.toFixed(1)}/5
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
      return <button className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600">Abort Interview</button>;
    case 'interviewed':
      return (
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-lg border border-red-300 text-red-500 text-xs hover:bg-red-50 font-medium">Reject</button>
          <button className="px-3 py-1.5 rounded-lg bg-[#F4781B] text-white text-xs font-semibold hover:bg-[#e06a10]">Hire Now</button>
        </div>
      );
    case 'hired':
      return <button className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-[#F4781B] font-semibold hover:bg-orange-50">View Schedule</button>;
    default: return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ── Table Pagination ──────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
function TablePagination({
  page, totalPages, total, limit, onPageChange, onLimitChange,
}: {
  page:          number;
  totalPages:    number;
  total:         number;
  limit:         number;
  onPageChange:  (p: number) => void;
  onLimitChange: (l: number) => void;
}) {
  const pages: (number | '...')[] =
    totalPages <= 7
      ? Array.from({ length: totalPages }, (_, i) => i + 1)
      : [1, 2, 3, '...', totalPages - 2, totalPages - 1, totalPages];

  return (
    <div className="bg-[#FEF3E9] px-5 py-3 flex items-center justify-between flex-wrap gap-3">
      <button onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        Previous
      </button>

      <div className="flex items-center gap-1">
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`e-${i}`} className="px-2 text-gray-400 text-sm">...</span>
          ) : (
            <button key={p} onClick={() => onPageChange(p as number)}
              className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${page === p ? 'bg-[#F4781B] text-white' : 'text-gray-500 hover:bg-white'}`}>
              {p}
            </button>
          )
        )}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">
          Showing <strong>{Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)}</strong> of <strong>{total}</strong> Candidates
        </span>
        <select
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          className="border border-gray-200 rounded-lg px-2 py-1 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-200"
        >
          <option value={10}>10 per page</option>
          <option value={25}>25 per page</option>
          <option value={50}>50 per page</option>
        </select>
      </div>

      <button onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page === totalPages}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed">
        Next
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ── Kanban Section ────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
const KANBAN_COLS = [
  { key: 'applied',         label: 'Applied',         dotColor: 'bg-blue-500',   border: 'border-blue-200',   bg: 'bg-blue-50/50',   textColor: 'text-blue-600',  aiOnly: false },
  { key: 'shortlisted',     label: 'Shortlisted',     dotColor: 'bg-orange-400', border: 'border-orange-200', bg: 'bg-orange-50/50', textColor: 'text-[#F4781B]', aiOnly: false },
  { key: 'ai_interviewing', label: 'AI-Interviewing', dotColor: 'bg-red-400',    border: 'border-red-200',    bg: 'bg-red-50/40',    textColor: 'text-red-500',   aiOnly: true  },
  { key: 'interviewed',     label: 'Interviewed',     dotColor: 'bg-amber-700',  border: 'border-amber-200',  bg: 'bg-amber-50/40',  textColor: 'text-amber-800', aiOnly: false },
  { key: 'hired',           label: 'Hired',           dotColor: 'bg-green-500',  border: 'border-green-200',  bg: 'bg-green-50/50',  textColor: 'text-green-600', aiOnly: false },
] as const;

function KanbanSection({ hasAI, jobId }: { hasAI: boolean; jobId: string }) {
  const [expanded,    setExpanded]    = useState<string | null>(null);
  const [kanbanPage,  setKanbanPage]  = useState(1);
  const [kanbanLimit, setKanbanLimit] = useState(10);

  const visibleCols = KANBAN_COLS.filter(c => !c.aiOnly || hasAI);

  const { data, isLoading } = useCandidatesList({
    page:   kanbanPage,
    limit:  kanbanLimit,
    job_id: jobId,
  });

  const totalCount       = data?.pagination?.total ?? 0;
  const totalKanbanPages = Math.max(1, Math.ceil(totalCount / kanbanLimit));
  const candidates       = (data?.candidates ?? []).map(toCandidate);

  return (
    <div className="flex flex-col">
      <div className="px-4 pt-2 pb-2 overflow-x-auto">
        <div className="flex gap-4 min-w-max">
          {visibleCols.map((col) => {
            const isExpanded = expanded === col.key;
            const shown = isLoading ? [] : candidates.slice(0, isExpanded ? 6 : 3);

            return (
              <div key={col.key}
                className={`rounded-2xl border-2 p-3 flex flex-col gap-3 transition-all duration-300 ${col.border} ${col.bg} ${isExpanded ? 'w-[1200px]' : 'w-[420px]'}`}>
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
                    <span className="text-sm text-gray-400 font-medium">
                      {col.key === 'applied' && !isLoading ? totalCount : '—'}
                    </span>
                  </div>
                  <button
                    onClick={() => setExpanded(isExpanded ? null : col.key)}
                    className={`text-xs font-semibold ${col.textColor} hover:underline`}
                  >
                    {isExpanded ? 'View Less' : 'View all'}
                  </button>
                </div>

                {isLoading ? (
                  <div className="flex flex-col gap-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-24 bg-white/60 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className={`grid gap-3 ${isExpanded ? 'grid-cols-3' : 'grid-cols-1'}`}>
                    {shown.map((c) => (
                      <KanbanCard key={c.id} candidate={c} colKey={col.key as TabKey} />
                    ))}
                    {shown.length === 0 && (
                      <p className="text-xs text-center text-gray-400 py-4">No candidates</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-[#FEF3E9] px-5 py-3 flex items-center justify-between flex-wrap gap-3 mt-2">
        <button onClick={() => setKanbanPage((p) => Math.max(1, p - 1))} disabled={kanbanPage === 1}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          Previous
        </button>

        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(totalKanbanPages, 5) }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setKanbanPage(p)}
              className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${kanbanPage === p ? 'bg-[#F4781B] text-white' : 'text-gray-500 hover:bg-white'}`}>
              {p}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            Showing <strong>{Math.min((kanbanPage - 1) * kanbanLimit + 1, totalCount)}–{Math.min(kanbanPage * kanbanLimit, totalCount)}</strong> of <strong>{totalCount}</strong> Candidates
          </span>
          <select value={kanbanLimit} onChange={(e) => { setKanbanLimit(Number(e.target.value)); setKanbanPage(1); }}
            className="border border-gray-200 rounded-lg px-2 py-1 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-200">
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
          </select>
        </div>

        <button onClick={() => setKanbanPage((p) => Math.min(totalKanbanPages, p + 1))} disabled={kanbanPage === totalKanbanPages}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed">
          Next
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ── Kanban Card ───────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
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
      return <button className="w-full py-2 rounded-xl bg-red-500 text-white text-xs font-semibold hover:bg-red-600">Abort Interview</button>;
    case 'interviewed':
      return (
        <div className="flex gap-2">
          <button className="flex-1 py-2 rounded-xl border border-red-300 text-red-500 text-xs hover:bg-red-50 font-medium">Reject</button>
          <button className="flex-1 py-2 rounded-xl bg-[#F4781B] text-white text-xs font-semibold hover:bg-[#e06a10]">Hire Now</button>
        </div>
      );
    case 'hired':
      return <button className="w-full py-2 rounded-xl border border-gray-200 text-xs text-[#F4781B] font-semibold hover:bg-orange-50">View Schedule</button>;
    default: return null;
  }
}

function KanbanCard({ candidate: c, colKey }: { candidate: Candidate; colKey: TabKey }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 px-4 pb-2 flex flex-col gap-1 p-2"
      style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
      <div className="flex items-center justify-between -mt-1">
        <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-1 py-px rounded-full border border-green-200 -mt-1">
          <span className={`w-1.5 h-1.5 rounded-full ${c.online ? 'bg-green-500' : 'bg-gray-400'}`} />
          {c.online ? 'Online' : 'Offline'}
        </span>
        <ScoreCard score={c.score} maxScore={100} category="good" />
      </div>

      <div className="flex items-center gap-3 -mt-3">
        <div className="relative w-12 h-12 rounded-xl bg-orange-50 flex-shrink-0 overflow-hidden border border-orange-100">
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
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
            <span className="flex items-center gap-0.5">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
              {c.exp}
            </span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-0.5">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {c.distance}
            </span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-0.5">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="#fbbf24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              {c.rating.toFixed(1)}/5
            </span>
          </div>
        </div>
      </div>

      <KanbanActionButtons tab={colKey} />
    </div>
  );
}

// ── Inline SVG Icon Helpers ──────────────────────────────────────────────────
function LocIcon()    { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#F4781B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>; }
function ClockIcon()  { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#F4781B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }
function DollarIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#F4781B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>; }
function LayersIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F4781B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>; }
function TimerIcon()  { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F4781B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }
function CalIcon()    { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F4781B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>; }