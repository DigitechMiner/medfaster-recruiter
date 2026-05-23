import type {
  InstantJobFeePreviewData,
  JobFeePreviewData,
  JobPreviewShift,
} from "@/types";
import {
  mapPreviewShiftsToRows,
  type ShiftPreviewRow,
} from "../normal/map-preview-response";

export type InstantPreviewCostSummary = {
  hourlyRateCents: number;
  dueNowCents: number;
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

export function buildInstantPreviewCostSummary(
  data: InstantJobFeePreviewData | null,
  fallbackHires: number,
): InstantPreviewCostSummary | null {
  if (!data) return null;

  const hires = data.no_of_hires ?? fallbackHires;
  const shiftCount = data.shift_count ?? data.preview_shifts?.length ?? 0;

  return {
    hourlyRateCents: data.recruiter_pay_per_hour_cents,
    dueNowCents: data.total_recruiter_pay_cents,
    costPerShiftCents: data.per_candidate_shift_recruiter_pay_cents,
    hires,
    hoursPerShift: data.total_working_hours,
    hoursLabel: data.total_working_hours_label,
    shiftCount,
    isInstantPreview: true,
  };
}
