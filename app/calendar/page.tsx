"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Clock, PersonStanding, BriefcaseBusiness, Timer, LogOut, TriangleAlert } from "lucide-react";
import { useJobsCalendar } from "@/hooks/useRecruiterData";
import type { CalendarJob } from "@/Interface/recruiter.types";

type CalendarView = "day" | "week" | "month";

const WEEKDAY_FULL  = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MONTH_NAMES   = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTH_SHORT   = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// Full 24-hour slots
const TIMESLOTS_24H = [
  "12:00 AM","01:00 AM","02:00 AM","03:00 AM","04:00 AM","05:00 AM",
  "06:00 AM","07:00 AM","08:00 AM","09:00 AM","10:00 AM","11:00 AM",
  "12:00 PM","01:00 PM","02:00 PM","03:00 PM","04:00 PM","05:00 PM",
  "06:00 PM","07:00 PM","08:00 PM","09:00 PM","10:00 PM","11:00 PM",
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDayOfMonth(y: number, m: number) { return new Date(y, m, 1).getDay(); }

function isSameDate(d1: Date, d2: Date) {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth()    === d2.getMonth()    &&
         d1.getDate()     === d2.getDate();
}

function getWeekDays(date: Date): Date[] {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function formatWeekRange(date: Date) {
  const days = getWeekDays(date);
  const s = days[0], e = days[6];
  return `${MONTH_SHORT[s.getMonth()]} ${String(s.getDate()).padStart(2,"0")} - ${MONTH_SHORT[e.getMonth()]} ${String(e.getDate()).padStart(2,"0")}, ${e.getFullYear()}`;
}

function formatDayTitle(date: Date) {
  return `${MONTH_NAMES[date.getMonth()]} ${String(date.getDate()).padStart(2,"0")}, ${date.getFullYear()}`;
}

function jobToSlotIdx(job: CalendarJob): number {
  if (!job.planned_check_in) return -1;
  const [hStr] = job.planned_check_in.split(":");
  const h = parseInt(hStr, 10);
  return h; // 0–23 maps directly to TIMESLOTS_24H index
}

// ── Status logic ──────────────────────────────────────────────────────────────
type StatusType = "active" | "upcoming" | "completed" | "noshow";

// Status pill config — matches design exactly
function getStatusPill(job: CalendarJob) {
  const hasCheckedIn  = !!job.check_in;
  const hasCheckedOut = !!job.check_out;

  if (hasCheckedOut)
    return { text: "✓ Successful end",      className: "bg-green-50  text-green-700  border border-green-200"  };
  if (hasCheckedIn)
    return { text: "✓ Check-In Complete !",  className: "bg-green-50  text-green-700  border border-green-200"  };
  if (job.shift_status === "CANCELLED")
    return { text: "⚠ No show yet !",        className: "bg-red-50    text-red-600    border border-red-200"    };
  if (job.shift_status === "UPCOMING")
    return { text: "⏱ Starts in few min.",   className: "bg-orange-50 text-orange-600 border border-orange-200" };
  if (job.shift_status === "ACTIVE")
    return { text: "✓ Successful start",     className: "bg-green-50  text-green-700  border border-green-200"  };
  return   { text: "⏱ Starts in few min.",   className: "bg-orange-50 text-orange-600 border border-orange-200" };
}

// ── Day Event Card (pixel-matched to design) ───────────────────────────────────
function DayEventCard({ job }: { job: CalendarJob }) {
  const isUrgent   = job.job_type?.toLowerCase().includes("urgent");
  const statusPill = getStatusPill(job);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-2.5 shadow-sm min-w-[155px] max-w-[185px] flex-shrink-0">
      {/* Row 1: dot + job_id + type badge */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
          <span className={`w-1.5 h-1.5 rounded-full inline-block ${isUrgent ? "bg-orange-500" : "bg-green-500"}`} />
          {job.job_id}
        </span>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
          isUrgent
            ? "bg-orange-50 text-orange-600 border-orange-200"
            : "bg-green-50  text-green-700  border-green-200"
        }`}>
          {isUrgent ? "Urgent" : "Regular"}
        </span>
      </div>

      {/* Row 2: Job title */}
      <div className="text-[12px] font-bold text-gray-900 mb-1.5 leading-tight">
        {job.job_title}
      </div>

      {/* Row 3: Candidate name */}
      <div className="text-[11px] text-gray-500 mb-0.5">
        Candidates: {job.candidate_name}
      </div>

      {/* Row 4: Check-in time */}
      {job.planned_check_in && (
        <div className="text-[11px] text-gray-500 mb-2">
          Check-In by {job.planned_check_in.slice(0, 5)}
          {job.check_out ? " pm" : " am"}
        </div>
      )}

      {/* Status pill */}
      <div className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full ${statusPill.className}`}>
        {statusPill.text}
      </div>
    </div>
  );
}

