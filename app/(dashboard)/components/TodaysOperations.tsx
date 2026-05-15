"use client";

import { useCallback, useState, type ReactNode } from "react";
import Image from "next/image";
import { MapPin, MessageSquare, MoreVertical, Phone } from "lucide-react";
import { DataTable } from "@/components/table/DataTable";
import { PaginationFooter } from "@/components/table/PaginationFooter";
import { EmptyState } from "@/app/jobs/[id]/components/JobDetailDataView";
import { useTodayShifts } from "@/hooks/useDashboard";
import type { DashboardShiftRange, TodayShift } from "@/features/dashboard";
import type { MetadataValueOption } from "@/features/common";
import {
  resolveCanadianProvinceLabel,
  useMetadataStore,
} from "@/stores/metadataStore";
import { getBackendImageUrl } from "@/stores/api/api-client";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const HEADERS = [
  "Candidate",
  "Job & Location",
  "Start date",
  "Scheduled",
  "Attendance",
  "Work",
  "Status",
  "Action",
];

const TD = "px-4 py-3.5 text-sm text-gray-700 border-b border-gray-50";

const PER_PAGE_OPTIONS = [5, 10, 20, 50];

const RANGE_OPTIONS: { value: DashboardShiftRange; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
];

const EMPTY_BY_RANGE: Record<
  DashboardShiftRange,
  { title: string; description: string }
> = {
  today: {
    title: "No shifts scheduled for today",
    description: "When candidates have shifts today, they will appear here.",
  },
  week: {
    title: "No shifts scheduled this week",
    description: "When candidates have shifts this week, they will appear here.",
  },
  month: {
    title: "No shifts scheduled this month",
    description: "When candidates have shifts this month, they will appear here.",
  },
};

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: "Active", className: "bg-green-100 text-green-700" },
  UPCOMING: {
    label: "Pending Check-In",
    className: "bg-yellow-100 text-yellow-700",
  },
  LATE_CHECK_IN: {
    label: "Late Check-In",
    className: "bg-orange-100 text-orange-700",
  },
  COMPLETED: { label: "Completed", className: "bg-gray-100 text-gray-500" },
  CANCELLED: { label: "Cancelled", className: "bg-red-50 text-red-400" },
  MISSED: { label: "No-Show", className: "bg-red-100 text-red-600" },
};

const AVATAR_COLORS = [
  "bg-orange-100 text-[#F4781B]",
  "bg-blue-100 text-blue-600",
  "bg-green-100 text-green-600",
  "bg-purple-100 text-purple-600",
  "bg-pink-100 text-pink-600",
];

type ShiftRow = {
  id: string;
  initials: string;
  profileImage: string | null;
  name: string;
  role: string;
  location: string;
  startDate: string;
  scheduledTime: string;
  expectedMinutes: number | null;
  checkInLabel: string;
  checkOutLabel: string;
  checkOutSource: string | null;
  workedMinutes: number | null;
  lateMinutes: number;
  earlyLeaveMinutes: number;
  status: string;
  candidateId: string;
};

function formatShiftTime(checkIn: string, checkOut: string): string {
  return `${checkIn.slice(0, 5)} – ${checkOut.slice(0, 5)}`;
}

function formatShiftLocation(
  provinces: readonly MetadataValueOption[],
  shift: TodayShift,
): string {
  const provinceLabel = resolveCanadianProvinceLabel(provinces, shift.province);
  const line = [shift.street, shift.city, provinceLabel || shift.province]
    .filter(Boolean)
    .join(", ");
  return line || "—";
}

function formatDateLabel(iso: string): string {
  if (!iso) return "";
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateRange(dateFrom: string, dateTo: string): string | null {
  if (!dateFrom || !dateTo) return null;
  const from = formatDateLabel(dateFrom);
  const to = formatDateLabel(dateTo);
  if (!from || !to) return null;
  return from === to ? from : `${from} – ${to}`;
}

function formatActualTimestamp(
  iso: string | null | undefined,
  shiftDate: string,
): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";

  const time = date.toLocaleTimeString("en-CA", {
    hour: "numeric",
    minute: "2-digit",
  });
  const datePart = iso.slice(0, 10);
  if (datePart && shiftDate && datePart !== shiftDate) {
    return `${formatDateLabel(datePart)} ${time}`;
  }
  return time;
}

