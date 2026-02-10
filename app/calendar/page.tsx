"use client";
import React, { useState } from "react";
import { Briefcase, ChevronLeft, ChevronRight } from "lucide-react";
import { AppLayout } from "@/components/global/app-layout";

type CalendarView = "day" | "week" | "month";

const monthWeekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const timeslots = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
];

interface EventItem {
  title: string;
  experience: string;
  type: string;
  dateIdx: number;
  slotIdx: number;
  time: string;
}

const sampleEvents: EventItem[] = [
  { title: "Dr. Noah Liam", experience: "5+ yrs", type: "Part-Time", dateIdx: 0, slotIdx: 0, time: "09:00 AM - 09:30 AM" },
  { title: "Dr. Noah Liam", experience: "2.5+ yrs", type: "Part-Time", dateIdx: 0, slotIdx: 1, time: "09:30 AM - 10:00 AM" },
  // ... rest of your events
];

// Helper functions for date manipulation
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function generateMonthData(year: number, month: number) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const daysInPrevMonth = getDaysInMonth(year, month - 1);
  
  const monthData = [];
  
  // Previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    monthData.push({
      day: daysInPrevMonth - i,
      month: "prev" as const,
      events: [],
    });
  }
  
  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    monthData.push({
      day,
      month: "current" as const,
      label: day === 1 ? `1 ${getMonthName(month)}` : undefined,
      events: [], // You can add logic to fetch events for specific dates
    });
  }
  
  // Next month days to fill the grid
  const remainingDays = 35 - monthData.length;
  for (let day = 1; day <= remainingDays; day++) {
    monthData.push({
      day,
      month: "next" as const,
      label: day === 1 ? `1 ${getMonthName((month + 1) % 12)}` : undefined,
      events: [],
    });
  }
  
  return monthData;
}

function getMonthName(month: number): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return months[month];
}

function getMonthFullName(month: number): string {
  const months = ["January", "February", "March", "April", "May", "June", 
                  "July", "August", "September", "October", "November", "December"];
  return months[month];
}

function formatDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = getMonthFullName(date.getMonth());
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

function getWeekDays(date: Date): string[] {
  const days = [];
  const currentDay = date.getDay();
  const diff = date.getDate() - currentDay + (currentDay === 0 ? -6 : 1); // Adjust to Monday
  
  for (let i = 0; i < 7; i++) {
    const day = new Date(date);
    day.setDate(diff + i);
    const dayName = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i];
    const dayNum = day.getDate().toString().padStart(2, '0');
    days.push(`${dayName} ${dayNum}`);
  }
  
  return days;
}

function EventCard({ event }: { event: EventItem }) {
  return (
    <div className="rounded-xl bg-[#FFE8DC] border border-[#FFD4B5] px-3.5 py-2.5 shadow-sm hover:shadow transition-shadow">
      <div className="font-semibold text-[13px] text-[#252B37] leading-tight mb-1">
        {event.title}
      </div>
      <div className="flex items-center gap-1.5 mb-1">
        <Briefcase className="w-3 h-3 text-[#888888]" />
        <span className="text-[11px] text-[#717680]">
          {event.experience} • {event.type}
        </span>
      </div>
      <div className="text-[11px] text-[#717680]">{event.time}</div>
    </div>
  );
}

