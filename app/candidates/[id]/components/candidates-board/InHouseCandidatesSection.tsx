"use client";

import { useState } from "react";
import { Plus, Filter, LayoutGrid, List, Eye } from "lucide-react";
import Image from "next/image";
import { AddInHouseModal, SuccessModal, PartialFailModal } from "./InHouseModals";

// ── Types ─────────────────────────────────────────────────────────────────────
type InHouseTab = "accepted" | "invited";

interface AcceptedCandidate {
  id: string;
  name: string;
  departments: string[];
  jobTitles: string[];
  experience: string;
}

interface InvitedCandidate {
  id: string;
  name: string;
  email: string;
  remark: "Invitation Sent" | "Invitation Accepted";
  sentDate: string;
}

// ── Mock data (replace with API) ──────────────────────────────────────────────
const MOCK_ACCEPTED: AcceptedCandidate[] = [];
const MOCK_INVITED: InvitedCandidate[]   = [];

// ── Shared table styles ───────────────────────────────────────────────────────
const TH = "text-[12px] font-semibold text-gray-700 py-3 px-4 text-left";
const TD = "text-[13px] text-gray-700 py-3.5 px-4 border-t border-gray-100";

// ── Pagination Bar ────────────────────────────────────────────────────────────
function PaginationBar({ total, perPage = 10 }: { total: number; perPage?: number }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const pages: (number | "...")[] = [];
  if (totalPages <= 6) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1, 2, 3, "...", totalPages - 2, totalPages - 1, totalPages);
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-orange-50/40 border-t border-orange-100 rounded-b-2xl">
      <button
        onClick={() => setPage((p) => Math.max(1, p - 1))}
        disabled={page === 1}
        className="flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
      >
        ← Previous
      </button>

      <div className="flex items-center gap-1">
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={i} className="px-2 text-gray-400 text-[12px]">...</span>
          ) : (
            <button
              key={i}
              onClick={() => setPage(p as number)}
              className={`w-7 h-7 rounded-lg text-[12px] font-medium transition-colors ${
                page === p
                  ? "bg-[#F4781B] text-white"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {p}
            </button>
          )
        )}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-[12px] text-gray-500">
          Showing <b>{Math.min((page - 1) * perPage + 1, total)}</b>–
          <b>{Math.min(page * perPage, total)}</b> of <b>{total}</b> Jobs
        </span>
        <div className="flex items-center gap-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-[12px] text-gray-600 bg-white cursor-pointer">
          {perPage} per page <span className="ml-1">▾</span>
        </div>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

// ── Accepted Table ────────────────────────────────────────────────────────────
function AcceptedTable({ candidates }: { candidates: AcceptedCandidate[] }) {
  if (candidates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="relative w-36 h-36">
          <Image
            src="/svg/empty-job.svg"
            alt="No invitations accepted"
            fill
            sizes="144px"
            className="object-contain"
          />
        </div>
        <div className="text-center">
          <p className="text-[15px] font-bold text-gray-800">No Invitation accepted yet</p>
          <p className="text-[13px] text-gray-400 mt-1 max-w-xs">
            As soon as a invitation is accepted by candidates &amp; KeRaeva app is registered, they will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <table className="w-full">
        <thead>
          <tr className="bg-orange-50/60">
            <th className={TH}>Candidate Name</th>
            <th className={TH}>Department</th>
            <th className={TH}>Job Title</th>
            <th className={TH}>Experience</th>
            <th className={`${TH} text-center`}>Action</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((c) => (
            <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
              <td className={TD}>{c.name}</td>
              <td className={TD}>
                <div className="flex flex-wrap gap-1.5">
                  {c.departments.map((d) => (
                    <span key={d} className="border border-gray-200 text-gray-600 text-[11px] px-2.5 py-0.5 rounded-lg">
                      {d}
                    </span>
                  ))}
                </div>
              </td>
              <td className={TD}>
                <div className="flex flex-wrap gap-1.5">
                  {c.jobTitles.map((t) => (
                    <span key={t} className="border border-gray-200 text-gray-600 text-[11px] px-2.5 py-0.5 rounded-lg">
                      {t}
                    </span>
                  ))}
                </div>
              </td>
              <td className={TD}>{c.experience}</td>
              <td className={`${TD} text-center`}>
                <button className="text-blue-400 hover:text-blue-600 transition-colors">
                  <Eye size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <PaginationBar total={candidates.length} />
    </>
  );
}

// ── Invited Table ─────────────────────────────────────────────────────────────
function InvitedTable({ candidates }: { candidates: InvitedCandidate[] }) {
  if (candidates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="relative w-36 h-36">
          <Image
            src="/svg/empty-job.svg"
            alt="No invitations sent"
            fill
            sizes="144px"
            className="object-contain"
          />
        </div>
        <div className="text-center">
          <p className="text-[15px] font-bold text-gray-800">No Invitations Sent Yet</p>
          <p className="text-[13px] text-gray-400 mt-1">
            Invite your in-house staff to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <table className="w-full">
        <thead>
          <tr className="bg-orange-50/60">
            <th className={TH}>Candidate Name</th>
            <th className={TH}>Email</th>
            <th className={TH}>Remark</th>
            <th className={TH}>Invitation Sent Date</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((c) => (
            <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
              <td className={TD}>{c.name}</td>
              <td className={TD}>{c.email}</td>
              <td className={TD}>
                <span className="italic text-gray-500">{c.remark}</span>
              </td>
              <td className={TD}>{c.sentDate}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <PaginationBar total={candidates.length} />
    </>
  );
}

// ── Main Section ──────────────────────────────────────────────────────────────
export function InHouseCandidatesSection({
  candidateId = "",
  jobId = "",
}: {
  candidateId?: string;
  jobId?: string;
}) {
  const [activeTab, setActiveTab]             = useState<InHouseTab>("accepted");
  const [showAddModal, setShowAddModal]       = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailModal, setShowFailModal]     = useState(false);
  const [inviteCount, setInviteCount]         = useState(0);
  const [failedEmails, setFailedEmails]       = useState<string[]>([]);
  const [viewMode, setViewMode]               = useState<"grid" | "list">("list");

  // Use real API data here when available
  const acceptedCandidates = MOCK_ACCEPTED;
  const invitedCandidates  = MOCK_INVITED;

  const handleSuccess = (count: number) => {
    setInviteCount(count);
    setShowAddModal(false);
    setShowSuccessModal(true);
  };

  const handlePartialFail = (emails: string[]) => {
    setFailedEmails(emails);
    setShowAddModal(false);
    setShowFailModal(true);
  };

  return (
    <>
      {/* Modals */}
      {showAddModal && (
        <AddInHouseModal
          onClose={() => setShowAddModal(false)}
          onSuccess={handleSuccess}
          onPartialFail={handlePartialFail}
          candidateId={candidateId}
          jobId={jobId}
        />
      )}
      {showSuccessModal && (
        <SuccessModal
          count={inviteCount}
          onDone={() => setShowSuccessModal(false)}
        />
      )}
      {showFailModal && (
        <PartialFailModal
          failedEmails={failedEmails}
          onClose={() => setShowFailModal(false)}
        />
      )}

      {/* Section container */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">

        {/* Tabs + actions row */}
        <div className="flex items-center justify-between px-1 border-b border-gray-100">
          {/* Tabs */}
          <div className="flex">
            {(["accepted", "invited"] as InHouseTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3.5 text-[13px] font-semibold capitalize transition-colors relative ${
                  activeTab === tab
                    ? "text-[#F4781B]"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#F4781B] rounded-t-full" />
                )}
              </button>
            ))}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2 pr-2">
            <button className="flex items-center gap-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 text-[12px] font-medium px-3.5 py-2 rounded-xl transition-colors">
              <Filter size={13} /> Filter
            </button>
            {/* Grid / List toggle */}
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2.5 transition-colors ${
                  viewMode === "grid" ? "bg-gray-100 text-gray-700" : "text-gray-400 hover:bg-gray-50"
                }`}
              >
                <LayoutGrid size={15} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2.5 transition-colors ${
                  viewMode === "list" ? "bg-gray-100 text-gray-700" : "text-gray-400 hover:bg-gray-50"
                }`}
              >
                <List size={15} />
              </button>
            </div>
            {/* Add Staff button — always visible */}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 bg-[#F4781B] hover:bg-[#e06a10] text-white text-[12px] font-semibold px-3.5 py-2 rounded-xl transition-colors"
            >
              <Plus size={13} /> Add Staff
            </button>
          </div>
        </div>

        {/* Tab content */}
        {activeTab === "accepted" && <AcceptedTable candidates={acceptedCandidates} />}
        {activeTab === "invited"  && <InvitedTable  candidates={invitedCandidates}  />}
      </div>
    </>
  );
}