"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

/**
 * A right-hand panel the user can drag wider or narrower.
 *
 * The width the user settles on is remembered per browser. Two things clamp
 * what is actually drawn: the hard min/max, and how much room is left over
 * once the terminal has its share. The room clamp is deliberately *not*
 * persisted -- opening the app on a phone must not overwrite a desktop
 * preference. Below the md breakpoint the panel is a stacked block rather
 * than a side panel, so the handle and the stored width are ignored there.
 */
const KEY = "pos-cart-width";
const MIN_WIDTH = 280;
const MAX_WIDTH = 640;
const DEFAULT_WIDTH = 384;
const STEP = 16;
// keep at least this much room for the terminal when drawing
const MIN_TERMINAL = 320;

const listeners = new Set<() => void>();
let cached: number | null = null;

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

function clamp(value: number): number {
  return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, Math.round(value)));
}

function getSnapshot(): number {
  if (cached === null) {
    const stored = Number(
      typeof window === "undefined"
        ? NaN
        : window.localStorage.getItem(KEY),
    );
    cached = Number.isFinite(stored) && stored > 0 ? clamp(stored) : DEFAULT_WIDTH;
  }
  return cached;
}

const getServerSnapshot = () => DEFAULT_WIDTH;

function writeStored(next: number) {
  cached = clamp(next);
  try {
    window.localStorage.setItem(KEY, String(cached));
  } catch {
    // storage unavailable; still applies for this page view
  }
  listeners.forEach((listener) => listener());
}

export function ResizablePanel({ children }: { children: React.ReactNode }) {
  const preferred = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const panelRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const [room, setRoom] = useState(MAX_WIDTH);
  // read at event time so repeated input in one tick is never stale
  const roomRef = useRef(MAX_WIDTH);

  // Measured from the parent row rather than the window, so the sidebar's
  // own width is accounted for without this knowing about it.
  useEffect(() => {
    const parent = panelRef.current?.parentElement;
    if (!parent) return;
    const measure = () => {
      const next = Math.max(MIN_WIDTH, parent.clientWidth - MIN_TERMINAL);
      roomRef.current = next;
      setRoom(next);
    };
    // ResizeObserver delivers an initial callback, so there is no need to
    // measure synchronously inside the effect.
    const observer = new ResizeObserver(measure);
    observer.observe(parent);
    return () => observer.disconnect();
  }, []);

  const width = Math.min(preferred, room);

  const setWidth = useCallback((next: number) => {
    writeStored(Math.min(next, Math.max(MIN_WIDTH, roomRef.current)));
  }, []);

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      event.currentTarget.setPointerCapture(event.pointerId);
      draggingRef.current = true;
      document.body.style.userSelect = "none";
      document.body.style.cursor = "col-resize";
    },
    [],
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (!draggingRef.current) return;
      const parentWidth = panelRef.current?.parentElement?.clientWidth ?? 0;
      setWidth(parentWidth - event.clientX);
    },
    [setWidth],
  );

  const endDrag = useCallback((event: React.PointerEvent<HTMLButtonElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    document.body.style.userSelect = "";
    document.body.style.cursor = "";
  }, []);

  // arrow keys nudge the panel; the separator is focusable for the same reason.
  // Reads live values rather than closing over them, so repeated presses in one
  // tick each apply instead of all reading the same stale value.
  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      const step = event.shiftKey ? STEP * 4 : STEP;
      const current = Math.min(getSnapshot(), roomRef.current);
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setWidth(current + step);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        setWidth(current - step);
      } else if (event.key === "Home") {
        event.preventDefault();
        setWidth(MAX_WIDTH);
      } else if (event.key === "End") {
        event.preventDefault();
        setWidth(MIN_WIDTH);
      }
    },
    [setWidth],
  );

  return (
    <div
      className="cart-panel h-[45vh] w-full shrink-0 md:h-auto"
      ref={panelRef}
      style={{ "--cart-width": `${width}px` } as React.CSSProperties}
    >
      <button
        aria-label="Resize order panel"
        aria-orientation="vertical"
        aria-valuemax={MAX_WIDTH}
        aria-valuemin={MIN_WIDTH}
        aria-valuenow={width}
        className="group absolute inset-y-0 -left-1 z-10 hidden w-2 cursor-col-resize items-center justify-center md:flex"
        onKeyDown={onKeyDown}
        onPointerCancel={endDrag}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        role="separator"
        tabIndex={0}
        type="button"
      >
        <span
          aria-hidden="true"
          className="h-10 w-1 rounded-full bg-border transition-colors group-hover:bg-primary group-focus-visible:bg-primary"
        />
      </button>
      {children}
    </div>
  );
}