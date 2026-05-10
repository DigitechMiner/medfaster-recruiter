import type { CalendarJob } from "@/types";

export type CalendarView = "day" | "week" | "month";
export type BadgeType = "active" | "noshow" | "upcoming" | "completed";
type ShiftStatus = CalendarJob["shift_status"];
type StatusCount = Record<ShiftStatus, number>;

export type CalendarCell = { day: number; type: "prev" | "current" | "next" };

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
  return d1.getFullYear() === d2.getFullYear()
    && d1.getMonth() === d2.getMonth()
    && d1.getDate() === d2.getDate();
}

export function getWeekDays(date: Date): Date[] {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export function formatWeekRange(date: Date) {
  const days = getWeekDays(date);
  const s = days[0];
  const e = days[6];
  return `${MONTH_SHORT[s.getMonth()]} ${String(s.getDate()).padStart(2, "0")} - ${MONTH_SHORT[e.getMonth()]} ${String(e.getDate()).padStart(2, "0")}, ${e.getFullYear()}`;
}

export function formatDayTitle(date: Date) {
  return `${MONTH_NAMES[date.getMonth()]} ${String(date.getDate()).padStart(2, "0")}, ${date.getFullYear()}`;
}

export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function shiftDateToKey(shiftDate: string | null | undefined): string | null {
  if (!shiftDate) return null;
  return shiftDate.slice(0, 10);
}

export function jobToSlotIdx(job: CalendarJob): number {
  if (!job.planned_check_in) return -1;
  return parseInt(job.planned_check_in.split(":")[0], 10);
}

export function getStatusPill(job: CalendarJob): { text: string; icon: string; className: string } {
  if (job.check_out) {
    return { text: "Successful end", icon: "✓", className: "bg-green-50  text-green-700  border-green-200" };
  }
  if (job.check_in) {
    return { text: "Check-In Complete!", icon: "✓", className: "bg-green-50  text-green-700  border-green-200" };
  }
  if (job.shift_status === "CANCELLED") {
    return { text: "No show yet!", icon: "⚠", className: "bg-red-50    text-red-600    border-red-200" };
  }
  if (job.shift_status === "ACTIVE") {
    return { text: "Successful start", icon: "✓", className: "bg-green-50  text-green-700  border-green-200" };
  }
  if (job.shift_status === "UPCOMING") {
    return { text: "Starts in few min.", icon: "⏱", className: "bg-orange-50 text-orange-500 border-orange-200" };
  }
  return { text: "Starts in few min.", icon: "⏱", className: "bg-orange-50 text-orange-500 border-orange-200" };
}

export function buildMonthCells(year: number, month: number): CalendarCell[] {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const daysInPrev = getDaysInMonth(year, month - 1);
  const trailingDays = (7 - ((firstDay + daysInMonth) % 7)) % 7;

  return [
    ...Array(firstDay).fill(null).map((_, i) => ({ day: daysInPrev - firstDay + i + 1, type: "prev" as const })),
    ...Array.from({ length: daysInMonth }, (_, i) => ({ day: i + 1, type: "current" as const })),
    ...Array.from({ length: trailingDays }, (_, i) => ({ day: i + 1, type: "next" as const })),
  ];
}

export function buildStatusCountMap(jobs: CalendarJob[]): Map<string, StatusCount> {
  const byDayStatus = new Map<string, StatusCount>();
  for (const job of jobs) {
    const key = shiftDateToKey(job.shift_date);
    if (!key) continue;
    const status = job.shift_status as ShiftStatus;
    const current = byDayStatus.get(key) ?? { ACTIVE: 0, UPCOMING: 0, COMPLETED: 0, CANCELLED: 0 };
    if (status in current) {
      current[status] += 1;
      byDayStatus.set(key, current);
    }
  }
  return byDayStatus;
}
