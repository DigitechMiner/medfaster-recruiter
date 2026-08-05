import { getProvinceLabel } from "@/utils/constant/metadata";
import { timezoneFromCanadianProvince } from "./canadian-province";

/** e.g. "Times are in Alberta (America/Edmonton)" */
export function formatFacilityTimezoneHint(
  province?: string | null,
): string | null {
  const trimmed = province?.trim();
  if (!trimmed) return null;

  const label = getProvinceLabel(trimmed) || trimmed;
  const tz = timezoneFromCanadianProvince(trimmed);
  return `Times are in ${label} (${tz})`;
}
