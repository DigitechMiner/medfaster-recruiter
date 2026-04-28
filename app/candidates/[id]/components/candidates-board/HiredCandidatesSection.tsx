'use client';

import { useState } from "react";
import type { CandidateCardVM } from "@/Interface/view-models";
import { renderCandidateCards } from "@/components/candidate/renderers";
import { MOCK_JOBS } from "./constants";
import { PaginationBar, SectionHeader } from "./ui";
import { JobTable } from "./JobTable";
import { HiredCandidateCard } from "./HiredCandidateCard";

// ── Mock toggle — flip to false when API is wired ─────────────────
const USE_MOCK = true;

const MOCK_HIRED: CandidateCardVM[] = [
  {
    id: 'a3f1e2d4-7c8b-4a9e-b2f6-1d5c3e7a9b0f', application_id: 'app-1',
    full_name: 'Sarah Jenkins', initials: 'SJ',
    profile_image_url: null,
    designation: 'Registered Nurse', department: 'Nursing',
    experience: '5+ yrs', distance: 'Toronto, ON',
    interview_score: 87, rating: 4.8,
    work_eligibility: 'Canadian Citizen',
    is_online: true, application_status: 'HIRE',
    href: '/candidates/a3f1e2d4-7c8b-4a9e-b2f6-1d5c3e7a9b0f',
  },
  {
    id: 'b7d2c4e6-3f1a-4b8d-c5e9-2a6f4d8c0e1b', application_id: 'app-2',
    full_name: 'Michael Lee', initials: 'ML',
    profile_image_url: null,
    designation: 'Care Aide', department: 'Long-Term Care',
    experience: '3+ yrs', distance: 'Vancouver, BC',
    interview_score: 62, rating: 4.2,
    work_eligibility: 'PR',
    is_online: false, application_status: 'HIRE',
    href: '/candidates/b7d2c4e6-3f1a-4b8d-c5e9-2a6f4d8c0e1b',
  },
  {
    id: 'c9e4f6a8-5b2d-4c0e-d7f1-3b8a6e0d2f4c', application_id: 'app-3',
    full_name: 'Priya Sharma', initials: 'PS',
    profile_image_url: null,
    designation: 'Medical Lab Technician', department: 'Laboratory',
    experience: '7+ yrs', distance: 'Calgary, AB',
    interview_score: null, rating: 4.5,
    work_eligibility: 'Work Permit',
    is_online: true, application_status: 'HIRE',
    href: '/candidates/c9e4f6a8-5b2d-4c0e-d7f1-3b8a6e0d2f4c',
  },
  {
    id: 'd1f6a8c0-9e3b-4d2f-e4a7-5c0b8f2e6d1a', application_id: 'app-4',
    full_name: 'James Wilson', initials: 'JW',
    profile_image_url: null,
    designation: 'Physiotherapist', department: 'Rehabilitation',
    experience: '4+ yrs', distance: 'Ottawa, ON',
    interview_score: 74, rating: null,
    work_eligibility: 'Canadian Citizen',
    is_online: false, application_status: 'HIRE',
    href: '/candidates/d1f6a8c0-9e3b-4d2f-e4a7-5c0b8f2e6d1a',
  },
];

const LEFT_TAGS  = ["Assigned", "Active", "Assigned", "Active", "Assigned", "Active", "Assigned", "Active"];
const RIGHT_TAGS = ["Urgent", "Urgent", "Regular", "Regular", "Urgent", "Regular", "Urgent", "Regular"];

interface Props {
  candidates?: CandidateCardVM[]; // optional — ignored when USE_MOCK = true
  search?: string;
}

export function HiredCandidatesSection({ candidates = [], search = "" }: Props) {
  const [localView, setLocalView] = useState<"grid" | "list">("list");
  const hiredJobs = MOCK_JOBS;

  const source = USE_MOCK ? MOCK_HIRED : candidates;

  const filtered = search
    ? source.filter((c) =>
        `${c.full_name} ${c.designation} ${c.department}`
          .toLowerCase()
          .includes(search.toLowerCase())
      )
    : source;

  return (
    <div className="flex flex-col gap-3">
      <SectionHeader
        title="Hired Candidates"
        dotColor="bg-orange-500"
        count={localView === "list" ? hiredJobs.length : filtered.length}
        view={localView}
        onViewToggle={setLocalView}
      />

      {localView === "list" ? (
        <>
          <JobTable jobs={hiredJobs} headerBg="bg-orange-50/60" />
          <PaginationBar total={hiredJobs.length} />
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {renderCandidateCards(filtered, (c, i) => (
              <HiredCandidateCard
                key={c.id}
                c={c}
                leftTag={LEFT_TAGS[i % LEFT_TAGS.length]}
                rightTag={RIGHT_TAGS[i % RIGHT_TAGS.length]}
              />
            ))}
          </div>
          <PaginationBar total={filtered.length} />
        </>
      )}
    </div>
  );
}