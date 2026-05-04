'use client';

import { useEffect, useState }     from "react";
import { Plus, Filter, LayoutGrid, List, Eye } from "lucide-react";
import Image            from "next/image";
import { AddInHouseModal, SuccessModal, PartialFailModal, StaffEntry } from "./InHouseModals";
import { PaginationBar } from "./ui";
import type { InHouseAcceptedRowVM } from "@/Interface/view-models";
import { useInHouseCandidates }      from "@/hooks/useInHouseCandidates";

// ── "Invited" tab is local-only (no GET invites endpoint exists) ──────────────
interface LocalInvite {
  id:         string;
  full_name:  string;
  email:      string;
  invited_at: string;
}

type InHouseTab = "accepted" | "invited";

const TH = "text-[12px] font-semibold text-gray-700 py-3 px-4 text-left";
const TD = "text-[13px] text-gray-700 py-3.5 px-4 border-t border-gray-100";
const PAGE_LIMIT = 10;

// ── Shared helpers ────────────────────────────────────────────────────────────
function EmptyState({ message, sub }: { message: string; sub: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="relative w-36 h-36">
        <Image src="/svg/empty-job.svg" alt={message} fill sizes="144px" className="object-contain" />
      </div>
      <div className="text-center">
        <p className="text-[15px] font-bold text-gray-800">{message}</p>
        <p className="text-[13px] text-gray-400 mt-1 max-w-xs">{sub}</p>
      </div>
    </div>
  );
}

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

// ── Accepted tab — uses real API data ─────────────────────────────────────────
function AcceptedTable({
  rows,
  total,
  page,
  isLoading,
  onPageChange,
}: {
  rows:         InHouseAcceptedRowVM[];
  total:        number;
  page:         number;
  isLoading:    boolean;
  onPageChange: (p: number) => void;
}) {
  if (!isLoading && rows.length === 0) {
    return (
      <EmptyState
        message="No Invitations Accepted Yet"
        sub="Once a candidate accepts your in-house request on the KeRaeva app, they will appear here."
      />
    );
  }

  return (
    <>
      <table className="w-full">
        <thead>
          <tr className="bg-orange-50/60">
            <th className={TH}>Candidate Name</th>
            <th className={TH}>Location</th>
            <th className={TH}>Joined</th>
            <th className={`${TH} text-center`}>Action</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <SkeletonRows cols={4} />
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

                {/* Location — pre-formatted as "City, State" by the mapper */}
                <td className={TD}>
                  <span className="text-gray-500">{c.location}</span>
                </td>

                {/* Joined date */}
                <td className={TD}>
                  {new Date(c.joined_at).toLocaleDateString("en-GB", {
                    day: "2-digit", month: "short", year: "numeric",
                  })}
                </td>

                {/* View action */}
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
      {!isLoading && total > PAGE_LIMIT && (
        <PaginationBar
          total={total}
          page={page}
          perPage={PAGE_LIMIT}
          onPageChange={onPageChange}
        />
      )}
    </>
  );
}