function CalendarWeekView({ currentDate }: { currentDate: Date }) {
  const weekdays = getWeekDays(currentDate);
  
  return (
    <div className="bg-white rounded-xl border border-[#E9EAEB] overflow-hidden">
      <div className="overflow-x-auto">
        <div className="min-w-[1100px]">
          <div className="grid grid-cols-[100px_repeat(7,1fr)] border-b border-[#E9EAEB]">
            <div className="p-4"></div>
            {weekdays.map((day, idx) => (
              <div key={idx} className="p-4 text-center font-semibold text-[13px] text-[#252B37]">
                {day}
              </div>
            ))}
          </div>

          {timeslots.map((slot, slotIdx) => (
            <div key={slotIdx} className="grid grid-cols-[100px_repeat(7,1fr)] border-b border-[#E9EAEB] last:border-b-0">
              <div className="p-4 text-right pr-3 text-[11px] text-[#8E8E93]">
                {slot}
              </div>
              {weekdays.map((_, dateIdx) => {
                const event = sampleEvents.find(
                  (e) => e.dateIdx === dateIdx && e.slotIdx === slotIdx
                );
                return (
                  <div key={dateIdx} className="p-3 min-h-[90px] border-l border-[#F3F4F6]">
                    {event && <EventCard event={event} />}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CalendarDayView({ currentDate }: { currentDate: Date }) {
  // Calculate the dateIdx based on currentDate
  // Assuming dateIdx 0 is today, 1 is tomorrow, etc.
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(currentDate);
  targetDate.setHours(0, 0, 0, 0);
  
  const dateIdx = Math.floor((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  const dayEvents = sampleEvents.filter((e) => e.dateIdx === dateIdx);

  return (
    <div className="bg-white rounded-xl border border-[#E9EAEB] overflow-hidden">
      {timeslots.map((slot, slotIdx) => {
        const event = dayEvents.find((e) => e.slotIdx === slotIdx);
        return (
          <div key={slotIdx} className="flex border-b border-[#E9EAEB] last:border-b-0 min-h-[90px]">
            <div className="w-[100px] py-4 px-4 text-[11px] text-[#8E8E93] flex-shrink-0">
              {slot}
            </div>
            <div className="flex-1 py-3 px-4 border-l border-[#F3F4F6]">
              {event && <EventCard event={event} />}
            </div>
          </div>
        );
      })}
    </div>
  );
}


function CalendarMonthView({ currentDate }: { currentDate: Date }) {
  const monthData = generateMonthData(currentDate.getFullYear(), currentDate.getMonth());
  
  return (
    <div className="bg-white rounded-xl border border-[#E9EAEB] overflow-hidden p-4">
      <div className="grid grid-cols-7 gap-2 mb-2">
        {monthWeekdays.map((day) => (
          <div key={day} className="text-center text-[11px] font-semibold text-[#8E8E93] py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {monthData.map((item, index) => {
          const isPrevMonth = item.month === "prev";
          const isNextMonth = item.month === "next";

          return (
            <div
              key={index}
              className={`rounded-lg border min-h-[100px] p-2.5 ${
                isPrevMonth || isNextMonth
                  ? "bg-[#F9F9F9] border-[#E9EAEB]"
                  : "bg-white border-[#E9EAEB] hover:border-[#FFD4B5] cursor-pointer"
              }`}
            >
              <div className={`text-[11px] font-medium mb-2 ${
                isPrevMonth || isNextMonth ? "text-[#C7C7CC]" : "text-[#252B37]"
              }`}>
                {item.label || item.day}
              </div>
              {item.events.length > 0 && (
                <div className="space-y-1">
                  {item.events.map((event, i) => (
                    <div
                      key={i}
                      className="text-[10px] bg-[#FFE8DC] text-[#F4781B] rounded px-2 py-1 truncate font-medium"
                    >
                      {event}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const [view, setView] = useState<CalendarView>("day");
  const [currentDate, setCurrentDate] = useState(new Date());

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    if (view === 'day') {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (view === 'week') {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    } else if (view === 'month') {
      newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getTitle = () => {
    if (view === "month") {
      return `${getMonthFullName(currentDate.getMonth())} ${currentDate.getFullYear()}`;
    }
    return formatDate(currentDate);
  };

  return (
    <AppLayout padding="none">
      <div className="w-full min-h-screen bg-[#F9F8F6] px-6 py-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button 
                onClick={goToToday}
                className="bg-white border border-[#D1D5DB] text-[#374151] font-medium px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
              >
                Today
              </button>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => navigateDate('prev')}
                  className="p-1 hover:bg-gray-100 rounded transition"
                >
                  <ChevronLeft className="w-5 h-5 text-[#374151]" />
                </button>
                <span className="font-medium text-[15px] text-[#252B37] min-w-[200px] text-center">
                  {getTitle()}
                </span>
                <button 
                  onClick={() => navigateDate('next')}
                  className="p-1 hover:bg-gray-100 rounded transition"
                >
                  <ChevronRight className="w-5 h-5 text-[#374151]" />
                </button>
              </div>
            </div>

            <div className="relative">
              <select
                value={view}
                onChange={(e) => setView(e.target.value as CalendarView)}
                className="appearance-none bg-white border border-[#D1D5DB] text-[#374151] font-medium px-4 py-2 pr-10 rounded-lg text-sm cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#F4781B] focus:border-transparent"
              >
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
              </select>
              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {view === "day" && <CalendarDayView currentDate={currentDate} />}
          {view === "week" && <CalendarWeekView currentDate={currentDate} />}
          {view === "month" && <CalendarMonthView currentDate={currentDate} />}
        </div>
      </div>
    </AppLayout>
  );
}
