"use client";

import React from "react";
import {
  Clock,
  PersonStanding,
  BriefcaseBusiness,
  Timer,
  LogOut,
  TriangleAlert,
} from "lucide-react";
import type { CalendarJob } from "@/Interface/recruiter.types";

export type CalendarView = "day" | "week" | "month";
export type StatusType = "active" | "upcoming" | "completed" | "noshow";

export const WEEKDAY_FULL = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const TIMESLOTS_24H = [
  "12:00 AM",
  "01:00 AM",
  "02:00 AM",
  "03:00 AM",
  "04:00 AM",
  "05:00 AM",
  "06:00 AM",
  "07:00 AM",
  "08:00 AM",
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
  "07:00 PM",
  "08:00 PM",
  "09:00 PM",
  "10:00 PM",
  "11:00 PM",
];

export function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export function isSameDate(d1: Date, d2: Date) {
  return (
    d1.getFullYear() === d2.getFullYear()
    && d1.getMonth() === d2.getMonth()
    && d1.getDate() === d2.getDate()
  );
}

export function getWeekDays(date: Date): Date[] {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay());

  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
}

export function formatWeekRange(date: Date) {
  const days = getWeekDays(date);
  const start = days[0];
  const end = days[6];

  return `${MONTH_SHORT[start.getMonth()]} ${String(start.getDate()).padStart(2, "0")} - ${MONTH_SHORT[end.getMonth()]} ${String(end.getDate()).padStart(2, "0")}, ${end.getFullYear()}`;
}

export function formatDayTitle(date: Date) {
  return `${MONTH_NAMES[date.getMonth()]} ${String(date.getDate()).padStart(2, "0")}, ${date.getFullYear()}`;
}

export function jobToSlotIdx(job: CalendarJob): number {
  if (!job.planned_check_in) {
    return -1;
  }

  const [hours] = job.planned_check_in.split(":");
  return parseInt(hours, 10);
}

export function getStatusPill(job: CalendarJob) {
  const hasCheckedIn = !!job.check_in;
  const hasCheckedOut = !!job.check_out;

  if (hasCheckedOut) {
    return { text: "✓ Successful end", className: "bg-green-50  text-green-700  border border-green-200" };
  }
  if (hasCheckedIn) {
    return { text: "✓ Check-In Complete !", className: "bg-green-50  text-green-700  border border-green-200" };
  }
  if (job.shift_status === "CANCELLED") {
    return { text: "⚠ No show yet !", className: "bg-red-50    text-red-600    border border-red-200" };
  }
  if (job.shift_status === "UPCOMING") {
    return { text: "⏱ Starts in few min.", className: "bg-orange-50 text-orange-600 border border-orange-200" };
  }
  if (job.shift_status === "ACTIVE") {
    return { text: "✓ Successful start", className: "bg-green-50  text-green-700  border border-green-200" };
  }

  return { text: "⏱ Starts in few min.", className: "bg-orange-50 text-orange-600 border border-orange-200" };
}

export function DayEventCard({ job }: { job: CalendarJob }) {
  const isUrgent = job.job_type?.toLowerCase().includes("urgent");
  const statusPill = getStatusPill(job);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-2.5 shadow-sm min-w-[155px] max-w-[185px] flex-shrink-0">
      <div className="flex items-center justify-between mb-1.5">
        <span className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
          <span className={`w-1.5 h-1.5 rounded-full inline-block ${isUrgent ? "bg-orange-500" : "bg-green-500"}`} />
          {job.job_id}
        </span>
        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${isUrgent
            ? "bg-orange-50 text-orange-600 border-orange-200"
            : "bg-green-50  text-green-700  border-green-200"}`}
        >
          {isUrgent ? "Urgent" : "Regular"}
        </span>
      </div>

      <div className="text-[12px] font-bold text-gray-900 mb-1.5 leading-tight">{job.job_title}</div>

      <div className="text-[11px] text-gray-500 mb-0.5">Candidates: {job.candidate_name}</div>

      {job.planned_check_in && (
        <div className="text-[11px] text-gray-500 mb-2">
          Check-In by {job.planned_check_in.slice(0, 5)}
          {job.check_out ? " pm" : " am"}
        </div>
      )}

      <div className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full ${statusPill.className}`}>
        {statusPill.text}
      </div>
    </div>
  );
}

export function MonthBadge({ count, type }: { count: number; type: StatusType | "completed" }) {
  const configs = {
    active: { dot: "bg-green-500", pill: "bg-green-50  text-green-700  border-green-200", label: "Active" },
    noshow: { dot: "bg-red-500", pill: "bg-red-50    text-red-600    border-red-200", label: "No-Show !" },
    upcoming: { dot: "bg-yellow-500", pill: "bg-yellow-50 text-yellow-700 border-yellow-200", label: "Upcoming" },
    completed: { dot: "bg-orange-400", pill: "bg-orange-50 text-orange-600 border-orange-200", label: "Completed" },
  };

  const config = configs[type];
  return (
    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold w-fit ${config.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {String(count).padStart(2, "0")} {config.label}
    </div>
  );
}
