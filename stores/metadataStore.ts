// stores/metadataStore.ts
import { create } from "zustand";
import {
  fetchDepartmentsAndJobTitles,
  fetchSpecializations,
  fetchAppMetadata,
  MetadataOption,
  Department,
  AppMetadata,
} from "@/stores/api/common.api";

interface MetadataStore {
  departments:            Department[];
  jobTitles:              MetadataOption[];
  specializations:        MetadataOption[];
  genderOptions:          string[];
  jobTypeOptions:         string[];
  workEligibilityOptions: string[];
  shiftTypeOptions:       string[];
  loaded:                 boolean;
  loading:                boolean;
  loadAll:                () => Promise<void>;
  jobTitlesForDepartment: (departmentValue: string) => MetadataOption[];
}

export const useMetadataStore = create<MetadataStore>((set, get) => ({
  departments:            [],
  jobTitles:              [],
  specializations:        [],
  genderOptions:          [],
  jobTypeOptions:         [],
  workEligibilityOptions: [],
  shiftTypeOptions:       [],
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

      const meta: AppMetadata = metaRes.data ?? {
        gender:           [],
        jobTypes:         [],
        specialization:   [],
        work_eligibility: [],
        shiftTypes:       [],
      };

      set({
        departments,
        jobTitles,
        specializations,
        genderOptions:          meta.gender,
        jobTypeOptions:         meta.jobTypes,
        workEligibilityOptions: meta.work_eligibility,
        shiftTypeOptions:       meta.shiftTypes,
        loaded: true,
      });
    } catch (e) {
      console.error("[metadataStore] loadAll failed:", e);
    } finally {
      set({ loading: false });
    }
  },

  jobTitlesForDepartment: (departmentValue: string) => {
    const dept = get().departments.find((d) => d.value === departmentValue);
    return dept?.jobTitles ?? get().jobTitles;
  },
}));