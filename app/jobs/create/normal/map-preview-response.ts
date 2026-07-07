import type {
  JobCreatePayload,
  JobPreviewBillingCycle,
  JobPreviewBillingMonthSlice,
  JobPreviewPaymentPeriodSlice,
  JobPreviewShift,
  JobPreviewShiftTemplate,
  JobPreviewTaxComponent,
  NormalJobFeePreviewData,
  PreviewShiftTemplateType,
  ShiftDurationType,
  ShiftType,
} from "@/types";
import { getDefaultBreakDurationMinutes } from "./scheduling-utils";
import {
  getShiftDurationHours,
  parseClockTimeToMinutes,
  parseLocalDate,
  shiftSpansMidnight,
} from "../validation/helpers";

export type ShiftPreviewRow = {
  id: string;
  shiftType: string;
  shiftLabel: string;
  rotationDay: string;
  team: string;
  teamInitial: string;
  startDateLabel: string;
  startTimeLabel: string;
  endDateLabel: string;
  endTimeLabel: string;
  timelineStartMinutes: number;
  timelineEndMinutes: number;
  spansMidnight: boolean;
  grossDurationLabel: string;
  breakMinutes: number | null;
  payableLabel: string;
  paySubtotalCents: number | null;
  payTaxCents: number | null;
  payTotalCents: number | null;
  payTaxComponents: JobPreviewTaxComponent[];
  workers: number;
};

export type ShiftPreviewPayContext = {
  hourlyRateCents: number;
  taxComponents: JobPreviewTaxComponent[];
};

