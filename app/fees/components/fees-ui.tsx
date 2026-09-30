"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { LucideIcon } from "lucide-react";
import { AlertCircle, BadgeDollarSign, Info, Search } from "lucide-react";

export function JobTitleInfoButton({
  label,
  hasCustomRates = false,
}: {
  label: string;
  hasCustomRates?: boolean;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverId = useId();
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  function updatePosition() {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    const width = 240;
    const estimatedHeight = hasCustomRates ? 96 : 72;
    const left = Math.min(
      Math.max(12, rect.left + rect.width / 2 - width / 2),
      window.innerWidth - width - 12,
    );
    const below = rect.bottom + 8;
    const top =
      below + estimatedHeight > window.innerHeight
        ? Math.max(12, rect.top - estimatedHeight - 8)
        : below;
    setPosition({ top, left });
  }

  function toggle() {
    updatePosition();
    setOpen((current) => !current);
  }

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    function onReposition() {
      updatePosition();
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open, hasCustomRates]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={`Full job title: ${label}`}
        aria-expanded={open}
        aria-controls={popoverId}
        onClick={toggle}
        className="inline-flex size-5 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-orange-50 hover:text-[#F4781B]"
      >
        <Info className="size-3.5" aria-hidden />
      </button>
      {open &&
        createPortal(
          <>
            <button
              type="button"
              aria-label="Close job title details"
              className="fixed inset-0 z-[80] cursor-default"
              onClick={() => setOpen(false)}
            />
            <div
              id={popoverId}
              role="dialog"
              style={{ top: position.top, left: position.left, width: 240 }}
              className="fixed z-[81] rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-left shadow-lg"
            >
              <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                Job title
              </p>
              <p className="mt-1 text-sm font-semibold text-gray-900">{label}</p>
              {hasCustomRates && (
                <p className="mt-1.5 text-xs font-medium text-emerald-700">Custom rates</p>
              )}
            </div>
          </>,
          document.body,
        )}
    </>
  );
}

export function ConfiguredBadge({ configured }: { configured: boolean }) {
  return (
    <span
      className={
        configured
          ? "inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-100"
          : "inline-flex items-center gap-1 rounded-full bg-gray-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500 ring-1 ring-gray-100"
      }
    >
      <span
        className={`size-1.5 rounded-full ${configured ? "bg-emerald-500" : "bg-gray-300"}`}
        aria-hidden
      />
      {configured ? "Configured" : "Not set"}
    </span>
  );
}

export function FeesLoadingState() {
  return (
    <div className="p-4 sm:p-5">
      <div className="overflow-hidden rounded-xl border border-gray-200">
        <div className="flex border-b border-gray-100 bg-gray-50">
          <div className="h-12 w-36 shrink-0" />
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex h-12 min-w-24 flex-1 items-center justify-center">
              <div className="h-4 w-10 animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </div>
        {Array.from({ length: 6 }).map((_, row) => (
          <div key={row} className="flex border-b border-gray-50 last:border-0">
            <div className="flex h-12 w-36 shrink-0 items-center px-4">
              <div className="h-4 w-20 animate-pulse rounded bg-gray-100" />
            </div>
            {Array.from({ length: 4 }).map((_, column) => (
              <div key={column} className="flex h-12 min-w-24 flex-1 items-center justify-center">
                <div className="h-4 w-12 animate-pulse rounded bg-gray-100" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function FeesErrorState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[320px] items-center justify-center px-6 py-10">
      <div className="flex max-w-md flex-col items-center text-center">
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-red-50 text-red-500 ring-1 ring-red-100">
          <AlertCircle className="size-6" aria-hidden />
        </div>
        <p className="text-base font-semibold text-gray-900">Failed to load fee rates</p>
        <p className="mt-2 text-sm text-gray-500">{message}</p>
      </div>
    </div>
  );
}

export function FeesEmptyState({
  icon: Icon = BadgeDollarSign,
  title,
  description,
}: {
  icon?: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[320px] items-center justify-center px-6 py-10">
      <div className="flex max-w-sm flex-col items-center text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-orange-50 text-[#F4781B] ring-1 ring-orange-100">
          <Icon className="size-7" aria-hidden />
        </div>
        <p className="text-base font-semibold text-gray-900">{title}</p>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">{description}</p>
      </div>
    </div>
  );
}

export function FeesSearchInput({
  value,
  onChange,
  placeholder = "Search job titles...",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative w-full sm:w-72">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400"
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#F4781B] focus:outline-none focus:ring-2 focus:ring-[#F4781B]/20"
      />
    </div>
  );
}

export function FeesTabPanelHeader({
  icon: Icon,
  title,
  description,
  countLabel,
  endSlot,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  countLabel?: string;
  endSlot?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-gray-100 bg-gradient-to-r from-[#FFFAF5] to-white px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#F4781B] shadow-sm ring-1 ring-orange-100">
          <Icon className="size-5" aria-hidden />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-gray-900">{title}</p>
            {countLabel && (
              <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-gray-500 ring-1 ring-gray-200">
                {countLabel}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
      </div>
      {endSlot}
    </div>
  );
}
