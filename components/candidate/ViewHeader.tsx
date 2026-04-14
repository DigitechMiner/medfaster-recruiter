"use client";

import React from "react";
import { Filter, LayoutGrid, List } from "lucide-react";

interface ViewHeaderProps {
  wrapperClassName: string;
  filterButtonClassName: string;
  toggleWrapperClassName: string;
  gridButtonClassName: string;
  listButtonClassName: string;
  gridSize: number;
  listSize: number;
  filterSize: number;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  onGrid: () => void;
  onList: () => void;
}

export function ViewHeader({
  wrapperClassName,
  filterButtonClassName,
  toggleWrapperClassName,
  gridButtonClassName,
  listButtonClassName,
  gridSize,
  listSize,
  filterSize,
  leftSlot,
  rightSlot,
  onGrid,
  onList,
}: ViewHeaderProps) {
  return (
    <div className={wrapperClassName}>
      {leftSlot}
      <button className={filterButtonClassName}>
        <Filter size={filterSize} />
        Filter
      </button>
      <div className={toggleWrapperClassName}>
        <button onClick={onGrid} className={gridButtonClassName}>
          <LayoutGrid size={gridSize} />
        </button>
        <button onClick={onList} className={listButtonClassName}>
          <List size={listSize} />
        </button>
      </div>
      {rightSlot}
    </div>
  );
}
