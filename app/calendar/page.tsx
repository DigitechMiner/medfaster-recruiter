"use client";
import React, { useState } from "react";
import { Briefcase, ChevronLeft, ChevronRight } from "lucide-react";
import { Footer } from "@/components/global/footer";
import { Navbar } from "@/components/global/navbar";

type CalendarView = "day" | "week" | "month";

const weekdays = ["Mon 06", "Tue 07", "Wed 08", "Thu 09", "Fri 10", "Sat 11", "Sun 12"];
const monthWeekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const timeslots = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 PM",
  "11:00 PM",
  "11:30 PM",
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
  { title: "Dr. Jane Cooper", experience: "5+ yrs", type: "Part-Time", dateIdx: 1, slotIdx: 1, time: "09:30 AM - 10:00 AM" },
  { title: "Dr. Jane Cooper", experience: "5+ yrs", type: "Part-Time", dateIdx: 1, slotIdx: 2, time: "09:30 AM - 10:00 AM" },
  { title: "Dr. Noah Liam", experience: "2+ yrs", type: "Part-Time", dateIdx: 0, slotIdx: 3, time: "10:30 AM - 11:00 AM" },
  { title: "Dr. Jane Cooper", experience: "5+ yrs", type: "Part-Time", dateIdx: 3, slotIdx: 0, time: "09:30 AM - 10:00 AM" },
  { title: "Dr. Jane Cooper", experience: "5+ yrs", type: "Part-Time", dateIdx: 3, slotIdx: 1, time: "09:30 AM - 10:00 AM" },
  { title: "Dr. Jane Cooper", experience: "5+ yrs", type: "Part-Time", dateIdx: 5, slotIdx: 0, time: "09:30 AM - 10:00 AM" },
  { title: "Dr. Jane Cooper", experience: "5+ yrs", type: "Part-Time", dateIdx: 2, slotIdx: 4, time: "09:30 AM - 10:00 AM" },
  { title: "Dr. Jane Cooper", experience: "5+ yrs", type: "Part-Time", dateIdx: 6, slotIdx: 3, time: "09:30 AM - 10:00 AM" },
  { title: "Dr. Noah Liam", experience: "4+ yrs", type: "Part-Time", dateIdx: 0, slotIdx: 5, time: "11:30 AM - 12:00 PM" },
];

// Month calendar data
const monthData = [
  { day: 28, month: "prev", events: ["Dr. Noah Liam"] },
  { day: 29, month: "prev", events: [] },
  { day: 30, month: "prev", events: [] },
  { day: 1, month: "current", label: "1 Oct", events: [] },
  { day: 2, month: "current", events: [] },
  { day: 3, month: "current", events: [] },
  { day: 4, month: "current", events: [] },
  { day: 5, month: "current", events: ["Dr. Noah Liam"] },
  { day: 6, month: "current", events: [] },
  { day: 7, month: "current", events: [] },
  { day: 8, month: "current", events: [] },
  { day: 9, month: "current", events: ["Dr. Noah Liam", "Dr. Noah Liam", "Dr. Noah Liam"] },
  { day: 10, month: "current", events: [] },
  { day: 11, month: "current", events: [] },
  { day: 12, month: "current", events: [] },
  { day: 13, month: "current", events: [] },
  { day: 14, month: "current", events: ["Dr. Noah Liam", "Dr. Noah Liam"] },
  { day: 15, month: "current", events: [] },
  { day: 16, month: "current", events: [] },
  { day: 17, month: "current", events: [] },
  { day: 18, month: "current", events: [] },
  { day: 19, month: "current", events: [] },
  { day: 20, month: "current", events: [] },
  { day: 21, month: "current", events: [] },
  { day: 22, month: "current", events: [] },
  { day: 23, month: "current", events: ["Dr. Noah Liam", "Dr. Noah Liam"] },
  { day: 24, month: "current", events: [] },
  { day: 25, month: "current", events: [] },
  { day: 26, month: "current", events: ["Dr. Noah Liam", "Dr. Noah Liam", "Dr. Noah Liam"] },
  { day: 27, month: "current", events: [] },
  { day: 28, month: "current", events: [] },
  { day: 29, month: "current", events: [] },
  { day: 30, month: "current", events: [] },
  { day: 31, month: "current", events: [] },
  { day: 1, month: "next", label: "1 Nov", events: [] },
];

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

function CalendarWeekView() {
  return (
    <div className="bg-white rounded-xl border border-[#E9EAEB] overflow-hidden">
      <div className="overflow-x-auto">
        <div className="min-w-[1100px]">
          {/* Header */}
          <div className="grid grid-cols-[100px_repeat(7,1fr)] border-b border-[#E9EAEB]">
            <div className="p-4"></div>
            {weekdays.map((day, idx) => (
              <div key={idx} className="p-4 text-center font-semibold text-[13px] text-[#252B37]">
                {day}
              </div>
            ))}
          </div>

          {/* Time slots */}
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

function CalendarDayView() {
  const dayEvents = sampleEvents.filter((e) => e.dateIdx === 0);

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

function CalendarMonthView() {
  return (
    <div className="bg-white rounded-xl border border-[#E9EAEB] overflow-hidden p-4">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {monthWeekdays.map((day) => (
          <div key={day} className="text-center text-[11px] font-semibold text-[#8E8E93] py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {monthData.map((item, index) => {
          const isPrevMonth = item.month === "prev";
          const isNextMonth = item.month === "next";
          const isCurrentMonth = item.month === "current";

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
  const [selectedDate, setSelectedDate] = useState("06 October 2025");

  const getTitle = () => {
    if (view === "month") return "October 2025";
    return selectedDate;
  };

  return (
    <>
      <Navbar />
      <div className="w-full min-h-screen bg-[#F9F8F6] px-6 py-6">
        <div className="max-w-[1400px] mx-auto">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button className="bg-white border border-[#D1D5DB] text-[#374151] font-medium px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition">
                Today
              </button>
              <div className="flex items-center gap-2">
                <button className="p-1 hover:bg-gray-100 rounded transition">
                  <ChevronLeft className="w-5 h-5 text-[#374151]" />
                </button>
                <span className="font-medium text-[15px] text-[#252B37] min-w-[160px] text-center">
                  {getTitle()}
                </span>
                <button className="p-1 hover:bg-gray-100 rounded transition">
                  <ChevronRight className="w-5 h-5 text-[#374151]" />
                </button>
              </div>
            </div>

            {/* View selector */}
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

          {/* Calendar content */}
          {view === "day" && <CalendarDayView />}
          {view === "week" && <CalendarWeekView />}
          {view === "month" && <CalendarMonthView />}
        </div>
      </div>
      <Footer />
    </>
  );
}
