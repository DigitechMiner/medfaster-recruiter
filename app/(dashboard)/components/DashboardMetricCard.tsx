"use client";
import React from "react";
import {
  Clock, Users, Briefcase, AlertTriangle,
  TrendingUp, TrendingDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

type IconType = "clock" | "users" | "briefcase" | "alert";

interface DashboardMetricCardProps {
  loading?: boolean;
  icon: IconType;
  title: string;
  value: number;
  subLabel?: string;
  trend?: number;
  trendUp?: boolean;
  trendNegative?: boolean;
  valueClassName?: string;
}

const ICON_MAP: Record<IconType, React.ReactNode> = {
  clock:     <Clock className="w-5 h-5 text-[#F4781B]" />,
  users:     <Users className="w-5 h-5 text-[#F4781B]" />,
  briefcase: <Briefcase className="w-5 h-5 text-[#F4781B]" />,
  alert:     <AlertTriangle className="w-5 h-5 text-[#F4781B]" />,
};

export function DashboardMetricCard({
  loading,
  icon,
  title,
  value,
  subLabel,
  trend,
  trendUp,
  trendNegative,
  valueClassName,
}: DashboardMetricCardProps) {
  const trendColor = trendNegative
    ? "text-[#F4781B]"
    : trendUp
    ? "text-green-500"
    : "text-red-500";

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
          {ICON_MAP[icon]}
        </div>
      </div>

      {loading ? (
        <div className="h-9 w-16 bg-gray-200 rounded animate-pulse" />
      ) : (
        <p className={cn("text-3xl font-bold text-gray-900 tabular-nums", valueClassName)}>
          {value < 10 ? String(value).padStart(2, "0") : value}
        </p>
      )}

      <div className="flex items-center justify-between gap-2 mt-auto">
        {subLabel && <p className="text-xs text-gray-500">{subLabel}</p>}
        {trend !== undefined && (
          <div className={cn("flex items-center gap-0.5 text-xs font-medium ml-auto", trendColor)}>
            {trendUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>{Math.abs(trend).toFixed(2)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}