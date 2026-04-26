'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { X, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

type DotColor = 'red' | 'purple' | 'orange' | 'green' | 'brown';

interface NotificationItem {
  id:          string;
  message:     string;
  time:        string;
  dot:         DotColor;
  releasePay?: boolean;
  jobId?:      string;
}

const DOT_CLASS: Record<DotColor, string> = {
  red:    'bg-red-500',
  purple: 'bg-purple-500',
  orange: 'bg-[#F4781B]',
  green:  'bg-green-500',
  brown:  'bg-orange-900',
};

const MOCK: NotificationItem[] = [
  { id: '1', dot: 'red',    message: '$ 12,000 locked for job #KRV-123.',           time: '9:01 am' },
  { id: '2', dot: 'purple', message: 'You Received a Refund of $780.5 from Justin', time: '9:01 am' },
  { id: '3', dot: 'orange', message: 'Justin just completed a shift.',              time: '9:01 am', releasePay: true,  jobId: 'KRV-123' },
  { id: '4', dot: 'green',  message: '#KRV-123 job is active now',                  time: '9:01 am' },
  { id: '5', dot: 'brown',  message: '3 Jobs are upcoming tomorrow',                time: '9:01 am' },
  { id: '6', dot: 'brown',  message: '2 shifts are activating in 03:12:30 hrs',     time: '9:01 am' },
  { id: '7', dot: 'red',    message: '#KRV-456 active shift have been ended',       time: '9:01 am' },
  { id: '8', dot: 'orange', message: 'Emma just completed a Job.',                  time: '9:01 am', releasePay: true, jobId: 'KRV-456' },
  { id: '9', dot: 'brown',  message: '13 Jobs are scheduled this week',             time: '9:01 am' },
];

const ANIM_DURATION = 200; // ms — must match CSS duration below

interface Props {
  onClose: () => void;
}

export const NotificationPanel = ({ onClose }: Props) => {
  const router     = useRouter();
  const panelRef   = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = useState(false);

  /* Trigger slide-out, then unmount */
  const handleClose = useCallback(() => {
  if (isClosing) return;
  setIsClosing(true);
  setTimeout(() => onClose(), ANIM_DURATION);
}, [isClosing, onClose]);

  /* Outside click */
  useEffect(() => {
  const handler = (e: MouseEvent) => {
    if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
      handleClose();
    }
  };
  document.addEventListener('mousedown', handler);
  return () => document.removeEventListener('mousedown', handler);
}, [handleClose]);

useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') handleClose();
  };
  document.addEventListener('keydown', handler);
  return () => document.removeEventListener('keydown', handler);
}, [handleClose]);

  return (
    <>
      {/* ── Backdrop — fades out in sync ── */}
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
        {/* ── Keyframes injected once ── */}
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

        {/* Scrollable list */}
        <div
          className="flex-1 overflow-y-auto px-4 py-4 space-y-3
                     [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {MOCK.map((n) => (
            <div
              key={n.id}
              className="bg-white rounded-2xl border border-gray-100 px-4 py-3.5 flex items-center gap-3 shadow-sm"
            >
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0 overflow-hidden border-2 border-blue-200">
                <User className="w-6 h-6 text-blue-400" strokeWidth={1.5} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 leading-snug">{n.message}</p>
                <p className="text-xs text-[#F4781B] font-medium mt-0.5">{n.time}</p>
              </div>

              {/* Right: Release Pay OR dot */}
              <div className="flex items-center gap-2 shrink-0">
                {n.releasePay && (
                  <button
                    onClick={() => { router.push(`/wallet?release=${n.jobId}`); handleClose(); }}
                    className="bg-[#F4781B] hover:bg-orange-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-colors whitespace-nowrap"
                  >
                    Release Pay
                  </button>
                )}
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${DOT_CLASS[n.dot]}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};