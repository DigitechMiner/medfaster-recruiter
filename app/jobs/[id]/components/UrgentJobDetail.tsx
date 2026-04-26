"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutGrid, List, FileText } from "lucide-react";
import type { JobBackendResponse } from "@/Interface/job.types";
import { CandidatesGridView } from "./CandidatesGridView";
import { CandidatesListView } from "./CandidatesListView";
import { JobDescriptionModal, useJobDescriptionModal } from "./JobDescriptionModal";
import { convertSpecializationToFrontend, convertQualificationToFrontend } from "@/utils/constant/metadata";

interface Props {
  job:        JobBackendResponse;
  jobId:      string;
  onCloseJob: () => void;
}

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

function formatShiftDate(d?: string | null) {
  if (!d) return 'N/A';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function getCountdown(dateStr?: string | null) {
  if (!dateStr) return '';
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) return 'Started';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `Starts in ${h}:${String(m).padStart(2, '0')}:00 hrs`;
}

export const UrgentJobDetail: React.FC<Props> = ({ job, jobId, onCloseJob }) => {
  const modal  = useJobDescriptionModal();
  const router = useRouter();
  const instant = job.instantJob;
  const [view, setView] = useState<'grid' | 'list'>('grid');

  // ── Stat Cards — all shift fields from job root ─────────────
  const statCards = [
    {
      label: 'Total Requirements',
      value: job.no_of_hires_required ?? 'N/A',
      sub:   `${job.no_of_hires_hired ?? 0} Hired`,
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F4781B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
    },
    {
      label: 'Experience Required',
      value: job.normalJob?.years_of_experience ?? 'N/A',
      sub:   null,
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F4781B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    },
    {
      label: 'Shift Start Date',
      value: formatShiftDate(job.start_date),       // ← job root
      sub:   getCountdown(job.start_date),           // ← job root
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F4781B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    },
    {
      label: 'Shift Timings',
      value: job.check_in_time && job.check_out_time  // ← job root
        ? `${formatTime(job.check_in_time)} to ${formatTime(job.check_out_time)}`
        : 'N/A',
      sub: calcShiftHours(job.check_in_time, job.check_out_time),
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F4781B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    },
  ];

  // ── Info row — real data only, no hardcoded values ──────────
  const infoItems = [
    [job.city, job.province].filter(Boolean).length > 0 && {
      icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#F4781B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
      text: `${[job.city, job.province].filter(Boolean).join(', ')}, Canada`,
    },
    // neighborhood from instantJob
    instant?.neighborhood_name && {
      icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#F4781B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
      text: instant.neighborhood_name,
    },
    // direct_number from instantJob — replaces hardcoded phone
    instant?.direct_number && {
      icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#F4781B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.63 19a19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
      text: instant.direct_number,
    },
    {
      icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#F4781B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
      text: job.job_type ?? 'Casual',
    },
    {
      icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#F4781B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
      text: null,
      node: (
        <span>
          <strong className="text-gray-900 font-bold">
           {job.pay_per_hour_cents != null
  ? `$${(parseInt(job.pay_per_hour_cents, 10) / 100).toFixed(2)}`
  : '—'}
          </strong>/hr
        </span>
      ),
    },
  ].filter(Boolean) as { icon: React.ReactNode; text: string | null; node?: React.ReactNode }[];

  // ── Instant jobs don't have normalJob specs/quals ───────────
  const hasSpecs = job.normalJob?.specializations && job.normalJob.specializations.length > 0;
  const hasQuals = job.normalJob?.qualifications  && job.normalJob.qualifications.length  > 0;

  return (
    <div className="flex flex-col gap-4">

      {/* ── SINGLE CARD ── */}
      <div className="bg-white rounded-2xl border border-gray-200 px-6 py-4">

        {/* Row 1: breadcrumb + status badges */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-sm">
            <button
              onClick={() => router.push('/jobs')}
              className="flex items-center justify-center hover:bg-gray-100 rounded p-1 -ml-1"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
              </svg>
            </button>
            <span
              className="text-gray-700 font-semibold cursor-pointer hover:text-gray-900"
              onClick={() => router.push('/jobs')}
            >
              Jobs
            </span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-500 font-mono text-xs">{jobId}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-4 py-1.5 rounded-full text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200">
              {job.status.charAt(0) + job.status.slice(1).toLowerCase()}
            </span>
            <span className="px-4 py-1.5 rounded-full text-sm font-medium text-[#F4781B] bg-orange-50 border border-orange-200">
              Urgent
            </span>
          </div>
        </div>

        {/* Row 2: title + department + Job Description button */}
        <div className="flex items-start justify-between gap-4 mb-2.5">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-extrabold text-gray-900">{job.job_title}</h1>
            {job.department && (
              <span className="px-3 py-1 rounded-full text-sm text-gray-600 border border-gray-300 bg-white">
                {job.department} Department
              </span>
            )}
          </div>
          <button
            onClick={modal.open}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 hover:bg-gray-50 whitespace-nowrap flex-shrink-0"
          >
            <FileText size={15} className="text-gray-500" />
            Job Description
          </button>
        </div>

        {/* Row 3: info strip */}
        <div className="flex flex-wrap items-center gap-y-1 text-sm text-gray-600 pb-3">
          {infoItems.map((item, i) => (
            <React.Fragment key={i}>
              <span className="flex items-center gap-1.5">
                {item.icon}
                {item.node ?? item.text}
              </span>
              {i < infoItems.length - 1 && (
                <span className="mx-3 text-gray-300">|</span>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="h-px bg-gray-100 mb-3" />

        {/* Specs — hidden for instant jobs (normalJob is null) */}
        {job.job_urgency !== 'instant' && (
          <>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-[#F4781B]">Preferred Specialization :</span>
              {hasSpecs
                ? job.normalJob!.specializations!.map((s, i) => (
                    <span key={i} className="px-3 py-1 rounded-full text-xs text-gray-700 bg-white border border-gray-200">
                      {convertSpecializationToFrontend(String(s))}
                    </span>
                  ))
                : <span className="text-sm text-gray-400">N/A</span>
              }
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-[#F4781B]">Preferred Qualification :</span>
              {hasQuals
                ? job.normalJob!.qualifications!.map((q, i) => (
                    <span key={i} className="px-3 py-1 rounded-full text-xs text-gray-700 bg-white border border-gray-200">
                      {convertQualificationToFrontend(q)}
                    </span>
                  ))
                : <span className="text-sm text-gray-400">N/A</span>
              }
            </div>
          </>
        )}
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

      {/* ── Hired Candidates ── */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base text-[#F4781B]">Hired Candidates</h2>
            <div className="h-[1.5px] bg-[#F4781B] mt-1 rounded-full" />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
              Filter
            </button>
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setView('grid')}
                className={`p-1.5 ${view === 'grid' ? 'bg-gray-100 text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setView('list')}
                className={`p-1.5 ${view === 'list' ? 'bg-gray-100 text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="p-5">
          {view === 'grid'
            ? <CandidatesGridView jobId={jobId} />
            : <CandidatesListView jobId={jobId} />}
        </div>

        <div className="bg-[#FEF3E9] px-5 py-3 flex items-center justify-between">
          <button className="w-8 h-8 rounded-lg bg-[#F4781B] text-white text-sm font-semibold flex items-center justify-center">
            1
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Showing <strong>1–2</strong> of <strong>2</strong> Jobs</span>
            <select className="border border-gray-200 rounded px-2 py-1 text-sm bg-white">
              <option>10 per page</option>
              <option>25 per page</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Bottom Actions ── */}
      <div className="flex items-center justify-end gap-3 pb-4">
        <button
          onClick={onCloseJob}
          className="px-6 py-2 border border-red-500 text-red-500 rounded-lg text-sm hover:bg-red-50 font-medium"
        >
          Close This Job
        </button>
        <button
          onClick={() => router.push(`/jobs/edit/${jobId}`)}
          className="px-6 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 font-medium"
        >
          Edit Job
        </button>
      </div>

      <JobDescriptionModal
        isOpen={modal.isOpen}
        onClose={modal.close}
        job={job}
        onUpdate={(desc) => console.log('Saved:', desc)}
      />
    </div>
  );
};