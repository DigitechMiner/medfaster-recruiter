'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { useJobsCalendar } from '@/hooks/useRecruiterData';
import type { CalendarJob } from '@/Interface/recruiter.types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface Appointment {
  name: string;
  date: string;
  rawDate: Date;
}

export const MiniCalendar = () => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const year        = currentDate.getFullYear();
  const month       = currentDate.getMonth();
  const monthName   = currentDate.toLocaleString('default', { month: 'long' });
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev  = new Date(year, month, 0).getDate();
  const trailingCount = (7 - ((firstDay + daysInMonth) % 7)) % 7;

  const { calendarJobs, isLoading } = useJobsCalendar();

  // Derive scheduledDays and appointments from calendarJobs
  const scheduledDays: number[] = [];
  const appointments: Appointment[] = [];

  calendarJobs.forEach((job: CalendarJob) => {
  const dateStr = job.shift_date;              // ← was job.start_date ?? job.end_date
  if (!dateStr) return;
  const d = new Date(dateStr);
  if (d.getFullYear() === year && d.getMonth() === month) {
    scheduledDays.push(d.getDate());
    if (d >= today) {
      appointments.push({
        name:    job.job_title,                // ← same ✅
        date:    d.toLocaleDateString('en-CA', { day: 'numeric', month: 'short', year: 'numeric' }),
        rawDate: d,
      });
    }
  }
});

  const uniqueScheduledDays = [...new Set(scheduledDays)];
  const upcomingAppointments = appointments
    .sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime())
    .slice(0, 4);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const isToday   = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-0 h-full">
      <h2 className="text-lg font-bold text-gray-900 mb-4 px-1">
        Scheduled Interviews & Hirings
      </h2>

      {/* Month Nav */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-200">
        <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-xl bg-orange-500 hover:bg-orange-600 text-white transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-bold text-gray-900">{monthName} {year}</span>
        <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-xl bg-orange-500 hover:bg-orange-600 text-white transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 text-center pt-2 pb-2 border-b border-gray-200">
        {DAYS.map((d) => (
          <span key={d} className="text-xs font-medium text-gray-500">{d}</span>
        ))}
      </div>

      {/* Date Grid */}
      <div className="grid grid-cols-7 text-center gap-y-1 py-3">
        {Array(firstDay).fill(null).map((_, i) => (
          <div key={`prev-${i}`} className="flex flex-col items-center gap-0.5">
            <span className="text-sm font-bold text-gray-300 w-8 h-8 flex items-center justify-center">
              {daysInPrev - firstDay + i + 1}
            </span>
            <span className="w-1.5 h-1.5 opacity-0" />
          </div>
        ))}

        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
          <div key={day} className="flex flex-col items-center gap-0.5">
            <button className={`text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full transition-colors
              ${isToday(day) ? 'bg-orange-500 text-white' : 'text-gray-900 hover:bg-orange-50 hover:text-[#F4781B]'}`}>
              {day}
            </button>
            {uniqueScheduledDays.includes(day) && !isToday(day)
              ? <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
              : <span className="w-1.5 h-1.5 opacity-0" />
            }
          </div>
        ))}

        {Array.from({ length: trailingCount }, (_, i) => i + 1).map((day) => (
          <div key={`next-${day}`} className="flex flex-col items-center gap-0.5">
            <span className="text-sm font-bold text-gray-300 w-8 h-8 flex items-center justify-center">{day}</span>
            <span className="w-1.5 h-1.5 opacity-0" />
          </div>
        ))}
      </div>

      {/* Appointments */}
      <div className="border border-gray-200 rounded-xl overflow-hidden mt-2">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="px-4 py-3 border-b border-gray-100 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-32 mb-1" />
              <div className="h-3 bg-gray-50 rounded w-24" />
            </div>
          ))
        ) : upcomingAppointments.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-gray-400">
            No upcoming jobs scheduled
          </div>
        ) : (
          upcomingAppointments.map((apt, i) => (
            <div key={i} className={`flex items-center justify-between px-4 py-3 ${i < upcomingAppointments.length - 1 ? 'border-b border-gray-200' : ''}`}>
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-bold text-gray-900">{apt.name}</p>
                <p className="flex items-center gap-1.5 text-xs text-gray-400">
                  <CalendarDays className="w-3.5 h-3.5 shrink-0" />
                  {apt.date}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-orange-400 shrink-0" />
            </div>
          ))
        )}
      </div>
    </div>
  );
};