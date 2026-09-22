"use client";

import React, { useMemo } from "react";
import {
  Clock,
  PersonStanding,
  BriefcaseBusiness,
  Timer,
  LogOut,
  TriangleAlert,
} from "lucide-react";
import type { CalendarJob, CalendarSummary } from "@/types";
import {
  buildDayHourScale,
  buildJobsByDay,
  DAY_TIMELINE_HOURS,
  formatShiftClock,
  formatWeekRange,
  getCalendarProfileImage,
  getCandidateInitials,
  getStatusPill,
  isSameDate,
  layoutDayShifts,
  minutesToDayY,
  MONTH_NAMES,
  MONTH_SHORT,
  shiftStatusBadgeType,
  TIMESLOTS_24H,
  toDateKey,
  shiftDateToKey,
  WEEKDAY_FULL,
  buildMonthCells,
} from "@/app/calendar/helpers";
import type { BadgeType, CalendarView, DayHourScale, DayShiftLayout } from "@/app/calendar/helpers";
import { useNow } from "@/hooks/useNow";
import { getBackendImageUrl } from "@/stores/api/api-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const AVATAR_FALLBACK_COLORS = [
  "bg-orange-100 text-orange-700",
  "bg-sky-100 text-sky-700",
  "bg-emerald-100 text-emerald-700",
  "bg-violet-100 text-violet-700",
  "bg-rose-100 text-rose-700",
];

const STATUS_CHIP: Record<BadgeType, { bar: string; pill: string; label: string }> = {
  active: { bar: "bg-green-500", pill: "bg-green-50 text-green-700 border-green-200", label: "Active" },
  noshow: { bar: "bg-red-500", pill: "bg-red-50 text-red-600 border-red-200", label: "No-Show" },
  upcoming: { bar: "bg-yellow-400", pill: "bg-yellow-50 text-yellow-700 border-yellow-200", label: "Upcoming" },
  completed: { bar: "bg-orange-400", pill: "bg-orange-50 text-orange-600 border-orange-200", label: "Done" },
};

function avatarFallbackClass(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash + seed.charCodeAt(i)) % AVATAR_FALLBACK_COLORS.length;
  return AVATAR_FALLBACK_COLORS[hash] ?? AVATAR_FALLBACK_COLORS[0];
}

