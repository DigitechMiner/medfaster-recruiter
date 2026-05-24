"use client";
import React from "react";
import { AlertTriangle, Clock, AlertCircle, ChevronRight } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface TodaysTopIssuesProps {
  noShows: number;
  lateArrivals: number;
  positionsUnfilled: number;
  pendingCheckIns: number;
  isLoading?: boolean;
}

export function TodaysTopIssues({
  noShows,
  lateArrivals,
  positionsUnfilled,
  pendingCheckIns,
  isLoading,
}: TodaysTopIssuesProps) {
  const issues = [
    {
      key: "noShow",
      count: noShows,
      label: "No-Show",
      meta: "3 Active Jobs",
      icon: <AlertTriangle className="w-5 h-5" />,
      borderColor: "border-l-red-500",
      bg: "bg-red-50",
      textColor: "text-red-500",
    },
    {
      key: "lateArrival",
      count: lateArrivals,
      label: "Late Arrival",
      meta: "3 Active Jobs",
      icon: <Clock className="w-5 h-5" />,
      borderColor: "border-l-orange-400",
      bg: "bg-orange-50",
      textColor: "text-orange-400",
    },
    {
  key: "unfilled",
  count: positionsUnfilled,
  label: "Position Unfilled",
  meta: "1 Upcoming Job",
  icon: (
    <Image
      src="/svg/walking-icon.svg"
      alt="Position unfilled"
      width={20}
      height={20}
      className="text-orange-700" // Note: this won't tint SVG via CSS
    />
  ),
  borderColor: "border-l-orange-700",
  bg: "bg-orange-50/60",
  textColor: "text-orange-700",
},
    {
      key: "pendingCheckIn",
      count: pendingCheckIns,
      label: "Pending Check-In's",
      meta: "3 Active Jobs",
      icon: <AlertCircle className="w-5 h-5" />,
      borderColor: "border-l-red-400",
      bg: "bg-red-50",
      textColor: "text-red-400",
    },
  ];

  const totalCount = noShows + lateArrivals + pendingCheckIns;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-4">
        <h2 className="text-sm font-bold text-gray-900">Today&apos;s Top Issues</h2>
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border-2 border-red-400 text-red-500 text-xs font-bold shrink-0">
          {isLoading ? "—" : totalCount}
        </span>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-100" />

      {/* Issue rows */}
      <div className="flex flex-col gap-3 p-4 flex-1 justify-between">
        {issues.map(({ key, count, label, meta, icon, borderColor, bg, textColor }) => (
          <button
            key={key}
            type="button"
            className={cn(
              "flex items-center gap-3 px-3 py-3 rounded-lg text-left w-full",
              "border-l-3 hover:opacity-90 transition-opacity",
              bg,
              borderColor,
            )}
          >
            {/* Icon */}
            <span className={cn("shrink-0", textColor)}>
              {isLoading ? (
                <div className="w-5 h-5 rounded bg-gray-200 animate-pulse" />
              ) : (
                icon
              )}
            </span>

            {/* Label — whitespace-nowrap keeps it on one line */}
            <span className={cn("flex-1 text-sm font-semibold whitespace-nowrap", textColor)}>
              {isLoading ? (
                <span className="block h-3.5 w-28 bg-gray-200 rounded animate-pulse" />
              ) : (
                `${count} ${label}`
              )}
            </span>

            {/* Meta + chevron */}
            <div className="flex items-center gap-0.5 shrink-0">
              <span className="text-xs text-gray-400 whitespace-nowrap">{meta}</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}