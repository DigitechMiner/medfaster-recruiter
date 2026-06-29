// stores/metadataStore.ts
import { create } from "zustand";
import {
  fetchDepartmentsAndJobTitles,
  fetchSpecializations,
  fetchAppMetadata,
  MetadataOption,
  Department,
  AppMetadata,
  MetadataValueOption,
} from "@/features/common";
import { metaData as initialMetaData, getCityLabel, type CanadianProvinceOption } from "@/utils/constant/metadata";

/** Map province value, label, or abbreviation to display label using store/API province options. */
export function resolveCanadianProvinceLabel(
  provinces: readonly MetadataValueOption[],
  province: string | null | undefined,
): string {
  if (!province?.trim()) return "";
  const v = province.trim();
  const normalized = v.toLowerCase().replace(/-/g, "_");
  const match = provinces.find((p) => {
    const abvRaw = (p as { abvName?: unknown }).abvName;
    const abv = typeof abvRaw === "string" ? abvRaw : "";
    return (
      p.value === normalized ||
      p.value === v.toLowerCase() ||
      p.label === v ||
      p.label.toLowerCase() === normalized ||
      (abv.length > 0 && abv.toUpperCase() === v.toUpperCase())
    );
  });
  return match?.label ?? v;
}

/** Map city value or label to display label using province-scoped metadata options. */
export function resolveCanadianCityLabel(
  provinces: readonly MetadataValueOption[],
  province: string | null | undefined,
  city: string | null | undefined,
): string {
  if (!city?.trim()) return "";
  return getCityLabel(
    provinces as CanadianProvinceOption[],
    province,
    city,
  );
}

const initialData = initialMetaData.data as AppMetadata;

const mergeProvinceOptionsWithCities = (
  apiProvinces: MetadataValueOption[] = [],
  localProvinces: MetadataValueOption[] = [],
): MetadataValueOption[] => {
  if (!apiProvinces.length) return localProvinces;

  return apiProvinces.map((apiProvince) => {
    const localMatch = localProvinces.find(
      (province) =>
        province.value === apiProvince.value ||
        province.label === apiProvince.label,
    );
    const cities =
      apiProvince.cities && apiProvince.cities.length > 0
        ? apiProvince.cities
        : localMatch?.cities;

    return cities ? { ...apiProvince, cities } : apiProvince;
  });
};

const dedupeMetadataOptions = (options: MetadataOption[] = []): MetadataOption[] => {
  const seen = new Set<string>();
  return options.filter((option) => {
    const key = `${option.uuid}::${option.value}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const dedupeDepartments = (departments: Department[] = []): Department[] => {
  const seen = new Set<string>();
  return departments
    .filter((department) => {
      const key = `${department.uuid}::${department.value}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((department) => ({
      ...department,
      jobTitles: dedupeMetadataOptions(department.jobTitles ?? []),
    }));
};

const findJobTitleByValue = (
  departments: Department[],
  jobTitles: MetadataOption[],
  jobTitleValue: string,
): MetadataOption | undefined => {
  if (!jobTitleValue) return undefined;

  for (const department of departments) {
    const match = department.jobTitles?.find(
      (title) => title.value === jobTitleValue,
    );
    if (match) return match;
  }

  return jobTitles.find((title) => title.value === jobTitleValue);
};

interface MetadataStore {
  departments: Department[];
  jobTitles: MetadataOption[];
  specializations: MetadataOption[];
  metadata: AppMetadata | null;
  metadataVersion: string | null;
  genderOptions: MetadataValueOption[];
  jobTypeOptions: MetadataValueOption[];
  workEligibilityOptions: MetadataValueOption[];
  shiftTypeOptions: MetadataValueOption[];
  organizationTypeOptions: MetadataValueOption[];
  provinceOptions: MetadataValueOption[];
  countryOptions: MetadataValueOption[];
  loaded: boolean;
  loading: boolean;
  loadAll: () => Promise<void>;
  jobTitlesForDepartment: (departmentValue: string) => MetadataOption[];
  specializationsForJobTitle: (jobTitleValue: string) => MetadataOption[];
}

export const useMetadataStore = create<MetadataStore>((set, get) => ({
  departments: [],
  jobTitles: [],
  specializations: [],
  metadata: initialData ?? null,
  metadataVersion: initialMetaData.version ?? null,
  genderOptions: initialData.gender ?? [],
  jobTypeOptions: initialData.job_types ?? [],
  workEligibilityOptions: initialData.work_eligibility ?? [],
  shiftTypeOptions: initialData.shift_types ?? [],
  organizationTypeOptions: initialData.organisation_type ?? [],
  provinceOptions: initialData.canadian_provinces ?? [],
  countryOptions: initialData.countryList ?? [],
  loaded: false,
  loading: false,

  loadAll: async () => {
    if (get().loaded || get().loading) return; // load once only

    set({ loading: true });
    try {
      const [{ departments, jobTitles }, specializations, metaRes] =
        await Promise.all([
          fetchDepartmentsAndJobTitles(),
          fetchSpecializations(),
          fetchAppMetadata(get().metadataVersion ?? initialMetaData.version),
        ]);

      const meta: AppMetadata =
        metaRes.data ??
        get().metadata ??
        initialData ??
        {};

      const normalizedDepartments = dedupeDepartments(departments);
      const normalizedJobTitles = dedupeMetadataOptions(jobTitles);
      const normalizedSpecializations = dedupeMetadataOptions(specializations);

      set({
        departments: normalizedDepartments,
        jobTitles: normalizedJobTitles,
        specializations: normalizedSpecializations,
        metadata: meta,
        metadataVersion: metaRes.version ?? get().metadataVersion ?? initialMetaData.version,
        genderOptions: meta.gender ?? [],
        jobTypeOptions: meta.job_types ?? meta.jobTypes ?? [],
        workEligibilityOptions: meta.work_eligibility ?? [],
        shiftTypeOptions: meta.shift_types ?? meta.shiftTypes ?? [],
        organizationTypeOptions: meta.organisation_type ?? [],
        provinceOptions: mergeProvinceOptionsWithCities(
          meta.canadian_provinces,
          initialData.canadian_provinces,
        ),
        countryOptions: meta.countryList ?? [],
        loaded: true,
      });
    } catch (e) {
      console.log("[metadataStore] loadAll failed:", e);
    } finally {
      set({ loading: false });
    }
  },

  jobTitlesForDepartment: (departmentValue: string) => {
    const dept = get().departments.find((d) => d.value === departmentValue);
    return dept?.jobTitles ?? get().jobTitles;
  },

  specializationsForJobTitle: (jobTitleValue: string) => {
    if (!jobTitleValue) return [];

    const { departments, jobTitles, specializations } = get();
    const jobTitle = findJobTitleByValue(
      departments,
      jobTitles,
      jobTitleValue,
    );
    const jobTitleId = jobTitle?.id;

    if (jobTitleId == null) return [];

    return specializations.filter((specialization) =>
      (specialization.job_title_ids ?? []).includes(jobTitleId),
    );
  },
}));