// ── Invited tab — local optimistic only (no backend GET for pending invites) ──
function InvitedTable({
  rows,
  page,
  onPageChange,
}: {
  rows:         LocalInvite[];
  page:         number;
  onPageChange: (p: number) => void;
}) {
  if (rows.length === 0) {
    return (
      <EmptyState
        message="No Invitations Sent Yet"
        sub="Invite your in-house staff to get started."
      />
    );
  }

  // Client-side paginate local rows
  const paged = rows.slice((page - 1) * PAGE_LIMIT, page * PAGE_LIMIT);

  return (
    <>
      <table className="w-full">
        <thead>
          <tr className="bg-orange-50/60">
            <th className={TH}>Candidate Name</th>
            <th className={TH}>Email</th>
            <th className={TH}>Status</th>
            <th className={TH}>Invited On</th>
          </tr>
        </thead>
        <tbody>
          {paged.map((c) => (
            <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
              <td className={TD}>{c.full_name}</td>
              <td className={TD}>{c.email || "—"}</td>
              <td className={TD}>
                <span className="text-[12px] font-medium px-2.5 py-1 rounded-full bg-orange-50 text-orange-500">
                  Invitation Sent
                </span>
              </td>
              <td className={TD}>{c.invited_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > PAGE_LIMIT && (
        <PaginationBar
          total={rows.length}
          page={page}
          perPage={PAGE_LIMIT}
          onPageChange={onPageChange}
        />
      )}
    </>
  );
}

// ── Main section ──────────────────────────────────────────────────────────────
export function InHouseCandidatesSection({
  candidateId = "",
  jobId       = "",
  openModalOnMount = false,    // ← new
  onModalMounted, 
}: {
  candidateId?: string;
  jobId?:       string;
  openModalOnMount?: boolean;
  onModalMounted?:  () => void;
}) {
  const [activeTab,        setActiveTab]        = useState<InHouseTab>("accepted");
  const [showAddModal,     setShowAddModal]     = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailModal,    setShowFailModal]    = useState(false);
  const [inviteCount,      setInviteCount]      = useState(0);
  const [failedEmails,     setFailedEmails]     = useState<string[]>([]);
  const [viewMode,         setViewMode]         = useState<"grid" | "list">("list");

  const [acceptedPage, setAcceptedPage] = useState(1);
  const [invitedPage,  setInvitedPage]  = useState(1);

  // ✅ Local-only invite store (no GET invites endpoint on backend)
  const [localInvites, setLocalInvites] = useState<LocalInvite[]>([]);

  // ✅ Single hook — replaces useInHouseAccepted + useInHouseInvited
  const { rows: acceptedRows, total: acceptedTotal, isLoading } = useInHouseCandidates();

  const handleSuccess = (count: number, entries: StaffEntry[]) => {
    const now = new Date().toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    });
    const newInvites: LocalInvite[] = entries.map((e, i) => ({
      id:         `local-${Date.now()}-${i}`,
      full_name:  e.name.trim(),
      email:      e.email.trim(),
      invited_at: now,
    }));
    setLocalInvites((prev) => [...newInvites, ...prev]);
    setInviteCount(count);
    setShowAddModal(false);
    setInvitedPage(1);
    setActiveTab("invited");
    setShowSuccessModal(true);
  };

  const handlePartialFail = (emails: string[]) => {
    setFailedEmails(emails);
    setShowAddModal(false);
    setShowFailModal(true);
  };
  useEffect(() => {
    if (openModalOnMount) {
      setShowAddModal(true);
      onModalMounted?.();
    }
  }, [openModalOnMount, onModalMounted]);
  return (
    <>
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
        <SuccessModal count={inviteCount} onDone={() => setShowSuccessModal(false)} />
      )}
      {showFailModal && (
        <PartialFailModal failedEmails={failedEmails} onClose={() => setShowFailModal(false)} />
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Tabs + actions */}
        <div className="flex items-center justify-between px-1 border-b border-gray-100 overflow-visible">
          <div className="flex">
            {(["accepted", "invited"] as InHouseTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3.5 text-[13px] font-semibold capitalize transition-colors relative overflow-visible ${
                  activeTab === tab ? "text-[#F4781B]" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === "invited" && localInvites.length > 0 && (
                  <span className="ml-1.5 text-[10px] bg-[#F4781B] text-white font-bold px-1.5 py-0.5 rounded-full">
                    {localInvites.length}
                  </span>
                )}
                {activeTab === tab && (
                  <span className="absolute -bottom-px left-0 right-0 h-[2px] bg-[#F4781B] rounded-t-full" />
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 pr-2">
            <button className="flex items-center gap-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 text-[12px] font-medium px-3.5 py-2 rounded-xl transition-colors">
              <Filter size={13} /> Filter
            </button>
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2.5 transition-colors ${viewMode === "grid" ? "bg-gray-100 text-gray-700" : "text-gray-400 hover:bg-gray-50"}`}
              >
                <LayoutGrid size={15} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2.5 transition-colors ${viewMode === "list" ? "bg-gray-100 text-gray-700" : "text-gray-400 hover:bg-gray-50"}`}
              >
                <List size={15} />
              </button>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 bg-[#F4781B] hover:bg-[#e06a10] text-white text-[12px] font-semibold px-3.5 py-2 rounded-xl transition-colors"
            >
              <Plus size={13} /> Add Staff
            </button>
          </div>
        </div>

        {activeTab === "accepted" && (
          <AcceptedTable
            rows={acceptedRows}
            total={acceptedTotal}
            page={acceptedPage}
            isLoading={isLoading}
            onPageChange={setAcceptedPage}
          />
        )}
        {activeTab === "invited" && (
          <InvitedTable
            rows={localInvites}
            page={invitedPage}
            onPageChange={setInvitedPage}
          />
        )}
      </div>
    </>
  );
}