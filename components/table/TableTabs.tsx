"use client";

import type { ReactNode } from "react";
import { Filter, LayoutGrid, List } from "lucide-react";

type TableTabItem<T extends string> = {
  key: T;
  label: ReactNode;
};

type TableTabsProps<T extends string> = {
  tabs: TableTabItem<T>[];
  activeTab: T;
  onTabChange: (tab: T) => void;
  className?: string;
  wrapperClassName?: string;
  listClassName?: string;
  tabClassName?: string;
  activeTabClassName?: string;
  inactiveTabClassName?: string;
  activeIndicatorClassName?: string;
  /** Renders on the same row as the tabs, aligned to the right (e.g. filter + layout toggle). */
  endSlot?: ReactNode;
  /** Applied to the outer flex row when `endSlot` is set. */
  toolbarClassName?: string;
  /** Applied to the wrapper around `endSlot` (padding / borders). */
  endSlotClassName?: string;
};

export function TableTabs<T extends string>({
  tabs,
  activeTab,
  onTabChange,
  className = "",
  wrapperClassName = "flex",
  listClassName,
  tabClassName = "relative px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-colors",
  activeTabClassName = "text-[#F4781B]",
  inactiveTabClassName = "text-gray-400 hover:text-gray-600",
  activeIndicatorClassName = "absolute bottom-0 left-0 right-0 h-[2px] bg-[#F4781B] rounded-t-full",
  endSlot,
  toolbarClassName = "",
  endSlotClassName = "",
}: TableTabsProps<T>) {
  const baseClassName =
    "overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

  const tabButtons = (
    <div className={[wrapperClassName, listClassName].filter(Boolean).join(" ")}>
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onTabChange(tab.key)}
            className={`${tabClassName} ${isActive ? activeTabClassName : inactiveTabClassName}`}
          >
            {tab.label}
            {isActive && activeIndicatorClassName.trim() && (
              <span className={activeIndicatorClassName} />
            )}
          </button>
        );
      })}
    </div>
  );

  const tabsRegion = (
    <div
      className={[
        baseClassName,
        endSlot ? "min-w-0 flex-1" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {tabButtons}
    </div>
  );

  if (endSlot == null) {
    return tabsRegion;
  }

  return (
    <div
      className={[
        "flex w-full min-w-0 flex-nowrap items-center gap-2 sm:gap-3",
        toolbarClassName,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {tabsRegion}
      <div
        className={["flex shrink-0 items-center", endSlotClassName].filter(Boolean).join(" ")}
      >
        {endSlot}
      </div>
    </div>
  );
}

export type TabToolbarFilterViewToggleProps = {
  view: "grid" | "list";
  onViewChange: (view: "grid" | "list") => void;
  onFilterClick: () => void;
  iconSize?: number;
  className?: string;
};

export function TabToolbarFilterViewToggle({
  view,
  onViewChange,
  onFilterClick,
  iconSize = 16,
  className = "flex items-center gap-3",
}: TabToolbarFilterViewToggleProps) {
  const activeGrid = view === "grid";
  const activeList = view === "list";
  return (
    <div className={className}>
      <button
        type="button"
        onClick={onFilterClick}
        className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap"
      >
        <Filter size={iconSize} />
        Filter
      </button>
      <div className="flex bg-white border border-gray-200 rounded-lg  overflow-hidden">
        <button
          type="button"
          onClick={() => onViewChange("grid")}
          className={`p-2.5 transition-colors ${activeGrid ? "bg-orange-50 text-[#F4781B]" : "text-gray-400 hover:bg-gray-50"}`}
          aria-pressed={activeGrid}
          aria-label="Grid view"
        >
          <LayoutGrid size={iconSize} />
        </button>
        <button
          type="button"
          onClick={() => onViewChange("list")}
          className={`p-2.5 transition-colors ${activeList ? "bg-orange-50 text-[#F4781B]" : "text-gray-400 hover:bg-gray-50"}`}
          aria-pressed={activeList}
          aria-label="List view"
        >
          <List size={iconSize} />
        </button>
      </div>
    </div>
  );
}