// ── Month badge chips ─────────────────────────────────────────────────────────
function MonthBadge({ count, type }: { count: number; type: StatusType | "completed" }) {
  const configs = {
    active:    { dot: "bg-green-500",  pill: "bg-green-50  text-green-700  border-green-200",  label: "Active"    },
    noshow:    { dot: "bg-red-500",    pill: "bg-red-50    text-red-600    border-red-200",    label: "No-Show !" },
    upcoming:  { dot: "bg-yellow-500", pill: "bg-yellow-50 text-yellow-700 border-yellow-200", label: "Upcoming"  },
    completed: { dot: "bg-orange-400", pill: "bg-orange-50 text-orange-600 border-orange-200", label: "Completed" },
  };
  const c = configs[type];
  return (
    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold w-fit ${c.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {String(count).padStart(2,"0")} {c.label}
    </div>
  );
}

// ── Right Overview Panel ──────────────────────────────────────────────────────
function OverviewPanel({ jobs, view, currentDate }: { jobs: CalendarJob[]; view: CalendarView; currentDate: Date }) {
  const today = new Date();

  const relevantJobs = view === "day"
    ? jobs.filter(j => j.shift_date && isSameDate(new Date(j.shift_date), currentDate))
    : view === "week"
    ? (() => {
        const days = getWeekDays(currentDate);
        return jobs.filter(j => j.shift_date && days.some(d => isSameDate(new Date(j.shift_date!), d)));
      })()
    : jobs.filter(j => {
        if (!j.shift_date) return false;
        const d = new Date(j.shift_date);
        return d.getFullYear() === currentDate.getFullYear() && d.getMonth() === currentDate.getMonth();
      });

  const active    = relevantJobs.filter(j => j.shift_status === "ACTIVE").length;
  const upcoming  = relevantJobs.filter(j => j.shift_status === "UPCOMING").length;
  const completed = relevantJobs.filter(j => j.shift_status === "COMPLETED").length;
  const noshow    = relevantJobs.filter(j => j.shift_status === "CANCELLED").length;
  const pending   = relevantJobs.filter(j => j.shift_status === "UPCOMING" && !j.check_in).length;
  const early     = relevantJobs.filter(j => {
    if (!j.check_out || !j.planned_check_out) return false;
    return new Date(j.check_out) < new Date(`${j.shift_date}T${j.planned_check_out}`);
  }).length;

  const titles = { day: "Today's Overview", week: "Weekly Overview", month: "Monthly Overview" };
  const subtitles = {
    day:   `${MONTH_NAMES[today.getMonth()]} ${String(today.getDate()).padStart(2,"0")}, ${today.getFullYear()}`,
    week:  formatWeekRange(currentDate),
    month: `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`,
  };

  const stats = [
    { icon: <Clock        className="w-5 h-5 text-[#F4781B]" />, count: String(active).padStart(2,"0"),    label: "Active Shifts & Jobs",    red: false },
    { icon: <PersonStanding className="w-5 h-5 text-[#F4781B]" />, count: String(upcoming).padStart(2,"0"),  label: "Upcoming Shifts & Jobs",  red: false },
    { icon: <BriefcaseBusiness className="w-5 h-5 text-[#F4781B]" />, count: String(completed).padStart(2,"0"), label: "Completed Shifts & Jobs", red: false },
    { icon: <Timer        className="w-5 h-5 text-[#F4781B]" />, count: String(pending).padStart(2,"0"),   label: "Pending Check-Ins",       red: false },
    { icon: <LogOut       className="w-5 h-5 text-[#F4781B]" />, count: String(early).padStart(2,"0"),     label: "Early Checkouts",         red: false },
    { icon: <TriangleAlert className="w-5 h-5 text-red-500"  />, count: String(noshow).padStart(2,"0"),    label: "No-Shows",                red: true  },
  ];

  return (
    <div className="w-[260px] flex-shrink-0 bg-white rounded-2xl border border-gray-200 shadow-sm self-start sticky top-6">
      <div className="px-5 pt-5 pb-3 border-b border-gray-100">
        <h3 className="text-[15px] font-bold text-gray-900">{titles[view]}</h3>
        <p className="text-[12px] text-gray-400 mt-0.5">{subtitles[view]}</p>
      </div>
      <div className="px-5 divide-y divide-gray-100">
        {stats.map((s, i) => (
          <div key={i} className="flex items-center gap-3 py-4">
            {s.icon}
            <div>
              <div className={`text-[24px] font-bold leading-none ${s.red ? "text-red-500" : "text-gray-900"}`}>
                {s.count}
              </div>
              <div className={`text-[11px] mt-0.5 ${s.red ? "text-red-400" : "text-gray-400"}`}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Day View ──────────────────────────────────────────────────────────────────
function CalendarDayView({ currentDate, jobs }: { currentDate: Date; jobs: CalendarJob[] }) {
  const now     = new Date();
  const isToday = isSameDate(currentDate, now);
  const dayJobs = jobs.filter(j => j.shift_date && isSameDate(new Date(j.shift_date), currentDate));

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Scrollable 24h grid */}
      <div className="h-[640px] overflow-y-auto">
        {TIMESLOTS_24H.map((slot, slotIdx) => {
          const slotJobs      = dayJobs.filter(j => jobToSlotIdx(j) === slotIdx);
          const isCurrentHour = isToday && slotIdx === now.getHours();

          return (
            <div
              key={slotIdx}
              className={`flex border-b border-gray-100 last:border-b-0 relative ${
                isCurrentHour ? "bg-orange-50/30" : ""
              }`}
              style={{ minHeight: "80px" }}
            >
              {/* Time label — top-aligned */}
              <div className="w-[90px] flex-shrink-0 pt-3 pr-3 text-right">
                <span className={`text-[11px] font-medium ${isCurrentHour ? "text-[#F4781B] font-bold" : "text-gray-400"}`}>
                  {slot}
                </span>
              </div>

              {/* "Now" indicator line */}
              {isCurrentHour && (
                <div className="absolute left-[90px] right-0 top-0 h-[2px] bg-[#F4781B] z-10" />
              )}

              {/* Cards area */}
              <div className="flex-1 border-l border-gray-100 py-2 px-3 flex flex-row flex-wrap gap-2 content-start">
                {slotJobs.map(job => <DayEventCard key={job.assignment_id} job={job} />)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Week View ─────────────────────────────────────────────────────────────────
function CalendarWeekView({ currentDate, jobs }: { currentDate: Date; jobs: CalendarJob[] }) {
  const weekDays = getWeekDays(currentDate);
  const today    = new Date();

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <div className="min-w-[860px]">

          {/* Day header row */}
          <div className="grid border-b border-gray-200" style={{ gridTemplateColumns: "72px repeat(7, 1fr)" }}>
            <div className="border-r border-gray-100" />
            {weekDays.map((d, i) => {
              const isToday = isSameDate(d, today);
              return (
                <div key={i} className={`py-3 text-center border-r border-gray-100 last:border-r-0 ${isToday ? "border-t-2 border-t-[#F4781B]" : ""}`}>
                  <div className="text-[11px] text-gray-400 font-medium">{WEEKDAY_FULL[d.getDay()]}</div>
                  <div className={`text-[18px] font-bold mt-0.5 ${isToday ? "text-[#F4781B]" : "text-gray-700"}`}>
                    {d.getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Week body — no timeslots, just day columns with grouped badges */}
          <div className="grid" style={{ gridTemplateColumns: "72px repeat(7, 1fr)" }}>
            {/* Left empty column */}
            <div className="border-r border-gray-100" />
            {weekDays.map((d, di) => {
              const isToday = isSameDate(d, today);
              const dayJobs = jobs.filter(j => j.shift_date && isSameDate(new Date(j.shift_date), d));

              const activeCount    = dayJobs.filter(j => j.shift_status === "ACTIVE").length;
              const upcomingCount  = dayJobs.filter(j => j.shift_status === "UPCOMING").length;
              const completedCount = dayJobs.filter(j => j.shift_status === "COMPLETED").length;
              const noshowCount    = dayJobs.filter(j => j.shift_status === "CANCELLED").length;

              return (
                <div key={di} className={`p-3 border-r border-gray-100 last:border-r-0 min-h-[120px] ${isToday ? "bg-orange-50/20" : ""}`}>
                  <div className="space-y-1.5">
                    {activeCount    > 0 && <MonthBadge count={activeCount}    type="active"    />}
                    {noshowCount    > 0 && <MonthBadge count={noshowCount}    type="noshow"    />}
                    {upcomingCount  > 0 && <MonthBadge count={upcomingCount}  type="upcoming"  />}
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

// ── Month View ────────────────────────────────────────────────────────────────
function CalendarMonthView({ currentDate, jobs }: { currentDate: Date; jobs: CalendarJob[] }) {
  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();

  const daysInMonth  = getDaysInMonth(year, month);
  const firstDay     = getFirstDayOfMonth(year, month);
  const daysInPrev   = getDaysInMonth(year, month - 1);
  const trailingDays = (7 - ((firstDay + daysInMonth) % 7)) % 7;

  const cells = [
    ...Array(firstDay).fill(null).map((_, i) => ({ day: daysInPrev - firstDay + i + 1, type: "prev"    as const })),
    ...Array.from({ length: daysInMonth  }, (_, i) => ({ day: i + 1,   type: "current" as const })),
    ...Array.from({ length: trailingDays }, (_, i) => ({ day: i + 1,   type: "next"    as const })),
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex">

      {/* Rotated month label */}
      <div className="flex items-center justify-center bg-gray-50 border-r border-gray-200 px-2">
        <span
          className="text-[11px] font-bold text-gray-400 tracking-[0.15em] uppercase whitespace-nowrap"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          {MONTH_NAMES[month]} {year}
        </span>
      </div>

      <div className="flex-1">
        {/* Weekday header */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {WEEKDAY_FULL.map(d => (
            <div key={d} className="py-3 text-center text-[11px] font-semibold text-gray-500 border-r border-gray-100 last:border-r-0">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {cells.map((item, idx) => {
            const isOther = item.type !== "current";
            const isToday = !isOther &&
              item.day === today.getDate() &&
              month === today.getMonth() &&
              year  === today.getFullYear();

            const cellJobs = isOther ? [] : jobs.filter(j => {
              if (!j.shift_date) return false;
              const d = new Date(j.shift_date);
              return d.getFullYear() === year && d.getMonth() === month && d.getDate() === item.day;
            });

            const activeCount    = cellJobs.filter(j => j.shift_status === "ACTIVE").length;
            const upcomingCount  = cellJobs.filter(j => j.shift_status === "UPCOMING").length;
            const completedCount = cellJobs.filter(j => j.shift_status === "COMPLETED").length;
            const noshowCount    = cellJobs.filter(j => j.shift_status === "CANCELLED").length;

            // Trailing/leading label
            const dayLabel = item.type === "prev" && item.day === daysInPrev
              ? `${daysInPrev} ${MONTH_SHORT[month - 1 < 0 ? 11 : month - 1]}`
              : item.type === "next" && item.day === 1
              ? `1 ${MONTH_SHORT[(month + 1) % 12]}`
              : String(item.day);

            return (
              <div
                key={idx}
                className={`min-h-[110px] p-2.5 border-b border-r border-gray-100 last:border-r-0 transition-colors
                  ${isOther   ? "bg-gray-50/60" : "hover:bg-gray-50/80 cursor-pointer"}
                  ${isToday   ? "ring-2 ring-inset ring-[#F4781B]" : ""}
                `}
              >
                <div className={`text-[12px] font-semibold mb-2 ${
                  isOther ? "text-gray-300"
                  : isToday ? "text-[#F4781B]"
                  : "text-gray-700"
                }`}>
                  {dayLabel}
                </div>

                {!isOther && (
                  <div className="space-y-1">
                    {activeCount    > 0 && <MonthBadge count={activeCount}    type="active"    />}
                    {noshowCount    > 0 && <MonthBadge count={noshowCount}    type="noshow"    />}
                    {upcomingCount  > 0 && <MonthBadge count={upcomingCount}  type="upcoming"  />}
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

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CalendarPage() {
  const [view, setView]               = useState<CalendarView>("day");
  const [currentDate, setCurrentDate] = useState(new Date());
  const { calendarJobs, isLoading }   = useJobsCalendar();

  const navigate = (dir: "prev" | "next") => {
    const d = new Date(currentDate);
    if (view === "day")   d.setDate(d.getDate()   + (dir === "next" ? 1  : -1));
    if (view === "week")  d.setDate(d.getDate()   + (dir === "next" ? 7  : -7));
    if (view === "month") d.setMonth(d.getMonth() + (dir === "next" ? 1  : -1));
    setCurrentDate(d);
  };

  const calendarTitle = { day: "Daily Calendar", week: "Weekly Calendar", month: "Monthly Calendar" }[view];

  const calendarSubtitle = view === "month" ? ""
    : view === "week" ? formatWeekRange(currentDate)
    : formatDayTitle(currentDate);

  return (
    <div className="w-full min-h-screen bg-[#F9F8F6] px-6 py-6">
      <div className="max-w-[1400px] mx-auto">

        {/* Page heading */}
        <h1 className="text-[20px] font-bold text-gray-900 mb-5">Schedule Overview</h1>

        <div className="flex gap-5 items-start">

          {/* ── Calendar card ── */}
          <div className="flex-1 min-w-0 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

            {/* Toolbar inside the card */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-4">
                {/* Prev / Next arrows */}
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

                {/* Title + date */}
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
                {/* Segmented pill toggle */}
                <div className="flex items-center bg-gray-100 rounded-lg p-0.5 gap-0.5">
                  {(["day","week","month"] as CalendarView[]).map((v) => (
                    <button
                      key={v}
                      onClick={() => setView(v)}
                      className={`px-4 py-1.5 rounded-md text-[13px] font-medium transition-all capitalize ${
                        view === v
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {v.charAt(0).toUpperCase() + v.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Calendar content — no extra wrapper, views render directly */}
            <div className={view === "day" ? "" : "p-0"}>
              {view === "day"   && <CalendarDayView   currentDate={currentDate} jobs={calendarJobs} />}
              {view === "week"  && <CalendarWeekView  currentDate={currentDate} jobs={calendarJobs} />}
              {view === "month" && <CalendarMonthView currentDate={currentDate} jobs={calendarJobs} />}
            </div>
          </div>

          {/* ── Right overview panel ── */}
          <OverviewPanel jobs={calendarJobs} view={view} currentDate={currentDate} />
        </div>
      </div>
    </div>
  );
}