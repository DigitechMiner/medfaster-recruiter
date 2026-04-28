"use client";

import { useState }        from "react";
import { Plus, Filter, LayoutGrid, List, Eye } from "lucide-react";
import Image               from "next/image";
import { AddInHouseModal, SuccessModal, PartialFailModal, StaffEntry } from "./InHouseModals";
import type { InHouseInvitedRowVM, InHouseAcceptedRowVM } from "@/Interface/view-models";
import { useInHouseAccepted, useInHouseInvited } from "@/hooks/useInHouseCandidates";

// ── Types ─────────────────────────────────────────────────────────────────────
type InHouseTab = "accepted" | "invited";

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
                page === p ? "bg-[#F4781B] text-white" : "text-gray-500 hover:bg-gray-100"
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
          <b>{Math.min(page * perPage, total)}</b> of <b>{total}</b>
        </span>
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

// ── Empty State ───────────────────────────────────────────────────────────────
function EmptyState({ message, sub }: { message: string; sub: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="relative w-36 h-36">
        <Image
          src="/svg/empty-job.svg"
          alt={message}
          fill
          sizes="144px"
          className="object-contain"
        />
      </div>
      <div className="text-center">
        <p className="text-[15px] font-bold text-gray-800">{message}</p>
        <p className="text-[13px] text-gray-400 mt-1 max-w-xs">{sub}</p>
      </div>
    </div>
  );
}

