import type {
  InstantJobFeePreviewData,
  JobFeePreviewData,
  JobPreviewShift,
  JobPreviewTaxComponent,
} from "@/types";
import {
  mapPreviewShiftsToRows,
  type ShiftPreviewRow,
} from "../normal/map-preview-response";

export type InstantPreviewCostSummary = {
  hourlyRateCents: number;
  dueNowCents: number;
  subtotalCents: number;
  taxCents: number;
  taxComponents: JobPreviewTaxComponent[];
  costPerShiftCents: number;
  hires: number;
  hoursPerShift: number;
  hoursLabel: string;
  shiftCount: number;
  isInstantPreview: true;
};

export function hasInstantPreviewShifts(
  data: JobFeePreviewData | null | undefined,
): data is JobFeePreviewData & { preview_shifts: JobPreviewShift[] } {
  return Boolean(data?.preview_shifts?.length);
}

/** Same row shape and column layout as normal job preview (`mapPreviewShiftsToRows`). */
export function mapInstantPreviewShiftsToRows(
  shifts: JobPreviewShift[],
): ShiftPreviewRow[] {
  return mapPreviewShiftsToRows(shifts);
}

function resolveCostPerShiftCents(
  recruiterPayCents: number,
  shiftCount: number,
  hires: number,
): number {
  const divisor = Math.max(1, shiftCount * Math.max(1, hires));
  return Math.round(recruiterPayCents / divisor);
}

export function buildInstantPreviewCostSummary(
  data: InstantJobFeePreviewData | null | undefined,
  fallbackHires: number,
): InstantPreviewCostSummary | null {
  const payment = data?.payment;
  if (!payment) return null;

  const hires = data.no_of_hires ?? fallbackHires;
  const shiftCount =
    payment.no_of_shifts ?? data.shift_count ?? data.preview_shifts?.length ?? 0;

  return {
    hourlyRateCents: payment.per_hour_cents,
    dueNowCents: payment.total_pay_cents,
    subtotalCents: payment.recruiter_pay_cents,
    taxCents: payment.tax.total_tax_cents,
    taxComponents: payment.tax.components,
    costPerShiftCents: resolveCostPerShiftCents(
      payment.recruiter_pay_cents,
      shiftCount,
      hires,
    ),
    hires,
    hoursPerShift: payment.total_working_hours,
    hoursLabel: `${payment.total_working_hours} hrs`,
    shiftCount,
    isInstantPreview: true,
  };
}
