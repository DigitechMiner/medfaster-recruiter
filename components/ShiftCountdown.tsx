"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { useNow } from "@/hooks/useNow";
import {
  resolveShiftCountdown,
  type ShiftCountdownPhase,
} from "@/utils/shift-countdown";

const PHASE_CLASS: Record<ShiftCountdownPhase, string> = {
  upcoming: "text-[#F4781B]",
  active: "text-green-700",
  ended: "text-gray-400",
  unknown: "text-gray-400",
};

type ShiftCountdownProps = {
  plannedCheckInAt?: string | null;
  plannedCheckOutAt?: string | null;
  className?: string;
  /**
   * Shared clock from a parent `useNow()` — preferred in lists so one interval
   * drives every countdown. When omitted, this component ticks on its own.
   */
  nowMs?: number;
  /** Used only when `nowMs` is omitted. Default true. */
  live?: boolean;
};

export function ShiftCountdown({
  plannedCheckInAt,
  plannedCheckOutAt,
  className,
  nowMs,
  live = true,
}: ShiftCountdownProps) {
  const canResolve = Boolean(plannedCheckInAt);
  const localNow = useNow(nowMs == null && live && canResolve);
  const now = nowMs ?? localNow;
  const { phase, text } = useMemo(
    () => resolveShiftCountdown(plannedCheckInAt, plannedCheckOutAt, now),
    [plannedCheckInAt, plannedCheckOutAt, now],
  );

  if (!text) return null;

  return (
    <span
      className={cn(
        "tabular-nums font-semibold",
        PHASE_CLASS[phase],
        className,
      )}
    >
      {text}
    </span>
  );
}
