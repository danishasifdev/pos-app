"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { ThemeName } from "@/lib/types";
import { DEFAULT_THEME, THEME_STORAGE_KEY } from "@/lib/themes";

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

export function ThemeProvider({
  initialTheme,
  children,
}: {
  initialTheme: ThemeName;
  children: React.ReactNode;
}) {
  const [theme, setThemeState] = useState<ThemeName>(initialTheme);

  useEffect(() => {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY) as ThemeName | null;
    if (stored) setThemeState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  function setTheme(next: ThemeName) {
    setThemeState(next);
    window.localStorage.setItem(THEME_STORAGE_KEY, next);
    // best effort sync back to the store settings so the server-rendered
    // default matches next time, ignored if the request fails
    fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme: next }),
    }).catch(() => {});
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
  );
}
