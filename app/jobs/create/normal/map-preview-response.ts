import type {
  JobPreviewBillingCycle,
  JobPreviewBillingMonthSlice,
  JobPreviewPaymentPeriodSlice,
  JobPreviewShift,
  JobPreviewTaxComponent,
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
  monthIndex: number;
  label: string;
  periodLabel: string;
  nextPaymentDueLabel: string | null;
  shiftCount: number;
  totalWorkingHours: number | null;
  subtotalCents: number;
  taxCents: number;
  taxComponents: JobPreviewTaxComponent[];
  totalCents: number;
  cyclePayCents: number;
};

export type NormalPreviewCostSummary = {
  hourlyRateCents: number;
  /** Amount due at publish (first billing month, tax included). */
  dueNowCents: number;
  subtotalCents: number;
  taxCents: number;
  taxComponents: JobPreviewTaxComponent[];
  costPerShiftCents: number;
  hires: number;
  maxMonths: number;
  monthlyPayments: MonthlyPaymentPreview[];
  oneCyclePayment: {
    label: string;
    subtotalCents: number;
    taxCents: number;
    taxComponents: JobPreviewTaxComponent[];
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

export function resolvePreviewBillingCycle(
  slice: JobPreviewPaymentPeriodSlice,
): JobPreviewBillingCycle {
  const cycle = slice.cycle;
  if (cycle && typeof cycle === "object" && "cycle" in cycle && cycle.cycle) {
    return cycle.cycle;
  }
  return cycle as JobPreviewBillingCycle;
}

function formatBillingPeriodFromCycle(
  cycle?: JobPreviewBillingCycle,
): string | null {
  if (!cycle?.billing_start_date || !cycle?.billing_end_date) return null;
  return `${formatDisplayDateFromIso(cycle.billing_start_date)} – ${formatDisplayDateFromIso(cycle.billing_end_date)}`;
}

function formatBillingPeriodLabel(
  slice?: JobPreviewPaymentPeriodSlice,
): string | null {
  const period = slice ? resolvePreviewBillingCycle(slice) : undefined;
  return formatBillingPeriodFromCycle(period);
}

function mapBillingMonthSlice(
  slice: JobPreviewBillingMonthSlice,
): MonthlyPaymentPreview {
  return {
    monthIndex: slice.month_index,
    label: `Month ${slice.month_index}`,
    periodLabel: formatBillingPeriodFromCycle(slice.cycle) ?? "",
    nextPaymentDueLabel: slice.cycle.next_payment_due_date
      ? formatDisplayDateFromIso(slice.cycle.next_payment_due_date)
      : null,
    shiftCount: slice.no_of_shifts,
    totalWorkingHours: slice.total_working_hours ?? null,
    subtotalCents: slice.recruiter_pay_cents,
    taxCents: slice.tax.total_tax_cents,
    taxComponents: slice.tax.components,
    totalCents: slice.total_pay_cents,
    cyclePayCents: slice.total_cycle_pay_cents,
  };
}

function mapMonthlyPaymentSlice(
  slice: JobPreviewPaymentPeriodSlice,
  label: string,
  monthIndex = 0,
): MonthlyPaymentPreview {
  const billingCycle = resolvePreviewBillingCycle(slice);

  return {
    monthIndex,
    label,
    periodLabel: formatBillingPeriodLabel(slice) ?? "",
    nextPaymentDueLabel: billingCycle?.next_payment_due_date
      ? formatDisplayDateFromIso(billingCycle.next_payment_due_date)
      : null,
    shiftCount: slice.no_of_shifts,
    totalWorkingHours: slice.total_working_hours ?? null,
    subtotalCents: slice.recruiter_pay_cents,
    taxCents: slice.tax.total_tax_cents,
    taxComponents: slice.tax.components,
    totalCents: slice.total_pay_cents,
    cyclePayCents: slice.total_cycle_pay_cents,
  };
}

function resolveMonthlyPayments(
  payment: NonNullable<NormalJobFeePreviewData["payment"]>,
): MonthlyPaymentPreview[] {
  if (payment.months?.length) {
    return [...payment.months]
      .sort((a, b) => a.month_index - b.month_index)
      .map(mapBillingMonthSlice);
  }

  const legacyMonths: MonthlyPaymentPreview[] = [];
  if (payment.first_month) {
    legacyMonths.push(mapMonthlyPaymentSlice(payment.first_month, "Month 1", 1));
  }
  if (payment.second_month) {
    legacyMonths.push(
      mapMonthlyPaymentSlice(payment.second_month, "Month 2", 2),
    );
  }
  return legacyMonths;
}

function resolvePrimaryMonthSlice(
  payment: NonNullable<NormalJobFeePreviewData["payment"]>,
): JobPreviewPaymentPeriodSlice | JobPreviewBillingMonthSlice | null {
  if (payment.months?.length) {
    return [...payment.months].sort((a, b) => a.month_index - b.month_index)[0];
  }
  return payment.first_month ?? payment.cycle ?? null;
}

function getSliceShiftCount(
  slice: JobPreviewPaymentPeriodSlice | JobPreviewBillingMonthSlice,
): number {
  return slice.no_of_shifts;
}

function getSliceSubtotalCents(
  slice: JobPreviewPaymentPeriodSlice | JobPreviewBillingMonthSlice,
): number {
  return slice.recruiter_pay_cents;
}

function getSliceTax(
  slice: JobPreviewPaymentPeriodSlice | JobPreviewBillingMonthSlice,
) {
  return slice.tax;
}

function getSliceTotalPayCents(
  slice: JobPreviewPaymentPeriodSlice | JobPreviewBillingMonthSlice,
): number {
  return slice.total_pay_cents;
}

function resolveCostPerShiftCents(
  recruiterPayCents: number,
  shiftCount: number,
  hires: number,
): number {
  const divisor = Math.max(1, shiftCount * Math.max(1, hires));
  return Math.round(recruiterPayCents / divisor);
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

export function mapPreviewShiftsToRows(
  shifts: JobPreviewShift[],
): ShiftPreviewRow[] {
  return shifts.map(mapPreviewShiftToRow);
}

export function buildNormalPreviewCostSummary(
  data: NormalJobFeePreviewData | null | undefined,
  fallbackHires: number,
): NormalPreviewCostSummary | null {
  const payment = data?.payment;
  if (!payment) return null;

  const hires = data.no_of_hires ?? fallbackHires;
  const isRotationalPreview = data.shift_mode === "ROTATIONAL";
  const cycleSlice = payment.cycle;
  const monthlyPayments = resolveMonthlyPayments(payment);
  const primarySlice = resolvePrimaryMonthSlice(payment);

  const hasMonthlyBreakdown = monthlyPayments.length > 0;
  if (!primarySlice) return null;

  const dueNowCents = getSliceTotalPayCents(primarySlice);
  const primaryTax = getSliceTax(primarySlice);
  const oneCycleBilling = cycleSlice
    ? resolvePreviewBillingCycle(cycleSlice)
    : undefined;
  const oneCyclePayment =
    isRotationalPreview && cycleSlice
      ? {
          label: `${oneCycleBilling?.rotation_cycle_days ?? 14}-day rotation cycle`,
          subtotalCents: cycleSlice.recruiter_pay_cents,
          taxCents: cycleSlice.tax.total_tax_cents,
          taxComponents: cycleSlice.tax.components,
          totalCents: cycleSlice.total_pay_cents,
          shiftCount: cycleSlice.no_of_shifts,
          hours: cycleSlice.total_working_hours ?? 0,
          cycleDays: oneCycleBilling?.rotation_cycle_days ?? 14,
        }
      : null;

  return {
    hourlyRateCents: payment.per_hour_cents,
    dueNowCents,
    subtotalCents: getSliceSubtotalCents(primarySlice),
    taxCents: primaryTax.total_tax_cents,
    taxComponents: primaryTax.components,
    costPerShiftCents: resolveCostPerShiftCents(
      getSliceSubtotalCents(primarySlice),
      getSliceShiftCount(primarySlice),
      hires,
    ),
    hires,
    maxMonths: payment.max_months ?? monthlyPayments.length,
    monthlyPayments,
    oneCyclePayment,
    isRotationalPreview,
    hasMonthlyBreakdown,
  };
}