// ── Skeleton Rows ─────────────────────────────────────────────────────────────
function SkeletonRows({ cols }: { cols: number }) {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <tr key={i} className="animate-pulse">
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className={TD}>
              <div className="h-3.5 bg-gray-100 rounded w-3/4" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ── Accepted Table ────────────────────────────────────────────────────────────
function AcceptedTable({
  rows,
  isLoading,
}: {
  rows:      InHouseAcceptedRowVM[];
  isLoading: boolean;
}) {
  if (!isLoading && rows.length === 0) {
    return (
      <EmptyState
        message="No Invitation accepted yet"
        sub="Once a candidate accepts and registers on the KeRaeva app, they will appear here."
      />
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
          {isLoading ? (
            <SkeletonRows cols={5} />
          ) : (
            rows.map((c) => (
              <tr key={c.candidate_id} className="hover:bg-gray-50/60 transition-colors">
                {/* Name + avatar */}
                <td className={TD}>
                  <div className="flex items-center gap-2.5">
                    {c.profile_image_url ? (
                      <Image
                        src={c.profile_image_url}
                        alt={c.full_name}
                        width={30} height={30}
                        className="rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-[30px] h-[30px] rounded-full bg-orange-100 text-orange-500 text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                        {c.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span>{c.full_name}</span>
                  </div>
                </td>

                {/* Departments */}
                <td className={TD}>
                  <div className="flex flex-wrap gap-1.5">
                    {c.departments.map((d) => (
                      <span key={d} className="border border-gray-200 text-gray-600 text-[11px] px-2.5 py-0.5 rounded-lg">
                        {d}
                      </span>
                    ))}
                  </div>
                </td>

                {/* Job Titles */}
                <td className={TD}>
                  <div className="flex flex-wrap gap-1.5">
                    {c.job_titles.map((t) => (
                      <span key={t} className="border border-gray-200 text-gray-600 text-[11px] px-2.5 py-0.5 rounded-lg">
                        {t}
                      </span>
                    ))}
                  </div>
                </td>

                <td className={TD}>{c.experience_range}</td>

                <td className={`${TD} text-center`}>
                  <button className="text-blue-400 hover:text-blue-600 transition-colors">
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {!isLoading && <PaginationBar total={rows.length} />}
    </>
  );
}

// ── Invited Table ─────────────────────────────────────────────────────────────
function InvitedTable({
  rows,
  isLoading,
}: {
  rows:      InHouseInvitedRowVM[];
  isLoading: boolean;
}) {
  if (!isLoading && rows.length === 0) {
    return (
      <EmptyState
        message="No Invitations Sent Yet"
        sub="Invite your in-house staff to get started."
      />
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
          {isLoading ? (
            <SkeletonRows cols={4} />
          ) : (
            rows.map((c) => (
              <tr key={c.candidate_id} className="hover:bg-gray-50/60 transition-colors">
                <td className={TD}>{c.full_name}</td>
                <td className={TD}>{c.email ?? "—"}</td>
                <td className={TD}>
                  <span className={`text-[12px] font-medium px-2.5 py-1 rounded-full ${
                    c.remark === "Invitation Accepted"
                      ? "bg-green-50 text-green-600"
                      : "bg-orange-50 text-orange-500"
                  }`}>
                    {c.remark}
                  </span>
                </td>
                <td className={TD}>{c.invited_at}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {!isLoading && <PaginationBar total={rows.length} />}
    </>
  );
}

// ── Main Section ──────────────────────────────────────────────────────────────
export function InHouseCandidatesSection({
  candidateId = "",
  jobId       = "",
}: {
  candidateId?: string;
  jobId?:       string;
}) {
  const [activeTab,        setActiveTab]        = useState<InHouseTab>("accepted");
  const [showAddModal,     setShowAddModal]     = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailModal,    setShowFailModal]    = useState(false);
  const [inviteCount,      setInviteCount]      = useState(0);
  const [failedEmails,     setFailedEmails]     = useState<string[]>([]);
  const [viewMode,         setViewMode]         = useState<"grid" | "list">("list");

  // ✅ Local state for optimistically added invites
  const [localInvites, setLocalInvites] = useState<InHouseInvitedRowVM[]>([]);

  const { rows: apiInvitedRows, isLoading: loadingInvited  } = useInHouseInvited();
  const { rows: acceptedRows,   isLoading: loadingAccepted } = useInHouseAccepted();

  // ✅ Merge API rows + locally added rows (local ones appear at top)
  const invitedRows = [...localInvites, ...apiInvitedRows];

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSuccess = (count: number, entries: StaffEntry[]) => {
    // Convert each StaffEntry → InHouseInvitedRowVM and prepend to local list
    const now = new Date().toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    }); // e.g. "28 Apr 2026"

    const newInvites: InHouseInvitedRowVM[] = entries.map((e, i) => ({
      candidate_id: `local-${Date.now()}-${i}`,
      full_name:    e.name.trim(),
      email:        e.email.trim(),
      remark:       "Invitation Sent",
      invited_at:   now,
    }));

    setLocalInvites((prev) => [...newInvites, ...prev]); // ✅ prepend new invites
    setInviteCount(count);
    setShowAddModal(false);
    setActiveTab("invited");   // ✅ auto-switch to Invited tab
    setShowSuccessModal(true);
  };

  const handlePartialFail = (emails: string[]) => {
    setFailedEmails(emails);
    setShowAddModal(false);
    setShowFailModal(true);
  };

  return (
    <>
      {showAddModal && (
        <AddInHouseModal
          onClose={() => setShowAddModal(false)}
          onSuccess={handleSuccess}           // ✅ updated signature
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

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Tabs + actions row */}
        <div className="flex items-center justify-between px-1 border-b border-gray-100 overflow-visible">
          <div className="flex">
            {(["accepted", "invited"] as InHouseTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3.5 text-[13px] font-semibold capitalize transition-colors
                            relative overflow-visible ${
                              activeTab === tab
                                ? "text-[#F4781B]"
                                : "text-gray-400 hover:text-gray-600"
                            }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}

                {/* ✅ Show count badge on Invited tab when there are local invites */}
                {tab === "invited" && localInvites.length > 0 && (
                  <span className="ml-1.5 text-[10px] bg-[#F4781B] text-white
                                   font-bold px-1.5 py-0.5 rounded-full">
                    {invitedRows.length}
                  </span>
                )}

                {activeTab === tab && (
                  <span className="absolute -bottom-px left-0 right-0 h-[2px]
                                   bg-[#F4781B] rounded-t-full" />
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 pr-2">
            <button className="flex items-center gap-1.5 border border-gray-200 text-gray-600
                               hover:bg-gray-50 text-[12px] font-medium px-3.5 py-2 rounded-xl transition-colors">
              <Filter size={13} /> Filter
            </button>
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
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 bg-[#F4781B] hover:bg-[#e06a10] text-white
                         text-[12px] font-semibold px-3.5 py-2 rounded-xl transition-colors"
            >
              <Plus size={13} /> Add Staff
            </button>
          </div>
        </div>

        {activeTab === "accepted" && (
          <AcceptedTable rows={acceptedRows} isLoading={loadingAccepted} />
        )}
        {activeTab === "invited" && (
          <InvitedTable rows={invitedRows} isLoading={loadingInvited} />
        )}
      </div>
    </>
  );
}