'use client';
import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MapPin, BriefcaseBusiness, Clock, User } from 'lucide-react';
import { JobStatusBadge } from './JobStatusBadge';
import { useAuthStore } from '@/stores/authStore';
import { getBackendImageUrl } from '@/stores/api/api-client';
import type { JobListItem } from '@/Interface/job.types';

const formatJobType = (raw?: string | null) => {
  if (!raw) return null;
  return raw.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

function getInterviewBadge(job: JobListItem): { label: string; cls: string } {
  if (job.job_urgency === 'instant') return { label: 'No Interview Needed',   cls: 'bg-[#FEE4E2] text-[#912018]' };
  if (job.ai_interview)             return { label: 'AI Interview',           cls: 'bg-[#D1FAE5] text-[#059669]' };
  return                                   { label: 'No Interview Required',  cls: 'bg-[#FEF9C3] text-[#854D0E]' };
}

const formatTime = (t?: string | null) => (t ? t.slice(0, 5) : null);

export const JobsGridView: React.FC<{ jobs: JobListItem[] }> = ({ jobs }) => {
  const router     = useRouter();

  // ── Org logo from auth store (same source as OrganizationPage) ──────────
  const profile    = useAuthStore((state) => state.recruiterProfile);
  const logoUrl    = profile?.organization_photo_url
    ? getBackendImageUrl(profile.organization_photo_url)
    : null;
  const orgName    = profile?.organization_name ?? 'ORG';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {jobs.map((job) => {
        const urgency   = job.job_urgency === 'instant' ? 'Urgent' : 'Regular';
        const location  = [job.city, job.province].filter(Boolean).join(', ') || null;
        const jobType   = formatJobType(job.job_type);
        const interview = getInterviewBadge(job);

        const checkIn  = formatTime(job.check_in_time);
        const checkOut = formatTime(job.check_out_time);
        const timings  = checkIn && checkOut ? `${checkIn} – ${checkOut}` : null;

        const metaParts = [
          job.years_of_experience ? { icon: <BriefcaseBusiness size={12} color="orange" />, text: `${job.years_of_experience} yrs` } : null,
          job.department          ? { icon: <BriefcaseBusiness size={12} color="orange" />, text: job.department }                   : null,
          jobType                 ? { icon: <Clock size={12} color="orange" />,             text: jobType }                          : null,
          timings                 ? { icon: <Clock size={12} color="orange" />,             text: timings }                          : null,
        ].filter(Boolean) as { icon: React.ReactNode; text: string }[];

        return (
          <div
            key={job.id}
            className="bg-white rounded-2xl p-4 flex flex-col gap-3"
            style={{ border: '1px solid #E5E7EB' }}
          >
            {/* Row 1: Job ID + badges */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-medium tracking-wide">
                Job ID: {job.id.slice(0, 8).toUpperCase()}
              </span>
              <div className="flex items-center gap-1.5">
                <JobStatusBadge label={urgency} />
                <JobStatusBadge label={job.status} />
              </div>
            </div>

            {/* Row 2: Logo + title + meta */}
            <div className="flex items-start gap-3">

              {/* ── Org logo ── */}
              <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center">
                {logoUrl ? (
                  <Image
                    src={logoUrl}
                    alt={orgName}
                    width={48}
                    height={48}
                    className="object-contain w-full h-full"
                  />
                ) : (
                  // Fallback: initials from org name
                  <span className="text-[10px] font-extrabold text-[#F4781B] uppercase text-center leading-tight px-1">
                    {orgName.slice(0, 6)}
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-gray-900 text-[15px] leading-snug truncate">
                  {job.job_title}
                </h3>
                {metaParts.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-1 text-xs flex-wrap">
                    {metaParts.map((part, i) => (
                      <React.Fragment key={i}>
                        {i > 0 && <span className="text-gray-300">|</span>}
                        <span className="flex items-center gap-1 text-gray-400">
                          {part.icon}
                          <span className="text-gray-500">{part.text}</span>
                        </span>
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Row 3: Location + interview badge */}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <MapPin size={13} className="text-[#F4781B] flex-shrink-0" />
                {location ?? '—'}
              </span>
              <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${interview.cls}`}>
                <User size={11} />
                {interview.label}
              </span>
            </div>

            {/* Row 4: CTA */}
            <button
              onClick={() => router.push(`/jobs/${job.id}`)}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-[#492408] transition-colors hover:bg-[#FEE8D6]"
              style={{ border: '1px solid #492408', backgroundColor: '#FEF1E8' }}
            >
              View Job Details
            </button>
          </div>
        );
      })}
    </div>
  );
};