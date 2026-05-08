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
import type { CalendarJob, CalendarSummary } from "@/Interface/recruiter.types";
import {
  buildMonthCells,
  buildStatusCountMap,
  formatWeekRange,
  getStatusPill,
  isSameDate,
  jobToSlotIdx,
  MONTH_NAMES,
  MONTH_SHORT,
  TIMESLOTS_24H,
  toDateKey,
  shiftDateToKey,
  WEEKDAY_FULL,
} from "@/app/calendar/helpers";
import type { BadgeType, CalendarView } from "@/app/calendar/helpers";

function DayEventCard({ job }: { job: CalendarJob }) {
  const isUrgent = job.job_type?.toLowerCase().includes("urgent") || job.job_type?.toLowerCase() === "instant";
  const statusPill = getStatusPill(job);
  const accentColor = isUrgent ? "border-l-orange-400" : "border-l-green-500";

  return (
    <div className={`bg-white rounded-xl border border-gray-200 border-l-4 ${accentColor} p-2.5 shadow-sm w-[175px] flex-shrink-0`}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
          <span className={`w-1.5 h-1.5 rounded-full inline-block flex-shrink-0 ${isUrgent ? "bg-orange-400" : "bg-green-500"}`} />
          {job.job_id?.slice(0, 8) ?? job.assignment_id?.slice(0, 8)}
        </span>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
          isUrgent
            ? "bg-orange-50 text-orange-500 border-orange-200"
            : "bg-green-50  text-green-700  border-green-200"
        }`}>
          {isUrgent ? "Urgent" : "Regular"}
        </span>
      </div>

      <div className="text-[12px] font-bold text-gray-900 mb-1 leading-tight">
        {job.job_title}
      </div>

      <div className="text-[11px] text-gray-500 mb-0.5">
        Candidates: {job.candidate_name}
      </div>

      {job.planned_check_in && (
        <div className="text-[11px] text-gray-500 mb-2">
          Check-In by {job.planned_check_in.slice(0, 5)}
        </div>
      )}

      <div className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full border ${statusPill.className}`}>
        <span>{statusPill.icon}</span>
        {statusPill.text}
      </div>
    </div>
  );
}