function formatDuration(minutes?: number | null): string {
  if (minutes == null || !Number.isFinite(minutes)) return "—";
  const value = Math.max(0, Math.round(minutes));
  const hours = Math.floor(value / 60);
  const remaining = value % 60;
  if (hours === 0) return `${remaining}m`;
  return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`;
}

function formatCheckOutSource(source?: string | null): string | null {
  if (!source) return null;
  return source
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function candidateInitials(firstName: string, lastName: string): string {
  const first = firstName.trim()[0] ?? "";
  const last = lastName.trim()[0] ?? "";
  const initials = `${first}${last}`.toUpperCase();
  return initials || "?";
}

function mapShiftToRow(
  shift: TodayShift,
  provinces: readonly MetadataValueOption[],
): ShiftRow {
  const { candidate_profile: candidate } = shift;
  const profileImage = candidate.profile_image_url
    ? getBackendImageUrl(candidate.profile_image_url) || null
    : null;

  return {
    id: shift.shift_id,
    initials: candidateInitials(candidate.first_name, candidate.last_name),
    profileImage,
    name: `${candidate.first_name} ${candidate.last_name}`.trim(),
    role: shift.job_title,
    location: formatShiftLocation(provinces, shift),
    startDate: formatDateLabel(shift.shift_date),
    scheduledTime: formatShiftTime(
      shift.shift_check_in_time,
      shift.shift_check_out_time,
    ),
    expectedMinutes: shift.total_expected_work_minutes ?? null,
    checkInLabel: formatActualTimestamp(shift.check_in, shift.shift_date),
    checkOutLabel: formatActualTimestamp(shift.check_out, shift.shift_date),
    checkOutSource: formatCheckOutSource(shift.check_out_source),
    workedMinutes: shift.total_work_minutes ?? null,
    lateMinutes: shift.late_minutes ?? 0,
    earlyLeaveMinutes: shift.early_leave_minutes ?? 0,
    status: shift.shift_status,
    candidateId: shift.candidate_profile.id,
  };
}

type TodaysOperationsProps = {
  embedded?: boolean;
};

function RangeSelector({
  range,
  onRangeChange,
  className,
}: {
  range: DashboardShiftRange;
  onRangeChange: (next: DashboardShiftRange) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1",
        className,
      )}
    >
      {RANGE_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onRangeChange(opt.value)}
          className={cn(
            "px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap",
            range === opt.value
              ? "bg-white text-[#F4781B] shadow-sm"
              : "text-gray-600 hover:text-gray-900",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function AttendanceBadge({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap",
        className,
      )}
    >
      {children}
    </span>
  );
}

export const TodaysOperations = ({ embedded = false }: TodaysOperationsProps) => {
  const [range, setRange] = useState<DashboardShiftRange>("today");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const router = useRouter();

  const {
    shifts,
    dateFrom,
    dateTo,
    total,
    isLoading,
    isError,
    error,
    refetch,
  } = useTodayShifts(range, page, perPage);

  const provinceOptions = useMetadataStore((s) => s.provinceOptions);
  const dateRangeLabel = formatDateRange(dateFrom, dateTo);
  const emptyState = EMPTY_BY_RANGE[range];
  const rows = shifts.map((shift) => mapShiftToRow(shift, provinceOptions));
  const handleMessageClick = useCallback(
  (candidateId: string) => {
    router.push(`/messages?candidateId=${encodeURIComponent(candidateId)}`);
  },
  [router],
);
  const toolbar = (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="min-w-0">
        <RangeSelector
          range={range}
          onRangeChange={(next) => {
            setRange(next);
            setPage(1);
          }}
        />
        {dateRangeLabel && (
          <p className="text-xs text-gray-500 mt-1.5">{dateRangeLabel}</p>
        )}
      </div>
      {isError && (
        <button
          type="button"
          onClick={() => refetch()}
          className="text-xs font-medium text-[#F4781B] hover:underline shrink-0"
        >
          Retry
        </button>
      )}
    </div>
  );

  const tableBody = isError ? (
    <div className="px-6 py-10 text-center text-sm text-red-600">
      {error instanceof Error ? error.message : "Failed to load shifts"}
    </div>
  ) : (
    <>
      <DataTable headers={HEADERS} minWidthClassName="min-w-[1080px]">
        {isLoading ? (
          Array.from({ length: perPage }).map((_, i) => (
            <tr key={i} className="border-b border-gray-50">
              <td colSpan={HEADERS.length} className={TD}>
                <div className="h-4 w-3/4 max-w-md rounded-md bg-gray-200 animate-pulse" />
              </td>
            </tr>
          ))
        ) : rows.length === 0 ? (
          <tr>
            <td colSpan={HEADERS.length} className="px-4 py-12">
              <EmptyState
                title={emptyState.title}
                description={emptyState.description}
              />
            </td>
          </tr>
        ) : (
          rows.map((row, idx) => {
            const statusCfg =
              STATUS_CONFIG[row.status] ?? STATUS_CONFIG.UPCOMING;
            const avatarCls = AVATAR_COLORS[idx % AVATAR_COLORS.length];

            return (
              <tr
                key={row.id}
                className="border-b border-gray-50 hover:bg-orange-50/30 transition-colors"
              >
                <td className={TD}>
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold shrink-0 ${!row.profileImage ? avatarCls : "bg-gray-100"}`}
                    >
                      {row.profileImage ? (
                        <Image
                          src={row.profileImage}
                          alt={row.name}
                          width={32}
                          height={32}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        row.initials
                      )}
                    </div>
                    <span className="font-medium text-gray-900 whitespace-nowrap">
                      {row.name}
                    </span>
                  </div>
                </td>
                <td className={TD}>
                  <p className="font-medium text-gray-900">{row.role}</p>
                  <p className="flex items-start gap-1 text-xs text-gray-500 mt-1 max-w-[200px]">
                    <MapPin
                      className="w-3 h-3 shrink-0 mt-0.5 text-gray-400"
                      aria-hidden
                    />
                    <span className="line-clamp-2">{row.location}</span>
                  </p>
                </td>
                <td className={`${TD} text-gray-600 whitespace-nowrap`}>
                  {row.startDate || "—"}
                </td>
                <td className={TD}>
                  <p className="font-medium text-gray-900 whitespace-nowrap">
                    {row.scheduledTime}
                  </p>
                  {row.expectedMinutes != null && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      Expected {formatDuration(row.expectedMinutes)}
                    </p>
                  )}
                </td>
                <td className={TD}>
                  <p className="text-xs text-gray-600">
                    <span className="text-gray-400">In:</span>{" "}
                    <span className="font-medium text-gray-800">
                      {row.checkInLabel}
                    </span>
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    <span className="text-gray-400">Out:</span>{" "}
                    <span className="font-medium text-gray-800">
                      {row.checkOutLabel}
                    </span>
                  </p>
                  {row.checkOutSource && (
                    <p className="text-[10px] text-gray-400 mt-1">
                      via {row.checkOutSource}
                    </p>
                  )}
                </td>
                <td className={TD}>
                  <p className="text-xs text-gray-800 font-medium whitespace-nowrap">
                    Worked {formatDuration(row.workedMinutes)}
                    {row.expectedMinutes != null && (
                      <span className="text-gray-400 font-normal">
                        {" "}
                        / {formatDuration(row.expectedMinutes)}
                      </span>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {row.lateMinutes > 0 && (
                      <AttendanceBadge className="bg-red-50 text-red-600">
                        Late {row.lateMinutes}m
                      </AttendanceBadge>
                    )}
                    {row.earlyLeaveMinutes > 0 && (
                      <AttendanceBadge className="bg-yellow-50 text-yellow-700">
                        Early {row.earlyLeaveMinutes}m
                      </AttendanceBadge>
                    )}
                  </div>
                </td>
                <td className={TD}>
                  <span
                    className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${statusCfg.className}`}
                  >
                    {statusCfg.label}
                  </span>
                </td>
                <td className={TD}>
                  <div className="flex items-center gap-2.5 text-gray-300">
                    <button
                      type="button"
                      className="hover:text-[#F4781B] transition-colors"
                      aria-label="Call"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      className="hover:text-[#F4781B] transition-colors"
                      aria-label="Message"
                      onClick={() => handleMessageClick(row.candidateId)}
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      className="hover:text-gray-500 transition-colors"
                      aria-label="More"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })
        )}
      </DataTable>

      {!isLoading && rows.length > 0 && (
        <PaginationFooter
          page={page}
          totalItems={total}
          perPage={perPage}
          onPageChange={setPage}
          itemLabel="shifts"
          perPageOptions={PER_PAGE_OPTIONS}
          onPerPageChange={(next) => {
            setPerPage(next);
            setPage(1);
          }}
        />
      )}
    </>
  );

  if (embedded) {
    return (
      <div className="min-h-0">
        <div className="px-4 sm:px-6 pb-3">{toolbar}</div>
        {tableBody}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">
            Today&apos;s Operations
          </h2>
          {dateRangeLabel && (
            <p className="text-xs text-gray-500 mt-0.5">{dateRangeLabel}</p>
          )}
        </div>
        <button
          type="button"
          className="text-xs text-[#F4781B] font-medium hover:underline shrink-0"
        >
          View Full Schedule
        </button>
      </div>
      <div className="px-5 py-3 border-b border-gray-50">{toolbar}</div>
      {tableBody}
    </div>
  );
};
