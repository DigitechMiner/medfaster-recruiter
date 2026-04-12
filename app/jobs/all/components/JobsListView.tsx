'use client';
import React from 'react';
import { Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { JobStatusBadge } from './JobStatusBadge';
import type { JobsListResponse } from '@/Interface/job.types';

type JobListItem = JobsListResponse['data']['jobs'][0];

const formatDate = (d?: string | null) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatTime = (t?: string | null) => (t ? t.slice(0, 5) : null);

const formatBudget = (min?: string | number | null, max?: string | number | null) => {
  if (!min && !max) return '—';
  if (min && max) return `$${min}–$${max}/hr`;
  return `$${min ?? max}/hr`;
};

function getInterviewLabel(job: JobListItem): { label: string; cls: string } {
  if (job.job_urgency === 'instant') {
    return { label: 'No Interview Needed',   cls: 'bg-[#FEE4E2] text-[#912018]' };
  }
  if (job.ai_interview) {
    return { label: 'AI Interview',          cls: 'bg-[#D1FAE5] text-[#059669]' };
  }
  return   { label: 'No Interview Required', cls: 'bg-[#FEF9C3] text-[#854D0E]' };
}

interface Props { jobs: JobListItem[] }

export const JobsListView: React.FC<Props> = ({ jobs }) => {
  const router = useRouter();

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr>
            {['Job Title', 'Applications', 'Job Start Date', 'Job End Date',
              'Job Timings', 'Job Type', 'Budget', 'AI-Interview', 'Job Status', 'Actions'].map((h) => (
              <th
                key={h}
                className="text-left px-4 py-3 text-xs font-semibold text-gray-600 whitespace-nowrap bg-[#FEF3E9] first:rounded-l-lg last:rounded-r-lg"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => {
            const urgency  = job.job_urgency === 'instant' ? 'Urgent' : 'Regular';
            const ai       = getInterviewLabel(job);

            // ✅ Read actual values from job object
            const startDate = formatDate(job.start_date);
            const endDate   = formatDate(job.end_date);

            const checkIn  = formatTime(job.check_in_time);
            const checkOut = formatTime(job.check_out_time);
            const timings  = checkIn && checkOut ? `${checkIn} – ${checkOut}` : '—';

            return (
              <tr key={job.id} className="border-b border-gray-50 hover:bg-orange-50/30 transition-colors">

                {/* Job Title */}
                <td className="px-4 py-3.5 font-medium text-gray-800 whitespace-nowrap">
                  {job.job_title}
                </td>

                {/* Applications */}
                <td className="px-4 py-3.5 text-gray-600 text-center">
                  {job.application_count}
                </td>

                {/* Start Date */}
                <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">
                  {startDate}
                </td>

                {/* End Date */}
                <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">
                  {endDate}
                </td>

                {/* Timings */}
                <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">
                  {timings}
                </td>

                {/* Job Type — Urgent / Regular badge */}
                <td className="px-4 py-3.5">
                  <JobStatusBadge label={urgency} />
                </td>

                {/* Budget */}
                <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">
                  {formatBudget(job.pay_range_min, job.pay_range_max)}
                </td>

                {/* AI Interview — inline badge, NOT JobStatusBadge (uses own colors) */}
                <td className="px-4 py-3.5">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${ai.cls}`}>
                    {ai.label}
                  </span>
                </td>

                {/* Status */}
                <td className="px-4 py-3.5">
                  <JobStatusBadge label={job.status} />
                </td>

                {/* Actions */}
                <td className="px-4 py-3.5">
                  <button
                    onClick={() => router.push(`/jobs/${job.id}`)}
                    className="text-gray-400 hover:text-[#F4781B] transition-colors p-1"
                    title="View job"
                  >
                    <Eye size={18} />
                  </button>
                </td>

              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};