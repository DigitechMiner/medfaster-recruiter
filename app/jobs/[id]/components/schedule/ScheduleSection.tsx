"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, Clock, Layers, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useJobSchedule } from "@/hooks/useJobData";
import type { JobDetailSummaryData } from "@/types";
import { SchedulePlanPanel } from "./SchedulePlanPanel";
import {
  formatDate,
  formatDateRange,
  formatLabel,
  formatTime,
} from "../shared/job-detail-helpers";

type ScheduleSectionProps = {
  summary: JobDetailSummaryData;
  jobId: string;
};

function hasScheduleData(summary: JobDetailSummaryData) {
  return Boolean(
    summary.start_date ||
      summary.end_date ||
      summary.next_shift ||
      summary.total_shifts > 0 ||
      summary.shift_mode,
  );
}

export function ScheduleSection({
  summary,
  jobId,
}: ScheduleSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [rotationOpen, setRotationOpen] = useState(false);
  const isInstant = summary.job_urgency === "INSTANT";
  const shouldLoadSchedule = !isInstant && Boolean(summary.shift_mode);
  const { schedule, isLoading, error } = useJobSchedule(
    jobId,
    shouldLoadSchedule,
  );

  if (!hasScheduleData(summary)) return null;

  const templates = schedule?.shift_templates ?? [];
  const teams = schedule?.rotational_teams ?? [];
  const nextShift = summary.next_shift;

  const handleViewScheduleTab = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "schedule");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-gray-900">Schedule</h2>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-[#F4781B] hover:text-orange-600"
              onClick={handleViewScheduleTab}
            >
              View full schedule
            </Button>
          </div>

          {isInstant ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[#F4781B]">
                  <CalendarDays size={16} />
                </span>
                <div>
                  <p className="text-xs font-medium text-gray-500">Date range</p>
                  <p className="mt-0.5 text-sm font-semibold text-gray-900">
                    {formatDateRange(summary.start_date, summary.end_date)}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {summary.total_shifts} shift
                    {summary.total_shifts === 1 ? "" : "s"}
                  </p>
                </div>
              </div>

              {nextShift && (
                <div className="flex items-start gap-3 rounded-xl border border-orange-100 bg-gradient-to-br from-orange-50/80 to-white p-4">
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white text-[#F4781B] shadow-sm">
                    <Clock size={16} />
                  </span>
                  <div>
                    <p className="text-xs font-medium text-gray-500">
                      Next shift
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-gray-900">
                      {nextShift.shift_name}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {formatDate(nextShift.shift_date)} ·{" "}
                      {formatTime(nextShift.start_time)} –{" "}
                      {formatTime(nextShift.end_time)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Layers size={16} className="text-[#F4781B]" />
                  <span>
                    {isLoading
                      ? "Loading templates…"
                      : `${templates.length || "—"} shift template${templates.length === 1 ? "" : "s"}`}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Users size={16} className="text-[#F4781B]" />
                  <span>
                    {isLoading
                      ? "Loading teams…"
                      : `${teams.length || "—"} team${teams.length === 1 ? "" : "s"}`}
                  </span>
                </div>
                {schedule?.rotation_cycle_days != null && (
                  <div className="text-sm text-gray-500">
                    {schedule.rotation_cycle_days}-day cycle
                    {schedule.cycle_start_day
                      ? ` · starts ${formatLabel(schedule.cycle_start_day)}`
                      : ""}
                  </div>
                )}
              </div>

              {templates.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {templates.map((template, index) => (
                    <span
                      key={template.id ?? `${template.shift_name}-${index}`}
                      className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600"
                    >
                      {template.shift_name}
                    </span>
                  ))}
                </div>
              )}

              {teams.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="shrink-0 border border-[#F4781B] text-[#F4781B] hover:bg-orange-50"
                  onClick={() => setRotationOpen(true)}
                >
                  View rotation
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <Dialog open={rotationOpen} onOpenChange={setRotationOpen}>
        <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Rotation plan</DialogTitle>
          </DialogHeader>
          <SchedulePlanPanel
            schedule={schedule}
            isLoading={isLoading}
            error={error}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
