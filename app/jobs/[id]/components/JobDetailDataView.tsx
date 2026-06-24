import { formatDate, formatDateTime, formatLabel } from "./job-detail-helpers";

const EMPTY_VALUES = new Set(["", "null", "undefined"]);

export function LoadingRows({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="h-14 rounded-xl bg-gray-100 animate-pulse" />
      ))}
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 py-12 px-6 text-center">
      <p className="text-sm font-semibold text-gray-700 mb-1">{title}</p>
      {description && (
        <p className="text-xs text-gray-400 max-w-sm leading-relaxed">{description}</p>
      )}
    </div>
  );
}

export function StatusBadge({ value }: { value?: string | null }) {
  return (
    <span className="inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-[#F4781B]">
      {formatLabel(value)}
    </span>
  );
}

export function formatFieldLabel(key: string) {
  return formatLabel(key);
}

export function formatFieldValue(key: string, value: unknown) {
  if (value === null || value === undefined || EMPTY_VALUES.has(String(value))) return "N/A";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return formatMaybeCurrency(key, value);
  if (typeof value !== "string") return String(value);

  if (key.endsWith("_at")) return formatDateTime(value);
  if (key.includes("date")) return formatDate(value);
  if (key.includes("cents")) return formatMaybeCurrency(key, value);
  if (key.includes("status")) return formatLabel(value);

  return value.includes("_") ? formatLabel(value) : value;
}

function formatMaybeCurrency(key: string, value: string | number) {
  if (!key.includes("cents")) return String(value);
  return `$${(Number(value) / 100).toFixed(2)}`;
}
