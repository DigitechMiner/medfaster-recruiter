'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DAYS_OF_WEEK } from '@/app/jobs/constants/form';
import { Button } from '@/components/ui/button';

interface CalendarCardProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (date: string) => void;
  initialDate?: Date;
  minimumDate?: Date;
  maximumDate?: Date;
}

// Constants
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
] as const;

const DAY_WIDTH = 'w-[14.28%]'; // 100 / 7

// Utility functions
const normalizeDate = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const getTodayDate = (): Date => {
  return normalizeDate(new Date());
};

const getDaysInMonth = (date: Date): number => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

const getFirstDayOfMonth = (date: Date): number => {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
};

export const CalendarCard: React.FC<CalendarCardProps> = ({ 
  isOpen, 
  onClose, 
  onSchedule,
  initialDate,
  minimumDate,
  maximumDate,
}) => {
  // Memoize normalized dates
  const todayDate = useMemo(() => getTodayDate(), []);
  const effectiveMinimumDate = useMemo(
    () => minimumDate ? normalizeDate(minimumDate) : todayDate,
    [minimumDate, todayDate]
  );
  const effectiveMaximumDate = useMemo(
    () => maximumDate ? normalizeDate(maximumDate) : null,
    [maximumDate]
  );

  // Calculate safe initial date
  const safeInitialDate = useMemo(() => {
    if (initialDate) {
      const initialDateOnly = normalizeDate(initialDate);
      return initialDateOnly >= effectiveMinimumDate ? initialDateOnly : todayDate;
    }
    return todayDate;
  }, [initialDate, effectiveMinimumDate, todayDate]);

  const [selectedDate, setSelectedDate] = useState<Date>(safeInitialDate);
  const [currentMonth, setCurrentMonth] = useState<Date>(
    new Date(safeInitialDate.getFullYear(), safeInitialDate.getMonth(), 1)
  );

  // Reset selected date when modal opens if current selection is invalid
  useEffect(() => {
    if (isOpen) {
      const currentToday = getTodayDate();
      const currentMinDate = minimumDate ? normalizeDate(minimumDate) : currentToday;
      const selectedDateOnly = normalizeDate(selectedDate);
      
      if (selectedDateOnly < currentMinDate) {
        setSelectedDate(currentToday);
        setCurrentMonth(new Date(currentToday.getFullYear(), currentToday.getMonth(), 1));
      }
    }
  }, [isOpen, minimumDate, selectedDate]);

  // Memoize calendar calculations
  const calendarData = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    
    // Previous month days
    const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 0);
    const daysInPrevMonth = prevMonth.getDate();
    const prevMonthDays: number[] = [];
    for (let i = firstDay - 1; i >= 0; i--) {
      prevMonthDays.push(daysInPrevMonth - i);
    }
    
    // Next month days
    const totalCells = Math.ceil((daysInMonth + firstDay) / 7) * 7;
    const nextMonthDays = totalCells - (daysInMonth + firstDay);
    const nextMonthDaysArray: number[] = [];
    for (let i = 1; i <= nextMonthDays; i++) {
      nextMonthDaysArray.push(i);
    }
    
    return { daysInMonth, firstDay, prevMonthDays, nextMonthDays: nextMonthDaysArray };
  }, [currentMonth]);

  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + (direction === 'prev' ? -1 : 1));
      return newMonth;
    });
  }, []);

  const isDateInRange = useCallback((date: Date): boolean => {
    const dateOnly = normalizeDate(date);
    if (dateOnly < effectiveMinimumDate) return false;
    if (effectiveMaximumDate && dateOnly > effectiveMaximumDate) return false;
    return true;
  }, [effectiveMinimumDate, effectiveMaximumDate]);

  const handleDateSelect = useCallback((day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (isDateInRange(newDate)) {
      setSelectedDate(newDate);
    }
  }, [currentMonth, isDateInRange]);

  const handleConfirm = useCallback(() => {
    const monthName = MONTH_NAMES[selectedDate.getMonth()].toLowerCase();
    const formattedDate = `${selectedDate.getDate()} ${monthName}, ${selectedDate.getFullYear()}`;
    onSchedule(formattedDate);
    onClose();
  }, [selectedDate, onSchedule, onClose]);

  const isDateSelected = useCallback((day: number): boolean => {
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth.getMonth() &&
      selectedDate.getFullYear() === currentMonth.getFullYear()
    );
  }, [selectedDate, currentMonth]);

  const isDateDisabled = useCallback((day: number): boolean => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return !isDateInRange(date);
  }, [currentMonth, isDateInRange]);

  // Memoize calendar days rendering
  const calendarDays = useMemo(() => {
    const days: React.ReactElement[] = [];

    // Previous month days
    calendarData.prevMonthDays.forEach((day) => {
      days.push(
        <button
          key={`prev-${day}`}
          className={`${DAY_WIDTH} h-10 flex items-center justify-center cursor-default`}
          disabled
          type="button"
        >
          <span className="text-base font-medium text-gray-400">{day}</span>
        </button>
      );
    });

    // Current month days
    for (let day = 1; day <= calendarData.daysInMonth; day++) {
      const isSelected = isDateSelected(day);
      const isDisabled = isDateDisabled(day);
      
      days.push(
        <button
          key={day}
          className={`${DAY_WIDTH} h-10 flex items-center justify-center rounded-lg transition-colors ${
            isSelected ? 'bg-[#F4781B]' : ''
          } ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          onClick={() => handleDateSelect(day)}
          disabled={isDisabled}
          type="button"
        >
          <span
            className={`text-base font-medium ${
              isSelected
                ? 'text-white'
                : isDisabled
                ? 'text-gray-400'
                : 'text-gray-900'
            }`}
          >
            {day}
          </span>
        </button>
      );
    }

    // Next month days
    calendarData.nextMonthDays.forEach((day) => {
      days.push(
        <button
          key={`next-${day}`}
          className={`${DAY_WIDTH} h-10 flex items-center justify-center cursor-default`}
          disabled
          type="button"
        >
          <span className="text-base font-medium text-gray-400">{day}</span>
        </button>
      );
    });

    return days;
  }, [calendarData, isDateSelected, isDateDisabled, handleDateSelect]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="w-8 h-8 flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity"
            type="button"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          <h2 className="text-lg font-semibold text-gray-900">
            {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>
          
          <button
            onClick={() => navigateMonth('next')}
            className="w-8 h-8 flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity"
            type="button"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Day names */}
        <div className="flex flex-row px-6 pb-2">
          {DAYS_OF_WEEK.map((day) => (
            <div key={day} className="flex-1 flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600">
                {day}
              </span>
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="px-6 pb-6">
          <div className="flex flex-row flex-wrap">
            {calendarDays}
          </div>
        </div>

        {/* Footer buttons */}
        <div className="flex flex-row gap-3 p-6 pt-0">
          <Button
            onClick={onClose}
            variant="ghost"
            className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg"
            type="button"
          >
            Cancel
          </Button>
          
          <Button
            onClick={handleConfirm}
            className="flex-1 rounded-lg"
            type="button"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

