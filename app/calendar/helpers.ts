import type { CalendarJob } from "@/types";
import { resolveShiftCountdown } from "@/utils/shift-countdown";

export type CalendarView = "day" | "week" | "month";
export type BadgeType = "active" | "noshow" | "upcoming" | "completed";
type ShiftStatus = CalendarJob["shift_status"];

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

export function formatMonthTitle(date: Date) {
  return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

/** Shift calendar focus by ±1 month, landing on the 1st. */
export function shiftCalendarMonth(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

/** Shift calendar focus by ±1 day. */
export function shiftCalendarDay(date: Date, delta: number): Date {
  const next = new Date(date);
  next.setDate(date.getDate() + delta);
  return next;
}

export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/** Inclusive calendar-month window (1st–last day). Always ≤ 31 days. */
export function getMonthDateWindow(date: Date): { start_date: string; end_date: string } {
  const year = date.getFullYear();
  const month = date.getMonth();
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  return { start_date: toDateKey(start), end_date: toDateKey(end) };
}

export function shiftDateToKey(shiftDate: string | null | undefined): string | null {
  if (!shiftDate) return null;
  return shiftDate.slice(0, 10);
}

export function getStatusPill(
  job: CalendarJob,
  nowMs: number = Date.now(),
): { text: string; icon: string; className: string } {
  if (job.check_out) {
    return { text: "Successful end", icon: "✓", className: "bg-green-50  text-green-700  border-green-200" };
  }
  if (job.check_in) {
    return { text: "Check-In Complete!", icon: "✓", className: "bg-green-50  text-green-700  border-green-200" };
  }
  if (job.shift_status === "CANCELLED") {
    return { text: "No show yet!", icon: "⚠", className: "bg-red-50    text-red-600    border-red-200" };
  }

  const countdown = resolveShiftCountdown(
    job.planned_check_in_at,
    job.planned_check_out_at,
    nowMs,
  );

  if (countdown.phase === "active" && countdown.text) {
    return {
      text: countdown.text,
      icon: "⏱",
      className: "bg-green-50 text-green-700 border-green-200",
    };
  }

  if (countdown.phase === "upcoming" && countdown.text) {
    return {
      text: countdown.text,
      icon: "⏱",
      className: "bg-orange-50 text-orange-500 border-orange-200",
    };
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

export function buildJobsByDay(jobs: CalendarJob[]): Map<string, CalendarJob[]> {
  const byDay = new Map<string, CalendarJob[]>();
  for (const job of jobs) {
    const key = shiftDateToKey(job.shift_date);
    if (!key) continue;
    const list = byDay.get(key);
    if (list) list.push(job);
    else byDay.set(key, [job]);
  }
  for (const list of byDay.values()) {
    list.sort((a, b) => (a.planned_check_in ?? "").localeCompare(b.planned_check_in ?? ""));
  }
  return byDay;
}

export function getCandidateInitials(name: string | null | undefined): string {
  if (!name?.trim()) return "?";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] ?? "" : "";
  return `${first}${last}`.toUpperCase() || "?";
}

export function getCalendarProfileImage(job: CalendarJob): string | null {
  return job.profile_image_url ?? null;
}

export function formatShiftClock(time: string | null | undefined): string | null {
  if (!time) return null;
  return time.slice(0, 5);
}

/** Parse `HH:mm` / `HH:mm:ss` to minutes from midnight. */
export function parseClockToMinutes(time: string | null | undefined): number | null {
  if (!time) return null;
  const [h, m] = time.split(":").map((n) => parseInt(n, 10));
  if (!Number.isFinite(h) || h < 0 || h > 23) return null;
  const mins = Number.isFinite(m) ? m : 0;
  return h * 60 + Math.min(Math.max(mins, 0), 59);
}

export type DayShiftLayout = {
  job: CalendarJob;
  startMin: number;
  endMin: number;
  column: number;
  columnCount: number;
};

const DEFAULT_SHIFT_DURATION_MIN = 60;

/** Full day is always 12:00 AM → 12:00 AM (24 hours). */
export const DAY_TIMELINE_HOURS = 24;

export type DayHourScale = {
  /** Pixel height for each hour 0..23 */
  heights: number[];
  /** Cumulative Y offset at the start of each hour (length 25; last = total) */
  offsets: number[];
  totalHeight: number;
};

function shiftBounds(job: CalendarJob): { startMin: number; endMin: number } | null {
  const start = parseClockToMinutes(job.planned_check_in);
  if (start == null) return null;
  let end = parseClockToMinutes(job.planned_check_out ?? null);
  if (end == null || end <= start) end = Math.min(start + DEFAULT_SHIFT_DURATION_MIN, 24 * 60);
  return { startMin: start, endMin: end };
}

/** Hours that contain any part of a shift [start, end). */
function hourCoveredByShift(hour: number, jobs: CalendarJob[]): boolean {
  const slotStart = hour * 60;
  const slotEnd = slotStart + 60;
  for (const job of jobs) {
    const bounds = shiftBounds(job);
    if (!bounds) continue;
    if (bounds.startMin < slotEnd && bounds.endMin > slotStart) return true;
  }
  return false;
}

/** Hours that should keep a visible tick (shift start or end label). */
function hourIsShiftBoundary(hour: number, jobs: CalendarJob[]): boolean {
  const tick = hour * 60;
  for (const job of jobs) {
    const bounds = shiftBounds(job);
    if (!bounds) continue;
    if (Math.floor(bounds.startMin / 60) === hour) return true;
    // End at 19:00 → keep 7 PM row so the card bottom lines up with that label
    if (Math.floor(bounds.endMin / 60) === hour && bounds.endMin > 0) return true;
    if (bounds.startMin === tick || bounds.endMin === tick) return true;
  }
  return false;
}

/**
 * Build a 12 AM–12 AM scale with **even hour rows** so day view height
 * stays stable whether empty or filled with shifts.
 */
export function buildDayHourScale(
  jobs: CalendarJob[],
  opts?: {
    targetPx?: number;
    /** @deprecated Kept for call-site compat; even scale ignores compression knobs. */
    emptyPx?: number;
    boundaryPx?: number;
    activeMinPx?: number;
    activeMaxPx?: number;
  },
): DayHourScale {
  void jobs;
  const targetPx = opts?.targetPx ?? 580;

  const evenPx = Math.max(1, Math.floor(targetPx / DAY_TIMELINE_HOURS));
  const heights = Array.from({ length: DAY_TIMELINE_HOURS }, () => evenPx);
  let rem = targetPx - evenPx * DAY_TIMELINE_HOURS;
  for (let i = 0; rem > 0; i++, rem--) heights[i] += 1;

  const offsets: number[] = [0];
  for (let i = 0; i < heights.length; i++) {
    offsets.push(offsets[i] + heights[i]);
  }

  return { heights, offsets, totalHeight: offsets[DAY_TIMELINE_HOURS] };
}

/** Map minutes-from-midnight onto the compressed day scale. */
export function minutesToDayY(minutes: number, scale: DayHourScale): number {
  const clamped = Math.min(Math.max(minutes, 0), 24 * 60);
  if (clamped >= 24 * 60) return scale.totalHeight;
  const hour = Math.min(23, Math.floor(clamped / 60));
  const frac = (clamped - hour * 60) / 60;
  // Exact hour boundary (e.g. 19:00) sits on the hour's top edge / previous hour's bottom
  if (frac === 0) return scale.offsets[hour];
  return scale.offsets[hour] + frac * scale.heights[hour];
}

/** Pack overlapping shifts into columns for side-by-side layout. */
export function layoutDayShifts(jobs: CalendarJob[]): DayShiftLayout[] {
  const items: Array<{ job: CalendarJob; startMin: number; endMin: number }> = [];

  for (const job of jobs) {
    const bounds = shiftBounds(job);
    if (!bounds) continue;
    items.push({ job, ...bounds });
  }

  items.sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin);

  const columnEnds: number[] = [];
  const placed: DayShiftLayout[] = items.map((item) => {
    let col = columnEnds.findIndex((end) => end <= item.startMin);
    if (col === -1) {
      col = columnEnds.length;
      columnEnds.push(item.endMin);
    } else {
      columnEnds[col] = item.endMin;
    }
    return { ...item, column: col, columnCount: 1 };
  });

  for (const item of placed) {
    let maxCol = item.column;
    for (const other of placed) {
      if (other === item) continue;
      if (other.startMin < item.endMin && other.endMin > item.startMin) {
        maxCol = Math.max(maxCol, other.column);
      }
    }
    item.columnCount = maxCol + 1;
  }

  return placed;
}

export function shiftStatusBadgeType(status: ShiftStatus): BadgeType {
  switch (status) {
    case "ACTIVE":
      return "active";
    case "CANCELLED":
      return "noshow";
    case "COMPLETED":
      return "completed";
    default:
      return "upcoming";
  }
}