export type ShiftPreviewPayParts = {
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  taxComponents: JobPreviewTaxComponent[];
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

export function formatCompactPreviewDate(isoDate: string): string {
  const parsed = parseLocalDate(isoDate);
  if (!parsed) return isoDate;
  return parsed.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
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

export function formatPreviewDateLabel(isoDate: string): string {
  const parsed = parseLocalDate(isoDate);
  if (!parsed) return isoDate;
  return parsed.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatPreviewTime12h(time?: string | null): string {
  if (!time) return "-";
  const clockTime = resolveClockTimeString(time) ?? time;
  const minutes = parseClockTimeToMinutes(clockTime);
  if (minutes === null) return clockTime.trim().slice(0, 5);
  const hours24 = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 || 12;
  return `${hours12}:${String(mins).padStart(2, "0")} ${period}`;
}

export function resolveTeamInitial(teamName: string): string {
  const match = /team\s+([a-z0-9])/i.exec(teamName);
  if (match?.[1]) return match[1].toUpperCase();
  return teamName.trim().charAt(0).toUpperCase() || "?";
}

export function formatPreviewScheduleTime(time?: string | null): string {
  if (!time) return "--:--";
  const minutes = parseClockTimeToMinutes(time);
  if (minutes === null) return time.trim().slice(0, 5);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

function formatShortWeekday(isoDate: string): string {
  const parsed = parseLocalDate(isoDate);
  if (!parsed) return "";
  return parsed.toLocaleDateString("en-GB", { weekday: "short" });
}

export function buildPreviewScheduleLabel(params: {
  startDateIso: string;
  endDateIso: string;
  checkIn?: string | null;
  checkOut?: string | null;
}): string {
  const startDay = formatShortWeekday(params.startDateIso);
  const endDay = formatShortWeekday(params.endDateIso);
  const startTime = formatPreviewScheduleTime(params.checkIn);
  const endTime = formatPreviewScheduleTime(params.checkOut);
  const overnightSuffix =
    params.endDateIso !== params.startDateIso ? " (+1)" : "";
  return `${startDay} ${startTime} → ${endDay} ${endTime}${overnightSuffix}`;
}

function extractClockTimeForLookup(time?: string | null): string | null {
  if (!time) return null;
  const trimmed = time.trim();

  const isoMatch = /T(\d{2}:\d{2})(?::\d{2})?/.exec(trimmed);
  if (isoMatch) return isoMatch[1];

  const clockMatch = /^(\d{1,2}:\d{2})/.exec(trimmed);
  if (clockMatch) {
    const minutes = parseClockTimeToMinutes(clockMatch[1]);
    if (minutes !== null) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
    }
  }

  return trimmed.length >= 5 ? trimmed.slice(0, 5) : null;
}

function resolveClockTimeString(time?: string | null): string | null {
  return extractClockTimeForLookup(time);
}

function normalizeTemplateTime(time: string): string {
  return extractClockTimeForLookup(time) ?? time.trim().slice(0, 5);
}

type BreakMinutesLookup = {
  byTypeAndTime: Map<string, number>;
  byType: Map<string, number>;
};

function buildBreakMinutesLookup(
  templates: JobPreviewShiftTemplate[] | undefined,
): BreakMinutesLookup {
  const byTypeAndTime = new Map<string, number>();
  const byType = new Map<string, number>();
  if (!templates?.length) return { byTypeAndTime, byType };

  for (const template of templates) {
    const type = template.shift_type.toUpperCase();
    const key = `${type}:${normalizeTemplateTime(template.start_time)}`;
    byTypeAndTime.set(key, template.break_minutes);
    byType.set(type, template.break_minutes);
  }

  return { byTypeAndTime, byType };
}

function resolveBreakMinutesFromLookup(
  shift: JobPreviewShift,
  lookup: BreakMinutesLookup,
): number | null {
  if (lookup.byTypeAndTime.size === 0 && lookup.byType.size === 0) {
    return null;
  }

  const type = shift.shift_type.toUpperCase();
  const timeKey = `${type}:${normalizeTemplateTime(shift.planned_check_in)}`;
  return lookup.byTypeAndTime.get(timeKey) ?? lookup.byType.get(type) ?? null;
}

function enrichPreviewShiftBreakMinutes(
  shift: JobPreviewShift,
  breakLookup: BreakMinutesLookup,
): JobPreviewShift {
  const fromTemplate = resolveBreakMinutesFromLookup(shift, breakLookup);
  if (fromTemplate != null) {
    return { ...shift, break_minutes: fromTemplate };
  }

  return shift;
}

export function formatShiftTypeLabel(
  shiftType: PreviewShiftTemplateType | string,
): string {
  const labels: Record<string, string> = {
    MORNING: "Morning",
    DAY: "Day",
    EVENING: "Evening",
    NIGHT: "Night",
  };
  return labels[shiftType.toString().toUpperCase()] ?? shiftType.toString();
}

export function formatDurationMinutes(minutes: number): string {
  const safe = Math.max(0, Math.round(minutes));
  const hours = Math.floor(safe / 60);
  const mins = safe % 60;
  if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h`;
  return `${mins}m`;
}

export function resolveGrossDurationMinutes(
  checkIn?: string,
  checkOut?: string,
): number | null {
  const inTime = resolveClockTimeString(checkIn) ?? checkIn;
  const outTime = resolveClockTimeString(checkOut) ?? checkOut;
  if (!inTime || !outTime) return null;

  const inM = parseClockTimeToMinutes(inTime);
  const outM = parseClockTimeToMinutes(outTime);
  if (inM === null || outM === null) return null;

  if (shiftSpansMidnight(inTime, outTime)) {
    return 24 * 60 - inM + outM;
  }

  return outM - inM;
}

/** Resolve break minutes from form input (instant or per-shift scheduling). */
export function resolveBreakMinutesFromPayload(
  payload: JobCreatePayload,
  shiftType?: PreviewShiftTemplateType | string,
): number | null {
  if (
    payload.break_duration_minutes != null &&
    Number.isFinite(payload.break_duration_minutes) &&
    payload.break_duration_minutes >= 0
  ) {
    return payload.break_duration_minutes;
  }

  const details = payload.shift_schedule_details ?? {};
  if (shiftType) {
    const normalizedShift = shiftType.toString().toLowerCase() as ShiftType;
    const fromShift = details[normalizedShift]?.break_duration_minutes;
    if (fromShift != null && Number.isFinite(fromShift)) {
      return fromShift;
    }
  }

  const selectedShifts = (payload.selected_shift_types ?? []) as ShiftType[];
  for (const shift of selectedShifts) {
    const breakMinutes = details[shift]?.break_duration_minutes;
    if (breakMinutes != null && Number.isFinite(breakMinutes)) {
      return breakMinutes;
    }
  }

  const shiftDuration =
    (payload.shift_duration_type as ShiftDurationType | undefined) ?? "8_hrs";
  return getDefaultBreakDurationMinutes(shiftDuration);
}

function inferDefaultBreakMinutes(grossMinutes: number): number {
  return grossMinutes > 8 * 60 + 30 ? 90 : 45;
}

function resolvePreviewBreakMinutes(
  shift: JobPreviewShift,
  grossMinutes: number,
  templateBreakMinutes?: number | null,
): number {
  if (templateBreakMinutes != null && templateBreakMinutes >= 0) {
    return templateBreakMinutes;
  }
  if (shift.break_minutes != null && shift.break_minutes >= 0) {
    return shift.break_minutes;
  }
  return inferDefaultBreakMinutes(grossMinutes);
}

function resolvePreviewPayableMinutes(
  shift: JobPreviewShift,
  grossMinutes: number,
  breakMinutes: number,
): number {
  if (shift.planned_minutes != null && shift.planned_minutes > 0) {
    return shift.planned_minutes;
  }
  return Math.max(0, grossMinutes - breakMinutes);
}

export function resolvePreviewRotationDay(shift: JobPreviewShift): string {
  const parsed = parseLocalDate(shift.shift_date);
  const fullWeekday = parsed
    ? parsed.toLocaleDateString("en-GB", { weekday: "long" })
    : "-";

  if (shift.cycle_day != null) {
    return `${fullWeekday} · Day ${shift.cycle_day}`;
  }
  if (shift.shift_index != null) {
    return `${fullWeekday} · Shift ${shift.shift_index}`;
  }
  return fullWeekday;
}

export function resolvePreviewWorkingTimeParts(
  shift: JobPreviewShift,
  breakLookup?: BreakMinutesLookup,
): {
  payableLabel: string;
  payableMinutes: number | null;
  grossDurationLabel: string;
  breakMinutes: number | null;
} {
  const grossMinutes = resolveGrossDurationMinutes(
    shift.planned_check_in,
    shift.planned_check_out,
  );

  if (grossMinutes == null) {
    const checkIn = resolveClockTimeString(shift.planned_check_in) ?? shift.planned_check_in;
    const checkOut =
      resolveClockTimeString(shift.planned_check_out) ?? shift.planned_check_out;
    const hours = getShiftDurationHours(checkIn, checkOut);
    if (hours == null) {
      return {
        payableLabel: "-",
        payableMinutes: null,
        grossDurationLabel: "-",
        breakMinutes: null,
      };
    }
    const payableMinutes = Math.round(hours * 60);
    return {
      payableLabel: `${hours}h`,
      payableMinutes,
      grossDurationLabel: `${hours}h`,
      breakMinutes: null,
    };
  }

  const templateBreakMinutes = breakLookup
    ? resolveBreakMinutesFromLookup(shift, breakLookup)
    : null;
  const breakMinutes = resolvePreviewBreakMinutes(
    shift,
    grossMinutes,
    templateBreakMinutes,
  );
  const payableMinutes = resolvePreviewPayableMinutes(
    shift,
    grossMinutes,
    breakMinutes,
  );

  return {
    payableLabel: formatDurationMinutes(payableMinutes),
    payableMinutes,
    grossDurationLabel: formatDurationMinutes(grossMinutes),
    breakMinutes,
  };
}

export function resolveShiftPreviewPayParts(
  payableMinutes: number,
  workers: number,
  context: ShiftPreviewPayContext,
): ShiftPreviewPayParts | null {
  if (payableMinutes <= 0 || context.hourlyRateCents <= 0) return null;

  const subtotalCents = Math.round(
    (context.hourlyRateCents * payableMinutes * Math.max(1, workers)) / 60,
  );

  const taxComponents = context.taxComponents.map((component) => ({
    ...component,
    tax_amount_cents: Math.round(
      (subtotalCents * component.tax_percentage) / 100,
    ),
  }));

  const taxCents = taxComponents.reduce(
    (sum, component) => sum + component.tax_amount_cents,
    0,
  );

  return {
    subtotalCents,
    taxCents,
    totalCents: subtotalCents + taxCents,
    taxComponents,
  };
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

function resolvePreviewRowId(shift: JobPreviewShift): string {
  const dayKey = shift.cycle_day ?? shift.shift_index ?? 0;
  return `${shift.shift_date}-${shift.shift_type}-${dayKey}-${shift.team_name ?? ""}`;
}

export function mapPreviewShiftToRow(
  shift: JobPreviewShift,
  payContext?: ShiftPreviewPayContext,
  breakLookup?: BreakMinutesLookup,
): ShiftPreviewRow {
  const checkIn = resolveClockTimeString(shift.planned_check_in) ?? shift.planned_check_in;
  const checkOut =
    resolveClockTimeString(shift.planned_check_out) ?? shift.planned_check_out;
  const spansMidnight = shiftSpansMidnight(checkIn, checkOut);
  const endDateIso = spansMidnight
    ? addCalendarDays(shift.shift_date, 1)
    : shift.shift_date;
  const startMinutes = parseClockTimeToMinutes(checkIn) ?? 0;
  const endMinutes = parseClockTimeToMinutes(checkOut) ?? 0;
  const workingTime = resolvePreviewWorkingTimeParts(shift, breakLookup);
  const payParts =
    payContext && workingTime.payableMinutes != null
      ? resolveShiftPreviewPayParts(
          workingTime.payableMinutes,
          shift.required_workers,
          payContext,
        )
      : null;
  const team = shift.team_name ?? "-";

  return {
    id: resolvePreviewRowId(shift),
    shiftType: shift.shift_type,
    shiftLabel: formatShiftTypeLabel(shift.shift_type),
    rotationDay: resolvePreviewRotationDay(shift),
    team,
    teamInitial: resolveTeamInitial(team),
    startDateLabel: formatPreviewDateLabel(shift.shift_date),
    startTimeLabel: formatPreviewTime12h(checkIn),
    endDateLabel: formatPreviewDateLabel(endDateIso),
    endTimeLabel: formatPreviewTime12h(checkOut),
    timelineStartMinutes: startMinutes,
    timelineEndMinutes: endMinutes,
    spansMidnight,
    grossDurationLabel: workingTime.grossDurationLabel,
    breakMinutes: workingTime.breakMinutes,
    payableLabel: workingTime.payableLabel,
    paySubtotalCents: payParts?.subtotalCents ?? null,
    payTaxCents: payParts?.taxCents ?? null,
    payTotalCents: payParts?.totalCents ?? null,
    payTaxComponents: payParts?.taxComponents ?? [],
    workers: shift.required_workers,
  };
}

function comparePreviewShiftsChronologically(
  a: JobPreviewShift,
  b: JobPreviewShift,
): number {
  const dateCompare = a.shift_date.localeCompare(b.shift_date);
  if (dateCompare !== 0) return dateCompare;

  const aCheckIn =
    parseClockTimeToMinutes(
      resolveClockTimeString(a.planned_check_in) ?? a.planned_check_in,
    ) ?? 0;
  const bCheckIn =
    parseClockTimeToMinutes(
      resolveClockTimeString(b.planned_check_in) ?? b.planned_check_in,
    ) ?? 0;
  if (aCheckIn !== bCheckIn) return aCheckIn - bCheckIn;

  const cycleCompare = (a.cycle_day ?? 0) - (b.cycle_day ?? 0);
  if (cycleCompare !== 0) return cycleCompare;

  const teamCompare = (a.team_name ?? "").localeCompare(b.team_name ?? "");
  if (teamCompare !== 0) return teamCompare;

  return a.shift_type.localeCompare(b.shift_type);
}

export function mapPreviewShiftsToRows(
  shifts: JobPreviewShift[],
  shiftTemplates?: JobPreviewShiftTemplate[],
  payContext?: ShiftPreviewPayContext,
): ShiftPreviewRow[] {
  const breakLookup = buildBreakMinutesLookup(shiftTemplates);

  return [...shifts]
    .sort(comparePreviewShiftsChronologically)
    .map((shift) =>
      mapPreviewShiftToRow(
        enrichPreviewShiftBreakMinutes(shift, breakLookup),
        payContext,
        breakLookup,
      ),
    );
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
