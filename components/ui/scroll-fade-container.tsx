"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type UIEvent,
} from "react";
import { cn } from "@/lib/utils";

type ScrollFadeContainerProps = {
  children: ReactNode;
  /** Applied to the scrolling element (include max-h here). */
  className?: string;
  /** Optional padding / content styles inside the scroll area. */
  contentClassName?: string;
  /** Stretch to dialog edges (cancels dialog horizontal padding). */
  edgeBleed?: boolean;
  /** Re-check overflow when this value changes (e.g. dialog open / content load). */
  watchKey?: string | number | boolean;
};

export function ScrollFadeContainer({
  children,
  className,
  contentClassName,
  edgeBleed = false,
  watchKey,
}: ScrollFadeContainerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [showBottomFade, setShowBottomFade] = useState(false);

  const updateFade = useCallback(() => {
    const el = ref.current;
    if (!el) {
      setShowBottomFade(false);
      return;
    }

    const canScroll = el.scrollHeight > el.clientHeight + 1;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 4;
    setShowBottomFade(canScroll && !atBottom);
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => updateFade());

    const el = ref.current;
    if (!el) {
      cancelAnimationFrame(frame);
      return;
    }

    const resizeObserver = new ResizeObserver(() => updateFade());
    resizeObserver.observe(el);

    const mutationObserver = new MutationObserver(() => updateFade());
    mutationObserver.observe(el, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [updateFade, watchKey]);

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    const el = event.currentTarget;
    const canScroll = el.scrollHeight > el.clientHeight + 1;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 4;
    setShowBottomFade(canScroll && !atBottom);
  };

  return (
    <div
      className={cn(
        "relative min-h-0",
        edgeBleed && "-mx-6",
      )}
    >
      <div
        ref={ref}
        onScroll={handleScroll}
        className={cn(
          "overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          edgeBleed && "px-6 pb-6",
          className,
          contentClassName,
        )}
      >
        {children}
      </div>

      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 z-10 h-14 bg-gradient-to-t from-white from-30% via-white/90 to-transparent transition-opacity duration-200",
          showBottomFade ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
}
