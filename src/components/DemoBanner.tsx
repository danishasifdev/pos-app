"use client";

import Link from "next/link";
import { useCallback, useSyncExternalStore } from "react";
import { X } from "lucide-react";

const DISMISS_KEY = "pos-demo-banner-dismissed";
const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getSnapshot(): boolean {
  try {
    return window.localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

const getServerSnapshot = () => false;

export function DemoBanner() {
  const dismissed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const dismiss = useCallback(() => {
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // storage unavailable; the banner simply reappears next load
    }
    listeners.forEach((listener) => listener());
  }, []);

  if (dismissed) return null;

  return (
    <div className="flex shrink-0 flex-wrap items-center justify-center gap-x-3 gap-y-1.5 border-b border-border bg-accent-soft px-4 py-2 text-center text-xs text-fg">
      <span>
        <strong className="font-semibold">Demo workspace</strong> — ring up
        sales and edit products freely, but everything goes to a temporary file
        and is erased when you reload.
      </span>
      <span className="flex items-center gap-2">
        <Link
          className="rounded-md bg-primary px-2 py-1 font-semibold text-primary-foreground transition hover:opacity-90"
          href="/register"
        >
          Create account to save
        </Link>
        <Link
          className="rounded-md border border-border px-2 py-1 font-medium text-fg transition hover:bg-surface"
          href="/login"
        >
          Sign in
        </Link>
      </span>
      <button
        aria-label="Dismiss demo notice"
        className="rounded p-1 text-muted-fg transition hover:bg-surface hover:text-fg"
        onClick={dismiss}
        type="button"
      >
        <X aria-hidden="true" size={14} />
      </button>
    </div>
  );
}