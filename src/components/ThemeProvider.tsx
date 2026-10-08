"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import { ThemeName } from "@/lib/types";
import { DEFAULT_THEME, THEME_STORAGE_KEY, THEMES } from "@/lib/themes";

type ThemeContextValue = {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: DEFAULT_THEME,
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

/* localStorage is an external system, so it is read through
   useSyncExternalStore rather than a setState-in-effect cascade. */
const listeners = new Set<() => void>();
let cached: string | null = null;
let hasRead = false;

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getSnapshot(): ThemeName | null {
  if (!hasRead) {
    hasRead = true;
    try {
      cached = window.localStorage.getItem(THEME_STORAGE_KEY);
    } catch {
      cached = null;
    }
  }
  return THEMES.some((t) => t.id === cached) ? (cached as ThemeName) : null;
}

const getServerSnapshot = () => null;

function writeStored(next: ThemeName) {
  cached = next;
  hasRead = true;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    // private mode or storage disabled; the in-memory value still applies
  }
  listeners.forEach((listener) => listener());
}

export function ThemeProvider({
  initialTheme,
  syncToAccount = true,
  children,
}: {
  initialTheme: ThemeName;
  /**
   * Whether to also write the choice to the server. It only helps for a real
   * account: an administrator has no settings row (/api/settings 401s) and a
   * signed-out visitor's scratch settings are wiped on reload. Both are served
   * correctly by localStorage alone, so skip the request entirely rather than
   * firing one that cannot succeed.
   */
  syncToAccount?: boolean;
  children: React.ReactNode;
}) {
  const stored = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const theme = stored ?? initialTheme;

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const setTheme = useCallback(
    (next: ThemeName) => {
      writeStored(next);
      document.documentElement.setAttribute("data-theme", next);
      if (!syncToAccount) return;
      // best effort sync back to the store settings so the server-rendered
      // default matches next time, ignored if the request fails
      fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: next }),
      }).catch(() => {});
    },
    [syncToAccount],
  );

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}