"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useJobsCalendar } from "@/hooks/useRecruiterData";
import type { CalendarJob } from "@/Interface/recruiter.types";
import {
  CalendarView,
  DayEventCard,
  formatDayTitle,
  formatWeekRange,
  getDaysInMonth,
  getFirstDayOfMonth,
  getWeekDays,
  isSameDate,
  jobToSlotIdx,
  MONTH_NAMES,
  MONTH_SHORT,
  MonthBadge,
  OverviewPanel,
  TIMESLOTS_24H,
  WEEKDAY_FULL,
} from "./components/calendar-shared";

function CalendarDayView({ currentDate, jobs }: { currentDate: Date; jobs: CalendarJob[] }) {
  const now = new Date();
  const isToday = isSameDate(currentDate, now);
  const dayJobs = jobs.filter((job) => job.shift_date && isSameDate(new Date(job.shift_date), currentDate));

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="h-[640px] overflow-y-auto">
        {TIMESLOTS_24H.map((slot, slotIdx) => {
          const slotJobs = dayJobs.filter((job) => jobToSlotIdx(job) === slotIdx);
          const isCurrentHour = isToday && slotIdx === now.getHours();

          return (
            <div
              key={slotIdx}
              className={`flex border-b border-gray-100 last:border-b-0 relative ${isCurrentHour ? "bg-orange-50/30" : ""}`}
              style={{ minHeight: "80px" }}
            >
              <div className="w-[90px] flex-shrink-0 pt-3 pr-3 text-right">
                <span className={`text-[11px] font-medium ${isCurrentHour ? "text-[#F4781B] font-bold" : "text-gray-400"}`}>{slot}</span>
              </div>

              {isCurrentHour && (
                <div className="absolute left-[90px] right-0 top-0 h-[2px] bg-[#F4781B] z-10" />
              )}

              <div className="flex-1 border-l border-gray-100 py-2 px-3 flex flex-row flex-wrap gap-2 content-start">
                {slotJobs.map((job) => <DayEventCard key={job.assignment_id} job={job} />)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CalendarWeekView({ currentDate, jobs }: { currentDate: Date; jobs: CalendarJob[] }) {
  const weekDays = getWeekDays(currentDate);
  const today = new Date();

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <div className="min-w-[860px]">
          <div className="grid border-b border-gray-200" style={{ gridTemplateColumns: "72px repeat(7, 1fr)" }}>
            <div className="border-r border-gray-100" />
            {weekDays.map((day, index) => {
              const isToday = isSameDate(day, today);
              return (
                <div key={index} className={`py-3 text-center border-r border-gray-100 last:border-r-0 ${isToday ? "border-t-2 border-t-[#F4781B]" : ""}`}>
                  <div className="text-[11px] text-gray-400 font-medium">{WEEKDAY_FULL[day.getDay()]}</div>
                  <div className={`text-[18px] font-bold mt-0.5 ${isToday ? "text-[#F4781B]" : "text-gray-700"}`}>{day.getDate()}</div>
                </div>
              );
            })}
          </div>

          <div className="grid" style={{ gridTemplateColumns: "72px repeat(7, 1fr)" }}>
            <div className="border-r border-gray-100" />
            {weekDays.map((day, dayIndex) => {
              const isToday = isSameDate(day, today);
              const dayJobs = jobs.filter((job) => job.shift_date && isSameDate(new Date(job.shift_date), day));

              const activeCount = dayJobs.filter((job) => job.shift_status === "ACTIVE").length;
              const upcomingCount = dayJobs.filter((job) => job.shift_status === "UPCOMING").length;
              const completedCount = dayJobs.filter((job) => job.shift_status === "COMPLETED").length;
              const noshowCount = dayJobs.filter((job) => job.shift_status === "CANCELLED").length;

              return (
                <div key={dayIndex} className={`p-3 border-r border-gray-100 last:border-r-0 min-h-[120px] ${isToday ? "bg-orange-50/20" : ""}`}>
                  <div className="space-y-1.5">
                    {activeCount > 0 && <MonthBadge count={activeCount} type="active" />}
                    {noshowCount > 0 && <MonthBadge count={noshowCount} type="noshow" />}
                    {upcomingCount > 0 && <MonthBadge count={upcomingCount} type="upcoming" />}
                    {completedCount > 0 && <MonthBadge count={completedCount} type="completed" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function CalendarMonthView({ currentDate, jobs }: { currentDate: Date; jobs: CalendarJob[] }) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const daysInPrev = getDaysInMonth(year, month - 1);
  const trailingDays = (7 - ((firstDay + daysInMonth) % 7)) % 7;

  const cells = [
    ...Array(firstDay).fill(null).map((_, index) => ({ day: daysInPrev - firstDay + index + 1, type: "prev" as const })),
    ...Array.from({ length: daysInMonth }, (_, index) => ({ day: index + 1, type: "current" as const })),
    ...Array.from({ length: trailingDays }, (_, index) => ({ day: index + 1, type: "next" as const })),
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex">
      <div className="flex items-center justify-center bg-gray-50 border-r border-gray-200 px-2">
        <span
          className="text-[11px] font-bold text-gray-400 tracking-[0.15em] uppercase whitespace-nowrap"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          {MONTH_NAMES[month]} {year}
        </span>
      </div>

      <div className="flex-1">
        <div className="grid grid-cols-7 border-b border-gray-200">
          {WEEKDAY_FULL.map((dayName) => (
            <div key={dayName} className="py-3 text-center text-[11px] font-semibold text-gray-500 border-r border-gray-100 last:border-r-0">
              {dayName}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {cells.map((item, idx) => {
            const isOther = item.type !== "current";
            const isToday = !isOther
              && item.day === today.getDate()
              && month === today.getMonth()
              && year === today.getFullYear();

            const cellJobs = isOther
              ? []
              : jobs.filter((job) => {
                  if (!job.shift_date) return false;
                  const date = new Date(job.shift_date);
                  return date.getFullYear() === year && date.getMonth() === month && date.getDate() === item.day;
                });

            const activeCount = cellJobs.filter((job) => job.shift_status === "ACTIVE").length;
            const upcomingCount = cellJobs.filter((job) => job.shift_status === "UPCOMING").length;
            const completedCount = cellJobs.filter((job) => job.shift_status === "COMPLETED").length;
            const noshowCount = cellJobs.filter((job) => job.shift_status === "CANCELLED").length;

            const dayLabel = item.type === "prev" && item.day === daysInPrev
              ? `${daysInPrev} ${MONTH_SHORT[month - 1 < 0 ? 11 : month - 1]}`
              : item.type === "next" && item.day === 1
                ? `1 ${MONTH_SHORT[(month + 1) % 12]}`
                : String(item.day);

            return (
              <div
                key={idx}
                className={`min-h-[110px] p-2.5 border-b border-r border-gray-100 last:border-r-0 transition-colors
                  ${isOther ? "bg-gray-50/60" : "hover:bg-gray-50/80 cursor-pointer"}
                  ${isToday ? "ring-2 ring-inset ring-[#F4781B]" : ""}
                `}
              >
                <div
                  className={`text-[12px] font-semibold mb-2 ${isOther
                    ? "text-gray-300"
                    : isToday
                      ? "text-[#F4781B]"
                      : "text-gray-700"}`}
                >
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

export default function CalendarPage() {
  const [view, setView] = useState<CalendarView>("day");
  const [currentDate, setCurrentDate] = useState(new Date());
  const { calendarJobs, isLoading } = useJobsCalendar();

  const navigate = (dir: "prev" | "next") => {
    const date = new Date(currentDate);
    if (view === "day") date.setDate(date.getDate() + (dir === "next" ? 1 : -1));
    if (view === "week") date.setDate(date.getDate() + (dir === "next" ? 7 : -7));
    if (view === "month") date.setMonth(date.getMonth() + (dir === "next" ? 1 : -1));
    setCurrentDate(date);
  };

  const calendarTitle = { day: "Daily Calendar", week: "Weekly Calendar", month: "Monthly Calendar" }[view];

  const calendarSubtitle = view === "month"
    ? ""
    : view === "week"
      ? formatWeekRange(currentDate)
      : formatDayTitle(currentDate);

  return (
    <div className="w-full min-h-screen bg-[#F9F8F6] px-6 py-6">
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-[20px] font-bold text-gray-900 mb-5">Schedule Overview</h1>

        <div className="flex gap-5 items-start">
          <div className="flex-1 min-w-0 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => navigate("prev")}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition border border-gray-200"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => navigate("next")}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition border border-gray-200"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[14px] font-bold text-gray-900">{calendarTitle}</span>
                  {calendarSubtitle && (
                    <span className="text-[14px] text-gray-400 font-medium">{calendarSubtitle}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {isLoading && (
                  <span className="text-[11px] text-gray-400 animate-pulse">Loading...</span>
                )}
                <div className="flex items-center bg-gray-100 rounded-lg p-0.5 gap-0.5">
                  {(["day", "week", "month"] as CalendarView[]).map((option) => (
                    <button
                      key={option}
                      onClick={() => setView(option)}
                      className={`px-4 py-1.5 rounded-md text-[13px] font-medium transition-all capitalize ${
                        view === option
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className={view === "day" ? "" : "p-0"}>
              {view === "day" && <CalendarDayView currentDate={currentDate} jobs={calendarJobs} />}
              {view === "week" && <CalendarWeekView currentDate={currentDate} jobs={calendarJobs} />}
              {view === "month" && <CalendarMonthView currentDate={currentDate} jobs={calendarJobs} />}
            </div>
          </div>

          <OverviewPanel jobs={calendarJobs} view={view} currentDate={currentDate} />
        </div>
      </div>
    </div>
  );
}