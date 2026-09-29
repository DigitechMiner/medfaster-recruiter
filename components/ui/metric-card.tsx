import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export function MetricCard({
  icon,
  title,
  value,
  subLabel,
  loading = false,
  className,
  valueClassName,
}: {
  icon: ReactNode;
  title: string;
  value: string | number;
  subLabel?: ReactNode;
  loading?: boolean;
  className?: string;
  /** Merged with default value typography (e.g. `text-red-500` for alerts). */
  valueClassName?: string;
}) {
  return (
    <div
      aria-busy={loading}
      className={cn(
        'bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex flex-col gap-2',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 font-medium">{title}</span>
        <span className="text-orange-400">{icon}</span>
      </div>
      {loading ? (
        <div className="flex flex-col gap-2" aria-hidden>
          <div className="h-8 w-24 max-w-full rounded-md bg-gray-200 animate-pulse" />
          <div className="h-3 w-16 max-w-full rounded bg-gray-100 animate-pulse" />
        </div>
      ) : (
        <>
          <p
            className={cn('text-2xl font-bold text-gray-900', valueClassName)}
          >
            {value}
          </p>
          {subLabel && <p className="text-xs text-gray-400">{subLabel}</p>}
        </>
      )}
    </div>
  );
}
