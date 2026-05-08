'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { X, User, Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { NotificationsResponse } from '@/Interface/recruiter.types';
import { getNotifications } from '@/stores/api/recruiter-candidates-api';

type Notification = NotificationsResponse['data']['notifications'][number];

const ANIM_DURATION = 200;

interface Props {
  onClose: () => void;
}

// Map notification type/priority to a dot color
const getDotColor = (n: Notification): string => {
  const type = n.type?.toLowerCase() ?? '';
  if (type.includes('payment') || type.includes('lock') || type.includes('end'))  return 'bg-red-500';
  if (type.includes('refund') || type.includes('complete'))                        return 'bg-purple-500';
  if (type.includes('shift') || type.includes('release'))                          return 'bg-[#F4781B]';
  if (type.includes('active') || type.includes('job'))                             return 'bg-green-500';
  return 'bg-orange-900';
};

// Check if notification has a "Release Pay" action
const isReleasePay = (n: Notification): boolean =>
  n.type?.toLowerCase().includes('complete') ?? false;

// Extract jobId from payload or reference_id
const getJobId = (n: Notification): string | undefined => {
  const p = n.payload as Record<string, string> | undefined;
  return p?.jobId ?? p?.job_id ?? n.reference_id ?? undefined;
};

// Format ISO date to readable time
const formatTime = (iso: string): string => {
  try {
    return new Date(iso).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '';
  }
};

export const NotificationPanel = ({ onClose }: Props) => {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);

  const [isClosing, setIsClosing] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // ── Fetch notifications ────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async (pageNum: number, append = false) => {
    try {
      append ? setLoadingMore(true) : setIsLoading(true);
      setError(null);

      const res = await getNotifications({ page: pageNum, limit: 15 });

      if (res.success) {
        setNotifications((prev) =>
          append ? [...prev, ...res.data.notifications] : res.data.notifications
        );
        setHasNextPage(res.data.pagination.hasNextPage);
      } else {
        setError(res.message ?? 'Failed to load notifications');
      }
    } catch {
      setError('Failed to load notifications');
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(1);
  }, [fetchNotifications]);

  // ── Load more ──────────────────────────────────────────────────────────────
  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNotifications(nextPage, true);
  };

  // ── Close logic ────────────────────────────────────────────────────────────
  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => onClose(), ANIM_DURATION);
  }, [isClosing, onClose]);

  // ── Outside click ──────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [handleClose]);

  // ── Escape key ────────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [handleClose]);

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        className="fixed inset-0 z-50 bg-black/20 backdrop-blur-[1px]"
        style={{
          animation: isClosing
            ? `notif-fade-out ${ANIM_DURATION}ms ease forwards`
            : `notif-fade-in ${ANIM_DURATION}ms ease forwards`,
        }}
        aria-hidden="true"
      />

      {/* ── Panel ── */}
      <div
        ref={panelRef}
        className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[400px]
                   bg-[#fdf8f4] flex flex-col shadow-2xl border-l border-gray-200"
        style={{
          animation: isClosing
            ? `notif-slide-out ${ANIM_DURATION}ms cubic-bezier(0.4, 0, 1, 1) forwards`
            : `notif-slide-in  ${ANIM_DURATION}ms cubic-bezier(0, 0, 0.2, 1) forwards`,
        }}
      >
        <style>{`
          @keyframes notif-slide-in  { from { transform: translateX(100%); } to { transform: translateX(0); } }
          @keyframes notif-slide-out { from { transform: translateX(0); }    to { transform: translateX(100%); } }
          @keyframes notif-fade-in   { from { opacity: 0; } to { opacity: 1; } }
          @keyframes notif-fade-out  { from { opacity: 1; } to { opacity: 0; } }
        `}</style>

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-6 pb-4 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
            <p className="text-sm text-gray-400 mt-0.5">Get Notified &amp; Stay Updated</p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200/60 transition-colors text-gray-500 mt-0.5"
            aria-label="Close notifications"
          >
            <X size={16} />
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-200 mx-5 shrink-0" />

        {/* Content */}
        <div
          className="flex-1 overflow-y-auto px-4 py-4 space-y-3
                     [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {/* Loading skeleton */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-6 h-6 text-[#F4781B] animate-spin" />
              <p className="text-sm text-gray-400">Loading notifications…</p>
            </div>
          )}

          {/* Error state */}
          {!isLoading && error && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <AlertCircle className="w-8 h-8 text-red-400" />
              <p className="text-sm text-gray-500">{error}</p>
              <button
                onClick={() => fetchNotifications(1)}
                className="text-xs text-[#F4781B] hover:underline font-medium"
              >
                Try again
              </button>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !error && notifications.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <p className="text-sm font-medium text-gray-600">No notifications yet</p>
              <p className="text-xs text-gray-400">You&apos;re all caught up!</p>
            </div>
          )}

          {/* Notification list */}
          {!isLoading && !error && notifications.map((n) => (
            <div
              key={n.id}
              className={`bg-white rounded-2xl border px-4 py-3.5 flex items-center gap-3 shadow-sm transition-colors
                ${!n.is_read ? 'border-orange-100 bg-orange-50/30' : 'border-gray-100'}`}
            >
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0 overflow-hidden border-2 border-blue-200">
                <User className="w-6 h-6 text-blue-400" strokeWidth={1.5} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {n.title && (
                  <p className="text-xs font-semibold text-[#F4781B] uppercase tracking-wide mb-0.5">
                    {n.title}
                  </p>
                )}
                <p className="text-sm font-semibold text-gray-900 leading-snug">{n.body}</p>
                <p className="text-xs text-[#F4781B] font-medium mt-0.5">
                  {formatTime(n.created_at)}
                </p>
              </div>

              {/* Right: Release Pay OR unread dot */}
              <div className="flex items-center gap-2 shrink-0">
                {isReleasePay(n) && getJobId(n) && (
                  <button
                    onClick={() => {
                      router.push(`/wallet?release=${getJobId(n)}`);
                      handleClose();
                    }}
                    className="bg-[#F4781B] hover:bg-orange-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-colors whitespace-nowrap"
                  >
                    Release Pay
                  </button>
                )}
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${getDotColor(n)}`} />
              </div>
            </div>
          ))}

          {/* Load more */}
          {!isLoading && !error && hasNextPage && (
            <div className="flex justify-center pt-2 pb-4">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="flex items-center gap-2 text-sm text-[#F4781B] font-medium hover:underline disabled:opacity-50"
              >
                {loadingMore && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {loadingMore ? 'Loading…' : 'Load more'}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
