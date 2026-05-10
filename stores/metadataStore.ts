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
  metadata: (initialMetaData.data as AppMetadata) ?? null,
  metadataVersion: initialMetaData.version ?? null,
  genderOptions: initialMetaData.data.gender ?? [],
  jobTypeOptions: initialMetaData.data.job_types ?? [],
  workEligibilityOptions: initialMetaData.data.work_eligibility ?? [],
  shiftTypeOptions: initialMetaData.data.shift_types ?? [],
  organizationTypeOptions: initialMetaData.data.organisation_type ?? [],
  provinceOptions: initialMetaData.data.canadian_provinces ?? [],
  countryOptions: initialMetaData.data.countryList ?? [],
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
        (initialMetaData.data as AppMetadata) ??
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
