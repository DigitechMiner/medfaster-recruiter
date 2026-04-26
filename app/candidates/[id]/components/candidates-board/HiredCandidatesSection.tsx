"use client";

import { useState } from "react";
import type { CandidateListItem } from '@/Interface/recruiter.types';
import { renderCandidateCards } from "@/components/candidate/renderers";
import { MOCK_JOBS } from "./constants";
import { PaginationBar, SectionHeader } from "./ui";
import { JobTable } from "./JobTable";
import { HiredCandidateCard } from "./HiredCandidateCard";

export function HiredCandidatesSection({ candidates }: { candidates: CandidateListItem[] }) {
  const [localView, setLocalView] = useState<"grid" | "list">("list");
  const hiredJobs = MOCK_JOBS;

  const LEFT_TAGS  = ["Assigned", "Active", "Assigned", "Active", "Assigned", "Active", "Assigned", "Active", "Assigned", "Active", "Assigned", "Active"];
  const RIGHT_TAGS = ["Urgent", "Urgent", "Regular", "Regular", "Urgent", "Regular", "Urgent", "Regular", "Urgent", "Regular", "Urgent", "Regular"];

  return (
    <div className="flex flex-col gap-3">
      <SectionHeader
        title="Hired Candidates"
        dotColor="bg-orange-500"
        count={localView === "list" ? hiredJobs.length : candidates.length}
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
            {renderCandidateCards(candidates, (c, i) => (
              <HiredCandidateCard
                key={c.id ?? i}
                c={c}
                leftTag={LEFT_TAGS[i % LEFT_TAGS.length]}
                rightTag={RIGHT_TAGS[i % RIGHT_TAGS.length]}
              />
            ))}
          </div>
          <PaginationBar total={candidates.length} />
        </>
      )}
    </div>
  );
}