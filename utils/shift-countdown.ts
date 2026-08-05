export type ShiftCountdownPhase = "upcoming" | "active" | "ended" | "unknown";

export type ShiftCountdownResult = {
  phase: ShiftCountdownPhase;
  /** Live label such as "Starts in 2h 34m 30s", or null when unknown. */
  text: string | null;
};

function parseInstantMs(value?: string | null): number | null {
  if (!value) return null;
  const ms = new Date(value).getTime();
  return Number.isFinite(ms) ? ms : null;
}

/** Formats a positive duration as `1d 2h 34m 30s` (omits leading zero units). */
export function formatCountdownDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (days > 0 || hours > 0) parts.push(`${hours}h`);
  parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);
  return parts.join(" ");
}

/**
 * Countdown against absolute UTC ISO fields (`planned_check_in_at` / `planned_check_out_at`).
 * Safe to call every second from a ticking hook.
 */
export function resolveShiftCountdown(
  plannedCheckInAt?: string | null,
  plannedCheckOutAt?: string | null,
  nowMs: number = Date.now(),
): ShiftCountdownResult {
  const checkInMs = parseInstantMs(plannedCheckInAt);
  const checkOutMs = parseInstantMs(plannedCheckOutAt);

  if (checkInMs == null) {
    return { phase: "unknown", text: null };
  }

  if (nowMs < checkInMs) {
    return {
      phase: "upcoming",
      text: `Starts in ${formatCountdownDuration(checkInMs - nowMs)}`,
    };
  }

  if (checkOutMs != null && nowMs < checkOutMs) {
    return {
      phase: "active",
      text: `Ends in ${formatCountdownDuration(checkOutMs - nowMs)}`,
    };
  }

  if (checkOutMs != null && nowMs >= checkOutMs) {
    return { phase: "ended", text: "Ended" };
  }

  return { phase: "active", text: "In progress" };
}
