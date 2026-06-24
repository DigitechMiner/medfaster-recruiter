"use client";

import { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import { CalendarDays, Clock, Timer, Users } from "lucide-react";
import { toast } from "react-toastify";
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
import type { JobShiftAssignment, JobShiftItem, JobShiftStaffingGap } from "@/types";
import {
  EmptyState,
  LoadingRows,
} from "./JobDetailDataView";
import { formatDate, formatLabel, formatPay, formatTime } from "./job-detail-helpers";

type ShiftStatus = "UPCOMING" | "ACTIVE" | "COMPLETED" | "CANCELLED" | "MISSED";
type ShiftStatusFilter = ShiftStatus | "ALL";

const SHIFT_STATUSES: ShiftStatus[] = [
  "UPCOMING",
  "ACTIVE",
  "COMPLETED",
  "CANCELLED",
  "MISSED",
];

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

type ShiftCard = {
  id: string;
  date?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  duration?: number | string | null;
  status?: string | null;
  assignmentsCount: number;
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
  };
};

type JobShiftsTabProps = {
  jobId: string;
  enabled?: boolean;
  startDate?: string | null;
  endDate?: string | null;
  checkInTime?: string | null;
  checkOutTime?: string | null;
};

export function JobShiftsTab({
  jobId,
  enabled = true,
  startDate: jobStartDateProp,
  endDate: jobEndDateProp,
  checkInTime,
  checkOutTime,
}: JobShiftsTabProps) {
  const [status, setStatus] = useState<ShiftStatusFilter>("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [disputeCandidate, setDisputeCandidate] = useState<ShiftCandidate | null>(null);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeDescription, setDisputeDescription] = useState("");
  const [isCreatingDispute, setIsCreatingDispute] = useState(false);
  const jobStartDate = toDateInputValue(jobStartDateProp);
  const jobEndDate = toDateInputValue(jobEndDateProp);
  const { shifts, isLoading, error } = useJobShifts(
    enabled ? jobId : null,
    {
      status: status === "ALL" ? undefined : status,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
    },
  );
  const apiShifts = useMemo(() => shifts?.shifts ?? [], [shifts?.shifts]);
  const shiftCards = useMemo(
    () => apiShifts.map((shift, index) => mapJobShift(shift, index)),
    [apiShifts],
  );
  const filteredShifts = useMemo(
    () =>
      status === "ALL"
        ? shiftCards
        : shiftCards.filter((shift) => getShiftStatus(shift.status) === status),
    [shiftCards, status],
  );
  const groupedShifts = useMemo(() => groupShiftsByDate(filteredShifts), [filteredShifts]);
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
        <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Shifts</h3>
            <p className="text-xs text-gray-400">
              Live shift instances with assignments and staffing gaps.
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">
              Start Date
              <input
                type="date"
                value={startDate}
                min={jobStartDate || undefined}
                max={endDate || jobEndDate || undefined}
                onChange={(event) => setStartDate(event.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 outline-none focus:border-[#F4781B]"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">
              End Date
              <input
                type="date"
                value={endDate}
                min={startDate || jobStartDate || undefined}
                max={jobEndDate || undefined}
                onChange={(event) => setEndDate(event.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 outline-none focus:border-[#F4781B]"
              />
            </label>
            {(startDate || endDate) && (
              <button
                type="button"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-500 transition hover:border-orange-200 hover:text-[#F4781B]"
              >
                Clear Dates
              </button>
            )}
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as ShiftStatusFilter)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 outline-none focus:border-[#F4781B]"
            >
              <option value="ALL">All Status</option>
              {SHIFT_STATUSES.map((shiftStatus) => (
                <option key={shiftStatus} value={shiftStatus}>
                  {SHIFT_STATUS_LABELS[shiftStatus]}
                </option>
              ))}
            </select>
          </div>
        </div>
        {isLoading ? (
          <LoadingRows />
        ) : error ? (
          <EmptyState title="Unable to load shifts" description={error} />
        ) : apiShifts.length === 0 ? (
          <EmptyState title="No shifts available" description="Shift records will appear here once available." />
        ) : filteredShifts.length === 0 ? (
          <EmptyState title="No shifts found" description="No shifts match the selected status." />
        ) : (
          <div className="flex flex-col gap-5">
            {groupedShifts.map((group) => (
              <div key={group.key} className="flex flex-col gap-3">
                <h4 className="text-sm font-semibold text-gray-900">{group.label}</h4>
                {group.shifts.map((shift, index) => (
                  <article
                    key={shift.id}
                    className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                  >
                    <div className="border-b border-orange-100 bg-gradient-to-r from-orange-50 via-white to-white px-4 py-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-3">
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#F4781B] shadow-sm ring-1 ring-orange-100">
                            <CalendarDays size={19} />
                          </span>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h5 className="text-base font-bold text-gray-900">Shift {index + 1}</h5>
                              <ShiftStatusPill value={shift.status} />
                            </div>
                            <p className="mt-1 text-xs font-medium text-gray-500">
                              {formatDate(shift.date ?? jobStartDateProp)} schedule and assignment details
                            </p>
                          </div>
                        </div>
                        <div className="rounded-xl border border-orange-100 bg-white px-3 py-2 text-left sm:text-right">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                            Planned Time
                          </p>
                          <p className="text-sm font-bold text-gray-900">
                            {formatTime(shift.startTime ?? checkInTime)} -{" "}
                            {formatTime(shift.endTime ?? checkOutTime)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <ShiftMetricCard
                          icon={<Clock size={16} />}
                          label="Start"
                          value={formatTime(shift.startTime ?? checkInTime)}
                        />
                        <ShiftMetricCard
                          icon={<Timer size={16} />}
                          label="Duration"
                          value={formatDuration(shift.duration)}
                        />
                        <ShiftMetricCard
                          icon={<Users size={16} />}
                          label="Assignments"
                          value={`${shift.assignmentsCount} ${shift.assignmentsCount === 1 ? "candidate" : "candidates"}`}
                        />
                        <ShiftMetricCard
                          icon={<Users size={16} />}
                          label="Staffing Gap"
                          value={formatStaffingGap(shift.staffingGap)}
                        />
                      </div>

                      <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50/70">
                        <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-3 py-2.5">
                          <div>
                            <p className="text-xs font-bold text-gray-900">Assigned Candidates</p>
                            <p className="text-[11px] text-gray-400">
                              Attendance and payment progress for this shift
                            </p>
                          </div>
                          <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-gray-500 ring-1 ring-gray-200">
                            {shift.candidates.length}
                          </span>
                        </div>
                        {shift.candidates.length > 0 ? (
                          <div className="flex flex-col gap-2 p-2.5">
                            {shift.candidates.map((candidate) => (
                              <ShiftCandidateRow
                                key={candidate.id}
                                candidate={candidate}
                                totalMinutes={shift.duration}
                                onDisputeClick={() => handleDisputeClick(candidate)}
                              />
                            ))}
                          </div>
                        ) : (
                          <p className="px-3 py-4 text-center text-xs font-medium text-gray-400">
                            No candidates assigned to this shift yet.
                          </p>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ))}
          </div>
        )}
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
  totalMinutes,
  onDisputeClick,
}: {
  candidate: ShiftCandidate;
  totalMinutes?: number | string | null;
  onDisputeClick: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white px-3 py-3 shadow-sm">
      <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-orange-100 text-[#F4781B] ring-2 ring-orange-50">
            {candidate.image ? (
              <Image
                src={candidate.image}
                alt={candidate.name}
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-sm font-bold">
                {getInitials(candidate.name)}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-xs font-semibold text-gray-900">{candidate.name}</p>
              {candidate.assignmentStatus && (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                  {formatLabel(candidate.assignmentStatus)}
                </span>
              )}
            </div>
            {candidate.attendance ? (
              <p className="mt-1 break-words text-[11px] font-medium leading-5 text-gray-500">
                {candidate.attendance.checkInTime
                  ? `Checked in ${formatCandidateAttendanceTime(candidate.attendance.checkInTime)}`
                  : "Not checked in"}
                {" · "}
                {candidate.attendance.checkOutTime
                  ? `Checked out ${formatCandidateAttendanceTime(candidate.attendance.checkOutTime)}`
                  : "Not checked out"}
              </p>
            ) : (
              <p className="mt-1 text-[11px] font-medium text-gray-400">No attendance yet</p>
            )}
            {candidate.hourlyRateCents != null && (
              <p className="mt-1 text-[11px] text-gray-400">Rate {formatPay(candidate.hourlyRateCents)}/hr</p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onDisputeClick}
          disabled={!candidate.assignmentId}
          title={candidate.assignmentId ? "Create dispute" : "Assignment ID missing"}
          className="shrink-0 rounded-full border border-red-200 bg-red-50 px-4 py-1.5 text-xs font-bold text-red-600 transition hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-400"
        >
          Dispute
        </button>
      </div>

      <div className="flex min-w-0 flex-wrap justify-start gap-1.5">
        {candidate.attendance && (
          <>
            {candidate.attendance.lateMinutes > 0 && (
              <CandidateBadge className="bg-red-50 text-red-600">
                Late {candidate.attendance.lateMinutes}m
              </CandidateBadge>
            )}
            {candidate.attendance.earlyLeaveMinutes > 0 && (
              <CandidateBadge className="bg-yellow-50 text-yellow-700">
                Early leave {candidate.attendance.earlyLeaveMinutes}m
              </CandidateBadge>
            )}
            {candidate.attendance.workedMinutes != null && (
              <CandidateBadge className="bg-gray-100 text-gray-600">
                Worked {formatDuration(candidate.attendance.workedMinutes)}
              </CandidateBadge>
            )}
          </>
        )}
        {candidate.payment?.status && (
          <CandidateBadge className="bg-green-50 text-green-700">
            Payment {formatLabel(candidate.payment.status)}
          </CandidateBadge>
        )}
        {candidate.payment?.amountCents != null && (
          <CandidateBadge className="bg-orange-50 text-[#F4781B]">
            Earned {formatPay(candidate.payment.amountCents)}
          </CandidateBadge>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <SummaryMetricCard
          label="Total Shift Fees"
          value={formatPay(candidate.payment?.plannedAmountCents)}
        />
        <SummaryMetricCard
          label="Amount Release"
          value={formatPay(candidate.payment?.releasedAmountCents)}
        />
        <SummaryMetricCard
          label="Amount Refund"
          value={formatPay(candidate.payment?.refundAmountCents)}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <SummaryMetricCard label="Total Min" value={formatDuration(totalMinutes)} />
        <SummaryMetricCard
          label="Early Logout Min"
          value={formatDuration(candidate.attendance?.earlyLeaveMinutes)}
        />
        <SummaryMetricCard
          label="Late Check-in"
          value={formatDuration(candidate.attendance?.lateMinutes)}
        />
        <SummaryMetricCard
          label="Total Work Min"
          value={formatDuration(candidate.attendance?.workedMinutes)}
        />
      </div>
    </div>
  );
}

function ShiftMetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#F4781B] ring-1 ring-gray-100">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-[11px] font-semibold uppercase tracking-wide text-gray-400">
          {label}
        </span>
        <span className="block truncate text-sm font-bold text-gray-900">{value}</span>
      </span>
    </div>
  );
}

function SummaryMetricCard({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white px-3 py-3 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-1 truncate text-sm font-bold text-gray-900">{value}</p>
    </div>
  );
}

function ShiftStatusPill({ value }: { value?: string | null }) {
  const status = getShiftStatus(value);
  const statusClass = status
    ? SHIFT_STATUS_STYLES[status]
    : "border-gray-200 bg-gray-50 text-gray-600";

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold ${statusClass}`}>
      {formatShiftStatus(value) ?? "N/A"}
    </span>
  );
}

function CandidateBadge({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${className}`}>
      {children}
    </span>
  );
}

function formatStaffingGap(gap?: JobShiftStaffingGap | null) {
  if (!gap) return "N/A";
  if (gap.gap != null) {
    return gap.gap > 0 ? `${gap.gap} open` : "Filled";
  }
  if (gap.required != null && gap.assigned != null) {
    const open = Math.max(gap.required - gap.assigned, 0);
    return open > 0 ? `${open} open` : "Filled";
  }
  return "N/A";
}

function mapJobShift(shift: JobShiftItem, index: number): ShiftCard {
  const assignments = shift.assignments ?? [];
  const candidates = assignments.map(mapShiftCandidate);

  return {
    id: getShiftId(shift, index),
    date: shift.shift_date ?? shift.start_date ?? null,
    startTime: shift.planned_check_in ?? null,
    endTime: shift.planned_check_out ?? null,
    duration: shift.planned_minutes ?? null,
    status: shift.status ?? shift.shift_status ?? null,
    assignmentsCount: assignments.length,
    staffingGap: shift.staffing_gap ?? null,
    candidates,
  };
}

function mapShiftCandidate(assignment: JobShiftAssignment, index: number): ShiftCandidate {
  const candidate = assignment.candidate;
  const attendance = assignment.shift_attendance ?? assignment.latest_attendance;
  const payment = assignment.shift_payment;
  const fullName = [candidate?.first_name, candidate?.last_name].filter(Boolean).join(" ");
  const name = candidate?.full_name?.trim() || fullName || `Candidate ${index + 1}`;

  return {
    id:
      candidate?.candidate_id ??
      candidate?.user_id ??
      candidate?.id ??
      assignment.candidate_id ??
      assignment.assignment_id ??
      assignment.id ??
      `candidate-${index}`,
    assignmentId: assignment.assignment_id ?? assignment.id ?? null,
    name,
    image: candidate?.profile_image_url ?? null,
    assignmentStatus: assignment.status ?? null,
    hourlyRateCents: assignment.hourly_rate_cents ?? null,
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
          amountCents: payment.candidate_earning_cents ?? payment.actual_amount_cents ?? payment.planned_amount_cents,
          plannedAmountCents: payment.planned_amount_cents,
          releasedAmountCents: payment.candidate_earning_cents ?? payment.actual_amount_cents,
          refundAmountCents: payment.recruiter_refund_cents,
        }
      : undefined,
  };
}

function getShiftId(shift: JobShiftItem, index: number) {
  return shift.shift_id ?? shift.id ?? shift.assignment_id ?? `shift-${index}`;
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
        label: formatDate(shift.date ?? null),
        shifts: [],
      });
    }

    groups.get(key)?.shifts.push(shift);
  });

  return Array.from(groups.values());
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
