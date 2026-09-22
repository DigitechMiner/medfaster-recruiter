"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  formatDayTitle,
  formatMonthTitle,
  formatWeekRange,
  getMonthDateWindow,
  shiftCalendarDay,
  shiftCalendarMonth,
  toDateKey,
} from "@/app/calendar/helpers";
import type { CalendarView } from "@/app/calendar/helpers";
import type {
  CalendarJob,
  CalendarSummary,
  JobsCalendarParams,
  JobsCalendarView,
} from "@/types";
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

type CalendarQuery = {
  view: JobsCalendarView;
  start_date: string;
  end_date: string;
};

function calendarQueryKey(query: CalendarQuery): string {
  return `${query.view}:${query.start_date}:${query.end_date}`;
}

function toApiParams(query: CalendarQuery): JobsCalendarParams {
  return {
    view: query.view,
    start_date: query.start_date,
    end_date: query.end_date,
  };
}

const calendarPayloadCache = new Map<string, CalendarPayload>();
const calendarInFlightRequests = new Map<string, Promise<CalendarPayload>>();

// ── Root Page ─────────────────────────────────────────────────────────────────
export default function CalendarPage() {
  const recruiterProfile = useAuthStore((state) => state.recruiterProfile);
  const [view, setView] = useState<CalendarView>("day");
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [calendarJobs, setCalendarJobs] = useState<CalendarJob[]>([]);
  const [calendarSummary, setCalendarSummary] = useState<CalendarSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // grid = slim month window for week/month; day = rich single-day payload
  const calendarQuery = useMemo((): CalendarQuery => {
    if (view === "day") {
      const day = toDateKey(currentDate);
      return { view: "day", start_date: day, end_date: day };
    }
    const month = getMonthDateWindow(currentDate);
    return { view: "grid", start_date: month.start_date, end_date: month.end_date };
  }, [view, currentDate]);

  const cacheKey = calendarQueryKey(calendarQuery);

  useEffect(() => {
    if (!recruiterProfile) return;

    let cancelled = false;
    setIsLoading(true);

    const cachedPayload = calendarPayloadCache.get(cacheKey);
    if (cachedPayload) {
      setCalendarJobs(cachedPayload.jobs);
      setCalendarSummary(cachedPayload.summary);
      setIsLoading(false);
      return () => {
        cancelled = true;
      };
    }

    const inFlight = calendarInFlightRequests.get(cacheKey);
    const request =
      inFlight ??
      getJobsCalendar(toApiParams(calendarQuery)).then((res) => {
        const payload: CalendarPayload = {
          jobs: res.data?.shifts ?? [],
          summary: res.data?.summary ?? null,
        };
        calendarPayloadCache.set(cacheKey, payload);
        return payload;
      });

    if (!inFlight) {
      calendarInFlightRequests.set(cacheKey, request);
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
        calendarPayloadCache.delete(cacheKey);
      })
      .finally(() => {
        calendarInFlightRequests.delete(cacheKey);
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [cacheKey, calendarQuery, recruiterProfile]);

  const handleDaySelectFromGrid = useCallback((date: Date) => {
    const monthWindow = getMonthDateWindow(currentDate);
    const key = toDateKey(date);
    if (key < monthWindow.start_date || key > monthWindow.end_date) {
      return;
    }
    setCurrentDate(date);
    setView("day");
  }, [currentDate]);

  const handleNavigate = useCallback(
    (direction: -1 | 1) => {
      if (view === "day") {
        setCurrentDate((d) => shiftCalendarDay(d, direction));
        return;
      }
      setCurrentDate((d) => shiftCalendarMonth(d, direction));
    },
    [view],
  );

  const calendarTitle = { day: "Daily Calendar", week: "Weekly Calendar", month: "Monthly Calendar" }[view];
  const navLabel =
    view === "day"
      ? formatDayTitle(currentDate)
      : view === "week"
        ? formatWeekRange(currentDate)
        : formatMonthTitle(currentDate);
  const prevLabel = view === "day" ? "Previous day" : "Previous month";
  const nextLabel = view === "day" ? "Next day" : "Next month";

  return (
    <AppLayout padding="none">
      <div className="flex flex-col gap-4 p-3 sm:p-4 md:p-5 xl:p-6 mx-auto w-full max-w-[1400px]">
        <h1 className="text-2xl font-bold text-gray-900">Schedule Overview</h1>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-5 items-start">
          <div className="w-full flex-1 min-w-0 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <span className="text-[13px] sm:text-[14px] font-bold text-gray-900 whitespace-nowrap">
                  {calendarTitle}
                </span>

                <div className="flex items-center gap-0.5 sm:gap-1 rounded-lg border border-gray-200 bg-gray-50 p-0.5">
                  <button
                    type="button"
                    onClick={() => handleNavigate(-1)}
                    aria-label={prevLabel}
                    title={prevLabel}
                    className="inline-flex size-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-white hover:text-gray-900 hover:shadow-sm"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <span className="min-w-[7.5rem] sm:min-w-[9.5rem] px-1 text-center text-[12px] sm:text-[13px] font-semibold text-gray-800 tabular-nums truncate">
                    {navLabel}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleNavigate(1)}
                    aria-label={nextLabel}
                    title={nextLabel}
                    className="inline-flex size-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-white hover:text-gray-900 hover:shadow-sm"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                {isLoading && (
                  <span className="text-[11px] text-gray-400 animate-pulse">Loading...</span>
                )}
                <div className="flex items-center bg-gray-100 rounded-lg p-0.5 gap-0.5">
                  {(["day", "week", "month"] as CalendarView[]).map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setView(option);
                        // Keep current month context when switching week ↔ month
                        if (option === "day") {
                          setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()));
                        } else {
                          setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth(), 1));
                        }
                      }}
                      className={`px-2.5 sm:px-4 py-1.5 rounded-md text-[12px] sm:text-[13px] font-medium transition-all capitalize ${
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

            {view === "day" && <CalendarDayView currentDate={currentDate} jobs={calendarJobs} />}
            {view === "week" && (
              <CalendarWeekView
                currentDate={currentDate}
                jobs={calendarJobs}
                onDateSelect={handleDaySelectFromGrid}
              />
            )}
            {view === "month" && (
              <CalendarMonthView
                currentDate={currentDate}
                jobs={calendarJobs}
                onDateSelect={handleDaySelectFromGrid}
              />
            )}
          </div>

          <OverviewPanel
            jobs={calendarJobs}
            summary={calendarSummary}
            view={view}
            currentDate={currentDate}
          />
        </div>
      </div>
    </AppLayout>
  );
}
