"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DAYS = ["Sun", "mon", "tue", "wed", "thu", "fri", "sat"];

const appointments = [
  { name: "Dr. Emily Carter", date: "3 Jan, 2025" },
  { name: "Dr. James Patel", date: "17 Feb, 2025" },
  { name: "Dr. Sofia Nguyen", date: "5 Mar, 2025" },
  { name: "Dr. Marcus Reid", date: "22 Apr, 2025" },
  { name: "Dr. Priya Sharma", date: "11 Jun, 2025" },
];

export const MiniCalendar = () => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleString("default", { month: "long" });

  // First day of month (0=Sun, 1=Mon...)
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  // Total days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Days from previous month to fill the grid
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const isToday = (day: number) =>
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-3">

      {/* Month nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="w-7 h-7 flex items-center justify-center rounded-full bg-orange-500 hover:bg-orange-600 text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-semibold text-gray-800">
          {monthName} {year}
        </span>
        <button
          onClick={nextMonth}
          className="w-7 h-7 flex items-center justify-center rounded-full bg-orange-500 hover:bg-orange-600 text-white transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 text-center">
        {DAYS.map((d) => (
          <span key={d} className="text-xs text-gray-400 font-medium py-1">{d}</span>
        ))}
      </div>

      {/* Date grid */}
      <div className="grid grid-cols-7 text-center gap-y-0.5">

        {/* Prev month filler days */}
        {Array(firstDayOfMonth).fill(null).map((_, i) => (
          <span
            key={`prev-${i}`}
            className="text-xs py-1.5 text-gray-300 w-7 h-7 mx-auto flex items-center justify-center"
          >
            {daysInPrevMonth - firstDayOfMonth + i + 1}
          </span>
        ))}

        {/* Current month days */}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
          <button
            key={day}
            className={`text-xs py-1.5 rounded-full w-7 h-7 mx-auto flex items-center justify-center transition-colors
              ${isToday(day)
                ? "bg-orange-500 text-white font-bold"
                : "text-gray-700 hover:bg-orange-50 hover:text-orange-500"
              }`}
          >
            {day}
          </button>
        ))}

        {/* Next month filler days */}
        {Array.from(
          { length: (7 - ((firstDayOfMonth + daysInMonth) % 7)) % 7 },
          (_, i) => i + 1
        ).map((day) => (
          <span
            key={`next-${day}`}
            className="text-xs py-1.5 text-gray-300 w-7 h-7 mx-auto flex items-center justify-center"
          >
            {day}
          </span>
        ))}
      </div>

      {/* Appointments */}
      <div className="flex flex-col mt-1">
        {appointments.map((apt, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-600 shrink-0">
                {apt.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <div>
                <p className="text-xs font-medium text-gray-800">{apt.name}</p>
                <p className="text-xs text-gray-400">{apt.date}</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
};
