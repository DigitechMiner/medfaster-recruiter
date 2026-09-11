"use client";

import { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import { CalendarDays, Clock, MapPin, Timer, Users } from "lucide-react";
import { toast } from "react-toastify";
import { PaginationFooter } from "@/components/table/PaginationFooter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createRecruiterShiftDispute } from "@/features/jobs";
import { useJobShifts } from "@/hooks/useJobData";
import { useNow } from "@/hooks/useNow";
import type { JobShiftAssignment, JobShiftItem, JobShiftStaffingGap } from "@/types";
import {
  EmptyState,
  LoadingRows,
} from "../shared/JobDetailDataView";
import { formatDate, formatLabel, formatPay, formatTime } from "../shared/job-detail-helpers";
import { ShiftCountdown } from "@/components/ShiftCountdown";

type ShiftStatus = "UPCOMING" | "ACTIVE" | "COMPLETED" | "CANCELLED" | "MISSED";
type ShiftStatusFilter = ShiftStatus | "BOTH" | "ALL";

const SHIFT_LIMIT = 10;

const SHIFT_STATUSES: ShiftStatus[] = [
  "UPCOMING",
  "ACTIVE",
  "COMPLETED",
  "CANCELLED",
  "MISSED",
];

const SHIFT_STATUS_FILTERS: { value: ShiftStatusFilter; label: string }[] = [
  { value: "UPCOMING", label: "Upcoming" },
  { value: "ACTIVE", label: "Active" },
  { value: "BOTH", label: "Both" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "MISSED", label: "Missed" },
  { value: "ALL", label: "All" },
];

const SHIFT_STATUS_QUERY: Record<ShiftStatusFilter, string | undefined> = {
  UPCOMING: "UPCOMING",
  ACTIVE: "ACTIVE",
  BOTH: "ACTIVE,UPCOMING",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  MISSED: "MISSED",
  ALL: undefined,
};

const SHIFT_FILTER_EMPTY_TITLE: Record<ShiftStatusFilter, string> = {
  UPCOMING: "No upcoming shifts",
  ACTIVE: "No active shifts",
  BOTH: "No live shifts",
  COMPLETED: "No completed shifts",
  CANCELLED: "No cancelled shifts",
  MISSED: "No missed shifts",
  ALL: "No shifts available",
};

const SHIFT_STATUS_LABELS: Record<ShiftStatus, string> = {
  UPCOMING: "Upcoming",
  ACTIVE: "Active",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  MISSED: "Missed",
};

const SHIFT_STATUS_STYLES: Record<ShiftStatus, string> = {
  UPCOMING: "border-blue-100 bg-blue-50 text-blue-600",
  ACTIVE: "border-green-100 bg-green-50 text-green-700",
  COMPLETED: "border-gray-200 bg-gray-100 text-gray-700",
  CANCELLED: "border-red-100 bg-red-50 text-red-600",
  MISSED: "border-yellow-100 bg-yellow-50 text-yellow-700",
};

type ShiftStaffing = {
  required: number;
  assigned: number;
  open: number;
};

type ShiftCard = {
  id: string;
  date?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  plannedCheckInAt?: string | null;
  plannedCheckOutAt?: string | null;
  duration?: number | string | null;
  status?: string | null;
  province?: string | null;
  assignmentsCount: number;
  staffing: ShiftStaffing;
  staffingGap?: JobShiftStaffingGap | null;
  candidates: ShiftCandidate[];
};

type ShiftCandidate = {
  id: string;
  assignmentId?: string | null;
  name: string;
  image?: string | null;
  assignmentStatus?: string | null;
  hourlyRateCents?: number | string | null;
  platformFeeCents?: number | string | null;
  estimatedPayCents?: number | string | null;
  attendance?: {
    checkedIn: boolean;
    checkedOut: boolean;
    checkInTime?: string | null;
    checkOutTime?: string | null;
    lateMinutes: number;
    earlyLeaveMinutes: number;
    workedMinutes?: number | string | null;
  };
  payment?: {
    status?: string | null;
    amountCents?: number | string | null;
    plannedAmountCents?: number | string | null;
    releasedAmountCents?: number | string | null;
    refundAmountCents?: number | string | null;
    platformFeeCents?: number | string | null;
  };
};

type JobShiftsTabProps = {
  jobId: string;
  enabled?: boolean;
  title?: string;
  startDate?: string | null;
  endDate?: string | null;
  checkInTime?: string | null;
  checkOutTime?: string | null;
};

export function JobShiftsTab({
  jobId,
  enabled = true,
  title = "Live shifts",
  startDate: jobStartDateProp,
  endDate: jobEndDateProp,
  checkInTime,
  checkOutTime,
}: JobShiftsTabProps) {
  const [status, setStatus] = useState<ShiftStatusFilter>("BOTH");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(SHIFT_LIMIT);
  const [disputeCandidate, setDisputeCandidate] = useState<ShiftCandidate | null>(null);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeDescription, setDisputeDescription] = useState("");
  const [isCreatingDispute, setIsCreatingDispute] = useState(false);
  const jobStartDate = toDateInputValue(jobStartDateProp);
  const jobEndDate = toDateInputValue(jobEndDateProp);
  const statusQuery = SHIFT_STATUS_QUERY[status];
  const requestedStatuses = useMemo(
    () => getRequestedShiftStatuses(status),
    [status],
  );
  const { shifts, isLoading, error } = useJobShifts(
    enabled ? jobId : null,
    {
      status: statusQuery,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      page,
      limit: perPage,
    },
  );
  const apiShifts = useMemo(() => shifts?.shifts ?? [], [shifts?.shifts]);
  const pagination = shifts?.pagination;
  const hasServerPagination = pagination?.total != null;
  const shiftCards = useMemo(
    () => apiShifts.map((shift, index) => mapJobShift(shift, index)),
    [apiShifts],
  );
  const hasLiveCountdown = useMemo(
    () =>
      shiftCards.some(
        (shift) => shift.plannedCheckInAt || shift.plannedCheckOutAt,
      ),
    [shiftCards],
  );
  const nowMs = useNow(enabled && hasLiveCountdown);
  const matchingShifts = useMemo(() => {
    if (hasServerPagination || requestedStatuses == null) return shiftCards;
    return shiftCards.filter((shift) => {
      const shiftStatus = getShiftStatus(shift.status);
      return shiftStatus != null && requestedStatuses.includes(shiftStatus);
    });
  }, [hasServerPagination, requestedStatuses, shiftCards]);
  const visibleShifts = useMemo(() => {
    if (hasServerPagination) return matchingShifts;
    const startIndex = (page - 1) * perPage;
    return matchingShifts.slice(startIndex, startIndex + perPage);
  }, [hasServerPagination, matchingShifts, page, perPage]);
  const totalShifts = hasServerPagination
    ? (pagination?.total ?? visibleShifts.length)
    : matchingShifts.length;
  const currentPage = hasServerPagination ? (pagination?.page ?? page) : page;
  const pageSize = hasServerPagination ? (pagination?.limit ?? perPage) : perPage;
  const groupedShifts = useMemo(
    () => groupShiftsByDate(visibleShifts),
    [visibleShifts],
  );
  const isDisputeFormEmpty = !disputeReason.trim() && !disputeDescription.trim();

  const resetDisputeForm = useCallback(() => {
    setDisputeCandidate(null);
    setDisputeReason("");
    setDisputeDescription("");
    setIsCreatingDispute(false);
  }, []);

  const handleDisputeClick = useCallback((candidate: ShiftCandidate) => {
    setDisputeCandidate(candidate);
    setDisputeReason("");
    setDisputeDescription("");
  }, []);

  const handleCreateDispute = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!disputeCandidate?.assignmentId) {
      toast.error("Assignment ID is missing for this candidate.");
      return;
    }
    if (isDisputeFormEmpty) {
      toast.error("Enter a reason or description to create a dispute.");
      return;
    }

    setIsCreatingDispute(true);

    try {
      const response = await createRecruiterShiftDispute({
        assignment_id: disputeCandidate.assignmentId,
        reason: disputeReason.trim() || undefined,
        description: disputeDescription.trim() || undefined,
      });
      toast.success(response.message || "Dispute created successfully.");
      resetDisputeForm();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to create dispute."));
    } finally {
      setIsCreatingDispute(false);
    }
  };

  return (
      <>
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="flex flex-col gap-4 border-b border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
              <p className="mt-0.5 text-xs text-gray-400">
                {getFilterSubtitle(status, totalShifts, isLoading)}
              </p>
            </div>
            <div className="flex flex-wrap items-end gap-2">
              <label className="flex flex-col gap-1 text-[11px] font-medium text-gray-500">
                Start
                <input
                  type="date"
                  value={startDate}
                  min={jobStartDate || undefined}
                  max={endDate || jobEndDate || undefined}
                  onChange={(event) => {
                    setStartDate(event.target.value);
                    setPage(1);
                  }}
                  className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 outline-none focus:border-[#F4781B]"
                />
              </label>
              <label className="flex flex-col gap-1 text-[11px] font-medium text-gray-500">
                End
                <input
                  type="date"
                  value={endDate}
                  min={startDate || jobStartDate || undefined}
                  max={jobEndDate || undefined}
                  onChange={(event) => {
                    setEndDate(event.target.value);
                    setPage(1);
                  }}
                  className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 outline-none focus:border-[#F4781B]"
                />
              </label>
              {(startDate || endDate) && (
                <button
                  type="button"
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                    setPage(1);
                  }}
                  className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm font-medium text-gray-500 transition hover:border-orange-200 hover:text-[#F4781B]"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 border-b border-gray-100 px-4 py-2.5 sm:px-5">
            {SHIFT_STATUS_FILTERS.map((filter) => {
              const isActive = status === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => {
                    setStatus(filter.value);
                    setPage(1);
                  }}
                  className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition ${
                    isActive
                      ? "border-[#F4781B] bg-orange-50 text-[#F4781B]"
                      : "border-gray-200 bg-white text-gray-500 hover:border-orange-200 hover:text-[#F4781B]"
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>

          <div className="px-4 py-4 sm:px-5">
            {isLoading ? (
              <LoadingRows />
            ) : error ? (
              <EmptyState title="Unable to load shifts" description={error} />
            ) : totalShifts === 0 ? (
              <EmptyState
                title={SHIFT_FILTER_EMPTY_TITLE[status]}
                description={
                  status === "ALL"
                    ? "Shift records will appear here once available."
                    : "Try another status or date range."
                }
              />
            ) : (
              <div className="flex flex-col gap-5">
                {groupedShifts.map((group) => (
                  <div key={group.key} className="flex flex-col gap-3">
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                      <CalendarDays size={14} className="text-[#F4781B]" />
                      {group.label}
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
                        {group.shifts.length}{" "}
                        {group.shifts.length === 1 ? "shift" : "shifts"}
                      </span>
                    </h4>
                    {group.shifts.map((shift) => (
                      <article
                        key={shift.id}
                        className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
                      >
                        <div className="flex flex-col gap-3 border-b border-gray-100 bg-gray-50/70 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex min-w-0 items-center gap-2.5">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#F4781B] ring-1 ring-orange-100">
                              <Clock size={15} />
                            </span>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h5 className="text-sm font-bold text-gray-900">
                                  {formatTime(shift.startTime ?? checkInTime)} –{" "}
                                  {formatTime(shift.endTime ?? checkOutTime)}
                                </h5>
                                <ShiftStatusPill value={shift.status} />
                              </div>
                              <ShiftCountdown
                                plannedCheckInAt={shift.plannedCheckInAt}
                                plannedCheckOutAt={shift.plannedCheckOutAt}
                                nowMs={nowMs}
                                className="mt-0.5 block text-[11px]"
                              />
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5">
                            {shift.duration != null && shift.duration !== "" && (
                              <ShiftMetaChip
                                icon={<Timer size={12} />}
                                label={`${formatDuration(shift.duration)} planned`}
                              />
                            )}
                            <ShiftMetaChip
                              icon={<Users size={12} />}
                              label={`${shift.staffing.assigned}/${shift.staffing.required} assigned`}
                            />
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                shift.staffing.open > 0
                                  ? "bg-orange-50 text-[#F4781B]"
                                  : "bg-green-50 text-green-700"
                              }`}
                            >
                              {shift.staffing.open > 0
                                ? `${shift.staffing.open} open`
                                : "Filled"}
                            </span>
                            {shift.province && (
                              <ShiftMetaChip
                                icon={<MapPin size={12} />}
                                label={formatLabel(shift.province)}
                              />
                            )}
                          </div>
                        </div>

                        {shift.candidates.length > 0 || shift.staffing.open > 0 ? (
                          <div className="flex flex-col gap-2 p-2.5">
                            {shift.candidates.map((candidate) => (
                              <ShiftCandidateRow
                                key={candidate.assignmentId ?? candidate.id}
                                candidate={candidate}
                                shift={shift}
                                onDisputeClick={() =>
                                  handleDisputeClick(candidate)
                                }
                              />
                            ))}
                            {Array.from({ length: shift.staffing.open }).map(
                              (_, openIndex) => (
                                <OpenShiftSlot
                                  key={`${shift.id}-open-${openIndex}`}
                                />
                              ),
                            )}
                          </div>
                        ) : (
                          <p className="px-3 py-3 text-center text-xs font-medium text-gray-400">
                            No candidates assigned to this shift yet.
                          </p>
                        )}
                      </article>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {totalShifts > pageSize && (
            <div className="border-t border-gray-100">
              <PaginationFooter
                page={currentPage}
                totalItems={totalShifts}
                perPage={pageSize}
                onPageChange={setPage}
                itemLabel="shifts"
                perPageOptions={[5, 10, 25, 50]}
                onPerPageChange={(nextPerPage) => {
                  setPerPage(nextPerPage);
                  setPage(1);
                }}
                className="flex flex-col gap-3 bg-[#FEF3E9] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              />
            </div>
          )}
        </div>

        <Dialog
          open={Boolean(disputeCandidate)}
          onOpenChange={(open) => {
            if (!open && !isCreatingDispute) resetDisputeForm();
          }}
        >
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Create Shift Dispute</DialogTitle>
              <DialogDescription>
                Add a reason or description for {disputeCandidate?.name ?? "this candidate"}.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateDispute} className="flex flex-col gap-4">
              <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  Assignment
                </p>
                <p className="mt-1 break-all text-xs font-semibold text-gray-700">
                  {disputeCandidate?.assignmentId ?? "N/A"}
                </p>
              </div>

              <label className="flex flex-col gap-1.5 text-xs font-semibold text-gray-600">
                Reason
                <input
                  value={disputeReason}
                  onChange={(event) => setDisputeReason(event.target.value)}
                  placeholder="Candidate did not complete the shift"
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-50"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-xs font-semibold text-gray-600">
                Description
                <textarea
                  value={disputeDescription}
                  onChange={(event) => setDisputeDescription(event.target.value)}
                  placeholder="Optional longer details"
                  rows={4}
                  className="resize-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-50"
                />
              </label>

              <DialogFooter>
                <button
                  type="button"
                  onClick={resetDisputeForm}
                  disabled={isCreatingDispute}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 transition hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingDispute || isDisputeFormEmpty}
                  className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                >
                  {isCreatingDispute ? "Creating..." : "Create Dispute"}
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </>
  );
}

function ShiftCandidateRow({
  candidate,
  shift,
  onDisputeClick,
}: {
  candidate: ShiftCandidate;
  shift: ShiftCard;
  onDisputeClick: () => void;
}) {
  const shiftStatus = getShiftStatus(shift.status);
  const metrics = getCandidateMetrics(candidate, shift, shiftStatus);

  return (
    <div className="rounded-xl border border-gray-100 bg-white px-3 py-3">
      <div className="flex min-w-0 flex-wrap items-start gap-3">
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-orange-100 text-[#F4781B] ring-1 ring-orange-50">
          {candidate.image ? (
            <Image
              src={candidate.image}
              alt={candidate.name}
              width={40}
              height={40}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-[11px] font-bold">
              {getInitials(candidate.name)}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="truncate text-sm font-semibold text-gray-900">
              {candidate.name}
            </p>
            {candidate.assignmentStatus && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                {formatLabel(candidate.assignmentStatus)}
              </span>
            )}
            {candidate.payment?.status && (
              <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                {formatLabel(candidate.payment.status)}
              </span>
            )}
          </div>
          <p className="mt-0.5 truncate text-[11px] text-gray-400">
            {formatAttendanceSummary(candidate, shiftStatus)}
          </p>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {candidate.hourlyRateCents != null && candidate.hourlyRateCents !== "" && (
            <span className="rounded-lg bg-orange-50 px-2 py-1 text-[11px] font-bold text-[#F4781B]">
              {formatPay(candidate.hourlyRateCents)}/hr
            </span>
          )}
          <button
            type="button"
            onClick={onDisputeClick}
            disabled={!candidate.assignmentId}
            title={
              candidate.assignmentId ? "Create dispute" : "Assignment ID missing"
            }
            className="rounded-lg border border-red-200 bg-white px-2.5 py-1 text-[11px] font-bold text-red-600 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-400"
          >
            Dispute
          </button>
        </div>
      </div>

      {metrics.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="min-w-0 rounded-lg bg-gray-50 px-2.5 py-2"
            >
              <p className="truncate text-[10px] font-medium uppercase tracking-wide text-gray-400">
                {metric.label}
              </p>
              <p className="mt-0.5 truncate text-sm font-semibold text-gray-900">
                {metric.value}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function OpenShiftSlot() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-dashed border-orange-200 bg-orange-50/40 px-3 py-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#F4781B] ring-1 ring-orange-100">
        <Users size={16} />
      </span>
      <div>
        <p className="text-sm font-semibold text-gray-800">Open slot</p>
        <p className="text-[11px] text-gray-500">Still hiring for this shift</p>
      </div>
    </div>
  );
}

function ShiftMetaChip({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-gray-600 ring-1 ring-gray-200">
      <span className="text-gray-400">{icon}</span>
      {label}
    </span>
  );
}

function ShiftStatusPill({ value }: { value?: string | null }) {
  const status = getShiftStatus(value);
  const statusClass = status
    ? SHIFT_STATUS_STYLES[status]
    : "border-gray-200 bg-gray-50 text-gray-600";

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold ${statusClass}`}
    >
      {formatShiftStatus(value) ?? "N/A"}
    </span>
  );
}

function getCandidateMetrics(
  candidate: ShiftCandidate,
  shift: ShiftCard,
  shiftStatus: ShiftStatus | null,
) {
  const plannedPay =
    candidate.payment?.plannedAmountCents ?? candidate.estimatedPayCents;
  const platformFee =
    candidate.payment?.platformFeeCents ?? candidate.platformFeeCents;
  const hasAttendance = Boolean(candidate.attendance);
  const hasPayment = Boolean(candidate.payment);
  const isLive = shiftStatus === "UPCOMING" || shiftStatus === "CANCELLED";

  const metrics: { label: string; value: string }[] = [];

  if (isLive) {
    pushMetric(metrics, "Est. pay", formatPay(plannedPay));
    pushMetric(metrics, "Duration", formatDuration(shift.duration));
    pushMetric(metrics, "Platform fee", formatPay(platformFee));
    return metrics;
  }

  pushMetric(
    metrics,
    hasPayment ? "Shift fees" : "Est. pay",
    formatPay(plannedPay),
  );
  if (hasPayment) {
    pushMetric(metrics, "Released", formatPay(candidate.payment?.releasedAmountCents));
    pushMetric(metrics, "Refund", formatPay(candidate.payment?.refundAmountCents));
  }
  pushMetric(metrics, "Duration", formatDuration(shift.duration));
  if (hasAttendance) {
    pushMetric(
      metrics,
      "Late in",
      formatDuration(candidate.attendance?.lateMinutes ?? 0),
    );
    pushMetric(
      metrics,
      "Early out",
      formatDuration(candidate.attendance?.earlyLeaveMinutes ?? 0),
    );
    pushMetric(
      metrics,
      "Worked",
      formatDuration(candidate.attendance?.workedMinutes),
    );
  }
  pushMetric(metrics, "Platform fee", formatPay(platformFee));

  return metrics;
}

function pushMetric(
  metrics: { label: string; value: string }[],
  label: string,
  value: string,
) {
  if (value === "N/A") return;
  metrics.push({ label, value });
}

function formatAttendanceSummary(
  candidate: ShiftCandidate,
  shiftStatus: ShiftStatus | null,
) {
  const checkIn = candidate.attendance?.checkInTime;
  const checkOut = candidate.attendance?.checkOutTime;

  if (checkIn || checkOut) {
    return [
      checkIn
        ? `In ${formatCandidateAttendanceTime(checkIn)}`
        : "No check-in",
      checkOut
        ? `Out ${formatCandidateAttendanceTime(checkOut)}`
        : "No check-out",
    ].join(" · ");
  }

  if (shiftStatus === "UPCOMING") return "Awaiting check-in";
  if (shiftStatus === "ACTIVE") return "Not checked in yet";
  if (shiftStatus === "CANCELLED") return "Shift cancelled";
  if (shiftStatus === "MISSED") return "No attendance recorded";
  return "No attendance recorded";
}

function mapJobShift(shift: JobShiftItem, index: number): ShiftCard {
  const assignments = shift.assignments ?? [];
  const duration = shift.planned_minutes ?? null;
  const candidates = assignments.map((assignment, assignmentIndex) =>
    mapShiftCandidate(assignment, assignmentIndex, duration),
  );
  const staffing = resolveShiftStaffing(shift, assignments.length);

  return {
    id: getShiftId(shift, index),
    date: shift.shift_date ?? shift.start_date ?? null,
    startTime: shift.planned_check_in ?? shift.check_in ?? null,
    endTime: shift.planned_check_out ?? shift.check_out ?? null,
    plannedCheckInAt: shift.planned_check_in_at ?? null,
    plannedCheckOutAt: shift.planned_check_out_at ?? null,
    duration,
    status: shift.status ?? shift.shift_status ?? null,
    province: shift.province ?? null,
    assignmentsCount: assignments.length,
    staffing,
    staffingGap: shift.staffing_gap ?? null,
    candidates,
  };
}

function mapShiftCandidate(
  assignment: JobShiftAssignment,
  index: number,
  plannedMinutes?: number | string | null,
): ShiftCandidate {
  const candidate = assignment.candidate;
  const attendance = assignment.shift_attendance ?? assignment.latest_attendance;
  const payment = assignment.shift_payment;
  const fullName = [candidate?.first_name, candidate?.last_name]
    .filter(Boolean)
    .join(" ");
  const name =
    candidate?.full_name?.trim() || fullName || `Candidate ${index + 1}`;
  const hourlyRateCents = assignment.hourly_rate_cents ?? null;
  const platformFeeCents =
    payment?.platform_fee_cents ?? assignment.platform_fee_cents ?? null;

  return {
    id:
      assignment.assignment_id ??
      assignment.id ??
      candidate?.candidate_id ??
      candidate?.user_id ??
      candidate?.id ??
      assignment.candidate_id ??
      `candidate-${index}`,
    assignmentId: assignment.assignment_id ?? assignment.id ?? null,
    name,
    image:
      candidate?.profile_image_url ?? candidate?.profile_image ?? null,
    assignmentStatus: assignment.status ?? null,
    hourlyRateCents,
    platformFeeCents,
    estimatedPayCents:
      payment?.planned_amount_cents ??
      estimateAmountCents(hourlyRateCents, plannedMinutes),
    attendance: attendance
      ? {
          checkedIn: Boolean(attendance.actual_check_in),
          checkedOut: Boolean(attendance.actual_check_out),
          checkInTime: attendance.actual_check_in,
          checkOutTime: attendance.actual_check_out,
          lateMinutes: Number(attendance.late_minutes ?? 0),
          earlyLeaveMinutes: Number(attendance.early_leave_minutes ?? 0),
          workedMinutes: attendance.worked_minutes,
        }
      : undefined,
    payment: payment
      ? {
          status: payment.status ?? null,
          amountCents:
            payment.candidate_earning_cents ??
            payment.actual_amount_cents ??
            payment.planned_amount_cents,
          plannedAmountCents: payment.planned_amount_cents,
          releasedAmountCents:
            payment.candidate_earning_cents ?? payment.actual_amount_cents,
          refundAmountCents: payment.recruiter_refund_cents,
          platformFeeCents: payment.platform_fee_cents,
        }
      : undefined,
  };
}

function resolveShiftStaffing(
  shift: JobShiftItem,
  assignmentCount: number,
): ShiftStaffing {
  const gap = shift.staffing_gap;
  const required =
    toFiniteNumber(
      gap?.requiredWorkers ?? gap?.required ?? shift.required_workers,
    ) ?? Math.max(assignmentCount, 0);
  const assigned =
    toFiniteNumber(gap?.availableWorkers ?? gap?.assigned) ?? assignmentCount;
  const open =
    toFiniteNumber(gap?.gap) ?? Math.max(required - assigned, 0);

  return { required, assigned, open };
}

function estimateAmountCents(
  hourlyRateCents?: number | string | null,
  plannedMinutes?: number | string | null,
) {
  const rate = toFiniteNumber(hourlyRateCents);
  const minutes = toFiniteNumber(plannedMinutes);
  if (rate == null || minutes == null || minutes <= 0) return null;
  return Math.round((rate * minutes) / 60);
}

function toFiniteNumber(value?: number | string | null) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function getFilterSubtitle(
  status: ShiftStatusFilter,
  totalShifts: number,
  isLoading: boolean,
) {
  if (isLoading) return "Loading shift records…";

  const countLabel =
    totalShifts === 1 ? "1 shift" : `${totalShifts} shifts`;

  if (status === "BOTH") return `${countLabel} · upcoming and active`;
  if (status === "ALL") return `${countLabel} · all statuses`;
  return `${countLabel} · ${SHIFT_STATUS_LABELS[status].toLowerCase()}`;
}

function getShiftId(shift: JobShiftItem, index: number) {
  return shift.shift_id ?? shift.id ?? shift.assignment_id ?? `shift-${index}`;
}

function getRequestedShiftStatuses(filter: ShiftStatusFilter): ShiftStatus[] | null {
  if (filter === "ALL") return null;
  if (filter === "BOTH") return ["ACTIVE", "UPCOMING"];
  return [filter];
}

function getShiftStatus(value?: string | null): ShiftStatus | null {
  const status = String(value ?? "").toUpperCase();
  return SHIFT_STATUSES.includes(status as ShiftStatus) ? (status as ShiftStatus) : null;
}

function formatShiftStatus(value?: string | null) {
  const status = getShiftStatus(value);
  return status ? SHIFT_STATUS_LABELS[status] : value ?? null;
}

function formatDuration(value?: number | string | null) {
  if (value === null || value === undefined || value === "") return "N/A";

  const minutes = Number(value);
  if (!Number.isFinite(minutes)) return String(value);

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours === 0) return `${remainingMinutes}m`;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

function formatCandidateAttendanceTime(value?: string | null) {
  if (!value) return "N/A";
  if (/^\d{1,2}:\d{2}/.test(value)) return formatTime(value);

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return value;

  return parsedDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).toLowerCase();
}

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: unknown } } }).response;
    if (typeof response?.data?.message === "string") return response.data.message;
  }

  if (error instanceof Error) return error.message;

  return fallback;
}

function groupShiftsByDate(shifts: ShiftCard[]) {
  const groups = new Map<string, { key: string; label: string; shifts: ShiftCard[] }>();

  shifts.forEach((shift) => {
    const dateKey = toDateInputValue(shift.date);
    const key = dateKey || "no-date";

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        label: formatShiftGroupDate(shift.date),
        shifts: [],
      });
    }

    groups.get(key)?.shifts.push(shift);
  });

  return Array.from(groups.values());
}

function formatShiftGroupDate(value?: string | null) {
  const dateKey = toDateInputValue(value);
  if (!dateKey) return formatDate(value ?? null);

  const [year, month, day] = dateKey.split("-").map(Number);
  const parsed = new Date(year, month - 1, day);
  if (Number.isNaN(parsed.getTime())) return formatDate(value ?? null);

  return parsed.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function toDateInputValue(value?: string | null) {
  if (!value) return "";

  const [date] = value.split("T");
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return "";

  return parsedDate.toISOString().slice(0, 10);
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
