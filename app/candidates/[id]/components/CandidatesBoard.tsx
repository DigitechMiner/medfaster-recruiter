'use client';

import { useState } from "react";
import { Search } from "lucide-react";
import { BriefcaseBusiness, Users, UserCheck, Layers } from "lucide-react"; // ✅ both from same hook file
import { fromCandidateListItem } from "@/lib/transforms/candidate-list.transform";         // ✅ correct import
import { COLUMNS, KpiView } from "./candidates-board/constants";
import { MetricCard, MainViewHeader } from "./candidates-board/ui";
import { HiredCandidatesSection } from "./candidates-board/HiredCandidatesSection";
import { InHouseCandidatesSection } from "./candidates-board/InHouseCandidatesSection";
import { ActiveCandidatesSection } from "./candidates-board/ActiveCandidatesSection";
import { CandidatesPoolSection } from "./candidates-board/CandidatesPoolSection";
import { useCandidatesList, useCandidateSummary } from "@/hooks/useRecruiterData";
import { CandidateCardVM } from "@/Interface/view-models";

export const CandidatesBoard = () => {
  const [view,           setView]           = useState<"grid" | "list">("grid");
  const [search,         setSearch]         = useState("");
  const [activeKpi,      setActiveKpi]      = useState<KpiView>("none");
  const [expandedColumn, setExpandedColumn] = useState<string | null>(null);
  const [activeListTab,  setActiveListTab]  = useState(0);

  const { data, isLoading, error } = useCandidatesList({ page: 1, limit: 20 });
  const { summary }                = useCandidateSummary();

  // ✅ fixed: data.data.candidates
  const candidates: CandidateCardVM[] = (data?.data?.candidates ?? []).map(fromCandidateListItem);

  const chunkSize = Math.ceil(candidates.length / 4) || 1;
  const columnCandidates = COLUMNS.map((_, i) =>
    candidates.slice(i * chunkSize, (i + 1) * chunkSize)
  );

  const filtered = columnCandidates.map((group) =>
    group.filter((c) =>
  `${c.full_name} ${c.designation} ${c.department}`
    .toLowerCase()
    .includes(search.toLowerCase())
)
  );

  const toggleKpi = (kpi: KpiView) => {
    setActiveKpi((prev) => (prev === kpi ? "none" : kpi));
    setExpandedColumn(null);
  };

  const hiredCount   = summary?.UNIQUE_HIRED_CANDIDATES          != null ? String(summary.UNIQUE_HIRED_CANDIDATES)          : "—";
  const inHouseCount = summary?.IN_HOUSE_CANDIDATES              != null ? String(summary.IN_HOUSE_CANDIDATES)              : "—";
  const activeCount  = summary?.ACTIVE_HIRED_CANDIDATES          != null ? String(summary.ACTIVE_HIRED_CANDIDATES)          : "—";
  const poolCount    = summary?.AVAILABLE_CANDIDATES_WITHIN_30KM != null ? String(summary.AVAILABLE_CANDIDATES_WITHIN_30KM) : "—";

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
        <MetricCard icon={<BriefcaseBusiness size={18} />} title="Hired Candidates"    value={isLoading ? "..." : hiredCount}   change="-0.10%" isPositive={false} onClick={() => toggleKpi("hired")}          isActive={activeKpi === "hired"} />
        <MetricCard icon={<Users size={18} />}             title="In-House Candidates" value={isLoading ? "..." : inHouseCount} change="+1.10%" isPositive={true}  onClick={() => toggleKpi("inHouse")}        isActive={activeKpi === "inHouse"} />
        <MetricCard icon={<UserCheck size={18} />}         title="Active Candidates"   value={isLoading ? "..." : activeCount}  change="+1.10%" isPositive={true}  onClick={() => toggleKpi("active")}         isActive={activeKpi === "active"} />
        <MetricCard icon={<Layers size={18} />}            title="Candidates Pool"     value={isLoading ? "..." : poolCount}    change="+2.10%" isPositive={false} onClick={() => toggleKpi("candidatesPool")} isActive={activeKpi === "candidatesPool"} />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-4">
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
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-24 bg-gray-100 rounded-xl" />
                ))}
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-12 text-red-400 text-sm">{error}</div>
        )}

       {!isLoading && !error && (
  <>
    {/* ✅ Pool section always renders — CandidateColumn has its own mock data */}
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
    {activeKpi === "hired"   && <HiredCandidatesSection candidates={candidates} />}
    {activeKpi === "inHouse" && <InHouseCandidatesSection />}
    {activeKpi === "active"  && <ActiveCandidatesSection />}
  </>
)}
      </div>
    </div>
  );
};