'use client';

import { useEffect } from 'react';
import { LocateFixed, X } from 'lucide-react';
import type { MetadataOption } from '@/features/common';

const KM_PRESETS = [5, 10, 25, 50, 100] as const;

type CandidatesPoolFiltersModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobTitlesMeta: MetadataOption[];
  metadataLoading: boolean;
  selectedRoleSlug: string;
  onSelectedRoleSlugChange: (slug: string) => void;
  coords: { lat: number; lng: number } | null;
  radiusKm: number;
  onRadiusKmChange: (km: number) => void;
  customKm: string;
  onCustomKmChange: (value: string) => void;
  geoHint: string | null;
  kmValidationHint: string | null;
  locating: boolean;
  onRequestLocation: () => void;
  onClearFilters: () => void;
};

export function CandidatesPoolFiltersModal({
  open,
  onOpenChange,
  jobTitlesMeta,
  metadataLoading,
  selectedRoleSlug,
  onSelectedRoleSlugChange,
  coords,
  radiusKm,
  onRadiusKmChange,
  customKm,
  onCustomKmChange,
  geoHint,
  kmValidationHint,
  locating,
  onRequestLocation,
  onClearFilters,
}: CandidatesPoolFiltersModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      role="presentation"
      onClick={() => onOpenChange(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pool-filters-title"
        className="w-full max-w-3xl max-h-[min(90vh,720px)] overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-gray-100 bg-white px-4 py-3">
          <p id="pool-filters-title" className="text-sm font-semibold text-gray-900">
            Filters
          </p>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            aria-label="Close filters"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-4 flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-[11px] text-gray-600">
              <span className="font-medium">Job title</span>
              <select
                value={selectedRoleSlug}
                onChange={(e) => onSelectedRoleSlugChange(e.target.value)}
                disabled={metadataLoading && jobTitlesMeta.length === 0}
                className="rounded-lg border border-gray-200 bg-white px-2 py-2 text-xs text-gray-800 outline-none focus:border-[#F4781B] disabled:opacity-60"
              >
                <option value="">All job titles</option>
                {jobTitlesMeta.map((t) => (
                  <option key={t.uuid} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex flex-col gap-2 text-[11px] text-gray-600">
              <span className="font-medium">Location & radius</span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={onRequestLocation}
                  disabled={locating}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-60"
                >
                  <LocateFixed size={14} className="text-[#F4781B]" />
                  {locating ? 'Locating…' : 'Use live location'}
                </button>
                {coords && (
                  <span className="text-[10px] text-gray-500 font-mono">
                    {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-[10px] uppercase tracking-wide text-gray-400 shrink-0">km</span>
                {KM_PRESETS.map((km) => (
                  <button
                    key={km}
                    type="button"
                    onClick={() => {
                      onRadiusKmChange(km);
                      onCustomKmChange('');
                    }}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold border transition-colors ${
                      radiusKm === km && !customKm.trim()
                        ? 'border-[#F4781B] bg-orange-50 text-[#F4781B]'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {km}
                  </button>
                ))}
              </div>
              <label className="flex flex-col gap-0.5">
                <span className="text-[10px] text-gray-500">Custom radius (km)</span>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="e.g. 100"
                  value={customKm}
                  onChange={(e) => onCustomKmChange(e.target.value)}
                  className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-[#F4781B] max-w-[140px]"
                />
              </label>
              {!coords && (
                <p className="text-[10px] text-gray-500">
                  Tap “Use live location” to send latitude/longitude. Distance filters apply once location and km are set.
                </p>
              )}
            </div>
          </div>

          {(geoHint || kmValidationHint) && (
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              {kmValidationHint ?? geoHint}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-end gap-2 pt-1 border-t border-gray-100">
            <button
              type="button"
              onClick={onClearFilters}
              className="text-xs font-medium text-[#F4781B] hover:underline px-2 py-2"
            >
              Clear filters
            </button>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-xl bg-[#F4781B] hover:bg-[#e06a10] text-white text-xs font-semibold px-4 py-2.5"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
