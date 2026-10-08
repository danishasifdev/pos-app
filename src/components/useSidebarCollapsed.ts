"use client";

import { useCallback, useSyncExternalStore } from "react";

const KEY = "pos-sidebar-collapsed";
const listeners = new Set<() => void>();
let cached: boolean | null = null;

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

function getSnapshot(): boolean {
  if (cached === null) {
    try {
      cached = window.localStorage.getItem(KEY) === "1";
    } catch {
      cached = false;
    }
  }
  return cached;
}

const getServerSnapshot = () => false;

/**
 * Collapsed state for the app sidebar, remembered per browser. Read through
 * useSyncExternalStore rather than a setState-in-effect cascade (same shape as
 * ThemeProvider), so the first paint already matches what was stored.
 */
export function useSidebarCollapsed(): readonly [boolean, () => void] {
  const collapsed = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const toggle = useCallback(() => {
    cached = !getSnapshot();
    try {
      window.localStorage.setItem(KEY, cached ? "1" : "0");
    } catch {
      // storage unavailable; still applies for this page view
    }
    listeners.forEach((listener) => listener());
  }, []);

  return [collapsed, toggle] as const;
}
