"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { BriefcaseBusiness, Users, UserCheck, Layers } from "lucide-react";
import { useCandidatesList } from "@/hooks/useCandidate";
import { CandidateListItem } from "@/stores/api/recruiter-job-api";
import { STATIC_CANDIDATES } from "../constants/staticData";
import { COLUMNS, KpiView } from "./candidates-board/constants";
import { MetricCard, MainViewHeader } from "./candidates-board/ui";
import { HiredCandidatesSection } from "./candidates-board/HiredCandidatesSection";
import { InHouseCandidatesSection } from "./candidates-board/InHouseCandidatesSection";
import { ActiveCandidatesSection } from "./candidates-board/ActiveCandidatesSection";
import { CandidatesPoolSection } from "./candidates-board/CandidatesPoolSection";

export const CandidatesBoard = () => {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [activeKpi, setActiveKpi] = useState<KpiView>("none");
  const [expandedColumn, setExpandedColumn] = useState<string | null>(null);
  const [activeListTab, setActiveListTab] = useState(0);

  const { data, isLoading, error } = useCandidatesList({ page: 1, limit: 20 });
  const candidates: CandidateListItem[] =
    data?.candidates?.length ? data.candidates : STATIC_CANDIDATES;

  const chunkSize = Math.ceil(candidates.length / 4) || 1;
  const columnCandidates = COLUMNS.map((_, i) =>
    candidates.slice(i * chunkSize, (i + 1) * chunkSize)
  );

  const filtered = columnCandidates.map((group) =>
    group.filter((c) =>
      search
        ? `${c.first_name} ${c.last_name} ${c.specialty}`
            .toLowerCase()
            .includes(search.toLowerCase())
        : true
    )
  );

  const toggleKpi = (kpi: KpiView) => {
    setActiveKpi((prev) => (prev === kpi ? "none" : kpi));
    setExpandedColumn(null);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
        <MetricCard
          icon={<BriefcaseBusiness size={18} />}
          title="Hired Candidates"
          value={250}
          change="-0.10%"
          isPositive={false}
          onClick={() => toggleKpi("hired")}
          isActive={activeKpi === "hired"}
        />
        <MetricCard
          icon={<Users size={18} />}
          title="In-House Candidates"
          value={124}
          change="+1.10%"
          isPositive={true}
          onClick={() => toggleKpi("inHouse")}
          isActive={activeKpi === "inHouse"}
        />
        <MetricCard
          icon={<UserCheck size={18} />}
          title="Active Candidates"
          value={30}
          change="+1.10%"
          isPositive={true}
          onClick={() => toggleKpi("active")}
          isActive={activeKpi === "active"}
        />
        <MetricCard
          icon={<Layers size={18} />}
          title="Candidates Pool"
          value="16k+"
          change="+2.10%"
          isPositive={false}
          onClick={() => toggleKpi("candidatesPool")}
          isActive={activeKpi === "candidatesPool"}
        />
      </div>

      {/* ── Main Panel ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-4">

        {/* Search + Controls — only show for default/pool views */}
        {(activeKpi === "none" || activeKpi === "candidatesPool") && (
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
            <MainViewHeader view={view} setView={setView} />
          </div>
        )}

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

        {!isLoading && !error && (
          <>
            {(activeKpi === "candidatesPool" || activeKpi === "none") && (
              <CandidatesPoolSection
                view={view}
                activeListTab={activeListTab}
                setActiveListTab={setActiveListTab}
                expandedColumn={expandedColumn}
                setExpandedColumn={setExpandedColumn}
                filtered={filtered}
                activeKpi={activeKpi}
                setActiveKpi={setActiveKpi}
              />
            )}
            {activeKpi === "hired"          && <HiredCandidatesSection candidates={candidates} />}
            {activeKpi === "inHouse"        && <InHouseCandidatesSection />}
            {activeKpi === "active"         && <ActiveCandidatesSection />}
          </>
        )}
      </div>
    </div>
  );
};