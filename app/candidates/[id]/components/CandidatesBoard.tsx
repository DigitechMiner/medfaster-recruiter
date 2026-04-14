"use client";

import { useState } from "react";
import {
  Search, SlidersHorizontal, LayoutGrid, List,
  MapPin, Briefcase, Star, Zap, Calendar,
  MessageSquare, Settings2, Upload, Plus,
  CheckCircle2, ClipboardList, ArrowRight, ChevronLeft,
} from "lucide-react";
import { BriefcaseBusiness, Users, UserCheck, Layers } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CandidateColumn } from "./CandidateColumn";
import { useCandidatesList } from "@/hooks/useCandidate";
import { CandidateListItem } from "@/stores/api/recruiter-job-api";
import { STATIC_CANDIDATES } from "../constants/staticData";
import ScoreCard from "@/components/card/scorecard";

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const COLUMNS = [
  {
    title: "AI-Recommendations",
    accentColor: "orange" as const,
    dotColor: "bg-[#F59E0B]",
    actionType: "shortlist" as const,
    leftTags: ["Last Seen Yesterday", "Active 5 min ago", "Active 7 min ago", "Online"],
    rightTags: ["High Demand", "Available For Night Shift", "Most Hired", "Best Choice"],
  },
  {
    title: "Instant Hires",
    accentColor: "neutral" as const,
    dotColor: "bg-[#92400E]",
    actionType: "hire" as const,
    leftTags: ["Active 5 min ago", "Online", "Last Seen Yesterday", "Last Seen a Week Before"],
    rightTags: ["Available Today", "Available for Weekends", "Available Immediately", "Available on Wednesdays"],
  },
  {
    title: "Currently Available",
    accentColor: "green" as const,
    dotColor: "bg-green-500",
    actionType: "schedule" as const,
    leftTags: ["Online", "Online", "Online", "Active 15 min ago"],
    rightTags: ["Available on Wed & Fri", "Available Immediately", "Available Now", "Available Today"],
  },
  {
    title: "Nearby Professionals",
    accentColor: "red" as const,
    dotColor: "bg-red-500",
    actionType: "invite" as const,
    leftTags: ["Not Active Since 15 Days", "Last Seen Yesterday", "Active 5 min ago", "Online"],
    rightTags: ["Most Prefered", "Most Reviewed", "Available For Night Shift", "Available For Night Shift"],
  },
];

type KpiView = "none" | "candidatesPool" | "hired" | "inHouse" | "active";

// ─────────────────────────────────────────────────────────────
// Mock job data (Hired / In-House / Active)
// ─────────────────────────────────────────────────────────────

const MOCK_JOBS = [
  { name: "Michael Liam", candidateType: "In-House", dept: "Nursing",   title: "RN",  exp: "5 to 7 Years", type: "Regular", date: "12th April", timing: "20:00 PM to 03:00 AM", duration: "15 Days", status: "Active"    },
  { name: "Michael Liam", candidateType: "Hired",    dept: "Disability", title: "LPN", exp: "5 to 7 Years", type: "Urgent",  date: "15th April", timing: "20:00 PM to 03:00 AM", duration: "2 Days",  status: "Active"    },
  { name: "Michael Liam", candidateType: "Hired",    dept: "Disability", title: "HCA", exp: "5 to 7 Years", type: "Regular", date: "15th April", timing: "20:00 PM to 03:00 AM", duration: "7 Days",  status: "Completed" },
  { name: "Michael Liam", candidateType: "In-House", dept: "Disability", title: "HCA", exp: "5 to 7 Years", type: "Regular", date: "17th April", timing: "20:00 PM to 03:00 AM", duration: "1 Days",  status: "Upcoming"  },
  { name: "Michael Liam", candidateType: "Hired",    dept: "Disability", title: "HCA", exp: "5 to 7 Years", type: "Urgent",  date: "20th April", timing: "20:00 PM to 03:00 AM", duration: "12 Days", status: "Upcoming"  },
];

// ─────────────────────────────────────────────────────────────
// Pill components
// ─────────────────────────────────────────────────────────────

const JobTypePill = ({ type }: { type: string }) =>
  type === "Urgent" ? (
    <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-600 border border-orange-200">
      {type}
    </span>
  ) : (
    <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-green-100 text-green-600 border border-green-200">
      {type}
    </span>
  );

