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
        <div
          className="h-8 w-20 max-w-full rounded-md bg-gray-200 animate-pulse"
          aria-hidden
        />
      ) : (
        <p
          className={cn('text-2xl font-bold text-gray-900', valueClassName)}
        >
          {value}
        </p>
      )}
      {subLabel && <p className="text-xs text-gray-400">{subLabel}</p>}
    </div>
  );
}
