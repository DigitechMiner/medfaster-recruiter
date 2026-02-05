// components/custom-calendar.tsx
"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CustomCalendarProps {
  selectedDate?: Date;
  onSelect: (date: Date) => void;
  onCancel: () => void;
  onSchedule: () => void;
}

export function CustomCalendar({
  selectedDate,
  onSelect,
  onCancel,
  onSchedule,
}: CustomCalendarProps) {
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date());
  const [selected, setSelected] = useState<Date | undefined>(selectedDate);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const dayNames = ["Sun", "mon", "tue", "wed", "thu", "fri", "sat"];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelected(newDate);
    onSelect(newDate);
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    const prevMonthDays = getDaysInMonth(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );

    for (let i = firstDay - 1; i >= 0; i--) {
      days.push(
        <button
          key={`prev-${i}`}
          type="button"
          className="h-10 w-10 text-center text-sm text-gray-300 hover:bg-gray-50 rounded-md"
          disabled
        >
          {prevMonthDays - i}
        </button>
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected =
        selected &&
        selected.getDate() === day &&
        selected.getMonth() === currentDate.getMonth() &&
        selected.getFullYear() === currentDate.getFullYear();

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDateClick(day)}
          className={`h-10 w-10 text-center text-sm rounded-md transition-colors ${
            isSelected
              ? "bg-[#F4781B] text-white font-semibold"
              : "text-gray-900 hover:bg-gray-100"
          }`}
        >
          {day}
        </button>
      );
    }

    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push(
        <button
          key={`next-${day}`}
          type="button"
          className="h-10 w-10 text-center text-sm text-gray-300 hover:bg-gray-50 rounded-md"
          disabled
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="w-[360px] bg-white rounded-lg shadow-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <button type="button" onClick={previousMonth} className="p-1 hover:bg-gray-100 rounded-md">
          <ChevronLeft className="h-5 w-5 text-gray-700" />
        </button>
        <h3 className="text-lg font-semibold text-gray-900">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <button type="button" onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded-md">
          <ChevronRight className="h-5 w-5 text-gray-700" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="h-10 flex items-center justify-center text-sm font-medium text-gray-600">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 mb-4">{renderCalendarDays()}</div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSchedule}
          className="px-6 py-2 text-sm font-medium text-white bg-[#F4781B] hover:bg-orange-600 rounded-md transition-colors"
        >
          Schedule
        </button>
      </div>
    </div>
  );
}
