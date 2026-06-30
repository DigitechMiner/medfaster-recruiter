"use client";
import { useState, useCallback } from "react";
import Image from "next/image";
import { MessageSquare, MoreVertical, Phone } from "lucide-react";
import { DataTable } from "@/components/table/DataTable";
import { PaginationFooter } from "@/components/table/PaginationFooter";
import { EmptyState } from "@/app/jobs/[id]/components/shared/JobDetailDataView";
import { useTodayShifts } from "@/hooks/useDashboard";
import type { DashboardShiftRange, TodayShift } from "@/features/dashboard";
import { getBackendImageUrl } from "@/stores/api/api-client";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const HEADERS = ["Candidate", "Job & Time", "Status", "Action"];
const TD = "px-4 py-3 text-sm text-gray-700 border-b border-gray-50";
const PER_PAGE_OPTIONS = [5, 10, 20];

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  ACTIVE:        { label: "Active",           className: "bg-green-100 text-green-700" },
  UPCOMING:      { label: "Pending Check-In", className: "bg-yellow-100 text-yellow-700" },
  LATE_CHECK_IN: { label: "Late (10m)",        className: "bg-orange-100 text-orange-700" },
  COMPLETED:     { label: "Completed",         className: "bg-gray-100 text-gray-500" },
  CANCELLED:     { label: "Cancelled",         className: "bg-red-50 text-red-400" },
  MISSED:        { label: "No-Show",           className: "bg-red-100 text-red-700" },
};

const AVATAR_COLORS = [
  "bg-orange-100 text-[#F4781B]",
  "bg-blue-100 text-blue-600",
  "bg-green-100 text-green-600",
  "bg-purple-100 text-purple-600",
  "bg-pink-100 text-pink-600",
];

function candidateInitials(first: string, last: string) {
  return `${first.trim()[0] ?? ""}${last.trim()[0] ?? ""}`.toUpperCase() || "?";
}

type ShiftRow = {
  id: string;
  initials: string;
  profileImage: string | null;
  name: string;
  role: string;
  scheduledTime: string;
  status: string;
  candidateId: string;
};

function mapRow(shift: TodayShift): ShiftRow {
  const c = shift.candidate_profile;
  return {
    id: shift.shift_id,
    initials: candidateInitials(c.first_name, c.last_name),
    profileImage: c.profile_image_url ? getBackendImageUrl(c.profile_image_url) || null : null,
    name: `${c.first_name} ${c.last_name}`.trim(),
    role: shift.job_title,
    scheduledTime: `${shift.shift_check_in_time.slice(0, 5)} – ${shift.shift_check_out_time.slice(0, 5)}`,
    status: shift.shift_status,
    candidateId: c.id,
  };
}

// ← range now comes from parent (DashboardPage)
interface TodaysOperationsPanelProps {
  range: DashboardShiftRange;
}

export function TodaysOperationsPanel({ range }: TodaysOperationsPanelProps) {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const router = useRouter();

  const { shifts, total, isLoading, isError, error, refetch } =
    useTodayShifts(range, page, perPage);
  const rows = shifts.map((s) => mapRow(s));

  const handleMessage = useCallback(
    (id: string) => router.push(`/messages?candidateId=${encodeURIComponent(id)}`),
    [router],
  );

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col ">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-900">Today&apos;s Operations</h2>
        <button
  type="button"
  className="text-xs text-[#F4781B] font-medium hover:underline"
  onClick={() => router.push("/calendar")}
>
  View Full Schedule
</button>
      </div>

      {/* NO range tabs here anymore — controlled from header */}

      {isError ? (
        <div className="px-5 py-10 text-center text-sm text-red-600 flex-1">
          <p>{error instanceof Error ? error.message : "Failed to load shifts"}</p>
          <button type="button" onClick={() => refetch()} className="mt-2 text-xs text-[#F4781B] hover:underline font-medium">
            Retry
          </button>
        </div>
      ) : (
        <>
          <DataTable headers={HEADERS} minWidthClassName="min-w-[480px]">
            {isLoading
              ? Array.from({ length: perPage }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td colSpan={HEADERS.length} className={TD}>
                      <div className="h-4 w-3/4 max-w-sm rounded bg-gray-200 animate-pulse" />
                    </td>
                  </tr>
                ))
              : rows.length === 0
              ? (
                  <tr>
                    <td colSpan={HEADERS.length} className="px-4 py-12">
                      <EmptyState title="No shifts found" description="No shifts match the selected time range." />
                    </td>
                  </tr>
                )
              : rows.map((row, idx) => {
                  const s  = STATUS_CONFIG[row.status] ?? STATUS_CONFIG.UPCOMING;
                  const av = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                  return (
                    <tr key={row.id} className="border-b border-gray-50 hover:bg-orange-50/30 transition-colors">
                      <td className={TD}>
                        <div className="flex items-center gap-2.5">
                          <div className={cn("w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold shrink-0", row.profileImage ? "bg-gray-100" : av)}>
                            {row.profileImage
                              ? <Image src={row.profileImage} alt={row.name} width={32} height={32} className="object-cover w-full h-full" />
                              : row.initials}
                          </div>
                          <span className="font-medium text-gray-900 whitespace-nowrap">{row.name}</span>
                        </div>
                      </td>
                      <td className={TD}>
                        <p className="font-medium text-gray-900">{row.role}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{row.scheduledTime}</p>
                      </td>
                      <td className={TD}>
                        <span className={cn("inline-flex text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap", s.className)}>
                          {s.label}
                        </span>
                      </td>
                      <td className={TD}>
                        <div className="flex items-center gap-2 text-gray-300">
                          <button type="button" className="hover:text-[#F4781B] transition-colors" aria-label="Call">
                            <Phone className="w-4 h-4" />
                          </button>
                          <button type="button" className="hover:text-[#F4781B] transition-colors" aria-label="Message" onClick={() => handleMessage(row.candidateId)}>
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button type="button" className="hover:text-gray-500 transition-colors" aria-label="More">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
          </DataTable>
          {!isLoading && rows.length > 0 && (
            <PaginationFooter
              page={page}
              totalItems={total}
              perPage={perPage}
              onPageChange={setPage}
              itemLabel="shifts"
              perPageOptions={PER_PAGE_OPTIONS}
              onPerPageChange={(next) => { setPerPage(next); setPage(1); }}
            />
          )}
        </>
      )}
    </div>
  );
}