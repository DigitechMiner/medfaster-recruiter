"use client";

import React from "react";

export function renderCandidateCards<T>(
  items: T[],
  renderItem: (item: T, index: number) => React.ReactNode
) {
  return items.map((item, index) => renderItem(item, index));
}
