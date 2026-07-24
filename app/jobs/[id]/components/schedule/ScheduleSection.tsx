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
import { ScrollFadeContainer } from "@/components/ui/scroll-fade-container";
import { useJobSchedule } from "@/hooks/useJobData";
import type { JobDetailSummaryData } from "@/types";
import { EmptyState, LoadingRows } from "../shared/JobDetailDataView";
import { WorkScheduleVisual } from "./WorkScheduleVisual";
import {
  formatDate,
  formatDateRange,
  formatLabel,
  formatTime,
} from "../shared/job-detail-helpers";
import { formatShiftTypeLabel } from "@/app/jobs/components/helper";

type ScheduleSectionProps = {
  summary: JobDetailSummaryData;
  jobId: string;
  /** When true, renders as a section inside the summary card (no outer card chrome). */
  embedded?: boolean;
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

function getShiftBadgeClass(shiftType: string) {
  switch (shiftType.toUpperCase()) {
    case "MORNING":
      return "border-red-200 bg-red-50 text-red-700";
    case "EVENING":
      return "border-green-200 bg-green-50 text-green-700";
    case "NIGHT":
      return "border-blue-200 bg-blue-50 text-blue-700";
    default:
      return "border-gray-200 bg-gray-50 text-gray-600";
  }
}

export function ScheduleSection({
  summary,
  jobId,
  embedded = false,
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

  const content = (
    <div className="flex flex-col gap-4">
      
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
                  {formatShiftTypeLabel(nextShift.shift_type)}
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
                  key={template.id ?? `${template.shift_type}-${index}`}
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${getShiftBadgeClass(template.shift_type)}`}
                >
                  {formatShiftTypeLabel(template.shift_type)}
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
  );

  return (
    <>
      {embedded ? (
        <div className="border-t border-gray-100 px-4 py-4 sm:px-6 sm:py-5">
          {content}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="p-4 sm:p-5">{content}</div>
        </div>
      )}

      <Dialog open={rotationOpen} onOpenChange={setRotationOpen}>
        <DialogContent className="flex max-h-[85vh] max-w-xl flex-col gap-4 overflow-hidden p-6 pb-0 sm:rounded-2xl">
          <DialogHeader className="sr-only shrink-0">
            <DialogTitle>Work Schedule</DialogTitle>
          </DialogHeader>
          <ScrollFadeContainer
            watchKey={`${rotationOpen}-${isLoading}-${teams.length}`}
            edgeBleed
            className="max-h-[calc(85vh-4rem)]"
          >
            {isLoading ? (
              <LoadingRows count={3} />
            ) : error ? (
              <EmptyState
                title="Unable to load schedule"
                description={error}
              />
            ) : schedule && teams.length > 0 ? (
              <WorkScheduleVisual
                schedule={schedule}
                teams={[...teams].sort(
                  (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0),
                )}
                compact
              />
            ) : (
              <EmptyState
                title="No rotation configured"
                description="Team rotation details will appear here once the schedule is set up."
              />
            )}
          </ScrollFadeContainer>
        </DialogContent>
      </Dialog>
    </>
  );
}