const StatusPill = ({ status }: { status: string }) => {
  const s =
    status === "Active"    ? "bg-green-500 text-white" :
    status === "Completed" ? "bg-yellow-500 text-white" :
    status === "Upcoming"  ? "bg-orange-500 text-white" :
    "bg-gray-100 text-gray-500";
  return (
    <span className={`inline-flex items-center text-[11px] font-semibold px-3 py-1 rounded-full ${s}`}>
      {status}
    </span>
  );
};

const CandidateTypePill = ({ type }: { type: string }) =>
  type === "In-House" ? (
    <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-600 border border-sky-200">
      {type}
    </span>
  ) : (
    <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200">
      {type}
    </span>
  );

// ─────────────────────────────────────────────────────────────
// Job Table (shared by Hired, In-House, Active)
// ─────────────────────────────────────────────────────────────

const JobTable = ({
  jobs,
  showCandidateType = false,
  headerBg = "bg-orange-50/60",
}: {
  jobs: typeof MOCK_JOBS;
  showCandidateType?: boolean;
  headerBg?: string;
}) => {
  const baseHeaders = ["Candidate Name", "Department", "Job Title", "Experience", "Job Type", "Job Start Date", "Job Timing", "Job Duration", "Job Status"];
  const headers = showCandidateType
    ? ["Candidate Name", "Candidate Type", "Department", "Job Title", "Experience", "Job Type", "Job Start Date", "Job Timing", "Job Duration", "Job Status"]
    : baseHeaders;

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100">
      <table className="w-full text-left">
        <thead>
          <tr className={headerBg}>
            {headers.map((h) => (
              <th key={h} className="py-3 px-4 text-xs font-semibold text-gray-600 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {jobs.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="py-8 text-center text-xs text-gray-400">
                No records found
              </td>
            </tr>
          ) : (
            jobs.map((job, i) => (
              <tr key={i} className="border-b border-gray-100 hover:bg-orange-50/30 transition-colors cursor-pointer">
                <td className="py-3 px-4 text-sm font-medium text-gray-900 whitespace-nowrap">{job.name}</td>
                {showCandidateType && (
                  <td className="py-3 px-4">
                    <CandidateTypePill type={job.candidateType} />
                  </td>
                )}
                <td className="py-3 px-4 text-xs text-gray-600">{job.dept}</td>
                <td className="py-3 px-4 text-xs text-gray-600">{job.title}</td>
                <td className="py-3 px-4 text-xs text-gray-600">{job.exp}</td>
                <td className="py-3 px-4"><JobTypePill type={job.type} /></td>
                <td className="py-3 px-4 text-xs text-gray-600 whitespace-nowrap">{job.date}</td>
                <td className="py-3 px-4 text-xs text-gray-600 whitespace-nowrap">{job.timing}</td>
                <td className="py-3 px-4 text-xs text-gray-500">{job.duration}</td>
                <td className="py-3 px-4"><StatusPill status={job.status} /></td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Hired Candidate Card (grid view — Manage + Chat)
// ─────────────────────────────────────────────────────────────

const HiredCandidateCard = ({
  c, leftTag, rightTag,
}: {
  c: CandidateListItem;
  leftTag?: string;
  rightTag?: string;
}) => {
  const router = useRouter();
  const name = c.full_name || `${c.first_name} ${c.last_name ?? ""}`.trim();
  const role = c.specialty?.[0] ?? c.medical_industry ?? "Registered Nurse";
  const score = c.highest_job_interview_score ?? c.highest_interview_score ?? 40;
  const isAssigned = (leftTag ?? "Assigned").toLowerCase().includes("assigned");

  return (
    <div
      onClick={() => router.push(`/candidates/${c.id}`)}
      className="flex flex-col gap-2 p-3 rounded-xl border border-gray-200 bg-white hover:border-orange-300 hover:shadow-sm transition-all cursor-pointer"
    >
      {/* Top tags */}
      <div className="flex items-center justify-between gap-1">
        {isAssigned ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-300">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Assigned
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 border border-teal-300">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
            Active
          </span>
        )}
        {rightTag && <JobTypePill type={rightTag} />}
      </div>

      {/* Identity + Stats */}
<div className="flex items-start gap-2">
  <div className="w-10 h-10 rounded-xl overflow-hidden bg-orange-50 shrink-0 border border-gray-100">
    <Image
            src={c.profile_image_url || "/svg/Photo.svg"}
            alt={name}
            width={40}
            height={40}
            className="object-cover w-full h-full"
          />
  </div>
  <div className="flex-1 min-w-0">
    <p className="text-sm font-bold text-gray-900 leading-tight">{name}</p>
    <p className="text-[11px] text-[#F4781B] font-medium mt-0.5">{role}</p>

    {/* ← Stats now lives here, directly under role */}
    <div className="flex items-center gap-2 text-[10px] text-gray-500 flex-wrap mt-1">
      <span className="flex items-center gap-1"><Briefcase size={10} className="text-gray-400" /> 5+ yrs</span>
      <span className="text-gray-300">|</span>
      <span className="flex items-center gap-0.5"><MapPin size={9} className="text-green-500" /> 25km</span>
      <span className="text-gray-300">|</span>
      <span className="flex items-center gap-0.5"><Star size={9} className="fill-yellow-400 text-yellow-400" /> 4.8/5</span>
    </div>
  </div>
  <ScoreCard category="good" score={score} maxScore={100} />
</div>

      {/* Actions */}
      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
        <button className="flex-1 bg-[#F4781B] hover:bg-[#e06a10] text-white text-xs font-semibold py-2 rounded-xl transition-colors flex items-center justify-center gap-1">
          <Settings2 size={11} /> Manage
        </button>
        <button className="flex-1 border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-medium py-2 rounded-xl transition-colors flex items-center justify-center gap-1">
          <MessageSquare size={11} /> Chat
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Add In-House Staff Modal
// ─────────────────────────────────────────────────────────────

type StaffEntry = { name: string; email: string; phone: string };

const AddInHouseModal = ({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (count: number) => void;
}) => {
  const [entries, setEntries] = useState<StaffEntry[]>([
    { name: "", email: "", phone: "" },
  ]);

  const updateEntry = (i: number, field: keyof StaffEntry, val: string) => {
    setEntries((prev) => prev.map((e, idx) => idx === i ? { ...e, [field]: val } : e));
  };

  const addRow = () => setEntries((prev) => [...prev, { name: "", email: "", phone: "" }]);

  const handleSend = () => {
    const filled = entries.filter((e) => e.name.trim() || e.email.trim());
    onSuccess(filled.length || entries.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <ChevronLeft size={18} />
            </button>
            <h2 className="text-base font-bold text-gray-900">Add In-House Staff</h2>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-medium px-3 py-2 rounded-xl transition-colors">
              <Upload size={13} /> Bulk Upload
            </button>
            <button
              onClick={addRow}
              className="flex items-center gap-1.5 bg-[#F4781B] hover:bg-[#e06a10] text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
            >
              <Plus size={13} /> Add More
            </button>
          </div>
        </div>

        {/* Entry rows */}
        <div className="flex flex-col gap-4 max-h-72 overflow-y-auto pr-1">
          {entries.map((entry, i) => (
            <div key={i} className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 font-medium">Full Name</label>
                <input
                  value={entry.name}
                  onChange={(e) => updateEntry(i, "name", e.target.value)}
                  placeholder="Ajay Shah"
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-orange-400 transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 font-medium">Email Id</label>
                <input
                  value={entry.email}
                  onChange={(e) => updateEntry(i, "email", e.target.value)}
                  placeholder="staff@hospital.com"
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-orange-400 transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 font-medium">Phone Number</label>
                <input
                  value={entry.phone}
                  onChange={(e) => updateEntry(i, "phone", e.target.value)}
                  placeholder="+1 987 654 3210"
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-orange-400 transition-colors"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-end mt-5">
          <button
            onClick={handleSend}
            className="flex items-center gap-2 bg-[#F4781B] hover:bg-[#e06a10] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            Send Invitation <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Success Modal
// ─────────────────────────────────────────────────────────────

const SuccessModal = ({
  count,
  onDone,
}: {
  count: number;
  onDone: () => void;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-8 flex flex-col items-center gap-4 text-center">
      {/* Animated green circle */}
      <div className="relative w-16 h-16 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-green-100 animate-ping opacity-40" />
        <div className="w-14 h-14 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center">
          <CheckCircle2 size={28} className="text-green-500" />
        </div>
      </div>
      <div>
        <p className="text-base font-bold text-gray-900">
          Invitations Sent to {count} Candidate{count !== 1 ? "s" : ""} !
        </p>
        <p className="text-xs text-gray-400 mt-1">You will be notified once they are enrolled</p>
      </div>
      <button
        onClick={onDone}
        className="w-full bg-[#F4781B] hover:bg-[#e06a10] text-white text-sm font-semibold py-3 rounded-xl transition-colors mt-1"
      >
        Done
      </button>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Metric Card
// ─────────────────────────────────────────────────────────────

const MetricCard = ({
  icon, title, value, change, isPositive, onClick, isActive,
}: {
  icon: React.ReactNode; title: string; value: string | number;
  change: string; isPositive: boolean;
  onClick?: () => void; isActive?: boolean;
}) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-xl p-4 border shadow-sm flex flex-col gap-2 transition-all
      ${onClick ? "cursor-pointer hover:shadow-md hover:border-orange-200" : ""}
      ${isActive ? "border-orange-400 ring-2 ring-orange-100" : "border-gray-100"}`}
  >
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-500 font-medium">{title}</span>
      <span className="text-orange-400">{icon}</span>
    </div>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-400">Since last week</span>
      <span className={`text-xs font-semibold ${isPositive ? "text-green-500" : "text-red-400"}`}>
        {change} {isPositive ? "↑" : "↓"}
      </span>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Pagination Bar
// ─────────────────────────────────────────────────────────────

const PaginationBar = ({ total }: { total: number }) => (
  <div className="flex items-center justify-between flex-wrap gap-3 pt-3 border-t border-gray-100 mt-3">
    <div className="flex items-center gap-1">
      <button className="flex items-center gap-1 border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50 transition-colors">
        ← Previous
      </button>
      {[1, 2, 3].map((p) => (
        <button key={p} className={`w-8 h-8 rounded-xl text-xs font-semibold transition-colors
          ${p === 1 ? "bg-orange-500 text-white" : "text-gray-500 hover:bg-gray-50"}`}>{p}</button>
      ))}
      <span className="text-xs text-gray-400 px-1">...</span>
      {[8, 9, 10].map((p) => (
        <button key={p} className="w-8 h-8 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-50 transition-colors">{p}</button>
      ))}
      <button className="flex items-center gap-1 border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50 transition-colors">
        Next →
      </button>
    </div>
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500">Showing <strong>1–{Math.min(10, total)}</strong> of <strong>{total}</strong> Jobs</span>
      <select className="border border-gray-200 rounded-xl px-2 py-1.5 text-xs text-gray-600 outline-none">
        <option>10 per page</option>
        <option>20 per page</option>
        <option>50 per page</option>
      </select>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// colStyles (needed for expanded Pool view)
// ─────────────────────────────────────────────────────────────

const colStyles: Record<string, { wrapper: string; dot: string; viewAll: string }> = {
  orange:  { wrapper: "border-[#F4A300] bg-[#FFF9F0]", dot: "bg-[#F59E0B]",  viewAll: "text-[#F4A300]" },
  neutral: { wrapper: "border-[#92400E] bg-[#FFF5EE]", dot: "bg-[#92400E]",  viewAll: "text-[#92400E]" },
  green:   { wrapper: "border-[#22C55E] bg-[#F0FFF8]", dot: "bg-[#22C55E]",  viewAll: "text-[#16A34A]" },
  red:     { wrapper: "border-[#EF4444] bg-[#FFF5F5]", dot: "bg-[#EF4444]",  viewAll: "text-[#EF4444]" },
};

// ─────────────────────────────────────────────────────────────
// Section Header (shared)
// ─────────────────────────────────────────────────────────────

const SectionHeader = ({
  title,
  dotColor,
  count,
  view,
  onViewToggle,
  rightSlot,
}: {
  title: string;
  dotColor: string;
  count: number;
  view: "grid" | "list";
  onViewToggle: (v: "grid" | "list") => void;
  rightSlot?: React.ReactNode;
}) => (
  <div className="flex items-center justify-between mb-1">
    <div className="flex items-center gap-2">
      <span className={`w-2.5 h-2.5 rounded-full ${dotColor} shrink-0`} />
      <h3 className="text-sm font-bold text-gray-900">{title}</h3>
      <span className="text-xs text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-full">{count}</span>
    </div>
    <div className="flex items-center gap-2">
      {rightSlot}
      <button className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
        <SlidersHorizontal size={13} className="text-gray-500" /> Filter
      </button>
      <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden">
        <button
          onClick={() => onViewToggle("grid")}
          className={`p-2 transition-colors ${view === "grid" ? "bg-orange-50 text-orange-500" : "text-gray-400 hover:bg-gray-50"}`}
        >
          <LayoutGrid size={14} />
        </button>
        <button
          onClick={() => onViewToggle("list")}
          className={`p-2 transition-colors ${view === "list" ? "bg-orange-50 text-orange-500" : "text-gray-400 hover:bg-gray-50"}`}
        >
          <List size={14} />
        </button>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Hired Candidates Section
// ─────────────────────────────────────────────────────────────

const HiredCandidatesSection = ({ candidates }: { candidates: CandidateListItem[] }) => {
  const [localView, setLocalView] = useState<"grid" | "list">("list");
  const hiredJobs = MOCK_JOBS; // all jobs shown for hired

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
            {candidates.map((c, i) => (
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
};

// ─────────────────────────────────────────────────────────────
// In-House Candidates Section
// ─────────────────────────────────────────────────────────────

const InHouseCandidatesSection = () => {
  const [localView, setLocalView] = useState<"grid" | "list">("list");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [inviteCount, setInviteCount] = useState(0);

  // Toggle between empty state and populated state for demo purposes
  // In production this would come from real data
  const [hasStaff, setHasStaff] = useState(false);

  const inHouseJobs = MOCK_JOBS.filter((j) => j.candidateType === "In-House");

  const handleSuccess = (count: number) => {
    setInviteCount(count);
    setShowAddModal(false);
    setShowSuccessModal(true);
  };

  const handleDone = () => {
    setShowSuccessModal(false);
    setHasStaff(true); // after inviting, show populated state
  };

  return (
    <>
      {/* Modals */}
      {showAddModal && (
        <AddInHouseModal
          onClose={() => setShowAddModal(false)}
          onSuccess={handleSuccess}
        />
      )}
      {showSuccessModal && (
        <SuccessModal count={inviteCount} onDone={handleDone} />
      )}

      <div className="flex flex-col gap-3">
        <SectionHeader
          title="In-House Candidates"
          dotColor="bg-green-500"
          count={hasStaff ? inHouseJobs.length : 0}
          view={localView}
          onViewToggle={setLocalView}
          rightSlot={
            hasStaff ? (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 bg-[#F4781B] hover:bg-[#e06a10] text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
              >
                <Plus size={12} /> Add Staff
              </button>
            ) : null
          }
        />

        {!hasStaff ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 gap-5">
            <div className="relative">
              {/* Clipboard SVG illustration */}
              <svg width="80" height="90" viewBox="0 0 80 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="10" y="15" width="52" height="65" rx="4" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="1.5"/>
                <rect x="28" y="8" width="16" height="14" rx="3" fill="#E5E7EB" stroke="#D1D5DB" strokeWidth="1.5"/>
                <circle cx="36" cy="15" r="2.5" fill="#9CA3AF"/>
                <rect x="20" y="36" width="32" height="2.5" rx="1.25" fill="#D1D5DB"/>
                <rect x="20" y="44" width="24" height="2.5" rx="1.25" fill="#E5E7EB"/>
                <rect x="20" y="52" width="28" height="2.5" rx="1.25" fill="#E5E7EB"/>
                {/* Face */}
                <circle cx="30" cy="64" r="1.5" fill="#9CA3AF"/>
                <circle cx="42" cy="64" r="1.5" fill="#9CA3AF"/>
                <path d="M30 70 Q36 66 42 70" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                {/* Dotted lines going out */}
                <line x1="64" y1="30" x2="72" y2="22" stroke="#D1D5DB" strokeWidth="1" strokeDasharray="3 2"/>
                <line x1="68" y1="50" x2="76" y2="50" stroke="#D1D5DB" strokeWidth="1" strokeDasharray="3 2"/>
              </svg>
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-gray-800">You Do Not Have Any In-House Staff List Yet</p>
              <p className="text-sm text-gray-400 mt-1">Let us help you to invite your staff on our KeRaeva's platform</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-[#F4781B] hover:bg-[#e06a10] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              <Plus size={14} /> Add My In-House Staff
            </button>
          </div>
        ) : (
          <>
            <JobTable jobs={inHouseJobs} headerBg="bg-green-50/60" />
            <PaginationBar total={inHouseJobs.length} />
          </>
        )}
      </div>
    </>
  );
};

// ─────────────────────────────────────────────────────────────
// Active Candidates Section
// ─────────────────────────────────────────────────────────────

const ActiveCandidatesSection = () => {
  // Active section shows candidates with Candidate Type column (In-House + Hired mix)
  const activeJobs = MOCK_JOBS.filter((j) => j.status === "Active");

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
        <h3 className="text-sm font-bold text-gray-900">Active Candidates</h3>
        <span className="text-xs text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-full">{activeJobs.length}</span>
      </div>
      <JobTable jobs={activeJobs} showCandidateType headerBg="bg-blue-50/40" />
      <PaginationBar total={activeJobs.length} />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Pool List Row (used in Candidates Pool list view)
// ─────────────────────────────────────────────────────────────

const PoolListRow = ({ c, actionType }: { c: CandidateListItem; actionType: string }) => {
  const router = useRouter();
  const name  = c.full_name || `${c.first_name} ${c.last_name ?? ""}`.trim();
  const role  = c.specialty?.[0] ?? c.medical_industry ?? "Healthcare Professional";
  const score = c.highest_job_interview_score ?? c.highest_interview_score ?? 0;

  return (
    <tr
      onClick={() => router.push(`/candidates/${c.id}`)}
      className="border-b border-gray-100 hover:bg-orange-50/40 cursor-pointer transition-colors"
    >
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl overflow-hidden bg-orange-50 shrink-0 border border-gray-100">
            <Image
              src={c.profile_image_url || "/svg/Photo.svg"}
              alt={name}
              width={36}
              height={36}
              className="object-cover w-full h-full"
            />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{name}</p>
            <p className="text-[11px] text-orange-500">{role}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-4 text-xs text-gray-600">{c.medical_industry ?? "Nursing"}</td>
      <td className="py-3 px-4 text-xs text-gray-600">{role}</td>
      <td className="py-3 px-4 text-xs text-gray-600">5 to 7 Years</td>
      <td className="py-3 px-4">
        <span className="flex items-center gap-1 text-xs text-gray-500">
          <MapPin size={11} className="text-green-500" /> 25km
        </span>
      </td>
      <td className="py-3 px-4 text-xs font-semibold text-gray-800">
        {score > 0 ? `${score}/100` : "—"}
      </td>
      <td className="py-3 px-4">
        <span className="flex items-center gap-1 text-xs text-yellow-600">
          <Star size={11} className="fill-yellow-400 text-yellow-400" /> 4.8/5
        </span>
      </td>
      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
        {actionType === "hire" && (
          <button className="flex items-center gap-1 border border-green-400 text-green-600 hover:bg-green-50 text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors">
            <Zap size={11} className="fill-green-500 text-green-500" /> Hire Instantly
          </button>
        )}
        {actionType === "schedule" && (
          <button className="border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-medium px-3 py-1.5 rounded-xl transition-colors">
            Schedule a Interview
          </button>
        )}
        {actionType === "invite" && (
          <button className="flex items-center gap-1 border border-orange-200 text-orange-500 hover:bg-orange-50 text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors">
            <Calendar size={11} /> Invite For a Job
          </button>
        )}
        {actionType === "shortlist" && (
          <button className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors">
            Shortlist
          </button>
        )}
      </td>
    </tr>
  );
};
// ─────────────────────────────────────────────────────────────
// Main CandidatesBoard
// ─────────────────────────────────────────────────────────────

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

  // ── Candidates Pool section ───────────────────────────────

  const renderCandidatesPoolSection = () => {
    if (view === "list") {
      const col = COLUMNS[activeListTab];
      const rows = filtered[activeListTab] ?? [];
      return (
        <div className="flex flex-col gap-0">
          <div className="flex items-center gap-0 border-b border-gray-100 mb-4 overflow-x-auto">
            {COLUMNS.map((c, i) => (
              <button
                key={c.title}
                onClick={() => setActiveListTab(i)}
                className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors border-b-2
                  ${activeListTab === i
                    ? "border-orange-500 text-orange-500"
                    : "border-transparent text-gray-400 hover:text-gray-600"}`}
              >
                {c.title}
              </button>
            ))}
          </div>
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-orange-50/60">
                  {["Candidate Name", "Department", "Designation", "Experience", "Distance", "General Scoring", "Rating", "Action"].map((h) => (
                    <th key={h} className="py-3 px-4 text-xs font-semibold text-gray-600 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr><td colSpan={8} className="py-8 text-center text-xs text-gray-400">No candidates</td></tr>
                ) : rows.map((c, j) => (
                  <PoolListRow key={c.id ?? j} c={c} actionType={col.actionType} />
                ))}
              </tbody>
            </table>
          </div>
          <PaginationBar total={rows.length} />
        </div>
      );
    }

    if (expandedColumn) {
      const colIdx = COLUMNS.findIndex((c) => c.title === expandedColumn);
      const col = COLUMNS[colIdx];
      const rows = filtered[colIdx] ?? [];
      const s = colStyles[col.accentColor];
      return (
        <div className={`rounded-2xl border-2 ${s.wrapper} p-4`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
              <h3 className="text-sm font-bold text-gray-900">{col.title}</h3>
              <span className="text-xs text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-full">{rows.length}</span>
            </div>
            <button onClick={() => setExpandedColumn(null)} className={`text-xs font-semibold ${s.viewAll} hover:underline`}>
              View Less
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {rows.map((c, i) => (
              <CandidateColumn
                key={col.title + i}
                title={col.title}
                count={1}
                accentColor={col.accentColor}
                dotColor={col.dotColor}
                candidates={[c]}
                actionType={col.actionType}
                leftTags={[col.leftTags?.[i % col.leftTags.length] ?? ""]}
                rightTags={[col.rightTags?.[i % col.rightTags.length] ?? ""]}
                hideHeader
                hideViewAll
              />
            ))}
          </div>
          <PaginationBar total={rows.length} />
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
        {COLUMNS.map((col, i) => (
          <CandidateColumn
            key={col.title}
            title={col.title}
            count={filtered[i]?.length ?? 0}
            accentColor={col.accentColor}
            dotColor={col.dotColor}
            candidates={filtered[i] ?? []}
            actionType={col.actionType}
            leftTags={col.leftTags}
            rightTags={col.rightTags}
            onViewAll={() => setExpandedColumn(col.title)}
          />
        ))}
      </div>
    );
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
            <button className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap">
              <SlidersHorizontal size={16} className="text-gray-500" /> Filter
            </button>
            <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setView("grid")}
                className={`p-2.5 transition-colors ${view === "grid" ? "bg-orange-50 text-orange-500" : "text-gray-400 hover:bg-gray-50"}`}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setView("list")}
                className={`p-2.5 transition-colors ${view === "list" ? "bg-orange-50 text-orange-500" : "text-gray-400 hover:bg-gray-50"}`}
              >
                <List size={16} />
              </button>
            </div>
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
            {activeKpi === "candidatesPool" && renderCandidatesPoolSection()}
            {activeKpi === "hired"          && <HiredCandidatesSection candidates={candidates} />}
            {activeKpi === "inHouse"        && <InHouseCandidatesSection />}
            {activeKpi === "active"         && <ActiveCandidatesSection />}

            {activeKpi === "none" && view === "grid" && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
                {COLUMNS.map((col, i) => (
                  <CandidateColumn
                    key={col.title}
                    title={col.title}
                    count={filtered[i]?.length ?? 0}
                    accentColor={col.accentColor}
                    dotColor={col.dotColor}
                    candidates={filtered[i] ?? []}
                    actionType={col.actionType}
                    leftTags={col.leftTags}
                    rightTags={col.rightTags}
                    onViewAll={() => {
                      setActiveKpi("candidatesPool");
                      setExpandedColumn(col.title);
                    }}
                  />
                ))}
              </div>
            )}

            {activeKpi === "none" && view === "list" && (
              <div className="flex flex-col gap-6">
                {COLUMNS.map((col, i) => (
                  <div key={col.title}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
                      <h3 className="text-sm font-bold text-gray-800">{col.title}</h3>
                      <span className="text-xs text-gray-400">({filtered[i]?.length ?? 0})</span>
                    </div>
                    {filtered[i]?.length === 0 ? (
                      <p className="text-xs text-gray-400 pl-5">No candidates</p>
                    ) : (
                                            <div className="overflow-x-auto rounded-xl border border-gray-100">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="bg-orange-50/60">
                              {["Candidate Name", "Department", "Designation", "Experience", "Distance", "Scoring", "Rating", "Action"].map((h) => (
                                <th key={h} className="py-2.5 px-4 text-xs font-semibold text-gray-600 whitespace-nowrap">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {filtered[i].map((c, j) => (
                              <PoolListRow key={c.id ?? j} c={c} actionType={col.actionType} />
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};