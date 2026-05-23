import type {
  JobPreviewPaymentSlice,
  JobPreviewShift,
  NormalJobFeePreviewData,
} from "@/types";
import {
  getShiftDurationHours,
  parseLocalDate,
  shiftSpansMidnight,
} from "../validation/helpers";

export type ShiftPreviewRow = {
  id: string;
  day: string;
  shiftName: string;
  startDate: string;
  endDate: string;
  checkIn: string;
  checkOut: string;
  totalWorkingHours: string;
  team: string;
  workers: number;
};

export type MonthlyPaymentPreview = {
  label: string;
  periodLabel: string;
  nextPaymentDueLabel: string | null;
  shiftCount: number;
  totalWorkingHours: number;
  costPerShiftCents: number;
  totalCents: number;
};

export type NormalPreviewCostSummary = {
  hourlyRateCents: number;
  /** Amount due at publish (first billing month). */
  dueNowCents: number;
  costPerShiftCents: number;
  hires: number;
  monthlyPayments: MonthlyPaymentPreview[];
  oneCyclePayment: {
    label: string;
    totalCents: number;
    shiftCount: number;
    hours: number;
    cycleDays: number;
  } | null;
  isRotationalPreview: boolean;
  hasMonthlyBreakdown: boolean;
};

function formatDisplayDateFromIso(isoDate: string): string {
  const parsed = parseLocalDate(isoDate);
  if (!parsed) return isoDate;
  return parsed.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function addCalendarDays(isoDate: string, days: number): string {
  const parsed = parseLocalDate(isoDate);
  if (!parsed) return isoDate;
  const next = new Date(parsed);
  next.setDate(next.getDate() + days);
  const y = next.getFullYear();
  const m = String(next.getMonth() + 1).padStart(2, "0");
  const d = String(next.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatClockForDisplay(time?: string | null): string {
  if (!time) return "-";
  const [h, m] = time.split(":");
  const hours = Number(h);
  const minutes = Number(m);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return time;
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  if (Number.isNaN(date.getTime())) return time;
  return date.toLocaleTimeString("en-CA", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatBillingPeriodLabel(
  period?: { billingStartDate: string; billingEndDate: string },
): string | null {
  if (!period?.billingStartDate || !period?.billingEndDate) return null;
  return `${formatDisplayDateFromIso(period.billingStartDate)} – ${formatDisplayDateFromIso(period.billingEndDate)}`;
}

function mapMonthlyPaymentSlice(
  slice: JobPreviewPaymentSlice,
  label: string,
): MonthlyPaymentPreview {
  return {
    label,
    periodLabel: formatBillingPeriodLabel(slice.period) ?? "",
    nextPaymentDueLabel: slice.period?.nextPaymentDueDate
      ? formatDisplayDateFromIso(slice.period.nextPaymentDueDate)
      : null,
    shiftCount: slice.shift_count,
    totalWorkingHours: slice.total_working_hours,
    costPerShiftCents: slice.per_shift_recruiter_pay_cents,
    totalCents: slice.total_recruiter_pay_cents,
  };
}

export function hasNormalPreviewShifts(
  data: NormalJobFeePreviewData | null | undefined,
): data is NormalJobFeePreviewData & { preview_shifts: JobPreviewShift[] } {
  return Boolean(data?.preview_shifts?.length);
}

function formatMinutesAsHoursLabel(minutes: number): string {
  if (minutes % 60 === 0) return `${minutes / 60} hrs`;
  return `${(minutes / 60).toFixed(1)} hrs`;
}

function resolvePreviewDayLabel(shift: JobPreviewShift): string {
  if (shift.cycle_day != null) return `Day ${shift.cycle_day}`;
  if (shift.shift_index != null) return `Day ${shift.shift_index}`;
  return "Day 1";
}

function resolvePreviewRowId(shift: JobPreviewShift): string {
  const dayKey = shift.cycle_day ?? shift.shift_index ?? 0;
  return `${shift.shift_date}-${shift.shift_type}-${dayKey}`;
}

function resolvePreviewWorkingHoursLabel(shift: JobPreviewShift): string {
  if (shift.planned_minutes != null && shift.planned_minutes > 0) {
    return formatMinutesAsHoursLabel(shift.planned_minutes);
  }
  const hours = getShiftDurationHours(
    shift.planned_check_in,
    shift.planned_check_out,
  );
  return hours != null ? `${hours} hrs` : "-";
}

export function mapPreviewShiftToRow(shift: JobPreviewShift): ShiftPreviewRow {
  const checkIn = shift.planned_check_in;
  const checkOut = shift.planned_check_out;
  const overnight = shift.is_night_shift || shiftSpansMidnight(checkIn, checkOut);
  const endDateIso = overnight
    ? addCalendarDays(shift.shift_date, 1)
    : shift.shift_date;

  return {
    id: resolvePreviewRowId(shift),
    day: resolvePreviewDayLabel(shift),
    shiftName: shift.shift_name,
    startDate: formatDisplayDateFromIso(shift.shift_date),
    endDate: formatDisplayDateFromIso(endDateIso),
    checkIn: formatClockForDisplay(checkIn),
    checkOut: formatClockForDisplay(checkOut),
    totalWorkingHours: resolvePreviewWorkingHoursLabel(shift),
    team: shift.team_name ?? "-",
    workers: shift.required_workers,
  };
}

function comparePreviewShifts(a: JobPreviewShift, b: JobPreviewShift): number {
  const dayA = a.cycle_day ?? a.shift_index ?? 0;
  const dayB = b.cycle_day ?? b.shift_index ?? 0;
  if (dayA !== dayB) return dayA - dayB;
  const dateA = a.shift_date ?? "";
  const dateB = b.shift_date ?? "";
  if (dateA !== dateB) return dateA.localeCompare(dateB);
  return a.shift_type.localeCompare(b.shift_type);
}

export function mapPreviewShiftsToRows(
  shifts: JobPreviewShift[],
): ShiftPreviewRow[] {
  return [...shifts].sort(comparePreviewShifts).map(mapPreviewShiftToRow);
}

export function buildNormalPreviewCostSummary(
  data: NormalJobFeePreviewData | null,
  fallbackHires: number,
): NormalPreviewCostSummary | null {
  if (!data) return null;

  const firstMonth = data.first_month_payment;
  const secondMonth = data.second_month_payment;
  const isRotationalPreview = data.shift_mode === "ROTATIONAL";

  const monthlyPayments: MonthlyPaymentPreview[] = [];
  if (firstMonth) {
    monthlyPayments.push(mapMonthlyPaymentSlice(firstMonth, "First month"));
  }
  if (secondMonth) {
    monthlyPayments.push(mapMonthlyPaymentSlice(secondMonth, "Second month"));
  }

  const hasMonthlyBreakdown = monthlyPayments.length > 0;

  const fallbackSlice = {
    period: data.billing_period,
    total_working_hours: data.total_working_hours,
    total_recruiter_pay_cents: data.total_recruiter_pay_cents,
    per_shift_recruiter_pay_cents: data.per_candidate_shift_recruiter_pay_cents,
    shift_count: data.shift_count ?? data.shift_summaries?.length ?? 0,
  };

  const primarySlice = firstMonth ?? fallbackSlice;
  const dueNowCents = primarySlice.total_recruiter_pay_cents;

  const oneCycle = data.one_cycle_payment;
  const oneCyclePayment =
    isRotationalPreview && oneCycle
      ? {
          label: `${oneCycle.rotation_cycle_days ?? 14}-day rotation cycle`,
          totalCents: oneCycle.total_recruiter_pay_cents,
          shiftCount: oneCycle.shift_count,
          hours: oneCycle.total_working_hours,
          cycleDays: oneCycle.rotation_cycle_days ?? 14,
        }
      : null;

  return {
    hourlyRateCents: data.recruiter_pay_per_hour_cents,
    dueNowCents,
    costPerShiftCents: primarySlice.per_shift_recruiter_pay_cents,
    hires: data.no_of_hires ?? fallbackHires,
    monthlyPayments,
    oneCyclePayment,
    isRotationalPreview,
    hasMonthlyBreakdown,
  };
}
