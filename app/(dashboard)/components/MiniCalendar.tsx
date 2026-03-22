"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

const DAYS = ["Sun", "mon", "tue", "wed", "thu", "fri", "sat"];

const scheduledDates = [2, 4, 9, 10, 11, 12, 14, 15, 16, 18, 19, 22, 25, 29, 30];

const appointments = [
  { name: "Noah Liam",        date: "2 oct,2026" },
  { name: "Satoshi Nakamoto", date: "4 oct,2026" },
  { name: "Megan Khan",       date: "4 oct,2026" },
  { name: "Mehta Suresh",     date: "9 oct,2026" },
];

export const MiniCalendar = () => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const year            = currentDate.getFullYear();
  const month           = currentDate.getMonth();
  const monthName       = currentDate.toLocaleString("default", { month: "long" });
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth     = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const trailingCount   = (7 - ((firstDayOfMonth + daysInMonth) % 7)) % 7;

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const isToday = (day: number) =>
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-0 h-full">

      {/* ── Title ── */}
      <h2 className="text-lg font-bold text-gray-900 mb-4 px-1">
        Scheduled Interviews & Hirings
      </h2>

      {/* ── Month Nav ── */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-200">
        <button
          onClick={prevMonth}
          className="w-8 h-8 flex items-center justify-center rounded-xl bg-orange-500 hover:bg-orange-600 text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-bold text-gray-900">
          {monthName} {year}
        </span>
        <button
          onClick={nextMonth}
          className="w-8 h-8 flex items-center justify-center rounded-xl bg-orange-500 hover:bg-orange-600 text-white transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* ── Day Headers ── */}
      <div className="grid grid-cols-7 text-center pt-2 pb-2 border-b border-gray-200">
        {DAYS.map((d) => (
          <span key={d} className="text-xs font-medium text-gray-500">{d}</span>
        ))}
      </div>

      {/* ── Date Grid ── */}
      <div className="grid grid-cols-7 text-center gap-y-1 py-3">

        {/* Prev month fillers */}
        {Array(firstDayOfMonth).fill(null).map((_, i) => (
          <div key={`prev-${i}`} className="flex flex-col items-center gap-0.5">
            <span className="text-sm font-bold text-gray-300 w-8 h-8 flex items-center justify-center">
              {daysInPrevMonth - firstDayOfMonth + i + 1}
            </span>
            <span className="w-1.5 h-1.5 opacity-0" />
          </div>
        ))}

        {/* Current month days */}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
          <div key={day} className="flex flex-col items-center gap-0.5">
            <button
              className={`text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full transition-colors
                ${isToday(day)
                  ? "bg-orange-500 text-white"
                  : "text-gray-900 hover:bg-orange-50 hover:text-orange-500"
                }`}
            >
              {day}
            </button>
            {scheduledDates.includes(day) && !isToday(day)
              ? <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
              : <span className="w-1.5 h-1.5 opacity-0" />
            }
          </div>
        ))}

        {/* Next month fillers */}
        {Array.from({ length: trailingCount }, (_, i) => i + 1).map((day) => (
          <div key={`next-${day}`} className="flex flex-col items-center gap-0.5">
            <span className="text-sm font-bold text-gray-300 w-8 h-8 flex items-center justify-center">
              {day}
            </span>
            <span className="w-1.5 h-1.5 opacity-0" />
          </div>
        ))}
      </div>

      {/* ── Appointments card ── */}
      <div className="border border-gray-200 rounded-xl overflow-hidden mt-2">
        {appointments.map((apt, i) => (
          <div
            key={i}
            className={`flex items-center justify-between px-4 py-3 ${
              i < appointments.length - 1 ? "border-b border-gray-200" : ""
            }`}
          >
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-bold text-gray-900">{apt.name}</p>
              <p className="flex items-center gap-1.5 text-xs text-gray-400">
                <CalendarDays className="w-3.5 h-3.5 shrink-0" />
                {apt.date}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-orange-400 shrink-0" />
          </div>
        ))}
      </div>

    </div>
  );
};
