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
} from "@/stores/api/common.api";

interface MetadataStore {
  departments:            Department[];
  jobTitles:              MetadataOption[];
  specializations:        MetadataOption[];
  metadata:               AppMetadata | null;
  metadataVersion:        string | null;
  genderOptions:          MetadataValueOption[];
  jobTypeOptions:         MetadataValueOption[];
  workEligibilityOptions: MetadataValueOption[];
  shiftTypeOptions:       MetadataValueOption[];
  organizationTypeOptions: MetadataValueOption[];
  provinceOptions:        MetadataValueOption[];
  countryOptions:         MetadataValueOption[];
  loaded:                 boolean;
  loading:                boolean;
  loadAll:                () => Promise<void>;
  jobTitlesForDepartment: (departmentValue: string) => MetadataOption[];
}

export const useMetadataStore = create<MetadataStore>((set, get) => ({
  departments:            [],
  jobTitles:              [],
  specializations:        [],
  metadata:               null,
  metadataVersion:        null,
  genderOptions:          [],
  jobTypeOptions:         [],
  workEligibilityOptions: [],
  shiftTypeOptions:       [],
  organizationTypeOptions: [],
  provinceOptions:        [],
  countryOptions:         [],
  loaded:  false,
  loading: false,

  loadAll: async () => {
    if (get().loaded || get().loading) return; // load once only

    set({ loading: true });
    try {
      const [{ departments, jobTitles }, specializations, metaRes] = await Promise.all([
        fetchDepartmentsAndJobTitles(),
        fetchSpecializations(),
        fetchAppMetadata(),
      ]);

      const meta: AppMetadata = metaRes.data ?? {};

      set({
        departments,
        jobTitles,
        specializations,
        metadata:               meta,
        metadataVersion:        metaRes.version ?? null,
        genderOptions:          meta.gender ?? [],
        jobTypeOptions:         meta.job_types ?? meta.jobTypes ?? [],
        workEligibilityOptions: meta.work_eligibility ?? [],
        shiftTypeOptions:       meta.shift_types ?? meta.shiftTypes ?? [],
        organizationTypeOptions: meta.organisation_type ?? [],
        provinceOptions:        meta.canadian_provinces ?? [],
        countryOptions:         meta.countryList ?? [],
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