function CandidateAvatar({
  job,
  size = "sm",
}: {
  job: CalendarJob;
  size?: "sm" | "md";
}) {
  const raw = getCalendarProfileImage(job);
  const src = raw ? getBackendImageUrl(raw) || undefined : undefined;
  const initials = getCandidateInitials(job.candidate_name);
  const sizeCls = size === "md" ? "size-8 text-[11px]" : "size-5 text-[8px]";

  return (
    <Avatar className={cn(sizeCls, "shrink-0")}>
      {src ? <AvatarImage src={src} alt={job.candidate_name} className="object-cover" /> : null}
      <AvatarFallback
        className={cn(
          "font-bold",
          size === "md" ? "text-[11px]" : "text-[8px]",
          avatarFallbackClass(job.candidate_id || job.candidate_name || "x"),
        )}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

/** Compact shift row for month/week cells — avatar, name, role, time, status. */
function CellShiftChip({ job }: { job: CalendarJob }) {
  const badge = shiftStatusBadgeType(job.shift_status);
  const style = STATUS_CHIP[badge];
  const checkIn = formatShiftClock(job.planned_check_in);

  return (
    <div
      className={cn(
        "flex items-start gap-1.5 rounded-md border px-1.5 py-1 w-full min-w-0",
        style.pill,
      )}
      title={`${job.candidate_name} · ${job.job_title}${checkIn ? ` · ${checkIn}` : ""}`}
    >
      <span className={cn("mt-1.5 w-1 h-1 rounded-full shrink-0", style.bar)} />
      <CandidateAvatar job={job} size="sm" />
      <div className="min-w-0 flex-1 leading-tight">
        <div className="truncate text-[10px] font-semibold text-gray-900">
          {job.candidate_name || "Candidate"}
        </div>
        <div className="truncate text-[9px] text-gray-500">
          {job.job_title || "Shift"}
          {checkIn ? ` · ${checkIn}` : ""}
        </div>
      </div>
    </div>
  );
}

const MAX_CELL_SHIFTS = 2;

function DayShiftList({ jobs }: { jobs: CalendarJob[] }) {
  if (jobs.length === 0) return null;
  const visible = jobs.slice(0, MAX_CELL_SHIFTS);
  const overflow = jobs.length - visible.length;

  return (
    <div className="space-y-1">
      {visible.map((job) => (
        <CellShiftChip key={job.assignment_id} job={job} />
      ))}
      {overflow > 0 && (
        <div className="text-[9px] font-semibold text-gray-400 pl-1">
          +{overflow} more
        </div>
      )}
    </div>
  );
}

function DayEventCard({
  job,
  nowMs,
  compact,
}: {
  job: CalendarJob;
  nowMs: number;
  compact?: boolean;
}) {
  const isUrgent =
    job.job_type?.toLowerCase().includes("urgent") ||
    job.job_type?.toLowerCase() === "instant";
  const statusPill = getStatusPill(job, nowMs);
  const shiftBadge = shiftStatusBadgeType(job.shift_status);
  const shiftStyle = STATUS_CHIP[shiftBadge];
  const checkIn = formatShiftClock(job.planned_check_in);
  const checkOut = formatShiftClock(job.planned_check_out);

  const shiftAccent =
    shiftBadge === "active"
      ? "bg-emerald-500"
      : shiftBadge === "upcoming"
        ? "bg-amber-400"
        : shiftBadge === "completed"
          ? "bg-orange-400"
          : "bg-red-500";

  return (
    <div
      className={cn(
        "relative h-full min-h-0 overflow-hidden rounded-2xl border shadow-[0_8px_24px_-12px_rgba(15,23,42,0.18)]",
        shiftBadge === "upcoming"
          ? "border-amber-200/80 bg-gradient-to-b from-amber-50 via-white to-amber-50/30"
          : shiftBadge === "active"
            ? "border-emerald-200/80 bg-gradient-to-b from-emerald-50 via-white to-emerald-50/30"
            : shiftBadge === "completed"
              ? "border-orange-200/80 bg-gradient-to-b from-orange-50 via-white to-orange-50/30"
              : "border-red-200/80 bg-gradient-to-b from-red-50 via-white to-red-50/30",
      )}
    >
      <div
        className={cn(
          "absolute inset-y-1.5 left-1.5 w-1 rounded-full",
          shiftAccent,
        )}
      />

      <div
        className={cn(
          "relative flex h-full min-h-0 flex-col pl-4",
          compact ? "gap-1.5 p-2 pr-2.5" : "gap-2 p-3 pr-3",
        )}
      >
        <div className="flex items-start justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="rounded-full ring-2 ring-white shadow-sm">
              <CandidateAvatar job={job} size={compact ? "sm" : "md"} />
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-semibold text-slate-900 truncate leading-tight tracking-tight">
                {job.candidate_name || "Candidate"}
              </div>
              <div className="text-[11px] text-slate-500 truncate mt-0.5">
                {job.job_title || "Shift"}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span
              className={cn(
                "inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full border",
                shiftStyle.pill,
              )}
            >
              <span className={cn("size-1.5 rounded-full", shiftStyle.bar)} />
              {shiftStyle.label === "Done" ? "Completed" : shiftStyle.label}
            </span>
            <span
              className={cn(
                "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                isUrgent
                  ? "bg-orange-100 text-[#F4781B]"
                  : "bg-slate-100 text-slate-600",
              )}
            >
              {isUrgent ? "Urgent" : "Regular"}
            </span>
          </div>
        </div>

        {(checkIn || checkOut) && (
          <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-600 shrink-0">
            <Clock className="size-3 text-slate-400" />
            <span>
              {checkIn ?? "—"}
              {checkOut ? ` – ${checkOut}` : ""}
            </span>
          </div>
        )}

        <div className="mt-auto pt-1">
          <div
            className={cn(
              "inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full border backdrop-blur-sm",
              statusPill.className,
            )}
          >
            <Timer className="size-3 opacity-80" />
            {statusPill.text}
          </div>
        </div>
      </div>
    </div>
  );
}

export function OverviewPanel({ jobs, summary, view, currentDate }: {
  jobs: CalendarJob[];
  summary: CalendarSummary | null;
  view: CalendarView;
  currentDate: Date;
}) {
  const active = summary?.active_shift ?? jobs.filter(j => j.shift_status === "ACTIVE").length;
  const upcoming = summary?.upcoming_shift ?? jobs.filter(j => j.shift_status === "UPCOMING").length;
  const completed = summary?.complete_shift ?? jobs.filter(j => j.shift_status === "COMPLETED").length;
  const noshow = summary?.no_show_missed ?? jobs.filter(j => j.shift_status === "CANCELLED").length;
  const pending = summary?.pending_checkin ?? jobs.filter(j => !j.check_in).length;
  const early = summary?.early_checkout ?? 0;

  const titles = { day: "Today's Overview", week: "Weekly Overview", month: "Monthly Overview" };
  const subtitles = {
    day: `${MONTH_NAMES[currentDate.getMonth()]} ${String(currentDate.getDate()).padStart(2, "0")}, ${currentDate.getFullYear()}`,
    week: formatWeekRange(currentDate),
    month: `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`,
  };

  const stats = [
    { icon: <Clock className="w-[22px] h-[22px] text-[#F4781B]" />, count: active, label: "Active Shifts & Jobs", red: false },
    { icon: <PersonStanding className="w-[22px] h-[22px] text-[#F4781B]" />, count: upcoming, label: "Upcoming Shifts & Jobs", red: false },
    { icon: <BriefcaseBusiness className="w-[22px] h-[22px] text-[#F4781B]" />, count: completed, label: "Completed Shifts & Jobs", red: false },
    { icon: <Timer className="w-[22px] h-[22px] text-[#F4781B]" />, count: pending, label: "Pending Check-Ins", red: false },
    { icon: <LogOut className="w-[22px] h-[22px] text-[#F4781B]" />, count: early, label: "Early Checkouts", red: false },
    { icon: <TriangleAlert className="w-[22px] h-[22px] text-red-500" />, count: noshow, label: "No-Shows", red: true },
  ];

  return (
    <div className="w-full lg:w-[260px] lg:flex-shrink-0 lg:self-start lg:sticky lg:top-6">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-4 sm:px-5 py-4 text-center mb-3">
        <h3 className="text-[14px] sm:text-[15px] font-bold text-gray-900">{titles[view]}</h3>
        <p className="text-[11px] sm:text-[12px] text-gray-400 mt-1">{subtitles[view]}</p>
      </div>

      <div className="flex lg:flex-col gap-3 overflow-x-auto pb-1 lg:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {stats.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-200 shadow-sm px-4 py-3 flex items-center gap-3 flex-shrink-0 min-w-[160px] lg:min-w-0 lg:w-full">
            <div className="flex-shrink-0">{s.icon}</div>
            <div>
              <div className={`text-[22px] sm:text-[26px] font-bold leading-none tracking-tight ${s.red ? "text-red-500" : "text-gray-900"}`}>
                {String(s.count).padStart(2, "0")}
              </div>
              <div className={`text-[10px] sm:text-[11px] mt-0.5 leading-tight ${s.red ? "text-red-400" : "text-gray-400"}`}>
                {s.label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const DAY_TIMELINE_TARGET_PX = 580;
const TIME_GUTTER_PX = 76;
/** Space above/below so 12 AM / end labels are not clipped. */
const DAY_LABEL_PAD_PX = 12;

export function CalendarDayView({ currentDate, jobs }: { currentDate: Date; jobs: CalendarJob[] }) {
  const hasLiveCountdown = useMemo(
    () => jobs.some((job) => job.planned_check_in_at || job.planned_check_out_at),
    [jobs],
  );
  const nowMs = useNow(hasLiveCountdown);
  const now = new Date(nowMs);
  const isToday = isSameDate(currentDate, now);

  const dayJobs = useMemo(() => {
    const selectedDateKey = toDateKey(currentDate);
    return jobs.filter((job) => shiftDateToKey(job.shift_date) === selectedDateKey);
  }, [jobs, currentDate]);

  const scale = useMemo(
    () => buildDayHourScale(dayJobs, { targetPx: DAY_TIMELINE_TARGET_PX }),
    [dayJobs],
  );

  const layouts = useMemo(() => layoutDayShifts(dayJobs), [dayJobs]);

  const nowTop = isToday
    ? DAY_LABEL_PAD_PX + minutesToDayY(now.getHours() * 60 + now.getMinutes(), scale)
    : null;

  const hours = Array.from({ length: DAY_TIMELINE_HOURS }, (_, h) => h);

  return (
    <div className="overflow-hidden bg-[#F8FAFC]">
      <div
        className="relative flex"
        style={{ height: scale.totalHeight + DAY_LABEL_PAD_PX * 2 }}
      >
        <div
          className="shrink-0 relative z-10 bg-[#F8FAFC]"
          style={{ width: TIME_GUTTER_PX, paddingTop: DAY_LABEL_PAD_PX }}
        >
          {hours.map((hour) => {
            const isCurrentHour = isToday && hour === now.getHours();
            return (
              <div
                key={hour}
                className="relative"
                style={{ height: scale.heights[hour] }}
              >
                <span
                  className={cn(
                    "absolute right-3 -top-2 text-[10px] font-medium tabular-nums whitespace-nowrap",
                    isCurrentHour
                      ? "text-[#F4781B] font-semibold"
                      : "text-slate-500",
                  )}
                >
                  {TIMESLOTS_24H[hour]}
                </span>
              </div>
            );
          })}
        </div>

        <div
          className="relative flex-1 min-w-0 mr-3 ml-1 rounded-2xl bg-white border border-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] overflow-hidden"
          style={{ marginTop: DAY_LABEL_PAD_PX, height: scale.totalHeight }}
        >
          {hours.map((hour) => {
            const isCurrentHour = isToday && hour === now.getHours();
            return (
              <div
                key={hour}
                className={cn(
                  "border-b border-slate-100",
                  isCurrentHour && "bg-orange-50/40",
                )}
                style={{ height: scale.heights[hour] }}
              />
            );
          })}

          {nowTop != null && (
            <div
              className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
              style={{ top: nowTop - DAY_LABEL_PAD_PX }}
            >
              <span className="size-2.5 -ml-1 rounded-full bg-[#F4781B] shadow-[0_0_0_3px_rgba(244,120,27,0.2)]" />
              <div className="flex-1 h-px bg-[#F4781B]" />
            </div>
          )}

          {layouts.map((layout) => (
            <DayTimelineEvent
              key={layout.job.assignment_id}
              layout={layout}
              scale={scale}
              nowMs={nowMs}
            />
          ))}

          {dayJobs.length === 0 && (
            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none px-6">
              <div className="w-full max-w-[320px] rounded-2xl border border-dashed border-slate-200 bg-white/90 backdrop-blur-sm px-6 py-8 text-center shadow-sm">
                <p className="text-[15px] font-semibold text-slate-700">No shifts today</p>
                <p className="text-[12px] text-slate-400 mt-1.5 leading-relaxed">
                  Scheduled shifts will appear on this timeline
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DayTimelineEvent({
  layout,
  scale,
  nowMs,
}: {
  layout: DayShiftLayout;
  scale: DayHourScale;
  nowMs: number;
}) {
  const top = minutesToDayY(layout.startMin, scale);
  const bottom = minutesToDayY(layout.endMin, scale);
  const height = Math.max(bottom - top, 56);
  const widthPct = 100 / layout.columnCount;
  const leftPct = layout.column * widthPct;
  const compact = height < 100;

  return (
    <div
      className="absolute z-10 box-border"
      style={{
        top,
        height,
        left: `calc(${leftPct}% + 8px)`,
        width: `calc(${widthPct}% - 16px)`,
      }}
    >
      <DayEventCard job={layout.job} nowMs={nowMs} compact={compact} />
    </div>
  );
}

export function CalendarWeekView({
  currentDate,
  jobs,
  onDateSelect,
}: {
  currentDate: Date;
  jobs: CalendarJob[];
  onDateSelect: (date: Date) => void;
}) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();
  const todayDay = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();

  const prevMonthIdx = month - 1 < 0 ? 11 : month - 1;
  const nextMonthIdx = (month + 1) % 12;

  const cells = useMemo(() => buildMonthCells(year, month), [year, month]);
  const jobsByDay = useMemo(() => buildJobsByDay(jobs), [jobs]);

  const selectedWeekRow = Math.floor(
    cells.findIndex(c => c.type === "current" && c.day === currentDate.getDate()) / 7,
  );

  const rows = Array.from({ length: Math.ceil(cells.length / 7) }, (_, i) =>
    cells.slice(i * 7, i * 7 + 7),
  );

  return (
    <div className="flex overflow-hidden">
      <div className="flex items-center justify-center bg-gray-50 border-r border-gray-200 px-3 py-6">
        <span
          className="text-[18px] font-bold text-black tracking-[0.18em] uppercase whitespace-nowrap select-none"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          {MONTH_NAMES[month]} {year}
        </span>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-7 border-b border-gray-200">
          {WEEKDAY_FULL.map(d => (
            <div key={d} className="py-3 text-center text-[11px] font-semibold text-gray-500 border-r border-gray-100 last:border-r-0">
              {d}
            </div>
          ))}
        </div>

        {rows.map((row, rowIdx) => {
          const isSelectedRow = rowIdx === selectedWeekRow;
          return (
            <div
              key={rowIdx}
              className={`grid grid-cols-7 relative ${isSelectedRow ? "ring-2 ring-[#F4781B] ring-inset z-10" : ""}`}
            >
              {row.map((item, colIdx) => {
                const isOther = item.type !== "current";
                const isToday = !isOther
                  && item.day === todayDay
                  && month === todayMonth
                  && year === todayYear;

                const dayLabel = item.type === "prev"
                  ? `${item.day} ${MONTH_SHORT[prevMonthIdx]}`
                  : item.type === "next"
                    ? `${item.day} ${MONTH_SHORT[nextMonthIdx]}`
                    : String(item.day);

                const cellDate = item.type === "prev"
                  ? new Date(year, month - 1, item.day)
                  : item.type === "next"
                    ? new Date(year, month + 1, item.day)
                    : new Date(year, month, item.day);

                const dayJobs = jobsByDay.get(toDateKey(cellDate)) ?? [];

                return (
                  <div
                    key={colIdx}
                    className={`min-h-[120px] p-2 border-b border-r border-gray-100 last:border-r-0
                      ${isOther ? "bg-gray-50/50" : "hover:bg-gray-50 cursor-pointer"}
                      ${isSelectedRow ? "bg-orange-50/20" : ""}
                      ${isToday && !isSelectedRow ? "bg-orange-50/10" : ""}
                    `}
                    onClick={() => onDateSelect(cellDate)}
                  >
                    <div className={`text-[12px] font-semibold mb-1.5 ${
                      isOther ? "text-gray-300"
                        : isToday ? "text-[#F4781B]"
                          : "text-gray-600"
                    }`}>
                      {dayLabel}
                    </div>
                    {!isOther && <DayShiftList jobs={dayJobs} />}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CalendarMonthView({
  currentDate,
  jobs,
  onDateSelect,
}: {
  currentDate: Date;
  jobs: CalendarJob[];
  onDateSelect: (date: Date) => void;
}) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();
  const todayDay = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();

  const prevMonthIdx = month - 1 < 0 ? 11 : month - 1;
  const nextMonthIdx = (month + 1) % 12;

  const cells = useMemo(() => buildMonthCells(year, month), [year, month]);
  const jobsByDay = useMemo(() => buildJobsByDay(jobs), [jobs]);

  return (
    <div className="flex overflow-hidden">
      <div className="flex items-center justify-center bg-gray-50 border-r border-gray-200 px-3 py-6">
        <span
          className="text-[18px] font-bold text-black tracking-[0.18em] uppercase whitespace-nowrap select-none"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          {MONTH_NAMES[month]} {year}
        </span>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-7 border-b border-gray-200">
          {WEEKDAY_FULL.map(d => (
            <div key={d} className="py-3 text-center text-[11px] font-semibold text-gray-500 border-r border-gray-100 last:border-r-0">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {cells.map((item, idx) => {
            const isOther = item.type !== "current";
            const isToday = !isOther
              && item.day === todayDay
              && month === todayMonth
              && year === todayYear;

            const dayLabel = item.type === "prev"
              ? `${item.day} ${MONTH_SHORT[prevMonthIdx]}`
              : item.type === "next"
                ? `${item.day} ${MONTH_SHORT[nextMonthIdx]}`
                : String(item.day);

            const cellDate = item.type === "prev"
              ? new Date(year, month - 1, item.day)
              : item.type === "next"
                ? new Date(year, month + 1, item.day)
                : new Date(year, month, item.day);

            const dayJobs = jobsByDay.get(toDateKey(cellDate)) ?? [];

            return (
              <div
                key={idx}
                className={`min-h-[120px] p-2 border-b border-r border-gray-100 last:border-r-0
                  ${isOther ? "bg-gray-50/50" : "hover:bg-gray-50 cursor-pointer"}
                  ${isToday ? "ring-2 ring-inset ring-[#F4781B]" : ""}
                `}
                onClick={() => onDateSelect(cellDate)}
              >
                <div className={`text-[12px] font-semibold mb-1.5 ${
                  isOther ? "text-gray-300"
                    : isToday ? "text-[#F4781B]"
                      : "text-gray-600"
                }`}>
                  {dayLabel}
                </div>
                {!isOther && <DayShiftList jobs={dayJobs} />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
