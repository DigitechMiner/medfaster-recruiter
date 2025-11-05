import { create } from "zustand";

interface JobsStore {
  hasJobs: boolean;
  setHasJobs: (hasJobs: boolean) => void;
}

export const useJobsStore = create<JobsStore>((set) => ({
  hasJobs: false,
  setHasJobs: (hasJobs: boolean) => set({ hasJobs }),
}));

