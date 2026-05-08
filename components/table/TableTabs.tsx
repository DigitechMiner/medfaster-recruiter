"use client";

import type { ReactNode } from "react";

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
}: TableTabsProps<T>) {
  const baseClassName =
    "overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

  return (
    <div className={[baseClassName, className].filter(Boolean).join(" ")}>
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
    </div>
  );
}
