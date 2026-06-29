import { useMemo } from "react";
import { useMetadataStore } from "@/stores/metadataStore";
import {
  getCitiesForProvince,
  type CanadianProvinceOption,
} from "@/utils/constant/metadata";

export function useCanadianCitySelectOptions(provinceValue?: string | null) {
  const provinceOptions = useMetadataStore((state) => state.provinceOptions);

  return useMemo(
    () =>
      getCitiesForProvince(
        provinceOptions as CanadianProvinceOption[],
        provinceValue,
      ).map((city) => ({
        label: city.label,
        value: city.value,
      })),
    [provinceOptions, provinceValue],
  );
}
