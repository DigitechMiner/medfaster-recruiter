
"use client";

import React, { useCallback, useEffect, useState } from "react";
import { formatDayTitle, formatWeekRange } from "@/app/calendar/helpers";
import type { CalendarView } from "@/app/calendar/helpers";
import type { CalendarJob, CalendarSummary } from "@/types";
import { getJobsCalendar } from "@/features/candidates";
import { useAuthStore } from "@/stores/authStore";
import {
  CalendarDayView,
  CalendarMonthView,
  CalendarWeekView,
  OverviewPanel,
} from "@/app/calendar/calendar-views";
import { AppLayout } from "@/components/global/app-layout";

type CalendarPayload = {
  jobs: CalendarJob[];
  summary: CalendarSummary | null;
};

const calendarPayloadCache = new Map<"today" | "week" | "month", CalendarPayload>();
const calendarInFlightRequests = new Map<"today" | "week" | "month", Promise<CalendarPayload>>();

// ── Root Page ─────────────────────────────────────────────────────────────────
export default function CalendarPage() {
  const recruiterProfile = useAuthStore((state) => state.recruiterProfile);
  const [view,        setView]        = useState<CalendarView>("day");
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [daySourceRange, setDaySourceRange] = useState<"today" | "week" | "month">("today");
  const [calendarJobs, setCalendarJobs] = useState<CalendarJob[]>([]);
  const [calendarSummary, setCalendarSummary] = useState<CalendarSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Pass view-mapped range to API so correct data is fetched ───────────────
  const apiRange = view === "day" ? daySourceRange : view === "week" ? "week" : "month";

  useEffect(() => {
    if (!recruiterProfile) return;

    let cancelled = false;
    setIsLoading(true);

    const cachedPayload = calendarPayloadCache.get(apiRange);
    if (cachedPayload) {
      setCalendarJobs(cachedPayload.jobs);
      setCalendarSummary(cachedPayload.summary);
      setIsLoading(false);
      return () => {
        cancelled = true;
      };
    }

    const inFlight = calendarInFlightRequests.get(apiRange);
    const request =
      inFlight ??
      getJobsCalendar(apiRange).then((res) => {
        const payload: CalendarPayload = {
          jobs: res.data?.shifts ?? [],
          summary: res.data?.summary ?? null,
        };
        calendarPayloadCache.set(apiRange, payload);
        return payload;
      });

    if (!inFlight) {
      calendarInFlightRequests.set(apiRange, request);
    }

    request
      .then((payload) => {
        if (cancelled) return;
        setCalendarJobs(payload.jobs);
        setCalendarSummary(payload.summary);
      })
      .catch(() => {
        if (cancelled) return;
        setCalendarJobs([]);
        setCalendarSummary(null);
        calendarPayloadCache.delete(apiRange);
      })
      .finally(() => {
        calendarInFlightRequests.delete(apiRange);
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [apiRange, recruiterProfile]);

  const handleDaySelectFromGrid = useCallback((date: Date, source: "week" | "month") => {
    const today = new Date();
    // Prevent selecting a date outside the current month.
    if (
      date.getMonth() !== today.getMonth() ||
      date.getFullYear() !== today.getFullYear()
    ) {
      return;
    }
    setCurrentDate(date);
    setDaySourceRange(source);
    setView("day");
  }, []);

  const calendarTitle    = { day: "Daily Calendar", week: "Weekly Calendar", month: "Monthly Calendar" }[view];
  const calendarSubtitle = view === "month" ? "" : view === "week" ? formatWeekRange(currentDate) : formatDayTitle(currentDate);

  return (
    <AppLayout padding="none">
      <div className="flex flex-col gap-4 p-3 sm:p-4 md:p-5 xl:p-6 mx-auto w-full max-w-[1400px]">
        <h1 className="text-2xl font-bold text-gray-900">Schedule Overview</h1>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-5 items-start">
          {/* Main calendar panel */}
          <div className="w-full flex-1 min-w-0 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100">
              <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 min-w-0">
                  <span className="text-[13px] sm:text-[14px] font-bold text-gray-900 whitespace-nowrap">{calendarTitle}</span>
                  {calendarSubtitle && (
                    <span className="text-[12px] sm:text-[14px] text-gray-400 font-medium truncate">{calendarSubtitle}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                {isLoading && <span className="text-[11px] text-gray-400 animate-pulse">Loading...</span>}
                <div className="flex items-center bg-gray-100 rounded-lg p-0.5 gap-0.5">
                  {(["day", "week", "month"] as CalendarView[]).map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setView(option);
                        setCurrentDate(new Date());
                        if (option === "day") setDaySourceRange("today");
                      }}
                      className={`px-2.5 sm:px-4 py-1.5 rounded-md text-[12px] sm:text-[13px] font-medium transition-all capitalize ${
                        view === option ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {view === "day"   && <CalendarDayView   currentDate={currentDate} jobs={calendarJobs} />}
            {view === "week"  && (
              <CalendarWeekView
                currentDate={currentDate}
                jobs={calendarJobs}
                onDateSelect={(date) => handleDaySelectFromGrid(date, "week")}
              />
            )}
            {view === "month" && (
              <CalendarMonthView
                currentDate={currentDate}
                jobs={calendarJobs}
                onDateSelect={(date) => handleDaySelectFromGrid(date, "month")}
              />
            )}
          </div>

          {/* Overview panel */}
          <OverviewPanel jobs={calendarJobs} summary={calendarSummary} view={view} currentDate={currentDate} />
        </div>
      </div>
    </AppLayout>
  );
}