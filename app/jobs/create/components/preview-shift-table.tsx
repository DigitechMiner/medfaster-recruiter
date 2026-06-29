"use client";

import { Moon, Sun, Sunset } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ShiftPreviewRow } from "../normal/map-preview-response";

type PreviewShiftTableProps = {
  rows: ShiftPreviewRow[];
  showTeam?: boolean;
  showPay?: boolean;
  formatCurrency: (cents: number) => string;
};

const SHIFT_STYLES: Record<
  string,
  { text: string; bg: string; icon: typeof Sun }
> = {
  MORNING: {
    text: "text-amber-700",
    bg: "bg-amber-50",
    icon: Sun,
  },
  EVENING: {
    text: "text-orange-700",
    bg: "bg-orange-50",
    icon: Sunset,
  },
  NIGHT: {
    text: "text-indigo-700",
    bg: "bg-indigo-50",
    icon: Moon,
  },
  DAY: {
    text: "text-sky-700",
    bg: "bg-sky-50",
    icon: Sun,
  },
};

const TEAM_BADGE_STYLES = [
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
  "bg-sky-100 text-sky-700",
  "bg-amber-100 text-amber-700",
];

function resolveShiftStyle(shiftType: string) {
  return SHIFT_STYLES[shiftType.toUpperCase()] ?? SHIFT_STYLES.DAY;
}

function resolveTeamBadgeClass(team: string): string {
  const index =
    Math.abs(team.charCodeAt(team.length - 1) ?? 0) % TEAM_BADGE_STYLES.length;
  return TEAM_BADGE_STYLES[index];
}

function resolveCycleLabel(rotationDay: string): string | null {
  const parts = rotationDay.split("·").map((part) => part.trim());
  return parts.length > 1 ? parts[parts.length - 1] : null;
}

function formatScheduleLabel(row: ShiftPreviewRow): string {
  const sameDay = row.startDateLabel === row.endDateLabel;

  if (sameDay) {
    return `${row.startDateLabel} · ${row.startTimeLabel} – ${row.endTimeLabel}`;
  }

  return `${row.startDateLabel} ${row.startTimeLabel} – ${row.endDateLabel} ${row.endTimeLabel}`;
}

function formatBreakLabel(row: ShiftPreviewRow): string {
  if (row.breakMinutes == null || row.breakMinutes <= 0) {
    return "-";
  }
  return `${row.breakMinutes}m`;
}

export function PreviewShiftTable({
  rows,
  showTeam = true,
  showPay = false,
  formatCurrency,
}: PreviewShiftTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-left text-xs font-medium text-gray-500">
            <th className="px-4 py-2.5">Shift</th>
            {showTeam ? <th className="px-4 py-2.5">Team</th> : null}
            <th className="px-4 py-2.5">Schedule</th>
            <th className="px-4 py-2.5">Duration</th>
            <th className="px-4 py-2.5">Break</th>
            <th className="px-4 py-2.5">Payable Time</th>
            {showPay ? <th className="px-4 py-2.5 text-right">Cost</th> : null}
            <th className="px-4 py-2.5 text-right">Workers</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row) => {
            const style = resolveShiftStyle(row.shiftType);
            const Icon = style.icon;
            const cycleLabel = resolveCycleLabel(row.rotationDay);

            return (
              <tr
                key={row.id}
                className="bg-white transition-colors hover:bg-gray-50/80"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                        style.bg,
                        style.text,
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className={cn("font-medium leading-tight", style.text)}>
                        {row.shiftLabel}
                      </p>
                      {cycleLabel ? (
                        <p className="text-xs text-gray-400">{cycleLabel}</p>
                      ) : null}
                    </div>
                  </div>
                </td>

                {showTeam ? (
                  <td className="px-4 py-3">
                    <span
                      title={row.team}
                      className={cn(
                        "inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
                        resolveTeamBadgeClass(row.team),
                      )}
                    >
                      {row.teamInitial}
                    </span>
                  </td>
                ) : null}

                <td className="px-4 py-3 text-gray-700">
                  <span className="tabular-nums">{formatScheduleLabel(row)}</span>
                </td>

                <td className="px-4 py-3 tabular-nums text-gray-700">
                  {row.grossDurationLabel}
                </td>

                <td className="px-4 py-3 tabular-nums text-gray-500">
                  {formatBreakLabel(row)}
                </td>

                <td className="px-4 py-3 tabular-nums font-medium text-emerald-700">
                  {row.payableLabel}
                </td>

                {showPay ? (
                  <td className="px-4 py-3 text-right">
                    {row.payTotalCents != null ? (
                      <span className="font-semibold tabular-nums text-[#F4781B]">
                        {formatCurrency(row.payTotalCents)}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                ) : null}

                <td className="px-4 py-3 text-right tabular-nums text-gray-700">
                  {row.workers}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
