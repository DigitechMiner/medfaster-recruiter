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
import { metaData as initialMetaData } from "@/utils/constant/metadata";

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

const initialData = initialMetaData.data as AppMetadata;

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
        provinceOptions: meta.canadian_provinces ?? [],
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
}));