function MonthBadge({ count, type }: { count: number; type: BadgeType }) {
  const configs: Record<BadgeType, { dot: string; pill: string; label: string }> = {
    active: { dot: "bg-green-500", pill: "bg-green-50  text-green-700  border-green-200", label: "Active" },
    noshow: { dot: "bg-red-500", pill: "bg-red-50    text-red-500    border-red-200", label: "No-Show!" },
    upcoming: { dot: "bg-yellow-400", pill: "bg-yellow-50 text-yellow-600 border-yellow-200", label: "Upcoming" },
    completed: { dot: "bg-orange-400", pill: "bg-orange-50 text-orange-500 border-orange-200", label: "Completed" },
  };
  const c = configs[type];
  return (
    <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-semibold w-fit ${c.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
      {String(count).padStart(2, "0")} {c.label}
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

export function CalendarDayView({ currentDate, jobs }: { currentDate: Date; jobs: CalendarJob[] }) {
  const now = new Date();
  const isToday = isSameDate(currentDate, now);
  const dayJobsBySlot = useMemo(() => {
    const selectedDateKey = toDateKey(currentDate);
    const bySlot = new Map<number, CalendarJob[]>();
    for (const job of jobs) {
      if (shiftDateToKey(job.shift_date) !== selectedDateKey) continue;
      const slot = jobToSlotIdx(job);
      if (slot < 0 || slot > 23) continue;
      const existing = bySlot.get(slot);
      if (existing) {
        existing.push(job);
      } else {
        bySlot.set(slot, [job]);
      }
    }
    return bySlot;
  }, [jobs, currentDate]);

  return (
    <div className="overflow-hidden">
      <div className="h-[640px] overflow-y-auto">
        {TIMESLOTS_24H.map((slot, slotIdx) => {
          const slotJobs = dayJobsBySlot.get(slotIdx) ?? [];
          const isCurrentHour = isToday && slotIdx === now.getHours();

          return (
            <div
              key={slotIdx}
              className={`flex border-b border-gray-100 last:border-b-0 relative ${isCurrentHour ? "bg-orange-50/20" : ""}`}
              style={{ minHeight: "84px" }}
            >
              <div className="w-[100px] flex-shrink-0 pt-3 pr-4 text-right border-r border-gray-100">
                <span className={`text-[11px] font-medium ${isCurrentHour ? "text-[#F4781B] font-bold" : "text-gray-400"}`}>
                  {slot}
                </span>
              </div>

              {isCurrentHour && (
                <div className="absolute left-[100px] right-0 top-0 h-[2px] bg-[#F4781B] z-10" />
              )}

              <div className="flex-1 py-2.5 px-3 flex flex-row flex-wrap gap-2.5 content-start">
                {slotJobs.map(job => (
                  <DayEventCard key={job.assignment_id} job={job} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
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
  const statusCountByDay = useMemo(() => buildStatusCountMap(jobs), [jobs]);

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

                const statusCounts = statusCountByDay.get(toDateKey(cellDate));
                const activeCount = statusCounts?.ACTIVE ?? 0;
                const upcomingCount = statusCounts?.UPCOMING ?? 0;
                const completedCount = statusCounts?.COMPLETED ?? 0;
                const noshowCount = statusCounts?.CANCELLED ?? 0;

                return (
                  <div
                    key={colIdx}
                    className={`min-h-[110px] p-2.5 border-b border-r border-gray-100 last:border-r-0
                      ${isOther ? "bg-gray-50/50" : "hover:bg-gray-50 cursor-pointer"}
                      ${isSelectedRow ? "bg-orange-50/20" : ""}
                      ${isToday && !isSelectedRow ? "bg-orange-50/10" : ""}
                    `}
                    onClick={() => onDateSelect(cellDate)}
                  >
                    <div className={`text-[12px] font-semibold mb-2 ${
                      isOther ? "text-gray-300"
                        : isToday ? "text-[#F4781B]"
                          : "text-gray-600"
                    }`}>
                      {dayLabel}
                    </div>
                    {!isOther && (
                      <div className="space-y-1">
                        {activeCount > 0 && <MonthBadge count={activeCount} type="active" />}
                        {noshowCount > 0 && <MonthBadge count={noshowCount} type="noshow" />}
                        {upcomingCount > 0 && <MonthBadge count={upcomingCount} type="upcoming" />}
                        {completedCount > 0 && <MonthBadge count={completedCount} type="completed" />}
                      </div>
                    )}
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
  const statusCountByDay = useMemo(() => buildStatusCountMap(jobs), [jobs]);

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

            const statusCounts = statusCountByDay.get(toDateKey(cellDate));
            const activeCount = statusCounts?.ACTIVE ?? 0;
            const upcomingCount = statusCounts?.UPCOMING ?? 0;
            const completedCount = statusCounts?.COMPLETED ?? 0;
            const noshowCount = statusCounts?.CANCELLED ?? 0;

            return (
              <div
                key={idx}
                className={`min-h-[110px] p-2.5 border-b border-r border-gray-100 last:border-r-0
                  ${isOther ? "bg-gray-50/50" : "hover:bg-gray-50 cursor-pointer"}
                  ${isToday ? "ring-2 ring-inset ring-[#F4781B]" : ""}
                `}
                onClick={() => onDateSelect(cellDate)}
              >
                <div className={`text-[12px] font-semibold mb-2 ${
                  isOther ? "text-gray-300"
                    : isToday ? "text-[#F4781B]"
                      : "text-gray-600"
                }`}>
                  {dayLabel}
                </div>
                {!isOther && (
                  <div className="space-y-1">
                    {activeCount > 0 && <MonthBadge count={activeCount} type="active" />}
                    {noshowCount > 0 && <MonthBadge count={noshowCount} type="noshow" />}
                    {upcomingCount > 0 && <MonthBadge count={upcomingCount} type="upcoming" />}
                    {completedCount > 0 && <MonthBadge count={completedCount} type="completed" />}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
