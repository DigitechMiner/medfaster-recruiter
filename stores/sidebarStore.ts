// stores/sidebarStore.ts
import { create } from "zustand";

interface SidebarStore {
  isExpanded: boolean;
  setExpanded: (val: boolean) => void;
}

export const useSidebarStore = create<SidebarStore>((set) => ({
  isExpanded: false,
  setExpanded: (val) => set({ isExpanded: val }),
}));